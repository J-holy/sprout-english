#!/usr/bin/env bash
# 백업을 Pi 바깥(Mac)으로 가져갈 수 있게 준비해요.
#  - /var/backups/sprout 폴더를 만들고(소유 sprout, 그룹 nextcode, 남은 못 읽음)
#  - .env에 BACKUP_COPY_DIR를 넣은 뒤 바로 한 번 백업해요.
# 사용: sudo ./deploy/set-backup.sh [읽을 사용자, 기본 nextcode]
set -euo pipefail
APP=/opt/sprout-english
READER=${1:-${SUDO_USER:-nextcode}}
DIR=/var/backups/sprout
[[ $EUID -eq 0 ]] || { echo "sudo로 실행해 주세요"; exit 1; }
install -d -o sprout -g "$READER" -m 2750 "$DIR"
sed -i '/^BACKUP_COPY_DIR=/d' "$APP/server/.env"
printf 'BACKUP_COPY_DIR=%s\n' "$DIR" >> "$APP/server/.env"
sudo -u sprout bash -c "cd $APP/server && /usr/bin/node scripts/backup.js"
ls -l "$DIR"
echo "완료"
