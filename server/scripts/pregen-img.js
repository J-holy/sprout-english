// 문제 그림과 스토리북 삽화를 같은 그림체로 미리 그려 public/img 에 넣는다.
// Cloudflare Workers AI 무료 사용량(하루 10,000 뉴런, 한국 시간 오전 9시 초기화) 안에서 그리고,
// 사용량을 다 쓰면 멈췄다가 다음 날 다시 실행하면 이어서 그린다. 무료 요금제 계정은 요금이 나가지 않는다.
//   npm run pregen-img -- --dry            그릴 그림 수와 예상 날짜만 보기
//   npm run pregen-img                     남은 그림 그리기 (스토리북 먼저, 다음 단어 그림)
//   npm run pregen-img -- --only w|s       단어 그림(w)이나 스토리북(s)만
//   npm run pregen-img -- --book 2         스토리북 한 권만 (시범용)
//   npm run pregen-img -- --local          Cloudflare 대신 이 Mac에서 그리기 (무료, 제한 없음, 한 장 1~2분)
//   npm run pregen-img -- --redo 2-5,🍎    마음에 안 드는 그림만 다시 (스토리 '책-쪽', 단어는 이모지)
// .env 에 CF_ACCOUNT_ID 와 CF_AI_TOKEN(Workers AI 권한 토큰)이 있어야 해요.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { execFileSync, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { config } from '../lib/env.js';

const args = process.argv.slice(2);
const arg = k => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const dry = args.includes('--dry'), only = arg('--only'), book = arg('--book') && +arg('--book');
const redo = new Set((arg('--redo') || '').split(',').filter(Boolean));
const outDir = arg('--out') ? path.resolve(arg('--out')) : path.join(config.publicDir, 'img');
const keys = arg('--keys') && new Set(arg('--keys').split(',')); // 이 그림들만 (그림체 비교용)
const refDir = path.join(config.dataDir || path.resolve('data'), 'img-ref');
const MODEL = '@cf/black-forest-labs/flux-2-klein-4b';
// --local: Cloudflare 대신 이 Mac에서 그린다 (data/mflux 에 mflux와 모델 설치)
const local = args.includes('--local') || process.env.IMG_ENGINE === 'local';
const MFLUX = path.join(config.dataDir, 'mflux'), LOCAL_MODEL = 'Runpod/FLUX.2-klein-4B-mflux-4bit';
const execFileP = promisify(execFile);
// 가로·세로 512px 칸 단위로 뉴런이 든다: 단어 384×384 = 1칸, 스토리 768×480 = 2칸, 주인공 기준 그림 448×448 = 1칸
const SIZE = { w: [384, 384], s: [768, 480], ref: [448, 448] };
const COST = { w: 55, s: 110, ref: 55 }; // 실제로 써 보니 그림 한 장에 약 100 뉴런 (요금표 계산의 약 2배)

// 그림체: --style 이름 (기본 watercolor). 그림체를 바꾸면 그림 설명이 달라져 모든 그림을 새로 그린다
const STYLES = {
  watercolor: 'soft watercolor with colored pencil lines, warm gentle pastel colors',
  crayon: 'textured wax crayon and colored pencil drawing on paper, bright cheerful colors, playful hand-drawn lines',
  flat: 'clean flat vector illustration, bold simple shapes, bright solid colors, minimal shading, thick smooth outlines',
  clay: 'cute 3D clay animation look, soft plasticine textures, rounded chunky shapes, soft studio lighting',
  paper: 'cut paper collage, layered textured colored paper shapes with soft shadows between layers',
  gouache: 'rich gouache painting, thick soft brush strokes, warm deep colors, classic storybook feel',
};
const styleName = arg('--style') || process.env.IMG_STYLE || 'watercolor';
if (!STYLES[styleName]) { console.error(`그림체 이름은 ${Object.keys(STYLES).join(', ')} 중 하나예요.`); process.exit(1); }
const STYLE = `Children's picture book illustration, ${STYLES[styleName]}, rounded friendly shapes, cute and kind, simple uncluttered composition, no text, no letters, no words, no numbers, no signs`;

