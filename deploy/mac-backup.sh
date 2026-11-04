#!/usr/bin/env bash
# Mac에서 Pi의 DB 백업을 매일 가져와요 (Pi가 고장 나도 회원·학습 기록이 남게).
#   설치:  ./deploy/mac-backup.sh install   → 매일 10:00(잠자고 있었으면 깨어날 때) 자동 실행
#   지금:  ./deploy/mac-backup.sh run
#   끄기:  ./deploy/mac-backup.sh uninstall
# 받는 곳: ~/sprout-backups (iCloud에 올라가지 않는 폴더), 15일 지난 파일은 지워요.
# Pi에서 먼저 한 번: sudo ./deploy/set-backup.sh
set -euo pipefail
PI=${SPROUT_PI:-nextcode@100.109.175.94}
KEY=${SPROUT_KEY:-$HOME/.ssh/sprout_pi}
DEST=$HOME/sprout-backups
HOME_DIR=$HOME/.sprout-backup
LABEL=kr.saessakschool.backup
PLIST=$HOME/Library/LaunchAgents/$LABEL.plist

run() {
  mkdir -p "$DEST"; chmod 700 "$DEST"
  rsync -a -e "ssh -o BatchMode=yes -o IdentitiesOnly=yes -o ConnectTimeout=20 -i $KEY" \
    "$PI:/var/backups/sprout/" "$DEST/"
  find "$DEST" -name 'sprout-*.db' -mtime +15 -delete
  echo "$(date '+%F %T') 받음: $(ls "$DEST" | grep -c '\.db$')개, 최신 $(ls "$DEST" | grep '\.db$' | sort | tail -1)"
}

case "${1:-run}" in
  run) run ;;
  install)
    mkdir -p "$HOME_DIR" "$DEST" "$HOME/Library/LaunchAgents"
    cp "$0" "$HOME_DIR/mac-backup.sh"; chmod 700 "$HOME_DIR/mac-backup.sh"
    cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$HOME_DIR/mac-backup.sh</string><string>run</string></array>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>10</integer><key>Minute</key><integer>0</integer></dict>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$DEST/pull.log</string>
  <key>StandardErrorPath</key><string>$DEST/pull.log</string>
</dict></plist>
PL
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
    launchctl bootstrap "gui/$(id -u)" "$PLIST"
    echo "설치 완료: 매일 10:00에 $DEST 로 가져와요" ;;
  uninstall)
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
    rm -f "$PLIST"; echo "껐어요 (받아 둔 파일은 $DEST 에 남아 있어요)" ;;
  *) echo "사용: $0 [run|install|uninstall]"; exit 1 ;;
esac
