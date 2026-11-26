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
// 영어 스토리북과 같은 기준(review-detail): 얼굴·표정, 팔·다리·손가락·꼬리 개수와 모양, 행동에 맞는 자세, 쉬운 시점
const BODY = ' Bodies are drawn correctly: every person has exactly two arms, two legs and two hands with five fingers each, with natural joints and a pose that fits what they are doing; every animal has the right number of legs (four for sheep, rabbits, horses, dogs and turtles) and a natural body of its own kind (no mixed animals); people never have tails or animal ears; draw no animals at all unless the scene names them; each named person appears only once; no extra or missing limbs, no merged hands, every held object is held firmly in one hand. Choose the viewpoint that shows the action most clearly, with nobody cut off by the edge of the picture.';
const FACES = ' Every face is clearly visible with both eyes, nose and mouth in natural places, with a calm plain area behind each head, and each expression fits the moment. Keep the main action in the middle and fully visible. No words, letters, numbers or writing anywhere in the picture.';

// 인물은 한 이야기 안에서 같은 모습으로
const P = {
  shep: 'a shepherd child about eight years old with short black hair, a simple brown wool tunic and sandals',
  egy: 'ancient Egyptian rope stretchers: clearly grown-up adult men, tall, with short black hair, short black beards, white linen kilts and bare feet',
  linY: 'young Carl Linnaeus as a cheerful eight-year-old Swedish boy with light blond hair, a blue 18th-century coat and knee breeches',
  linA: 'Carl Linnaeus as a clearly grown-up man about thirty-five years old, a kind Swedish scientist with an adult face, light brown hair tied back, a blue 18th-century coat',
  moon: 'a family of early people in simple woven and fur clothes: a grown-up mother and a grown-up father with a short beard, both clearly adults and much taller than the children, and two small children',
  china: 'ancient Chinese people in simple long robes with their hair tied in top knots',
  mason: 'a kind old stonemason with a short gray beard, a cloth headband, a long-sleeved white work shirt and a brown work apron',
  joseon: 'a Joseon-era Korean official in a light blue hanbok robe and a black horsehair gat hat',
  venn: 'Mr. Venn, a friendly English schoolteacher from the 1880s with a short brown beard, round glasses and a brown tweed jacket',
  play: 'William Playfair, a Scottish man from the 1780s with tied-back gray hair, a dark green coat and a white neck cloth',
  dijk: 'Edsger Dijkstra, a thoughtful Dutch man from the 1950s with dark short hair, a neat beard, glasses and a gray sweater',
  fibo: 'Fibonacci, a friendly medieval Italian scholar with a short dark beard, a red cloth cap and a long dark red robe',
  caes: 'Julius Caesar, a Roman general with short dark hair, a green laurel wreath, a silver breastplate and a red cape',
  dude: 'Henry Dudeney, a cheerful English puzzle writer from the 1900s with a big brown mustache, a waistcoat and rolled-up sleeves',
  pasc: 'Blaise Pascal, a clearly grown-up French man about thirty years old with an adult face, a thin mustache, long wavy brown hair, a plain dark coat and a white collar',
  tiler: 'a cheerful grown-up tile maker, a woman about forty years old with dark hair tied in a scarf, a long-sleeved green dress and a brown work apron',
  leib: 'Gottfried Leibniz, a kind middle-aged German scholar from the 1680s, about fifty years old, a tall grown-up man with a long adult face, a big nose, wrinkles around his eyes, a long curly dark brown wig, a dark red coat with gold buttons and a white lace neck cloth',
  euler: 'Leonhard Euler, a kind grown-up Swiss mathematician from the 1750s about forty years old with an adult face, a white powdered wig, a brown coat and a white neck cloth',
  carroll: 'Lewis Carroll, a gentle tall grown-up English man from the 1860s about thirty-five years old with a long adult face, long sideburns, wavy brown hair, a long dark coat and a white shirt',
  khwar: 'al-Khwarizmi, a wise grown-up Persian scholar about forty years old with an adult face, a short dark beard, a white turban and a long blue robe',
  roman: 'a kind grown-up Roman man about forty years old with an adult face, short gray hair and a white toga',
  golomb: 'Solomon Golomb, a friendly grown-up American mathematician from the 1950s about twenty-five years old with an adult face, short dark hair, glasses, a white shirt and a dark tie',
  archi: 'Archimedes, a wise grown-up Greek scholar about fifty years old with an adult face, curly gray hair, a gray beard and a white Greek robe',
  quet: 'Adolphe Quetelet, a kind grown-up Belgian scholar from the 1830s about forty years old with an adult face, short brown hair, side whiskers and a dark suit',
  erato: 'Eratosthenes, a wise grown-up Greek scholar about fifty years old with an adult face, a short white beard, a blue Greek robe and sandals',
  kids: 'two curious children of about seven, a girl with black hair in two buns and a boy with short brown hair',
};
const ART = {
  'count-0': `${P.shep} walking down a green grassy hill in the early morning behind three white sheep that walk one after another in a row, well apart so they do not overlap, each sheep with exactly four legs, mountains far behind`,
  'count-4': `${P.shep} standing on a green grassy hill in front of a very big flock of white sheep that covers the whole hill behind him; he holds up with both hands a small cloth pouch so full of pebbles that it is bulging and about to burst, and he looks troubled and puzzled`,
  'count-5': `${P.shep} sitting on the grass, threading ten small round gray pebbles one by one onto a string to make one row; beside him on the grass lie three finished strings of pebbles and two loose pebbles; far behind him, well apart from him and from each other, two small white sheep graze, one on the far left and one on the far right, both seen from the side with their heads and faces clearly visible, nothing behind the boy's head, each sheep with four legs`,
  'count-6': `${P.shep} standing on the grass and happily lifting up with both hands a big bundle made of ten strings of pebbles tied together with a thick rope, smiling proudly; behind him a wide green meadow with a big flock of white sheep`,
  'same-0': `${P.tiler} standing in front of a tall empty palace wall with a big arch, holding one small colorful square tile in one hand and looking up at the bare wall, wondering how to fill it`,
  'same-1': `${P.tiler} on a low wooden step pressing colorful tiles of one same shape onto the palace wall, turning and flipping them so they fit with no gaps; the lower part of the wall is already covered with a neat repeating tile pattern of flowers and diamonds without any letters`,
  'same-2': `${P.tiler} at a wooden workbench, smiling and holding up in her two hands two blue star-shaped tiles: one big star and one small star, exactly the same five-pointed star shape, only the size is different; more big and small blue star tiles lie on the bench`,
  'same-3': `${P.kids} standing in front of a finished palace wall covered with a colorful repeating tile pattern, each child pointing with one finger at two tiles of the same shape, smiling`,
  'fbox-0': `${P.leib} sitting at a wooden desk at night lit by a candle, writing on paper with a feather pen, stacks of old books and papers around him, a calm happy face`,
  'fbox-1': `seen from the side: a closed wooden magic box painted with stars standing on a table, as long as a suitcase, with a round hole at its left end and a slot at its right end; a girl of about seven with black hair in two buns stands on the left beside the box and pushes one blank white card into the left hole, while at the right end a different blank card slides out of the slot by itself; she looks at it surprised and delighted; the cards have no writing`,
  'fbox-2': `${P.leib} standing beside the big wooden magic box painted with stars, holding a sheet of paper with an empty two-row grid drawn on it and looking thoughtfully at the box; the paper has no writing`,
  'fbox-3': `${P.kids} and two more children standing in a happy line in front of the big wooden magic box painted with stars, each child holding one blank white card and waiting their turn, smiling`,
  'logic-0': `${P.carroll} sitting at a desk in a cozy 19th-century English study, writing with a pen, tall bookshelves behind him, and through the open window a small white rabbit sits on the green lawn`,
  'logic-1': `${P.carroll} sitting in a garden chair handing one card to each of three curious children who stand in front of him; the cards show only small pictures of a banana, an apple and a glass of milk, no writing`,
  'logic-2': `a child at a garden table drawing lines on a sheet of paper with a pencil, carefully thinking, while a friend leans over to look; the paper shows only a simple grid of empty boxes, no letters or marks`,
  'logic-3': `three children sitting around a garden table, one child raising a hand high and shouting the answer with a big smile, while ${P.carroll} smiles and claps his hands`,
  'balance-0': `${P.khwar} standing in an old Baghdad market street with a big blue dome and stalls of fruit and cloth behind him, holding a rolled scroll and talking kindly with two merchants`,
  'balance-1': `a big two-pan balance scale on a wooden market table, the beam perfectly level: inside the left pan sit one small closed wooden box and, right next to it in the same pan, three small round iron weights, the right pan holds eight small round iron weights; a grown-up merchant with a mustache and an adult face in a striped robe stands beside it scratching his head with one hand, puzzled`,
  'balance-2': `${P.khwar} standing behind a big two-pan balance scale that stands on its own on the market table, his hands not touching the scale beam; the left pan holds a small wooden box and a few small round weights, the right pan holds many small round weights; he is picking one small round weight up out of each pan with his fingertips, one in each hand, and a few weights he already took off lie on the table in front; the beam stays perfectly level`,
  'balance-3': `${P.kids} at a classroom table with a small toy two-pan balance scale, putting a small box on one pan and little round weights on the other, smiling and excited`,
  'base-0': `${P.roman} standing in a sunny Roman square with white stone columns, kneeling beside a small child in a short tunic and drawing three short straight lines side by side in the sand with a stick, while the child counts them pointing with one finger, smiling`,
  'base-1': `a Roman stonemason in a short tunic with a short beard carving simple straight lines into a flat stone tablet with a chisel and a hammer; beside the lines a carving of an open hand with five fingers; no letters`,
  'base-2': `a child in a short Roman tunic standing beside a tall white temple column carved with rows of simple straight lines, touching the carved lines one by one with a finger and counting, a curious face; no letters`,
  'base-3': `${P.kids} at a table sorting colorful marbles into small groups, some groups of five and some groups of two, comparing them with interest`,
  'euler-0': 'a bird\'s-eye view like a map of an old European town from the 1700s with red roofs, cut through by a wide river; in the middle of the river there are two islands with houses on them; seven small stone bridges in total: two bridges join the upper bank to the big island, two join the lower bank to the big island, one joins the two islands, one joins the upper bank to the small island and one joins the lower bank to the small island; no animals; a sunny day',
  'euler-1': 'grown-up townspeople with adult faces in 18th-century clothes walking across a small stone bridge over a river: a tall man with a hat counting on his fingers and a grown-up woman in a long dress tilting her head, puzzled; the river flows below and another stone bridge is seen nearby; no animals',
  'euler-2': `${P.euler} sitting at a desk by a window, drawing four dots and lines between them on a sheet of paper with a feather pen, thinking hard; through the window a stone bridge over the river`,
  'euler-3': `${P.kids} at a table: the girl draws a simple house shape on paper with a pencil without lifting it, concentrating, and the boy beside her claps happily`,
  'match-0': 'inside an old-fashioned wooden train compartment by the window, a kind grandfather with white hair and a gray cardigan opens a small box of wooden sticks to show his grandson, a boy of about seven with short brown hair, who looks at it curiously; there is no fire and no flame anywhere',
  'match-1': 'at the small table by the train window sit the grandfather with white hair and wrinkles, and his grandson, a small boy of about seven with short brown hair and a child face; on the table seven wooden sticks with red tips lie flat arranged as the outline of two stacked squares, and the grandfather points at one stick with one finger while the boy watches; no fire, no flame',
  'match-2': 'on the small table by the train window, wooden sticks with red tips lie in simple straight-line shapes; the grandson, a boy of about seven with short brown hair, carefully picks up one stick with his fingers to move it to another spot, the grandfather with white hair watches smiling; no fire, no flame',
  'match-3': 'the grandfather with white hair and the grandson, a boy of about seven with short brown hair, sit together by the train window laughing happily and looking at the stick shapes on the little table, green fields and trees passing outside the window; no fire, no flame',
  'pento-0': `${P.golomb} sitting at a desk in a 1950s university office, sliding small colorful paper squares around on the desk and joining them edge to edge into different shapes, curious and focused`,
  'pento-1': `${P.golomb} at his desk smiling and picking up one piece; on the desk lie twelve flat colored pieces, each made of exactly five small square tiles joined edge to edge (like letters L, T, U, plus and zigzag shapes made of squares), with straight edges only, no knobs, not jigsaw puzzle pieces, every piece a different shape and color, spread out in two neat rows; no labels and no letters`,
  'pento-2': 'a close-up of one child\'s two hands turning one piece to fit it into the last empty gap of a rectangular wooden tray with a square grid, the tray almost completely filled with other flat colored pieces, each made of exactly five small square tiles joined edge to edge (like letters L, T, U, plus and zigzag shapes made of squares), with straight edges only, no knobs, not jigsaw puzzle pieces; only one child, each hand has five fingers',
  'pento-3': `${P.kids} sitting at a table, happily fitting flat colored pieces, each made of exactly five small square tiles joined edge to edge (like letters L, T, U, plus and zigzag shapes made of squares), with straight edges only, no knobs, not jigsaw puzzle pieces together into a rectangular wooden tray with a square grid, smiling`,
  'trc-0': `${P.archi} on a sunny ancient Greek beach, holding a long stick and drawing a circle and a triangle in the smooth sand, thinking deeply; the blue sea behind him`,
  'trc-1': `on smooth beach sand, a stick stands upright with a string tied to it; ${P.archi} holds the other end of the string tight and walks around the stick, drawing a perfect circle in the sand with a small stick in his other hand`,
  'trc-2': `${P.archi} pointing with a long stick at three triangles drawn as thin lines in the flat smooth sand, each clearly different: on the left a wide triangle with three equal sides, in the middle a tall thin pointed triangle, on the right a triangle with one square corner like the corner of a book; the sea behind`,
  'trc-3': 'seen from above at an angle: a curious child in a white Greek tunic crouching on the sand beside a big circle drawn as a thin line in the flat sand; three long straight sticks lie on the sand: the first stick lies outside the circle far from it, the second stick lies outside and just touches the edge of the circle at one point, the third stick lies across the middle of the circle and sticks out on both sides',
  'avg-0': `${P.quet} in a bright 19th-century room, measuring the height of a person with a long tape measure while a few people of different heights wait in a line, and writing in a notebook`,
  'avg-1': `four people standing side by side in a row from short to tall: a small child, a bigger child, a grown-up woman and a tall grown-up man; ${P.quet} stands at the side looking at them and tilting his head, thinking; no animals`,
  'avg-2': `only one man, ${P.quet}, sitting alone at a table with four stacks of wooden toy blocks of different heights, lifting one block with one hand from the tallest stack to put it on the shortest stack so the stacks become even`,
  'avg-3': 'children in a bright classroom holding up their survey papers and smiling, in front of a chalkboard with a simple bar chart drawn in chalk with four bars of different heights and no writing',
  'split-0': `${P.erato} in the great library of ancient Alexandria, standing in front of tall shelves full of rolled scrolls, holding a small wooden board and smiling`,
  'split-1': 'a child of about seven with short brown hair standing at a wooden table and holding one small wooden toy block; on the table small wooden blocks are laid out in three neat rectangles: one long single row, a rectangle of two rows and a rectangle of three rows; no animals',
  'split-2': `${P.erato} holding a big wooden sieve over a basket, shaking it so that some small round pebbles fall through while some bigger shiny pebbles stay in the sieve`,
  'split-3': 'a child at a desk drawing a branching tree diagram on paper with a pencil: one circle at the top splits into two circles, each splitting again into two small circles at the bottom, and the child colors the bottom circles with crayons; no numbers or writing',
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
  'table-1': `a grown-up man, ${P.joseon}, about forty years old with a short black beard, standing in a stone courtyard after rain beside a rain gauge; the rain gauge is a plain straight dark bronze tube like a tall tin can, with no handle and no cup shape, standing upright on a low square stone block; with one hand he holds only one thin wooden ruler stick and puts it straight down into the tube, his other hand rests at his side; there is no other stick; a puddle on the ground`,
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
  'cases-3': `${P.kids} in their bedroom trying on clothes, standing side by side facing us and smiling: the girl wears a red cap and a striped shirt, the boy wears a straw hat and a blue shirt; behind them more caps and shirts are spread out on a bed; no mirror`,
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
  const prompt = `${STYLE}. One single full-page illustration: ${scene}.${FACES}${BODY}`;
  if (redo.has(key)) tries[key] = (tries[key] || 0) + 1;
  const h = hash(prompt + (tries[key] || 0)).slice(0, 8), file = `ms/${key}-${h}.jpg`;
  if (list[key] === file && fs.existsSync(path.join(config.publicDir, 'img', file))) continue;
  // 이미 그려서 검수한 그림은 문구가 바뀌어도 그대로 둔다. 다시 그릴 때는 --redo, 새 장면만 새로 그린다
  if (list[key] && !redo.has(key) && fs.existsSync(path.join(config.publicDir, 'img', list[key]))) continue;
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
