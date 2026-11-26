// 새싹수학 개념 레슨의 한국어 문장을 구글 AI 음성(ko-KR)으로 미리 만든다 → public/audio/ko/*.mp3 + manifest.json
//   node scripts/pregen-tts-ko.js [--dry]     .env 의 GOOGLE_TTS_API_KEY 사용, 이미 만든 문장은 건너뛴다
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { config } from '../lib/env.js';

const VOICE = process.env.GOOGLE_TTS_VOICE_KO || 'ko-KR-Neural2-A';
const dir = path.join(config.publicDir, 'audio', 'ko');
fs.mkdirSync(dir, { recursive: true });
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(config.publicDir, 'js', 'math-lessons.js'), 'utf8').replace(/^const (\w+)/gm, 'var $1'), ctx);
const texts = new Set();
for (const L of ctx.MATH_LESSONS) for (const s of L.steps) { if (s.text) texts.add(s.text); if (s.say) texts.add(s.say); }
const manPath = path.join(dir, 'manifest.json');
const man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : {};
const todo = [...texts].filter(t => !man[t] || !fs.existsSync(path.join(dir, man[t])));
console.log(`문장 ${texts.size}개 중 만들 것 ${todo.length}개 (목소리 ${VOICE})`);
if (process.argv.includes('--dry')) process.exit(0);
for (const t of todo) {
  const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(process.env.GOOGLE_TTS_API_KEY)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ input: { text: t }, voice: { languageCode: 'ko-KR', name: VOICE }, audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9, volumeGainDb: 8 } }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { console.log('실패', t, r.status, (j.error && j.error.message || '').slice(0, 120)); continue; }
  const f = crypto.createHash('sha256').update(VOICE + '|' + t).digest('hex').slice(0, 16) + '.mp3';
  fs.writeFileSync(path.join(dir, f), Buffer.from(j.audioContent, 'base64')); man[t] = f;
}
// 지금 레슨에 없는 문장은 목록에서 뺀다
for (const k of Object.keys(man)) if (!texts.has(k)) delete man[k];
fs.writeFileSync(manPath, JSON.stringify(man, null, 0));
console.log('끝', Object.keys(man).length);
