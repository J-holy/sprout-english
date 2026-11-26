// 새싹수학 수학 이야기 삽화: 이모지로 꾸민 장면 쪽을 스토리북과 같은 그림체로 그린다.
// 수학 그림(짝 짓기·표·막대·길 지도 같은 도해)은 그대로 두고, 여기 ART에 적은 쪽만 그림으로 바꾼다.
//   node scripts/pregen-math-story.js             남은 그림 그리기 (Cloudflare)
//   node scripts/pregen-math-story.js --local     이 Mac에서 그리기
//   node scripts/pregen-math-story.js --redo count-0,shape-1   그 쪽만 다른 모습으로 다시
// 결과: public/img/ms/<주제>-<쪽>-<해시>.jpg, 목록은 public/js/math-pics.js (MATH_STORY_PICS)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { config } from '../lib/env.js';

const args = process.argv.slice(2);
const arg = k => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const local = args.includes('--local');
const redo = new Set((arg('--redo') || '').split(',').filter(Boolean));
const only = arg('--only') && new Set(arg('--only').split(','));
const MODEL = '@cf/black-forest-labs/flux-2-klein-4b';
const MFLUX = path.join(config.dataDir, 'mflux'), LOCAL_MODEL = 'Runpod/FLUX.2-klein-4B-mflux-4bit';
const execFileP = promisify(execFile);
const imgDir = path.join(config.publicDir, 'img', 'ms'), listFile = path.join(config.publicDir, 'js', 'math-pics.js');
const hash = s => crypto.createHash('sha1').update(s).digest('hex');

const STYLE = "Children's picture book illustration, soft watercolor with colored pencil lines, warm gentle pastel colors, rounded friendly shapes, cute and kind, simple uncluttered composition, no text, no letters, no words, no numbers, no signs";
const FACES = ' Every face is clearly visible with both eyes, nose and mouth in natural places, with a calm plain area behind each head, and each expression fits the moment. Keep the main action in the middle and fully visible. No words, letters, numbers or writing anywhere in the picture.';

