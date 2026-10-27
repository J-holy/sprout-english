/* 새싹영어 — 콘텐츠 데이터 (커리큘럼, 학습 문항, 스토리북, FAQ, 요금제) */
const LESSONS_PER_LEVEL = 3;

const STAGES = [
  { id: 1, levels: ['A', 'B'], title: '알파벳', desc: '즐겁고 재미나게 알파벳 대소문자를 마스터해요.', skills: ['알파벳 소리', '대소문자 짝짓기', '따라 쓰기'], color: '#ff8a65' },
  { id: 2, levels: ['C', 'D', 'E'], title: '파닉스 시작', desc: '파닉스 시작! 단어를 읽고 의미를 알아가요.', skills: ['단모음', '첫소리', '단어 철자'], color: '#ffb74d' },
  { id: 3, levels: ['F', 'G', 'H'], title: '첫 문장', desc: '영어 문장은 이렇구나! 기초 문법을 배우기 시작해요.', skills: ['be동사', '문장 순서', '뜻 이해'], color: '#ffd54f' },
  { id: 4, levels: ['I', 'J', 'K', 'L'], title: '일상 대화', desc: '파닉스 마스터! 질문하고 대답하며 일상 속 대화를 배워요.', skills: ['질문과 대답', '인사', '자기소개'], color: '#aed581' },
  { id: 5, levels: ['M', 'N', 'O', 'P'], title: '묘사하기', desc: '더 설명할래요! 다양하고 심화된 표현으로 상황을 묘사해요.', skills: ['형용사', '색깔·크기', '감정'], color: '#4db6ac' },
  { id: 6, levels: ['Q', 'R', 'S', 'T'], title: '육하원칙', desc: '문장이 길어져요! 누가, 언제, 어디서, 무엇을 했는지 설명해요.', skills: ['Who/Where', 'When/What', '전치사'], color: '#64b5f6' },
  { id: 7, levels: ['U', 'V', 'W', 'X'], title: '과거 시제', desc: '과거를 말해요! 과거 시제를 배워서 나의 하루를 묘사해요.', skills: ['규칙 과거형', '불규칙 과거형', '일기 쓰기'], color: '#9575cd' },
  { id: 8, levels: ['Y', 'Z'], title: '미래 시제', desc: '미래의 계획! 미래 시제를 알고 나의 꿈을 얘기할 수 있어요.', skills: ['will', 'be going to', '나의 꿈'], color: '#f06292' },
];
const ALL_LEVELS = STAGES.flatMap(s => s.levels);
const stageOf = lv => STAGES.find(s => s.levels.includes(lv));

const LETTERS = [
  ['A', 'apple', '🍎'], ['B', 'ball', '⚽'], ['C', 'cat', '🐱'], ['D', 'dog', '🐶'], ['E', 'egg', '🥚'],
  ['F', 'fish', '🐟'], ['G', 'goat', '🐐'], ['H', 'hat', '🎩'], ['I', 'insect', '🐞'], ['J', 'juice', '🧃'],
  ['K', 'kite', '🪁'], ['L', 'lion', '🦁'], ['M', 'moon', '🌙'], ['N', 'nose', '👃'], ['O', 'octopus', '🐙'],
  ['P', 'pig', '🐷'], ['Q', 'queen', '👸'], ['R', 'rabbit', '🐰'], ['S', 'sun', '☀️'], ['T', 'tiger', '🐯'],
  ['U', 'umbrella', '☂️'], ['V', 'van', '🚐'], ['W', 'whale', '🐳'], ['X', 'box', '📦'], ['Y', 'yo-yo', '🪀'], ['Z', 'zebra', '🦓'],
].map(([letter, word, emoji]) => ({ letter, word, emoji }));

