#!/usr/bin/env bash
# 말하기 채점용 음성 인식 키 설정: 키를 화면에 보이지 않고 .env에 넣은 뒤, 연결을 시험하고 서버를 다시 시작한다
# 아이패드·아이폰의 Chrome처럼 브라우저 음성 인식이 없는 기기에서 발음 점수를 받으려면 필요하다
# 사용법: sudo bash deploy/set-stt.sh
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "sudo로 실행해 주세요."; exit 1; }
APP=/opt/sprout-english; ENV_FILE="$APP/server/.env"
[[ -f "$ENV_FILE" ]] || { echo "$ENV_FILE 이 없어요. 먼저 install-pi.sh를 실행해 주세요."; exit 1; }

read -rsp "Google API 키 (입력해도 화면에 안 보여요): " KEY; echo
KEY="${KEY//[^A-Za-z0-9_-]/}"
[[ -n "$KEY" ]] || { echo "키가 비어 있어요. 다시 실행해 주세요."; exit 1; }

STT_KEY="$KEY" ENV_FILE="$ENV_FILE" node -e '
const fs = require("fs"), f = process.env.ENV_FILE;
const lines = fs.readFileSync(f, "utf8").split("\n");
for (const [k, v] of [["GOOGLE_STT_API_KEY", process.env.STT_KEY], ["STT_PROVIDER", "google"]]) {
  const i = lines.findIndex(l => l.startsWith(k + "="));
  if (i >= 0) lines[i] = k + "=" + v; else lines.push(k + "=" + v);
}
fs.writeFileSync(f + ".new", lines.join("\n"), { mode: 0o600 });
fs.renameSync(f + ".new", f);
'
unset KEY
chown sprout:sprout "$ENV_FILE"; chmod 600 "$ENV_FILE"

echo "▶ 음성 인식 연결 시험"
if ! sudo -u sprout -H bash -c 'cd "$1/server" && NODE_ENV=production node scripts/test-stt.js' _ "$APP"; then
  echo "Google Cloud에서 Cloud Speech-to-Text API를 켰는지, 키가 맞는지 확인한 뒤 다시 실행해 주세요. 서버는 다시 시작하지 않았어요."
  exit 1
fi

echo "▶ 서버 다시 시작"
systemctl restart sprout-english
sleep 3
curl -fsS http://127.0.0.1:8080/api/health >/dev/null && echo "서버 정상. 이제 아이패드 Chrome에서 로그인하면 말하기 점수를 받을 수 있어요."
