#!/usr/bin/env bash
# 인증코드 메일 설정: 비밀번호를 화면에 보이지 않고 .env에 넣은 뒤, 시험 메일을 보내고 서버를 다시 시작한다
# 사용법: sudo bash deploy/set-mail.sh   (메일 서비스를 바꿀 때도 다시 실행하면 돼요)
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "sudo로 실행해 주세요."; exit 1; }
APP=/opt/sprout-english; ENV_FILE="$APP/server/.env"
[[ -f "$ENV_FILE" ]] || { echo "$ENV_FILE 이 없어요. 먼저 install-pi.sh를 실행해 주세요."; exit 1; }

echo "메일 서비스를 골라 주세요."
echo "  1) Gmail   2) 네이버   3) 직접 입력"
read -rp "번호: " KIND
case "$KIND" in
  1) HOST=smtp.gmail.com; PORT=465 ;;
  2) HOST=smtp.naver.com; PORT=465 ;;
  3) read -rp "SMTP 서버 주소: " HOST; read -rp "포트 (보통 465): " PORT ;;
  *) echo "1, 2, 3 중에서 골라 주세요."; exit 1 ;;
esac
read -rp "보내는 메일 주소: " ADDR
read -rsp "앱 비밀번호 (입력해도 화면에 안 보여요): " PASS; echo
read -rp "시험 메일을 받을 주소: " TO
[[ -n "$HOST" && -n "$PORT" && -n "$ADDR" && -n "$PASS" && -n "$TO" ]] || { echo "빈칸이 있어요. 처음부터 다시 실행해 주세요."; exit 1; }
if [[ "$KIND" == 1 ]]; then
  [[ "$ADDR" == *@* ]] || ADDR="$ADDR@gmail.com"
  # Gmail은 앱 비밀번호를 네 글자씩 띄워서 보여 주고, 복사하면 특수한 공백이 섞이기도 한다
  PASS="${PASS//[^a-zA-Z0-9]/}"
  if [[ ${#PASS} -ne 16 ]]; then
    echo "앱 비밀번호는 16자리인데 ${#PASS}자리가 입력됐어요. 일반 로그인 비밀번호가 아닌지 확인하고 다시 실행해 주세요."
    exit 1
  fi
fi
echo "보내는 주소: $ADDR"

SMTP_HOST="$HOST" SMTP_PORT="$PORT" SMTP_USER="$ADDR" SMTP_PASS="$PASS" MAIL_FROM="새싹영어 <$ADDR>" ENV_FILE="$ENV_FILE" node -e '
const fs = require("fs"), f = process.env.ENV_FILE;
let lines = fs.readFileSync(f, "utf8").split("\n");
for (const k of ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_FROM"]) {
  const i = lines.findIndex(l => l.startsWith(k + "="));
  if (i >= 0) lines[i] = k + "=" + process.env[k]; else lines.push(k + "=" + process.env[k]);
}
const secure = lines.findIndex(l => l.startsWith("SMTP_SECURE="));
if (secure >= 0) lines[secure] = "SMTP_SECURE=" + (process.env.SMTP_PORT === "465");
const dev = lines.findIndex(l => l.startsWith("DEV_SHOW_CODE="));
if (dev >= 0) lines[dev] = "DEV_SHOW_CODE=false";
fs.writeFileSync(f + ".new", lines.join("\n"), { mode: 0o600 });
fs.renameSync(f + ".new", f);
'
unset PASS
chown sprout:sprout "$ENV_FILE"; chmod 600 "$ENV_FILE"

echo "▶ 시험 메일 보내는 중"
if ! sudo -u sprout -H bash -c 'cd "$1/server" && NODE_ENV=production node scripts/test-mail.js "$2"' _ "$APP" "$TO"; then
  echo "메일 주소와 앱 비밀번호, 메일 서비스의 SMTP 사용 설정을 확인한 뒤 다시 실행해 주세요. 서버는 다시 시작하지 않았어요."
  exit 1
fi

echo "▶ 서버 다시 시작"
systemctl restart sprout-english
sleep 3
journalctl -u sprout-english -n 30 --no-pager -o cat | grep '\[메일\]' | tail -1 || true
curl -fsS http://127.0.0.1:8080/api/health >/dev/null && echo "서버 정상. 받은편지함과 스팸함에서 시험 메일을 확인해 주세요."