const PHONICS = {
  C: [['cat', '🐱', '고양이'], ['hat', '🎩', '모자'], ['bat', '🦇', '박쥐'], ['map', '🗺️', '지도'], ['van', '🚐', '승합차'], ['bag', '👜', '가방'],
      ['bed', '🛏️', '침대'], ['hen', '🐔', '암탉'], ['net', '🥅', '그물'], ['pen', '🖊️', '펜'], ['web', '🕸️', '거미줄'], ['leg', '🦵', '다리']],
  D: [['pig', '🐷', '돼지'], ['pin', '📌', '핀'], ['six', '6️⃣', '여섯'], ['lip', '👄', '입술'], ['kid', '🧒', '아이'], ['zip', '🤐', '지퍼'],
      ['dog', '🐶', '개'], ['box', '📦', '상자'], ['fox', '🦊', '여우'], ['pot', '🍲', '냄비'], ['log', '🪵', '통나무'], ['hot', '🔥', '뜨거운']],
  E: [['sun', '☀️', '해'], ['bus', '🚌', '버스'], ['cup', '☕', '컵'], ['bug', '🐛', '벌레'], ['nut', '🥜', '견과'], ['hug', '🤗', '안아주기'],
      ['ship', '🚢', '배'], ['fish', '🐟', '물고기'], ['shell', '🐚', '조개'], ['chick', '🐤', '병아리'], ['cheese', '🧀', '치즈'], ['chair', '🪑', '의자']],
};

// 문장 은행: en / ko / (선택) emoji
const SENTENCES = {
  3: [
    ['This is a cat.', '이것은 고양이예요.', '🐱'], ['I am happy.', '나는 행복해요.', '😊'], ['It is a big dog.', '그것은 큰 개예요.', '🐕'],
    ['I like apples.', '나는 사과를 좋아해요.', '🍎'], ['I have a red ball.', '나는 빨간 공이 있어요.', '🔴'], ['She is my mom.', '그녀는 우리 엄마예요.', '👩'],
    ['He is my dad.', '그는 우리 아빠예요.', '👨'], ['The sun is hot.', '해가 뜨거워요.', '☀️'], ['I see a bird.', '나는 새를 봐요.', '🐦'],
    ['We can run.', '우리는 달릴 수 있어요.', '🏃'], ['That is my bag.', '저것은 내 가방이에요.', '🎒'], ['It is a pen.', '그것은 펜이에요.', '🖊️'],
    ['I am six.', '나는 여섯 살이에요.', '6️⃣'], ['You are my friend.', '너는 내 친구야.', '🤝'], ['The cup is blue.', '컵이 파래요.', '🥤'],
    ['I like milk.', '나는 우유를 좋아해요.', '🥛'], ['It is a fish.', '그것은 물고기예요.', '🐟'], ['We are kids.', '우리는 어린이예요.', '🧒'],
  ],
  5: [
    ['The big bear is brown.', '큰 곰은 갈색이에요.', '🐻'], ['I have a small yellow duck.', '나는 작은 노란 오리가 있어요.', '🦆'],
    ['The tall tree is green.', '키 큰 나무는 초록색이에요.', '🌳'], ['My sister is very kind.', '우리 언니는 아주 친절해요.', '👧'],
    ['The soup is too hot.', '수프가 너무 뜨거워요.', '🍲'], ['I feel sleepy today.', '나는 오늘 졸려요.', '😴'],
    ['The little cat is soft.', '작은 고양이는 부드러워요.', '🐈'], ['This cake is so sweet.', '이 케이크는 정말 달아요.', '🍰'],
    ['The long train is fast.', '긴 기차는 빨라요.', '🚆'], ['My room is clean.', '내 방은 깨끗해요.', '🛏️'],
    ['The sky is dark.', '하늘이 어두워요.', '🌌'], ['He is strong and brave.', '그는 힘세고 용감해요.', '💪'],
    ['The flowers are pretty.', '꽃들이 예뻐요.', '🌸'], ['I am a little scared.', '나는 조금 무서워요.', '😨'],
    ['The old man is funny.', '그 할아버지는 재미있어요.', '👴'], ['Her dress is purple.', '그녀의 드레스는 보라색이에요.', '👗'],
  ],
  7: [
    ['I played soccer yesterday.', '나는 어제 축구를 했어요.', '⚽'], ['We went to the park.', '우리는 공원에 갔어요.', '🏞️'],
    ['She ate a sandwich.', '그녀는 샌드위치를 먹었어요.', '🥪'], ['I saw a rainbow.', '나는 무지개를 봤어요.', '🌈'],
    ['He drank some water.', '그는 물을 조금 마셨어요.', '💧'], ['They watched a movie.', '그들은 영화를 봤어요.', '🎬'],
    ['I helped my mom.', '나는 엄마를 도왔어요.', '🤲'], ['The dog jumped high.', '개가 높이 뛰었어요.', '🐕'],
    ['We made a snowman.', '우리는 눈사람을 만들었어요.', '⛄'], ['I read a book last night.', '나는 어젯밤에 책을 읽었어요.', '📖'],
    ['She cleaned her room.', '그녀는 방을 청소했어요.', '🧹'], ['I had a good day.', '나는 좋은 하루를 보냈어요.', '🌟'],
    ['He ran to school.', '그는 학교로 뛰어갔어요.', '🏫'], ['We sang a song.', '우리는 노래를 불렀어요.', '🎤'],
    ['I wrote a letter.', '나는 편지를 썼어요.', '✉️'], ['The baby slept well.', '아기가 잘 잤어요.', '👶'],
  ],
  8: [
    ['I will be a doctor.', '나는 의사가 될 거예요.', '🧑‍⚕️'], ['We will go to the beach.', '우리는 해변에 갈 거예요.', '🏖️'],
    ['It will rain tomorrow.', '내일 비가 올 거예요.', '🌧️'], ['I am going to bake cookies.', '나는 쿠키를 구울 거예요.', '🍪'],
    ['She will visit her grandma.', '그녀는 할머니 댁에 갈 거예요.', '👵'], ['He is going to fly a kite.', '그는 연을 날릴 거예요.', '🪁'],
    ['I will study hard.', '나는 열심히 공부할 거예요.', '📚'], ['We are going to plant a tree.', '우리는 나무를 심을 거예요.', '🌱'],
    ['I will be an astronaut.', '나는 우주비행사가 될 거예요.', '🧑‍🚀'], ['They will play together.', '그들은 함께 놀 거예요.', '🤸'],
    ['I am going to draw a picture.', '나는 그림을 그릴 거예요.', '🎨'], ['My dream is to be a singer.', '내 꿈은 가수가 되는 거예요.', '🎤'],
  ],
};

