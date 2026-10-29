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
  5: [[[0, 'a small house and a street on a rainy day'], [2, 'inside a cozy house on a rainy day, rain on the windows'], [4, 'a small house and a street on a rainy day'], [5, 'inside a cozy house on a rainy day, rain on the windows'], [7, 'a small house and a street on a rainy day'], [16, 'a cozy home kitchen'], [18, 'a small house and a street on a rainy day']], [[NAR, 'a 6-year-old girl with a short black bob in a green raincoat and yellow rain boots, carrying a red umbrella'], ['dog', 'her small white puppy'], ['frog', 'a little shiny green frog'], ['mom', 'her mom with a brown ponytail and a cozy sweater']]],
  6: [[[0, 'inside a cozy house'], [5, 'a small garden behind a house'], [6, 'inside a cozy house'], [13, 'a home garage'], [14, 'inside a cozy house']], [[NAR, 'a 7-year-old boy with short black hair in a red and white striped shirt'], [`sister|${WE}`, 'his older sister with a long black ponytail in a yellow hoodie'], ['Max|dog|\\b(he|his)\\b', 'Max, a fluffy small brown dog'], ['ball', 'a red ball']]],
  7: [[[0, 'a sunny zoo'], [2, 'inside a city bus'], [3, 'a sunny zoo'], [12, 'the front of a cozy house in the evening'], [13, 'a cozy living room'], [16, 'a cozy home kitchen'], [18, 'a cozy living room'], [19, 'a sunny park with green grass'], [22, 'a cozy kid bedroom at night']], [[NAR, 'an 8-year-old girl with a black ponytail in a blue T-shirt'], ['mom', 'her mom with short brown hair'], ['dad', 'her dad with glasses and a gray jacket'], ['friends', 'two friends, a boy and a girl']]],
  8: ['a bright dreamy scene showing that job', [['\\bI\\b|pilot', 'a boy with short black hair dressed as a pilot'], ['sister|doctor', 'a girl with a black ponytail dressed as a doctor'], ['friend|chef', 'a boy with curly hair dressed as a chef'], ['brother|firefighter', 'a boy dressed as a firefighter'], ['cousin|artist', 'a girl with braids dressed as an artist'], ['teacher', 'a smiling teacher with glasses']]],
  9: ['a festive parade road with colorful flags', []],
  10: [[[0, 'a big red bus and a sunny zoo'], [4, 'inside a big red bus with rows of seats and windows'], [11, 'a bus stop in front of a sunny zoo'], [13, 'a sunny zoo']], [['Ben|they', 'Ben, a 6-year-old boy wearing a red cap'], ['Tom|they', 'Tom, a 6-year-old boy with curly hair in a blue shirt']]],
  11: ['a bright kid bedroom', [[NAR, 'a 6-year-old boy with short black hair in an orange shirt'], [`friend|${WE}`, 'his friend, a girl with two braids'], ['toy box|\\bbox\\b', 'a big blue toy box']]],
  12: ['a small neighborhood grocery store with fruit shelves', [['*', 'a 7-year-old girl with two hair buns in a yellow jacket'], ['*', 'a friendly shopkeeper with a mustache and a green apron']]],
  13: ['a high green hill on a windy day', [[NAR, 'a 7-year-old boy with short black hair in a blue hoodie'], ['dad|\\bhe\\b', 'his very tall dad with a beard'], ['kite|tail|string|\\bit\\b', 'a big red diamond-shaped kite with a long yellow and green tail'], ['bird', 'a little brown bird']]],
  14: [[[0, 'a cozy kid bedroom in the morning'], [2, 'a cozy home kitchen'], [5, 'a sunny park with big trees'], [18, 'a cozy family home in the evening']], [[WE, 'a 7-year-old girl with a black bob in a pink shirt'], ['dad', 'her dad in a blue apron'], ['dog', 'a happy small white dog'], ['Mina|friends', 'Mina, a girl with pigtails in a green dress']]],
  15: [[[0, 'a park with benches on a gray day'], [8, 'a cozy home'], [16, 'a neighborhood street with trees'], [18, 'a cozy home'], [19, 'a neighborhood street with trees'], [20, 'the front door of a cozy home']], [[NAR, 'a 7-year-old girl with long black hair in a pink jacket'], ['puppy|\\b(it|its)\\b', 'a small fluffy cream puppy with a blue collar'], [`mom|${WE}`, 'her mom with short brown hair'], ['girl|\\b(she|her)\\b', 'another girl with red braids, the puppy\'s owner']]],
  16: [[[0, 'a cozy kid bedroom at night'], [4, 'a launch pad with a big red and white rocket'], [7, 'outer space with stars and the moon'], [14, 'the surface of the moon with stars and the blue Earth in the sky'], [21, 'outer space with stars'], [22, 'a bright classroom'], [23, 'the surface of the moon with stars and the blue Earth in the sky']], [['*', 'a girl with black hair in a white space suit and a round helmet'], ['*', 'a boy with brown hair in a white space suit and a round helmet'], ['rocket', 'a red and white rocket']]],
  17: ['a colorful toy shop', [[NAR, 'a 5-year-old boy with short black hair in a green shirt'], ['Dad|\\bwe\\b', 'his dad with glasses']]],
  18: ['a forest trail with flowers and a pond', [[NAR, 'a 5-year-old girl with a black bob in a yellow raincoat'], ['Grandpa', 'her grandpa with white hair and a walking stick']]],
  19: [[[0, 'a farm with a hen pen'], [4, 'a fox den in the woods'], [6, 'a farm with a hen pen'], [11, 'a fox den in the woods'], [12, 'a farm with a hen pen']], [['hen', 'a red hen'], ['fox', 'a sly orange fox'], ['egg', 'ten white eggs in a straw nest'], ['chick', 'fluffy yellow chicks']]],
  20: ['a muddy farmyard on a hot sunny day', [['pig', 'a pink pig'], ['duck', 'a white duck with an orange beak'], ['Kim', 'Kim, a girl with a ponytail holding a green garden hose']]],
  21: [[[0, 'a bright elementary school'], [2, 'a bright classroom'], [16, 'a school playground'], [18, 'a bright elementary school']], [[NAR, 'a 7-year-old boy with short black hair and a green school bag'], ['teacher|\\bshe\\b', 'a nice teacher with long brown hair'], ['Jisu', 'Jisu, a girl with a short bob who loves drawing']]],
  22: ['a green farm with a red barn', [[NAR, 'a 6-year-old girl with pigtails in blue overalls'], ['farmer|tractor', 'a friendly farmer with a straw hat']]],
  23: [[[0, 'a clean doctor\'s office'], [18, 'a sunny park with green grass']], [['*', 'a 7-year-old boy with short black hair in striped pajamas'], ['*', 'a kind doctor with glasses and a white coat']]],
  24: ['a home birthday party with balloons', [['*', 'an 8-year-old girl with a black ponytail wearing a party hat'], ['friends|\\bwho\\b', 'her friends, a boy and a girl'], ['robot', 'a toy robot'], ['cake|candles|wish', 'a pink and white birthday cake with candles']]],
  25: ['a sunny windowsill at home', [[NAR, 'a 6-year-old girl with a short black bob in a green shirt'], ['pot|seed|sprout|flower|bud|leaves', 'a small terracotta flower pot'], ['bee', 'a fuzzy bee']]],
  26: [[[0, 'a snowy yard on a winter morning'], [19, 'a cozy warm living room with a fireplace']], [[NAR, 'a 7-year-old girl with black hair in a warm coat, a red hat and blue gloves'], [`brother|${WE}`, 'her younger brother in a green coat and a striped scarf'], ['Mom', 'their mom'], ['snowman|\\b(he|his)\\b', 'a big snowman with a long orange carrot nose and black stone eyes']]],
  27: [[[0, 'a cozy home dining room'], [4, 'a cozy home'], [9, 'a cozy home dining room'], [13, 'a garden behind a house']], [[NAR, 'a 7-year-old girl with black pigtails'], ['Dad', 'her dad with glasses'], ['Mom', 'her mom with a bun'], ['sister|\\bshe\\b', 'her older sister with long hair'], ['Coco|dog', 'Coco, a small brown dog']]],
  28: [[[0, 'a sunny driveway with a family car'], [3, 'a sunny seaside road'], [5, 'a sunny sandy beach by the blue sea']], [[NAR, 'a 7-year-old girl with a black bob in a sun hat'], [`brother|${WE}`, 'her little brother in striped swim shorts'], [`Dad|${WE}|\\bhe\\b`, 'her dad with a beard'], [`Mom|${WE}|\\bshe\\b`, 'her mom with sunglasses'], ['crab|\\bit\\b', 'a little red crab']]],
  29: [[[0, 'a campsite by a lake in the mountains'], [1, 'a winding mountain road'], [3, 'a campsite by a lake in the mountains']], [[NAR, 'an 8-year-old boy with short black hair in a red jacket'], [`Dad|${WE}`, 'his dad with a beard'], [`Mom|${WE}`, 'his mom with a ponytail']]],
  30: [[[0, 'a country house with a big colorful garden'], [2, 'inside a train'], [5, 'a country house with a big colorful garden'], [6, 'grandma\'s cozy country kitchen'], [9, 'a big colorful country garden'], [17, 'grandma\'s cozy living room'], [19, 'grandma\'s cozy country kitchen'], [21, 'inside a train at night'], [23, 'a country house with a big colorful garden']], [[NAR, 'an 8-year-old girl with long black hair in a yellow dress'], [`Grandma|\\b(she|her)\\b|${WE}`, 'her gentle grandma with gray hair and glasses']]],
  31: [[[0, 'a cozy home'], [2, 'inside an airplane'], [4, 'a hotel with a big pool on Jeju Island'], [7, 'a road by the sea on Jeju Island'], [9, 'a green mountain on Jeju Island'], [12, 'an orange orchard on Jeju Island'], [14, 'a horse farm on Jeju Island'], [16, 'a beach on Jeju Island at sunrise'], [18, 'a small gift shop on Jeju Island'], [19, 'a hotel room on Jeju Island at night'], [21, 'a cozy home']], [[NAR, 'an 8-year-old boy with short black hair and a backpack'], [`dad|${WE}`, 'his dad'], [WE, 'his mom'], ['sister', 'his older sister with a ponytail']]],
  32: ['a cozy future home', [[NAR, 'an 8-year-old boy with short black hair in an orange hoodie'], [`Bolt|robot|\\b(he|his)\\b|${WE}`, 'Bolt, a friendly round white and blue robot with big round eyes'], ['dog', 'a small dog']]],
};

