#!/usr/bin/env bash
# 도메인을 Cloudflare Tunnel로 이 서버에 연결하고 PUBLIC_URL을 바꾼 뒤 서버를 다시 시작한다
# 공유기 포트를 열지 않는다. Tailscale과 다른 서비스는 건드리지 않는다
# 사용법: bash deploy/set-domain.sh saessakschool.co.kr   (sudo 없이 실행, 비밀번호는 필요할 때 물어봐요)
set -euo pipefail
DOMAIN="${1:-}"; NAME=sprout; PORT=8080
CF="$HOME/.cloudflared"; ETC=/etc/cloudflared; ENV_FILE=/opt/sprout-english/server/.env
[[ $EUID -ne 0 ]] || { echo "sudo 없이 실행해 주세요. Cloudflare 인증 파일이 내 폴더에 저장돼야 해요."; exit 1; }
[[ "$DOMAIN" =~ ^[a-z0-9-]+(\.[a-z0-9-]+)+$ ]] || { echo "사용법: bash deploy/set-domain.sh saessakschool.co.kr"; exit 1; }
command -v cloudflared >/dev/null || { echo "cloudflared가 없어요."; exit 1; }

if [[ ! -f "$CF/cert.pem" ]]; then
  echo "▶ 1/5 Cloudflare 로그인: 아래 주소를 브라우저에서 열고 $DOMAIN 을 고른 뒤 Authorize를 눌러 주세요"
  cloudflared tunnel login
fi

CRED=$(ls "$CF"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$CRED" ]]; then
  echo "▶ 2/5 터널 만들기"
  cloudflared tunnel create "$NAME"
  CRED=$(ls "$CF"/*.json | head -1)
fi
ID=$(basename "$CRED" .json)

echo "▶ 3/5 주소 연결: $DOMAIN, www.$DOMAIN"
cloudflared tunnel route dns -f "$NAME" "$DOMAIN"
cloudflared tunnel route dns -f "$NAME" "www.$DOMAIN"

echo "▶ 4/5 터널을 서비스로 등록 (sudo 비밀번호를 물어봐요)"
sudo mkdir -p "$ETC"
sudo install -m 600 "$CRED" "$ETC/$ID.json"
sudo tee "$ETC/config.yml" >/dev/null <<EOF
tunnel: $ID
credentials-file: $ETC/$ID.json
ingress:
  - hostname: $DOMAIN
    service: http://127.0.0.1:$PORT
  - hostname: www.$DOMAIN
    service: http://127.0.0.1:$PORT
  - service: http_status:404
EOF
if systemctl cat cloudflared >/dev/null 2>&1; then sudo systemctl restart cloudflared; else sudo cloudflared service install; fi
sudo systemctl enable --now cloudflared

echo "▶ 5/5 공개 주소를 https://$DOMAIN 으로 바꾸고 서버 다시 시작"
sudo env PUBLIC_URL="https://$DOMAIN" ENV_FILE="$ENV_FILE" node -e '
const fs = require("fs"), f = process.env.ENV_FILE;
const lines = fs.readFileSync(f, "utf8").split("\n");
const i = lines.findIndex(l => l.startsWith("PUBLIC_URL="));
const line = "PUBLIC_URL=" + process.env.PUBLIC_URL;
if (i >= 0) lines[i] = line; else lines.push(line);
fs.writeFileSync(f + ".new", lines.join("\n"), { mode: 0o600 });
fs.renameSync(f + ".new", f);
'
sudo chown sprout:sprout "$ENV_FILE"; sudo chmod 600 "$ENV_FILE"
sudo systemctl restart sprout-english

for i in $(seq 1 30); do
  if curl -fsS --max-time 8 "https://$DOMAIN/api/health" >/dev/null 2>&1; then echo "연결 완료: https://$DOMAIN"; exit 0; fi
  sleep 5
done
echo "터널은 등록했는데 아직 주소가 열리지 않아요. 몇 분 뒤 https://$DOMAIN 을 다시 열어 보세요."
