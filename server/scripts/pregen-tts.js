// 학습 콘텐츠의 모든 문장을 AI 음성으로 미리 만들어 둔다. 처음 듣는 문장도 바로 재생되고, 이후 요금이 들지 않는다.
//   npm run pregen-tts -- --dry                 문장 수와 글자 수(예상 비용)만 보기
//   npm run pregen-tts                          서버 캐시(data/tts)에 만들기 — 라즈베리파이 운영용
//   npm run pregen-tts -- --static ../public/audio   GitHub Pages처럼 서버 없는 사이트용 파일 + manifest.json 만들기
// .env 에 OPENAI_API_KEY 또는 GOOGLE_TTS_API_KEY 가 있어야 해요.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { config } from '../lib/env.js';
import { ttsProvider, cleanText, validText, getSpeech, audioTag } from '../lib/tts.js';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const staticDir = args.includes('--static') ? path.resolve(args[args.indexOf('--static') + 1] || '../public/audio') : null;

// 화면 코드와 같은 콘텐츠 파일을 읽는다
const ctx = {}; vm.createContext(ctx);
for (const f of ['content.js', 'data.js', 'generator.js', 'lesson.js']) vm.runInContext(fs.readFileSync(path.join(config.publicDir, 'js', f), 'utf8').replace(/^const (\w+)/gm, 'var $1'), ctx);
const { LETTERS, PHONICS, SENTENCES, QA, VERBS, STORIES, speechText, storyChunks, chunkSay, storyWord, Gen, ALL_LEVELS } = ctx;

const texts = new Set();
// 화면과 같은 방식으로 바꾼 문장(알파벳은 이름 발음)으로 만든다
const add = t => { t = cleanText(speechText(t)); if (validText(t)) texts.add(t); };
for (const L of LETTERS) {
  add(L.letter);
  for (const [w] of L.words) { add(w); add(L.ending ? `${w} ends with ${L.letter}` : `${L.letter} is for ${w}`); add(w.split('').join(', ') + '. ' + w); }
}
for (const [en] of Object.values(PHONICS).flat()) add(en);
for (const [en] of Object.values(SENTENCES).flat()) add(en);
for (const [q, a] of Object.values(QA).flat()) { add(q); add(a); add(`${q} ${a}`); add(a.split(/\s+/).join(' ')); }
// 자동 생성 문장
for (const it of ALL_LEVELS.flatMap(lv => Gen.levelItems(lv)).filter(x => x.gen)) { if (it.en) add(it.en); else { add(it.q); add(it.a); add(`${it.q} ${it.a}`); } }
for (const [b, p] of VERBS) add(`${b}, ${p}`);
// 스토리북: 문장 전체, '천천히' 마디, 한 단어씩
for (const s of STORIES) for (const [t] of s.pages) { add(t); storyChunks(t).forEach(g => add(chunkSay(t, g))); t.split(' ').forEach(w => add(storyWord(t, w))); }
['Hello!', 'Hello! Can you hear me?', 'Hello! A is for apple. I like to read books with you.', 'Listen!', 'Play!', 'Speak!', 'Read!'].forEach(add);

