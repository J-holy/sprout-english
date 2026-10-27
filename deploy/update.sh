#!/usr/bin/env bash
# 새 버전으로 업데이트 (.env·DB·키는 그대로 둔다)
# 사용법: 새 버전 프로젝트 폴더에서  sudo ./deploy/update.sh
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "sudo로 실행해 주세요."; exit 1; }
SRC="$(cd "$(dirname "$0")/.." && pwd)"; APP=/opt/sprout-english

echo "▶ 업데이트 전 DB 백업"
sudo -u sprout bash -c "cd $APP/server && node scripts/backup.js"
echo "▶ 파일 복사"
rsync -a --delete --exclude node_modules --exclude 'server/data' --exclude 'server/.env' --exclude 'server/secrets' --exclude '.git' "$SRC"/ "$APP"/
echo "▶ 패키지 설치"
cd "$APP/server" && npm ci --omit=dev --no-audit --no-fund
chown -R sprout:sprout "$APP/server/data"
install -m 644 "$APP/deploy/sprout-english.service" /etc/systemd/system/sprout-english.service
systemctl daemon-reload && systemctl restart sprout-english
sleep 2 && curl -fsS http://127.0.0.1:8080/api/health && echo " ← 업데이트 완료"
