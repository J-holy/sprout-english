// 문제 그림과 스토리북 삽화를 같은 그림체로 미리 그려 public/img 에 넣는다.
// Cloudflare Workers AI 무료 사용량(하루 10,000 뉴런, 한국 시간 오전 9시 초기화) 안에서 그리고,
// 사용량을 다 쓰면 멈췄다가 다음 날 다시 실행하면 이어서 그린다. 무료 요금제 계정은 요금이 나가지 않는다.
//   npm run pregen-img -- --dry            그릴 그림 수와 예상 날짜만 보기
//   npm run pregen-img                     남은 그림 그리기 (단어 그림 먼저, 다음 스토리북)
//   npm run pregen-img -- --only w|s       단어 그림(w)이나 스토리북(s)만
//   npm run pregen-img -- --book 2         스토리북 한 권만 (시범용)
//   npm run pregen-img -- --redo 2-5,🍎    마음에 안 드는 그림만 다시 (스토리 '책-쪽', 단어는 이모지)
// .env 에 CF_ACCOUNT_ID 와 CF_AI_TOKEN(Workers AI 권한 토큰)이 있어야 해요.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { config } from '../lib/env.js';

const args = process.argv.slice(2);
const arg = k => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const dry = args.includes('--dry'), only = arg('--only'), book = arg('--book') && +arg('--book');
const redo = new Set((arg('--redo') || '').split(',').filter(Boolean));
const outDir = path.join(config.publicDir, 'img');
const refDir = path.join(config.dataDir || path.resolve('data'), 'img-ref');
const MODEL = '@cf/black-forest-labs/flux-2-klein-4b';
// 가로·세로 512px 칸 단위로 뉴런이 든다: 단어 384×384 = 1칸, 스토리 768×480 = 2칸, 주인공 기준 그림 448×448 = 1칸
const SIZE = { w: [384, 384], s: [768, 480], ref: [448, 448] };
const COST = { w: 27, s: 58, ref: 27 }; // 예상 뉴런 (출력 칸 26 + 기준 그림 입력 칸 5)

const STYLE = 'Children\'s picture book illustration, soft watercolor with colored pencil lines, warm gentle pastel colors, rounded friendly shapes, cute and kind, simple uncluttered composition, no text, no letters, no words, no numbers, no signs';