// 책마다 장소와 등장인물을 정해 둔다. 인물마다 [문장에서 찾을 말(정규식), 모습]이고, 인물별 기준 그림을 먼저 그려
// 그 쪽 문장에 나오는 인물만 기준 그림과 함께 그린다 (모든 쪽에 같은 모습으로, 안 나오는 인물은 빼고).
// '*'는 모든 쪽에 나오는 인물(대화 책). 세 번째 값 [인물 모습에서 찾을 말, 메모]는 그 인물이 나오는 쪽에만 붙인다. 찾는 말이 없고 he/she/it 같은 대명사만 있으면 앞 쪽 인물을 이어 쓴다.
const NAR = '\\b(I|me|my|we|us|our)\\b', WE = '\\b(we|us|our)\\b';
const BOOKS = {
  1: ['a sunny city park with green grass and big trees', [[NAR, 'a cheerful 5-year-old girl with black pigtails in a red dress'], [`mom|${WE}`, 'her mom with a brown ponytail and a green blouse'], [WE, 'her dad with glasses and a blue sweater']]],
  2: ['a cozy living room with a round woven mat and a cardboard box', [['cat', 'a big round fat orange tabby cat'], ['rat|hat', 'a small gray rat wearing a small red knit beanie hat with a white pom-pom']],
    ['rat', 'The cat has bare fur on its head. The rat\'s small red knit beanie with a white pom-pom is the only hat in the picture.']],
  3: ['a warm family home with a garden', [[NAR, 'a 7-year-old boy with short black hair in a yellow T-shirt'], ['mom|family', 'his kind mom with a bun and a white apron'], ['dad|family', 'his tall dad with a short beard'], ['sister|family', 'his 6-year-old sister in a pink dress'], ['baby', 'a chubby baby brother in a blue onesie'], ['grandma', 'a grandma with gray curly hair and a flower cardigan'], ['grandpa', 'a grandpa with a white mustache and a big straw hat'], ['dog|Coco', 'Coco, a small brown dog with floppy ears']]],
  4: ['a sunny neighborhood park', [['*', 'Lily, a 7-year-old girl with long brown hair in a purple shirt'], ['*', 'Sam, a 7-year-old boy with curly black hair in a green shirt']]],
  5: ['a small house and a street on a rainy day', [[NAR, 'a 6-year-old girl with a short black bob in a green raincoat and yellow rain boots, carrying a red umbrella'], ['dog', 'her small white puppy'], ['frog', 'a little shiny green frog'], ['mom', 'her mom with a brown ponytail and a cozy sweater']]],
  6: ['inside a cozy house', [[NAR, 'a 7-year-old boy with short black hair in a red and white striped shirt'], [`sister|${WE}`, 'his older sister with a long black ponytail in a yellow hoodie'], ['Max|dog|\\b(he|his)\\b', 'Max, a fluffy small brown dog'], ['ball', 'a red ball']]],
  7: ['a zoo, a cozy home kitchen, or a park, whichever fits this moment', [[NAR, 'an 8-year-old girl with a black ponytail in a blue T-shirt'], ['mom', 'her mom with short brown hair'], ['dad', 'her dad with glasses and a gray jacket'], ['friends', 'two friends, a boy and a girl']]],
  8: ['a bright dreamy scene showing that job', [['\\bI\\b|pilot', 'a boy with short black hair dressed as a pilot'], ['sister|doctor', 'a girl with a black ponytail dressed as a doctor'], ['friend|chef', 'a boy with curly hair dressed as a chef'], ['brother|firefighter', 'a boy dressed as a firefighter'], ['cousin|artist', 'a girl with braids dressed as an artist'], ['teacher', 'a smiling teacher with glasses']]],
  9: ['a festive parade road with colorful flags', []],
  10: ['a big red bus and a sunny zoo', [['Ben|they', 'Ben, a 6-year-old boy wearing a red cap'], ['Tom|they', 'Tom, a 6-year-old boy with curly hair in a blue shirt']]],
  11: ['a bright kid bedroom', [[NAR, 'a 6-year-old boy with short black hair in an orange shirt'], [`friend|${WE}`, 'his friend, a girl with two braids'], ['toy box|\\bbox\\b', 'a big blue toy box']]],
  12: ['a small neighborhood grocery store with fruit shelves', [['*', 'a 7-year-old girl with two hair buns in a yellow jacket'], ['*', 'a friendly shopkeeper with a mustache and a green apron']]],
  13: ['a high green hill on a windy day', [[NAR, 'a 7-year-old boy with short black hair in a blue hoodie'], ['dad|\\bhe\\b', 'his very tall dad with a beard'], ['kite|tail|string|\\bit\\b', 'a big red diamond-shaped kite with a long yellow and green tail'], ['bird', 'a little brown bird']]],
  14: ['home, or a park with big trees, whichever fits this moment', [[WE, 'a 7-year-old girl with a black bob in a pink shirt'], ['dad', 'her dad in a blue apron'], ['dog', 'a happy small white dog'], ['Mina|friends', 'Mina, a girl with pigtails in a green dress']]],
  15: ['a park with benches, or a cozy home, whichever fits this moment', [[NAR, 'a 7-year-old girl with long black hair in a pink jacket'], ['puppy|\\b(it|its)\\b', 'a small fluffy cream puppy with a blue collar'], [`mom|${WE}`, 'her mom with short brown hair'], ['girl|\\b(she|her)\\b', 'another girl with red braids, the puppy\'s owner']]],
  16: ['outer space with stars and the moon', [['*', 'a girl with black hair in a white space suit and a round helmet'], ['*', 'a boy with brown hair in a white space suit and a round helmet'], ['rocket', 'a red and white rocket']]],
  17: ['a colorful toy shop', [[NAR, 'a 5-year-old boy with short black hair in a green shirt'], ['Dad|\\bwe\\b', 'his dad with glasses']]],
  18: ['a forest trail with flowers and a pond', [[NAR, 'a 5-year-old girl with a black bob in a yellow raincoat'], ['Grandpa', 'her grandpa with white hair and a walking stick']]],
  19: ['a farm with a hen pen and a fox den', [['hen', 'a red hen'], ['fox', 'a sly orange fox'], ['egg', 'ten white eggs in a straw nest'], ['chick', 'fluffy yellow chicks']]],
  20: ['a muddy farmyard on a hot sunny day', [['pig', 'a pink pig'], ['duck', 'a white duck with an orange beak'], ['Kim', 'Kim, a girl with a ponytail holding a green garden hose']]],
  21: ['a bright elementary school', [[NAR, 'a 7-year-old boy with short black hair and a green school bag'], ['teacher|\\bshe\\b', 'a nice teacher with long brown hair'], ['Jisu', 'Jisu, a girl with a short bob who loves drawing']]],
  22: ['a green farm with a red barn', [[NAR, 'a 6-year-old girl with pigtails in blue overalls'], ['farmer|tractor', 'a friendly farmer with a straw hat']]],
  23: ['a clean doctor\'s office', [['*', 'a 7-year-old boy with short black hair in striped pajamas'], ['*', 'a kind doctor with glasses and a white coat']]],
  24: ['a home birthday party with balloons', [['*', 'an 8-year-old girl with a black ponytail wearing a party hat'], ['friends|\\bwho\\b', 'her friends, a boy and a girl'], ['robot', 'a toy robot'], ['cake|candles|wish', 'a pink and white birthday cake with candles']]],
  25: ['a sunny windowsill at home', [[NAR, 'a 6-year-old girl with a short black bob in a green shirt'], ['pot|seed|sprout|flower|bud|leaves', 'a small terracotta flower pot'], ['bee', 'a fuzzy bee']]],
  26: ['a snowy yard on a winter morning', [[NAR, 'a 7-year-old girl with black hair in a warm coat, a red hat and blue gloves'], [`brother|${WE}`, 'her younger brother in a green coat and a striped scarf'], ['Mom', 'their mom'], ['snowman|\\b(he|his)\\b', 'a big snowman with a long orange carrot nose and black stone eyes']]],
  27: ['a home with a garden', [[NAR, 'a 7-year-old girl with black pigtails'], ['Dad', 'her dad with glasses'], ['Mom', 'her mom with a bun'], ['sister|\\bshe\\b', 'her older sister with long hair'], ['Coco|dog', 'Coco, a small brown dog']]],
  28: ['a sunny sandy beach by the blue sea', [[NAR, 'a 7-year-old girl with a black bob in a sun hat'], [`brother|${WE}`, 'her little brother in striped swim shorts'], [`Dad|${WE}|\\bhe\\b`, 'her dad with a beard'], [`Mom|${WE}|\\bshe\\b`, 'her mom with sunglasses'], ['crab|\\bit\\b', 'a little red crab']]],
  29: ['a campsite by a lake in the mountains', [[NAR, 'an 8-year-old boy with short black hair in a red jacket'], [`Dad|${WE}`, 'his dad with a beard'], [`Mom|${WE}`, 'his mom with a ponytail']]],
  30: ['a country house with a big colorful garden', [[NAR, 'an 8-year-old girl with long black hair in a yellow dress'], [`Grandma|\\b(she|her)\\b|${WE}`, 'her gentle grandma with gray hair and glasses']]],
  31: ['Jeju Island in Korea with the sea, orange trees and mountains', [[NAR, 'an 8-year-old boy with short black hair and a backpack'], [`dad|${WE}`, 'his dad'], [WE, 'his mom'], ['sister', 'his older sister with a ponytail']]],
  32: ['a cozy future home', [[NAR, 'an 8-year-old boy with short black hair in an orange hoodie'], [`Bolt|robot|\\b(he|his)\\b|${WE}`, 'Bolt, a friendly round white and blue robot with big round eyes'], ['dog', 'a small dog']]],
};