const list = [...texts];
if (args.includes('--print')) { console.log(list.join('\n')); process.exit(0); }
const chars = list.reduce((n, t) => n + t.length, 0);
console.log(`문장 ${list.length}개 · ${chars.toLocaleString()}자 (천천히 버전 포함 서버 캐시는 약 2배)`);
console.log('예상 비용: OpenAI는 1달러 안팎 (요금제에 따라 다름) · Google Neural2는 월 100만 자 무료 범위 안');
if (dry && staticDir) {
  // 정적 파일에 아직 없는 문장 (내용을 고친 뒤 음성을 다시 만들어야 하는지 보기)
  let man = {}; try { man = JSON.parse(fs.readFileSync(path.join(staticDir, 'manifest.json'), 'utf8')); } catch (e) { /* 없음 */ }
  const have = man.files || {};
  // 발음 고침(audioTag)이 바뀐 문장도 다시 만들어야 한다. 키 없이 확인할 때는 지난번 공급자로 가정한다
  if (!ttsProvider() && man.provider === 'google') process.env.GOOGLE_TTS_API_KEY = 'dry-check';
  const nameFor = t => crypto.createHash('sha1').update(t + audioTag(t)).digest('hex').slice(0, 16);
  const missing = list.filter(t => !have[t] || !have[t].startsWith(nameFor(t)));
  console.log(`정적 음성이 없는 문장 ${missing.length}개${missing.length ? ': ' + missing.slice(0, 15).map(t => `"${t}"`).join(', ') + (missing.length > 15 ? ' …' : '') : ''}`);
}
if (dry) process.exit(0);
if (!ttsProvider()) { console.error('AI 음성 키가 없어요. .env 에 OPENAI_API_KEY 또는 GOOGLE_TTS_API_KEY 를 넣어 주세요.'); process.exit(1); }

let done = 0, fail = 0, badKey = false;
const manifest = {};
if (staticDir) fs.mkdirSync(staticDir, { recursive: true });
// 이전 manifest: 이번에 실패한 문장은 예전 음성을 그대로 쓴다 (키 오류 등으로 소리가 사라지지 않게)
let old = {};
try { old = JSON.parse(fs.readFileSync(path.join(staticDir || '.', 'manifest.json'), 'utf8')).files || {}; } catch (e) { /* 처음 */ }
const work = [...list.map(t => [t, false]), ...(staticDir ? [] : list.map(t => [t, true]))];
async function worker() {
  while (work.length) {
    const [t, slow] = work.shift();
    try {
      const { file } = await getSpeech(t, slow);
      if (staticDir) {
        const name = crypto.createHash('sha1').update(t + audioTag(t)).digest('hex').slice(0, 16) + path.extname(file);
        fs.copyFileSync(file, path.join(staticDir, name)); manifest[t] = name;
      }
      done++;
    } catch (err) {
      fail++; if (/key not valid|API_KEY_INVALID|401|403/i.test(err.message)) badKey = true;
      console.error(`실패: "${t}" — ${err.message}`);
      if (staticDir && old[t] && fs.existsSync(path.join(staticDir, old[t]))) manifest[t] = old[t];
    }
    if ((done + fail) % 50 === 0) console.log(`  ${done + fail} / ${work.length + done + fail}`);
  }
}
await Promise.all([worker(), worker(), worker()]);
if (staticDir) {
  fs.writeFileSync(path.join(staticDir, 'manifest.json'), JSON.stringify({ provider: ttsProvider(), created: new Date().toISOString(), files: manifest }));
  // 이제 쓰지 않는 옛 음성 파일 정리
  // 바로 앞 목록의 파일은 남겨 둔다: 브라우저에 남은 옛 목록(최대 10분 캐시)이 지운 파일을 찾아 소리가 안 나는 일이 없게
  const used = new Set([...Object.values(manifest), ...Object.values(old)]); let removed = 0;
  for (const f of fs.readdirSync(staticDir)) if (/\.(mp3|wav)$/.test(f) && !used.has(f)) { fs.unlinkSync(path.join(staticDir, f)); removed++; }
  console.log(`정적 파일 ${Object.keys(manifest).length}개와 manifest.json 을 ${staticDir} 에 만들었어요.${removed ? ` (안 쓰는 옛 파일 ${removed}개 정리)` : ''}`);
}
if (badKey) console.error('⚠️ API 키가 올바르지 않아요. 명령의 "여기에_키" 자리에 실제 키(AIza…)를 넣었는지 확인해 주세요. 실패한 문장은 예전 음성을 그대로 써요.');
console.log(`완료 ${done}개 · 실패 ${fail}개`);