// 문장만으로는 장면이 애매한 쪽: '책-쪽' → [나올 인물(모습에서 찾을 말), 그릴 장면]
const SCENES = {
  '14-2': ['7-year-old', "the girl happily eats a stack of pancakes at the kitchen table"],
  '14-3': ['dad', "her dad in a blue apron flips pancakes in a frying pan"],
  '14-4': ['7-year-old|dad', "the girl and her dad drink orange juice at the kitchen table"],
  '14-5': ['7-year-old|dad', "the girl and her dad arrive at the sunny park"],
  '14-6': ['7-year-old|dad', "the girl and her dad ride bikes along the park path"],
  '14-7': ['7-year-old|Mina', "the girl waves hello to her friend Mina in the park"],
  '14-8': ['7-year-old|Mina', "the girl and Mina play tag on the grass"],
  '14-10': ['7-year-old', "the girl hides behind a big tree trunk and peeks out"],
  '14-11': ['7-year-old|dad|Mina', "the girl, her dad and Mina eat lunch on a picnic blanket"],
  '14-13': ['7-year-old', "the girl reads a picture book sitting under a big tree"],
  '14-14': ['7-year-old', "the girl holds open a picture book with dinosaur pictures"],
  '14-15': ['7-year-old', "the girl points at a squirrel on the grass"],
  '14-16': ['', "a squirrel climbs up a big tree trunk"],
  '14-17': ['7-year-old|dad', "the girl and her dad ride bikes home in the afternoon"],
  '14-18': ['7-year-old', "the girl takes a bubble bath, bubbles everywhere"],
  '14-19': ['7-year-old', "the girl in pajamas yawns and smiles on the sofa"],
  '14-20': ['7-year-old|dad|white dog', "the girl, her dad and the white dog cuddle together on the sofa, smiling"],
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
  '15-12': ['mom|puppy', "her mom washes the puppy in a small tub full of bubbles"],
  '15-13': ['puppy', "the clean fluffy puppy sits on a towel, looking happy"],
  '15-14': ['mom', "her mom makes a poster on paper at the table, the poster shows a drawing of the puppy"],
  '15-15': ['7-year-old', "the girl draws a picture of the puppy with crayons"],
  '15-16': ['7-year-old|mom', "the girl and her mom tape the puppy poster to a tree on the street"],
  '15-17': ['7-year-old|mom|puppy', "the girl and her mom walk down the street with the puppy, looking around"],
  '15-18': ['7-year-old|mom|puppy', "her mom answers a ringing phone at home, the girl and the puppy listen"],
  '15-19': ['red braids', "a girl with red braids stops and looks at the puppy poster on the tree"],
  '15-20': ['7-year-old|red braids|puppy', "the girl opens the front door holding the puppy, the girl with red braids stands outside"],
  '15-21': ['red braids|puppy', "the girl with red braids smiles with joy when she sees the puppy"],
  '15-22': ['red braids|puppy', "the girl with red braids hugs the puppy tightly"],
  '15-23': ['7-year-old|red braids|puppy', "the girl with red braids walks away with the puppy, waving goodbye to the girl"],
  '16-0': ['girl|boy', "the girl and the boy look out the bedroom window at the moon, excited"],
  '16-1': ['girl|boy', "the girl and the boy point at the moon through the bedroom window"],
  '16-2': ['girl|boy', "the girl and the boy pack their backpacks in the bedroom"],
  '16-3': ['girl', "the girl puts a teddy bear into her backpack"],
  '16-7': ['girl|boy', "the girl and the boy hold on tight inside the shaking rocket cabin"],
  '16-8': ['rocket', "the red and white rocket flies up past the white clouds"],
  '16-10': ['girl|boy', "the girl and the boy float inside the rocket cabin"],
  '16-11': ['boy', "the boy floats and drinks juice from a pouch with a straw"],
  '16-12': ['girl', "the girl waves at the blue Earth through the round rocket window"],
  '16-13': ['', "the blue Earth seen from space, looking like a blue ball"],
  '16-14': ['rocket', "the red and white rocket lands on the moon"],
  '16-19': ['girl|boy', "the girl and the boy look through a telescope on the moon"],
  '16-20': ['girl|boy', "a cute little green alien waves hello to the girl and the boy"],
  '16-21': ['rocket', "the red and white rocket flies home toward the blue Earth"],
  '16-22': ['boy', "the boy tells his friends at school about the space trip, the friends listen amazed"],
  '16-23': ['girl|boy', "the girl and the boy cheer on the moon, the blue Earth behind them"],
  '17-4': ['', "a toy train engine"],
  '17-8': ['', "a pair of ice skates"],
  '17-12': ['', "a colorful party mask with feathers"],
  '17-16': ['5-year-old|dad', "the boy hugs his dad, holding a red kite"],
  '18-1': ['', "a view of the blue ocean from the forest trail"],
  '18-5': ['', "the bright sun shining over the forest trail"],
  '18-8': ['', "a colorful umbrella on the forest trail"],
  '18-9': ['', "a small volcano far away behind the forest"],
  '18-10': ['', "a clear stream of water flowing over stones"],
  '18-3': ['', "a little girl in a yellow raincoat puts a finger to her lips near a sleeping deer"],
  '18-11': ['', "six little birds sitting in a row on a branch"],
  '18-12': ['', "a field of bright yellow flowers"],
  '18-13': ['', "a zoo gate with a lion and a zebra"],
  '18-15': ['5-year-old|Grandpa', "the girl and her grandpa stand on a hilltop looking at a wide view of mountains and sea"],
  '19-5': ['fox|egg', "the fox in its den dreams of an egg, a thought bubble with an egg above its head"],
  '19-10': ['fox', "the fox yelps in pain and holds its nose"],
  '19-13': ['hen|egg', "the eggs in the nest begin to crack, the red hen watches"],
  '19-15': ['hen|chick', "the red hen smiles with her ten fluffy yellow chicks around her"],
  '20-5': ['pig|duck', "the duck flaps its wings and quacks loudly at the pig lying in the mud"],
  '20-6': ['pig', "the pig keeps lying in the mud with its eyes closed, smiling"],
  '20-7': ['', "the hot sun blazing over the muddy farmyard"],
  '20-8': ['', "a shiny wet mud puddle in the farmyard"],
  '20-10': ['duck', "the duck lands in the mud with a big splat, mud flying everywhere"],
  '20-14': ['Kim|pig|duck', "Kim sprays water from the hose on the pig and the duck, they laugh"],
  '20-15': ['Kim|pig|duck', "Kim, the pig and the duck play happily in the water spray under the sun"],
  '21-1': ['', "a big new school building"],
  '21-3': ['', "a classroom with many rows of desks"],
  '21-8': ['Jisu', "Jisu draws a beautiful picture with colored pencils"],
  '21-10': ['boy', "the boy holds up his green school bag"],
  '21-12': ['boy', "the boy holds up three pencils"],
  '21-13': ['boy|teacher', "the boy and the teacher sing in music class, a piano behind them"],
  '21-15': ['boy', "the boy happily eats lunch from a tray in the school cafeteria"],
  '21-16': ['', "a school playground with a slide and swings"],
  '21-17': ['boy|Jisu', "the boy and Jisu run and jump on the playground"],
  '22-5': ['farmer', "the farmer milks a black and white cow into a bucket"],
  '22-16': ['6-year-old', "the girl feeds carrots to two goats over a fence"],
  '23-0': ['7-year-old|doctor', "the doctor greets the boy who sits on the exam bed"],
  '23-1': ['7-year-old', "the boy looks sick and tired with a red nose, sitting on the exam bed"],
  '23-2': ['7-year-old|doctor', "the doctor asks the boy kindly, leaning toward him"],
  '23-3': ['7-year-old', "the boy sneezes into a tissue"],
  '23-4': ['7-year-old|doctor', "the doctor holds up a thermometer"],
  '23-5': ['7-year-old|doctor', "the doctor reads the thermometer, the boy has hot red cheeks"],
  '23-6': ['7-year-old|doctor', "the doctor asks the boy to open his mouth"],
  '23-7': ['7-year-old|doctor', "the boy opens his mouth wide, the doctor looks with a small light"],
  '23-8': ['7-year-old|doctor', "the doctor gently touches the boy's throat"],
  '23-9': ['7-year-old', "the boy winces a little and holds his throat"],
  '23-10': ['7-year-old|doctor', "the doctor asks the boy a question, writing on a clipboard"],
  '23-11': ['7-year-old', "the boy shakes his head no"],
  '23-12': ['7-year-old|doctor', "the doctor hands the boy a small bottle of medicine"],
  '23-13': ['7-year-old', "the boy drinks a big glass of water"],
  '23-14': ['7-year-old', "the boy holds a soccer ball and asks hopefully"],
  '23-15': ['7-year-old|doctor', "the doctor kindly shakes her head, the boy looks a little sad"],
  '23-16': ['7-year-old|doctor', "the boy politely bows to the doctor"],
  '23-17': ['7-year-old|doctor', "the doctor waves goodbye with a warm smile"],
  '23-18': ['7-year-old', "the boy, healthy again, jumps happily in a T-shirt"],
  '23-19': ['7-year-old', "the boy happily kicks a soccer ball"],
  '24-0': ['8-year-old', "the girl in a party hat cheers among balloons"],
  '24-1': ['8-year-old|friends', "a friend asks the girl a question, holding a balloon"],
  '24-2': ['8-year-old', "the girl proudly holds up eight fingers"],
  '24-3': ['8-year-old|friends', "her friends cheer and clap for the girl"],
  '24-4': ['8-year-old', "the girl looks at the front door, waiting excitedly"],
  '24-5': ['friends', "her friends come in the door carrying presents"],
  '24-6': ['8-year-old', "the girl looks curiously at a wrapped present box with a big bow"],
  '24-7': ['8-year-old|friends', "her friends hand the girl a wrapped present box"],
  '24-8': ['8-year-old', "the girl holds the present and asks with sparkling eyes"],
  '24-9': ['8-year-old|friends', "her friends nod and smile at the girl"],
  '24-10': ['8-year-old|robot', "the girl opens the box and finds a toy robot, amazed"],
  '24-11': ['8-year-old|friends|robot', "her friends watch the girl holding the toy robot"],
  '24-12': ['8-year-old|robot', "the girl hugs the toy robot happily"],
  '24-13': ['8-year-old|friends', "the girl hugs her friends"],
  '24-14': ['8-year-old|friends', "the girl and her friends look around the room for the cake"],
  '24-15': ['cake', "a pink and white birthday cake with candles on the table"],
  '24-16': ['8-year-old|cake', "the girl looks at the pink and white birthday cake"],
  '24-17': ['cake', "a close-up of the pink and white birthday cake"],
  '24-18': ['8-year-old|cake', "the girl closes her eyes and makes a wish in front of the cake with lit candles"],
  '24-19': ['8-year-old|friends|cake', "the girl blows out the candles, her friends clap"],
  '25-6': ['6-year-old|flower pot', "the girl looks at a pot of soil with nothing growing"],
  '25-7': ['6-year-old|flower pot', "the girl frowns at the pot, there is still no sprout"],
  '25-8': ['6-year-old|flower pot', "the girl points excitedly at the pot"],
  '25-16': ['flower pot', "a big yellow sunflower blooms in the pot"],
  '25-21': ['6-year-old|flower pot', "the girl smiles at her tall yellow sunflower in the pot"],
  '26-1': ['', "a snowy yard and house covered in white snow"],
  '26-16': ['7-year-old', "the girl lies down in the soft snow, smiling"],
  '26-17': ['7-year-old|younger brother', "the girl and her brother lie in the snow making snow angels"],
  '26-18': ['mom', "their mom calls from the front door"],
  '26-19': ['7-year-old', "the girl drinks a mug of hot cocoa by the fireplace"],
  '26-20': ['7-year-old', "the girl warms her feet in fuzzy socks by the fireplace"],
  '26-21': ['7-year-old', "the girl looks out the window at the snow, smiling, holding a mug"],
  '27-0': ['pigtails', "the girl looks at an empty plate on the table, confused"],
  '27-1': ['', "an empty plate on the dining table"],
  '27-2': ['pigtails', "the girl thinks hard with a finger on her chin"],
  '27-3': ['pigtails|dad', "the girl looks at her dad and wonders"],
  '27-4': ['dad', "her dad reads a book on the sofa"],
  '27-5': ['pigtails|mom', "the girl looks at her mom and wonders"],
  '27-6': ['mom', "her mom works on a laptop at a desk"],
  '27-7': ['pigtails|sister', "the girl looks at her older sister and wonders"],
  '27-8': ['sister', "her older sister sleeps in bed"],
  '27-9': ['pigtails', "the girl points at something small on the floor"],
  '27-10': ['', "a little cake crumb on the wooden floor"],
  '27-11': ['pigtails', "the girl follows a trail of cake crumbs on the floor"],
  '27-12': ['', "a trail of cake crumbs leading to the open garden door"],
  '27-13': ['', "a trail of cake crumbs going out into the garden"],
  '27-14': ['pigtails', "the girl peeks into the garden"],
  '27-15': ['Coco', "the small brown dog sits in the garden with cream on its nose"],
  '27-16': ['pigtails|Coco', "the girl looks at the dog curiously"],
  '27-17': ['Coco', "the small brown dog eats the cake from a plate on the grass"],
  '27-18': ['pigtails|Coco', "the girl throws up her hands in surprise, the dog looks up with cream on its face"],
  '27-19': ['Coco', "the small brown dog smiles happily with cream on its face"],
  '27-20': ['pigtails|Coco', "the girl laughs and shrugs, petting the dog"],
  '27-21': ['pigtails|Coco', "the girl and the dog share a new slice of cake on a blanket"],
  '28-0': ['7-year-old|dad|mom|brother', "the family loads beach toys into the car"],
  '28-1': ['7-year-old', "the girl cheers holding a bucket and a spade"],
  '28-2': ['7-year-old|dad|mom|brother', "the family sits in the car, ready to go"],
  '28-3': ['', "a family car drives along a seaside road"],
  '28-4': ['7-year-old', "the girl looks out the car window impatiently"],
  '28-5': ['7-year-old|dad|mom|brother', "the family arrives at the sunny beach with their bags"],
  '28-6': ['7-year-old', "the girl looks at the sea with her hand over her eyes"],
  '28-7': ['', "the big blue sea with gentle waves"],
  '28-9': ['dad', "her dad sets up a big beach umbrella"],
  '28-11': ['mom', "her mom reads a book under the beach umbrella"],
  '28-13': ['7-year-old', "the girl builds a sandcastle"],
  '28-14': ['7-year-old', "the girl looks around, wondering"],
  '28-15': ['7-year-old|brother', "her little brother helps build the sandcastle with a bucket"],
  '28-16': ['7-year-old', "the girl points at something in the sand"],
  '28-17': ['crab', "a little red crab in the sand next to the sandcastle"],
  '28-18': ['crab', "the little red crab walks sideways across the sand"],
  '28-19': ['crab', "the little red crab runs into the waves"],
  '28-20': ['7-year-old|dad|mom|brother', "the family looks at the orange sunset sky over the sea"],
  '28-21': ['7-year-old|dad|mom|brother', "the family waves goodbye to the beach at sunset"],
  '29-0': ['8-year-old|dad|mom', "the boy and his family arrive at a campsite with backpacks"],
  '29-1': ['', "a family car drives on a winding mountain road"],
  '29-2': ['8-year-old', "the boy sleeps in the back seat of the car"],
  '29-10': ['', "the campsite at night with a glowing campfire and a tent"],
  '29-13': ['8-year-old|dad|mom', "his dad tells a funny story by the campfire, the boy and his mom laugh"],
  '29-14': ['8-year-old', "the boy listens at night, an owl sits in a tree"],
  '29-15': ['', "an owl hoots on a branch under the moon"],
  '29-16': ['8-year-old', "the boy hides in his sleeping bag, a little scared"],
  '29-18': ['8-year-old|dad|mom', "the family sleeps in the tent"],
  '29-19': ['8-year-old|dad', "the boy and his dad swim in the lake in the morning"],
  '29-20': ['8-year-old', "the boy shivers in the cold lake water"],
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
  '30-8': ['8-year-old|grandma', "the girl and grandma eat bread with strawberry jam at the kitchen table"],
  '30-15': ['8-year-old', "the girl stands very still as a butterfly sits on her hand"],
  '30-21': ['8-year-old', "the girl sits by the train window at night, waving goodbye"],
  '30-22': ['8-year-old', "the girl looks out the dark train window, missing grandma"],
  '30-23': ['8-year-old|grandma', "the girl hugs her grandma tightly"],
  '31-1': ['8-year-old', "the boy points at Jeju Island on a map"],
  '31-3': ['8-year-old', "the boy looks out the airplane window at the sea below"],
  '31-13': ['8-year-old', "the boy tastes a sweet orange, delighted"],
  '31-17': ['8-year-old', "the boy yawns at sunrise"],
  '31-20': ['8-year-old|sister', "the boy and his sister look at photos together"],
  '31-22': ['8-year-old', "the boy marks the days on a calendar with a pencil, smiling"],
  '31-23': ['8-year-old', "the boy looks out the window at the summer sun with his hands together"],
  '32-0': ['8-year-old|Bolt', "the boy stands next to his robot friend Bolt"],
  '32-1': ['Bolt', "Bolt waves hello"],
  '32-3': ['8-year-old|Bolt', "Bolt gently wakes the sleeping boy in bed"],
  '32-5': ['Bolt', "Bolt cooks eggs and toast in a frying pan"],
  '32-6': ['Bolt|dog', "Bolt walks the small dog on a leash"],
  '32-8': ['8-year-old|Bolt', "Bolt shakes its head and points at the boy's notebook"],
  '32-9': ['8-year-old|Bolt', "Bolt shows a light bulb picture on its screen while the boy writes"],
  '32-10': ['8-year-old|Bolt', "the boy and Bolt play a video game on the sofa"],
  '32-11': ['Bolt', "Bolt kicks a soccer ball skillfully"],
  '32-12': ['8-year-old|Bolt', "the boy kicks the ball into the goal past Bolt and cheers"],
  '32-13': ['8-year-old|Bolt', "Bolt reads a bedtime story to the boy in bed"],
  '32-14': ['8-year-old|Bolt', "Bolt turns off the bedroom light"],
  '32-15': ['8-year-old|Bolt', "the boy looks at Bolt and wonders"],
  '32-16': ['Bolt', "Bolt charges with a cable plugged into the wall"],
  '32-17': ['Bolt', "Bolt sleeps standing in the corner with its eyes closed"],
  '32-18': ['Bolt', "Bolt dreams, a thought bubble with stars above its head"],
  '32-19': ['8-year-old|Bolt', "the boy and Bolt hug as best friends"],
  '32-20': ['8-year-old|Bolt', "the boy and Bolt go on an adventure in a jungle with a map"],
  '32-21': ['8-year-old|Bolt', "the boy points at the reader with a smile, Bolt beside him"],
  '32-22': ['Bolt', "Bolt shows many helpful tool arms"],
  '32-23': ['8-year-old|Bolt', "the boy and Bolt look at a shining future city"],
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
  '4-14': ['Lily|Sam', 'Sam holds a soccer ball under his arm and invites Lily to play'],
  '4-17': ['Lily|Sam', 'Sam catches the black and white soccer ball with both hands, Lily claps for him'],
  '4-18': ['Lily|Sam', 'Lily and Sam wave goodbye to each other at the park gate in the warm evening light'],
  '4-19': ['Lily|Sam', 'Lily and Sam walk side by side holding hands, smiling'],
  '5-2': ['girl', 'the girl covers her ears by the window as lightning flashes in the dark sky outside'],
  '5-3': ['girl|puppy', 'the small white puppy hides under a blanket, shaking, and the girl gently pets it'],
  '5-5': ['girl', 'raindrops run down the glass of a big window, the girl looks out from inside'],
  '5-6': ['girl', 'the girl presses her face to the window and looks out at the rain, wanting to go out'],
  '5-14': ['girl', 'the girl sits on the front step and pulls off a wet sock, her yellow boots beside her'],
  '5-16': ['girl|mom', 'her mom hands the girl, wrapped in a towel, a warm mug of milk in the kitchen'],
  '5-17': ['girl', 'the girl sips warm milk from a mug with both hands, steam rising, smiling'],
  '5-19': ['', 'a bright clear blue sky over the wet street, puddles shining in the sun, no rain'],
  '5-21': ['girl|puppy|frog', 'the girl in her raincoat jumps happily in a puddle with her puppy, a green frog hops nearby'],
  '6-0': ['boy', 'the boy looks around the living room calling for his dog, an empty dog bed on the floor, no dog anywhere'],
  '6-1': ['boy', 'the boy holds a dog food bowl in the kitchen and looks around for his dog, no dog anywhere'],
  '6-2': ['boy', 'the boy kneels and looks under the bed, there is nothing under the bed, no dog'],
  '6-3': ['boy', 'the boy peeks into an empty kitchen, no dog anywhere'],
  '6-4': ['boy', 'the boy peeks into the bathroom, the bathtub is empty, no dog anywhere'],
  '6-5': ['boy', 'the boy looks behind flower bushes in the garden, no dog anywhere'],
  '6-6': ['boy', 'the boy stands in the living room scratching his head, puzzled and worried'],
  '6-8': ['boy|sister', 'his sister thinks with a finger on her chin, the boy waits'],
  '6-9': ['sister', 'his sister smiles, a dreamy thought bubble above her head shows a small fluffy brown dog playing with a red ball'],
  '6-10': ['boy|sister', 'the boy and his sister look around the floor for a red ball, no dog anywhere'],
  '6-11': ['boy|sister', 'the boy and his sister look into an empty dog bed, there is no ball and no dog in it'],
  '6-12': ['boy|sister', 'the boy opens a door and looks behind it, his sister watches, nothing is there'],
  '6-13': ['boy|sister', 'the boy and his sister look inside the empty family car in the garage'],
  '6-14': ['boy|sister', 'the boy and his sister turn their heads, hands cupped to their ears, listening'],
  '6-15': ['boy|sister', 'the boy and his sister listen carefully, eyes wide, hands cupped to their ears'],
  '6-16': ['boy|sister', 'the boy and his sister tiptoe into the living room toward a big sofa'],
  '6-17': ['boy|sister|Max', 'the boy and his sister peek over the back of the sofa and find the dog lying on the floor behind it'],
  '6-18': ['boy|Max', 'the dog lies curled up on the floor behind the sofa with its eyes closed, the boy peeks over the sofa'],
  '6-21': ['boy|sister|Max', 'the boy and his sister hug the happy dog, the red ball next to them'],
  '7-0': ['8-year-old', 'the girl stands happily at the zoo entrance gate, giraffes and zebras behind her'],
  '7-1': ['8-year-old|mom|dad', 'the girl walks into the zoo holding hands with her mom and dad'],
  '7-2': ['8-year-old|mom|dad', 'the girl, her mom and her dad sit in seats on a city bus, the girl looks out the window'],
  '7-3': ['8-year-old', 'the girl looks up at a very tall giraffe behind the zoo fence'],
  '7-4': ['', 'a tall giraffe eats green leaves from a tree in the zoo'],
  '7-5': ['8-year-old', 'the girl looks at a big gray elephant behind the zoo fence'],
  '7-6': ['', 'a big gray elephant drinks water from a pond with its trunk in the zoo'],
  '7-7': ['', 'playful monkeys jump and swing on ropes and branches in the zoo'],
  '7-8': ['8-year-old', 'a monkey on a branch waves its hand at the girl, she waves back'],
  '7-9': ['8-year-old|dad', 'the girl and her dad eat ice cream cones together on a bench at the zoo'],
  '7-10': ['8-year-old', 'the girl licks a cold pink ice cream cone, smiling'],
  '7-11': ['8-year-old', 'the girl holds a small soft plush toy lion at the zoo gift shop'],
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
  '10-5': ['Ben|Tom', 'Ben and Tom sit in their bus seats sweating, the hot sun shining through the window'],
  '10-10': ['Ben|Tom', 'Ben and Tom sleep leaning on each other in their bus seats'],
  '10-11': ['', 'the big red bus stops at a bus stop in front of the zoo gate'],
  '10-13': ['Ben|Tom', 'Ben and Tom cheer at the zoo entrance, zebras, a lion and an elephant behind'],
  '10-14': ['Ben', 'Ben watches a little lion cub lying in the sun behind the zoo fence'],
  '10-15': ['Tom', 'Tom laughs at a hippo rolling in the mud behind the zoo fence'],
  '10-16': ['Ben|Tom', 'Ben and Tom wave happily at the zoo, animals behind them'],
  '11-0': ['6-year-old|toy box', 'the boy proudly shows his big blue toy box in his bedroom'],
  '11-1': ['6-year-old|toy box', 'the boy stands next to his big blue toy box, it is almost as tall as him'],
  '11-2': ['6-year-old|toy box', 'the boy lifts the lid of the big blue toy box, toys peeking out'],
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
  '11-19': ['6-year-old|toy box', 'the boy puts his toys back into the big blue toy box'],
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
  '13-2': ['kite', 'the long yellow and green ribbon tail of the red kite flutters in the sky'],
  '13-3': ['7-year-old', 'the boy stands on the hill holding his red kite, his hair blowing in a strong wind, trees bending'],
  '13-6': ['7-year-old|kite', 'the boy holds the long kite string with both hands, the red kite above'],
  '13-8': ['7-year-old|kite', 'the red kite rises high into the sky, the boy looks up and cheers'],
  '13-11': ['kite|bird', 'a little brown bird flies in the sky right next to the red kite'],
  '13-13': ['7-year-old|kite', 'the boy pulls hard on the string as a strong wind tugs the red kite'],
  '13-16': ['dad|kite', 'the tall dad reaches up and pulls the red kite out of the tree branches'],
  '13-21': ['7-year-old|dad|kite', 'the boy and his dad sit on the hill smiling, the red kite flying above them'],
  '14-0': ['7-year-old', 'the girl wakes up and stretches in bed, an alarm clock ringing'],
  '14-1': ['7-year-old|white dog', "the small white dog licks the sleeping girl's face to wake her up"],
  '14-9': ['7-year-old|Mina', 'Mina runs to tag the girl in a game of tag, the girl laughs and runs'],
  '14-12': ['', 'an open lunch box with rice and eggs on a picnic blanket'],
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
