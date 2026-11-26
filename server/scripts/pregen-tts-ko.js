// 새싹수학 개념 레슨의 한국어 문장을 구글 AI 음성(ko-KR)으로 미리 만든다 → public/audio/ko/*.mp3 + manifest.json
//   node scripts/pregen-tts-ko.js [--dry]     .env 의 GOOGLE_TTS_API_KEY 사용, 이미 만든 문장은 건너뛴다
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { config } from '../lib/env.js';

// 2026-11-26: Neural2-A → Chirp3-HD-Aoede (더 자연스럽고, 읽는 속도는 비슷하다)
const VOICE = process.env.GOOGLE_TTS_VOICE_KO || 'ko-KR-Chirp3-HD-Aoede';
const dir = path.join(config.publicDir, 'audio', 'ko');
fs.mkdirSync(dir, { recursive: true });
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(config.publicDir, 'js', 'math-lessons.js'), 'utf8').replace(/^const (\w+)/gm, 'var $1'), ctx);
const texts = new Set();
for (const L of ctx.MATH_LESSONS) for (const s of L.steps) { if (s.text) texts.add(s.text); if (s.say) texts.add(s.say); }
// 수학 이야기 · 힌트 · 씨앗 문제와 조작 놀이에서 읽어 주는 말
for (const st of Object.values(ctx.MATH_STORIES || {})) for (const pg of st.pages) texts.add(pg.text);
for (const h of Object.values(ctx.MATH_HINTS || {})) texts.add(h);
for (const v of ctx.MATH_VOICE || []) texts.add(v);
const manPath = path.join(dir, 'manifest.json');
const man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : {};
// 파일 이름에 목소리가 들어가므로, 목소리를 바꾸면 이름이 달라진 문장은 다시 만든다
const fname = t => crypto.createHash('sha256').update(VOICE + '|' + t).digest('hex').slice(0, 16) + '.mp3';
const todo = [...texts].filter(t => man[t] !== fname(t) || !fs.existsSync(path.join(dir, man[t])));
console.log(`문장 ${texts.size}개 중 만들 것 ${todo.length}개 (목소리 ${VOICE})`);
if (process.argv.includes('--dry')) process.exit(0);
for (const t of todo) {
  const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(process.env.GOOGLE_TTS_API_KEY)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ input: { text: t }, voice: { languageCode: 'ko-KR', name: VOICE }, audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9, volumeGainDb: 8 } }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { console.log('실패', t, r.status, (j.error && j.error.message || '').slice(0, 120)); continue; }
  const f = fname(t);
  fs.writeFileSync(path.join(dir, f), Buffer.from(j.audioContent, 'base64')); man[t] = f;
}
// 지금 레슨에 없는 문장은 목록에서 뺀다
for (const k of Object.keys(man)) if (!texts.has(k)) delete man[k];
fs.writeFileSync(manPath, JSON.stringify(man, null, 0));
// 목록에 없는 예전 음성 파일(다른 목소리·지운 문장)은 지운다 — 이 폴더는 이 스크립트가 만든 mp3만 둔다
const keep = new Set(Object.values(man));
const old = fs.readdirSync(dir).filter(f => /^[0-9a-f]{16}\.mp3$/.test(f) && !keep.has(f));
for (const f of old) fs.unlinkSync(path.join(dir, f));
if (old.length) console.log('예전 파일 지움', old.length);
console.log('끝', Object.keys(man).length);