// 책마다 등장인물과 장소를 정해 두고, 주인공 기준 그림을 먼저 그려 모든 쪽에 같은 모습으로 나오게 한다
const BOOKS = {
  1: ['a cheerful 5-year-old girl with black pigtails in a red dress, her mom with a ponytail and green blouse, her dad with glasses and a blue sweater', 'a sunny city park with grass and big trees'],
  2: ['a big round fat orange tabby cat, a small gray rat wearing a little red hat', 'a cozy room with a mat and a cardboard box'],
  3: ['a 7-year-old boy with short black hair in a yellow T-shirt (the narrator), his kind mom with an apron, his tall dad, his 6-year-old sister in a pink dress, a baby brother, a grandma, a grandpa with a big straw hat, a small brown dog named Coco', 'a warm family home and garden'],
  4: ['Lily, a 7-year-old girl with long brown hair in a purple shirt, Sam, a 7-year-old boy with curly black hair in a green shirt, a soccer ball', 'a sunny neighborhood park'],
  5: ['a 6-year-old girl with a short black bob wearing yellow rain boots, a green raincoat and a red umbrella, her small white puppy, her mom', 'a house and a street on a rainy day'],
  6: ['a 7-year-old boy with short black hair in a striped shirt, his older sister with a ponytail, Max, a fluffy small brown dog with a red ball', 'inside a cozy house'],
  7: ['an 8-year-old girl with a black ponytail in a blue T-shirt, her mom with short hair, her dad with glasses', 'a zoo, then home and a park'],
  8: ['a group of cheerful kids imagining their future jobs: a boy pilot, a girl doctor, a boy chef, a boy firefighter, a girl artist', 'bright dreamy scenes of each job'],
  9: ['friendly cartoon animals marching in a parade with drums and trumpets', 'a festive parade road with flags'],
  10: ['Ben, a 6-year-old boy wearing a red cap, Tom, his friend with curly hair and a blue shirt, a big red bus', 'a bus ride to the zoo'],
  11: ['a 6-year-old boy with short black hair in an orange shirt, his big blue toy box with a red car, a brown teddy bear, a ball, a robot and a drum', 'a bright kid bedroom'],
  12: ['a 7-year-old girl with two buns in a yellow jacket holding a shopping bag, a friendly shopkeeper with a mustache and a green apron', 'a small neighborhood grocery store'],
  13: ['a 7-year-old boy with short black hair in a blue hoodie, his very tall dad with a beard, a big red kite with a long yellow and green tail', 'a high green hill on a windy day'],
  14: ['a family on a Sunday: a 7-year-old girl with a black bob, her dad, her friend Mina with pigtails, a happy small white dog', 'home, a park with trees, bikes'],
  15: ['a 7-year-old girl with long black hair in a pink jacket, a small fluffy cream puppy with a blue collar, her mom, another girl who owns the puppy', 'a park with benches, and a cozy home'],
  16: ['two kids in white space suits with round helmets, a girl with black hair and a boy with brown hair, a teddy bear, a red and white rocket', 'outer space, stars and the moon'],
  17: ['a 5-year-old boy with short black hair in a green shirt, his dad with glasses', 'a colorful toy shop'],
  18: ['a 5-year-old girl with a black bob in a yellow raincoat, her grandpa with white hair and a walking stick', 'a forest trail with flowers and a pond'],
  19: ['a red hen, a sly orange fox, ten eggs in a nest, fluffy yellow chicks', 'a farm hen pen and a fox den'],
  20: ['a pink pig, a white duck, Kim, a girl with a ponytail holding a garden hose', 'a muddy farmyard on a hot sunny day'],
  21: ['a 7-year-old boy with short black hair and a green school bag (the narrator), a nice teacher with long hair, his friend Jisu, a girl who loves drawing', 'a bright elementary school'],
  22: ['a 6-year-old girl with pigtails in overalls, a friendly farmer with a straw hat, a black and white cow, a pink pig, a white sheep, a brown horse, a yellow chick, goats', 'a green farm with a red barn and a red tractor'],
  23: ['a 7-year-old boy with short black hair in pajamas who has a cold, a kind doctor with glasses and a white coat', 'a clean doctor\'s office'],
  24: ['an 8-year-old girl with a black ponytail wearing a party hat, her friends, a toy robot, a pink and white birthday cake with candles', 'a home birthday party with balloons'],
  25: ['a 6-year-old girl with a short black bob in a green shirt, a small flower pot on a windowsill', 'a sunny windowsill at home'],
  26: ['a 7-year-old girl with black hair in a warm coat, red hat and blue gloves, her younger brother in a green coat, their mom', 'a snowy yard on a winter morning'],
  27: ['a 7-year-old girl with black pigtails, her dad reading, her mom working at a laptop, her sleeping older sister, Coco, a small brown dog', 'a home with a garden'],
  28: ['a 7-year-old girl with a black bob in a sun hat, her little brother, her dad with a beach umbrella, her mom reading, a little red crab', 'a sunny sandy beach by the blue sea'],
  29: ['an 8-year-old boy with short black hair in a red jacket, his dad with a beard, his mom with a ponytail', 'a campsite by a lake in the mountains'],
  30: ['an 8-year-old girl with long black hair in a yellow dress, her gentle grandma with gray hair and glasses', 'a country house with a big colorful garden'],
  31: ['an 8-year-old boy with short black hair and a backpack, his dad, his mom, his older sister with a ponytail', 'Jeju Island in Korea: sea, orange trees, mountains'],
  32: ['an 8-year-old boy with short black hair in an orange hoodie, Bolt, a friendly round white and blue robot with big round eyes, a small dog', 'a cozy future home'],
};

const ctx = {}; vm.createContext(ctx);
for (const f of ['content.js', 'data.js', 'generator.js', 'lesson.js']) vm.runInContext(fs.readFileSync(path.join(config.publicDir, 'js', f), 'utf8').replace(/^const (\w+)/gm, 'var $1'), ctx);
const { LETTERS, PHONICS, SENTENCES, STORIES, ALL_LEVELS, Gen, isLetterLine } = ctx;

