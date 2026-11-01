#!/usr/bin/env bash
# 관리자 이메일을 .env에 넣고 서버를 다시 시작한다. 이 주소로 로그인하면 관리자 콘솔(#/admin)이 열린다
# 사용법: sudo bash deploy/set-admin.sh
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "sudo로 실행해 주세요."; exit 1; }
APP=/opt/sprout-english; ENV_FILE="$APP/server/.env"
[[ -f "$ENV_FILE" ]] || { echo "$ENV_FILE 이 없어요. 먼저 install-pi.sh를 실행해 주세요."; exit 1; }

read -rp "관리자 이메일: " ADDR
[[ "$ADDR" =~ ^[^[:space:]@,]+@[^[:space:]@,]+\.[^[:space:]@,]+$ ]] || { echo "이메일 주소를 다시 확인해 주세요."; exit 1; }

ADMIN_EMAILS="$ADDR" ENV_FILE="$ENV_FILE" node -e '
const fs = require("fs"), f = process.env.ENV_FILE;
const lines = fs.readFileSync(f, "utf8").split("\n");
const i = lines.findIndex(l => l.startsWith("ADMIN_EMAILS="));
const line = "ADMIN_EMAILS=" + process.env.ADMIN_EMAILS;
if (i >= 0) lines[i] = line; else lines.push(line);
fs.writeFileSync(f + ".new", lines.join("\n"), { mode: 0o600 });
fs.renameSync(f + ".new", f);
'
chown sprout:sprout "$ENV_FILE"; chmod 600 "$ENV_FILE"

echo "▶ 서버 다시 시작"
systemctl restart sprout-english
sleep 3
curl -fsS http://127.0.0.1:8080/api/health >/dev/null && echo "서버 정상. 이제 $ADDR 로 로그인하면 관리자 메뉴가 보여요."
