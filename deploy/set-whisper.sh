#!/usr/bin/env bash
# 말하기 채점용 음성 인식을 서버 안의 Whisper로 켠다: 실행 파일과 모델을 /opt/whisper에 넣고, 시험한 뒤 서버를 다시 시작한다
# 사용법: sudo bash deploy/set-whisper.sh   (먼저 ~/whisper-test/whisper.cpp에 build-static과 모델이 있어야 해요)
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "sudo로 실행해 주세요."; exit 1; }
APP=/opt/sprout-english; ENV_FILE="$APP/server/.env"; DEST=/opt/whisper
SRC="/home/${SUDO_USER:-nextcode}/whisper-test/whisper.cpp"
BIN="$SRC/build-static/bin/whisper-cli"; MODEL="$SRC/models/ggml-tiny.en.bin"
[[ -f "$ENV_FILE" ]] || { echo "$ENV_FILE 이 없어요. 먼저 install-pi.sh를 실행해 주세요."; exit 1; }
[[ -x "$BIN" && -s "$MODEL" ]] || { echo "$BIN 또는 $MODEL 이 없어요. deploy/DEPLOY.md의 Whisper 안내를 봐 주세요."; exit 1; }

install -d -m 755 "$DEST"
install -m 755 "$BIN" "$DEST/whisper-cli"
install -m 644 "$MODEL" "$DEST/ggml-tiny.en.bin"

ENV_FILE="$ENV_FILE" DEST="$DEST" node -e '
const fs = require("fs"), f = process.env.ENV_FILE, d = process.env.DEST;
const lines = fs.readFileSync(f, "utf8").split("\n");
for (const [k, v] of [["STT_PROVIDER", "whisper"], ["WHISPER_BIN", d + "/whisper-cli"], ["WHISPER_MODEL", d + "/ggml-tiny.en.bin"], ["WHISPER_THREADS", "2"], ["WHISPER_AUDIO_CTX", "512"]]) {
  const i = lines.findIndex(l => l.startsWith(k + "="));
  if (i >= 0) lines[i] = k + "=" + v; else lines.push(k + "=" + v);
}
fs.writeFileSync(f + ".new", lines.join("\n"), { mode: 0o600 });
fs.renameSync(f + ".new", f);
'
chown sprout:sprout "$ENV_FILE"; chmod 600 "$ENV_FILE"

echo "▶ 음성 인식 시험"
if ! sudo -u sprout -H bash -c 'cd "$1/server" && NODE_ENV=production node scripts/test-stt.js' _ "$APP"; then
  echo "시험에 실패했어요. 서버는 다시 시작하지 않았어요. 위 메시지를 알려 주세요."
  exit 1
fi

echo "▶ 서버 다시 시작"
install -m 644 "$APP/deploy/sprout-english.service" /etc/systemd/system/sprout-english.service
systemctl daemon-reload
systemctl restart sprout-english
sleep 3
curl -fsS http://127.0.0.1:8080/api/health >/dev/null && echo "서버 정상. 이제 아이패드 Chrome에서 로그인하면 말하기 점수를 받을 수 있어요."