// 질문/대답 은행: q / a / ko
const QA = {
  4: [
    ['What is your name?', 'My name is Mia.', '이름이 뭐니? — 내 이름은 미아야.'], ['How are you?', 'I am fine, thank you.', '어떻게 지내? — 잘 지내, 고마워.'],
    ['How old are you?', 'I am seven years old.', '몇 살이니? — 나는 일곱 살이야.'], ['What color is it?', 'It is green.', '무슨 색이야? — 초록색이야.'],
    ['Do you like pizza?', 'Yes, I do.', '피자 좋아해? — 응, 좋아해.'], ['Can you swim?', 'No, I can not.', '수영할 수 있어? — 아니, 못 해.'],
    ['What is this?', 'It is a pencil.', '이건 뭐야? — 연필이야.'], ['Is it a cat?', 'No, it is a dog.', '고양이야? — 아니, 개야.'],
    ['What do you want?', 'I want some juice.', '뭘 원해? — 주스를 원해.'], ['Who is she?', 'She is my teacher.', '그녀는 누구야? — 우리 선생님이야.'],
    ['How many apples?', 'There are three apples.', '사과가 몇 개야? — 사과가 세 개 있어.'], ['Are you hungry?', 'Yes, I am.', '배고프니? — 응, 배고파.'],
    ['What time is it?', 'It is two o\'clock.', '몇 시야? — 두 시야.'], ['Do you have a pet?', 'Yes, I have a hamster.', '애완동물 있어? — 응, 햄스터가 있어.'],
    ['What is your favorite food?', 'I like noodles.', '제일 좋아하는 음식은? — 국수를 좋아해.'], ['Can I help you?', 'Yes, please.', '도와줄까? — 응, 부탁해.'],
  ],
  6: [
    ['Where is the cat?', 'The cat is under the table.', '고양이는 어디 있어? — 탁자 밑에 있어.'], ['Who is that boy?', 'He is my cousin Tom.', '저 남자아이는 누구야? — 내 사촌 톰이야.'],
    ['When do you get up?', 'I get up at seven.', '언제 일어나? — 일곱 시에 일어나.'], ['What are you doing?', 'I am reading a book.', '뭐 하고 있어? — 책을 읽고 있어.'],
    ['Where do you live?', 'I live in Seoul.', '어디 살아? — 서울에 살아.'], ['Why are you sad?', 'Because I lost my toy.', '왜 슬퍼? — 장난감을 잃어버렸거든.'],
    ['How do you go to school?', 'I go to school by bus.', '학교에 어떻게 가? — 버스로 가.'], ['Where is my hat?', 'It is on the chair.', '내 모자 어디 있어? — 의자 위에 있어.'],
    ['When is your birthday?', 'It is in May.', '생일이 언제야? — 5월이야.'], ['What does he like?', 'He likes robots.', '그는 뭘 좋아해? — 로봇을 좋아해.'],
    ['Who has the ball?', 'Mina has the ball.', '누가 공을 가지고 있어? — 미나가 가지고 있어.'], ['Where are the birds?', 'They are in the tree.', '새들은 어디 있어? — 나무에 있어.'],
    ['What do you eat for lunch?', 'I eat rice and soup.', '점심에 뭘 먹어? — 밥이랑 국을 먹어.'], ['When do you sleep?', 'I sleep at nine.', '언제 자? — 아홉 시에 자.'],
    ['Where is the library?', 'It is next to the bank.', '도서관은 어디야? — 은행 옆에 있어.'], ['Who is singing?', 'My brother is singing.', '누가 노래하고 있어? — 우리 형이 노래하고 있어.'],
  ],
};

