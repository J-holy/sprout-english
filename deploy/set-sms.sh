#!/usr/bin/env bash
# 휴대폰 인증 설정(SOLAPI): 비밀 키를 화면에 보이지 않고 .env에 넣은 뒤, 시험 발송을 하고 서버를 다시 시작한다
# 사용법: sudo bash deploy/set-sms.sh   (채널 ID와 템플릿 ID를 비우면 문자로만 보내요)
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "sudo로 실행해 주세요."; exit 1; }
APP=/opt/sprout-english; ENV_FILE="$APP/server/.env"
[[ -f "$ENV_FILE" ]] || { echo "$ENV_FILE 이 없어요. 먼저 install-pi.sh를 실행해 주세요."; exit 1; }

read -rp "SOLAPI API Key: " API_KEY
read -rsp "SOLAPI API Secret (입력해도 화면에 안 보여요): " API_SECRET; echo
read -rp "등록한 발신번호: " FROM
read -rp "카카오 채널 ID (pfId, 문자만 쓰면 Enter): " PF_ID
read -rp "알림톡 템플릿 ID (문자만 쓰면 Enter): " TEMPLATE_ID
read -rp "시험 발송을 받을 휴대폰 번호: " TO
FROM="${FROM//[^0-9]/}"; TO="${TO//[^0-9]/}"
[[ -n "$API_KEY" && -n "$API_SECRET" && -n "$FROM" && -n "$TO" ]] || { echo "빈칸이 있어요. 처음부터 다시 실행해 주세요."; exit 1; }

SOLAPI_API_KEY="$API_KEY" SOLAPI_API_SECRET="$API_SECRET" SOLAPI_FROM="$FROM" SOLAPI_PF_ID="$PF_ID" SOLAPI_TEMPLATE_ID="$TEMPLATE_ID" ENV_FILE="$ENV_FILE" node -e '
const fs = require("fs"), f = process.env.ENV_FILE;
const lines = fs.readFileSync(f, "utf8").split("\n");
for (const k of ["SOLAPI_API_KEY", "SOLAPI_API_SECRET", "SOLAPI_FROM", "SOLAPI_PF_ID", "SOLAPI_TEMPLATE_ID"]) {
  const i = lines.findIndex(l => l.startsWith(k + "="));
  if (i >= 0) lines[i] = k + "=" + process.env[k]; else lines.push(k + "=" + process.env[k]);
}
fs.writeFileSync(f + ".new", lines.join("\n"), { mode: 0o600 });
fs.renameSync(f + ".new", f);
'
unset API_SECRET
chown sprout:sprout "$ENV_FILE"; chmod 600 "$ENV_FILE"

echo "▶ 시험 발송"
if ! sudo -u sprout -H bash -c 'cd "$1/server" && NODE_ENV=production node scripts/test-sms.js "$2"' _ "$APP" "$TO"; then
  echo "키, 발신번호, 채널·템플릿 ID를 확인한 뒤 다시 실행해 주세요. 서버는 다시 시작하지 않았어요."
  exit 1
fi

echo "▶ 서버 다시 시작"
systemctl restart sprout-english
sleep 3
curl -fsS http://127.0.0.1:8080/api/health >/dev/null && echo "서버 정상. 시험 메시지가 왔는지 확인해 주세요."
