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
import { ttsProvider, cleanText, validText, getSpeech } from '../lib/tts.js';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const staticDir = args.includes('--static') ? path.resolve(args[args.indexOf('--static') + 1] || '../public/audio') : null;

// 화면 코드와 같은 콘텐츠 파일을 읽는다
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(config.publicDir, 'js/content.js'), 'utf8').replace(/^const (\w+)/gm, 'var $1'), ctx);
const { LETTERS, PHONICS, SENTENCES, QA, VERBS, STORIES, speechText } = ctx;

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
for (const [b, p] of VERBS) add(`${b}, ${p}`);
for (const s of STORIES) for (const [t] of s.pages) { add(t); t.split(' ').forEach(w => add(w.replace(/[.,!?]/g, ''))); }
['Hello!', 'Hello! Can you hear me?', 'Hello! A is for apple. I like to read books with you.', 'Listen!', 'Play!', 'Speak!', 'Read!'].forEach(add);

const list = [...texts];
const chars = list.reduce((n, t) => n + t.length, 0);
console.log(`문장 ${list.length}개 · ${chars.toLocaleString()}자 (천천히 버전 포함 서버 캐시는 약 2배)`);
console.log('예상 비용: OpenAI는 1달러 안팎 (요금제에 따라 다름) · Google Neural2는 월 100만 자 무료 범위 안');
if (dry) process.exit(0);
if (!ttsProvider()) { console.error('AI 음성 키가 없어요. .env 에 OPENAI_API_KEY 또는 GOOGLE_TTS_API_KEY 를 넣어 주세요.'); process.exit(1); }

let done = 0, fail = 0;
const manifest = {};
if (staticDir) fs.mkdirSync(staticDir, { recursive: true });
const work = [...list.map(t => [t, false]), ...(staticDir ? [] : list.map(t => [t, true]))];
async function worker() {
  while (work.length) {
    const [t, slow] = work.shift();
    try {
      const { file } = await getSpeech(t, slow);
      if (staticDir) {
        const name = crypto.createHash('sha1').update(t).digest('hex').slice(0, 16) + path.extname(file);
        fs.copyFileSync(file, path.join(staticDir, name)); manifest[t] = name;
      }
      done++;
    } catch (err) { fail++; console.error(`실패: "${t}" — ${err.message}`); }
    if ((done + fail) % 50 === 0) console.log(`  ${done + fail} / ${work.length + done + fail}`);
  }
}
await Promise.all([worker(), worker(), worker()]);
if (staticDir) {
  fs.writeFileSync(path.join(staticDir, 'manifest.json'), JSON.stringify({ provider: ttsProvider(), created: new Date().toISOString(), files: manifest }));
  console.log(`정적 파일 ${Object.keys(manifest).length}개와 manifest.json 을 ${staticDir} 에 만들었어요.`);
}
console.log(`완료 ${done}개 · 실패 ${fail}개`);