const VERBS = [
  ['go', 'went'], ['eat', 'ate'], ['see', 'saw'], ['play', 'played'], ['drink', 'drank'], ['watch', 'watched'], ['help', 'helped'], ['jump', 'jumped'],
  ['make', 'made'], ['read', 'read'], ['clean', 'cleaned'], ['have', 'had'], ['run', 'ran'], ['sing', 'sang'], ['write', 'wrote'], ['sleep', 'slept'],
  ['come', 'came'], ['swim', 'swam'], ['walk', 'walked'], ['give', 'gave'],
];
const WRONG_PAST = { go: 'goed', eat: 'eated', see: 'seed', drink: 'drinked', make: 'maked', read: 'readed', have: 'haved', run: 'runned', sing: 'singed', write: 'writed', sleep: 'sleeped', come: 'comed', swim: 'swimmed', give: 'gived' };

const STORIES = [
  { id: 1, stage: 1, title: 'ABC Picnic', cover: '🧺', pages: [
    ['A is for apple.', '🍎'], ['B is for banana.', '🍌'], ['C is for cookie.', '🍪'], ['We eat in the park.', '🌳'], ['Yum! What a fun picnic!', '😋'] ] },
  { id: 2, stage: 2, title: 'The Fat Cat', cover: '🐈', pages: [
    ['A cat sat on a mat.', '🐈'], ['The cat is fat.', '🐱'], ['A rat ran to the cat.', '🐀'], ['The cat had a nap.', '😴'], ['The rat got a hat!', '🎩'] ] },
  { id: 3, stage: 3, title: 'My Family', cover: '👨‍👩‍👧', pages: [
    ['This is my mom.', '👩'], ['This is my dad.', '👨'], ['This is my baby brother.', '👶'], ['We are a happy family.', '👨‍👩‍👦'], ['I love my family.', '❤️'] ] },
  { id: 4, stage: 4, title: 'New Friend', cover: '🤝', pages: [
    ['Hi! What is your name?', '👦'], ['My name is Lily.', '👧'], ['How old are you?', '👦'], ['I am seven years old.', '👧'], ['Let us be friends!', '🤝'] ] },
  { id: 5, stage: 5, title: 'The Rainy Day', cover: '🌧️', pages: [
    ['The sky is gray and dark.', '☁️'], ['Big drops fall on the roof.', '🌧️'], ['I wear my yellow boots.', '🥾'], ['The puddles are deep and fun.', '💦'], ['Now the sky is bright and blue!', '🌈'] ] },
  { id: 6, stage: 6, title: 'Where Is Max?', cover: '🐶', pages: [
    ['Where is Max the dog?', '🐶'], ['Is he under the bed? No!', '🛏️'], ['Is he in the kitchen? No!', '🍳'], ['He is behind the sofa.', '🛋️'], ['Max is sleeping. Shh!', '💤'] ] },
  { id: 7, stage: 7, title: 'My Weekend', cover: '🎡', pages: [
    ['On Saturday, I went to the zoo.', '🦒'], ['I saw a big elephant.', '🐘'], ['I ate ice cream with my dad.', '🍦'], ['On Sunday, I played with my friends.', '⚽'], ['I had a great weekend!', '🌟'] ] },
  { id: 8, stage: 8, title: 'When I Grow Up', cover: '🚀', pages: [
    ['What will you be?', '🤔'], ['I will be a pilot.', '🧑‍✈️'], ['I am going to fly around the world.', '✈️'], ['I will visit many countries.', '🌍'], ['My dream will come true!', '✨'] ] },
];