// 인물은 한 이야기 안에서 같은 모습으로
const P = {
  shep: 'a shepherd child about eight years old with short black hair, a simple brown wool tunic and sandals',
  egy: 'ancient Egyptian rope stretchers: men in white linen kilts with short black hair and bare feet',
  linY: 'young Carl Linnaeus as a cheerful eight-year-old Swedish boy with light blond hair, a blue 18th-century coat and knee breeches',
  linA: 'Carl Linnaeus as a kind grown-up Swedish scientist with light brown tied-back hair and a blue 18th-century coat',
  moon: 'a family of early people in simple woven and fur clothes: a mother, a father and two small children',
  china: 'ancient Chinese people in simple long robes with their hair tied in top knots',
  mason: 'a kind old stonemason with a short gray beard, a cloth headband, a long-sleeved white work shirt and a brown work apron',
  joseon: 'a Joseon-era Korean official in a light blue hanbok robe and a black horsehair gat hat',
  venn: 'Mr. Venn, a friendly English schoolteacher from the 1880s with a short brown beard, round glasses and a brown tweed jacket',
  play: 'William Playfair, a Scottish man from the 1780s with tied-back gray hair, a dark green coat and a white neck cloth',
  dijk: 'Edsger Dijkstra, a thoughtful Dutch man from the 1950s with dark short hair, a neat beard, glasses and a gray sweater',
  fibo: 'Fibonacci, a friendly medieval Italian scholar with a short dark beard, a red cloth cap and a long dark red robe',
  caes: 'Julius Caesar, a Roman general with short dark hair, a green laurel wreath, a silver breastplate and a red cape',
  dude: 'Henry Dudeney, a cheerful English puzzle writer from the 1900s with a big brown mustache, a waistcoat and rolled-up sleeves',
  pasc: 'Blaise Pascal, a young French thinker from the 1650s with long wavy brown hair, a plain dark coat and a white collar',
  kids: 'two curious children of about seven, a girl with black hair in two buns and a boy with short brown hair',
};
const ART = {
  'count-0': `${P.shep} walking with a flock of five white sheep down a green grassy hill in the early morning, mountains far behind, the sheep heading out to eat grass`,
  'shape-0': 'a wide river in ancient Egypt flooding over flat green fields, palm trees and a small mud brick house, the water washing away the little earth walls between the fields, a farmer looking at the flooded field worried',
  'shape-1': `three ${P.egy} walking together across a flat field beside the Nile river, carrying a long coiled rope with big knots tied at equal spaces along it`,
  'shape-2': `seen from high above at an angle: exactly three ${P.egy} standing far apart on a flat sandy field, one on the left, one on the right and one at the back; each man holds one corner of a single long knotted rope and pulls it tight, so the rope lies on the ground as one big clear triangle with three straight sides between the three men; nothing else on the ground`,
  'group-0': `${P.linY} kneeling in a flower meadow in summer, looking closely and happily at a pink flower, a red ladybug on a leaf and a yellow butterfly near him`,
  'group-1': `${P.linA} sitting at a big wooden table completely covered with many different flowers, leaves, butterflies, beetles, shells and small fish in glass jars, scratching his head with a puzzled but smiling face`,
  'pattern-0': `${P.moon} sitting together by a small campfire outside their cave at night, all looking up with wonder at a thin crescent moon and many stars in the dark blue sky`,
  'magic-0': `a big flood in ancient China: a wide brown river overflowing under rain clouds, and a huge gentle turtle with a large patterned shell climbing out of the water onto the bank, ${P.china} on the bank looking surprised`,
  'magic-3': `${P.kids} in a sunny courtyard of an old Chinese house, smiling and pointing at the shell of a huge friendly turtle; the shell pattern is made of nine rounded patches in three rows of three, with no dots and no marks`,
  'blocks-0': `${P.mason} in a mountain village carefully shaping a square stone block with a chisel, next to a small neat stepped stone tower he is building, a pile of square stone blocks beside him`,
  'table-0': 'green rice paddies in Joseon-era Korea during a gentle summer rain, a farmer in a straw rain cape and a straw hat standing at the edge of the paddy smiling up at the rain, thatched roof houses behind',
  'table-1': `a grown-up man, ${P.joseon}, about forty years old with a short black beard, standing in a stone courtyard after rain and putting a thin wooden ruler stick straight down into a rain gauge; the rain gauge is a plain straight dark bronze tube like a tall tin can, with no handle and no cup shape, standing upright on a low square stone block; a puddle on the ground`,
  'venn-0': `${P.venn} standing in a bright Victorian classroom, smiling at a few children at wooden desks who look curious, a blank dark chalkboard behind him`,
  'venn-3': `${P.venn} in his classroom, smiling and pointing at two big overlapping chalk circles drawn on the dark chalkboard, children at wooden desks raising their hands happily`,
  'graph-0': `${P.play} standing on a busy harbor dock beside tall sailing ships and stacked wooden crates and barrels, writing in an open notebook with a quill pen`,
  'path-0': `${P.dijk} sitting at a small table outside a cafe beside a canal in Amsterdam, a cup of coffee in front of him, resting his chin on his hand and thinking, tall narrow canal houses and a bridge behind`,
  'seq-0': `${P.fibo} standing on green grass in front of an old Italian town with a leaning white bell tower, holding a rolled paper scroll and smiling down at a pair of fluffy rabbits`,
  'seq-1': 'a sunny meadow with rabbit families near a burrow: a pair of grown-up brown rabbits and beside them a pair of small baby rabbits, and a few more rabbit pairs playing behind',
  'seq-3': 'a close-up still life: a big cut sunflower head lying flat so we see the spiral pattern of its brown seeds, a spiral seashell and a pineapple lying together on a picnic blanket in the garden; these are real objects with no faces, no eyes and no mouths',
  'cipher-0': `${P.caes} inside a large army tent, sitting at a wooden table writing a letter on a rolled paper scroll with a feather pen, a young messenger in a short tunic waiting beside him`,
  'cipher-1': 'a young Roman messenger in a short tunic riding a brown horse fast along a dusty road, holding a sealed scroll, while a sneaky spy in a dark hooded cloak peeks out from behind a big rock, watching',
  'masked-0': `${P.dude} sitting at a cozy desk by a window, surrounded by newspapers and wooden puzzle pieces, holding a pencil and grinning as he thinks up a new puzzle`,
  'masked-3': `${P.kids} at a table, each holding up a colorful paper party mask in front of half their face and laughing, wooden puzzle pieces on the table`,
  'cases-0': `${P.pasc} sitting at a wooden desk by candlelight, writing a letter with a feather pen, two small white dice on the desk beside the paper`,
  'cases-1': `${P.kids} at a wooden table watching two big white dice with black dots tumbling across the table, both leaning forward excitedly`,
  'cases-3': `${P.kids} in front of a tall mirror trying on clothes: the girl wears a red cap and a striped shirt, the boy wears a straw hat and a blue shirt, more caps and shirts lie on a bed behind them`,
};

