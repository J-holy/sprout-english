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
const SIZE = { w: [384, 384], s: [768, 480], ref: [448, 448], i: [320, 320] };
const COST = { w: 55, s: 110, ref: 55, i: 45 }; // 실제로 써 보니 그림 한 장에 약 100 뉴런 (요금표 계산의 약 2배)

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
  5: [[[0, 'a small house and a street on a rainy day'], [2, 'inside a cozy house on a rainy day, rain on the windows'], [4, 'a small house and a street on a rainy day'], [5, 'inside a cozy house on a rainy day, rain on the windows'], [7, 'a small house and a street on a rainy day'], [16, 'a cozy home kitchen'], [18, 'a small house and a wet shiny street just after the rain, under the sun']], [[NAR, 'a 6-year-old girl with a short black bob in a green raincoat and yellow rain boots, carrying a red umbrella'], ['^$', 'a 6-year-old girl with a short black bob in a pink striped shirt and jeans, no umbrella'], ['dog', 'her small white puppy'], ['frog', 'a little shiny green frog'], ['mom', 'her mom with a brown ponytail and a cozy sweater']]],
  6: [[[0, 'inside a cozy house'], [5, 'a small garden behind a house'], [6, 'inside a cozy house'], [13, 'a home garage'], [14, 'inside a cozy house']], [[NAR, 'a 7-year-old boy with short black hair in a red and white striped shirt'], [`sister|${WE}`, 'his older sister with a long black ponytail in a yellow hoodie'], ['Max|dog|\\b(he|his)\\b', 'Max, a fluffy small brown dog'], ['ball', 'a red ball']]],
  7: [[[0, 'a sunny zoo'], [2, 'inside a city bus'], [3, 'a sunny zoo'], [12, 'the front of a cozy house in the evening'], [13, 'a cozy living room'], [16, 'a cozy home kitchen'], [18, 'a cozy living room'], [19, 'a sunny park with green grass'], [22, 'a cozy kid bedroom at night']], [[NAR, 'an 8-year-old girl with a black ponytail in a blue T-shirt'], ['mom', 'her mom with short brown hair'], ['dad', 'her dad with glasses and a gray jacket'], ['friends', 'two friends, a boy and a girl']]],
  8: ['a bright dreamy scene showing that job', [['\\bI\\b|pilot', 'a boy with short black hair dressed as a pilot'], ['sister|doctor', 'a girl with a black ponytail dressed as a doctor'], ['friend|chef', 'a boy with curly hair dressed as a chef'], ['brother|firefighter', 'a boy dressed as a firefighter'], ['cousin|artist', 'a girl with braids dressed as an artist'], ['teacher', 'a smiling teacher with glasses']]],
  9: ['a festive parade road with colorful flags', []],
  10: [[[0, 'a big red bus and a sunny zoo'], [4, 'inside a big red bus with rows of seats and windows'], [11, 'a bus stop in front of a sunny zoo'], [13, 'a sunny zoo']], [['Ben|they', 'Ben, a 6-year-old boy wearing a red cap'], ['Tom|they', 'Tom, a 6-year-old boy with curly hair in a blue shirt']]],
  11: ['a bright kid bedroom', [[NAR, 'a 6-year-old boy with short black hair in an orange shirt'], [`friend|${WE}`, 'his friend, a girl with two braids'], ['toy box|\\bbox\\b', 'a big blue toy box']]],
  12: ['a small neighborhood grocery store with fruit shelves', [['*', 'a 7-year-old girl with two hair buns in a yellow jacket'], ['*', 'a friendly shopkeeper with a mustache and a green apron']]],
  13: [[[0, 'in front of a small house on a windy day'], [4, 'a high green hill on a windy day']], [[NAR, 'a 7-year-old boy with short black hair in a blue hoodie'], ['dad|\\bhe\\b', 'his very tall dad with a beard'], ['kite|tail|string|\\bit\\b', 'a big red diamond-shaped kite with a long yellow and green tail'], ['bird', 'a little brown bird']]],
  14: [[[0, 'a cozy kid bedroom in the morning'], [2, 'a cozy home kitchen'], [5, 'a sunny park with big trees'], [18, 'a cozy family home in the evening']], [[WE, 'a 7-year-old girl with a black bob in a pink shirt'], ['dad', 'her dad, a tall grown-up man with short brown hair and a short beard in a yellow shirt'], ['dog', 'a happy small white dog'], ['Mina|friends', 'Mina, a girl with pigtails in a green dress']]],
  15: [[[0, 'a park with benches on a gray day'], [8, 'a cozy home'], [16, 'a neighborhood street with trees'], [18, 'a cozy home'], [19, 'a neighborhood street with trees'], [20, 'the front door of a cozy home']], [[NAR, 'a 7-year-old girl with long black hair in a pink jacket'], ['puppy|\\b(it|its)\\b', 'a small fluffy cream puppy with a blue collar'], [`mom|${WE}`, 'her mom, a grown-up woman with short brown hair in a beige sweater'], ['girl|\\b(she|her)\\b', 'another girl with red braids in a light blue dress, the owner of the lost dog']]],
  16: [[[0, 'a cozy kid bedroom at night'], [4, 'a launch pad with a big red and white rocket'], [7, 'outer space with stars and the moon'], [14, 'the surface of the moon with stars and the blue Earth in the sky'], [21, 'outer space with stars'], [22, 'a bright classroom'], [23, 'the surface of the moon with stars and the blue Earth in the sky']], [['*', 'a girl with black hair in a white space suit and a round helmet'], ['*', 'a boy with brown hair in a white space suit and a round helmet'], ['rocket', 'a red and white rocket'], ['^$', 'a girl with black hair in pink pajamas'], ['^$', 'a boy with brown hair in blue pajamas'], ['^$', 'a boy with brown hair in a yellow T-shirt and jeans'], ['^$', 'two classmates, a girl with braids and a boy with glasses'], ['^$', 'a girl with black hair in a red T-shirt and jeans']]],
  17: ['a colorful toy shop', [[NAR, 'a 5-year-old boy with short black hair in a green shirt'], ['Dad|\\bwe\\b', 'his dad with glasses']]],
  18: ['a forest trail with flowers and a pond', [[NAR, 'a 5-year-old girl with a black bob in a yellow raincoat'], ['Grandpa', 'her grandpa with white hair and a walking stick in a brown sweater']]],
  19: [[[0, 'a farm with a hen pen'], [4, 'a fox den in the woods'], [6, 'a farm with a hen pen'], [11, 'a fox den in the woods'], [12, 'a farm with a hen pen']], [['hen', 'a red hen'], ['fox', 'a sly orange fox'], ['egg', 'ten white eggs in a flat round straw nest on the ground'], ['chick', 'fluffy yellow chicks']],
    ['.', 'The red hen is the only grown-up chicken in this story: no other hens, roosters or birds anywhere.']],
  20: ['a muddy farmyard on a hot sunny day', [['pig', 'a pink pig'], ['duck', 'a white duck with an orange beak'], ['Kim', 'Kim, a girl with a ponytail holding a green garden hose']]],
  21: [[[0, 'a bright elementary school'], [2, 'a bright classroom'], [16, 'a school playground'], [18, 'a bright elementary school']], [[NAR, 'a 7-year-old boy with short black hair and a green school bag'], ['teacher|\\bshe\\b', 'a nice teacher with long brown hair'], ['Jisu', 'Jisu, a girl with a short bob who loves drawing']]],
  22: ['a green farm with a red barn', [[NAR, 'a 6-year-old girl with pigtails in blue overalls'], ['farmer|tractor', 'a friendly grown-up farmer man with a mustache and a straw hat'], ['tractor', 'a big red tractor'], ['cow', 'a black and white cow'], ['\\bpig\\b', 'a pink pig'], ['sheep', 'a fluffy white sheep'], ['horse', 'a brown horse'], ['chick', 'a little yellow chick']]],
  23: [[[0, 'a clean doctor\'s office'], [18, 'a sunny park with green grass']], [['*', 'a 7-year-old boy with short black hair in a light blue sweater, jeans and sneakers'], ['*', 'a kind grown-up woman doctor with glasses, brown hair in a bun, a white coat and a stethoscope']]],
  24: [[[0, 'a home living room decorated with balloons and streamers for a birthday party, no cake anywhere'], [15, 'a home living room decorated with balloons and streamers for a birthday party']], [['*', 'an 8-year-old girl with black pigtails in a yellow and pink dress wearing a party hat, the birthday girl'], ['friends|\\bwho\\b', 'her two friends, a boy with brown hair in a green shirt and a girl with blond hair in a pink dress'], ['robot', 'a tiny toy robot that fits in two hands'], ['cake|candles|wish', 'a round two-layer pink and white birthday cake with candles on a cake plate']]],
  25: ['a sunny windowsill at home', [[NAR, 'a 6-year-old girl with a short black bob in a green shirt'], ['pot|seed|sprout|flower|bud|leaves', 'a small terracotta flower pot'], ['bee', 'a small fuzzy honeybee with yellow and black stripes']]],
  26: [[[0, 'a snowy yard on a winter morning'], [3, 'a cozy front hallway of a house in winter, coats hanging on hooks'], [6, 'a snowy yard on a winter morning'], [19, 'a cozy warm living room with a fireplace']], [[NAR, 'a 7-year-old girl with black hair in a warm coat, a red hat and blue gloves'], [`brother|${WE}`, 'her younger brother in a green coat and a striped scarf'], ['Mom', 'their mom, a grown-up woman with a brown bun in a cozy purple sweater'], ['snowman|\\b(he|his)\\b', 'a big snowman with a long orange carrot nose and black stone eyes'], ['^$', 'a girl with black hair in a cozy pink sweater, no hat, no coat, no gloves']]],
  27: [[[0, 'a cozy home dining room'], [4, 'a cozy home'], [9, 'a cozy home dining room'], [13, 'a garden behind a house']], [[NAR, 'a 7-year-old girl with black pigtails'], ['Dad', 'her dad with glasses'], ['Mom', 'her mom, a grown-up woman with a brown bun'], ['sister|\\bshe\\b', 'her older sister with long hair'], ['Coco|dog', 'Coco, a small brown dog']]],
  28: [[[0, 'a sunny driveway with a family car'], [3, 'a sunny seaside road'], [5, 'a sunny sandy beach by the blue sea']], [[NAR, 'a 7-year-old girl with a black bob in a sun hat'], [`brother|${WE}`, 'her little brother, a 4-year-old boy in striped swim shorts'], [`Dad|${WE}|\\bhe\\b`, 'her dad, a grown-up man with a brown beard'], [`Mom|${WE}|\\bshe\\b`, 'her mom, a grown-up woman with wavy blond hair and sunglasses'], ['crab|\\bit\\b', 'a little red crab']]],
  29: [[[0, 'a campsite by a lake in the mountains'], [1, 'a winding mountain road'], [3, 'a campsite by a lake in the mountains'], [10, 'a campsite by a lake in the mountains at night under a starry sky'], [19, 'a campsite by a lake in the mountains on an early sunny morning']], [[NAR, 'an 8-year-old boy with short black hair in a red jacket'], [`Dad|${WE}`, 'his dad with a beard'], [`Mom|${WE}`, 'his mom, a grown-up woman with a long brown ponytail in a green jacket'], ['^$', 'a boy with short black hair in blue swim trunks'], ['^$', 'a man with a beard in red swim trunks']]],
  30: [[[0, 'a country house with a big colorful garden'], [2, 'inside a train'], [5, 'a country house with a big colorful garden'], [6, 'grandma\'s cozy country kitchen'], [9, 'a big colorful country garden'], [17, 'grandma\'s cozy living room'], [19, 'grandma\'s cozy country kitchen'], [21, 'inside a train at night'], [23, 'a country house with a big colorful garden']], [[NAR, 'an 8-year-old girl with long black hair in a yellow dress'], [`Grandma|\\b(she|her)\\b|${WE}`, 'her gentle grandma with gray hair and glasses']]],
  31: [[[0, 'a cozy home'], [2, 'inside an airplane'], [4, 'a hotel with a big pool on Jeju Island'], [7, 'a road by the sea on Jeju Island'], [9, 'a green mountain on Jeju Island'], [12, 'an orange orchard on Jeju Island'], [14, 'a horse farm on Jeju Island'], [16, 'a beach on Jeju Island at sunrise'], [17, 'a hotel room on Jeju Island at dawn'], [18, 'a small gift shop on Jeju Island'], [19, 'a hotel room on Jeju Island at night'], [21, 'a cozy home']], [[NAR, 'an 8-year-old boy with short black hair in a yellow T-shirt and jeans'], [`dad|${WE}`, 'his dad, a tall grown-up man with short black hair and glasses'], [WE, 'his mom, a grown-up woman with shoulder-length brown hair'], ['sister', 'his older sister, a 10-year-old girl with a brown ponytail in a pink dress'], ['^$', 'a boy with short black hair in blue swim trunks']]],
  32: ['a cozy future home', [[NAR, 'an 8-year-old boy with short black hair in an orange hoodie'], [`Bolt|robot|\\b(he|his)\\b|${WE}`, 'Bolt, a friendly round white and blue robot with big round eyes'], ['dog', 'a small dog']]],
};