// 레벨 테스트: stage가 높을수록 어려운 문항
const LEVEL_TEST = [
  { stage: 1, type: 'listen', say: 'B', q: '들리는 알파벳을 고르세요.', options: ['B', 'D', 'P'], answer: 'B' },
  { stage: 1, type: 'pick', q: '"g"의 대문자는?', options: ['J', 'G', 'Q'], answer: 'G' },
  { stage: 2, type: 'listen', say: 'cat', q: '들리는 단어를 고르세요.', options: ['🐱 cat', '🐶 dog', '🐷 pig'], answer: '🐱 cat' },
  { stage: 2, type: 'pick', q: '"sun"의 첫소리는?', options: ['s', 'z', 'c'], answer: 's' },
  { stage: 3, type: 'pick', q: '빈칸에 알맞은 말: I ___ happy.', options: ['am', 'is', 'are'], answer: 'am' },
  { stage: 3, type: 'pick', q: '"This is a dog."의 뜻은?', options: ['이것은 개예요.', '저것은 고양이예요.', '나는 개를 좋아해요.'], answer: '이것은 개예요.' },
  { stage: 4, type: 'pick', q: '"How old are you?"에 알맞은 대답은?', options: ['I am seven.', 'I am fine.', 'It is red.'], answer: 'I am seven.' },
  { stage: 5, type: 'pick', q: '알맞은 순서는?', options: ['a big red ball', 'a red big ball ball', 'ball a big red'], answer: 'a big red ball' },
  { stage: 6, type: 'pick', q: '"Where is the cat?"에 알맞은 대답은?', options: ['It is under the bed.', 'It is at seven.', 'It is my cat.'], answer: 'It is under the bed.' },
  { stage: 7, type: 'pick', q: '"go"의 과거형은?', options: ['goed', 'went', 'gone'], answer: 'went' },
  { stage: 7, type: 'pick', q: 'Yesterday I ___ a cake.', options: ['eat', 'ate', 'will eat'], answer: 'ate' },
  { stage: 8, type: 'pick', q: 'Tomorrow I ___ visit my grandma.', options: ['will', 'did', 'was'], answer: 'will' },
];

const AVATARS = ['🐰', '🐻', '🦊', '🐼', '🐯', '🐨', '🐸', '🦁', '🐧', '🦄'];

// 월 요금 (1개월 상품도 할인 · 웰컴쿠폰은 모든 기간의 정가에서 할인)
const PLANS = {
  one: { list: 58750, m1: 52900, m6: 49833, m12: 44000, coupon: { 1: 0.15, 6: 0.20, 12: 0.30 } },
  two: { list: 117500, m1: 99000, m6: 88000, m12: 76333, coupon: { 1: 0.20, 6: 0.30, 12: 0.40 } },
};
const planMonthly = (kids, months) => PLANS[kids]['m' + months];

