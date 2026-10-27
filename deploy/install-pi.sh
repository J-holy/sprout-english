#!/usr/bin/env bash
# 새싹영어 라즈베리파이 설치 스크립트
#
# 사용법 (라즈베리파이에서, 프로젝트 폴더 안에서):
#   sudo ./deploy/install-pi.sh --domain example.com --admin me@example.com
#   sudo ./deploy/install-pi.sh --domain example.com --admin me@example.com --tunnel   # 공유기 포트포워딩 없이 Cloudflare Tunnel 사용
#
# 하는 일: Node.js 24 설치 → /opt/sprout-english 에 복사 → 패키지 설치 → .env 생성 → systemd 서비스 등록
#          → (기본) Caddy로 HTTPS 자동 설정 + 방화벽 / (--tunnel) cloudflared 설치 → 매일 DB 백업 예약
set -euo pipefail

DOMAIN=""; ADMIN=""; TUNNEL=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) DOMAIN="$2"; shift 2 ;;
    --admin) ADMIN="$2"; shift 2 ;;
    --tunnel) TUNNEL=1; shift ;;
    *) echo "알 수 없는 옵션: $1"; exit 1 ;;
  esac
done
[[ $EUID -eq 0 ]] || { echo "sudo로 실행해 주세요: sudo $0 $*"; exit 1; }
[[ -n "$DOMAIN" && -n "$ADMIN" ]] || { echo "사용법: sudo $0 --domain example.com --admin me@example.com [--tunnel]"; exit 1; }
DOMAIN="${DOMAIN#http://}"; DOMAIN="${DOMAIN#https://}"; DOMAIN="${DOMAIN%/}"

SRC="$(cd "$(dirname "$0")/.." && pwd)"
APP=/opt/sprout-english
say() { printf '\n\033[1;32m▶ %s\033[0m\n' "$*"; }

say "1/8 시스템 패키지 설치"
apt-get update -y
apt-get install -y curl ca-certificates gnupg rsync sqlite3 ufw debian-keyring debian-archive-keyring apt-transport-https

say "2/8 Node.js 24 LTS 설치"
if ! command -v node >/dev/null || [[ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y nodejs
fi
node -e 'require("node:sqlite")' || { echo "이 Node.js는 내장 SQLite를 지원하지 않아요 (22.13 이상 필요)"; exit 1; }
echo "Node $(node -v)"

say "3/8 서비스 계정과 폴더 준비 ($APP)"
id sprout >/dev/null 2>&1 || useradd --system --home "$APP" --shell /usr/sbin/nologin sprout
mkdir -p "$APP"
rsync -a --delete --exclude node_modules --exclude 'server/data' --exclude 'server/.env' --exclude 'server/secrets' --exclude '.git' "$SRC"/ "$APP"/
mkdir -p "$APP/server/data/backups" "$APP/server/secrets"

say "4/8 서버 패키지 설치"
cd "$APP/server"
if [[ -f package-lock.json ]]; then npm ci --omit=dev --no-audit --no-fund; else npm install --omit=dev --no-audit --no-fund; fi

say "5/8 설정 파일(.env)"
if [[ ! -f .env ]]; then
  cp .env.example .env
  sed -i "s|^PUBLIC_URL=.*|PUBLIC_URL=https://$DOMAIN|" .env
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=$(openssl rand -hex 32)|" .env
  sed -i "s|^ADMIN_EMAILS=.*|ADMIN_EMAILS=$ADMIN|" .env
  sed -i "s|^MAIL_FROM=.*|MAIL_FROM=새싹영어 <no-reply@$DOMAIN>|" .env
  sed -i "s|^APPLE_PRIVATE_KEY_PATH=.*|APPLE_PRIVATE_KEY_PATH=$APP/server/secrets/AuthKey.p8|" .env
  echo ".env를 만들었어요. SMTP·SNS·토스 키는 $APP/server/.env 를 열어 채워 주세요."
else
  echo "기존 .env를 그대로 둬요."
fi
chown -R sprout:sprout "$APP/server/data" "$APP/server/secrets" "$APP/server/.env"
chmod 600 "$APP/server/.env"; chmod 700 "$APP/server/secrets"

say "6/8 systemd 서비스 등록"
install -m 644 "$APP/deploy/sprout-english.service" /etc/systemd/system/sprout-english.service
systemctl daemon-reload
systemctl enable --now sprout-english
sleep 2
systemctl --no-pager --lines=5 status sprout-english || true
curl -fsS http://127.0.0.1:8080/api/health && echo " ← 서버 응답 OK"

if [[ $TUNNEL -eq 0 ]]; then
  say "7/8 Caddy (HTTPS 자동 인증서) 설치"
  if ! command -v caddy >/dev/null; then
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
    apt-get update -y && apt-get install -y caddy
  fi
  mkdir -p /var/log/caddy && chown caddy:caddy /var/log/caddy
  sed "s/example\.com/$DOMAIN/g" "$APP/deploy/Caddyfile" > /etc/caddy/Caddyfile
  caddy validate --config /etc/caddy/Caddyfile
  systemctl enable caddy && systemctl reload caddy || systemctl restart caddy
  say "방화벽: SSH(22), HTTP(80), HTTPS(443)만 열기"
  ufw allow 22/tcp; ufw allow 80/tcp; ufw allow 443/tcp
  ufw --force enable
else
  say "7/8 Cloudflare Tunnel(cloudflared) 설치"
  if ! command -v cloudflared >/dev/null; then
    mkdir -p --mode=0755 /usr/share/keyrings
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg > /usr/share/keyrings/cloudflare-main.gpg
    echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' > /etc/apt/sources.list.d/cloudflared.list
    apt-get update -y && apt-get install -y cloudflared
  fi
  ufw allow 22/tcp; ufw --force enable
  echo "cloudflared를 설치했어요. deploy/DEPLOY.md의 'B. Cloudflare Tunnel' 단계로 터널을 연결해 주세요."
fi

say "8/8 매일 03:30 DB 백업 예약"
cat > /etc/cron.d/sprout-english <<CRON
30 3 * * * sprout cd $APP/server && /usr/bin/node scripts/backup.js >> $APP/server/data/backup.log 2>&1
CRON
chmod 644 /etc/cron.d/sprout-english

cat <<DONE

🌱 설치 완료!
 - 서버 상태:   sudo systemctl status sprout-english
 - 서버 로그:   sudo journalctl -u sprout-english -f
 - 설정 파일:   sudo nano $APP/server/.env   (바꾼 뒤: sudo systemctl restart sprout-english)
 - 접속 주소:   https://$DOMAIN   (DNS와 포트포워딩/터널이 연결되면 열려요)
 - 관리자:      $ADMIN 로 가입하면 관리자 콘솔(#/admin)이 열려요
다음 단계는 deploy/DEPLOY.md 를 보세요.
DONE