// 문장만으로는 장면이 애매한 쪽: '책-쪽' → [나올 인물(모습에서 찾을 말), 그릴 장면]
const SCENES = {
  '2-5': ['cat|rat', 'the fat orange cat stares longingly at the red knit beanie on the rat\'s head and reaches one paw toward it'],
  '9-0': ['', 'a cute baby elephant proudly lifting its long nose high in the air'],
  '2-14': ['cat|rat', 'in front, the small gray rat with gray fur smiles proudly and holds its red knit beanie on its head with both paws; far behind it, the cat sleeps curled up on the mat'],
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
// 문장을 따옴표·느낌표 없는 장면 설명으로 (따옴표 안 문장은 그림 속 글자로 그려지기 쉽다)
const plain = t => t.replace(/["“”!?]/g, '').replace(/\.$/, '').replace(/^./, c => c.toLowerCase());
const refs = {}; // 인물 기준 그림: 파일 경로 → 그림 설명
if (only !== 'w') for (const s of [...STORIES].sort((a, b) => a.id - b.id)) {
  if (book && s.id !== book) continue;
  const [place, cast, note] = BOOKS[s.id] || ['a bright place', []];
  let last = [];
  s.pages.forEach(([text], i) => {
    const letter = isLetterLine(text);
    const thing = letter && text.replace(/^[A-Z] is for | ends with [A-Z]\.?$/g, '').replace(/\.$/, '');
    const scene = SCENES[`${s.id}-${i}`];
    let who = letter ? [] : scene ? cast.filter(c => new RegExp(scene[0]).test(c[1])) : cast.filter(([k]) => k === '*' || new RegExp(k, 'i').test(text));
    // 대명사만 있으면 앞 쪽 인물을 이어 쓰고, 그때만 앞 문장을 함께 준다 (다른 인물이 덤으로 그려지지 않게)
    const carried = !letter && !scene && !who.length && /\b(he|she|it|they|his|her|its|them|him)\b/i.test(text);
    if (carried) who = last;
    last = who; who = who.slice(0, 4); // 기준 그림은 4장까지
    const prev = carried && i && !isLetterLine(s.pages[i - 1][0]) ? ` Just before this, ${plain(s.pages[i - 1][0])}.` : '';
    const prompt = letter
      ? `${STYLE}. One single full-page illustration: ${scene ? scene[1] : `a big cute ${thing}`}, in ${place}.`
      : `${STYLE}. One single full-page illustration of this moment, with the action shown clearly: ${scene ? scene[1] : plain(text)}.${prev} `
        + (who.length ? `Characters in this picture: ${who.map(c => c[1]).join('; ')}. ${['', 'Only one character', 'Only two characters', 'Only three characters', 'Only four characters'][who.length]} in the whole picture, each appearing once. Use the reference images only for each character's look and colors; draw new poses, expressions and positions that act out the sentence.` : 'Only show what the sentence mentions.')
        + ` Background: ${place}, drawn in the same style as the characters, everything illustrated, not a photo, not realistic.${note && who.some(c => new RegExp(note[0]).test(c[1])) ? ` ${note[1]}` : ''}`;
    const refFiles = who.map(([, d]) => { const f = path.join(refDir, `${hash(styleName + d).slice(0, 12)}.png`); refs[f] = d; return f; });
    jobs.push({ kind: 's', key: `${s.id}-${i}`, refFiles, label: text, prompt, file: `s/${s.id}-${i}.jpg` });
  });
}

// 이미 그린 그림은 건너뛴다 (그림 설명이 바뀌었거나 --redo 로 고른 것만 다시)
const manPath = path.join(outDir, 'manifest.json');
let man = { w: {}, s: {}, h: {}, n: {} };
try { man = { ...man, ...JSON.parse(fs.readFileSync(manPath, 'utf8')) }; } catch (e) { /* 처음 */ }
const todo = jobs.filter(j => !keys || keys.has(j.key)).filter(j => redo.has(j.key) || !man[j.kind][j.key] || man.h[j.kind + j.key] !== hash(j.prompt).slice(0, 10) || !fs.existsSync(path.join(outDir, man[j.kind][j.key])));
const needRefs = new Set(todo.flatMap(j => j.refFiles || []).filter(f => !fs.existsSync(f)));
const neurons = todo.reduce((n, j) => n + COST[j.kind], 0) + needRefs.size * COST.ref;
console.log(`단어 그림 ${jobs.filter(j => j.kind === 'w').length}개 · 스토리 ${jobs.filter(j => j.kind === 's').length}쪽 중 그릴 것 ${todo.length}개`);
if (local) console.log(`이 Mac에서 그려요: 한 장에 1~2분, 모두 약 ${Math.ceil((todo.length + needRefs.size) * 1.5 / 60)}시간`);
else console.log(`예상 사용량 약 ${neurons.toLocaleString()} 뉴런 → 하루 무료 10,000 뉴런으로 약 ${Math.max(1, Math.ceil(neurons / 9500))}일`);
if (dry || !todo.length) process.exit(0);
const { CF_ACCOUNT_ID: account, CF_AI_TOKEN: token } = process.env;
if (local && !fs.existsSync(path.join(MFLUX, '.venv/bin/mflux-generate-flux2'))) { console.error(`${MFLUX} 에 mflux가 없어요. (deploy/DEPLOY.md 4-4-2 참고)`); process.exit(1); }
if (!local && (!account || !token)) { console.error('server/.env 에 CF_ACCOUNT_ID 와 CF_AI_TOKEN 을 넣어 주세요. (deploy/DEPLOY.md 4-4-2 참고)'); process.exit(1); }

class Quota extends Error {}
async function draw(prompt, [width, height], seed, refFiles = []) {
  if (local) return drawLocal(prompt, [width, height], seed, refFiles);
  const fd = new FormData();
  fd.append('prompt', prompt); fd.append('width', String(width)); fd.append('height', String(height)); fd.append('seed', String(seed));
  refFiles.forEach((f, k) => fd.append(`input_image_${k}`, new Blob([fs.readFileSync(f)], { type: 'image/png' }), `ref${k}.png`));
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
// 이 Mac에서 같은 모델(FLUX.2 klein 4B, 4비트, Apache 2.0)을 mflux로 돌린다. 사용량 제한 없이 무료
async function drawLocal(prompt, [width, height], seed, refFiles) {
  const out = path.join(MFLUX, `out-${process.pid}.png`), pf = out + '.txt';
  fs.writeFileSync(pf, prompt);
  const bin = path.join(MFLUX, '.venv/bin', refFiles.length ? 'mflux-generate-flux2-edit' : 'mflux-generate-flux2');
  const a = ['--model', LOCAL_MODEL, '--base-model', 'flux2-klein-4b', '--low-ram', '--steps', '4', '--width', width, '--height', height, '--seed', seed, '--prompt-file', pf, '--output', out, ...(refFiles.length ? ['--image-paths', ...refFiles] : [])];
  try { await execFileP(bin, a.map(String), { env: { ...process.env, HF_HOME: path.join(MFLUX, 'hf'), ...(fs.existsSync(path.join(MFLUX, 'hf', 'hub')) ? { HF_HUB_OFFLINE: '1' } : {}) }, maxBuffer: 1e7, timeout: 15 * 60000 }); }
  catch (e) { throw new Error(String(e.stderr || e.message).trim().split('\n').pop().slice(0, 200)); }
  const buf = fs.readFileSync(out); fs.unlinkSync(out); fs.unlinkSync(pf); return buf;
}
// macOS면 sips로 가벼운 JPEG로 바꾼다 (없으면 받은 그대로)
function save(buf, file, jpeg = true) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!jpeg) return fs.writeFileSync(file, buf);
  const tmp = file + '.src'; fs.writeFileSync(tmp, buf);
  try { execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '62', tmp, '--out', file], { stdio: 'ignore' }); fs.unlinkSync(tmp); }
  catch (e) { fs.renameSync(tmp, file); }
}
const seedOf = j => parseInt(hash(j.key).slice(0, 7), 16) + (man.n[j.kind + j.key] || 0) * 7919;
const writeMan = () => fs.writeFileSync(manPath, JSON.stringify(man));