// 별(⭐) 상점: 레슨·스토리·말하기·놀이터에서 모은 별로 스티커와 꾸미기 아이템을 사요
const SHOP = [
  { id: 'st-star', kind: 'sticker', emoji: '🌟', name: '반짝 별', cost: 3 },
  { id: 'st-rainbow', kind: 'sticker', emoji: '🌈', name: '무지개', cost: 4 },
  { id: 'st-dino', kind: 'sticker', emoji: '🦖', name: '공룡', cost: 5 },
  { id: 'st-rocket', kind: 'sticker', emoji: '🚀', name: '로켓', cost: 6 },
  { id: 'st-unicorn', kind: 'sticker', emoji: '🦄', name: '유니콘', cost: 6 },
  { id: 'st-icecream', kind: 'sticker', emoji: '🍦', name: '아이스크림', cost: 4 },
  { id: 'st-trophy', kind: 'sticker', emoji: '🏆', name: '트로피', cost: 10 },
  { id: 'st-planet', kind: 'sticker', emoji: '🪐', name: '토성', cost: 8 },
  { id: 'acc-crown', kind: 'acc', emoji: '👑', name: '왕관', cost: 12 },
  { id: 'acc-hat', kind: 'acc', emoji: '🎩', name: '마술 모자', cost: 8 },
  { id: 'acc-glasses', kind: 'acc', emoji: '🕶️', name: '선글라스', cost: 8 },
  { id: 'acc-bow', kind: 'acc', emoji: '🎀', name: '리본', cost: 6 },
];


const FAQ = [
  { cat: '무료체험', q: '무료체험은 어떻게 시작하나요?', a: '회원가입 후 아이의 학습 프로필을 만들면 바로 7일 무료체험이 시작돼요. 별도의 신청 절차는 없습니다.' },
  { cat: '무료체험', q: '무료체험이 끝나면 자동으로 결제되나요?', a: '아니요. 체험 기간이 끝나도 자동 결제는 발생하지 않아요. 멤버십을 직접 구매해야만 계속 이용할 수 있어요.' },
  { cat: '무료체험', q: '체험 기간에도 모든 콘텐츠를 쓸 수 있나요?', a: '네. 유료 멤버십과 똑같이 모든 레벨, 스토리북, AI 말하기, 부모 리포트를 이용할 수 있어요.' },
  { cat: '무료체험', q: '두 자녀가 같이 체험할 수 있나요?', a: '한 계정에서 여러 아이 프로필을 만들 수 있지만 무료체험 기간은 계정 단위로 함께 적용돼요. 두 자녀가 계속 이용하려면 "두 자녀" 멤버십을 선택하세요.' },
  { cat: '멤버십', q: '체험 중에 멤버십을 사면 남은 기간과 진도가 사라지나요?', a: '아니요. 남은 체험 기간은 멤버십 기간에 더해지고, 학습 진도와 기록도 그대로 유지돼요.' },
  { cat: '멤버십', q: '웰컴쿠폰은 어떻게 받나요?', a: '회원가입 즉시 부모페이지 > 쿠폰함에 웰컴쿠폰이 자동 발급돼요. 10일 동안 1·6·12개월 모든 상품에 쓸 수 있고, 정가에서 할인되며 기간이 길수록 할인율이 커져요.' },
  { cat: '멤버십', q: '구독을 해지하거나 환불하려면?', a: '부모페이지 > 멤버십에서 "자동갱신 해지"를 누르면 다음 결제가 일어나지 않아요. 결제 후 7일 이내에 학습 기록이 거의 없으면 같은 화면에서 바로 환불(데모)할 수 있어요.' },
  { cat: '계정', q: '가입은 어떻게 하나요?', a: '카카오·네이버·Google·Apple 계정으로 바로 시작하거나, 이메일로 받은 6자리 인증코드만 입력하면 돼요. 비밀번호는 필요 없어요.' },
  { cat: '학습', q: '별(⭐)은 어디에 쓰나요?', a: '레슨 별점, 스토리 완독, 말하기 80점 이상, 놀이터 게임으로 별을 모아요. 모은 별로 별 상점에서 스티커와 아바타 꾸미기 아이템을 살 수 있어요.' },
  { cat: '학습', q: '소리가 너무 크거나 작아요.', a: '레슨 화면 위쪽 🔊 버튼이나 부모페이지 > 설정에서 목소리와 효과음 볼륨을 따로 조절할 수 있어요.' },
  { cat: '학습', q: '워크시트는 어떻게 받나요?', a: '부모페이지 > 워크시트에서 레벨을 골라 바로 인쇄하거나 PDF로 저장해요. 인쇄한 날짜가 기록돼요.' },
  { cat: '학습', q: '하루에 얼마나 학습하면 좋을까요?', a: '하루 10~20분, 레슨 1~2개를 권장해요. 부모페이지에서 하루 목표 레슨 수를 정할 수 있고, 목표를 채우면 학습 도장이 찍혀요.' },
  { cat: '학습', q: '어느 레벨부터 시작해야 하나요?', a: '첫 프로필을 만들면 레벨 테스트를 볼 수 있어요. 결과에 따라 알맞은 레벨부터 시작하고, 이전 레벨도 언제든 복습할 수 있어요.' },
  { cat: '학습', q: 'AI 말하기가 작동하지 않아요.', a: 'AI 발음 코칭은 브라우저의 음성 인식 기능을 사용해요. Chrome 또는 Edge 브라우저에서 마이크 권한을 허용해 주세요. 지원하지 않는 브라우저에서는 듣고 따라 말하기 모드로 진행돼요.' },
  { cat: '학습', q: '틀린 문제는 다시 볼 수 있나요?', a: '틀린 문제는 자동으로 오답노트에 저장돼요. 오답노트에서 다시 풀어 맞히면 목록에서 사라져요.' },
  { cat: '계정', q: '학습 알림은 어떻게 받나요?', a: '레슨을 마칠 때마다 부모페이지 > 학습알림에 기록이 남아요. 브라우저 알림을 허용하면 학습 완료와 매일 정해진 시간의 학습 리마인더를 알림으로 받을 수 있어요.' },
  { cat: '계정', q: '데이터는 어디에 저장되나요?', a: '이 데모 버전은 모든 데이터를 이 브라우저(localStorage)에만 저장해요. 부모페이지 > 설정에서 학습 기록을 파일로 내보내거나 불러올 수 있어요.' },
];

