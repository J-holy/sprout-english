// AI 음성 (신경망 TTS): 문장마다 한 번만 만들어 data/tts/ 에 저장하고, 다음부터는 저장된 파일을 보낸다.
// 공급자: OpenAI (OPENAI_API_KEY) 또는 Google Cloud TTS (GOOGLE_TTS_API_KEY). 개발용 test 공급자는 삐 소리 WAV를 만든다.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from './env.js';

const e = process.env;
const DIR = path.join(config.dataDir, 'tts');
fs.mkdirSync(DIR, { recursive: true });

export const ttsProvider = () => {
  const p = (e.TTS_PROVIDER || '').toLowerCase();
  if (p === 'test') return 'test';
  if ((p === 'openai' || !p) && e.OPENAI_API_KEY) return 'openai';
  if ((p === 'google' || !p) && e.GOOGLE_TTS_API_KEY) return 'google';
  return null;
};
const voiceId = () => ({ openai: e.OPENAI_TTS_VOICE || 'nova', google: e.GOOGLE_TTS_VOICE || 'en-US-Neural2-F', test: 'beep' }[ttsProvider()]);
const ext = () => (ttsProvider() === 'test' ? 'wav' : 'mp3');

// 영어 학습 문장만 받는다 (요금 남용 방지)
export const cleanText = t => String(t || '').replace(/\s+/g, ' ').trim();
export const validText = t => t.length > 0 && t.length <= 300 && /^[A-Za-z0-9 .,!?'’\-:;"]+$/.test(t);
export const cacheFile = (text, slow) => {
  const h = crypto.createHash('sha256').update(`${ttsProvider()}|${voiceId()}|${slow ? 'slow' : 'normal'}|${text}`).digest('hex').slice(0, 32);
  return path.join(DIR, `${h}.${ext()}`);
};

async function synthOpenAI(text, slow) {
  const r = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST', signal: AbortSignal.timeout(30000),
    headers: { Authorization: `Bearer ${e.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: e.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts', voice: voiceId(), input: text, response_format: 'mp3',
      instructions: `You are a warm, cheerful English teacher reading to a young child (5-8 years old). Speak clearly with natural American pronunciation${slow ? ', slowly, with a short pause between words' : ' at a gentle, relaxed pace'}.`,
      speed: slow ? 0.75 : 0.95,
    }),
  });
  if (!r.ok) throw new Error(`OpenAI TTS ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return Buffer.from(await r.arrayBuffer());
}
async function synthGoogle(text, slow) {
  const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(e.GOOGLE_TTS_API_KEY)}`, {
    method: 'POST', signal: AbortSignal.timeout(30000), headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: { text }, voice: { languageCode: voiceId().slice(0, 5), name: voiceId() }, audioConfig: { audioEncoding: 'MP3', speakingRate: slow ? 0.7 : 0.92 } }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Google TTS ${r.status}: ${j.error?.message || ''}`.slice(0, 200));
  return Buffer.from(j.audioContent, 'base64');
}
// 개발용: 글자 수에 비례한 길이의 부드러운 삐 소리 WAV
function synthTest(text, slow) {
  const rate = 16000, secs = Math.min(8, 0.3 + text.length * (slow ? 0.09 : 0.06)), n = Math.floor(rate * secs);
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(i / rate * 2 * Math.PI * 440) * 3000 * Math.min(1, i / 800, (n - i) / 800)), 44 + i * 2);
  return b;
}

const inflight = new Map();
// 저장된 파일 경로를 돌려준다 (없으면 만들어서 저장)
export async function getSpeech(text, slow) {
  const file = cacheFile(text, slow);
  if (fs.existsSync(file)) return { file, cached: true };
  if (!inflight.has(file)) {
    inflight.set(file, (async () => {
      const p = ttsProvider();
      const buf = p === 'openai' ? await synthOpenAI(text, slow) : p === 'google' ? await synthGoogle(text, slow) : synthTest(text, slow);
      const tmp = file + '.tmp'; fs.writeFileSync(tmp, buf); fs.renameSync(tmp, file);
    })().finally(() => inflight.delete(file)));
  }
  await inflight.get(file);
  return { file, cached: false };
}
export const ttsStats = () => {
  const files = fs.readdirSync(DIR).filter(f => !f.endsWith('.tmp'));
  return { provider: ttsProvider(), voice: ttsProvider() ? voiceId() : null, files: files.length, sizeKB: Math.round(files.reduce((s, f) => s + fs.statSync(path.join(DIR, f)).size, 0) / 1024) };
};
