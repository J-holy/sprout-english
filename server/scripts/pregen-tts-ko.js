// 새싹수학 개념 레슨의 한국어 문장을 구글 AI 음성(ko-KR)으로 미리 만든다 → public/audio/ko/*.mp3 + manifest.json
//   node scripts/pregen-tts-ko.js [--dry]     .env 의 GOOGLE_TTS_API_KEY 사용, 이미 만든 문장은 건너뛴다
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { config } from '../lib/env.js';

// 2026-11-26: Neural2-A → Chirp3-HD-Aoede (더 자연스럽고, 읽는 속도는 비슷하다)
const VOICE = process.env.GOOGLE_TTS_VOICE_KO || 'ko-KR-Chirp3-HD-Aoede';
// 해 보기를 다 마쳤을 때 칭찬하는 말은 아이들이 좋아할 밝은 목소리로 (2026-11-27 사용자가 후보 6개 중 Zephyr를 골랐다)
const CHEER_VOICE = 'ko-KR-Chirp3-HD-Zephyr';
const CHEER = new Set(['미션을 모두 해냈어요! 이제 마음대로 해 봐요.']);
const voiceOf = t => CHEER.has(t) ? CHEER_VOICE : VOICE;
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
// 🤲 해 보기: 미션 문장(text·say)과 칭찬 한 줄(api.done·win·ok의 && '…') 중 글자가 정해진 것 (수가 바뀌어 들어가는 문장은 기기 목소리)
for (const f of fs.readdirSync(path.join(config.publicDir, 'js')).filter(f => /^math-(acts\d*|more)\.js$/.test(f))) {
  const src = fs.readFileSync(path.join(config.publicDir, 'js', f), 'utf8');
  for (const m of src.matchAll(/(?:\b(?:text|say|win): |api\.done\((?:`[^`]*`, )?|KoSpeech\.say\(|&& )'((?:[^'\\]|\\.)*[가-힣](?:[^'\\]|\\.)*)'/g)) texts.add(m[1].replace(/\\'/g, "'"));
}
// 하나~열다섯: 한 번에 이어 센 소리에서 잘라 쓴다 (낱말 하나씩 만들면 높낮이가 제각각이고 앞에 무음이 붙는다)
const COUNT_WORDS = ['하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열하나', '열둘', '열셋', '열넷', '열다섯'];
// 읽기용 문장: 화면 글자는 그대로 두고, 목소리에 보낼 때만 숫자·기호를 읽는 말로 바꾼다
//   (14개 → 열네 개, 4×4 → 사 곱하기 사, 8 + 5 → 8 더하기 5(플러스로 읽지 않게), 괄호 → 쉼, 로마 숫자 I·V·X → 아이·브이·엑스)
const NAT1 = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'], NAT10 = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
const native = n => n === 0 ? '영' : n === 20 ? '스무' : n < 100 ? NAT10[Math.floor(n / 10)] + NAT1[n % 10] : String(n);
const SINO = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const sino = n => n < 10 ? SINO[n] : n < 100 ? (n >= 20 ? SINO[Math.floor(n / 10)] : '') + '십' + (n % 10 ? SINO[n % 10] : '') : String(n);
const COUNTER = '개|명|마리|칸|줄|쌍|가지|해|송이|번째|번|살|층|접시|조각|권|장|켤레';
// 받침에 맞는 조사 (괄호 안 말 뒤에 붙일 때)
const josa = (w, j) => { const c = w.charCodeAt(w.length - 1) - 0xac00, has = c >= 0 && c % 28 > 0, rieul = c % 28 === 8;
  const pair = { 과: ['과', '와'], 와: ['과', '와'], 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'] }[j];
  if (pair) return has ? pair[0] : pair[1];
  return has && !rieul ? '으로' : '로'; };
// 규칙으로 안 되는 곳은 직접 고친다 [화면 글자, 읽는 말]
const SAY_FIX = [['4, 8, 12, 16해째', '네 해째, 여덟 해째, 열두 해째, 열여섯 해째']];
const speak = t => SAY_FIX.reduce((a, [f, r]) => a.split(f).join(r), t)
  .replace(/(\d+)\.(\d+)/g, (_, i, d) => `${sino(+i)} 점 ${[...d].map(c => SINO[+c]).join(' ')}`)
  .replace(new RegExp(`(\\d+)\\s*(${COUNTER})(?![가-힣]*(?:기|하기))`, 'g'), (_, n, c) => `${native(+n)} ${c}`)
  .replace(/\s*×\s*/g, ' 곱하기 ')
  .replace(/\s*\+\s*/g, ' 더하기 ')
  .replace(/\s*\(([^)]+)\)(과|와|으로|로|은|는|이|가|을|를)?/g, (_, b, j) => `, 그러니까 ${b}${j ? josa(b, j) : ','}`)
  .replace(/(^|[^A-Za-z])I(?![A-Za-z])/g, '$1아이').replace(/(^|[^A-Za-z])V(?![A-Za-z])/g, '$1브이').replace(/(^|[^A-Za-z])X(?![A-Za-z])/g, '$1엑스');
const manPath = path.join(dir, 'manifest.json');
const man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : {};
// 파일 이름에 목소리가 들어가므로, 목소리를 바꾸면 이름이 달라진 문장은 다시 만든다
// 2026-11-27: 속도 0.9 → 1.0 (0.9에서는 낱말이 늘어지고 짧은 말이 빠지거나 문장 사이가 1초 넘게 쉬었다)
const RATE = 1.0;
const fname = t => crypto.createHash('sha256').update(voiceOf(t) + '|' + RATE + '|' + speak(t)).digest('hex').slice(0, 16) + '.m4a';
const todo = [...texts].filter(t => !COUNT_WORDS.includes(t)).filter(t => man[t] !== fname(t) || !fs.existsSync(path.join(dir, man[t])));
console.log(`문장 ${texts.size}개 중 만들 것 ${todo.length}개 (목소리 ${VOICE})`);
if (process.argv.includes('--show')) for (const t of texts) if (speak(t) !== t) console.log(t, '\n  →', speak(t));
if (process.argv.includes('--dry')) process.exit(0);
const synth = async (text, markup = false, voice = VOICE) => {
  const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(process.env.GOOGLE_TTS_API_KEY)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ input: markup ? { markup: text } : { text }, voice: { languageCode: 'ko-KR', name: voice }, audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000, speakingRate: RATE, volumeGainDb: 8 } }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status} ${(j.error && j.error.message || '').slice(0, 120)}`);
  return Buffer.from(j.audioContent, 'base64'); // WAV (24kHz 16bit mono)
};
// WAV → 소리 구간: 20ms 창의 크기가 기준보다 큰 곳
const pcm = wav => { const d = wav.indexOf(Buffer.from('data')); return new Int16Array(wav.buffer.slice(wav.byteOffset + d + 8, wav.byteOffset + wav.length - ((wav.length - d - 8) % 2))); };
const loud = (a, sr = 24000, win = 480, th = 700) => Array.from({ length: Math.floor(a.length / win) }, (_, i) => { let s = 0; for (let k = i * win; k < (i + 1) * win; k++) s += a[k] * a[k]; return Math.sqrt(s / win) > th; });
const toWav = (a, sr = 24000) => { const b = Buffer.alloc(44 + a.length * 2); b.write('RIFF', 0); b.writeUInt32LE(36 + a.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(a.length * 2, 40); Buffer.from(a.buffer, a.byteOffset, a.length * 2).copy(b, 44); return b; };
// 앞은 0.05초, 뒤는 0.15초만 남기고 무음을 잘라 m4a(AAC)로 저장한다
const save = (a, f) => {
  const L = loud(a), first = L.indexOf(true), last = L.lastIndexOf(true);
  const s0 = first < 0 ? 0 : Math.max(0, first * 480 - 1200), s1 = last < 0 ? a.length : Math.min(a.length, (last + 1) * 480 + 3600);
  const tmp = path.join(dir, f + '.wav'); fs.writeFileSync(tmp, toWav(a.subarray(s0, s1)));
  execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', tmp, path.join(dir, f)]); fs.unlinkSync(tmp);
};
for (const t of todo) {
  try { save(pcm(await synth(speak(t), false, voiceOf(t))), fname(t)); man[t] = fname(t); }
  catch (err) { console.log('실패', t, err.message); }
}
// 세는 낱말: '하나, 둘, … 열다섯.'을 한 번에 읽힌 뒤 쉼(0.12초 넘는 무음)마다 잘라 낱말 하나씩 저장한다
const cntName = w => 'cnt-' + crypto.createHash('sha256').update(VOICE + '|' + RATE + '|pause2|' + COUNT_WORDS.join(',')).digest('hex').slice(0, 8) + '-' + COUNT_WORDS.indexOf(w) + '.m4a';
if (COUNT_WORDS.some(w => man[w] !== cntName(w) || !fs.existsSync(path.join(dir, man[w])))) {
  // 소리 사이의 조용한 구간 중 가장 긴 14곳(낱말 수 − 1)에서 자른다
  // 낱말 사이에 긴 쉼([pause long])을 넣어 읽혀야 쉼표만 쓸 때처럼 낱말이 붙거나 한 낱말 안에서 갈라지지 않는다
  const a = pcm(await synth(COUNT_WORDS.join(', [pause long] ') + '.', true)), L = loud(a, 24000, 240, 600), gaps = [];
  // 0.06초보다 짧은 소리(숨소리·잡음)는 조용한 것으로 본다
  for (let i = 0; i < L.length;) { if (!L[i]) { i++; continue; } let j = i; while (j < L.length && L[j]) j++; if (j - i < 6) for (let k = i; k < j; k++) L[k] = false; i = j; }
  const first = L.indexOf(true), last = L.lastIndexOf(true);
  for (let i = first, st = -1; i <= last; i++) { if (!L[i]) { if (st < 0) st = i; } else if (st >= 0) { gaps.push([st, i]); st = -1; } }
  const cut = gaps.sort((x, y) => (y[1] - y[0]) - (x[1] - x[0])).slice(0, COUNT_WORDS.length - 1).sort((x, y) => x[0] - y[0]);
  const segs = [];
  if (cut.length === COUNT_WORDS.length - 1) { let s0 = first; for (const [g0, g1] of cut) { segs.push([s0, g0]); s0 = g1; } segs.push([s0, last + 1]); }
  if (segs.length !== COUNT_WORDS.length) console.log(`세는 낱말을 ${COUNT_WORDS.length}개로 자르지 못했어요 (${segs.length}개). 낱말 소리는 그대로 둬요.`);
  else segs.forEach(([x, y], k) => { const w = COUNT_WORDS[k]; save(a.subarray(Math.max(0, x * 240 - 1200), Math.min(a.length, y * 240 + 2400)), cntName(w)); man[w] = cntName(w); });
}
// 지금 레슨에 없는 문장은 목록에서 뺀다
for (const k of Object.keys(man)) if (!texts.has(k)) delete man[k];
fs.writeFileSync(manPath, JSON.stringify(man, null, 0));
// 목록에 없는 예전 음성 파일(다른 목소리·지운 문장)은 지운다 — 이 폴더는 이 스크립트가 만든 mp3만 둔다
const keep = new Set(Object.values(man));
const old = fs.readdirSync(dir).filter(f => /^([0-9a-f]{16}\.(mp3|m4a)|cnt-[0-9a-f]{8}-\d+\.m4a)$/.test(f) && !keep.has(f));
for (const f of old) fs.unlinkSync(path.join(dir, f));
if (old.length) console.log('예전 파일 지움', old.length);
console.log('끝', Object.keys(man).length);
