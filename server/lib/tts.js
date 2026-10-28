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
// 관사 발음 바로잡기: AI 음성은 짧은 마디나 단어 하나만 읽을 때 the를 '디', a를 '에이'로 강하게 읽는다.
// 알파벳 이름은 화면의 speechText()가 이미 'ay' 등으로 바꿔 두므로, 여기까지 남은 a/the는 모두 관사다.
// Google 음성에 SSML 발음 기호로 the는 '더'(모음 소리 앞은 '디'), a는 '어'로 읽게 한다.
const ARTICLE_FIX = 'art2'; // 바꾸면 해당 문장 음성을 다시 만든다
export const hasArticle = t => /(^|\s)(a|the)([.,!?]*)(\s|$)/i.test(t);
const vowelSound = w => /^(hour|honest)/i.test(w) || /^(a|e|i|o|u(?!ni|se|su|ro|ke|fo))/i.test(w);
const xml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
export function articleSsml(text) {
  const ws = text.split(' ');
  return '<speak>' + ws.map((w, i) => {
    const m = w.match(/^(a|the)([.,!?]*)$/i);
    if (!m) return xml(w);
    const ph = m[1].toLowerCase() === 'a' ? 'ə' : vowelSound(ws[i + 1] || '') ? 'ði' : 'ðə';
    return `<phoneme alphabet="ipa" ph="${ph}">${m[1]}</phoneme>${xml(m[2])}`;
  }).join(' ') + '</speak>';
}
const fixed = text => ttsProvider() === 'google' && hasArticle(text);
// 미리 만든 정적 파일 이름에도 쓴다 (발음을 고친 파일은 이름이 바뀌어 브라우저에 남은 옛 소리를 쓰지 않게)
export const audioTag = text => (fixed(text) ? '|' + ARTICLE_FIX : '');
export const cacheFile = (text, slow) => {
  const h = crypto.createHash('sha256').update(`${ttsProvider()}|${voiceId()}|${slow ? 'slow' : 'normal'}|${text}${audioTag(text)}`).digest('hex').slice(0, 32);
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
    body: JSON.stringify({ input: hasArticle(text) ? { ssml: articleSsml(text) } : { text }, voice: { languageCode: voiceId().slice(0, 5), name: voiceId() }, audioConfig: { audioEncoding: 'MP3', speakingRate: slow ? 0.7 : 0.92 } }),
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