const SAMPLE_REVIEWS = [
  { rating: 4, name: '6살 하린 보호자', text: '알파벳 따라쓰기를 정말 좋아해요. 매일 도장 모으는 재미로 스스로 앱을 켜요.', date: '2026-09-02' },
  { rating: 4, name: '7살 도윤 보호자', text: 'AI 말하기에서 점수가 올라가니까 발음 연습을 계속 하려고 해요. 부모 리포트로 약한 단어를 확인할 수 있어 좋아요.', date: '2026-09-14' },
  { rating: 3, name: '8살 서아 보호자', text: '오답노트 기능 덕분에 틀린 문제를 다시 풀 수 있어요. 스토리북이 조금 더 많았으면 좋겠어요.', date: '2026-09-21' },
  { rating: 4, name: '5살 지호 보호자', text: '레벨 테스트로 시작 레벨을 정해주니 너무 쉽거나 어렵지 않아서 좋았어요.', date: '2026-10-01' },
  { rating: 4, name: '9살 은우 보호자', text: '과거형 단계에서 불규칙 동사를 게임처럼 익히더라고요. 하루 15분이면 충분해요.', date: '2026-10-08' },
  { rating: 2, name: '6살 민준 보호자', text: '음성 인식이 아이 목소리를 가끔 잘 못 알아들어요. 그래도 듣고 따라하기는 유용해요.', date: '2026-10-11' },
  { rating: 4, name: '7살 예린 보호자', text: '스토리북을 읽어줄 때 단어가 하나씩 강조돼서 아이가 글자를 따라가며 읽어요.', date: '2026-10-19' },
];
const RATING_LABELS = { 4: '매우 좋아요', 3: '좋아요', 2: '그럭저럭 쓸만해요', 1: '개선이 필요해요' };
