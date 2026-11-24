#!/usr/bin/env bash
# 인증코드 메일의 '보내는 사람' 주소만 바꾼다 (SMTP 계정·비밀번호는 그대로). 시험 메일을 보낸 뒤 서버를 다시 시작한다
# 사용법: sudo bash deploy/set-mail-from.sh support@saessakschool.co.kr [시험 메일 받을 주소]
#   Gmail SMTP로 보낼 때는 그 Gmail의 '다른 주소에서 메일 보내기'에 이 주소가 먼저 등록되어 있어야 한다 (2026-11-24 support@ 등록)
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "sudo로 실행해 주세요."; exit 1; }
FROM="${1:-}"; TO="${2:-$FROM}"
[[ "$FROM" == *@*.* ]] || { echo "보내는 주소를 적어 주세요. 예: sudo bash deploy/set-mail-from.sh support@saessakschool.co.kr"; exit 1; }
APP=/opt/sprout-english; ENV_FILE="$APP/server/.env"
[[ -f "$ENV_FILE" ]] || { echo "$ENV_FILE 이 없어요."; exit 1; }
cp -p "$ENV_FILE" "$ENV_FILE.bak-mailfrom"

MAIL_FROM="새싹스쿨 <$FROM>" ENV_FILE="$ENV_FILE" node -e '
const fs = require("fs"), f = process.env.ENV_FILE;
const lines = fs.readFileSync(f, "utf8").split("\n");
const i = lines.findIndex(l => l.startsWith("MAIL_FROM="));
if (i >= 0) lines[i] = "MAIL_FROM=" + process.env.MAIL_FROM; else lines.push("MAIL_FROM=" + process.env.MAIL_FROM);
fs.writeFileSync(f + ".new", lines.join("\n"), { mode: 0o600 });
fs.renameSync(f + ".new", f);
'
chown sprout:sprout "$ENV_FILE"; chmod 600 "$ENV_FILE"
echo "보내는 사람: 새싹스쿨 <$FROM>"

echo "▶ 시험 메일 보내는 중 ($TO)"
if ! sudo -u sprout -H bash -c 'cd "$1/server" && NODE_ENV=production node scripts/test-mail.js "$2"' _ "$APP" "$TO"; then
  mv "$ENV_FILE.bak-mailfrom" "$ENV_FILE"
  echo "시험 메일을 보내지 못해서 원래 설정으로 되돌렸어요. 서버는 다시 시작하지 않았어요."
  exit 1
fi
rm -f "$ENV_FILE.bak-mailfrom"

echo "▶ 서버 다시 시작"
systemctl restart sprout-english
sleep 3
curl -fsS http://127.0.0.1:8080/api/health >/dev/null && echo "서버 정상. 받은 메일의 보내는 사람이 $FROM 인지 확인해 주세요."