// 할 일 목록 만들기
const jobs = [];
const hash = s => crypto.createHash('sha1').update(s).digest('hex');
// 숫자·기호처럼 그림보다 이모지가 나은 것은 그대로 둔다
const keepEmoji = e => /⃣|[❓⬆\u{1F7E5}\u{1F51F}\u{1F50A}]/u.test(e);
const words = new Map();
const addWord = (e, label, isWord) => { if (!e || keepEmoji(e) || e.includes(' ')) return; const w = words.get(e); if (!w || (isWord && !w.isWord)) words.set(e, { label, isWord }); };
for (const L of LETTERS) for (const [w, e] of L.words) addWord(e, w, true);
for (const [w, e] of Object.values(PHONICS).flat()) addWord(e, w, true);
for (const [en, , e] of Object.values(SENTENCES).flat()) addWord(e, en, false);
for (const it of ALL_LEVELS.flatMap(l => Gen.levelItems(l)).filter(x => x.gen)) addWord(it.emoji, it.en || it.q, false);
if (only !== 's' && !book) for (const [e, { label, isWord }] of words) {
  const prompt = `${STYLE}. A flash card picture: ${isWord ? `one ${label}, clearly showing the meaning of the English word "${label}"` : `a simple picture of: ${label}`}. One clear subject in the center, plain soft cream background.`;
  jobs.push({ kind: 'w', key: e, label, prompt, file: `w/${hash(e).slice(0, 12)}.jpg` });
}
const refs = {};
if (only !== 'w') for (const s of [...STORIES].sort((a, b) => a.id - b.id)) {
  if (book && s.id !== book) continue;
  const [cast, place] = BOOKS[s.id] || ['friendly characters', 'a bright place'];
  refs[s.id] = { prompt: `${STYLE}. Character reference sheet: ${cast}. Everyone standing side by side, full body, facing forward, plain white background.`, file: path.join(refDir, `${s.id}-${hash(cast).slice(0, 8)}.png`) };
  s.pages.forEach(([text], i) => {
    const letter = isLetterLine(text);
    const thing = letter && text.replace(/^[A-Z] is for | ends with [A-Z]\.?$/g, '').replace(/\.$/, '');
    const prev = i && !isLetterLine(s.pages[i - 1][0]) ? ` The story so far: "${s.pages[i - 1][0]}"` : '';
    const prompt = letter
      ? `${STYLE}. A page from the alphabet picture book "${s.title}": a big cute ${thing}, in ${place}.`
      : `${STYLE}. A page from the picture book "${s.title}". Characters: ${cast}. Setting: ${place}.${prev} Illustrate this moment: "${text}" Keep every character looking exactly like the reference image.`;
    jobs.push({ kind: 's', key: `${s.id}-${i}`, book: s.id, useRef: !letter, label: text, prompt, file: `s/${s.id}-${i}.jpg` });
  });
}

// 이미 그린 그림은 건너뛴다 (그림 설명이 바뀌었거나 --redo 로 고른 것만 다시)
const manPath = path.join(outDir, 'manifest.json');
let man = { w: {}, s: {}, h: {}, n: {} };
try { man = { ...man, ...JSON.parse(fs.readFileSync(manPath, 'utf8')) }; } catch (e) { /* 처음 */ }
const todo = jobs.filter(j => redo.has(j.key) || !man[j.kind][j.key] || man.h[j.kind + j.key] !== hash(j.prompt).slice(0, 10) || !fs.existsSync(path.join(outDir, man[j.kind][j.key])));
const needRefs = new Set(todo.filter(j => j.useRef && !fs.existsSync(refs[j.book].file)).map(j => j.book));
const neurons = todo.reduce((n, j) => n + COST[j.kind], 0) + needRefs.size * COST.ref;
console.log(`단어 그림 ${jobs.filter(j => j.kind === 'w').length}개 · 스토리 ${jobs.filter(j => j.kind === 's').length}쪽 중 그릴 것 ${todo.length}개`);
console.log(`예상 사용량 약 ${neurons.toLocaleString()} 뉴런 → 하루 무료 10,000 뉴런으로 약 ${Math.max(1, Math.ceil(neurons / 9500))}일`);
if (dry || !todo.length) process.exit(0);
const { CF_ACCOUNT_ID: account, CF_AI_TOKEN: token } = process.env;
if (!account || !token) { console.error('server/.env 에 CF_ACCOUNT_ID 와 CF_AI_TOKEN 을 넣어 주세요. (deploy/DEPLOY.md 4-4-2 참고)'); process.exit(1); }