let done = 0, fail = 0, stopped = null;
for (const j of todo) if (redo.has(j.key)) man.n[j.kind + j.key] = (man.n[j.kind + j.key] || 0) + 1; // 다시 그릴 때는 다른 모습으로
const queue = [...todo].sort((a, b) => (a.kind === 's' ? 0 : 1) - (b.kind === 's' ? 0 : 1)); // 스토리북 먼저
// 인물 기준 그림은 한 번만 그린다 (두 작업이 동시에 같은 인물을 그리지 않게)
const refJobs = {};
const refMade = f => fs.existsSync(f) ? null : (refJobs[f] ||= draw(`${STYLE}. Character reference: ${refs[f]}, alone, full body, standing, facing forward, plain white background.`, SIZE.ref, parseInt(hash(f).slice(0, 7), 16), [])
  .then(buf => { save(buf, f, false); console.log(`  인물 기준 그림: ${refs[f]}`); }));
async function worker() {
  while (queue.length && !stopped) {
    const j = queue.shift();
    try {
      for (const f of j.refFiles || []) await refMade(f);
      save(await draw(j.prompt, SIZE[j.kind], seedOf(j), j.refFiles), path.join(outDir, j.file));
      man[j.kind][j.key] = j.file; man.h[j.kind + j.key] = hash(j.prompt).slice(0, 10);
      writeMan(); // 한 장마다 저장: 중간에 Mac을 꺼도 그린 그림은 남는다
      if (++done % 10 === 0) console.log(`  ${done} / ${todo.length}`);
    } catch (err) {
      if (err instanceof Quota) { stopped = err.message; break; }
      fail++; console.error(`실패: ${j.key} "${j.label}" — ${err.message}`);
      if (/401|403|Authentication|10000/i.test(err.message)) { stopped = '토큰이나 계정 ID가 올바르지 않아요. CF_ACCOUNT_ID 와 CF_AI_TOKEN(Workers AI 권한)을 확인해 주세요.'; break; }
    }
  }
}
await Promise.all(local ? [worker()] : [worker(), worker()]); // 이 Mac에서는 한 장씩
writeMan();
console.log(`이번에 그린 그림 ${done}개 · 실패 ${fail}개 · 남은 그림 ${todo.length - done}개`);
if (stopped) console.log(/neuron|allocation|quota|4006|429/i.test(stopped) ? '오늘 무료 사용량을 다 썼어요. 내일 오전 9시(한국 시간) 이후에 같은 명령을 실행하면 이어서 그려요.' : `멈춤: ${stopped}`);
