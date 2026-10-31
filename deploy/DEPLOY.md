# 새싹영어 라즈베리파이 배포 가이드

라즈베리파이 한 대에 새싹영어를 설치하고, 구입한 도메인(예: `sprout-english.kr`)으로 HTTPS 접속까지 하는 방법이에요.
설치 스크립트가 대부분을 처리하므로 **도메인 연결 방법 고르기 → 스크립트 실행 → `.env` 채우기** 순서로 하면 돼요.

---

## 0. 준비물

| 항목 | 권장 |
|---|---|
| 라즈베리파이 | Pi 4 (2GB 이상) 또는 Pi 5 |
| 저장장치 | microSD 32GB 이상. 오래 운영하려면 USB SSD를 권장해요 (SD카드는 쓰기가 많으면 수명이 짧아요). |
| OS | **Raspberry Pi OS Lite (64-bit, Bookworm)** |
| 네트워크 | 유선 LAN 권장 |
| 도메인 | 가비아·Cloudflare·Namecheap 등에서 구입 |

서버 구성: `Node.js 24` + 내장 SQLite(별도 DB 설치 불필요) + `Caddy`(HTTPS 자동) 또는 `Cloudflare Tunnel`

---

## 1. 라즈베리파이 OS 설치

1. PC에서 [Raspberry Pi Imager](https://www.raspberrypi.com/software/)를 실행해요.
2. OS로 **Raspberry Pi OS Lite (64-bit)** 를 고르고, ⚙️ 설정에서 다음을 지정해요.
   - 호스트 이름: `sprout`
   - SSH 사용, 사용자 이름과 비밀번호
   - (무선이면) Wi-Fi
3. SD카드를 꽂고 부팅한 뒤 PC에서 접속해요.
   ```bash
   ssh 사용자이름@sprout.local
   ```
4. 시스템을 업데이트해요.
   ```bash
   sudo apt update && sudo apt full-upgrade -y && sudo reboot
   ```

## 2. 프로젝트 파일 옮기기

PC의 `sprout-english` 폴더를 통째로 라즈베리파이 홈 폴더에 복사해요. `node_modules`와 `data`는 빼도 돼요.
```bash
# PC에서 실행
rsync -av --exclude node_modules --exclude 'server/data' sprout-english/ 사용자이름@sprout.local:~/sprout-english/
```
(Git 저장소에 올렸다면 라즈베리파이에서 `git clone`해도 돼요.)

---

## 3. 도메인 연결 방법 고르기

| | A. 공유기 포트포워딩 + Caddy | **B. Cloudflare Tunnel (추천)** |
|---|---|---|
| 공유기 설정 | 80·443 포트포워딩 필요 | 필요 없음 |
| 고정 IP | 필요 (아니면 DDNS) | 필요 없음 |
| 통신사의 80포트 차단 | 영향 받음 | 영향 없음 |
| HTTPS | Caddy가 Let's Encrypt로 자동 발급 | Cloudflare가 자동 처리 |

가정용 인터넷이라면 **B**가 훨씬 간단하고 안전해요.

### A. 공유기 포트포워딩 + Caddy

1. **공유기:** 라즈베리파이에 고정 내부 IP를 주고(DHCP 예약, 예: `192.168.0.50`), **TCP 80, 443 → 192.168.0.50** 으로 포트포워딩해요.
2. **공인 IP 확인:** 라즈베리파이에서 `curl -4 ifconfig.me` 를 실행해요.
3. **DNS:** 도메인 관리 화면에서 다음 두 레코드를 만들어요.
   - `A` 레코드 `@` → 공인 IP
   - `CNAME` 레코드 `www` → `@`
   - 공인 IP가 바뀌는 회선이면 공유기의 DDNS 기능(예: ipTIME DDNS)을 켜고, 도메인에서 그 주소로 CNAME을 거세요.
4. 설치 스크립트를 실행해요.
   ```bash
   cd ~/sprout-english
   sudo ./deploy/install-pi.sh --domain sprout-english.kr --admin 내이메일@example.com
   ```
   Caddy가 인증서를 받아 `https://sprout-english.kr` 이 열려요. DNS가 퍼지는 데 몇 분에서 몇 시간 걸릴 수 있어요.

### B. Cloudflare Tunnel (추천)

1. [Cloudflare](https://dash.cloudflare.com)에 가입하고 **Add a site**로 도메인을 추가해요. 도메인을 산 곳에서 네임서버를 Cloudflare가 알려준 두 개로 바꿔요.
2. 설치 스크립트를 `--tunnel` 옵션으로 실행해요. Caddy 대신 cloudflared가 설치돼요.
   ```bash
   cd ~/sprout-english
   sudo ./deploy/install-pi.sh --domain sprout-english.kr --admin 내이메일@example.com --tunnel
   ```
3. 터널을 만들고 연결해요.
   ```bash
   cloudflared tunnel login                      # 출력된 주소를 PC 브라우저에서 열어 도메인을 승인
   cloudflared tunnel create sprout              # 터널 ID와 인증 파일(~/.cloudflared/<ID>.json)이 생겨요
   cloudflared tunnel route dns sprout sprout-english.kr
   cloudflared tunnel route dns sprout www.sprout-english.kr
   ```
4. 설정 파일을 만들어요. `<ID>`는 3번에서 나온 터널 ID예요.
   ```bash
   sudo mkdir -p /etc/cloudflared
   sudo cp ~/.cloudflared/<ID>.json /etc/cloudflared/
   sudo tee /etc/cloudflared/config.yml <<'EOF'
   tunnel: <ID>
   credentials-file: /etc/cloudflared/<ID>.json
   ingress:
     - hostname: sprout-english.kr
       service: http://127.0.0.1:8080
     - hostname: www.sprout-english.kr
       service: http://127.0.0.1:8080
     - service: http_status:404
   EOF
   sudo cloudflared service install
   sudo systemctl enable --now cloudflared
   ```
5. Cloudflare 대시보드에서 **SSL/TLS → Full**, **Always Use HTTPS → On** 으로 설정해요.

---

## 4. 설정 파일(`.env`) 채우기

설치 스크립트가 `/opt/sprout-english/server/.env` 를 만들어 두었어요. 도메인, 세션 비밀키, 관리자 이메일은 이미 들어가 있어요.
```bash
sudo nano /opt/sprout-english/server/.env
sudo systemctl restart sprout-english      # 저장한 뒤 반드시 재시작
```

### 4-1. 인증코드 메일 (필수)

이메일 가입·로그인에 꼭 필요해요. 설정하지 않으면 이메일 인증이 동작하지 않아요(운영 모드).

| 메일 | 설정 |
|---|---|
| 네이버 | 네이버 메일 › 환경설정 › POP3/SMTP 사용. `SMTP_HOST=smtp.naver.com`, `SMTP_PORT=465`, `SMTP_USER=아이디@naver.com`, `SMTP_PASS=비밀번호` (2단계 인증이면 애플리케이션 비밀번호) |
| Gmail | Google 계정 › 보안 › 2단계 인증 › 앱 비밀번호. `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_PASS=앱 비밀번호 16자리` |
| 도메인 메일 (권장) | 네이버웍스·Google Workspace·Zoho 등의 SMTP 정보를 넣어요. 스팸함에 덜 빠지도록 DNS에 SPF·DKIM을 등록해요. |

- `MAIL_FROM`은 보내는 계정과 같은 주소로 맞춰요 (예: `새싹영어 <아이디@naver.com>`).
- 다시 시작한 뒤 관리자 콘솔 › 시스템에서 **인증코드 메일 ✅** 로 표시되는지 확인해요.

### 4-2. SNS 로그인 (선택)

키를 넣은 서비스의 버튼만 화면에 나타나요. 모든 서비스에 **Redirect URI**를 다음 형식으로 똑같이 등록해야 해요.
```
https://도메인/api/auth/kakao/callback
https://도메인/api/auth/naver/callback
https://도메인/api/auth/google/callback
https://도메인/api/auth/apple/callback
```

| 서비스 | 콘솔 | 할 일 | .env |
|---|---|---|---|
| 카카오 | developers.kakao.com | 애플리케이션 추가 › 카카오 로그인 활성화 › Redirect URI 등록 › 동의항목에서 닉네임·**카카오계정(이메일)** 설정 (이메일 필수 동의는 비즈 앱 전환 필요) › 보안 › Client Secret(선택) | `KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET` |
| 네이버 | developers.naver.com | 애플리케이션 등록 › 네이버 로그인 › 이메일·별명 › 서비스 URL `https://도메인` › Callback URL 등록 (검수 전에는 등록한 테스트 ID만 로그인돼요) | `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` |
| Google | console.cloud.google.com | API 및 서비스 › OAuth 동의 화면(외부) › 사용자 인증 정보 › OAuth 클라이언트 ID(웹) › 승인된 리디렉션 URI 등록 | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Apple | developer.apple.com (유료 멤버십) | App ID에 Sign in with Apple 사용 › Services ID 생성 (도메인과 Return URL 등록) › Keys에서 Sign in with Apple 키(.p8) 생성 | `APPLE_SERVICE_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, .p8 파일 |

Apple 키 파일은 다음처럼 복사해요.
```bash
sudo cp AuthKey_XXXX.p8 /opt/sprout-english/server/secrets/AuthKey.p8
sudo chown sprout:sprout /opt/sprout-english/server/secrets/AuthKey.p8 && sudo chmod 600 /opt/sprout-english/server/secrets/AuthKey.p8
```

- 카카오에서 이메일을 받지 못하면 이메일 없이 카카오 계정만으로 가입돼요.
- 같은 이메일로 다른 방법을 쓰면 기존 계정에 자동으로 연결돼요.

### 4-3. 결제: 토스페이먼츠 (선택, 유료 판매 시 필요)

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com)에 가입해서 **테스트 키**(`test_ck_…`, `test_sk_…`)를 `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`에 넣어요.
2. 테스트 카드로 다음을 확인해요: 카드 등록 → 첫 결제 → 부모페이지 › 멤버십 결제 내역 → 환불.
3. 실제 판매 전에 다음을 준비해요.
   - 토스페이먼츠 **전자결제 계약**과 **자동결제(빌링) 추가 계약**
   - 라이브 키로 교체
   - 사업자등록과 통신판매업 신고
4. 결제 동작
   - **자동갱신:** 처음 결제할 때 카드를 등록하고(빌링키 발급) 바로 결제해요. 기간이 끝나면 서버가 매시간 확인해서 등록한 카드로 자동갱신 결제를 해요.
   - **갱신 안내:** 갱신 3일 전에 알림을 보내요. 결제에 실패하면 알림을 보내고 최대 3번까지 다시 시도해요.
   - **환불:** 결제 후 7일 이내면 부모페이지에서 바로 환불돼요(토스 결제 취소 API 사용).
- 토스 키가 없으면 `ALLOW_DEMO_PAYMENT=true`일 때만 데모 결제가 되고, 기본값(false)에서는 결제 버튼이 "준비 중"으로 표시돼요.

### 4-4. AI 음성 — 자연스러운 낭독 (선택, 강력 추천)

모든 학습 문장(4,313개)의 AI 음성은 `public/audio/`에 파일로 들어 있어서 **키가 없어도 바로 재생돼요.** 화면은 이 파일을 먼저 쓰고, 파일에 없는 문장만 서버에 요청해요.

키를 넣으면 파일에 없는 문장도 AI 음성으로 읽어요. 문장마다 한 번만 만들어 `data/tts`에 저장하고, 새로 만드는 요청은 로그인한 사용자만 사용자당 시간당 120회, 전체 시간당 300회로 제한돼요. 키가 없거나 제한을 넘으면 그 문장은 기기 목소리로 읽어요. **키를 넣기 전에 Google Cloud에 예산 알림을 걸어 두세요.**

| 공급자 | 준비 | .env |
|---|---|---|
| Google Cloud (추천) | 프로젝트 › Text-to-Speech API 사용 설정 › API 키 발급 | `GOOGLE_TTS_API_KEY`, 목소리 `GOOGLE_TTS_VOICE=en-US-Studio-O` (`public/audio`와 같은 목소리) |
| OpenAI | platform.openai.com › API keys에서 키 발급 (결제 수단 등록 필요) | `OPENAI_API_KEY`, 목소리 `OPENAI_TTS_VOICE=nova` (`public/audio`와 목소리가 달라 섞여 들려요) |

- 관리자 콘솔 › 시스템에 **AI 음성 ✅**와 저장된 음성 개수가 보여요.
- 부모님은 부모페이지 › 설정 › **읽어주는 목소리**에서 AI 음성과 기기 목소리 중 고를 수 있어요.
- 학습 문장을 고친 뒤에는 PC에서 다음 명령으로 바뀐 문장의 파일만 다시 만들어 같이 올려요.
  ```bash
  cd server && npm run pregen-tts -- --static ../public/audio
  ```

### 4-4-1. 말하기 채점 음성 인식 — 아이패드·아이폰 Chrome용 (선택, 추천)

말하기 점수는 보통 브라우저의 음성 인식으로 매겨요. 그런데 **아이폰·아이패드의 Chrome·네이버·카카오 브라우저**는 애플 정책 때문에 음성 인식이 막혀 있어요.
서버에 음성 인식을 켜 두면, 이런 기기에서는 화면이 아이 목소리를 녹음해 서버로 보내 채점해요.

- **Google Cloud 프로젝트**에서 **Cloud Speech-to-Text API**를 "사용 설정"하고 키를 `.env`의 `GOOGLE_STT_API_KEY`에 넣어요. `GOOGLE_TTS_API_KEY`가 있으면 그 키를 그대로 써도 돼요.
  - 매달 60분 무료, 그 뒤로 1분에 약 0.016달러(문장 하나가 2~3초라 1,000번 말해도 약 1달러)
  - 끄려면 `STT_PROVIDER=off`
  - 녹음이 Google로 전송되므로 `public/privacy.html`의 국외 이전 항목을 빠짐없이 채워 두세요.
- OpenAI 키만 있으면 OpenAI 음성 인식을 써요.
- 로그인한 사용자만, 시간당 400번까지 쓸 수 있어요.
- 서버가 없는 GitHub Pages 데모에서는 채점 대신 **녹음해서 내 목소리와 원어민 소리를 비교해 듣기**로 바뀌어요.

### 4-4-2. 문제 그림·스토리북 삽화 — 같은 그림체로 (선택, 무료)

문제의 이모지와 스토리북 장면을 같은 그림체의 그림으로 바꿔요. Cloudflare Workers AI의 **하루 무료 사용량**(10,000 뉴런) 안에서 그려서, 무료 요금제 계정이면 요금이 나가지 않아요. 전체(단어 그림 약 250개 + 스토리북 659쪽)를 그리는 데 하루 한 번씩 **약 10일** 걸려요. 그림이 없는 문제·쪽은 지금처럼 이모지·장면으로 보여요.

1. [dash.cloudflare.com](https://dash.cloudflare.com)에 가입해요 (무료 요금제, 결제 수단 등록 필요 없음).
2. **계정 ID**: 대시보드 첫 화면 오른쪽(또는 Workers & Pages 화면)의 *Account ID*를 복사해요.
3. **토큰**: 오른쪽 위 프로필 › *My Profile* › *API Tokens* › *Create Token* › **Workers AI** 템플릿 › *Continue to summary* › *Create Token*.
4. `server/.env`에 넣어요 (채팅·메신저에 붙여 넣지 마세요):
   ```
   CF_ACCOUNT_ID=복사한_계정_ID
   CF_AI_TOKEN=만든_토큰
   ```
5. Mac의 프로젝트 폴더에서 실행해요:
   ```bash
   cd server
   npm run pregen-img -- --book 2     # 시범: 스토리북 1권(16쪽)만
   npm run pregen-img                 # 전체: 무료 사용량을 다 쓰면 멈춰요
   ```
   다음 날 **오전 9시(한국 시간) 이후** 같은 명령을 다시 실행하면 이어서 그려요. 그린 그림은 `public/img`에 쌓여요.
6. 마음에 안 드는 그림은 `npm run pregen-img -- --redo 2-5,🍎`처럼 골라서 다시 그려요 (스토리는 `책번호-쪽번호`(0부터), 단어는 이모지).
7. 다 그리면 커밋해서 올리면 사이트에 반영돼요.

**Mac에서 직접 그리기 (무료, 사용량 제한 없음)** — 같은 모델(FLUX.2 klein 4B, Apache 2.0)을 Apple Silicon Mac에서 돌려요. 그림체가 같아서 Cloudflare 그림과 섞여도 괜찮아요. M1 8GB에서 한 장에 약 1~1.5분, 메모리 약 4GB를 써요.
```bash
python3 -m pip install --user uv
cd server && mkdir -p data/mflux && cd data/mflux
~/Library/Python/3.9/bin/uv venv --python 3.12 .venv
~/Library/Python/3.9/bin/uv pip install --python .venv/bin/python mflux
cd ../.. && npm run pregen-img -- --local     # 처음 한 번 모델(약 4GB)을 받아요
```

### 4-5. 약관·개인정보 처리방침

- `public/terms.html`, `public/privacy.html` 의 `[ ]` 부분을 실제 사업자 정보로 바꿔요.
- 개인정보 처리방침 주소(`https://도메인/privacy.html`)는 카카오·네이버·Google·Apple 앱 심사에 필요해요.

---

## 5. 동작 확인 체크리스트

- [ ] `https://도메인` 이 자물쇠 표시와 함께 열려요.
- [ ] 회원가입 › 이메일로 인증코드가 오고, 입력하면 가입돼요.
- [ ] 관리자 이메일로 가입하면 상단에 🛠️ 관리자 메뉴가 생겨요.
- [ ] 관리자 콘솔 › 시스템에서 메일·SNS·결제가 ✅ 로 표시돼요.
- [ ] 아이 프로필을 만들고 레슨을 하면, 다른 기기에서 로그인해도 진도가 보여요 (서버 동기화).
- [ ] (토스 설정 시) 테스트 결제와 환불이 돼요.

## 6. 운영

| 작업 | 명령 |
|---|---|
| 상태 | `sudo systemctl status sprout-english` |
| 실시간 로그 | `sudo journalctl -u sprout-english -f` |
| 재시작 | `sudo systemctl restart sprout-english` |
| 수동 백업 | `sudo -u sprout bash -c 'cd /opt/sprout-english/server && node scripts/backup.js'` |
| 백업 위치 | `/opt/sprout-english/server/data/backups/` (매일 03:30, 최근 14개 보관) |
| 관리자 지정 | `sudo -u sprout bash -c 'cd /opt/sprout-english/server && node scripts/make-admin.js 이메일'` |
| 새 버전 업데이트 | 새 파일을 `~/sprout-english`에 복사한 뒤 `sudo ./deploy/update.sh` (업데이트 전에 자동 백업) |

### 백업에서 복원하기
```bash
sudo systemctl stop sprout-english
sudo -u sprout cp /opt/sprout-english/server/data/backups/sprout-YYYYMMDD-HH.db /opt/sprout-english/server/data/sprout.db
sudo rm -f /opt/sprout-english/server/data/sprout.db-wal /opt/sprout-english/server/data/sprout.db-shm
sudo systemctl start sprout-english
```

> 💡 백업 파일을 라즈베리파이 밖(Google Drive, NAS 등)에도 보관하세요. `rclone`을 설치하고 cron에 `rclone copy /opt/sprout-english/server/data/backups remote:sprout-backups` 를 추가하면 자동으로 올라가요.

## 7. 문제 해결

| 증상 | 확인할 것 |
|---|---|
| 사이트가 안 열려요 (A) | DNS A 레코드가 공인 IP와 같은지 (`nslookup 도메인`), 공유기 포트포워딩, `sudo journalctl -u caddy -n 50` |
| 사이트가 안 열려요 (B) | `sudo systemctl status cloudflared`, Cloudflare 대시보드의 터널 상태(Healthy) |
| 502 오류 | 새싹영어 서버가 꺼졌을 수 있어요: `sudo systemctl status sprout-english`, 로그 확인 |
| 인증 메일이 안 와요 | 서버 로그의 `[메일]` 줄, SMTP 아이디·앱 비밀번호, 스팸함 |
| SNS 로그인 후 오류 | 로그인 화면의 빨간 안내 문구, 콘솔에 등록한 Redirect URI가 `https://도메인/api/auth/<서비스>/callback` 과 똑같은지, `.env`의 `PUBLIC_URL` |
| 서버가 안 켜져요 | `SESSION_SECRET`이 32자 이상인지 (운영 모드 필수), `node -v`가 22.13 이상인지 |

## 8. 구조 요약

```
인터넷 ──HTTPS──▶ Caddy(:443) 또는 Cloudflare Tunnel ──▶ 새싹영어 서버(127.0.0.1:8080, systemd)
                                                         ├─ public/  화면(HTML·CSS·JS)
                                                         ├─ /api/*   로그인·결제·관리자·학습 기록 동기화
                                                         └─ data/sprout.db (SQLite) + data/backups/
```

| 영역 | 동작 |
|---|---|
| AI 음성 | `public/audio` 파일을 먼저 사용. 없는 문장만 한 번 생성해 디스크에 저장, 새로 만드는 요청은 로그인한 사용자만 사용자당 시간당 120회·전체 시간당 300회, 영어 문장만 허용 |
| 탈퇴 | 계정·학습 기록은 즉시 삭제, 끝난 결제 기록만 `payment_records`에 계정과 떼어 5년 보관 후 삭제 |
| 음성 인식(STT) | 로그인한 사용자만, 사용자당 시간당 400회, 16kHz WAV 15초 이하만 받음, 녹음은 저장하지 않음 |
| 로그인 | 비밀번호 없음. 이메일 6자리 코드(3분 유효, 5회 제한, 30초 재전송 제한) 또는 SNS(OAuth) |
| 세션 | 60일, HttpOnly·Secure 쿠키. DB에는 해시만 저장 |
| 보안 | 상태 변경 요청에 전용 헤더 필수(CSRF 방지), IP·이메일별 요청 제한, CSP·HSTS 등 보안 헤더 |
| 결제 금액 | 항상 서버가 계산해요 (화면 값은 표시용) |