const account = config.cf?.accountId || process.env.CF_ACCOUNT_ID, token = config.cf?.aiToken || process.env.CF_AI_TOKEN;
async function draw(prompt, seed) {
  if (local) {
    const out = path.join(MFLUX, `ms-${process.pid}.png`), pf = out + '.txt';
    fs.writeFileSync(pf, prompt);
    await execFileP(path.join(MFLUX, '.venv/bin/mflux-generate-flux2'), ['--model', LOCAL_MODEL, '--base-model', 'flux2-klein-4b', '--low-ram', '--steps', '4', '--width', '768', '--height', '480', '--seed', String(seed), '--prompt-file', pf, '--output', out],
      { env: { ...process.env, HF_HOME: path.join(MFLUX, 'hf'), HF_HUB_OFFLINE: '1' }, maxBuffer: 1e7, timeout: 15 * 60000 });
    const b = fs.readFileSync(out); fs.unlinkSync(out); fs.unlinkSync(pf); return b;
  }
  const fd = new FormData();
  fd.append('prompt', prompt); fd.append('width', '768'); fd.append('height', '480'); fd.append('seed', String(seed));
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`, { method: 'POST', signal: AbortSignal.timeout(120000), headers: { Authorization: `Bearer ${token}` }, body: fd });
  if (/^image\//.test(r.headers.get('content-type') || '')) return Buffer.from(await r.arrayBuffer());
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.result?.image) throw new Error(((j.errors || []).map(x => `${x.code} ${x.message}`).join(' / ') || `HTTP ${r.status}`).slice(0, 200));
  return Buffer.from(j.result.image, 'base64');
}

fs.mkdirSync(imgDir, { recursive: true });
let list = {};
try { list = JSON.parse(fs.readFileSync(listFile, 'utf8').replace(/^[^{]*/, '').replace(/;\s*$/, '')); } catch {}
const tries = {}; try { Object.assign(tries, JSON.parse(fs.readFileSync(path.join(imgDir, 'tries.json'), 'utf8'))); } catch {}
const writeList = () => fs.writeFileSync(listFile, `// pregen-math-story.js가 만든다: 수학 이야기 쪽('주제-쪽') → 그림\nconst MATH_STORY_PICS = ${JSON.stringify(list, null, 1)};\n`);
let made = 0;
for (const [key, scene] of Object.entries(ART)) {
  if (only && !only.has(key)) continue;
  const prompt = `${STYLE}. One single full-page illustration: ${scene}.${FACES}`;
  if (redo.has(key)) tries[key] = (tries[key] || 0) + 1;
  const h = hash(prompt + (tries[key] || 0)).slice(0, 8), file = `ms/${key}-${h}.jpg`;
  if (list[key] === file && fs.existsSync(path.join(config.publicDir, 'img', file))) continue;
  const seed = parseInt(hash(key).slice(0, 7), 16) + (tries[key] || 0) * 7919;
  try {
    const buf = await draw(prompt, seed), png = path.join(imgDir, `${key}.tmp.png`), out = path.join(config.publicDir, 'img', file);
    fs.writeFileSync(png, buf);
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '72', png, '--out', out], { stdio: 'ignore' });
    fs.unlinkSync(png);
    const old = list[key]; list[key] = file; writeList(); made++;
    if (old && old !== file) fs.rmSync(path.join(config.publicDir, 'img', old), { force: true });
    console.log('ok', key);
  } catch (e) { console.log('실패', key, e.message); }
}
fs.writeFileSync(path.join(imgDir, 'tries.json'), JSON.stringify(tries));
writeList();
console.log(`끝: 새로 그린 그림 ${made}장, 모두 ${Object.keys(list).length}장`);
