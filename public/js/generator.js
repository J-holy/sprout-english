/* 새싹영어 — 문장 자동 생성기
 * 단어장(동물·물건·색·동사·시간…)과 레벨별 문법 틀을 조합해 문법이 맞는 영어 문장과 우리말 뜻을 만든다.
 * 레벨마다 손으로 쓴 문장에 더해 30개 안팎을 늘려, 열흘 동안 같은 문장이 반복되지 않게 한다.
 * 같은 레벨은 항상 같은 문장이 나오도록 레벨 이름을 씨앗(seed)으로 쓴다 (복습 기록이 이어지게).
 */
const GEN = (() => {
  // ---------- 우리말 조사 ----------
  const hasBatchim = w => { const c = String(w).trim().slice(-1).charCodeAt(0); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0; };
  const j = (w, withB, without) => w + (hasBatchim(w) ? withB : without);
  const eun = w => j(w, '은', '는'), iga = w => j(w, '이', '가'), eul = w => j(w, '을', '를'), ieyo = w => j(w, '이에요', '예요'), iya = w => j(w, '이야', '야');
  const banmal = x => x.endsWith('거예요') ? x.slice(0, -3) + '거야' : x.endsWith('요') ? x.slice(0, -1) : x;
  const art = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
  const cap = s => s[0].toUpperCase() + s.slice(1);

  // ---------- 단어장 ----------
  // 동물: [영어, 우리말, 그림, 복수, 크기 순위, 빠르기 순위, 할 수 있는 것, 어울리는 색]
  const ANIMALS = [
    ['cat', '고양이', '🐱', 'cats', 3, 4, ['run', 'jump', 'climb'], ['black', 'white', 'orange']],
    ['dog', '개', '🐶', 'dogs', 4, 6, ['run', 'swim', 'jump'], ['brown', 'black', 'white']],
    ['bird', '새', '🐦', 'birds', 1, 7, ['fly', 'sing'], ['blue', 'red', 'yellow']],
    ['fish', '물고기', '🐟', 'fish', 1, 3, ['swim'], ['orange', 'blue', 'yellow']],
    ['rabbit', '토끼', '🐰', 'rabbits', 2, 5, ['jump', 'run'], ['white', 'brown']],
    ['duck', '오리', '🦆', 'ducks', 2, 2, ['swim', 'fly'], ['yellow', 'white']],
    ['bear', '곰', '🐻', 'bears', 7, 5, ['swim', 'climb'], ['brown', 'black', 'white']],
    ['frog', '개구리', '🐸', 'frogs', 1, 2, ['jump', 'swim'], ['green']],
    ['horse', '말', '🐴', 'horses', 8, 9, ['run', 'jump'], ['brown', 'black', 'white']],
    ['pig', '돼지', '🐷', 'pigs', 5, 3, ['run'], ['pink']],
    ['monkey', '원숭이', '🐒', 'monkeys', 4, 5, ['climb', 'jump'], ['brown']],
    ['elephant', '코끼리', '🐘', 'elephants', 10, 4, ['swim'], ['gray']],
    ['turtle', '거북이', '🐢', 'turtles', 2, 1, ['swim'], ['green']],
    ['mouse', '쥐', '🐭', 'mice', 0, 3, ['run'], ['gray', 'white']],
    ['giraffe', '기린', '🦒', 'giraffes', 9, 7, ['run'], ['yellow']],
    ['lion', '사자', '🦁', 'lions', 6, 8, ['run'], ['brown']],
  ].map(([en, ko, emoji, pl, size, speed, can, colors]) => ({ en, ko, emoji, pl, size, speed, can, colors, counter: '마리' }));
  // 물건: [영어, 우리말, 그림, 복수, 어울리는 색, 세는 말]
  const THINGS = [
    ['ball', '공', '⚽', 'balls', ['red', 'blue', 'yellow', 'green'], '개'], ['book', '책', '📕', 'books', ['red', 'blue', 'green'], '권'],
    ['pen', '펜', '🖊️', 'pens', ['blue', 'black', 'red'], '자루'], ['bag', '가방', '🎒', 'bags', ['red', 'blue', 'pink', 'black'], '개'],
    ['hat', '모자', '🎩', 'hats', ['black', 'red', 'blue'], '개'], ['car', '자동차', '🚗', 'cars', ['red', 'blue', 'white', 'black'], '대'],
    ['bus', '버스', '🚌', 'buses', ['yellow', 'blue', 'green'], '대'], ['bike', '자전거', '🚲', 'bikes', ['red', 'blue', 'pink'], '대'],
    ['kite', '연', '🪁', 'kites', ['red', 'yellow'], '개'], ['cup', '컵', '☕', 'cups', ['white', 'blue', 'pink'], '개'],
    ['chair', '의자', '🪑', 'chairs', ['brown', 'white'], '개'], ['box', '상자', '📦', 'boxes', ['brown'], '개'],
    ['robot', '로봇', '🤖', 'robots', ['white', 'gray'], '개'], ['umbrella', '우산', '☂️', 'umbrellas', ['yellow', 'pink', 'red'], '개'],
    ['pencil', '연필', '✏️', 'pencils', ['yellow', 'green'], '자루'], ['flower', '꽃', '🌸', 'flowers', ['pink', 'red', 'yellow', 'white'], '송이'],
    ['balloon', '풍선', '🎈', 'balloons', ['red', 'blue', 'pink'], '개'], ['apple', '사과', '🍎', 'apples', ['red', 'green'], '개'],
  ].map(([en, ko, emoji, pl, colors, counter]) => ({ en, ko, emoji, pl, colors, counter }));
  const FOODS = [['apple', '사과', '🍎', 'apples'], ['banana', '바나나', '🍌', 'bananas'], ['cookie', '쿠키', '🍪', 'cookies'], ['carrot', '당근', '🥕', 'carrots'],
    ['orange', '오렌지', '🍊', 'oranges'], ['sandwich', '샌드위치', '🥪', 'sandwiches'], ['egg', '달걀', '🥚', 'eggs'], ['strawberry', '딸기', '🍓', 'strawberries'],
    ['grape', '포도', '🍇', 'grapes'], ['peach', '복숭아', '🍑', 'peaches']].map(([en, ko, emoji, pl]) => ({ en, ko, emoji, pl }));
  // 색: [영어, 꾸밀 때, 색 이름]
  const COLORS = Object.fromEntries([['red', '빨간', '빨간색'], ['blue', '파란', '파란색'], ['yellow', '노란', '노란색'], ['green', '초록색', '초록색'],
    ['pink', '분홍색', '분홍색'], ['black', '검은', '검은색'], ['white', '하얀', '하얀색'], ['brown', '갈색', '갈색'], ['orange', '주황색', '주황색'],
    ['gray', '회색', '회색']].map(([en, adj, noun]) => [en, { en, adj, noun }]));
  const NUMS = [['two', '두'], ['three', '세'], ['four', '네'], ['five', '다섯'], ['six', '여섯']];
  const PLACES = [['on the table', '탁자 위에'], ['under the table', '탁자 밑에'], ['on the bed', '침대 위에'], ['under the bed', '침대 밑에'],
    ['in the box', '상자 안에'], ['in the bag', '가방 안에'], ['next to the door', '문 옆에'], ['behind the sofa', '소파 뒤에'],
    ['on the chair', '의자 위에'], ['by the window', '창문 옆에']];
  // 주어: [영어, 우리말(은/는), be동사, 3인칭 단수, 대명사]
  const SUBJ = [['I', '나는', 'am', false], ['You', '너는', 'are', false], ['He', '그는', 'is', true], ['She', '그녀는', 'is', true], ['We', '우리는', 'are', false],
    ['They', '그들은', 'are', false], ['Tom', '톰은', 'is', true, 'He'], ['Mina', '미나는', 'is', true, 'She'], ['Mom', '엄마는', 'is', true, 'She'],
    ['Dad', '아빠는', 'is', true, 'He'], ['My friend', '내 친구는', 'is', true, 'She']].map(([en, ko, be, third, pron]) => ({ en, ko, be, third, pron: pron || en }));
  const NAMES = SUBJ.filter(s => s.pron !== s.en);
  const mid = s => s.en.startsWith('My ') ? 'my' + s.en.slice(2) : s.en; // 문장 가운데에서는 소문자
  const KIDS = [['Tom', '톰'], ['Mina', '미나'], ['Amy', '에이미'], ['Ben', '벤'], ['Jisu', '지수'], ['Minho', '민호'], ['Lily', '릴리'], ['Sam', '샘']];
  // 탁자 위·상자 안에 둘 수 있는 작은 것들
  const SMALL = ['cat', 'dog', 'rabbit', 'mouse', 'ball', 'book', 'pen', 'hat', 'cup', 'pencil', 'bag', 'robot', 'balloon', 'apple'].map(w => [...ANIMALS, ...THINGS].find(x => x.en === w));
  // 시간과 어울리는지: 밖에서 하는 놀이는 밤에 안 하고, 점심은 점심때만 먹는다
  const OUT = /soccer|park|kite|sandcastle|climb|plant|ride/;
  const fits = (v, t) => !(OUT.test(v.base) && /night/.test(t)) && !(/lunch/.test(v.base) && /night|morning|after school|every day|weekend|tomorrow|Sunday|Saturday|seven|eight|nine|four|five|six/.test(t));
  // 동사구: [원형, 3인칭, 과거, -ing, 그림, 현재, 과거, 미래, 진행, 가능, 과거형 종류]
  const VPS = [
    ['play soccer', 'plays soccer', 'played soccer', 'playing soccer', '⚽', '축구를 해요', '축구를 했어요', '축구를 할 거예요', '축구를 하고 있어요', '축구를 할 수 있어요', 'reg'],
    ['read a book', 'reads a book', 'read a book', 'reading a book', '📖', '책을 읽어요', '책을 읽었어요', '책을 읽을 거예요', '책을 읽고 있어요', '책을 읽을 수 있어요', 'irr1'],
    ['ride a bike', 'rides a bike', 'rode a bike', 'riding a bike', '🚲', '자전거를 타요', '자전거를 탔어요', '자전거를 탈 거예요', '자전거를 타고 있어요', '자전거를 탈 수 있어요', 'irr1'],
    ['draw a picture', 'draws a picture', 'drew a picture', 'drawing a picture', '🎨', '그림을 그려요', '그림을 그렸어요', '그림을 그릴 거예요', '그림을 그리고 있어요', '그림을 그릴 수 있어요', 'irr1'],
    ['sing a song', 'sings a song', 'sang a song', 'singing a song', '🎤', '노래를 불러요', '노래를 불렀어요', '노래를 부를 거예요', '노래를 부르고 있어요', '노래를 부를 수 있어요', 'irr1'],
    ['eat lunch', 'eats lunch', 'ate lunch', 'eating lunch', '🍱', '점심을 먹어요', '점심을 먹었어요', '점심을 먹을 거예요', '점심을 먹고 있어요', '점심을 먹을 수 있어요', 'irr1'],
    ['drink milk', 'drinks milk', 'drank milk', 'drinking milk', '🥛', '우유를 마셔요', '우유를 마셨어요', '우유를 마실 거예요', '우유를 마시고 있어요', '우유를 마실 수 있어요', 'irr1'],
    ['swim in the pool', 'swims in the pool', 'swam in the pool', 'swimming in the pool', '🏊', '수영장에서 수영해요', '수영장에서 수영했어요', '수영장에서 수영할 거예요', '수영장에서 수영하고 있어요', '수영장에서 수영할 수 있어요', 'irr1'],
    ['go to the park', 'goes to the park', 'went to the park', 'going to the park', '🏞️', '공원에 가요', '공원에 갔어요', '공원에 갈 거예요', '공원에 가고 있어요', '공원에 갈 수 있어요', 'irr1'],
    ['fly a kite', 'flies a kite', 'flew a kite', 'flying a kite', '🪁', '연을 날려요', '연을 날렸어요', '연을 날릴 거예요', '연을 날리고 있어요', '연을 날릴 수 있어요', 'irr2'],
    ['write a letter', 'writes a letter', 'wrote a letter', 'writing a letter', '✉️', '편지를 써요', '편지를 썼어요', '편지를 쓸 거예요', '편지를 쓰고 있어요', '편지를 쓸 수 있어요', 'irr2'],
    ['make a sandwich', 'makes a sandwich', 'made a sandwich', 'making a sandwich', '🥪', '샌드위치를 만들어요', '샌드위치를 만들었어요', '샌드위치를 만들 거예요', '샌드위치를 만들고 있어요', '샌드위치를 만들 수 있어요', 'irr2'],
    ['take a picture', 'takes a picture', 'took a picture', 'taking a picture', '📷', '사진을 찍어요', '사진을 찍었어요', '사진을 찍을 거예요', '사진을 찍고 있어요', '사진을 찍을 수 있어요', 'irr2'],
    ['feed the dog', 'feeds the dog', 'fed the dog', 'feeding the dog', '🐶', '개에게 밥을 줘요', '개에게 밥을 줬어요', '개에게 밥을 줄 거예요', '개에게 밥을 주고 있어요', '개에게 밥을 줄 수 있어요', 'irr2'],
    ['build a sandcastle', 'builds a sandcastle', 'built a sandcastle', 'building a sandcastle', '🏰', '모래성을 쌓아요', '모래성을 쌓았어요', '모래성을 쌓을 거예요', '모래성을 쌓고 있어요', '모래성을 쌓을 수 있어요', 'irr2'],
    ['catch a ball', 'catches a ball', 'caught a ball', 'catching a ball', '⚾', '공을 잡아요', '공을 잡았어요', '공을 잡을 거예요', '공을 잡고 있어요', '공을 잡을 수 있어요', 'irr2'],
    ['watch TV', 'watches TV', 'watched TV', 'watching TV', '📺', 'TV를 봐요', 'TV를 봤어요', 'TV를 볼 거예요', 'TV를 보고 있어요', 'TV를 볼 수 있어요', 'reg'],
    ['bake cookies', 'bakes cookies', 'baked cookies', 'baking cookies', '🍪', '쿠키를 구워요', '쿠키를 구웠어요', '쿠키를 구울 거예요', '쿠키를 굽고 있어요', '쿠키를 구울 수 있어요', 'reg'],
    ['plant a tree', 'plants a tree', 'planted a tree', 'planting a tree', '🌱', '나무를 심어요', '나무를 심었어요', '나무를 심을 거예요', '나무를 심고 있어요', '나무를 심을 수 있어요', 'reg'],
    ['play the piano', 'plays the piano', 'played the piano', 'playing the piano', '🎹', '피아노를 쳐요', '피아노를 쳤어요', '피아노를 칠 거예요', '피아노를 치고 있어요', '피아노를 칠 수 있어요', 'reg'],
    ['wash the dishes', 'washes the dishes', 'washed the dishes', 'washing the dishes', '🍽️', '설거지를 해요', '설거지를 했어요', '설거지를 할 거예요', '설거지를 하고 있어요', '설거지를 할 수 있어요', 'reg'],
    ['climb a tree', 'climbs a tree', 'climbed a tree', 'climbing a tree', '🌳', '나무에 올라가요', '나무에 올라갔어요', '나무에 올라갈 거예요', '나무에 올라가고 있어요', '나무에 올라갈 수 있어요', 'reg'],
    ['dance', 'dances', 'danced', 'dancing', '💃', '춤을 춰요', '춤을 췄어요', '춤을 출 거예요', '춤을 추고 있어요', '춤을 출 수 있어요', 'reg'],
    ['jump rope', 'jumps rope', 'jumped rope', 'jumping rope', '🪢', '줄넘기를 해요', '줄넘기를 했어요', '줄넘기를 할 거예요', '줄넘기를 하고 있어요', '줄넘기를 할 수 있어요', 'reg'],
    ['clean the room', 'cleans the room', 'cleaned the room', 'cleaning the room', '🧹', '방을 청소해요', '방을 청소했어요', '방을 청소할 거예요', '방을 청소하고 있어요', '방을 청소할 수 있어요', 'reg'],
    ['visit Grandma', 'visits Grandma', 'visited Grandma', 'visiting Grandma', '👵', '할머니 댁에 가요', '할머니 댁에 갔어요', '할머니 댁에 갈 거예요', '할머니 댁에 가고 있어요', '할머니 댁에 갈 수 있어요', 'reg'],
  ].map(([base, s, past, ing, emoji, pres, kpast, fut, kIng, can, kind]) => ({ base, s, past, ing, emoji, ko: { pres, past: kpast, fut, ing: kIng, can }, kind }));
  // 동물의 능력: [영어, 할 수 있어요, 할 수 없어요]
  const ABIL = { run: ['run', '달릴 수 있어요'], jump: ['jump', '뛸 수 있어요'], swim: ['swim', '헤엄칠 수 있어요'], fly: ['fly', '날 수 있어요'], climb: ['climb trees', '나무를 탈 수 있어요'], sing: ['sing', '노래할 수 있어요'] };
  const FEEL = [['happy', '행복해요', '행복했어요', '😊'], ['sad', '슬퍼요', '슬펐어요', '😢'], ['sleepy', '졸려요', '졸렸어요', '😴'], ['hungry', '배고파요', '배고팠어요', '😋'],
    ['excited', '신나요', '신났어요', '🤩'], ['tired', '피곤해요', '피곤했어요', '😪'], ['scared', '무서워요', '무서웠어요', '😨'], ['thirsty', '목말라요', '목말랐어요', '🥤']];
  const WEATHER = [['sunny', '화창해요', '☀️'], ['rainy', '비가 와요', '🌧️'], ['windy', '바람이 불어요', '🌬️'], ['snowy', '눈이 와요', '❄️'], ['cloudy', '흐려요', '☁️'], ['hot', '더워요', '🥵'], ['cold', '추워요', '🥶']];
  const SENSE = [['The ice cream is cold.', '아이스크림은 차가워요.', '🍦'], ['The candy is sweet.', '사탕은 달아요.', '🍬'], ['The honey is sweet.', '꿀은 달아요.', '🍯'],
    ['The snow is white and cold.', '눈은 하얗고 차가워요.', '❄️'], ['The fire is very hot.', '불은 아주 뜨거워요.', '🔥'], ['The bunny is soft.', '토끼는 부드러워요.', '🐰'],
    ['The blanket is warm.', '담요는 따뜻해요.', '🛏️'], ['The drum is loud.', '북 소리가 커요.', '🥁'], ['The baby is quiet.', '아기는 조용해요.', '👶'],
    ['The stone is hard.', '돌은 단단해요.', '🪨'], ['The cotton is soft.', '솜은 부드러워요.', '☁️'], ['The pizza smells good.', '피자 냄새가 좋아요.', '🍕']];
  const T_PRES = [['at seven', '일곱 시에'], ['after school', '방과 후에'], ['in the morning', '아침에'], ['on Saturday', '토요일에'], ['on Sunday', '일요일에'], ['every day', '매일']];
  const T_PAST = [['yesterday', '어제'], ['last Sunday', '지난 일요일에'], ['this morning', '오늘 아침에'], ['last night', '어젯밤에'], ['after school', '방과 후에']];
  const T_FUT = [['tomorrow', '내일'], ['this weekend', '이번 주말에'], ['next Sunday', '다음 일요일에'], ['after school', '방과 후에']];
  const HOURS = [['seven', '일곱'], ['eight', '여덟'], ['nine', '아홉'], ['four', '네'], ['five', '다섯'], ['six', '여섯']];
  const DAYS = [['Monday', '월요일'], ['Tuesday', '화요일'], ['Wednesday', '수요일'], ['Thursday', '목요일'], ['Friday', '금요일'], ['Saturday', '토요일'], ['Sunday', '일요일']];
  const FAMILY = [['my teacher', '우리 선생님', 'She'], ['my friend', '내 친구', 'She'], ['my grandma', '우리 할머니', 'She'], ['my cousin', '내 사촌', 'He'],
    ['my uncle', '우리 삼촌', 'He'], ['my grandpa', '우리 할아버지', 'He'], ['my dad', '우리 아빠', 'He'], ['my mom', '우리 엄마', 'She']];
  const TRAVEL = [['bus', '버스로', '🚌'], ['bike', '자전거로', '🚲'], ['car', '자동차로', '🚗'], ['subway', '지하철로', '🚇']];
  const GOAL = [['school', '학교에', '🏫'], ['the park', '공원에', '🏞️'], ['the library', '도서관에', '📚'], ["Grandma's house", '할머니 댁에', '🏡']];

  // ---------- 씨앗이 있는 무작위 ----------
  const seedOf = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  let R = Math.random;
  const pick = a => a[Math.floor(R() * a.length)];
  const sent = (en, ko, emoji) => ({ en, ko, emoji });
  const qa = (q, a, ko) => ({ q, a, ko });
  const subj = () => pick(SUBJ);
  const verb = s => s.third ? 'is' : s.be;

  // ---------- 레벨별 문법 틀 ----------
  const T = {
    // 3단계: be동사 · this/that
    F: [
      () => { const x = pick([...THINGS, ...ANIMALS]); return sent(`This is ${art(x.en)}.`, `이것은 ${ieyo(x.ko)}.`, x.emoji); },
      () => { const x = pick([...THINGS, ...ANIMALS]); return sent(`That is ${art(x.en)}.`, `저것은 ${ieyo(x.ko)}.`, x.emoji); },
      () => { const x = pick(THINGS), c = COLORS[pick(x.colors)]; return sent(`It is ${art(c.en)} ${x.en}.`, `그것은 ${c.adj} ${ieyo(x.ko)}.`, x.emoji); },
      () => { const x = pick(THINGS), c = COLORS[pick(x.colors)]; return sent(`The ${x.en} is ${c.en}.`, `${eun(x.ko)} ${ieyo(c.noun)}.`, x.emoji); },
      () => { const x = pick(ANIMALS), c = COLORS[pick(x.colors)]; return sent(`The ${x.en} is ${c.en}.`, `${eun(x.ko)} ${ieyo(c.noun)}.`, x.emoji); },
    ],
    // 3단계: have · like · see · 수
    G: [
      () => { const x = pick(THINGS); return sent(`I have ${art(x.en)}.`, `나는 ${iga(x.ko)} 있어요.`, x.emoji); },
      () => { const s = pick(SUBJ.filter(s => s.third)), x = pick(THINGS), c = COLORS[pick(x.colors)]; return sent(`${s.en} has ${art(c.en)} ${x.en}.`, `${s.ko} ${c.adj} ${iga(x.ko)} 있어요.`, x.emoji); },
      () => { const x = pick([...FOODS, ...ANIMALS.filter(a => a.pl !== a.en)]); return sent(`I like ${x.pl}.`, `나는 ${eul(x.ko)} 좋아해요.`, x.emoji); },
      () => { const x = pick(ANIMALS); return sent(`I see ${art(x.en)}.`, `나는 ${eul(x.ko)} 봐요.`, x.emoji); },
      () => { const x = pick([...ANIMALS, ...THINGS]), [n, nk] = pick(NUMS); return sent(`We see ${n} ${x.pl}.`, `우리는 ${x.ko} ${nk} ${eul(x.counter)} 봐요.`, x.emoji); },
    ],
    // 3단계: can · 위치
    H: [
      () => { const v = pick(VPS); return sent(`I can ${v.base}.`, `나는 ${v.ko.can}.`, v.emoji); },
      () => { const x = pick(ANIMALS), a = ABIL[pick(x.can)]; return sent(`${cap(art(x.en))} can ${a[0]}.`, `${eun(x.ko)} ${a[1]}.`, x.emoji); },
      () => { const x = pick(ANIMALS.filter(a => !a.can.includes('fly'))); return sent(`${cap(art(x.en))} cannot fly.`, `${eun(x.ko)} 날 수 없어요.`, x.emoji); },
      () => { const x = pick(SMALL), [p, pk] = pick(PLACES); if (p.includes(x.en)) return null; return sent(`The ${x.en} is ${p}.`, `${iga(x.ko)} ${pk} 있어요.`, x.emoji); },
    ],
    // 4단계 질문과 대답
    I: [
      () => { const x = pick(THINGS); return R() < .5 ? qa(`Is this your ${x.en}?`, 'Yes, it is.', `이거 네 ${iya(x.ko)}? — 응, 맞아.`) : qa(`Is this your ${x.en}?`, 'No, it is not.', `이거 네 ${iya(x.ko)}? — 아니, 아니야.`); },
      () => { const [en, ko, pr] = pick(FAMILY); return qa(`Who is ${pr === 'He' ? 'he' : 'she'}?`, `${pr} is ${en}.`, `${pr === 'He' ? '그는' : '그녀는'} 누구야? — ${iya(ko)}.`); },
      () => { const [n, nk] = pick(KIDS); return qa('What is your name?', `My name is ${n}.`, `이름이 뭐니? — 내 이름은 ${iya(nk)}.`); },
      () => { const [h, hk] = pick(HOURS.slice(0, 5)); const age = { seven: '일곱', eight: '여덟', nine: '아홉', four: '네', five: '다섯' }[h]; return qa('How old are you?', `I am ${h} years old.`, `몇 살이니? — 나는 ${age} 살이야.`); },
    ],
    J: [
      () => { const x = pick(THINGS); return qa('What is this?', `It is ${art(x.en)}.`, `이건 뭐야? — ${iya(x.ko)}.`); },
      () => { const x = pick(THINGS), c = COLORS[pick(x.colors)]; return qa(`What color is the ${x.en}?`, `It is ${c.en}.`, `${eun(x.ko)} 무슨 색이야? — ${iya(c.noun)}.`); },
      () => { const [x, y] = [pick(ANIMALS), pick(ANIMALS)]; if (x === y) return null; return qa(`Is it ${art(x.en)}?`, `No, it is ${art(y.en)}.`, `그거 ${iya(x.ko)}? — 아니, ${iya(y.ko)}.`); },
      () => { const x = pick([...ANIMALS.filter(a => a.pl !== a.en), ...THINGS]), [n, nk] = pick(NUMS); return qa(`How many ${x.pl} are there?`, `There are ${n} ${x.pl}.`, `${x.ko} 몇 ${x.counter} 있어? — ${nk} ${x.counter} 있어.`); },
    ],
    K: [
      () => { const x = pick(FOODS); return R() < .6 ? qa(`Do you like ${x.pl}?`, 'Yes, I do.', `${eul(x.ko)} 좋아해? — 응, 좋아해.`) : qa(`Do you like ${x.pl}?`, "No, I don't.", `${eul(x.ko)} 좋아해? — 아니, 안 좋아해.`); },
      () => { const v = pick(VPS); return R() < .6 ? qa(`Can you ${v.base}?`, 'Yes, I can.', `${banmal(v.ko.can)}? — 응, 할 수 있어.`) : qa(`Can you ${v.base}?`, "No, I can't.", `${banmal(v.ko.can)}? — 아니, 못 해.`); },
      () => { const x = pick(FOODS); return R() < .6 ? qa(`Do you want ${art(x.en)}?`, 'Yes, please.', `${x.ko} 줄까? — 응, 줘.`) : qa(`Do you want ${art(x.en)}?`, 'No, thank you.', `${x.ko} 줄까? — 아니, 괜찮아.`); },
      () => { const x = pick(FOODS); return qa('What do you want?', `I want ${art(x.en)}.`, `뭘 원해? — ${eul(x.ko)} 원해.`); },
    ],
    L: [
      () => { const [f, fk] = pick(FEEL); return qa('How do you feel?', `I feel ${f}.`, `기분이 어때? — ${banmal(fk)}.`); },
      () => { const [f, fk] = pick(FEEL); return R() < .6 ? qa(`Are you ${f}?`, 'Yes, I am.', `${banmal(fk)}? — 응, 그래.`) : qa(`Are you ${f}?`, 'No, I am not.', `${banmal(fk)}? — 아니, 안 그래.`); },
      () => { const [h, hk] = pick(HOURS); return qa('What time is it?', `It is ${h} o'clock.`, `몇 시야? — ${hk} 시야.`); },
      () => { const [d, dk] = pick(DAYS); return qa('What day is it today?', `It is ${d}.`, `오늘 무슨 요일이야? — ${iya(dk)}.`); },
      () => { const [w, wk] = pick(WEATHER); return qa('How is the weather?', `It is ${w}.`, `날씨가 어때? — ${banmal(wk)}.`); },
    ],
    // 5단계 묘사
    M: [
      () => { const x = pick(ANIMALS), c = COLORS[pick(x.colors)], [s, sk] = pick([['big', '큰'], ['little', '작은']]); return sent(`The ${s} ${x.en} is ${c.en}.`, `${sk} ${eun(x.ko)} ${ieyo(c.noun)}.`, x.emoji); },
      () => { const x = pick(THINGS), c = COLORS[pick(x.colors)], [s, sk] = pick([['big', '큰'], ['small', '작은']]); return sent(`I have a ${s} ${c.en} ${x.en}.`, `나는 ${sk} ${c.adj} ${iga(x.ko)} 있어요.`, x.emoji); },
      () => { const x = pick(THINGS), c = COLORS[pick(x.colors)], s = pick(SUBJ.filter(s => s.third)); return sent(`${s.en} wants ${art(c.en)} ${x.en}.`, `${s.ko} ${c.adj} ${eul(x.ko)} 갖고 싶어 해요.`, x.emoji); },
    ],
    N: [
      () => { const s = subj(), [f, fk, , e] = pick(FEEL); return sent(`${s.en} ${s.be} ${f}.`, `${s.ko} ${fk}.`, e); },
      () => { const s = subj(), [f, fk, , e] = pick(FEEL); return sent(`${s.en} ${s.third ? 'feels' : 'feel'} ${f} today.`, `${s.ko} 오늘 ${fk}.`, e); },
      () => { const [en, ko, pr] = pick(FAMILY); const [a, ak, e] = pick([['kind', '친절해요', '💗'], ['funny', '재미있어요', '😄'], ['smart', '똑똑해요', '🧠'], ['tall', '키가 커요', '📏'], ['busy', '바빠요', '⏰']]); return sent(`${cap(en)} is very ${a}.`, `${eun(ko)} 아주 ${ak}.`, e); },
    ],
    O: [
      () => { const [w, wk, e] = pick(WEATHER); return sent(`It is ${w} today.`, `오늘은 ${wk}.`, e); },
      () => { const s = pick(SENSE); return sent(...s); },
      () => { const x = pick(ANIMALS), [a, ak] = pick([['cute', '귀여워요'], ['soft', '부드러워요'], ['fast', '빨라요'], ['slow', '느려요']]); if ((a === 'fast' && x.speed < 6) || (a === 'slow' && x.speed > 3) || (a === 'soft' && !['cat', 'rabbit', 'dog', 'duck', 'bear'].includes(x.en))) return null; return sent(`The ${x.en} is ${a}.`, `${eun(x.ko)} ${ak}.`, x.emoji); },
    ],
    P: [
      () => { const [x, y] = [pick(ANIMALS), pick(ANIMALS)]; if (x.size - y.size < 2) return null; return sent(`${cap(art(x.en))} is bigger than ${art(y.en)}.`, `${eun(x.ko)} ${y.ko}보다 커요.`, x.emoji); },
      () => { const [x, y] = [pick(ANIMALS), pick(ANIMALS)]; if (y.size - x.size < 2) return null; return sent(`${cap(art(x.en))} is smaller than ${art(y.en)}.`, `${eun(x.ko)} ${y.ko}보다 작아요.`, x.emoji); },
      () => { const [x, y] = [pick(ANIMALS), pick(ANIMALS)]; if (x.speed - y.speed < 2) return null; return sent(`${cap(art(x.en))} is faster than ${art(y.en)}.`, `${eun(x.ko)} ${y.ko}보다 빨라요.`, x.emoji); },
      () => { const [x, y] = [pick(ANIMALS), pick(ANIMALS)]; if (y.speed - x.speed < 2) return null; return sent(`${cap(art(x.en))} is slower than ${art(y.en)}.`, `${eun(x.ko)} ${y.ko}보다 느려요.`, x.emoji); },
    ],
    // 6단계 육하원칙
    Q: [
      () => { const x = pick(SMALL), [p, pk] = pick(PLACES); if (p.includes(x.en)) return null; return qa(`Where is the ${x.en}?`, `It is ${p}.`, `${eun(x.ko)} 어디 있어? — ${pk} 있어.`); },
      () => { const x = pick(SMALL.filter(x => x.pl !== 'mice')), [p, pk] = pick(PLACES); if (p.includes(x.en)) return null; return qa(`Where are the ${x.pl}?`, `They are ${p}.`, `${eun(x.ko)} 어디 있어? — ${pk} 있어.`); },
    ],
    R: [
      () => { const n = pick(NAMES), v = pick(VPS); return qa(`What is ${mid(n)} doing?`, `${n.pron} is ${v.ing}.`, `${eun(n.ko.slice(0, -1))} 뭐 하고 있어? — ${banmal(v.ko.ing)}.`); },
      () => { const n = pick(NAMES), v = pick(VPS); return qa(`Who is ${v.ing}?`, `${n.en} is ${v.ing}.`, `누가 ${banmal(v.ko.ing)}? — ${iga(n.ko.slice(0, -1))} ${banmal(v.ko.ing)}.`); },
      () => { const v = pick(VPS); return qa('What are you doing?', `I am ${v.ing}.`, `뭐 하고 있어? — ${banmal(v.ko.ing)}.`); },
    ],
    S: [
      () => { const v = pick(VPS), [t, tk] = pick(T_PRES); if (!fits(v, t)) return null; return qa(`When do you ${v.base}?`, `I ${v.base} ${t}.`, `언제 ${banmal(v.ko.pres)}? — ${tk} ${banmal(v.ko.pres)}.`); },
      () => { const v = pick(VPS), [h, hk] = pick(HOURS); if (!fits(v, h)) return null; return qa(`What time do you ${v.base}?`, `I ${v.base} at ${h}.`, `몇 시에 ${banmal(v.ko.pres)}? — ${hk} 시에 ${banmal(v.ko.pres)}.`); },
      () => { const n = pick(NAMES), v = pick(VPS), [d, dk] = pick(DAYS); return qa(`When does ${mid(n)} ${v.base}?`, `${n.pron} ${v.s} on ${d}.`, `${eun(n.ko.slice(0, -1))} 언제 ${banmal(v.ko.pres)}? — ${dk}에 ${banmal(v.ko.pres)}.`); },
    ],
    T: [
      () => { const x = pick(THINGS), [n, nk] = pick(NUMS); return qa(`How many ${x.pl} do you have?`, `I have ${n} ${x.pl}.`, `${x.ko} 몇 ${x.counter} 있어? — ${nk} ${x.counter} 있어.`); },
      () => { const [g, gk, e] = pick(GOAL), [v, vk] = pick(TRAVEL); return qa(`How do you go to ${g}?`, `I go by ${v}.`, `${gk} 어떻게 가? — ${vk} 가.`); },
      () => { const [w, wk] = pick(WEATHER); return qa('How is the weather today?', `It is ${w}.`, `오늘 날씨 어때? — ${banmal(wk)}.`); },
    ],
    // 7단계 과거
    U: [() => past('reg')], V: [() => past('irr1')], W: [() => past('irr2')],
    X: [
      () => { const s = subj(), [f, , fp, e] = pick(FEEL), [t, tk] = pick(T_PAST.slice(0, 4)); return sent(`${s.en} ${s.third || s.en === 'I' ? 'was' : 'were'} ${f} ${t}.`, `${s.ko} ${tk} ${fp}.`, e); },
      () => { const [a, b] = [pick(VPS), pick(VPS)]; if (a === b) return null; return sent(`First, I ${a.past}. Then, I ${b.past}.`, `먼저 ${a.ko.past}. 그다음에 ${b.ko.past}.`, a.emoji); },
      () => { const [w, wk] = pick(WEATHER.slice(0, 5)), wp = { sunny: '화창했어요', rainy: '비가 왔어요', windy: '바람이 불었어요', snowy: '눈이 왔어요', cloudy: '흐렸어요' }[w], [t, tk] = pick(T_PAST.slice(0, 2)); return sent(`It was ${w} ${t}.`, `${tk} ${wp}.`, WEATHER.find(x => x[0] === w)[2]); },
    ],
    // 8단계 미래
    Y: [() => { const s = subj(), v = pick(VPS), [t, tk] = pick(T_FUT); if (!fits(v, t)) return null; return sent(`${s.en} will ${v.base} ${t}.`, `${s.ko} ${tk} ${v.ko.fut}.`, v.emoji); }],
    Z: [() => { const s = subj(), v = pick(VPS), [t, tk] = pick(T_FUT); if (!fits(v, t)) return null; return sent(`${s.en} ${s.third ? 'is' : s.be} going to ${v.base} ${t}.`, `${s.ko} ${tk} ${v.ko.fut}.`, v.emoji); }],
  };
  function past(kind) {
    const s = subj(), v = pick(VPS.filter(x => x.kind === kind)), [t, tk] = pick(T_PAST);
    if (!fits(v, t)) return null;
    return sent(`${s.en} ${v.past} ${t}.`, `${s.ko} ${tk} ${v.ko.past}.`, v.emoji);
  }

  // 레벨마다 겹치지 않게 count개를 만든다 (같은 레벨은 언제나 같은 결과)
  const cache = {};
  function forLevel(level, count, existing = []) {
    if (cache[level]) return cache[level];
    const tpl = T[level]; if (!tpl) return (cache[level] = []);
    R = rng(seedOf('sprout:' + level));
    const seen = new Set(existing.map(x => x.en || x.q + '|' + x.a)), out = [];
    for (let tries = 0; out.length < count && tries < count * 40; tries++) {
      const it = tpl[(out.length + tries) % tpl.length]();
      if (!it) continue;
      const k = it.en || it.q + '|' + it.a;
      if (seen.has(k)) continue;
      seen.add(k); out.push(it);
    }
    R = Math.random;
    return (cache[level] = out);
  }
  // 단어 → 종류 (색·동물·이름…). 빈칸 스피드 게임에서 같은 종류 단어를 오답으로 쓰면 둘 다 말이 되니까 피한다.
  const CLASS = {};
  const mark = (list, c) => list.forEach(w => String(w).toLowerCase().split(' ').forEach(x => { if (x.length > 2) CLASS[x] = c; }));
  mark(Object.keys(COLORS), 'color'); mark(ANIMALS.flatMap(x => [x.en, x.pl]), 'animal'); mark(THINGS.flatMap(x => [x.en, x.pl]), 'thing');
  mark(FOODS.flatMap(x => [x.en, x.pl]), 'thing'); mark(NUMS.map(x => x[0]).concat(HOURS.map(x => x[0])), 'num'); mark(SUBJ.map(x => x.en), 'who');
  mark(FEEL.map(x => x[0]), 'feel'); mark(WEATHER.map(x => x[0]), 'feel'); mark(DAYS.map(x => x[0]), 'day');
  mark(['big', 'little', 'small', 'tall', 'kind', 'funny', 'smart', 'busy', 'cute', 'soft', 'fast', 'slow', 'bigger', 'smaller', 'faster', 'slower'], 'adj');
  mark(['yesterday', 'tomorrow', 'today', 'morning', 'night', 'weekend', 'saturday', 'sunday'], 'time');
  mark(['table', 'bed', 'door', 'sofa', 'window', 'under', 'behind', 'next'], 'place');
  const classOf = w => CLASS[String(w).toLowerCase()] || null;
  return { forLevel, hasBatchim, classOf, ANIMALS, THINGS, VPS };
})();
