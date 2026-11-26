#!/usr/bin/env bash
# Mac 예비 서버 (2026-11-26): Pi가 멈추면 Mac이 같은 Cloudflare 터널로 대신 서비스해요.
#
#   ./deploy/standby-mac.sh install    설치 (코드 복사, 비밀 묶음 가져오기, 5분 동기화·1분 감시 등록)
#   ./deploy/standby-mac.sh status     지금 상태
#   ./deploy/standby-mac.sh sync       Pi의 최신 DB(5분마다 만들어짐)와 코드를 지금 가져오기
#   ./deploy/standby-mac.sh watch      감시 한 번 (launchd가 1분마다 실행)
#   ./deploy/standby-mac.sh up         직접 대신 서비스 시작 (시험용·수동 전환)
#   ./deploy/standby-mac.sh down       대신 서비스 멈추기 (DB는 failover-*.db 로 남겨요)
#   ./deploy/standby-mac.sh uninstall  감시 끄기
#
# 동작
#  · 평소: 5분마다 Pi의 /var/backups/sprout/latest.db 와 GitHub main 코드를 받아 둬요. 서비스는 하지 않아요.
#  · 전환: 공개 주소가 3번 연속(약 3분) 응답하지 않고 Pi에도 SSH로 닿지 않으면, 받아 둔 DB로 서버와 터널을 켜요.
#          Pi의 마지막 5분 안의 변경은 잃을 수 있어요.
#  · 되돌리기: Pi가 다시 살아나면 Mac은 바로 서비스를 멈추고(두 곳이 함께 서비스하면 데이터가 갈라져요)
#          Mac에서 생긴 DB를 failover-날짜.db 로 남긴 뒤 알림을 띄워요. 그 DB를 Pi로 옮기는 일은 사람이 해요(DEPLOY.md 4-6).
set -euo pipefail
PI=${SPROUT_PI:-nextcode@100.109.175.94}
KEY=${SPROUT_KEY:-$HOME/.ssh/sprout_pi}
URL=${SPROUT_URL:-https://saessakschool.co.kr/api/config}
REPO=${SPROUT_REPO:-https://github.com/J-holy/sprout-english.git}
H=$HOME/sprout-standby; APP=$H/app; DATA=$H/data; SEC=$H/secrets; BIN=$H/bin; LOG=$H/standby.log
SSH=(ssh -o BatchMode=yes -o IdentitiesOnly=yes -o ConnectTimeout=10 -i "$KEY")
LA=$HOME/Library/LaunchAgents
log() { echo "$(date '+%F %T') $*" | tee -a "$LOG"; }
note() { osascript -e "display notification \"$1\" with title \"새싹스쿨 예비 서버\"" >/dev/null 2>&1 || true; log "알림: $1"; }
active() { [[ -f $H/active ]]; }
pi_ok() { "${SSH[@]}" "$PI" 'systemctl is-active --quiet sprout-english' >/dev/null 2>&1; }
web_ok() { curl -fsS -m 10 -o /dev/null "$URL"; }

sync() {
  active && { log "대신 서비스 중이라 동기화하지 않아요"; return 0; }
  mkdir -p "$DATA"; chmod 700 "$H" "$DATA"
  rsync -a -e "${SSH[*]}" "$PI:/var/backups/sprout/latest.db" "$DATA/latest.db.tmp" && mv "$DATA/latest.db.tmp" "$DATA/latest.db"
  git -C "$APP" pull -q --ff-only && (cd "$APP/server" && npm ci --omit=dev --silent >/dev/null 2>&1 || true)
  log "동기화: DB $(stat -f %Sm -t '%m-%d %H:%M' "$DATA/latest.db") · 코드 $(git -C "$APP" log --oneline -1 | cut -c1-40)"
}

up() {
  active && { log "이미 대신 서비스 중이에요"; return 0; }
  [[ -x $BIN/cloudflared ]] || { log "cloudflared가 없어요 ($BIN/cloudflared)"; return 1; }
  cp "$DATA/latest.db" "$DATA/sprout.db"; rm -f "$DATA/sprout.db-wal" "$DATA/sprout.db-shm"
  (cd "$APP/server" && ENV_FILE="$SEC/.env" DATA_DIR="$DATA" HOST=127.0.0.1 PORT=8080 nohup node server.js >> "$H/server.log" 2>&1 & echo $! > "$H/server.pid")
  sleep 3
  nohup "$BIN/cloudflared" --no-autoupdate --config "$SEC/config.yml" tunnel run >> "$H/tunnel.log" 2>&1 & echo $! > "$H/tunnel.pid"
  date +%s > "$H/active"; note "Pi 대신 Mac이 서비스를 시작했어요"
}

down() {
  for f in tunnel server; do [[ -f $H/$f.pid ]] && kill "$(cat "$H/$f.pid")" 2>/dev/null || true; rm -f "$H/$f.pid"; done
  if active; then sleep 2; cp "$DATA/sprout.db" "$DATA/failover-$(date +%Y%m%d-%H%M).db"; rm -f "$H/active"; note "Mac 대신 서비스를 멈췄어요. failover DB를 Pi로 옮겨 주세요"; fi
}

watch() {
  if active; then
    pi_ok && { log "Pi가 돌아왔어요 → Mac 서비스 멈춤"; down; }
    return 0
  fi
  if web_ok; then rm -f "$H/fails"; return 0; fi
  n=$(( $(cat "$H/fails" 2>/dev/null || echo 0) + 1 )); echo $n > "$H/fails"; log "공개 주소 응답 없음 ($n번째)"
  (( n >= 3 )) || return 0
  if pi_ok; then log "Pi는 살아 있어요 (터널·Cloudflare 문제일 수 있음) → 전환하지 않아요"; return 0; fi
  [[ -f $DATA/latest.db ]] || { log "받아 둔 DB가 없어 전환할 수 없어요"; return 1; }
  rm -f "$H/fails"; up
}

agent() { # 이름 주기(초) 명령
  cat > "$LA/kr.saessakschool.standby-$1.plist" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>kr.saessakschool.standby-$1</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$H/standby-mac.sh</string><string>$1</string></array>
  <key>StartInterval</key><integer>$2</integer>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string></dict>
  <key>StandardErrorPath</key><string>$H/agent.err</string>
</dict></plist>
PL
  launchctl unload "$LA/kr.saessakschool.standby-$1.plist" 2>/dev/null || true
  launchctl load "$LA/kr.saessakschool.standby-$1.plist"
}

install() {
  mkdir -p "$H" "$DATA" "$SEC" "$BIN" "$LA"; chmod 700 "$H" "$SEC" "$DATA"
  cp "$0" "$H/standby-mac.sh"; chmod 700 "$H/standby-mac.sh"
  [[ -d $APP/.git ]] || git clone -q "$REPO" "$APP"
  (cd "$APP/server" && npm ci --omit=dev --silent)
  if "${SSH[@]}" "$PI" 'test -r /var/backups/sprout/standby-secrets.tgz'; then
    "${SSH[@]}" "$PI" 'cat /var/backups/sprout/standby-secrets.tgz' | tar -xzf - -C "$SEC"; chmod 600 "$SEC"/*
    # 터널 인증 파일 위치를 Mac 경로로
    sed -i '' -E "s#^credentials-file: .*#credentials-file: $SEC/$(cd "$SEC" && ls *.json | head -1)#" "$SEC/config.yml"
    log "비밀 묶음을 받았어요. Pi에서 sudo ./deploy/set-standby.sh --clean 으로 지워 주세요"
  elif [[ ! -f $SEC/.env ]]; then log "Pi에 비밀 묶음이 없어요. 먼저 Pi에서 sudo ./deploy/set-standby.sh"; fi
  [[ -x $BIN/cloudflared ]] || log "cloudflared를 $BIN/cloudflared 에 넣어 주세요 (DEPLOY.md 4-6)"
  sync || true
  agent sync 300; agent watch 60
  log "설치 끝: 5분마다 동기화, 1분마다 감시"
}

status() {
  echo "상태: $(active && echo '대신 서비스 중' || echo '대기')"
  echo "받아 둔 DB: $([[ -f $DATA/latest.db ]] && stat -f '%Sm' -t '%F %T' "$DATA/latest.db" || echo 없음)"
  echo "코드: $(git -C "$APP" log --oneline -1 2>/dev/null | cut -c1-60)"
  echo "터널 프로그램: $([[ -x $BIN/cloudflared ]] && echo 있음 || echo 없음) · 비밀: $([[ -f $SEC/.env ]] && echo 있음 || echo 없음)"
  echo "공개 주소: $(web_ok && echo 정상 || echo '응답 없음') · Pi: $(pi_ok && echo 정상 || echo '닿지 않음')"
  tail -3 "$LOG" 2>/dev/null || true
}

uninstall() { for a in sync watch; do launchctl unload "$LA/kr.saessakschool.standby-$a.plist" 2>/dev/null || true; rm -f "$LA/kr.saessakschool.standby-$a.plist"; done; log "감시를 껐어요"; }

case "${1:-status}" in install|status|sync|watch|up|down|uninstall) "$1" ;; *) echo "사용: $0 install|status|sync|watch|up|down|uninstall"; exit 1 ;; esac
