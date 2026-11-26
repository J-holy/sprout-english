#!/usr/bin/env bash
# Pi에서 한 번: Mac 예비 서버가 쓸 수 있게 준비해요 (2026-11-26)
#  1) 5분마다 /var/backups/sprout/latest.db 를 새로 만들어요 (Mac이 가져가요)
#  2) Mac이 같은 터널로 대신 서비스할 수 있게 터널 설정·인증 파일과 서버 .env 를 한 번만 묶어 둬요
#     (/var/backups/sprout/standby-secrets.tgz, nextcode만 읽을 수 있음). Mac이 가져간 뒤 --clean 으로 지워요
# 사용: sudo ./deploy/set-standby.sh          준비
#       sudo ./deploy/set-standby.sh --clean  비밀 묶음 지우기 (Mac 설치가 끝나면)
#       sudo ./deploy/set-standby.sh --off    5분 백업 끄기
# 먼저 sudo ./deploy/set-backup.sh 를 한 번 해 둬야 해요 (BACKUP_COPY_DIR)
set -euo pipefail
APP=/opt/sprout-english
DIR=/var/backups/sprout
CRON=/etc/cron.d/sprout-standby
[[ $EUID -eq 0 ]] || { echo "sudo로 실행해 주세요"; exit 1; }
case "${1:-}" in
  --clean) rm -f "$DIR/standby-secrets.tgz"; echo "비밀 묶음을 지웠어요"; exit 0 ;;
  --off) rm -f "$CRON"; echo "5분 백업을 껐어요"; exit 0 ;;
esac
grep -q '^BACKUP_COPY_DIR=' "$APP/server/.env" || { echo "먼저 sudo ./deploy/set-backup.sh 를 실행해 주세요"; exit 1; }
printf '*/5 * * * * sprout cd %s/server && set -a && . ./.env && set +a && /usr/bin/node scripts/backup.js --latest >> %s/server/data/standby.log 2>&1\n' "$APP" "$APP" > "$CRON"
chmod 644 "$CRON"
sudo -u sprout bash -c "cd $APP/server && set -a && . ./.env && set +a && /usr/bin/node scripts/backup.js --latest"
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
cp /etc/cloudflared/config.yml /etc/cloudflared/*.json "$APP/server/.env" "$TMP/"
tar -czf "$DIR/standby-secrets.tgz" -C "$TMP" .
chown sprout:"$(stat -c %G "$DIR")" "$DIR/standby-secrets.tgz"; chmod 640 "$DIR/standby-secrets.tgz"
ls -l "$DIR"
echo "완료: Mac에서 ./deploy/standby-mac.sh install 을 실행한 뒤, 여기서 sudo ./deploy/set-standby.sh --clean 으로 비밀 묶음을 지워 주세요"