// 문장만으로는 장면이 애매한 쪽: '책-쪽' → [나올 인물(모습에서 찾을 말), 그릴 장면]
const SCENES = {
  '14-1': ['7-year-old|white dog', "exactly one small white dog stands on the bed and licks the face of the girl still sleeping in bed, only one dog in the picture"],
  '14-2': ['7-year-old', "the girl happily eats a stack of pancakes at the kitchen table"],
  '14-3': ['dad', "her dad stands alone at the stove in a blue apron over his yellow shirt and flips pancakes in a frying pan, no children in the picture"],
  '14-4': ['7-year-old|dad', "the girl and her dad drink orange juice at the kitchen table"],
  '14-5': ['7-year-old|dad', "the girl and her dad arrive at the sunny park"],
  '14-6': ['7-year-old|dad', "the girl and her dad ride bikes along the park path"],
  '14-7': ['7-year-old|Mina', "the girl waves hello to her friend Mina in the park"],
  '14-8': ['7-year-old|Mina', "the girl and Mina play tag on the grass"],
  '14-9': ['7-year-old|Mina', "Mina runs after the girl reaching out to tag her, the girl runs away laughing"],
  '14-10': ['7-year-old', "the girl hides behind a big tree trunk and peeks out"],
  '14-11': ['7-year-old|dad|Mina', "the girl, her dad and Mina eat lunch on a picnic blanket"],
  '14-12': ['', "an open lunch box with white rice and fried eggs on a picnic blanket"],
  '14-13': ['7-year-old', "the girl reads a picture book sitting under a big tree"],
  '14-14': ['7-year-old', "the girl holds open a picture book with dinosaur pictures"],
  '14-15': ['7-year-old', "the girl points at a squirrel on the grass"],
  '14-16': ['', "a squirrel climbs up a big tree trunk"],
  '14-17': ['7-year-old|dad', "the girl and her dad ride bikes home in the afternoon"],
  '14-18': ['7-year-old', "the girl sits in a bathtub full of bubbles, only her head and shoulders above the foam, playing with a rubber duck"],
  '14-19': ['7-year-old', "the girl in pajamas yawns and smiles on the sofa"],
  '14-20': ['7-year-old|dad|white dog', "the girl, her dad and the white dog cuddle together on the sofa, smiling, exactly one dog"],
  '14-21': ['7-year-old|white dog', "the girl sleeps in bed in moonlight, the white dog curled up at her feet"],
  '15-0': ['7-year-old', "the girl walks into the park on a gray day"],
  '15-1': ['', "a gray cloudy sky over a quiet park with empty benches"],
  '15-2': ['7-year-old', "the girl stops and listens with her hand cupped to her ear"],
  '15-3': ['', "a park bench, little sound lines coming from the shadow under it"],
  '15-4': ['7-year-old', "the girl crouches down and looks under the park bench"],
  '15-5': ['7-year-old|puppy', "the girl finds a small fluffy puppy under the park bench"],
  '15-6': ['puppy', "the small puppy shivers under the bench, looking cold and hungry"],
  '15-7': ['7-year-old|puppy', "the girl gently holds the puppy and looks at its blue collar"],
  '15-8': ['7-year-old|puppy', "the girl carries the puppy in her arms through the front door of her home"],
  '15-9': ['7-year-old|puppy', "the girl puts a bowl of milk in front of the puppy"],
  '15-10': ['puppy', "the puppy laps up milk from a bowl until it is empty"],
  '15-11': ['puppy', "the happy puppy wags its tail"],
  '15-12': ['mom|puppy', "exactly one grown-up woman, her mom, kneels and washes the puppy in a small tub full of bubbles, only one woman and one puppy"],
  '15-13': ['puppy', "the clean fluffy puppy sits on a towel, looking happy"],
  '15-14': ['mom', "her mom makes a poster on paper at the table, the poster shows a drawing of the puppy"],
  '15-15': ['7-year-old', "the girl draws a picture of the puppy with crayons"],
  '15-16': ['7-year-old|mom', "the girl and her mom tape the puppy poster to a tree on the street"],
  '15-17': ['7-year-old|mom|puppy', "the girl and her mom walk down the street with the puppy on a leash, looking around for its family, only one mom"],
  '15-18': ['7-year-old|mom|puppy', "at home her mom holds a ringing phone to her ear, the black-haired girl hugs exactly one puppy in her arms, one mom, one girl, one puppy"],
  '15-19': ['red braids', "exactly one girl with red braids stands alone on the street and points at a lost dog poster on a tree trunk, nobody else, no dog"],
  '15-20': ['7-year-old|red braids|puppy', "the black-haired girl opens her front door holding the only puppy in her arms, the girl with red braids stands on the doorstep, only one puppy"],
  '15-21': ['red braids|puppy', "the girl with red braids smiles with joy when she sees the puppy"],
  '15-22': ['red braids|puppy', "the girl with red braids hugs the puppy tightly"],
  '15-23': ['red braids|puppy', "the girl with red braids walks away along the sidewalk, smiling, holding the leash of the small cream puppy trotting beside her, seen from the side, nobody else in the picture"],
  '16-0': ['pajamas', "the girl and the boy look out the bedroom window at the moon, excited"],
  '16-1': ['pajamas', "the girl and the boy point at the moon through the bedroom window"],
  '16-2': ['pajamas', "the girl and the boy pack their backpacks in the bedroom"],
  '16-3': ['pink pajamas', "the girl puts a teddy bear into her backpack"],
  '16-4': ['space suit', "the girl and the boy in white space suits put on their round helmets in front of the big red and white rocket on the launch pad"],
  '16-6': ['rocket', "the red and white rocket blasts off from the launch pad with big orange flames and clouds of smoke"],
  '16-7': ['space suit', "the girl and the boy hold on tight inside the shaking rocket cabin"],
  '16-8': ['rocket', "the red and white rocket flies up past the white clouds"],
  '16-9': ['space suit', "the girl and the boy in space suits look out the round rocket window at many twinkling stars"],
  '16-10': ['space suit', "the girl and the boy float inside the rocket cabin"],
  '16-11': ['girl with black hair in a white', "the girl in her space suit floats inside the rocket cabin and sips juice through a straw from a silver juice pouch"],
  '16-12': ['girl with black hair in a white', "only one girl floats inside the rocket cabin and waves at the small blue Earth seen through a round window"],
  '16-13': ['', "the blue Earth seen from space, looking like a blue ball"],
  '16-14': ['rocket', "the red and white rocket lands on the moon"],
  '16-15': ['space suit', "the girl and the boy jump very high above the moon ground, far up in the air, their feet high above the gray dust"],
  '16-16': ['space suit', "the girl and the boy crouch down and pick up gray moon rocks, putting them into a small bag"],
  '16-18': ['space suit', "the girl takes a picture of the boy with a camera on the moon, the blue Earth behind him"],
  '16-19': ['space suit', "the girl and the boy look through a telescope on the moon"],
  '16-20': ['space suit', "a small round green alien creature with big black eyes and two antennae peeks out from behind a moon rock and waves, the girl and the boy in space suits wave back, one Earth in the sky"],
  '16-21': ['rocket', "the red and white rocket flies home toward the blue Earth"],
  '16-22': ['red T-shirt', "the black-haired girl in a red T-shirt stands at the front of a classroom holding up a toy rocket and talking excitedly, two classmates sit at their desks and listen"],
  '16-23': ['space suit', "the girl and the boy cheer on the moon, the blue Earth behind them"],
  '17-1': ['', "a bright red and yellow striped toy beach ball on the toy shop floor"],
  '17-4': ['', "a toy train engine"],
  '17-7': ['', "a small red top hat on a toy shop shelf"],
  '17-8': ['', "a pair of ice skates"],
  '17-9': ['', "a jump rope with two red wooden handles, its long rope lying in a loose curve on the floor"],
  '17-12': ['', "a colorful party mask with feathers"],
  '17-15': ['5-year-old', "the boy happily holds up a red diamond-shaped kite with a long tail"],
  '17-16': ['5-year-old|dad', "the boy hugs his dad, holding a red kite"],
  '18-0': ['', "a bird's nest with three small blue eggs on a tree branch"],
  '18-1': ['', "a view of the blue ocean from the forest trail"],
  '18-2': ['', "a small green plant with a few fresh leaves growing from the soil beside the trail"],
  '18-3': ['', "a little girl in a yellow raincoat puts a finger to her lips near a sleeping deer"],
  '18-5': ['', "the bright sun shining over the forest trail"],
  '18-7': ['', "a colorful umbrella open on the forest trail"],
  '18-8': ['', "a small volcano far away behind the forest"],
  '18-9': ['', "a clear stream of water flowing over stones"],
  '18-10': ['', "six little round birds on a branch in two rows: three birds on an upper branch and three birds on a lower branch, six birds in all"],
  '18-11': ['', "a field of bright yellow flowers"],
  '18-12': ['', "a zoo gate with a lion and a zebra"],
  '18-13': ['5-year-old|grandpa', "the girl walks along the forest trail holding her grandpa's hand"],
  '18-14': ['5-year-old|grandpa', "the girl and her grandpa stand on a hilltop looking at a wide view of mountains and sea, the girl spreads her arms wide"],
  '18-15': ['5-year-old|grandpa', "the girl hugs her grandpa happily on the flowery forest trail"],
  '19-2': ['hen|egg', "the red hen stands proudly next to her flat straw nest piled with ten white eggs"],
  '19-3': ['egg', "a flat round straw nest on the ground in the hen pen with ten white eggs in it"],
  '19-5': ['fox', "the fox sits in its den and dreams of an egg, a thought bubble with one white egg above its head, no real eggs nearby"],
  '19-9': ['hen|fox', "the angry red hen jumps up and pecks the fox hard on the nose with her beak, feathers flying"],
  '19-10': ['fox', "the fox with one bushy tail yelps in pain and holds its sore nose with its paws"],
  '19-12': ['hen|egg', "the red hen sits on top of the straw nest, covering the eggs with her warm body, only a few eggs peek out"],
  '19-13': ['hen|egg', "the eggs in the nest begin to crack, the red hen watches"],
  '19-14': ['chick|egg', "ten fluffy yellow chicks hop out of cracked eggshells in the straw nest"],
  '19-15': ['hen|chick', "the red hen smiles with her ten fluffy yellow chicks around her"],
  '20-4': ['pig|duck', "exactly one white duck stands on the log and quacks loudly at the pink pig lying in the mud below, only one duck"],
  '20-5': ['pig|duck', "only one duck: the white duck on the log flaps its wings and quacks, the pink pig lies lazily in the mud puddle below with its eyes closed"],
  '20-6': ['pig', "the pig keeps lying in the mud with its eyes closed, smiling"],
  '20-7': ['pig|duck', "the pink pig lies in the mud under a blazing hot sun, the white duck pants in the heat, no people"],
  '20-8': ['', "a shiny wet mud puddle in the farmyard"],
  '20-10': ['duck', "the duck lands in the mud with a big splat, mud flying everywhere"],
  '20-11': ['duck', "the white duck is covered all over in brown mud, only its eyes and orange beak clean, looking messy and surprised"],
  '20-12': ['pig|duck', "the muddy pig and the muddy duck sit side by side in the mud puddle, smiling"],
  '20-14': ['Kim|pig|duck', "Kim sprays water from the hose on the pig and the duck, they laugh"],
  '20-15': ['Kim|pig|duck', "Kim, the pig and the duck play happily in the water spray under the sun"],
  '21-1': ['', "a big new school building"],
  '21-3': ['', "a classroom with many rows of desks"],
  '21-8': ['Jisu', "Jisu draws a beautiful picture with colored pencils"],
  '21-10': ['boy', "the boy holds up his green school bag"],
  '21-11': ['boy', "the boy opens a blue zipper pencil case on his desk"],
  '21-12': ['boy', "the boy holds up exactly three yellow pencils fanned out in one hand"],
  '21-13': ['boy|teacher', "the boy and the teacher sing in music class, a piano behind them"],
  '21-14': ['boy', "the boy hits a small red drum with two drumsticks in music class"],
  '21-15': ['boy', "the boy happily eats lunch from a tray in the school cafeteria"],
  '21-16': ['', "a school playground with a slide and swings"],
  '21-17': ['boy|Jisu', "the boy and Jisu run and jump on the playground"],
  '21-19': ['boy', "the boy hugs his green school bag and smiles happily in front of the school"],
  '22-1': ['', "a wide green farm field with rolling green hills and the red barn far away, no animals"],
  '22-5': ['farmer|cow', "the farmer milks the black and white cow into a bucket"],
  '22-16': ['6-year-old', "the girl feeds carrots to two goats over a fence"],
  '22-17': ['pigtails', "the girl hugs a fluffy white sheep while a black and white cow, a pink pig and a yellow chick stand around her"],
  '22-19': ['pigtails', "the girl waves goodbye to the farm at sunset, the red barn and the animals behind her"],
  '23-0': ['7-year-old|doctor', "the doctor greets the boy who sits on the exam bed"],
  '23-1': ['7-year-old', "the boy looks sick and tired with flushed pink cheeks, sitting on the exam bed holding a tissue"],
  '23-2': ['7-year-old|doctor', "the doctor asks the boy kindly, leaning toward him"],
  '23-3': ['7-year-old', "the boy sneezes into a tissue"],
  '23-4': ['7-year-old|doctor', "the doctor holds up a thermometer"],
  '23-5': ['7-year-old|doctor', "the doctor reads the thermometer, the boy has hot red cheeks"],
  '23-6': ['7-year-old|doctor', "the doctor asks the boy to open his mouth"],
  '23-7': ['7-year-old|doctor', "the boy opens his mouth wide, the doctor looks with a small light"],
  '23-8': ['7-year-old|doctor', "the doctor gently touches the boy's throat"],
  '23-9': ['7-year-old', "the boy winces a little and holds his throat"],
  '23-10': ['7-year-old|doctor', "the doctor writes on a clipboard and asks a question, the boy sits on the exam bed"],
  '23-11': ['7-year-old|doctor', "the boy shakes his head no, the doctor listens"],
  '23-12': ['7-year-old|doctor', "the doctor hands the boy a small bottle of medicine"],
  '23-13': ['7-year-old', "the boy drinks a big glass of water"],
  '23-14': ['7-year-old|doctor', "only one boy: the boy holds a soccer ball and asks the doctor hopefully"],
  '23-15': ['7-year-old|doctor', "the doctor kindly shakes her head, the boy looks a little sad"],
  '23-16': ['7-year-old|doctor', "the boy politely bows to the doctor"],
  '23-17': ['7-year-old|doctor', "the doctor waves goodbye with a warm smile"],
  '23-18': ['7-year-old', "the boy, healthy again, jumps happily in the park"],
  '23-19': ['7-year-old', "the boy happily kicks a soccer ball"],
  '24-0': ['8-year-old', "the girl in a party hat cheers among balloons"],
  '22-14': ['farmer|tractor', "the farmer drives exactly one big red tractor across the field, only one tractor in the picture"],
  '29-8': ['8-year-old|dad|mom', "the boy, his dad and his mom eat hot dogs at a wooden picnic table by the tents and smile, no text, no words, no letters"],
  '24-1': ['8-year-old|friends', "the girl with a party hat stands with her two friends, the blond girl holds a balloon and asks her a question"],
  '24-2': ['8-year-old', "the girl proudly holds up eight fingers"],
  '24-3': ['8-year-old|friends', "her two friends cheer and clap for the girl, exactly three children in the picture"],
  '24-4': ['8-year-old', "the girl looks at the front door, waiting excitedly"],
  '24-5': ['friends', "exactly two friends, one brown-haired boy in a green shirt and one blond girl in a pink dress, come in the front door carrying presents"],
  '24-6': ['8-year-old', "the girl looks curiously at a wrapped present box with a big bow"],
  '24-7': ['8-year-old|friends', "the brown-haired boy and the blond girl hand the birthday girl a wrapped present box"],
  '24-8': ['8-year-old', "the girl holds the present and asks with sparkling eyes"],
  '24-9': ['8-year-old|friends', "her two friends nod and smile at the girl, exactly three children in the picture"],
  '24-10': ['8-year-old|robot', "close-up: the birthday girl's surprised face and her two hands holding up one tiny silver toy robot above an open cardboard box, nobody else"],
  '24-11': ['8-year-old|friends|robot', "her two friends watch the girl holding the small toy robot in her hands, exactly three children in the picture"],
  '24-12': ['8-year-old|robot', "close-up: the birthday girl smiles with her eyes closed and hugs one tiny silver toy robot to her cheek with both hands, nobody else, no other robots"],
  '24-13': ['8-year-old|friends', "the girl hugs her friends"],
  '24-14': ['8-year-old|friends', "the birthday girl and her two friends look around the room searching for the cake, no cake in sight"],
  '24-15': ['cake', "a pink and white birthday cake with candles sits on a flat cake plate on a wooden table, no people"],
  '24-16': ['friends|cake', "the brown-haired boy and the blond girl stand by the table and point at the pink and white birthday cake, asking about its color"],
  '24-17': ['cake', "a close-up of the pink and white birthday cake, no people"],
  '24-18': ['8-year-old|cake', "exactly one girl, the birthday girl, sits alone at the table with her eyes closed and hands together, making a wish in front of the cake"],
  '24-19': ['8-year-old|friends|cake', "the birthday girl leans over the cake and blows out the candles with puffed cheeks, her two friends stand behind and clap"],
  '25-0': ['6-year-old', "the girl holds out her open palm showing one tiny brown seed, as small as a pea"],
  '25-1': ['', "a close-up of a child's open hand holding one tiny round brown seed"],
  '25-2': ['6-year-old|flower pot', "close-up: the girl's fingers drop one tiny brown seed onto bare dark soil in one empty terracotta pot, nothing green anywhere in the pot"],
  '25-3': ['flower pot', "a close-up of soft dark brown soil in the terracotta flower pot, nothing growing"],
  '25-4': ['6-year-old|flower pot', "the girl waters the terracotta flower pot of bare soil with a small green watering can, no plant yet"],
  '25-5': ['6-year-old|flower pot', "the girl places one terracotta pot of bare dark soil on the sunny windowsill, the soil is bare, no plant, no leaves"],
  '25-6': ['6-year-old|flower pot', "exactly one girl looks at one terracotta pot on the windowsill, the pot holds only bare dark soil, no plant, no leaves"],
  '25-7': ['6-year-old|flower pot', "exactly one girl frowns and stares at one terracotta pot of plain bare dark soil, nothing green in the pot at all"],
  '25-8': ['6-year-old|flower pot', "only one girl points excitedly at the terracotta pot on the windowsill, a tiny green tip just peeking out of the soil"],
  '25-10': ['flower pot', "a close-up of a very small thin green sprout in the terracotta pot, only one pot"],
  '25-11': ['6-year-old|flower pot', "the girl claps happily next to the terracotta pot with a tiny green sprout"],
  '25-12': ['6-year-old|flower pot', "exactly one girl kneels by the window and measures the young green plant in the terracotta pot with her hand, only one girl, only one pot"],
  '25-14': ['6-year-old|flower pot', "in the morning light the girl looks at a tall leafy green plant in the terracotta pot with one round closed green bud at the top"],
  '25-15': ['flower pot', "the round green bud at the top of the tall plant in the terracotta pot slowly opens, yellow petals peeking out"],
  '25-16': ['flower pot', "a big yellow sunflower blooms in the pot"],
  '25-17': ['flower pot', "a tall yellow sunflower in the terracotta pot on the windowsill, its stem taller than the window frame"],
  '25-18': ['flower pot|bee', "one small fuzzy bee flies to the big yellow sunflower in the terracotta pot, the bee is much smaller than the flower"],
  '25-19': ['bee', "a close-up of one small fuzzy striped bee busily collecting pollen on the center of a yellow sunflower"],
  '25-20': ['6-year-old|flower pot', "only one girl proudly hugs the terracotta pot with her tall yellow sunflower, smiling big"],
  '25-21': ['6-year-old|flower pot', "the girl smiles at her tall yellow sunflower in the pot"],
  '26-0': ['', "a snowy yard on a cold winter morning, a little house with smoke rising from the chimney, snowflakes falling, no people, no animals"],
  '26-1': ['', "a snowy yard and house covered in white snow, no people, no animals"],
  '26-2': ['', "a close-up of deep soft fluffy snow, a small boot footprint sunk deep into it, no people"],
  '26-3': ['red hat', "the girl puts on her warm coat in the front hallway, pushing an arm into the sleeve"],
  '26-4': ['red hat', "the girl pulls on a red hat and blue gloves in the front hallway"],
  '26-5': ['red hat|younger brother', "her brother stands ready in his green coat and striped scarf in the front hallway next to the girl"],
  '26-7': ['red hat|younger brother', "the girl and her brother breathe out little white puffs of breath in the fresh cold air, smiling"],
  '26-12': ['red hat|younger brother', "the girl and her brother each make small snowballs with their gloves, a little pile of snowballs between them"],
  '26-13': ['red hat|younger brother', "the brother throws a small snowball that bursts in a puff of snow on the girl's coat, she squeals and laughs"],
  '26-16': ['red hat|younger brother', "the girl and her brother lie on their backs in the soft snow, smiling"],
  '26-17': ['red hat|younger brother', "the girl and her brother lie in the snow making snow angels"],
  '26-18': ['mom|brother|7-year-old', "their mom leans out of the open front door and calls, the girl in the orange coat and red hat and her brother in the green coat run toward the door through the snow"],
  '26-19': ['pink sweater', "the girl drinks a mug of hot cocoa by the fireplace"],
  '26-20': ['pink sweater', "the girl warms her feet in fuzzy socks by the fireplace"],
  '26-21': ['pink sweater', "the girl looks out the window at the snow, smiling, holding a mug"],
  '27-0': ['pigtails', "the girl looks at an empty plate on the table, confused"],
  '27-1': ['', "an empty plate on the dining table"],
  '27-2': ['pigtails', "the girl thinks hard with a finger on her chin"],
  '27-3': ['pigtails|dad', "the girl looks at her dad and wonders"],
  '27-4': ['dad', "her dad reads a book on the sofa"],
  '27-5': ['pigtails|mom', "the girl looks at her mom and wonders"],
  '27-6': ['mom', "her mom works on a laptop at a desk"],
  '27-7': ['pigtails|sister', "the girl looks at her older sister and wonders"],
  '27-8': ['sister', "her older sister sleeps in bed"],
  '27-9': ['pigtails', "only one girl points at something small on the floor"],
  '27-10': ['', "a few tiny cake crumbs, smaller than a fingertip, and a little dab of pink frosting on the wooden floor"],
  '27-11': ['pigtails', "the girl follows a trail of tiny cake crumbs on the floor"],
  '27-12': ['', "a trail of tiny cake crumbs leading to the open garden door"],
  '27-13': ['', "a trail of tiny cake crumbs going out across the garden grass"],
  '27-14': ['pigtails', "the girl peeks into the garden"],
  '27-15': ['Coco', "the small brown dog sits in the garden with cream on its nose"],
  '27-16': ['pigtails|Coco', "the girl looks at the dog curiously"],
  '27-17': ['Coco', "the small brown dog eats the cake from a plate on the grass"],
  '27-18': ['pigtails|Coco', "the girl throws up her hands in surprise, the dog looks up with cream on its face"],
  '27-19': ['Coco', "the small brown dog smiles happily with cream on its face"],
  '27-20': ['pigtails|Coco', "the girl laughs and shrugs, petting the dog"],
  '27-21': ['pigtails|Coco', "the girl and the dog share a new slice of cake on a blanket"],
  '28-0': ['7-year-old|dad|mom|brother', "the family loads beach toys into the car, exactly four people: the girl, her little brother, her dad and her mom"],
  '28-1': ['7-year-old', "the girl cheers holding a bucket and a spade"],
  '28-2': ['7-year-old|dad|mom|brother', "the family sits inside the car with seatbelts on, dad at the steering wheel, mom beside him, the girl and her little brother in the back seat"],
  '28-3': ['', "a family car drives along a seaside road"],
  '28-4': ['7-year-old', "the girl sits in the back seat of the car and looks out the open car window at the sea road, impatient"],
  '28-5': ['7-year-old|dad|mom|brother', "the family arrives at the sunny beach with their bags"],
  '28-6': ['7-year-old', "the girl looks at the sea with her hand over her eyes"],
  '28-7': ['', "the big blue sea with gentle waves"],
  '28-8': ['7-year-old|dad', "her dad carries a folded beach umbrella across the sand, the girl watches curiously"],
  '28-9': ['dad', "her dad sets up a big beach umbrella"],
  '28-10': ['7-year-old|mom', "her mom sits on a beach towel and opens a book, the girl watches"],
  '28-11': ['mom', "her mom reads a book under the beach umbrella"],
  '28-12': ['7-year-old', "the girl kneels in the sand with a bucket and a spade, ready to start building"],
  '28-13': ['7-year-old', "the girl builds a sandcastle"],
  '28-14': ['7-year-old', "the girl looks around, wondering"],
  '28-15': ['7-year-old|brother', "her little brother helps build the sandcastle with a bucket"],
  '28-16': ['7-year-old', "the girl points at something in the sand"],
  '28-17': ['crab', "only one little red crab in the sand next to the sandcastle"],
  '28-18': ['crab', "the little red crab walks sideways across the sand"],
  '28-19': ['crab', "the little red crab runs into the waves"],
  '28-20': ['7-year-old|dad|mom|brother', "from behind: exactly four people stand in a row on the sand watching the orange sunset over the sea: dad, mom, the girl in a sun hat and her little brother"],
  '28-21': ['7-year-old|dad|mom|brother', "the family waves goodbye to the beach at sunset"],
  '29-0': ['8-year-old|dad|mom', "the boy and his family arrive at a campsite with backpacks"],
  '29-1': ['', "a family car drives on a winding mountain road"],
  '29-2': ['8-year-old', "the boy sleeps in the back seat of the car"],
  '29-4': ['8-year-old|dad', "the boy and his dad put up a yellow tent together, the boy holds a tent pole, dad pushes in a tent stake"],
  '29-5': ['8-year-old|dad', "the boy and his dad wipe sweat from their foreheads, tired but proud, next to the yellow tent"],
  '29-9': ['8-year-old|dad|mom', "exactly three people sit around the campfire at dusk: the boy, his dad and his mom, each toasts a marshmallow on a long stick"],
  '29-10': ['', "the campsite at night with a glowing campfire and a tent"],
  '29-11': ['8-year-old|dad|mom', "the family lies on a blanket and looks up at the dark night sky"],
  '29-13': ['8-year-old|dad|mom', "exactly three people by the campfire: his dad tells a funny story with big gestures, the boy and his mom laugh"],
  '29-14': ['8-year-old', "the boy stands by the tent at night and listens, exactly one owl sits on a branch of a tree"],
  '29-15': ['', "an owl hoots on a branch under the moon"],
  '29-16': ['8-year-old', "the boy hides in his sleeping bag, a little scared"],
  '29-18': ['8-year-old|dad|mom', "the family sleeps snugly inside the tent in sleeping bags, seen through the open tent door"],
  '29-19': ['swim trunks', "the boy and his dad swim and splash in the lake in the morning"],
  '29-20': ['blue swim trunks', "the boy shivers in the cold lake water, hugging himself"],
  '29-21': ['8-year-old|dad', "the boy and his dad catch a fish with a fishing rod"],
  '29-22': ['8-year-old', "the boy gently puts the fish back into the lake"],
  '29-23': ['8-year-old', "the boy waves goodbye to the campsite, smiling"],
  '30-1': ['', "a cozy country house among green fields"],
  '30-2': ['8-year-old', "the girl rides a train, sitting by the window"],
  '30-3': ['8-year-old', "the girl looks out the train window, smiling"],
  '30-4': ['', "cows and horses in green fields seen from a train window"],
  '30-5': ['8-year-old|grandma', "grandma hugs the girl at the front door"],
  '30-6': ['8-year-old', "the girl smells fresh bread in the kitchen"],
  '30-7': ['grandma', "grandma takes a loaf of bread out of the oven"],
  '30-8': ['8-year-old|grandma', "the girl and grandma eat slices of bread spread with red strawberry jam at the kitchen table, a jar of jam on the table"],
  '30-13': ['8-year-old', "the girl waters the flowers with a small green watering can, water sprinkling on the flowers"],
  '30-15': ['8-year-old', "the girl stands very still as a butterfly sits on her hand"],
  '30-16': ['8-year-old', "a butterfly flies up and away from the girl's open hand into the sky, the girl watches it go"],
  '30-17': ['8-year-old|grandma', "grandma reads a picture book aloud to the girl, who sits close beside her on the sofa listening"],
  '30-20': ['8-year-old|grandma', "the girl and grandma sit at the kitchen table eating bowls of vegetable soup"],
  '30-21': ['8-year-old', "the girl sits by the train window at night, waving goodbye"],
  '30-22': ['8-year-old', "inside a train car at night, the girl sits alone on a train seat by the window and looks out, a little sad, missing grandma"],
  '30-23': ['8-year-old|grandma', "the girl hugs her grandma tightly"],
  '31-1': ['8-year-old', "the boy points at a picture map with a small green island in the blue sea, no words on the map"],
  '31-2': ['8-year-old|dad|mom|sister', "the family sits in airplane seats with seatbelts on, excited, looking out the round windows"],
  '31-3': ['8-year-old', "the boy looks out the airplane window at the sea below"],
  '31-6': ['swim trunks', "the boy swims happily in the big hotel pool, splashing water"],
  '31-7': ['8-year-old|dad', "his dad stands next to a small blue rental car holding up the car keys, the boy cheers"],
  '31-8': ['', "a small blue car drives along a road by the sea"],
  '31-11': ['8-year-old|dad|mom|sister', "the family takes a picture together with a camera at the top of the green mountain, smiling"],
  '31-13': ['8-year-old', "the boy tastes a sweet orange, delighted"],
  '31-14': ['8-year-old|sister', "the older sister, a girl with a ponytail in a pink dress, sits on a brown horse, the boy in a yellow T-shirt stands on the ground and waves at her"],
  '31-15': ['8-year-old', "the boy holds out a carrot and a brown horse eats it from his hand"],
  '31-17': ['8-year-old', "the boy yawns and rubs his eyes in bed while an alarm clock rings, the window still dark blue at dawn"],
  '31-18': ['8-year-old', "the boy holds up a small wrapped gift box in a gift shop full of orange souvenirs"],
  '31-19': ['8-year-old', "the boy sits at a desk in the hotel room writing in a diary notebook with a pencil, night outside"],
  '31-20': ['8-year-old|sister', "the boy and his sister look at photos together"],
  '31-22': ['8-year-old', "the boy crosses off squares on a wall calendar with a red pencil, the calendar shows only little empty squares and no numbers"],
  '31-23': ['8-year-old', "the boy looks out the window at the summer sun with his hands together"],
  '32-0': ['8-year-old|Bolt', "the boy stands next to his robot friend Bolt"],
  '32-1': ['Bolt', "Bolt waves hello"],
  '32-3': ['8-year-old|Bolt', "Bolt gently wakes the sleeping boy in bed"],
  '32-4': ['8-year-old|Bolt', "Bolt cooks breakfast at the kitchen stove while the boy sits at the table waiting with a fork"],
  '32-5': ['Bolt', "Bolt cooks eggs and toast in a frying pan"],
  '32-6': ['Bolt|dog', "Bolt walks the small dog on a leash along a sunny sidewalk outside the house"],
  '32-8': ['8-year-old|Bolt', "the boy holds out his notebook and pencil to Bolt, Bolt crosses its arms and shakes its head"],
  '32-9': ['8-year-old|Bolt', "the boy writes in his notebook at a desk, Bolt stands beside him with a glowing light bulb on its face screen, pointing at the notebook"],
  '32-10': ['8-year-old|Bolt', "the boy and Bolt play a video game on the sofa"],
  '32-11': ['Bolt', "Bolt kicks a soccer ball skillfully"],
  '32-12': ['8-year-old|Bolt', "the soccer ball flies into the net behind Bolt the goalkeeper, the boy raises his arms and cheers"],
  '32-13': ['8-year-old|Bolt', "at night the boy lies on his back in bed under a blanket with empty hands, eyes on the robot, Bolt the robot sits on a chair beside the bed and holds an open picture book, reading aloud, the moon in the window"],
  '32-14': ['8-year-old|Bolt', "at night Bolt the robot stands by the door and reaches up to the light switch on the wall with its robot hand, the boy is lying in bed far from the wall with both hands under the blanket, the room goes dim, the moon in the window"],
  '32-15': ['8-year-old|Bolt', "the boy looks at Bolt and wonders"],
  '32-16': ['Bolt', "Bolt charges with a cable plugged into the wall"],
  '32-17': ['Bolt', "Bolt sleeps standing in the corner with its eyes closed"],
  '32-18': ['Bolt', "Bolt dreams, a thought bubble with stars above its head"],
  '32-19': ['8-year-old|Bolt', "the boy and Bolt hug as best friends"],
  '32-20': ['8-year-old|Bolt', "the boy and Bolt go on an adventure in a jungle with a map"],
  '32-21': ['8-year-old|Bolt', "the boy points at the reader with a smile, Bolt beside him"],
  '32-22': ['Bolt', "Bolt shows many helpful tool arms"],
  '32-23': ['8-year-old|Bolt', "the boy and Bolt look at a shining future city"],
  '1-15': ['girl|mom|dad', 'the girl, her mom and her dad sit on a picnic blanket on the grass and eat sandwiches and fruit from the big basket'],
  '1-2': ['', 'a big round chocolate chip cookie'],
  '1-16': ['girl|mom|dad', 'the girl, her mom and her dad happily eat sandwiches together on a picnic blanket, the big basket beside them'],
  '1-5': ['', 'a picnic basket full of fruit: strawberries, oranges and pears'],
  '1-7': ['', 'a glass jar of golden honey with a wooden honey dipper, honey dripping'],
  '1-10': ['', 'a fresh green kiwi fruit cut in half next to a whole brown kiwi fruit'],
  '3-2': ['mom', 'his mom stirs a pot of soup on the stove in the kitchen'],
  '3-5': ['dad', 'his tall dad sings happily with his mouth open, little music notes floating around'],
  '3-7': ['sister', 'his sister smiles next to a birthday cake with six candles'],
  '3-8': ['sister', 'his sister sits on the grass and gently pets a small gray kitten on her lap'],
  '3-11': ['baby', 'the baby brother sits on a rug and happily holds a yellow rubber toy duck'],
  '3-18': ['boy|mom|dad|sister|baby|grandma|grandpa|Coco', 'a family portrait in the garden with exactly seven people and one dog. Back row: grandpa in his straw hat, grandma, dad with his short beard, mom in her apron. Front row: the boy, his sister, the baby brother sitting on the grass, and the dog. Only one grandpa and only one grandma'],
  '3-19': ['boy|mom|dad', 'the boy hugs his mom and dad tightly in one warm hug, all three smiling, hearts floating above'],
  '4-2': ['Lily|Sam', 'Lily smiles and asks Sam a question, one hand raised in a friendly wave'],
  '4-4': ['Lily|Sam', 'Sam asks Lily a question with a curious smile, tilting his head'],
  '4-7': ['Lily|Sam', 'Sam asks Lily a question while they walk together on the park path'],
  '4-8': ['Lily|Sam', 'Lily points to a small house next to the park, Sam looks'],
  '4-9': ['Lily|Sam', 'Sam holds a black and white soccer ball and shows it to Lily'],
  '4-11': ['Lily|Sam', 'Sam holds out a box of colorful crayons to Lily'],
  '4-12': ['Lily|Sam', 'Lily proudly points at her purple shirt, Sam listens'],
  '4-13': ['Lily|Sam', 'Sam points at his green shirt and grins'],
  '4-14': ['Lily|Sam', 'Sam holds the only soccer ball in his two hands and smiles, asking Lily to play, Lily has empty hands'],
  '4-17': ['Lily|Sam', 'the curly-haired boy in the green shirt catches a soccer ball in his two hands, the long-haired girl in the purple shirt claps for him with empty hands, just one ball in the whole picture'],
  '4-18': ['Lily|Sam', 'Lily and Sam wave goodbye to each other at the park gate in the warm evening light'],
  '4-19': ['Lily|Sam', 'Lily and Sam walk side by side holding hands, smiling'],
  '5-2': ['striped', 'the girl covers her ears by the window as lightning flashes in the dark sky outside'],
  '5-3': ['striped|puppy', 'the small white puppy hides under a blanket, shaking, and the girl gently pets it'],
  '5-5': ['striped', 'raindrops run down the glass of a big window, the girl looks out from inside'],
  '5-6': ['striped', 'the girl presses her face to the window and looks out at the rain, wanting to go out'],
  '5-14': ['raincoat', 'the girl sits on the front step and pulls off a wet sock, her yellow boots beside her'],
  '5-16': ['striped|mom', 'her mom hands the girl, back home with a towel over her shoulders, a warm mug of milk in the kitchen'],
  '5-17': ['striped', 'the girl sips warm milk from a mug with both hands, steam rising, smiling'],
  '5-19': ['', 'a bright clear blue sky over the wet street, puddles shining in the sun, no rain'],
  '5-21': ['raincoat|puppy|frog', 'the girl in her raincoat jumps happily in a puddle with her puppy, a green frog hops nearby'],
  '6-0': ['boy', 'the boy looks around the living room calling for his dog, an empty dog bed on the floor, no dog anywhere'],
  '6-1': ['boy', 'the boy holds a dog food bowl in the kitchen and looks around for his dog, no dog anywhere'],
  '6-2': ['boy', 'the boy kneels and looks under the bed, there is nothing under the bed, no dog'],
  '6-3': ['boy', 'the boy peeks into an empty kitchen, no dog anywhere'],
  '6-4': ['boy', 'the boy peeks into the bathroom, the bathtub is empty, no dog anywhere'],
  '6-5': ['boy', 'the boy looks behind flower bushes in the garden, no dog anywhere'],
  '6-6': ['boy', 'the boy stands in the living room scratching his head, puzzled and worried'],
  '6-8': ['boy|sister', 'his sister thinks with a finger on her chin, the boy waits'],
  '6-9': ['sister', 'his sister smiles, a dreamy thought bubble above her head shows a small fluffy brown dog playing with a red ball'],
  '6-10': ['boy|sister', 'the boy and his sister crawl on the living room floor looking for something, the floor is empty, no ball and no dog anywhere'],
  '6-11': ['boy|sister', 'the boy and his sister look into an empty dog bed, there is no ball and no dog in it'],
  '6-12': ['boy|sister', 'the boy opens a door and looks behind it, his sister watches, nothing is there'],
  '6-13': ['boy|sister', 'the boy and his sister look inside the empty family car in the garage'],
  '6-14': ['boy|sister', 'the boy and his sister turn their heads, hands cupped to their ears, listening'],
  '6-15': ['boy|sister', 'the boy and his sister listen carefully, eyes wide, hands cupped to their ears'],
  '6-16': ['boy|sister', 'the boy and his sister tiptoe into the living room toward a big sofa'],
  '6-17': ['boy|sister', 'the boy and his sister stand in front of a big sofa and point at it in surprise, a fluffy brown dog tail sticks out from behind the back of the sofa, only the tail is visible'],
  '6-18': ['boy|sister|Max', 'the small fluffy brown dog lies curled up asleep on the floor behind the sofa, the boy and his sister peek at it with curious faces'],
  '6-21': ['boy|sister|Max', 'the boy and his sister hug the happy dog, the red ball next to them'],
  '7-0': ['8-year-old', 'the girl stands happily at the zoo entrance gate, giraffes and zebras behind her'],
  '7-1': ['8-year-old|mom|dad', 'the girl in her blue T-shirt walks into the zoo in the middle, holding hands with her mom on one side and her dad on the other'],
  '7-2': ['8-year-old|mom|dad', 'the girl, her mom and her dad sit in seats on a city bus, the girl looks out the window'],
  '7-3': ['8-year-old', 'only one girl stands by the zoo fence and looks up at a very tall giraffe'],
  '7-4': ['', 'a tall giraffe eats green leaves from a tree in the zoo'],
  '7-5': ['8-year-old', 'the girl looks at a big gray elephant behind the zoo fence'],
  '7-6': ['', 'a big gray elephant drinks water from a pond with its trunk in the zoo'],
  '7-7': ['', 'playful monkeys jump and swing on ropes and branches in the zoo'],
  '7-8': ['8-year-old', 'a monkey on a branch waves its hand at the girl, she waves back'],
  '7-9': ['8-year-old|dad', 'the girl and her dad eat ice cream cones together on a bench at the zoo'],
  '7-10': ['8-year-old', 'the girl licks a cold pink ice cream cone, smiling'],
  '7-11': ['8-year-old', 'the girl hugs a small plush toy lion with a fluffy yellow mane at the zoo gift shop'],
  '7-12': ['8-year-old|mom|dad', 'the girl, her mom and her dad walk in the front door of their house in the evening'],
  '7-13': ['8-year-old', 'the girl lies tired on the sofa, yawning'],
  '7-14': ['8-year-old', 'the girl looks out the window at the rain on a gray morning'],
  '7-15': ['8-year-old|mom', 'the girl and her mom read picture books together on the sofa'],
  '7-16': ['8-year-old|mom', 'the girl and her mom put cookies on a baking tray in the kitchen'],
  '7-17': ['8-year-old|mom', 'the girl and her mom smell a tray of fresh warm cookies, steam rising'],
  '7-18': ['8-year-old', 'the girl looks out the window, the rain has stopped and the sun comes out'],
  '7-19': ['8-year-old|friends', 'the girl runs to meet her two friends in the park'],
  '7-20': ['8-year-old|friends', 'the girl kicks a soccer ball, her two friends run after it in the park'],
  '7-21': ['8-year-old|friends', 'the girl and her two friends laugh together on the grass'],
  '7-22': ['8-year-old', 'the girl writes in her diary at her desk at night, a small lamp on'],
  '7-23': ['8-year-old', 'the girl smiles in bed hugging her diary'],
  '8-14': ['artist', 'the artist girl holds a paint palette and a brush, smiling, an easel beside her'],
  '8-9': ['chef', 'only one chef boy proudly holds up a wooden spoon in a small kitchen'],
  '8-0': ['teacher', 'the smiling teacher asks a group of children what they want to be, the children think'],
  '8-3': ['pilot', 'the boy pilot flies a small plane around a big globe'],
  '8-4': ['pilot', 'the boy pilot waves in front of the Eiffel Tower, the Statue of Liberty and an Asian pagoda'],
  '8-5': ['pilot', 'the boy pilot holds up a postcard with a stamp'],
  '8-11': ['chef', 'the chef boy stands proudly in front of his own small pizza shop'],
  '8-16': ['teacher', 'the teacher spreads her arms wide and smiles, children around her look up at shining stars'],
  '8-17': ['pilot', 'the boy pilot smiles and points at the reader'],
  '8-18': ['', 'a child holds a microphone and sings on a small stage with lights'],
  '8-19': ['', 'a child in a white lab coat looks into a microscope'],
  '8-20': ['pilot|doctor|firefighter|artist', 'the pilot, the doctor, the firefighter and the artist children stand together and cheer'],
  '8-21': ['pilot|doctor', 'two children study with books and pencils at a desk'],
  '8-22': ['firefighter|artist', 'two children climb up a small hill with big smiles, helping each other'],
  '8-23': ['pilot|doctor|chef|artist', 'children look up at a rainbow and shining stars, smiling with joy'],
  '9-13': ['', 'a panda, a tiger, a zebra and an owl march happily in a line down the parade road'],
  '10-4': ['Ben|Tom', 'Ben and Tom sit side by side on the same bus seat, smiling at each other'],
  '10-2': ['', 'a big red city bus parked on a sunny street, no people'],
  '10-5': ['Ben|Tom', 'Ben and Tom sit in their bus seats sweating, the hot sun shining through the window'],
  '10-10': ['Ben|Tom', 'Ben and Tom sleep leaning on each other in their bus seats'],
  '10-11': ['', 'the big red bus stops at a bus stop in front of the zoo gate'],
  '10-13': ['Ben|Tom', 'Ben and Tom cheer at the zoo entrance, zebras, a lion and an elephant behind'],
  '10-14': ['Ben', 'Ben watches a little lion cub lying in the sun behind the zoo fence'],
  '10-15': ['Tom', 'Tom laughs at a hippo rolling in the mud behind the zoo fence'],
  '10-16': ['Ben|Tom', 'Ben and Tom wave happily at the zoo, animals behind them'],
  '11-0': ['6-year-old', 'only one boy proudly stands next to his big blue toy box in his bedroom'],
  '11-1': ['6-year-old', 'only one boy stands next to a big blue toy box that is almost as tall as him'],
  '11-2': ['6-year-old', 'only one boy lifts the lid of a big blue toy box, toys peeking out'],
  '11-3': ['6-year-old', 'the boy holds a small red toy car in his hand'],
  '11-4': ['6-year-old', 'a small red toy car zooms fast across the bedroom floor, the boy cheers'],
  '11-6': ['6-year-old', 'the boy hugs a small soft brown teddy bear'],
  '11-7': ['6-year-old', 'the boy holds a blue ball'],
  '11-10': ['6-year-old', 'a small white toy robot walks across the floor, the boy watches amazed'],
  '11-11': ['6-year-old', 'a small white toy robot talks with a blank speech bubble, the boy laughs'],
  '11-13': ['6-year-old', 'the boy bangs a toy drum and covers one ear, loud sound lines around the drum'],
  '11-14': ['6-year-old', 'the boy looks at a jigsaw puzzle box on the floor'],
  '11-15': ['6-year-old', 'the boy puts together ten jigsaw puzzle pieces on the floor'],
  '11-18': ['6-year-old', 'the boy plays happily surrounded by his toy car, teddy bear, robot and drum'],
  '11-19': ['6-year-old', 'only one boy puts his toy car and teddy bear back into a big blue toy box'],
  '12-0': ['girl|shopkeeper', 'the shopkeeper smiles and greets the girl as she walks into the store'],
  '12-1': ['girl|shopkeeper', 'the girl points at a pile of red apples, the shopkeeper nods'],
  '12-2': ['girl|shopkeeper', 'the shopkeeper holds up a red apple and asks with a curious face'],
  '12-3': ['girl|shopkeeper', 'the girl holds up three fingers, three red apples on the counter'],
  '12-4': ['girl|shopkeeper', 'the shopkeeper holds up a bunch of yellow bananas toward the girl'],
  '12-5': ['girl|shopkeeper', 'the girl politely shakes her head and waves her hand at the bananas'],
  '12-6': ['girl|shopkeeper', 'the girl asks the shopkeeper a question, looking around the shelves'],
  '12-7': ['girl|shopkeeper', 'the shopkeeper points to a fridge full of milk bottles'],
  '12-8': ['girl', 'the girl touches a milk bottle in the open fridge'],
  '12-9': ['girl', 'the girl holds a frosty cold milk bottle and shivers a little, smiling'],
  '12-10': ['girl|shopkeeper', 'the girl points at a chocolate muffin on the counter'],
  '12-11': ['girl|shopkeeper', 'the shopkeeper holds up a chocolate muffin'],
  '12-12': ['girl|shopkeeper', 'the girl puts her hands together and asks politely, looking at the muffin'],
  '12-13': ['girl|shopkeeper', 'the shopkeeper smiles and hands the muffin to the girl'],
  '12-14': ['girl|shopkeeper', 'the girl opens her small coin purse at the counter'],
  '12-15': ['girl|shopkeeper', 'the shopkeeper holds up two green dollar bills'],
  '12-16': ['girl|shopkeeper', 'the girl hands two dollar bills to the shopkeeper over the counter'],
  '12-17': ['girl|shopkeeper', 'the shopkeeper hands a paper shopping bag with apples, milk and a muffin to the girl'],
  '12-18': ['girl|shopkeeper', 'the girl smiles and waves, holding her shopping bag'],
  '12-19': ['girl|shopkeeper', 'the shopkeeper waves goodbye as the girl leaves through the shop door'],
  '13-0': ['7-year-old|kite', 'the boy proudly holds up his big red kite in front of his house'],
  '13-2': ['kite', 'the long yellow and green ribbon tail of the red kite flutters in the sky'],
  '13-3': ['7-year-old', 'the boy stands in front of his house holding his red kite, his hair blowing in a strong wind, trees bending'],
  '13-6': ['7-year-old|kite', 'the boy holds the long kite string with both hands, the red kite above'],
  '13-8': ['7-year-old|kite', 'the red kite rises high into the sky, the boy looks up and cheers'],
  '13-11': ['kite|bird', 'a little brown bird flies in the sky right next to the red kite'],
  '13-13': ['7-year-old|kite', 'the boy pulls hard on the string as a strong wind tugs the red kite'],
  '13-16': ['dad|kite', 'the tall dad reaches up and pulls the red kite out of the tree branches'],
  '13-21': ['7-year-old|dad|kite', 'the boy and his dad sit on the hill smiling, the red kite flying above them'],
  '14-0': ['7-year-old', 'the girl wakes up and stretches in bed, an alarm clock ringing'],
  '2-5': ['cat|rat', 'the fat orange cat stares longingly at the red knit beanie on the rat\'s head and reaches one paw toward it'],
  '9-0': ['', 'a cute baby elephant proudly lifting its long nose high in the air'],
  '9-11': ['', 'a small red toy yo-yo bouncing at the end of its long string, held by a child\'s hand that comes in from the top of the picture'],
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
// 메뉴·버튼 아이콘: 이모지 → 그릴 것. 둥근 배지로 잘라 보여 준다 (style.css .ico)
const ICONS = {
  '🏠': 'a cozy little house with a red roof', '📚': 'a stack of colorful picture books', '💰': 'a small coin purse with gold coins',
  '💬': 'two round speech bubbles with hearts', '🙋': 'a smiling child raising one hand', '🧪': 'a clipboard with a check list and a pencil',
  '🌱': 'a little green sprout growing from soil', '🧭': 'a treasure map with a compass', '📒': 'a yellow notebook full of word cards',
  '🔁': 'two green circular arrows around a gold star', '📖': 'an open picture book with a rainbow coming out', '🎤': 'a shiny microphone with music notes',
  '🎈': 'three colorful balloons', '🃏': 'two matching picture cards with an apple', '✏️': 'a yellow pencil and a notebook with a check mark',
  '🛍️': 'a shopping bag full of stars', '🖨️': 'a printed worksheet with crayons', '🔑': 'a golden key', '🔔': 'a little golden bell', '🛠️': 'a wrench and a hammer',
  '🐸': 'a happy green frog on a lily pad', '🐟': 'a little blue fish next to a fishing hook', '⏱️': 'a red stopwatch', '🧺': 'a woven basket full of fruit',
};
if (only !== 's' && !book) for (const [e, label] of Object.entries(ICONS)) {
  const prompt = `${STYLE}. A small app icon: ${label}, one simple object in the center, filling most of the picture, soft round cream background, no words, no letters.`;
  jobs.push({ kind: 'i', key: e, label, prompt, file: `i/${hash('icon' + e).slice(0, 12)}.jpg` });
}
if (only !== 's' && !book) for (const [e, { label, isWord }] of words) {
  const prompt = `${STYLE}. A flash card picture: ${isWord ? `one ${label}, clearly showing the meaning of the English word "${label}"` : `a simple picture of: ${label}`}. One clear subject in the center, plain soft cream background.`;
  jobs.push({ kind: 'w', key: e, label, prompt, file: `w/${hash(e).slice(0, 12)}.jpg` });
}
// 그림 속에 글자가 그려지지 않게. 이미 그린 그림을 다시 그리지 않도록 그림 설명 비교(hash)에는 넣지 않는다
const NOTEXT = ' No words, letters or writing anywhere in the picture.';
// 문장을 따옴표·느낌표 없는 장면 설명으로 (따옴표 안 문장은 그림 속 글자로 그려지기 쉽다)
const plain = t => t.replace(/["“”!?]/g, '').replace(/\.$/, '').replace(/^./, c => c.toLowerCase());
const refs = {}; // 인물 기준 그림: 파일 경로 → 그림 설명
if (only !== 'w') for (const s of [...STORIES].sort((a, b) => a.id - b.id)) {
  if (book && s.id !== book) continue;
  const [places, cast, note] = BOOKS[s.id] || ['a bright place', []];
  let last = [];
  s.pages.forEach(([text], i) => {
    const letter = isLetterLine(text);
    const thing = letter && text.replace(/^[A-Z] is for | ends with [A-Z]\.?$/g, '').replace(/\.$/, '');
    const scene = SCENES[`${s.id}-${i}`];
    // 배경: 쪽마다 다른 책은 [[시작 쪽, 배경], …]
    const place = Array.isArray(places) ? places.filter(([from]) => from <= i).pop()[1] : places;
    let who = letter ? [] : scene ? (scene[0] ? cast.filter(c => new RegExp(scene[0]).test(c[1])) : []) : cast.filter(([k]) => k === '*' || new RegExp(k, 'i').test(text));
    if (scene && scene[0] && !who.length) console.warn(`장면 ${s.id}-${i}: '${scene[0]}'에 맞는 인물이 없어요`);
    // 대명사만 있으면 앞 쪽 인물을 이어 쓰고, 그때만 앞 문장을 함께 준다 (다른 인물이 덤으로 그려지지 않게)
    const carried = !letter && !scene && !who.length && /\b(he|she|it|they|his|her|its|them|him)\b/i.test(text);
    if (carried) who = last;
    last = who; who = who.slice(0, 8); // 5명이 넘으면 기준 그림을 한 장에 모아서 준다 (groupRef)
    const prev = carried && i && !isLetterLine(s.pages[i - 1][0]) ? ` Just before this, ${plain(s.pages[i - 1][0])}.` : '';
    const prompt = letter
      ? `${STYLE}. One single full-page illustration: ${scene ? scene[1] : `a big cute ${thing}`}, in ${place}.`
      : `${STYLE}. One single full-page illustration of this moment, with the action shown clearly: ${scene ? scene[1] : plain(text)}.${prev} `
        + (who.length ? `Characters in this picture: ${who.map(c => c[1]).join('; ')}. ${['', 'Only one character', 'Only two characters', 'Only three characters', 'Only four characters', 'Exactly five characters', 'Exactly six characters', 'Exactly seven characters', 'Exactly eight characters'][who.length]} in the whole picture, each appearing once.${who.length > 4 ? ' The reference sheet shows them in this order, left to right, top row first.' : ''} Use the reference images only for each character's look and colors; draw new poses, expressions and positions that act out the sentence.` : 'Only show what the sentence mentions.')
        + ` Background: ${place}, drawn in the same style as the characters, everything illustrated, not a photo, not realistic.${note && who.some(c => new RegExp(note[0]).test(c[1])) ? ` ${note[1]}` : ''}`;
    const refFiles = who.map(([, d]) => { const f = path.join(refDir, `${hash(styleName + d).slice(0, 12)}.png`); refs[f] = d; return f; });
    jobs.push({ kind: 's', key: `${s.id}-${i}`, refFiles, label: text, prompt, draw: prompt + NOTEXT, file: `s/${s.id}-${i}.jpg` });
  });
}

// 이미 그린 그림은 건너뛴다 (그림 설명이 바뀌었거나 --redo 로 고른 것만 다시)
const manPath = path.join(outDir, 'manifest.json');
let man = { w: {}, s: {}, i: {}, h: {}, n: {} };
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
const ORDER = { i: 0, s: 1, w: 2 };
const queue = [...todo].sort((a, b) => ORDER[a.kind] - ORDER[b.kind]); // 메뉴 아이콘(몇 장 안 됨) → 스토리북 → 단어
// 인물 기준 그림은 한 번만 그린다 (두 작업이 동시에 같은 인물을 그리지 않게)
const refJobs = {};
const refMade = f => fs.existsSync(f) ? null : (refJobs[f] ||= draw(`${STYLE}. Character reference: ${refs[f]}, alone, full body, standing, facing forward, plain white background.`, SIZE.ref, parseInt(hash(f).slice(0, 7), 16), [])
  .then(buf => { save(buf, f, false); console.log(`  인물 기준 그림: ${refs[f]}`); }));
// 5명 이상(온 가족)이 나오는 쪽: 기준 그림은 4장까지라서 모두를 나란히 붙인 한 장으로 준다
const GROUP_PY = 'import sys\nfrom PIL import Image\nims=[Image.open(p).convert("RGB") for p in sys.argv[2:]]\nH=384\nims=[i.resize((max(1,i.width*H//i.height),H)) for i in ims]\ncols=4\nW=max(i.width for i in ims)\nrows=(len(ims)+cols-1)//cols\nc=Image.new("RGB",(W*cols,H*rows),"white")\nfor k,i in enumerate(ims):\n  c.paste(i,((k%cols)*W,(k//cols)*H))\nc.save(sys.argv[1])';
function groupRef(files) {
  if (files.length <= 4) return files;
  const f = path.join(refDir, `group-${hash(files.join('|')).slice(0, 12)}.png`);
  if (!fs.existsSync(f)) execFileSync(path.join(MFLUX, '.venv/bin/python'), ['-I', '-c', GROUP_PY, f, ...files]);
  return [f];
}
async function worker() {
  while (queue.length && !stopped) {
    const j = queue.shift();
    try {
      for (const f of j.refFiles || []) await refMade(f);
      save(await draw(j.draw || j.prompt, SIZE[j.kind], seedOf(j), groupRef(j.refFiles || [])), path.join(outDir, j.file));
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