class Quota extends Error {}
async function draw(prompt, [width, height], seed, ref) {
  const fd = new FormData();
  fd.append('prompt', prompt); fd.append('width', String(width)); fd.append('height', String(height)); fd.append('seed', String(seed));
  if (ref) fd.append('input_image_0', new Blob([fs.readFileSync(ref)], { type: 'image/png' }), 'ref.png');
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`, {
    method: 'POST', signal: AbortSignal.timeout(120000), headers: { Authorization: `Bearer ${token}` }, body: fd,
  });
  if (/^image\//.test(r.headers.get('content-type') || '')) return Buffer.from(await r.arrayBuffer());
  const j = await r.json().catch(() => ({}));
  const msg = (j.errors || []).map(x => `${x.code} ${x.message}`).join(' / ') || `HTTP ${r.status}`;
  if (r.status === 429 || /neuron|allocation|quota|4006/i.test(msg)) throw new Quota(msg);
  if (!r.ok || !j.result?.image) throw new Error(msg.slice(0, 200));
  return Buffer.from(j.result.image, 'base64');
}
// macOS면 sips로 가벼운 JPEG로 바꾼다 (없으면 받은 그대로)
function save(buf, file, jpeg = true) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
  if (!jpeg || isJpeg) return fs.writeFileSync(file, buf);
  const tmp = file + '.src'; fs.writeFileSync(tmp, buf);
  try { execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '78', tmp, '--out', file], { stdio: 'ignore' }); fs.unlinkSync(tmp); }
  catch (e) { fs.renameSync(tmp, file); }
}
const seedOf = j => parseInt(hash(j.key).slice(0, 7), 16) + (man.n[j.kind + j.key] || 0) * 7919;
const writeMan = () => fs.writeFileSync(manPath, JSON.stringify(man));

let done = 0, fail = 0, stopped = null;
for (const j of todo) if (redo.has(j.key)) man.n[j.kind + j.key] = (man.n[j.kind + j.key] || 0) + 1; // 다시 그릴 때는 다른 모습으로
const queue = [...todo];
async function worker() {
  while (queue.length && !stopped) {
    const j = queue.shift();
    try {
      let ref = null;
      if (j.useRef) {
        ref = refs[j.book].file;
        if (!fs.existsSync(ref)) { save(await draw(refs[j.book].prompt, SIZE.ref, j.book * 101, null), ref, false); console.log(`  주인공 기준 그림: ${j.book}권`); }
      }
      save(await draw(j.prompt, SIZE[j.kind], seedOf(j), ref), path.join(outDir, j.file));
      man[j.kind][j.key] = j.file; man.h[j.kind + j.key] = hash(j.prompt).slice(0, 10);
      if (++done % 10 === 0) { writeMan(); console.log(`  ${done} / ${todo.length}`); }
    } catch (err) {
      if (err instanceof Quota) { stopped = err.message; break; }
      fail++; console.error(`실패: ${j.key} "${j.label}" — ${err.message}`);
      if (/401|403|Authentication|10000/i.test(err.message)) { stopped = '토큰이나 계정 ID가 올바르지 않아요. CF_ACCOUNT_ID 와 CF_AI_TOKEN(Workers AI 권한)을 확인해 주세요.'; break; }
    }
  }
}
await Promise.all([worker(), worker()]);
writeMan();
console.log(`이번에 그린 그림 ${done}개 · 실패 ${fail}개 · 남은 그림 ${todo.length - done}개`);
if (stopped) console.log(/neuron|allocation|quota|4006|429/i.test(stopped) ? '오늘 무료 사용량을 다 썼어요. 내일 오전 9시(한국 시간) 이후에 같은 명령을 실행하면 이어서 그려요.' : `멈춤: ${stopped}`);
