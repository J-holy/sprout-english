/* 새싹영어 — 학습 콘텐츠 (26레벨 × 10일 = 260레슨, 하루 1레슨·주 5일 기준 약 1년)
 * 레벨마다 9일은 새 항목 + 앞에서 배운 항목 복습, 10일째는 레벨 전체 복습이에요.
 */
const LESSONS_PER_LEVEL = 10;
const TOTAL_LESSONS = 26 * LESSONS_PER_LEVEL;

// 1단계: 알파벳 — 글자마다 그림 단어 3개 (X는 끝소리 단어)
const LETTER_WORDS = {
  A: [['apple', '🍎'], ['ant', '🐜'], ['alligator', '🐊']], B: [['ball', '⚽'], ['bear', '🐻'], ['banana', '🍌']],
  C: [['cat', '🐱'], ['car', '🚗'], ['cake', '🎂']], D: [['dog', '🐶'], ['duck', '🦆'], ['door', '🚪']],
  E: [['egg', '🥚'], ['elephant', '🐘'], ['envelope', '✉️']], F: [['fish', '🐟'], ['frog', '🐸'], ['fork', '🍴']],
  G: [['goat', '🐐'], ['grapes', '🍇'], ['gift', '🎁']], H: [['hat', '🎩'], ['horse', '🐴'], ['house', '🏠']],
  I: [['insect', '🐞'], ['iguana', '🦎'], ['ice', '🧊']], J: [['juice', '🧃'], ['jeans', '👖'], ['jet', '🛩️']],
  K: [['kite', '🪁'], ['key', '🔑'], ['king', '🤴']], L: [['lion', '🦁'], ['lemon', '🍋'], ['leaf', '🍃']],
  M: [['moon', '🌙'], ['monkey', '🐒'], ['milk', '🥛']], N: [['nose', '👃'], ['nut', '🥜'], ['net', '🥅']],
  O: [['octopus', '🐙'], ['orange', '🍊'], ['otter', '🦦']], P: [['pig', '🐷'], ['panda', '🐼'], ['pizza', '🍕']],
  Q: [['queen', '👸'], ['question', '❓'], ['quiet', '🤫']], R: [['rabbit', '🐰'], ['rainbow', '🌈'], ['robot', '🤖']],
  S: [['sun', '☀️'], ['snake', '🐍'], ['star', '⭐']], T: [['tiger', '🐯'], ['tomato', '🍅'], ['train', '🚆']],
  U: [['umbrella', '☂️'], ['up', '⬆️'], ['unicorn', '🦄']], V: [['van', '🚐'], ['violin', '🎻'], ['volcano', '🌋']],
  W: [['whale', '🐳'], ['watch', '⌚'], ['worm', '🪱']], X: [['box', '📦'], ['fox', '🦊'], ['six', '6️⃣']],
  Y: [['yo-yo', '🪀'], ['yarn', '🧶'], ['yellow', '💛']], Z: [['zebra', '🦓'], ['zero', '0️⃣']],
};
const LETTERS = Object.entries(LETTER_WORDS).map(([letter, ws]) => ({ letter, word: ws[0][0], emoji: ws[0][1], words: ws, ending: letter === 'X' }));

// 2단계: 파닉스 — [단어, 그림, 뜻]
const PHONICS = {
  C: [ // 짧은 a · 짧은 e · 짧은 i
    ['cat', '🐱', '고양이'], ['hat', '🎩', '모자'], ['bat', '🦇', '박쥐'], ['map', '🗺️', '지도'], ['van', '🚐', '승합차'], ['bag', '👜', '가방'],
    ['can', '🥫', '깡통'], ['cap', '🧢', '야구 모자'], ['fan', '🪭', '부채'], ['dad', '👨', '아빠'], ['pan', '🍳', '프라이팬'], ['rat', '🐀', '쥐'],
    ['bed', '🛏️', '침대'], ['hen', '🐔', '암탉'], ['net', '🥅', '그물'], ['pen', '🖊️', '펜'], ['web', '🕸️', '거미줄'], ['leg', '🦵', '다리'],
    ['ten', '🔟', '열'], ['red', '🟥', '빨강'], ['pig', '🐷', '돼지'], ['pin', '📌', '핀'], ['six', '6️⃣', '여섯'], ['lip', '👄', '입술']],
  D: [ // 짧은 o · 짧은 u · sh · ch · th
    ['dog', '🐶', '강아지'], ['box', '📦', '상자'], ['fox', '🦊', '여우'], ['pot', '🍲', '냄비'], ['log', '🪵', '통나무'], ['frog', '🐸', '개구리'],
    ['sock', '🧦', '양말'], ['rock', '🪨', '바위'], ['mom', '👩', '엄마'], ['sun', '☀️', '해'], ['bus', '🚌', '버스'], ['cup', '☕', '컵'],
    ['bug', '🐛', '벌레'], ['nut', '🥜', '견과'], ['duck', '🦆', '오리'], ['drum', '🥁', '북'], ['truck', '🚚', '트럭'], ['ship', '🚢', '큰 배'],
    ['fish', '🐟', '물고기'], ['shell', '🐚', '조개'], ['chick', '🐤', '병아리'], ['lunch', '🍱', '점심'], ['bath', '🛁', '목욕'], ['thumb', '👍', '엄지손가락']],
  E: [ // 긴 모음: 매직 e (a_e · i_e · o_e · u_e) · 모음 짝 (ee · ea · ai · oa)
    ['cake', '🎂', '케이크'], ['snake', '🐍', '뱀'], ['plane', '✈️', '비행기'], ['kite', '🪁', '연'], ['bike', '🚲', '자전거'], ['five', '5️⃣', '다섯'],
    ['nine', '9️⃣', '아홉'], ['smile', '😊', '미소'], ['rose', '🌹', '장미'], ['bone', '🦴', '뼈'], ['home', '🏠', '집'], ['nose', '👃', '코'],
    ['cube', '🧊', '큐브'], ['tree', '🌳', '나무'], ['bee', '🐝', '벌'], ['feet', '🦶', '발'], ['sheep', '🐑', '양'], ['leaf', '🍃', '나뭇잎'],
    ['rain', '🌧️', '비'], ['train', '🚆', '기차'], ['snail', '🐌', '달팽이'], ['boat', '⛵', '보트'], ['goat', '🐐', '염소'], ['soap', '🧼', '비누']],
};

// 문장 은행: [영어, 뜻, 그림]
const SENTENCES = {
  3: [
    // F: be동사 · this/that
    ['This is a cat.', '이것은 고양이예요.', '🐱'], ['That is a dog.', '저것은 강아지예요.', '🐶'], ['It is a big dog.', '그것은 큰 강아지예요.', '🐕'],
    ['I am happy.', '나는 행복해요.', '😊'], ['I am six years old.', '나는 여섯 살이에요.', '6️⃣'], ['You are my friend.', '너는 내 친구야.', '🤝'],
    ['She is my mom.', '그녀는 우리 엄마예요.', '👩'], ['He is my dad.', '그는 우리 아빠예요.', '👨'], ['We are kids.', '우리는 어린이예요.', '🧒'],
    ['It is a pen.', '그것은 펜이에요.', '🖊️'], ['That is my bag.', '저것은 내 가방이에요.', '🎒'], ['This is my hat.', '이것은 내 모자예요.', '🎩'],
    ['It is red.', '그것은 빨간색이에요.', '🔴'], ['The sun is hot.', '해가 뜨거워요.', '☀️'], ['The cup is blue.', '컵이 파래요.', '🥤'],
    ['It is a fish.', '그것은 물고기예요.', '🐟'], ['I am a boy.', '나는 남자아이예요.', '👦'], ['I am a girl.', '나는 여자아이예요.', '👧'],
    ['They are my toys.', '그것들은 내 장난감이에요.', '🧸'], ['This is a book.', '이것은 책이에요.', '📕'],
    // G: have · like · see
    ['I like apples.', '나는 사과를 좋아해요.', '🍎'], ['I like milk.', '나는 우유를 좋아해요.', '🥛'], ['I have a red ball.', '나는 빨간 공이 있어요.', '🔴'],
    ['I see a bird.', '나는 새를 봐요.', '🐦'], ['I have a pet.', '나는 반려동물이 있어요.', '🐹'], ['I like cats.', '나는 고양이를 좋아해요.', '🐈'],
    ['She has a doll.', '그녀는 인형이 있어요.', '🪆'], ['He has a bike.', '그는 자전거가 있어요.', '🚲'], ['We like ice cream.', '우리는 아이스크림을 좋아해요.', '🍦'],
    ['I see a big tree.', '나는 큰 나무를 봐요.', '🌳'], ['I have two hands.', '나는 손이 두 개 있어요.', '🙌'], ['I like my school.', '나는 우리 학교를 좋아해요.', '🏫'],
    ['They have a car.', '그들은 차가 있어요.', '🚗'], ['I see the moon.', '나는 달을 봐요.', '🌙'], ['I like to read.', '나는 읽는 것을 좋아해요.', '📖'],
    ['She likes pink.', '그녀는 분홍색을 좋아해요.', '🌸'], ['He likes trains.', '그는 기차를 좋아해요.', '🚆'], ['I have a little sister.', '나는 여동생이 있어요.', '👧'],
    ['We see the stars.', '우리는 별을 봐요.', '⭐'], ['I like rainy days.', '나는 비 오는 날을 좋아해요.', '🌧️'],
    // H: can · 위치 · 복수
    ['We can run.', '우리는 달릴 수 있어요.', '🏃'], ['I can jump.', '나는 뛸 수 있어요.', '🦘'], ['I can swim.', '나는 수영할 수 있어요.', '🏊'],
    ['A bird can fly.', '새는 날 수 있어요.', '🐦'], ['A fish can swim.', '물고기는 헤엄칠 수 있어요.', '🐟'], ['I can sing a song.', '나는 노래를 부를 수 있어요.', '🎤'],
    ['The cat is on the bed.', '고양이가 침대 위에 있어요.', '🛏️'], ['The ball is in the box.', '공이 상자 안에 있어요.', '📦'], ['The dog is under the table.', '강아지가 탁자 밑에 있어요.', '🐕'],
    ['I see three ducks.', '나는 오리 세 마리를 봐요.', '🦆 🦆 🦆'], ['There are two cats.', '고양이가 두 마리 있어요.', '🐱 🐱'], ['The apples are red.', '사과들이 빨개요.', '🍎'],
    ['My shoes are new.', '내 신발은 새것이에요.', '👟'], ['Look at the frog.', '개구리를 봐요.', '🐸'], ['Open the door.', '문을 열어요.', '🚪'],
    ['Sit down, please.', '앉아 주세요.', '🪑'], ["Let's play together.", '같이 놀자.', '🤸'], ['It is time to sleep.', '잘 시간이에요.', '😴'],
    ['I can ride a bike.', '나는 자전거를 탈 수 있어요.', '🚲'], ['Wash your hands.', '손을 씻어요.', '🫧'],
  ],
  5: [
    // M: 색깔 · 크기 · 모양
    ['The big bear is brown.', '큰 곰은 갈색이에요.', '🐻'], ['I have a small yellow duck.', '나는 작은 노란 오리가 있어요.', '🦆'], ['The tall tree is green.', '키 큰 나무는 초록색이에요.', '🌳'],
    ['Her dress is purple.', '그녀의 드레스는 보라색이에요.', '👗'], ['The long train is fast.', '긴 기차는 빨라요.', '🚆'], ['The tiny ant is black.', '아주 작은 개미는 검은색이에요.', '🐜'],
    ['I want the big red apple.', '나는 큰 빨간 사과를 원해요.', '🍎'], ['The little cat is soft.', '작은 고양이는 부드러워요.', '🐈'], ['My new shoes are white.', '내 새 신발은 하얀색이에요.', '👟'],
    ['The old car is slow.', '그 낡은 차는 느려요.', '🚗'], ['The giraffe has a long neck.', '기린은 목이 길어요.', '🦒'], ['The mouse has small ears.', '쥐는 귀가 작아요.', '🐭'],
    ['The ocean is deep and blue.', '바다는 깊고 파래요.', '🌊'], ['The snowman is round and white.', '눈사람은 둥글고 하얘요.', '⛄'], ['The pumpkin is big and orange.', '호박은 크고 주황색이에요.', '🎃'],
    ['The grass is short and green.', '잔디는 짧고 초록색이에요.', '🌿'],
    // N: 사람 · 감정
    ['My sister is very kind.', '우리 언니는 아주 친절해요.', '👧'], ['He is strong and brave.', '그는 힘세고 용감해요.', '💪'], ['I feel sleepy today.', '나는 오늘 졸려요.', '😴'],
    ['I am a little scared.', '나는 조금 무서워요.', '😨'], ['The old man is funny.', '그 할아버지는 재미있어요.', '👴'], ['She is happy and excited.', '그녀는 기쁘고 신이 나요.', '🤩'],
    ['My brother is angry.', '우리 형은 화가 났어요.', '😠'], ['The baby is cute and small.', '아기는 귀엽고 작아요.', '👶'], ['My teacher is smart.', '우리 선생님은 똑똑해요.', '🧑‍🏫'],
    ['I feel nervous before the test.', '나는 시험 전에 긴장돼요.', '😬'], ['Our coach is tall and fast.', '우리 코치님은 키가 크고 빨라요.', '🏃🏅'], ['The girl looks surprised.', '그 여자아이는 놀란 것 같아요.', '😲'],
    ['My friend is shy.', '내 친구는 수줍음이 많아요.', '🫣'], ['Grandma is gentle and warm.', '할머니는 다정하고 따뜻해요.', '👵'], ['The clown is silly.', '광대는 우스꽝스러워요.', '🤡'],
    ['I am proud of you.', '나는 네가 자랑스러워.', '🏅'],
    // O: 맛 · 촉감 · 날씨 · 소리
    ['The soup is too hot.', '수프가 너무 뜨거워요.', '🍲'], ['This cake is so sweet.', '이 케이크는 정말 달아요.', '🍰'], ['The lemon is sour.', '레몬은 셔요.', '🍋'],
    ['The ice is cold and hard.', '얼음은 차갑고 단단해요.', '🧊'], ['The pillow is soft.', '베개는 부드러워요.', '🛌'], ['The sky is dark.', '하늘이 어두워요.', '🌌'],
    ['It is windy today.', '오늘은 바람이 불어요.', '🌬️'], ['It is a sunny day.', '화창한 날이에요.', '☀️'], ['The chips are salty.', '감자칩은 짜요.', '🍟'],
    ['The rock is heavy.', '돌은 무거워요.', '🪨'], ['The feather is light.', '깃털은 가벼워요.', '🪶'], ['The road is wet after the rain.', '비가 온 뒤 길이 젖었어요.', '🌧️'],
    ['The flowers smell nice.', '꽃들이 좋은 냄새가 나요.', '🌸'], ['The music is loud.', '음악 소리가 커요.', '🔊'], ['The library is quiet.', '도서관은 조용해요.', '📚'],
    ['The kitten is warm and fuzzy.', '아기 고양이는 따뜻하고 보송보송해요.', '🐱'],
    // P: 비교 · 장소
    ['My room is clean.', '내 방은 깨끗해요.', '🚪🛏️'], ['The flowers are pretty.', '꽃들이 예뻐요.', '🌸'], ['An elephant is bigger than a dog.', '코끼리는 강아지보다 커요.', '🐘'],
    ['A turtle is slower than a rabbit.', '거북이는 토끼보다 느려요.', '🐢'], ['My bag is heavier than yours.', '내 가방은 네 것보다 무거워.', '🎒'], ['Summer is hotter than spring.', '여름은 봄보다 더워요.', '☀️'],
    ['The park is big and green.', '공원은 크고 푸르러요.', '🏞️'], ['Our kitchen is small but cozy.', '우리 부엌은 작지만 아늑해요.', '🚰'], ['The beach has white sand.', '해변에는 하얀 모래가 있어요.', '🏖️'],
    ['The city is busy and noisy.', '도시는 바쁘고 시끄러워요.', '🏙️'], ['The farm has many animals.', '농장에는 동물이 많아요.', '🐄'], ['This is the best day ever.', '오늘은 최고의 날이에요.', '🌟'],
    ['The mountain is very high.', '산이 아주 높아요.', '⛰️'], ['My dad is taller than my mom.', '아빠는 엄마보다 키가 커요.', '👨'], ['The red car is faster than the blue car.', '빨간 차는 파란 차보다 빨라요.', '🏎️'],
    ['The cheetah is the fastest animal.', '치타는 가장 빠른 동물이에요.', '🐆'],
  ],
  7: [
    // U: 규칙 과거형 (-ed)
    ['I played soccer yesterday.', '나는 어제 축구를 했어요.', '⚽'], ['They watched a movie.', '그들은 영화를 봤어요.', '🎬'], ['I helped my mom.', '나는 엄마를 도왔어요.', '🤲'],
    ['The dog jumped high.', '강아지가 높이 뛰었어요.', '🐕'], ['She cleaned her room.', '그녀는 방을 청소했어요.', '🧹'], ['We walked to the park.', '우리는 공원까지 걸어갔어요.', '🚶'],
    ['I washed my hands.', '나는 손을 씻었어요.', '🫧'], ['He opened the window.', '그는 창문을 열었어요.', '🪟'], ['We visited Grandma.', '우리는 할머니 댁을 방문했어요.', '👵'],
    ['I painted a picture.', '나는 물감으로 그림을 그렸어요.', '🎨'], ['She danced at the party.', '그녀는 파티에서 춤을 췄어요.', '💃'], ['The baby cried at night.', '아기가 밤에 울었어요.', '👶'],
    ['We cooked pancakes.', '우리는 팬케이크를 만들었어요.', '🥞'], ['I climbed a tree.', '나는 나무에 올랐어요.', '🌳'], ['He brushed his teeth.', '그는 이를 닦았어요.', '🪥'],
    ['The bus stopped here.', '버스가 여기에 섰어요.', '🚌'],
    // V: 불규칙 과거형 1
    ['We went to the park.', '우리는 공원에 갔어요.', '🏞️'], ['She ate a sandwich.', '그녀는 샌드위치를 먹었어요.', '🥪'], ['I saw a rainbow.', '나는 무지개를 봤어요.', '🌈'],
    ['He drank some water.', '그는 물을 조금 마셨어요.', '💧'], ['We made a snowman.', '우리는 눈사람을 만들었어요.', '⛄'], ['I read a book last night.', '나는 어젯밤에 책을 읽었어요.', '📖'],
    ['I had a good day.', '나는 좋은 하루를 보냈어요.', '🌟'], ['He ran to school.', '그는 학교로 뛰어갔어요.', '🏫'], ['We sang a song.', '우리는 노래를 불렀어요.', '🎤'],
    ['I wrote a letter.', '나는 편지를 썼어요.', '✉️'], ['The baby slept well.', '아기가 잘 잤어요.', '👶'], ['I came home at five.', '나는 다섯 시에 집에 왔어요.', '🏠'],
    ['We swam in the sea.', '우리는 바다에서 수영했어요.', '🏊'], ['She gave me a gift.', '그녀가 나에게 선물을 줬어요.', '🎁'], ['I got a new toy.', '나는 새 장난감을 받았어요.', '🧸'],
    ['He sat on the bench.', '그는 벤치에 앉았어요.', '🪑🌳'],
    // W: 불규칙 과거형 2
    ['I bought some bread.', '나는 빵을 샀어요.', '🍞'], ['We took a picture.', '우리는 사진을 찍었어요.', '📷'], ['The bird flew away.', '새가 날아갔어요.', '🐦'],
    ['I drew a cat.', '나는 고양이를 그렸어요.', '🐱'], ['He rode a horse.', '그는 말을 탔어요.', '🐴'], ['I found my lost sock.', '나는 잃어버린 양말을 찾았어요.', '🧦'],
    ['She caught the ball.', '그녀가 공을 잡았어요.', '⚾'], ['Our team won the game.', '우리 팀이 경기에서 이겼어요.', '🏆'], ['I felt sick yesterday.', '나는 어제 아팠어요.', '🤒'],
    ['We met a new friend.', '우리는 새 친구를 만났어요.', '🤝'], ['I lost my pencil.', '나는 연필을 잃어버렸어요.', '✏️'], ['Dad brought a cake.', '아빠가 케이크를 가져왔어요.', '🎂'],
    ['She told me a story.', '그녀가 나에게 이야기를 해줬어요.', '📖'], ['I wore my blue coat.', '나는 파란 코트를 입었어요.', '🧥'], ['We built a sandcastle.', '우리는 모래성을 쌓았어요.', '🏰'],
    ['The plant grew tall.', '식물이 크게 자랐어요.', '🌱'],
    // X: 일기 쓰기 (was/were · 순서)
    ['Yesterday was my birthday.', '어제는 내 생일이었어요.', '🎂'], ['The movie was very funny.', '영화는 정말 재미있었어요.', '🎬'], ['We were at the beach.', '우리는 해변에 있었어요.', '🏖️'],
    ['I did my homework.', '나는 숙제를 했어요.', '📝'], ['First, I woke up early.', '먼저, 나는 일찍 일어났어요.', '⏰'], ['Then, I ate breakfast.', '그다음, 나는 아침을 먹었어요.', '🥣'],
    ['After school, I played outside.', '방과 후에 나는 밖에서 놀았어요.', '🛝'], ['At night, I read a story.', '밤에 나는 이야기를 읽었어요.', '📖'], ['Last summer, we went camping.', '지난여름에 우리는 캠핑을 갔어요.', '🏕️'],
    ['It rained all day.', '하루 종일 비가 왔어요.', '🌧️'], ['The concert was amazing.', '음악회는 정말 멋졌어요.', '🎶'], ['I was tired after the trip.', '여행 후에 나는 피곤했어요.', '😪'],
    ['We had so much fun.', '우리는 정말 즐거웠어요.', '🥳'], ['I threw the ball far.', '나는 공을 멀리 던졌어요.', '🥎'], ['My friend and I laughed a lot.', '내 친구와 나는 많이 웃었어요.', '😂'],
    ['We said goodbye to Grandpa.', '우리는 할아버지께 작별 인사를 했어요.', '👋'],
  ],
  8: [
    // Y: will
    ['I will be a doctor.', '나는 의사가 될 거예요.', '🧑‍⚕️'], ['It will rain tomorrow.', '내일 비가 올 거예요.', '🌧️'], ['She will visit her grandma.', '그녀는 할머니 댁에 갈 거예요.', '👵'],
    ['I will study hard.', '나는 열심히 공부할 거예요.', '📚'], ['I will be an astronaut.', '나는 우주비행사가 될 거예요.', '🧑‍🚀'], ['They will play together.', '그들은 함께 놀 거예요.', '🤸'],
    ['We will go to the beach.', '우리는 해변에 갈 거예요.', '🏖️'], ['I will call you later.', '나중에 전화할게.', '📞'], ['He will help his dad.', '그는 아빠를 도와줄 거예요.', '🤲'],
    ['The bus will come soon.', '버스가 곧 올 거예요.', '🚌'], ['I will clean my room tonight.', '나는 오늘 밤 방을 청소할 거예요.', '🧹'], ['We will have a party.', '우리는 파티를 할 거예요.', '🎉'],
    ['It will be sunny on Sunday.', '일요일에는 화창할 거예요.', '☀️'], ['I will share my snack.', '내 간식을 나눠 줄게요.', '🍪'], ['You will love this book.', '너는 이 책을 정말 좋아할 거야.', '📚'],
    ['I will plant flowers in spring.', '나는 봄에 꽃을 심을 거예요.', '🌷'], ['Mom will make dinner.', '엄마가 저녁을 만드실 거예요.', '🍲'], ['I will try my best.', '나는 최선을 다할 거예요.', '💪'],
    ['We will see a dolphin.', '우리는 돌고래를 볼 거예요.', '🐬'], ['I will never give up.', '나는 절대 포기하지 않을 거예요.', '💪'],
    // Z: be going to · 나의 꿈
    ['I am going to bake cookies.', '나는 쿠키를 구울 거예요.', '🍪'], ['He is going to fly a kite.', '그는 연을 날릴 거예요.', '🪁'], ['We are going to plant a tree.', '우리는 나무를 심을 거예요.', '🌱'],
    ['I am going to draw a picture.', '나는 그림을 그릴 거예요.', '🎨'], ['My dream is to be a singer.', '내 꿈은 가수가 되는 거예요.', '🎤'], ['I am going to visit Jeju.', '나는 제주도에 갈 거예요.', '✈️'],
    ['She is going to learn piano.', '그녀는 피아노를 배울 거예요.', '🎹'], ['They are going to watch a play.', '그들은 연극을 볼 거예요.', '🎭'], ['I am going to read ten books.', '나는 책 열 권을 읽을 거예요.', '📚'],
    ['We are going to build a robot.', '우리는 로봇을 만들 거예요.', '🤖'], ['When I grow up, I will be a pilot.', '나는 커서 조종사가 될 거예요.', '🧑‍✈️'], ['I want to be a chef.', '나는 요리사가 되고 싶어요.', '🧑‍🍳'],
    ['My dream is to travel the world.', '내 꿈은 세계 여행이에요.', '🌍'], ['I am going to save money.', '나는 돈을 모을 거예요.', '💰'], ['Next year, I will be eight.', '내년에 나는 여덟 살이 될 거예요.', '🎂'],
    ['I hope to be a scientist.', '나는 과학자가 되기를 바라요.', '🔬'], ['We are going to go camping.', '우리는 캠핑을 갈 거예요.', '🏕️'], ['I am going to help animals.', '나는 동물들을 도울 거예요.', '🐾'],
    ['Someday, I will fly to the moon.', '언젠가 나는 달에 갈 거예요.', '🚀'], ['I will keep learning English.', '나는 영어를 계속 배울 거예요.', '📚'],
  ],
};

// 질문/대답 은행: [질문, 대답, 뜻]
const QA = {
  4: [
    // I: 인사 · 자기소개
    ['What is your name?', 'My name is Mia.', '이름이 뭐니? — 내 이름은 미아야.'], ['How are you?', 'I am fine, thank you.', '어떻게 지내? — 잘 지내, 고마워.'],
    ['How old are you?', 'I am seven years old.', '몇 살이니? — 나는 일곱 살이야.'], ['Nice to meet you.', 'Nice to meet you, too.', '만나서 반가워. — 나도 반가워.'],
    ['Where are you from?', 'I am from Korea.', '어디에서 왔니? — 한국에서 왔어.'], ['Who is he?', 'He is my brother.', '그는 누구니? — 우리 형이야.'],
    ['Who is she?', 'She is my teacher.', '그녀는 누구야? — 우리 선생님이야.'], ['Is this your bag?', 'Yes, it is.', '이거 네 가방이니? — 응, 맞아.'],
    ['Are you a student?', 'Yes, I am.', '너는 학생이니? — 응, 맞아.'], ['Good morning!', 'Good morning, Mom!', '좋은 아침! — 좋은 아침이에요, 엄마!'],
    ['How is the weather?', 'It is sunny.', '날씨가 어때? — 화창해.'], ['Do you have a brother?', "No, I don't.", '형제가 있니? — 아니, 없어.'],
    ['What is your favorite color?', 'My favorite color is blue.', '제일 좋아하는 색은? — 파란색이야.'], ['Can you help me?', 'Sure, I can.', '도와줄 수 있어? — 물론이지.'],
    ['Are you hungry?', 'Yes, I am.', '배고프니? — 응, 배고파.'], ['Thank you!', 'You are welcome.', '고마워! — 천만에.'],
    // J: 물건 · 색 · 수
    ['What is this?', 'It is a pencil.', '이건 뭐야? — 연필이야.'], ['What color is it?', 'It is green.', '무슨 색이야? — 초록색이야.'],
    ['Is it a cat?', 'No, it is a dog.', '고양이야? — 아니, 강아지야.'], ['How many apples are there?', 'There are three apples.', '사과가 몇 개 있어? — 사과가 세 개 있어.'],
    ['What is that?', 'It is a kite.', '저건 뭐야? — 연이야.'], ['What color is the sky?', 'The sky is blue.', '하늘은 무슨 색이야? — 하늘은 파래.'],
    ['How many legs does a dog have?', 'A dog has four legs.', '강아지는 다리가 몇 개야? — 강아지는 다리가 네 개야.'], ['Is it big?', 'No, it is small.', '그거 커? — 아니, 작아.'],
    ['What shape is it?', 'It is a circle.', '무슨 모양이야? — 동그라미야.'], ['How many pencils do you have?', 'I have five pencils.', '연필 몇 자루 있어? — 다섯 자루 있어.'],
    ['Whose book is this?', 'It is my book.', '이건 누구 책이야? — 내 책이야.'], ['Is the water cold?', 'Yes, it is very cold.', '물이 차가워? — 응, 아주 차가워.'],
    ['What is in the box?', 'There is a teddy bear in it.', '상자 안에 뭐가 있어? — 곰 인형이 있어.'], ['What color are bananas?', 'Bananas are yellow.', '바나나는 무슨 색이야? — 바나나는 노란색이야.'],
    ['Is this an egg?', 'Yes, it is an egg.', '이거 달걀이야? — 응, 달걀이야.'], ['What do you see?', 'I see a rainbow.', '뭐가 보여? — 무지개가 보여.'],
    // K: 좋아하는 것 · 할 수 있는 것 · 원하는 것
    ['Do you like pizza?', 'Yes, I do.', '피자 좋아해? — 응, 좋아해.'], ['Can you swim?', "No, I can't.", '수영할 수 있어? — 아니, 못 해.'],
    ['What do you want?', 'I want some juice.', '뭘 원해? — 주스를 원해.'], ['What is your favorite food?', 'My favorite food is noodles.', '제일 좋아하는 음식은? — 국수야.'],
    ['Do you have a pet?', 'Yes, I have a hamster.', '반려동물 있어? — 응, 햄스터가 있어.'], ['Can you play soccer?', 'Yes, I can.', '축구할 수 있어? — 응, 할 수 있어.'],
    ['What do you like to do?', 'I like to draw.', '뭐 하는 걸 좋아해? — 그림 그리는 걸 좋아해.'], ['Do you like carrots?', "No, I don't.", '당근 좋아해? — 아니, 안 좋아해.'],
    ['What animal do you like?', 'I like pandas.', '어떤 동물을 좋아해? — 판다를 좋아해.'], ['Can I help you?', 'Yes, please.', '도와줄까? — 응, 부탁해.'],
    ['Do you want some milk?', 'No, thank you.', '우유 좀 줄까? — 아니, 괜찮아.'], ['Can you count to ten?', 'Yes, I can.', '열까지 셀 수 있어? — 응, 할 수 있어.'],
    ['What sport do you like?', 'I like basketball.', '어떤 운동을 좋아해? — 농구를 좋아해.'], ['Do you like music?', 'Yes, I love music.', '음악 좋아해? — 응, 정말 좋아해.'],
    ['Can your dog run fast?', 'Yes, it can.', '너희 강아지는 빨리 달릴 수 있어? — 응, 할 수 있어.'], ['Which one do you want?', 'I want the red one.', '어떤 걸 원해? — 빨간 걸 원해.'],
    // L: 시간 · 하루 일과 · 기분
    ['What time is it?', 'It is two o\'clock.', '몇 시야? — 두 시야.'], ['What day is it today?', 'It is Monday.', '오늘 무슨 요일이야? — 월요일이야.'],
    ['How do you feel?', 'I feel happy.', '기분이 어때? — 행복해.'], ['Are you tired?', 'Yes, I am sleepy.', '피곤하니? — 응, 졸려.'],
    ['What time do you get up?', 'I get up at seven.', '몇 시에 일어나? — 일곱 시에 일어나.'], ['What do you eat for breakfast?', 'I eat bread and milk.', '아침으로 뭘 먹어? — 빵과 우유를 먹어.'],
    ['Is it raining?', 'No, it is sunny.', '비가 와? — 아니, 화창해.'], ['Are you okay?', 'Yes, I am okay.', '괜찮아? — 응, 괜찮아.'],
    ['Why are you happy?', 'Because it is my birthday.', '왜 기뻐? — 내 생일이거든.'], ['What season do you like?', 'I like summer.', '어떤 계절을 좋아해? — 여름을 좋아해.'],
    ['Is it cold outside?', 'Yes, wear your coat.', '밖이 추워? — 응, 코트 입어.'], ['What time is lunch?', 'Lunch is at twelve.', '점심은 몇 시야? — 열두 시야.'],
    ['How do you go home?', 'I walk home.', '집에 어떻게 가? — 걸어서 가.'], ['Do you brush your teeth?', 'Yes, every day.', '이 닦니? — 응, 매일.'],
    ['Are you ready?', "Yes, let's go.", '준비됐어? — 응, 가자.'], ['Good night!', 'Good night, Dad!', '잘 자! — 안녕히 주무세요, 아빠!'],
  ],
  6: [
    // Q: Where · 전치사
    ['Where is the cat?', 'The cat is under the table.', '고양이는 어디 있어? — 탁자 밑에 있어.'], ['Where is my hat?', 'It is on the chair.', '내 모자 어디 있어? — 의자 위에 있어.'],
    ['Where are the birds?', 'They are in the tree.', '새들은 어디 있어? — 나무에 있어.'], ['Where is the library?', 'It is next to the bank.', '도서관은 어디야? — 은행 옆에 있어.'],
    ['Where do you live?', 'I live in Seoul.', '어디 살아? — 서울에 살아.'], ['Where is the ball?', 'It is behind the door.', '공은 어디 있어? — 문 뒤에 있어.'],
    ['Where are my shoes?', 'They are by the bed.', '내 신발 어디 있어? — 침대 옆에 있어.'], ['Where is Grandma?', 'She is in the kitchen.', '할머니는 어디 계셔? — 부엌에 계셔.'],
    ['Where do you play?', 'I play in the park.', '어디서 놀아? — 공원에서 놀아.'], ['Where is the zoo?', 'It is near the school.', '동물원은 어디야? — 학교 근처야.'],
    ['Where is the clock?', 'It is on the wall.', '시계는 어디 있어? — 벽에 있어.'], ['Where are you going?', 'I am going to school.', '어디 가? — 학교에 가.'],
    ['Where is the bathroom?', 'It is down the hall.', '화장실은 어디야? — 복도 끝에 있어.'], ['Where are the keys?', 'They are in my bag.', '열쇠는 어디 있어? — 내 가방에 있어.'],
    ['Where is the moon?', 'It is in the sky.', '달은 어디 있어? — 하늘에 있어.'], ['Where do fish live?', 'They live in the water.', '물고기는 어디 살아? — 물속에 살아.'],
    // R: Who · What ~ing
    ['Who is that boy?', 'He is my cousin Tom.', '저 남자아이는 누구야? — 내 사촌 톰이야.'], ['Who has the ball?', 'Mina has the ball.', '누가 공을 가지고 있어? — 미나가 가지고 있어.'],
    ['Who is singing?', 'My brother is singing.', '누가 노래하고 있어? — 우리 형이 노래하고 있어.'], ['What are you doing?', 'I am reading a book.', '뭐 하고 있어? — 책을 읽고 있어.'],
    ['What is she doing?', 'She is cooking dinner.', '그녀는 뭐 하고 있어? — 저녁을 요리하고 있어.'], ['What are they doing?', 'They are playing tag.', '그들은 뭐 하고 있어? — 술래잡기를 하고 있어.'],
    ['Who is your best friend?', 'Jisu is my best friend.', '가장 친한 친구는 누구야? — 지수가 가장 친한 친구야.'], ['Who is at the door?', 'It is the mail carrier.', '문 앞에 누구야? — 집배원 아저씨야.'],
    ['What is he drawing?', 'He is drawing a house.', '그는 뭘 그리고 있어? — 집을 그리고 있어.'], ['Who can help me?', 'I can help you.', '누가 나를 도와줄 수 있어? — 내가 도와줄게.'],
    ['What is the baby doing?', 'The baby is sleeping.', '아기는 뭐 하고 있어? — 아기는 자고 있어.'], ['Who is your teacher?', 'Ms Kim is my teacher.', '선생님은 누구야? — 김 선생님이야.'],
    ['What are you eating?', 'I am eating an apple.', '뭐 먹고 있어? — 사과를 먹고 있어.'], ['Who is the tallest?', 'Dad is the tallest.', '누가 제일 키가 커? — 아빠가 제일 커.'],
    ['What is the dog doing?', 'The dog is digging a hole.', '강아지는 뭐 하고 있어? — 구멍을 파고 있어.'], ['Who wants cake?', 'I want cake!', '케이크 먹을 사람? — 나요!'],
    // S: When · 시간
    ['When do you get up?', 'I get up at seven.', '언제 일어나? — 일곱 시에 일어나.'], ['When is your birthday?', 'It is in May.', '생일이 언제야? — 5월이야.'],
    ['When do you sleep?', 'I sleep at nine.', '언제 자? — 아홉 시에 자.'], ['When does school start?', 'School starts at nine.', '학교는 언제 시작해? — 아홉 시에 시작해.'],
    ['When do you eat lunch?', 'I eat lunch at noon.', '점심은 언제 먹어? — 정오에 먹어.'], ['When is the party?', 'It is on Saturday.', '파티는 언제야? — 토요일이야.'],
    ['When do you play outside?', 'I play after school.', '언제 밖에서 놀아? — 방과 후에 놀아.'], ['When is Christmas?', 'It is in December.', '크리스마스는 언제야? — 12월이야.'],
    ['When do you take a bath?', 'I take a bath at night.', '언제 목욕해? — 밤에 목욕해.'], ['When does the bus come?', 'It comes at eight.', '버스는 언제 와? — 여덟 시에 와.'],
    ['When do you do homework?', 'I do it after dinner.', '숙제는 언제 해? — 저녁 먹고 해.'], ['When is your piano lesson?', 'It is on Tuesday.', '피아노 수업은 언제야? — 화요일이야.'],
    ['When do leaves fall?', 'They fall in autumn.', '나뭇잎은 언제 떨어져? — 가을에 떨어져.'], ['When do you visit Grandpa?', 'I visit him on Sundays.', '할아버지 댁에 언제 가? — 일요일마다 가.'],
    ['When do you wake up on weekends?', 'I wake up at eight.', '주말에는 언제 일어나? — 여덟 시에 일어나.'], ['When does it snow?', 'It snows in winter.', '눈은 언제 와? — 겨울에 와.'],
    // T: Why · How
    ['Why are you sad?', 'Because I lost my toy.', '왜 슬퍼? — 장난감을 잃어버렸거든.'], ['How do you go to school?', 'I go to school by bus.', '학교에 어떻게 가? — 버스로 가.'],
    ['Why are you late?', 'Because I missed the bus.', '왜 늦었어? — 버스를 놓쳤거든.'], ['How do you make a sandwich?', 'I put cheese on bread.', '샌드위치는 어떻게 만들어? — 빵에 치즈를 올려.'],
    ['Why do you like dogs?', 'Because they are cute.', '왜 강아지를 좋아해? — 귀엽거든.'], ['How is your mom?', 'She is fine.', '어머니는 잘 계셔? — 잘 계셔.'],
    ['How much is this?', 'It is two dollars.', '이거 얼마예요? — 2달러예요.'], ['Why is he crying?', 'Because he fell down.', '그는 왜 울어? — 넘어졌거든.'],
    ['How do you say this in English?', 'It is a watermelon.', '이걸 영어로 뭐라고 해? — 수박이야.'], ['Why do we need water?', 'Because we need it to live.', '왜 물이 필요해? — 살려면 물이 있어야 하니까.'],
    ['How tall are you?', 'I am one meter tall.', '키가 얼마야? — 1미터야.'], ['How many friends came?', 'Five friends came.', '친구가 몇 명 왔어? — 다섯 명 왔어.'],
    ['Why is the sky dark?', 'Because it is night.', '하늘이 왜 어두워? — 밤이니까.'], ['How do you feel today?', 'I feel great.', '오늘 기분 어때? — 아주 좋아.'],
    ['How do birds fly?', 'They flap their wings.', '새는 어떻게 날아? — 날개를 퍼덕여.'], ['Why are you smiling?', 'Because I am happy.', '왜 웃고 있어? — 행복하니까.'],
  ],
};

// 과거형 동사 (7단계 문항용) — [원형, 과거형]
const VERBS = [
  ['go', 'went'], ['eat', 'ate'], ['see', 'saw'], ['play', 'played'], ['drink', 'drank'], ['watch', 'watched'], ['help', 'helped'], ['jump', 'jumped'],
  ['make', 'made'], ['read', 'read'], ['clean', 'cleaned'], ['have', 'had'], ['run', 'ran'], ['sing', 'sang'], ['write', 'wrote'], ['sleep', 'slept'],
  ['come', 'came'], ['swim', 'swam'], ['walk', 'walked'], ['give', 'gave'], ['wash', 'washed'], ['open', 'opened'], ['visit', 'visited'], ['paint', 'painted'],
  ['dance', 'danced'], ['cry', 'cried'], ['cook', 'cooked'], ['climb', 'climbed'], ['brush', 'brushed'], ['stop', 'stopped'], ['get', 'got'], ['sit', 'sat'],
  ['buy', 'bought'], ['take', 'took'], ['fly', 'flew'], ['draw', 'drew'], ['ride', 'rode'], ['find', 'found'], ['catch', 'caught'], ['win', 'won'],
  ['feel', 'felt'], ['meet', 'met'], ['lose', 'lost'], ['bring', 'brought'], ['tell', 'told'], ['wear', 'wore'], ['build', 'built'], ['grow', 'grew'],
  ['wake', 'woke'], ['throw', 'threw'], ['laugh', 'laughed'], ['say', 'said'], ['do', 'did'], ['rain', 'rained'],
];
const WRONG_PAST = {
  go: 'goed', eat: 'eated', see: 'seed', drink: 'drinked', make: 'maked', read: 'readed', have: 'haved', run: 'runned', sing: 'singed', write: 'writed',
  sleep: 'sleeped', come: 'comed', swim: 'swimmed', give: 'gived', get: 'getted', sit: 'sitted', buy: 'buyed', take: 'taked', fly: 'flied', draw: 'drawed',
  ride: 'rided', find: 'finded', catch: 'catched', win: 'winned', feel: 'feeled', meet: 'meeted', lose: 'losed', bring: 'bringed', tell: 'telled',
  wear: 'weared', build: 'builded', grow: 'growed', wake: 'waked', throw: 'throwed', say: 'sayed', do: 'doed', cry: 'cryed', stop: 'stoped',
};

// 스토리북 (1~2단계 16쪽 안팎 · 3~4단계 20쪽 · 5~6단계 22쪽 · 7~8단계 24쪽). plus: 1~2단계에서도 플러스로 읽는 책 — 단계에서 배운 표현으로만 써서 아이가 혼자 따라 읽을 수 있어요
const STORIES = [
  { id: 1, stage: 1, title: 'ABC Picnic', cover: '🧺', pages: [
    ['A is for apple.', '🍎'], ['B is for banana.', '🍌'], ['C is for cookie.', '🍪'], ['D is for donut.', '🍩'], ['E is for egg.', '🥚'], ['F is for fruit.', '🍓 🍊 🍐'], ['G is for grapes.', '🍇'], ['H is for honey.', '🍯'], ['I is for ice cream.', '🍦'], ['J is for juice.', '🧃'], ['K is for kiwi.', '🥝'], ['L is for lemon.', '🍋'], ['M is for milk.', '🥛'], ['Mom has a big basket.', '👩 🧺'], ['We sit on the grass.', '👨‍👩‍👧 🌿'], ['We eat in the park.', '🌳 🥪 🧃'], ['Yum! What a fun picnic!', '😋 🧺 🌞']] },
  { id: 9, stage: 1, title: 'Animal Parade', cover: '🦓', pages: [
    ['N is for nose.', '🐘 👃'], ['O is for owl.', '🦉'], ['P is for panda.', '🐼'], ['Q is for queen bee.', '👑 🐝'], ['R is for rabbit.', '🐰'], ['S is for snake.', '🐍'], ['T is for tiger.', '🐯'], ['U is for unicorn.', '🦄'], ['V is for violin.', '🎻'], ['W is for whale.', '🐳'], ['Fox ends with X.', '🦊'], ['Y is for yo-yo.', '🪀'], ['Z is for zebra.', '🦓'], ['The animals walk in a line.', '🐼 🐯 🦓 🦉'], ['The band plays loud music.', '🥁 🎺 🎷'], ['What a fun parade!', '🎉 🥁 🎺']] },
  { id: 17, stage: 1, title: 'The Toy Shop', cover: '🧸', pages: [
    ['A is for airplane.', '✈️'], ['B is for ball.', '⚽'], ['C is for car.', '🚗'], ['D is for doll.', '🪆'], ['E is for engine.', '🚂'], ['F is for flag.', '🚩'], ['G is for guitar.', '🎸'], ['H is for hat.', '🎩'], ['I is for ice skates.', '⛸️'], ['J is for jump rope.', '🪢'], ['K is for kite.', '🪁'], ['L is for lamp.', '💡'], ['M is for mask.', '🎭'], ['We go to the toy shop.', '🏪 🧸'], ['I see many toys.', '🧸 🚗 🪁'], ['I pick a red kite.', '🧒 🪁'], ['Thank you, Dad!', '👨 🧒 💛']] },
  { id: 18, stage: 1, title: 'A Nature Walk', cover: '🌳', pages: [
    ['N is for nest.', '🪺'], ['O is for ocean.', '🌊'], ['P is for plant.', '🌱'], ['Q is for quiet.', '🤫'], ['R is for rainbow.', '🌈'], ['S is for sun.', '☀️'], ['T is for tree.', '🌳'], ['U is for umbrella.', '☂️'], ['V is for volcano.', '🌋'], ['W is for water.', '💧'], ['Six ends with X.', '6️⃣ 🐦'], ['Y is for yellow.', '💛 🌼'], ['Z is for zoo.', '🦁 🦓'], ['I walk with Grandpa.', '👴 🧒'], ['The world is so big!', '🌍 ✨'], ['I love my walk.', '🧒 💚']] },
  { id: 2, stage: 2, title: 'The Fat Cat', cover: '🐈', pages: [
    ['A cat sat on a mat.', '🐈 🟫'], ['The cat is fat.', '🐈 🍖'], ['A rat ran to the mat.', '🐀 💨 🟫'], ['The rat has a red hat.', '🐀 🎩'], ['The cat sees the hat.', '🐈 👀 🎩'], ['The cat wants the hat!', '🐈 😺 🎩'], ['The rat ran and hid.', '🐀 💨 🫣'], ['The rat hid in a box.', '🐀 📦'], ['The cat got up.', '🐈 ⬆️'], ['The cat ran to the box.', '🐈 💨 📦'], ['But the cat is so fat!', '🐈 😅'], ['The cat did not fit in the box.', '🐈 📦 ❌'], ['The cat sat back on the mat.', '🐈 🟫'], ['The cat had a nap.', '🐈 😴 💤'], ['The rat got the hat!', '🐀 🎩 🎉'], ['The rat ran off with a grin.', '🐀 💨 😁']] },
  { id: 10, stage: 2, title: 'Ben and the Bus', cover: '🚌', pages: [
    ['Ben has a red cap.', '👦 🧢'], ['Ben runs to the bus.', '🏃 💨 🚌'], ['The bus is big and red.', '🚌'], ['Ben gets on the bus.', '👦 ➡️ 🚌'], ['Ben sits with his pal Tom.', '👦 💺 👦'], ['The bus is hot.', '🚌 🥵 ☀️'], ['Ben has a fan.', '👦 🪭'], ['Tom has a bag of nuts.', '👦 🛍️ 🥜'], ['Tom gets a nut for Ben.', '👦 🥜 👦'], ['Yum! Ben and Tom munch.', '👦 👦 😋'], ['Ben and Tom nap.', '👦 👦 😴'], ['The bus stops.', '🚌 🛑'], ['Ben and Tom hop off.', '🚌 🏃 🏃'], ['They are at the big zoo!', '🦓 🦁 🐘'], ['Ben sees a cub in the sun.', '🦁 ☀️'], ['Tom sees a hippo in the mud.', '🦛 🟫'], ['What a fun trip!', '👦 👦 🎉']] },
  { id: 19, stage: 2, title: 'The Red Hen', cover: '🐔', pages: [
    ['A hen is in a pen.', '🐔 🏠'], ['The hen is red.', '🐔 ❤️'], ['The hen has ten eggs.', '🐔 🥚 🔟'], ['The eggs sit in a nest.', '🥚 🪺'], ['A fox is in the den.', '🦊 🕳️'], ['The fox wants an egg.', '🦊 🥚'], ['The fox runs to the pen.', '🦊 💨'], ['The hen sees the fox.', '🐔 👀 🦊'], ['The hen gets mad.', '🐔 😠'], ['The hen pecks the fox!', '🐔 💥 🦊'], ['The fox yelps.', '🦊 😫'], ['The fox runs back to the den.', '🦊 💨 🕳️'], ['The hen sits on the eggs.', '🐔 🥚'], ['Tap, tap, tap!', '🥚 💥'], ['Ten chicks hop out!', '🐣 🐣 🐣'], ['The hen is glad.', '🐔 😊 🐥']] },
  { id: 20, stage: 2, title: 'Pig in the Mud', cover: '🐷', pages: [
    ['A pig is in the mud.', '🐷 🟫'], ['The pig is pink.', '🐷 💗'], ['The pig likes mud.', '🐷 😊'], ['A duck sits on a log.', '🦆 🪵'], ['The duck quacks at the pig.', '🦆 💬 🐷'], ['Get up, pig!', '🦆 ⬆️'], ['The pig does not get up.', '🐷 ❌'], ['The sun is hot.', '☀️ 🥵'], ['The mud is wet.', '🟫 💧'], ['The duck hops in the mud, too.', '🦆 🟫'], ['Splat!', '💥 🟫'], ['Now the duck is a mess.', '🦆 🟫 😅'], ['The pig and the duck sit in the mud.', '🐷 🦆 🟫'], ['Kim gets the hose.', '👧 🚿'], ['Kim gets the pig and the duck wet.', '💦 🐷 🦆'], ['Fun in the sun!', '☀️ 😄']] },
  { id: 3, stage: 3, title: 'My Family', cover: '👨‍👩‍👧', pages: [
    ['This is my mom.', '👩'], ['She is kind.', '👩 💗'], ['She can cook.', '👩 🍳'], ['This is my dad.', '👨'], ['He is tall.', '👨 📏'], ['He can sing.', '👨 🎤'], ['This is my sister.', '👧'], ['She is six years old.', '👧 6️⃣'], ['She likes cats.', '👧 💗 🐱'], ['This is my baby brother.', '👶'], ['He is very small.', '👶 🍼'], ['He likes his toy duck.', '👶 🦆'], ['This is my grandma.', '👵'], ['She has a garden.', '👵 🌻 🌷'], ['This is my grandpa.', '👴'], ['He has a big hat.', '👴 👒'], ['This is my dog, Coco.', '🐶'], ['Coco can run fast.', '🐶 💨'], ['We are a happy family.', '👨‍👩‍👧‍👦 🐶 😊'], ['I love my family.', '🧒 ❤️ 👨‍👩‍👧‍👦']] },
  { id: 11, stage: 3, title: 'My Toy Box', cover: '🧸', pages: [
    ['This is my toy box.', '📦 🧸'], ['It is big and blue.', '🟦 📦'], ['I open the box.', '🧒 📦 ✨'], ['I have a red car.', '🚗'], ['It can go fast.', '🚗 💨'], ['I have a little bear.', '🧸'], ['It is soft and brown.', '🧸 💗'], ['I have a ball.', '🧒 🔵'], ['I like my blue ball.', '🧒 💙 🔵'], ['I have a robot.', '🤖'], ['It can walk.', '🤖 👣'], ['It can talk, too.', '🤖 💬'], ['I have a drum.', '🥁'], ['It is very loud!', '🥁 🔊 🙉'], ['I see a puzzle.', '🧩'], ['It has ten pieces.', '🧩 🔟'], ['My friend comes to play.', '👧 👋 🧒'], ['We share my toys.', '🧒 🧸 👧 🚗'], ['I can play all day!', '🧒 🧸 🚗 🤖'], ['Now I put my toys away.', '🧸 🚗 ➡️ 📦']] },
  { id: 21, stage: 3, title: 'My School', cover: '🏫', pages: [
    ['This is my school.', '🏫'], ['It is big and new.', '🏫 ✨'], ['This is my classroom.', '🏫 🪑'], ['It has many desks.', '🪑 🪑 🪑'], ['This is my teacher.', '👩‍🏫'], ['She is nice.', '👩‍🏫 😊'], ['She has long hair.', '👩‍🏫 💇‍♀️'], ['This is my friend, Jisu.', '👧 Jisu'], ['She can draw well.', '👧 🎨'], ['This is my bag.', '🎒'], ['It is green.', '🎒 💚'], ['I have a pencil case.', '✏️ 👝'], ['I have three pencils.', '✏️ ✏️ ✏️'], ['I like music class.', '🎵 🎹'], ['I can play the drum.', '🧒 🥁'], ['I like lunchtime, too.', '🍱 😋'], ['This is the playground.', '🛝'], ['We can run and jump.', '🏃 🤸'], ['My school is fun.', '🏫 😄'], ['I like my school!', '🧒 💛 🏫']] },
  { id: 22, stage: 3, title: 'On the Farm', cover: '🐄', pages: [
    ['This is a farm.', '🏡 🌾'], ['It is big and green.', '🌾 💚'], ['I can see a red barn.', '🛖 ❤️'], ['This is a cow.', '🐄'], ['It is black and white.', '🐄 🖤 🤍'], ['It gives us milk.', '🐄 🥛'], ['This is a pig.', '🐷'], ['It is pink and fat.', '🐷 💗'], ['This is a sheep.', '🐑'], ['It is soft and white.', '🐑 ☁️'], ['This is a horse.', '🐴'], ['It can run fast.', '🐴 💨'], ['I see a little chick.', '🐥'], ['It is yellow.', '🐥 💛'], ['The farmer has a tractor.', '👨‍🌾 🚜'], ['It is red and big.', '🚜 ❤️'], ['I can feed the goats.', '🧒 🐐 🥕'], ['I like the farm animals.', '🧒 💛 🐄'], ['The sun is going down.', '🌅'], ['Bye, farm!', '👋 🌾']] },
  { id: 4, stage: 4, title: 'New Friend', cover: '🤝', pages: [
    ['Hi! What is your name?', '👦 👋 ❓'], ['My name is Lily.', '👧 💬 Lily'], ['What is your name?', '👧 ❓'], ['My name is Sam.', '👦 💬 Sam'], ['How old are you?', '👦 🎂 ❓'], ['I am seven years old.', '👧 7️⃣'], ['Me too!', '👦 7️⃣ 😄'], ['Where do you live?', '👦 🏠 ❓'], ['I live near the park.', '👧 🏠 🌳'], ['Do you like soccer?', '👦 ⚽ ❓'], ['Yes, I do!', '👧 👍 ⚽'], ['What is your favorite color?', '👦 🎨 ❓'], ['It is purple. What about you?', '👧 💜 ❓'], ['I like green.', '👦 💚'], ['Can you play with me?', '👦 🙋 ⚽'], ["Sure, let's play!", '👧 ⚽ 👦'], ['Lily kicks the ball.', '👧 🦵 ⚽'], ['Sam catches it. Good job!', '👦 🙌 ⚽'], ['See you tomorrow!', '👧 👋 👦'], ['We are good friends now.', '👧 🤝 👦 💛']] },
  { id: 12, stage: 4, title: 'At the Shop', cover: '🏪', pages: [
    ['Can I help you?', '🧑‍💼 🏪'], ['Yes, I want some apples.', '👧 🍎'], ['How many apples?', '🧑‍💼 🍎 ❓'], ['Three apples, please.', '🍎 🍎 🍎'], ['Do you want bananas, too?', '🧑‍💼 🍌 ❓'], ['No, thank you.', '👧 🙅‍♀️ 🍌'], ['Do you have milk?', '👧 🥛 ❓'], ['Yes, it is over there.', '🧑‍💼 👉 🥛'], ['Is it cold?', '👧 🧊 ❓'], ['Yes, it is very cold.', '🥛 🧊'], ['What is this?', '👧 🧁 ❓'], ['It is a muffin.', '🧁'], ['Can I have one?', '👧 🧁 🙏'], ['Of course!', '🧑‍💼 😊 🧁'], ['How much is it?', '👧 💰 ❓'], ['It is two dollars.', '💵 💵'], ['Here you are.', '👧 🤲 💵'], ['Here is your bag.', '🧑‍💼 🛍️'], ['Thank you! Have a nice day!', '🧑‍💼 😊 🛍️'], ['You too! Bye!', '👧 👋']] },
  { id: 23, stage: 4, title: 'At the Doctor', cover: '🩺', pages: [
    ['Hello. How are you?', '👩‍⚕️ 👋'], ["I don't feel well.", '🧒 🤒'], ['What is wrong?', '👩‍⚕️ ❓'], ['I have a cold.', '🧒 🤧'], ['Do you have a fever?', '👩‍⚕️ 🌡️ ❓'], ['Yes, I do.', '🧒 🌡️'], ['Open your mouth, please.', '👩‍⚕️ 👄'], ['Say ah.', '🧒 😮'], ['Does it hurt?', '👩‍⚕️ ❓'], ['Yes, a little.', '🧒 😣'], ['Do you eat well?', '👩‍⚕️ 🍚 ❓'], ["No, I don't.", '🧒 🙅'], ['Take this medicine.', '👩‍⚕️ 💊'], ['Drink a lot of water.', '💧 💧'], ['Can I play soccer?', '🧒 ⚽ ❓'], ['Not today. Rest at home.', '👩‍⚕️ 🏠 🛌'], ['Okay. Thank you.', '🧒 🙏'], ['Feel better soon!', '👩‍⚕️ 💗'], ['Now I am fine!', '🧒 😄 ✨'], ["Let's play soccer!", '🧒 ⚽']] },
  { id: 24, stage: 4, title: 'Birthday Party', cover: '🎂', pages: [
    ['Today is my birthday!', '🎂 🎉'], ['How old are you?', '👧 ❓'], ['I am eight years old!', '🧒 8️⃣'], ['Happy birthday!', '👫 🎉'], ['Who is coming?', '❓ 👫'], ['My friends are coming.', '👫 👫'], ['What is in the box?', '🎁 ❓'], ['It is a present for you.', '🎁 👦'], ['Can I open it?', '🧒 🎁 ❓'], ['Yes, you can.', '👧 👍'], ['Wow, it is a robot!', '🤖 😲'], ['Do you like it?', '👧 ❓'], ['Yes, I love it!', '🧒 😍 🤖'], ['Thank you so much!', '🧒 🙏'], ['Where is the cake?', '🎂 ❓'], ['It is on the table.', '🎂 🍽️'], ['What color is it?', '🎂 🎨 ❓'], ['It is pink and white.', '🎂 💗 🤍'], ['Make a wish!', '🕯️ ✨'], ['Blow out the candles!', '🧒 💨 🕯️']] },
  { id: 5, stage: 5, title: 'The Rainy Day', cover: '🌧️', pages: [
    ['The sky is gray and dark.', '☁️ ☁️ ☁️'], ['The wind is cold.', '🌬️ 🥶'], ['I hear a loud sound. Boom!', '⛈️ ⚡ 👂'], ['My little dog is scared.', '🐶 😨'], ['Big drops fall on the roof.', '🏠 🌧️'], ['The window is wet.', '🪟 💧'], ['I want to go outside.', '🧒 🚪 🌧️'], ['I wear my yellow boots.', '🧒 🥾'], ['I wear my green raincoat.', '🧒 🧥'], ['I take my red umbrella.', '🧒 ☂️'], ['The puddles are deep and fun.', '💦 💧 😄'], ['I jump in a big puddle. Splash!', '🧒 💦 💦'], ['A little frog jumps, too!', '🐸 💦'], ['The frog is green and shiny.', '🐸 ✨'], ['My socks are wet and cold.', '🧦 💧 🥶'], ['I go back home.', '🧒 🏠'], ['Mom gives me warm milk.', '👩 🥛 🧒'], ['The milk is sweet and warm.', '🥛 😋'], ['Now the sun is out.', '☀️ 😎'], ['The sky is bright and blue!', '🌤️ 🌈'], ['I see a big rainbow.', '🌈 🧒'], ['What a wet and happy day!', '🧒 💦 😄']] },
  { id: 13, stage: 5, title: 'The Big Red Kite', cover: '🪁', pages: [
    ['I have a big red kite.', '🪁'], ['It has a long tail.', '🪁 🎀'], ['The tail is yellow and green.', '🎀 💛 💚'], ['The wind is strong today.', '🌬️ 🍃 🌳'], ['Dad and I go to the hill.', '👨 🧒 ⛰️'], ['The hill is high and green.', '⛰️ 🌿'], ['I hold the long string.', '🧒 🧵'], ['I run fast with my kite.', '🏃 💨 🪁'], ['Up, up, up it goes!', '🪁 ⬆️'], ['My kite flies high and far.', '🪁 ☁️'], ['It looks so small in the sky.', '☁️ 🪁 ☁️'], ['A bird flies next to it.', '🐦 🪁'], ['The bird is little and brown.', '🐦 🤎'], ['Oh no! The wind is too strong.', '🌬️ 🌬️ 😨'], ['My kite goes into a tall tree.', '🪁 🌳 😟'], ['Dad is very tall.', '👨 📏'], ['He gets my kite for me.', '👨 🙌 🪁'], ['The string is long and thin.', '🧵 🪁'], ['I fly my kite again.', '🧒 🪁 😊'], ['My kite comes down slowly.', '🪁 ⬇️ 🌿'], ['I am tired but happy.', '🧒 😪 😊'], ['What a happy, windy day!', '😄 🌬️ 🪁']] },
  { id: 25, stage: 5, title: 'The Little Seed', cover: '🌱', pages: [
    ['I have a little seed.', '🌰'], ['It is small and brown.', '🌰 🤎'], ['I put it in a pot.', '🪴 🌰'], ['The soil is soft and dark.', '🟫'], ['I give it some water.', '💧 🪴'], ['I put it by the sunny window.', '🪟 ☀️'], ['It is day one. There is nothing.', '🪴 🤔'], ['It is day two. There is still nothing.', '🪴 😕'], ['It is day three. Look!', '🪴 👀'], ['A tiny green sprout!', '🌱 ✨'], ['It is very small and thin.', '🌱'], ['I am so happy.', '🧒 😄 🌱'], ['It gets taller every day.', '🌱 ⬆️'], ['The leaves are big and green.', '🌿 💚'], ['One morning, I see a bud.', '🌿 🟢'], ['The bud opens slowly.', '🌷'], ['It is a beautiful flower!', '🌻'], ['The flower is tall and yellow.', '🌻 💛'], ['A bee comes to visit.', '🐝 🌻'], ['The bee is busy and fuzzy.', '🐝 ✨'], ['My flower is the best!', '🧒 🌻 💛'], ['Plants are amazing!', '🌱 🌿 🌻']] },
  { id: 26, stage: 5, title: 'The Snow Day', cover: '⛄', pages: [
    ['It is a cold winter morning.', '❄️ 🌅'], ['Everything is white.', '🏠 ❄️'], ['The snow is soft and deep.', '❄️ ❄️'], ['I put on my warm coat.', '🧒 🧥'], ['I wear a red hat and blue gloves.', '🧒 🧣 🧤'], ['My brother is ready, too.', '👦 🧥'], ['We run outside.', '🏃 🏃 ❄️'], ['The air is fresh and cold.', '🌬️ 🥶'], ['We make a big snowman.', '⛄'], ['He has a long orange nose.', '⛄ 🥕'], ['His eyes are black stones.', '⛄ ⚫ ⚫'], ['He looks funny and happy.', '⛄ 😄'], ['We make snowballs.', '⚪ ⚪'], ['My brother throws one at me!', '👦 ⚪ 💥'], ['We laugh and laugh.', '😂 😂'], ['My cheeks are red and cold.', '🧒 🥶'], ['We lie down in the snow.', '🧒 ❄️'], ['We make snow angels.', '👼 ❄️'], ['Mom calls us inside.', '👩 🏠'], ['The hot cocoa is sweet and warm.', '☕ 😋'], ['My toes are warm now.', '🦶 🔥'], ['I love snowy days!', '🧒 ❄️ 💙']] },
  { id: 6, stage: 6, title: 'Where Is Max?', cover: '🐶', pages: [
    ['Where is Max the dog?', '🐶 ❓'], ['It is time for dinner.', '🥣 🕕'], ['Is he under the bed? No!', '🛏️ ❌'], ['Is he in the kitchen? No!', '🍳 ❌'], ['Is he in the bathroom? No!', '🛁 ❌'], ['Is he in the garden? No!', '🌷 ❌'], ['Who can help me?', '🧒 🤔'], ['My sister can help me.', '👧 🙋‍♀️'], ['What does Max like?', '👧 🤔 🐶'], ['He likes his red ball.', '🐶 🔴'], ['Where is his ball?', '🔴 ❓'], ['It is not in his bed.', '🐾 🛏️ ❌'], ['We look behind the door. No!', '🚪 ❌'], ['We look in the car. No!', '🚗 ❌'], ['Then we hear a sound.', '👂 🎵'], ['What is that sound?', '🧒 👂 ❓'], ['It is coming from the living room.', '🛋️ 🔊'], ['Look! He is behind the sofa.', '🛋️ 🐶'], ['What is he doing?', '👀 🐶'], ['Max is sleeping. Shh!', '🐶 💤 🤫'], ['He is sleeping with his ball.', '🐶 💤 🔴'], ['We found you, Max!', '🧒 👧 🐶 💛']] },
  { id: 14, stage: 6, title: 'Busy Sunday', cover: '📅', pages: [
    ["When do we wake up? At eight o'clock!", '⏰ 8️⃣'], ['Who wakes up first? My dog!', '🐶 ⏰'], ['What do we eat? Pancakes!', '🥞 😋'], ['Who makes them? Dad does!', '👨‍🍳 🥞'], ['What do we drink? Orange juice!', '🧃 🍊'], ['Where do we go? To the park!', '🏞️ 🌳'], ['How do we go? By bike!', '🚲 🚲'], ['Who do we see? Our friends!', '👫 👋'], ['What do we play? Tag!', '🏃 🏃‍♀️ 💨'], ['Who is it? Mina is it!', '👧 🏃'], ['Where do we hide? Behind a tree!', '🌳 🫣'], ['When do we eat lunch? At noon!', '🕛 🍱'], ['What is in the box? Rice and eggs!', '🍱 🍚 🥚'], ['Where do we read? Under a tree!', '🌳 📖'], ['What do we read? A dinosaur book!', '📖 🦕'], ['What do we see? A squirrel!', '🐿️ 👀'], ['Where is it going? Up the tree!', '🐿️ ⬆️ 🌳'], ["When do we go home? At four o'clock!", '🏠 🕓'], ['What do we do at home? We take a bath!', '🛁 🫧'], ['How do we feel? Tired but happy!', '😪 😊'], ['Why are we happy? We are together!', '👨‍👩‍👧 💛'], ['Good night, Sunday!', '🌙 😴']] },
  { id: 27, stage: 6, title: 'The Missing Cake', cover: '🍰', pages: [
    ['Where is my cake?', '🎂 ❓'], ['It is not on the table.', '🍽️ ❌'], ['Who has my cake?', '🧒 🤔'], ['Is it Dad?', '👨 ❓'], ['No. Dad is reading a book.', '👨 📖'], ['Is it Mom?', '👩 ❓'], ['No. Mom is working.', '👩 💻'], ['Is it my sister?', '👧 ❓'], ['No. She is sleeping.', '👧 💤'], ['What is that on the floor?', '🟫 ❓'], ['It is a little crumb.', '🍰 👀'], ['Where does it go?', '👣 ❓'], ['Look! More crumbs!', '🍰 🍰'], ['They go to the garden.', '🌷 👣'], ['Who is in the garden?', '🌷 ❓'], ['It is my dog, Coco!', '🐶'], ['What is Coco doing?', '🐶 ❓'], ['Coco is eating my cake!', '🐶 🎂 😋'], ['Why, Coco, why?', '🧒 😫'], ['Coco looks so happy.', '🐶 😊'], ['How can I be mad?', '🧒 🤷'], ['We can share next time!', '🧒 🐶 💛']] },
  { id: 28, stage: 6, title: 'A Day at the Beach', cover: '🏖️', pages: [
    ['Where are we going today?', '🚗 ❓'], ['We are going to the beach!', '🏖️'], ['How do we get there?', '🚗 ❓'], ['We go by car.', '🚗 💨'], ['When do we get there?', '🕐 ❓'], ['At ten in the morning!', '🕙 ☀️'], ['What do we see?', '👀 ❓'], ['The big blue sea!', '🌊'], ['What is Dad doing?', '👨 ❓'], ['He is setting up the umbrella.', '👨 ⛱️'], ['What is Mom doing?', '👩 ❓'], ['She is reading a book.', '👩 📖'], ['What am I doing?', '🧒 ❓'], ['I am building a sandcastle.', '🧒 🏰'], ['Who is helping me?', '🤔'], ['My little brother is!', '👦 🪣'], ['What is that in the sand?', '🏖️ ❓'], ['It is a little crab!', '🦀'], ['Where is it going?', '🦀 ❓'], ['Into the water!', '🦀 🌊'], ['Why is the sky orange?', '🌅 ❓'], ['The sun is going down. Bye, beach!', '🌅 👋']] },
  { id: 7, stage: 7, title: 'My Weekend', cover: '🎡', pages: [
    ['On Saturday, I went to the zoo.', '🎟️ 🦁 🦓'], ['I went with my mom and dad.', '👨 👩 🧒'], ['We took the bus.', '🚌'], ['I saw a tall giraffe.', '🦒'], ['It ate green leaves.', '🦒 🍃'], ['I saw a big elephant.', '🐘'], ['It drank a lot of water.', '🐘 💧'], ['The monkeys jumped and played.', '🐒 🐒 🌴'], ['One monkey waved at me!', '🐒 👋 🧒'], ['I ate ice cream with my dad.', '👨 🧒 🍦'], ['It was cold and sweet.', '🍦 😋'], ['I bought a toy lion.', '🦁 🛍️'], ["We came home at five o'clock.", '🏠 🕔'], ['I was very tired.', '🧒 😪'], ['On Sunday, it rained all morning.', '🌧️ 🏠'], ['I read books with my mom.', '👩 🧒 📚'], ['We made cookies together.', '👩 🧒 🍪'], ['The cookies smelled so good.', '🍪 😋'], ['Then the rain stopped.', '🌧️ ➡️ 🌤️'], ['In the afternoon, I played with my friends.', '👫 ⚽'], ['We played soccer in the park.', '⚽ 🌳'], ['We laughed a lot.', '😂 😂'], ['At night, I wrote in my diary.', '🌙 📔 ✏️'], ['I had a great weekend!', '🌟 😄']] },
  { id: 15, stage: 7, title: 'The Lost Puppy', cover: '🐕', pages: [
    ['Yesterday, I walked to the park.', '🚶 🌳'], ['The sky was gray.', '☁️ ☁️'], ['I heard a small sound.', '👂 🔈'], ['It came from under a bench.', '🪑 👂'], ['I looked under the bench.', '🧒 👀 🪑'], ['I found a little puppy.', '🧒 🐶'], ['It was cold and hungry.', '🐶 🥶'], ['It had a blue collar.', '🐶 💙'], ['I took it home.', '🐶 🏠'], ['I gave it some milk.', '🐶 🥛'], ['It drank all the milk.', '🐶 🥛 😋'], ['Then it wagged its tail.', '🐶 💫'], ['Mom washed the puppy.', '👩 🛁 🐶'], ['It looked clean and happy.', '🐶 ✨ 😊'], ['Mom made a poster.', '👩 📝'], ['I drew a picture of the puppy.', '🧒 🖍️ 🐶'], ['We put the poster on a tree.', '📝 🌳'], ['We looked for its family.', '🔍 🐕'], ['The next day, the phone rang.', '📞 🔔'], ['A girl saw the poster.', '👧 👀 📝'], ['She came to our house.', '👧 🚶 🏠'], ['The girl was so happy.', '👧 😊 🐶'], ['She hugged her puppy.', '👧 🤗 🐶'], ['The puppy went home happily.', '👧 🐶 🏠']] },
  { id: 29, stage: 7, title: 'The Camping Trip', cover: '🏕️', pages: [
    ['Last summer, we went camping.', '🏕️'], ['We drove to the mountains.', '🚗 ⛰️'], ['The trip took three hours.', '🚗 🕒'], ['We found a nice spot by a lake.', '🏞️'], ['Dad and I set up the tent.', '👨 🧒 ⛺'], ['It was hard work.', '💪 😓'], ['Mom made a fire.', '👩 🔥'], ['We cooked hot dogs for dinner.', '🌭 🔥'], ['They tasted great!', '🌭 😋'], ['Then we toasted marshmallows.', '🍡 🔥'], ['It got dark.', '🌙'], ['We looked up at the sky.', '👀 🌌'], ['We saw so many stars!', '✨ ⭐ 🌟'], ['Dad told a funny story.', '👨 🗣️ 😂'], ['I heard an owl.', '🦉 👂'], ['Hoo, hoo!', '🦉 🌙'], ['I was a little scared.', '🧒 😨'], ['Mom held my hand.', '👩 🤝 🧒'], ['We slept in the tent.', '⛺ 😴'], ['In the morning, we swam in the lake.', '🏊 🏞️'], ['The water was very cold!', '💧 🥶'], ['We caught a fish.', '🎣 🐟'], ['We let it go.', '🐟 👋 🌊'], ['I want to go camping again!', '🧒 ⛺ 💛']] },
  { id: 30, stage: 7, title: 'A Visit to Grandma', cover: '👵', pages: [
    ['Last Sunday, I visited my grandma.', '👵 🏡'], ['She lives in the country.', '🏡 🌾'], ['We took a train there.', '🚆'], ['I looked out the window.', '🧒 🪟 🌄'], ['I saw cows and horses.', '🐄 🐴'], ['Grandma hugged me at the door.', '👵 🤗 🧒'], ['Her house smelled like bread.', '🏡 🍞'], ['She baked it that morning.', '👵 🍞 🔥'], ['We ate it with jam.', '🍞 🍓'], ['Then we went to her garden.', '👵 🧒 🌻'], ['It was big and full of colors.', '🌷 🌻 🌹'], ['Grandma grew tomatoes and carrots.', '🍅 🥕'], ['I picked some red tomatoes.', '🧒 🍅'], ['I watered the flowers.', '🧒 💧 🌷'], ['A butterfly landed on my hand.', '🦋 ✋'], ['I did not move.', '🧒 🤫'], ['It flew away after a minute.', '🦋 💨'], ['In the afternoon, Grandma read me a story.', '👵 📖 🧒'], ['I fell asleep on her sofa.', '🧒 😴 🛋️'], ['When I woke up, it was dinner time.', '🍲 🕕'], ['We ate soup with the vegetables.', '🍲 🥕'], ['At night, we took the train home.', '🚆 🌙'], ['I already missed Grandma.', '🧒 💭 👵'], ['I love my grandma so much.', '🧒 ❤️ 👵']] },
  { id: 8, stage: 8, title: 'When I Grow Up', cover: '🚀', pages: [
    ['What will you be?', '🧒 🤔 ✨'], ['I will be a pilot.', '🧑‍✈️'], ['I am going to fly a big plane.', '🧑‍✈️ ✈️'], ['I am going to fly around the world.', '✈️ 🌍'], ['I will visit many countries.', '🗼 🗽 🏯'], ['I will send you a postcard.', '💌 📮'], ['My sister will be a doctor.', '👩‍⚕️'], ['She is going to help sick people.', '👩‍⚕️ 🤒 🏥'], ['She will make them feel better.', '👩‍⚕️ 😊'], ['My friend will be a chef.', '👨‍🍳'], ['He is going to cook tasty food.', '👨‍🍳 🍝'], ['He will open a pizza shop.', '🍕 🏪'], ['My brother will be a firefighter.', '👨‍🚒'], ['He is going to keep people safe.', '👨‍🚒 🚒'], ['My cousin will be an artist.', '👩‍🎨'], ['She is going to paint big pictures.', '👩‍🎨 🖼️'], ['My teacher says we can dream big.', '👩‍🏫 ✨'], ['What about you?', '👉 🧒 ❓'], ['Will you be a singer?', '🎤 ❓'], ['Will you be a scientist?', '🧑‍🔬 ❓'], ['You can be anything!', '🧑‍🚀 👩‍🎨 👨‍🚒'], ['We will study hard.', '📚 ✏️'], ['We will never give up.', '💪 😊'], ['Our dreams will come true!', '✨ 🌈']] },
  { id: 16, stage: 8, title: 'Our Space Trip', cover: '🚀', pages: [
    ['Tomorrow, we will go to space.', '🚀'], ['We are going to visit the moon.', '🌕 🚀'], ['Tonight, we will pack our bags.', '🎒 🌙'], ['I will pack my teddy bear.', '🎒 🧸'], ['We are going to wear space suits.', '🧑‍🚀'], ['The suits will keep us safe.', '🧑‍🚀 🛡️'], ['Three, two, one, blast off!', '🚀 🔥'], ['The rocket will shake a lot.', '🚀 〰️'], ['We will fly past the clouds.', '🚀 ☁️'], ['We are going to see the stars.', '✨ ⭐ 🌟'], ['We will float in the rocket.', '🧑‍🚀 🫧'], ['I will drink juice from a bag.', '🧃 🧑‍🚀'], ['I will wave to the Earth.', '🧑‍🚀 👋 🌍'], ['The Earth will look like a blue ball.', '🌍 🔵'], ['We will land on the moon.', '🌕 🚀'], ['We are going to jump very high.', '🧑‍🚀 ⬆️ 🌕'], ['We will find moon rocks.', '🪨 🌕'], ['We will plant a little flag.', '🚩 🌕'], ['We will take pictures.', '🧑‍🚀 📷'], ['We are going to look for aliens.', '👽 🔭'], ['Maybe they will say hello!', '👽 👋'], ['Then we will fly home.', '🚀 🏠'], ['I will tell my friends about it.', '🧒 🗣️ 👫'], ['It will be the best trip ever!', '🌟 🧑‍🚀']] },
  { id: 31, stage: 8, title: 'Next Summer', cover: '🏝️', pages: [
    ['Next summer, we will go on a trip.', '🧳 ☀️'], ['We are going to visit Jeju Island.', '🏝️'], ['We will fly on a plane.', '✈️'], ['It will take one hour.', '✈️ 🕐'], ['We are going to stay in a hotel.', '🏨'], ['The hotel will have a big pool.', '🏨 🏊'], ['I will swim every day.', '🧒 🏊'], ['My dad is going to rent a car.', '👨 🚗'], ['We will drive by the sea.', '🚗 🌊'], ['We are going to climb a mountain.', '⛰️ 🥾'], ['It will be hard, but fun.', '💪 😄'], ['At the top, we will take a picture.', '📷 ⛰️'], ['We are going to eat oranges.', '🍊 🍊'], ['Jeju oranges will be very sweet.', '🍊 😋'], ['My sister is going to ride a horse.', '👧 🐴'], ['I will feed the horse a carrot.', '🧒 🥕 🐴'], ['We are going to see the sunrise.', '🌅'], ['We will wake up very early.', '⏰ 😪'], ['I will buy a gift for my friend.', '🎁 👫'], ['I am going to write in my diary.', '📔 ✏️'], ['We will make many memories.', '💭 📸'], ['I am so excited!', '🧒 🤩'], ['I will count the days.', '📅 🔢'], ['Summer, please come soon!', '☀️ 🙏']] },
  { id: 32, stage: 8, title: 'My Robot Friend', cover: '🤖', pages: [
    ['In the future, I will have a robot.', '🤖'], ['Its name will be Bolt.', '🤖 Bolt'], ['Bolt is going to help me every day.', '🤖 💪'], ['He will wake me up in the morning.', '🤖 ⏰'], ['He is going to make my breakfast.', '🤖 🍳'], ['He will cook eggs and toast.', '🍳 🍞'], ['Then he will walk my dog.', '🤖 🐶'], ['Bolt is going to help me with homework.', '🤖 📚'], ['He will not do it for me.', '🤖 🙅'], ['He will just give me hints.', '🤖 💡'], ['After school, we will play games.', '🤖 🎮 🧒'], ['Bolt will be very good at soccer.', '🤖 ⚽'], ['But I will win sometimes!', '🧒 🏆'], ['At night, he is going to read me a story.', '🤖 📖 🌙'], ['He will turn off the light.', '🤖 💡'], ['Will Bolt ever get tired?', '🤖 ❓'], ['No, but he will need to charge.', '🤖 🔋'], ['He will sleep in the corner.', '🤖 😴'], ['Maybe he will dream, too.', '🤖 💭 ✨'], ['Bolt and I will be best friends.', '🤖 🤝 🧒'], ['We will go on adventures.', '🗺️ 🚀'], ['Will you have a robot, too?', '👉 🤖 ❓'], ['What will your robot do?', '🤖 ❓'], ['The future will be amazing!', '🌟 🤖']] },
  { id: 33, stage: 1, title: 'ABC Kitchen', cover: '🍳', pages: [
    ['A is for apron.', '🧑‍🍳'], ['B is for bowl.', '🥣'], ['C is for cup.', '☕'], ['D is for dish.', '🍽️'], ['E is for eggplant.', '🍆'], ['F is for fork.', '🍴'], ['G is for glass.', '🥛'], ['H is for hot dog.', '🌭'], ['I is for ice.', '🧊'], ['J is for jam.', '🍓'], ['K is for kettle.', '🫖'], ['L is for lid.', '🍲'], ['M is for mug.', '🍵'], ['I help my mom.', '👩 🧒'], ['We make a cake.', '🎂'], ['Yum! Thank you, Mom!', '😋 💛']] },
  { id: 34, stage: 2, title: 'Mud Is Fun', cover: '🐷', pages: [
    ['A bug sits on a log.', '🐞 🪵'], ['The log is big.', '🪵'], ['A frog hops to the log.', '🐸 🪵'], ['The frog sits on the log.', '🐸 🪵'], ['A duck runs to the log.', '🦆 🪵'], ['The duck sits on the log.', '🦆 🪵'], ['A fat pig runs to the log.', '🐷 💨'], ['The pig wants to sit.', '🐷 🪵'], ['Can the pig fit?', '🐷 ❓'], ['The pig hops up!', '🐷 ⬆️'], ['The log tips.', '🪵 😮'], ['Splat!', '💦'], ['They sit in the mud.', '🐞 🐸 🦆 🐷'], ['The bug is wet.', '🐞 💧'], ['The pig has a big grin.', '🐷 😁'], ['Mud is fun!', '🎉']] },
  { id: 35, stage: 3, title: 'Kimbap Day', cover: '🍙', pages: [
    ['Today is a picnic day.', '🧺 ☀️'], ['Mom makes kimbap.', '👩 🍙'], ['I can help Mom.', '🧒 👩'], ['This is rice.', '🍚'], ['It is white and soft.', '🍚'], ['This is an egg.', '🍳'], ['It is yellow.', '💛'], ['This is a carrot.', '🥕'], ['It is long and orange.', '🥕'], ['I put the rice on the seaweed.', '🍚'], ['I put the egg on the rice.', '🍳 🍚'], ['Mom rolls it.', '👩 🍙'], ['Look! It is round.', '🍙'], ['Mom cuts it.', '🔪 🍙'], ['I have a big box.', '📦'], ['The kimbap is in the box.', '🍙 📦'], ['We go to the park.', '🏞️'], ['My brother eats a lot.', '👦 😋'], ['It is so good!', '😋'], ['I love kimbap!', '🍙 💛']] },
  { id: 36, stage: 3, title: 'My Little Sister', cover: '👧', pages: [
    ['This is my little sister.', '👧'], ['She is three years old.', '3️⃣'], ['She is small and cute.', '👧 💕'], ['She has short hair.', '👧'], ['She likes my toys.', '🧸'], ['She likes my books, too.', '📚'], ['She can run.', '🏃'], ['She can jump.', '🤸'], ['She cannot read.', '📖 ❌'], ['I read a book to her.', '📖 🧒 👧'], ['She laughs.', '😂'], ['She draws on my book!', '🖍️ 📖'], ['I am a little angry.', '😠'], ['She looks at me.', '👧 👀'], ['She gives me a hug.', '🤗'], ['She is so funny.', '😄'], ['We play together.', '🧸 🧒 👧'], ['We sleep in one room.', '🛏️ 😴'], ['She is my best friend.', '👧 💛'], ['I love my little sister.', '💕']] },
  { id: 37, stage: 4, title: 'Happy New Year', cover: '🎎', pages: [
    ['Good morning! What day is it?', '🌅 ❓'], ["It is New Year's Day!", '🎉'], ['What do we wear?', '👘 ❓'], ['We wear hanbok.', '👘'], ['What color is your hanbok?', '🎨 ❓'], ['It is pink and blue.', '🩷 💙'], ['Where do we go?', '🗺️ ❓'], ["We go to Grandma's house.", '🏠 👵'], ['Hello, Grandma! Happy New Year!', '👵 🎉'], ['Thank you. Come in, please!', '👵 🚪'], ['What is that?', '🍲 ❓'], ['It is rice cake soup.', '🍲'], ['Is it hot?', '🥵 ❓'], ['Yes, it is very hot.', '🍲 🔥'], ['Do you like it?', '😋 ❓'], ['Yes, I do. It is so good!', '😋'], ["Let's play a game!", '🎲'], ['Who is first?', '🥇 ❓'], ['I am first! I win!', '🥇 🎉'], ['Happy New Year, everyone!', '🎉 💛']] },
  { id: 38, stage: 4, title: 'At the Library', cover: '📚', pages: [
    ['Hi, Sam. Where are you going?', '👧 👦'], ['I am going to the library.', '📚'], ['Can I come, too?', '🙋'], ["Sure! Let's go.", '👍'], ['Wow, so many books!', '📚 😮'], ['Shh. Be quiet, please.', '🤫'], ['Oh, sorry.', '😅'], ['What book do you want?', '📖 ❓'], ['I want a book about dogs.', '📖 🐶'], ['Where are the dog books?', '🐶 📚 ❓'], ['They are over there.', '👉 📚'], ['Can you see them?', '👀 ❓'], ['No, I can\'t. They are too high.', '📚 ⬆️'], ['I can help you.', '🤝'], ['Here you are.', '📖'], ['Thank you very much.', '😊'], ['You are welcome.', '😊'], ['What is your book about?', '📖 ❓'], ['It is about a big whale.', '🐳'], ["Let's read together!", '📖 👧 👦']] },
  { id: 39, stage: 5, title: 'The Little Red Leaf', cover: '🍁', pages: [
    ['A little red leaf is on a tall tree.', '🍁 🌳'], ['It is a windy autumn day.', '🌬️'], ['The wind is cold and strong.', '🌬️ 🥶'], ['The leaf shakes and shakes.', '🍁'], ['Oh no! It falls slowly.', '🍁 ⬇️'], ['It flies over a green hill.', '🍁 ⛰️'], ['It flies over a blue lake.', '🍁 💧'], ['A small bird sees it.', '🐦 🍁'], ['The bird is soft and brown.', '🐦'], ['The leaf goes down, down, down.', '🍁 ⬇️'], ['It lands in a puddle.', '🍁 💧'], ['The water is cold and shiny.', '💧 ✨'], ['A girl in yellow boots comes.', '👧 🥾'], ['Her boots are wet and dirty.', '🥾 💧'], ['She sees the little leaf.', '👧 👀 🍁'], ['It is so pretty and red!', '🍁 😍'], ['She picks it up gently.', '🤲 🍁'], ['She puts it in her big book.', '📖 🍁'], ['The book is warm and dry.', '📖'], ['Now the leaf is flat and thin.', '🍁'], ['It is safe and happy.', '🍁 💛'], ['It is the best leaf!', '🍁 🌟']] },
  { id: 40, stage: 5, title: 'The Round Moon', cover: '🌕', pages: [
    ['It is a bright autumn night.', '🌙'], ["My family is at Grandma's house.", '🏠 👨‍👩‍👧'], ['The house is warm and noisy.', '🏠'], ['Grandma makes rice cakes.', '👵 🍡'], ['The rice cakes are small and soft.', '🍡'], ['They are white, pink, and green.', '🍡'], ['I make one, too.', '🧒 🍡'], ['My rice cake is big and funny.', '🍡 😄'], ['Everyone laughs.', '😂'], ['We eat fresh apples.', '🍎'], ['The apples are sweet and cold.', '🍎'], ['Then we go outside.', '🚪 🌙'], ['The air is cool and fresh.', '🍃'], ['Look up! The moon is so big!', '🌕 😮'], ['It is round and yellow.', '🌕'], ['It is brighter than a lamp.', '🌕 💡'], ['I close my eyes.', '😌'], ['I make a quiet wish.', '✨'], ['Grandma holds my hand.', '👵 🤝'], ['Her hand is warm and soft.', '🤲'], ['The moon is beautiful tonight.', '🌕 ✨'], ['I love this night!', '💛']] },
  { id: 41, stage: 6, title: 'The Sound at Night', cover: '🔦', pages: [
    ['What is that sound?', '👂 ❓'], ['It is very late.', '🌙'], ['Who is outside?', '🚪 ❓'], ['I look out the window.', '🪟 👀'], ['I can\'t see anything.', '🌑'], ['Where is my flashlight?', '🔦 ❓'], ['It is under my bed.', '🔦 🛏️'], ['Dad, are you awake?', '👨 😴'], ['Why are you up?', '👨 ❓'], ['I hear a sound.', '👂'], ['What kind of sound?', '👂 ❓'], ['Scratch, scratch, scratch!', '🐾'], ['Where is it?', '❓'], ['It is by the door.', '🚪'], ['Who can it be?', '❓'], ['Dad opens the door.', '👨 🚪'], ['What is in that box?', '📦 ❓'], ['Look! It is a little kitten!', '🐈 😮'], ['Why is it crying?', '😿 ❓'], ['It is cold and hungry.', '🥶 😿'], ['What can we give it?', '🥛 ❓'], ['Some warm milk! Can we keep it?', '🥛 🐈']] },
  { id: 42, stage: 6, title: 'Hide and Seek', cover: '🙈', pages: [
    ["Let's play hide and seek!", '🙈'], ['Who counts first?', '🔢 ❓'], ['I count first.', '🧒 🔢'], ['One, two, three, four, five!', '🖐️'], ['Where are you?', '👀 ❓'], ['Is Mina under the table?', '👧 ❓'], ['No, she is not.', '❌'], ['Is Tom behind the sofa?', '👦 🛋️ ❓'], ['No, he is not.', '❌'], ['Where can they be?', '❓'], ['What is that sound?', '👂 ❓'], ['Someone is laughing.', '😂'], ['Where is it coming from?', '👂 ❓'], ['It is coming from the closet.', '🚪'], ['Who is in the closet?', '🚪 ❓'], ['It is Mina!', '👧 🎉'], ['Now where is Tom?', '👦 ❓'], ['Why is the curtain moving?', '🪟 ❓'], ['I see two feet!', '🦶 🦶'], ['It is Tom!', '👦 🎉'], ['Who counts now?', '🔢 ❓'], ['Tom, it is your turn!', '👦 👉']] },
  { id: 43, stage: 7, title: 'My Loose Tooth', cover: '🦷', pages: [
    ['Last Monday, my tooth felt funny.', '🦷'], ['It moved when I touched it.', '🦷 👆'], ['I showed it to my mom.', '👩 🦷'], ['She looked at it and smiled.', '👩 😊'], ['She said it was a loose tooth.', '👩 🦷'], ['At school, I ate a big apple.', '🍎'], ['The apple was very hard.', '🍎'], ['Then I felt something strange.', '😮'], ['My tooth came out!', '🦷 🎉'], ['It did not hurt.', '😊'], ['I was very surprised.', '😲'], ['My teacher gave me a small box.', '📦'], ['I put my tooth in the box.', '🦷 📦'], ['I showed it to my friends.', '🧒 🧒'], ['They looked at my new smile.', '😁'], ['After school, I ran home.', '🏃 🏠'], ['Dad laughed and took a picture.', '👨 📷'], ['Grandpa told me an old story.', '👴 📖'], ['Long ago, kids threw teeth on the roof.', '🦷 🏠'], ['A bird brought them new teeth.', '🐦 🦷'], ['I threw my tooth on the roof.', '🦷 ⬆️'], ['I made a wish.', '✨'], ['A week later, I saw something white.', '😮'], ['My new tooth was there!', '🦷 🎉']] },
  { id: 44, stage: 8, title: 'Our Class Trip', cover: '🦕', pages: [
    ['Next Friday, my class will go on a trip.', '🚌'], ['We are going to visit a museum.', '🏛️'], ['We will ride a big yellow bus.', '🚌 💛'], ['I am going to sit next to Jisu.', '🧒 👧'], ['We will sing songs on the bus.', '🎵 🚌'], ['At the museum, we will see dinosaur bones.', '🦕 🦴'], ['They will be very big.', '🦕 😮'], ['We are going to watch a movie about space.', '🎬 🚀'], ['I will touch a rock from the moon.', '🪨 🌙'], ['My teacher will take many pictures.', '👩‍🏫 📷'], ['We are going to eat lunch in the park.', '🏞️ 🍱'], ['My mom will make kimbap for me.', '👩 🍙'], ['I will share it with my friends.', '🍙 🧒'], ['After lunch, we will play a game.', '🎲'], ['Our team is going to win!', '🏆'], ['We will buy small gifts at the shop.', '🎁 🏪'], ['I am going to buy a robot for my brother.', '🤖 👦'], ['He will be so happy.', '👦 😄'], ["We will come back at four o'clock.", '🕓 🚌'], ['I will be tired, but happy.', '😪 😊'], ['I am going to tell my family everything.', '🧒 👨‍👩‍👧'], ['I will draw a picture of the bones.', '✏️ 🦴'], ['I will put it on my wall.', '🖼️'], ['I can\'t wait for Friday!', '🎉']] },
  { id: 45, stage: 1, title: 'By the Sea', cover: '🐚', pages: [
    ['N is for net.', '🥅'], ['O is for octopus.', '🐙'], ['P is for penguin.', '🐧'], ['Q is for quilt.', '🛏️'], ['R is for rock.', '🪨'], ['S is for shell.', '🐚'], ['T is for turtle.', '🐢'], ['U is for ukulele.', '🪕'], ['V is for van.', '🚐'], ['W is for wave.', '🌊'], ['Box ends with X.', '📦'], ['Y is for yacht.', '⛵'], ['Z is for zigzag.', '⚡'], ['We go to the sea.', '🌊'], ['I find a big shell.', '🧒 🐚'], ['I love the sea!', '💙']] },
  { id: 46, stage: 2, title: 'Tim and the Jam', cover: '🍓', pages: [
    ['Tim has a big bun.', '🧒 🍞'], ['Tim has red jam.', '🍓'], ['He puts the jam on the bun.', '🍓 🍞'], ['Tim sits on the rug.', '🧒'], ['A dog runs to Tim.', '🐶 💨'], ['The dog is wet.', '🐶 💧'], ['The dog wags and wags.', '🐶'], ['The dog wants the bun.', '🐶 🍞'], ['Tim gets up and runs.', '🧒 💨'], ['The dog runs, too.', '🐶 💨'], ['Tim trips on the rug.', '🧒 😮'], ['The bun hops up!', '🍞 ⬆️'], ['It lands on the dog.', '🍞 🐶'], ['The dog has jam on his back.', '🐶 🍓'], ['Tim has a big grin.', '😁'], ['Tim hugs the wet dog.', '🧒 🐶']] },
  { id: 47, stage: 3, title: 'My Hamster', cover: '🐹', pages: [
    ['This is my hamster.', '🐹'], ['His name is Peanut.', '🐹'], ['He is small and brown.', '🐹'], ['He has two small ears.', '🐹'], ['His eyes are black.', '🐹'], ['This is his cage.', '🐹'], ['It is big.', '😮'], ['This is his wheel.', '🎡'], ['He can run on the wheel.', '🐹 💨'], ['He runs and runs.', '🐹 💨'], ['Now he is hungry.', '🐹'], ['He likes seeds.', '🌻'], ['He puts the seeds in his cheeks.', '🐹'], ['Look! His cheeks are big.', '🐹 😮'], ['He is so funny.', '😄'], ['I can hold him.', '🧒 🐹'], ['He is soft and warm.', '🐹 💛'], ['Now he is sleepy.', '🐹 😴'], ['He sleeps in his little house.', '🏠 😴'], ['Good night, Peanut!', '🌙']] },
  { id: 48, stage: 3, title: 'Clean Up!', cover: '🧹', pages: [
    ['My room is messy.', '🧒 😅'], ['My toys are on the floor.', '🧸'], ['My books are on the bed.', '📚 🛏️'], ['My socks are under the desk.', '🧦'], ['Mom is not happy.', '👩'], ['Mom says, clean your room.', '👩 🗣️'], ['Okay, Mom.', '🧒'], ['I pick up my toys.', '🧸'], ['I put them in the box.', '📦'], ['I put my books on the shelf.', '📚'], ['I find my red sock.', '🧦'], ['I find my blue sock.', '🧦'], ['Oh! They are not the same.', '😮'], ['I find my toy car, too.', '🚗'], ['It is under the bed.', '🛏️'], ['I am so happy.', '😄'], ['Now my room is clean.', '✨'], ['Mom is happy, too.', '👩 😊'], ['She gives me a hug.', '👩 🧒'], ['I like my clean room!', '💛']] },
  { id: 49, stage: 4, title: "Let's Play Soccer", cover: '⚽', pages: [
    ['Hi, Amy. What are you doing?', '👦 👧'], ['I am looking for my ball.', '👧 👀'], ['Is this your ball?', '👦 ⚽'], ['Yes, it is! Thank you.', '👧 😊'], ['Do you like soccer?', '⚽ ❓'], ['Yes, I do. I love soccer!', '👧 💛'], ['Do you want to play?', '⚽ ❓'], ['Sure! Where can we play?', '👦 ❓'], ["Let's go to the park.", '🏞️'], ['What time is it?', '🕒 ❓'], ["It is three o'clock. We have time.", '🕒'], ['Who has the ball?', '⚽ ❓'], ['I have it. Kick it to me!', '👧 ⚽'], ['Here it comes!', '⚽ 💨'], ['Goal! You are so good!', '🥅 🎉'], ['Thank you. You are good, too.', '👧 👦'], ['Are you tired?', '😓 ❓'], ['Yes, I am. I am thirsty, too.', '😓 💧'], ['Here is some water.', '💧'], ['Thank you. See you tomorrow!', '👋']] },
  { id: 50, stage: 4, title: 'At the Bakery', cover: '🥐', pages: [
    ['Good morning! May I help you?', '👨‍🍳'], ['Hello. I want some bread.', '👧 🍞'], ['What kind of bread do you like?', '🍞 ❓'], ['I like soft bread.', '🍞'], ['How about this one?', '👨‍🍳 🍞'], ['It looks good. How much is it?', '🍞 ❓'], ['It is two dollars.', '💵'], ['Do you have cookies?', '🍪 ❓'], ['Yes, we do. They are over there.', '👨‍🍳 👉'], ['Are they sweet?', '🍪 ❓'], ['Yes, they are very sweet.', '🍪 😋'], ['Can I try one?', '🍪 ❓'], ['Sure. Here you are.', '👨‍🍳 🍪'], ['Mmm! It is so good.', '👧 😋'], ['I want four cookies, please.', '🍪'], ['Is this for you?', '🍪 ❓'], ['No, it is for my mom.', '👩'], ['Today is her birthday.', '🎂'], ['Oh, happy birthday to your mom!', '🎉'], ['Thank you. Have a good day!', '👋']] },
  { id: 51, stage: 5, title: 'The Slow Snail', cover: '🐌', pages: [
    ['A little snail lives in a green garden.', '🐌 🌿'], ['He has a round brown shell.', '🐌'], ['His body is soft and wet.', '🐌 💧'], ['He moves very slowly.', '🐌'], ['He sees a big red flower.', '🐌 🌺'], ['It is tall and very pretty.', '🌺'], ['It is far away.', '🌺 👀'], ['A fast rabbit runs by.', '🐰 💨'], ['Her legs are long and strong.', '🐰'], ['You are so slow, little snail!', '🐰 🐌'], ['But the snail does not stop.', '🐌'], ['The hot sun is high and bright.', '☀️'], ['The grass is dry and long.', '🌾'], ['He is tired, but he goes on.', '🐌 😓'], ['The sky gets dark and gray.', '☁️'], ['Now the rain is cold and heavy.', '🌧️'], ['The snail loves the rain.', '🐌 💧'], ['The wet ground is soft and smooth.', '💧'], ['He goes a little faster.', '🐌 💨'], ['At last, he is at the tall flower.', '🐌 🌺'], ['Its petals are soft and sweet.', '🌺'], ['Slow is okay. He is so happy!', '🐌 💛']] },
  { id: 52, stage: 5, title: 'The Big Blue Whale', cover: '🐳', pages: [
    ['The sea is deep and blue.', '🌊'], ['A big blue whale swims slowly.', '🐳'], ['Her tail is wide and strong.', '🐳'], ['Her mouth is very big.', '🐳'], ['A tiny orange fish swims by.', '🐠'], ['It is small and shiny.', '🐠 ✨'], ['The little fish is all alone.', '🐠'], ['It looks sad and scared.', '🐠 😢'], ['The whale has kind eyes.', '🐳 💛'], ['Are you lost, little fish?', '🐳 🐠'], ['Yes, my family is far away.', '🐠 😢'], ['Come with me, little fish.', '🐳 🐠'], ['They swim over tall green plants.', '🐳 🌿'], ['They swim past a dark cave.', '🐳 🕳️'], ['A long gray shark is near the cave.', '🦈'], ['The shark has sharp white teeth.', '🦈'], ['The whale is bigger and stronger.', '🐳 💪'], ['The shark swims away quickly.', '🦈 💨'], ['Now the water is warm and bright.', '✨'], ['Look! Many orange fish are here.', '🐠 🐠 🐠'], ['The little fish is so happy.', '🐠 💛'], ['The big whale is happy, too.', '🐳 😊']] },
  { id: 53, stage: 6, title: 'Who Has My Hat?', cover: '🧢', pages: [
    ['Where is my hat?', '🧢 ❓'], ['It is not on my head.', '🧒'], ['It is my favorite blue hat.', '🧢 💙'], ['Who has my hat?', '🧢 ❓'], ['Is it in the kitchen?', '🍳 ❓'], ['Mom, do you have my hat?', '👩 ❓'], ["No, I don't. Why do you need it?", '👩'], ['It is very sunny today.', '☀️'], ['Is it in the yard?', '🌳 ❓'], ['Dad, do you have my hat?', '👨 ❓'], ["No, I don't. Where are you going?", '👨'], ["I am going to the park at ten o'clock.", '🏞️ 🕙'], ['Who is in the yard?', '👀 ❓'], ['It is my dog, Toto.', '🐶'], ['What is in his little house?', '🏠 ❓'], ['Look! Something blue is in there.', '💙 👀'], ['Why is it in his house?', '❓'], ['Toto is sleeping on my hat!', '🐶 😴 🧢'], ['How can I get it?', '🤔'], ['Here is a bone, Toto!', '🦴 🐶'], ['Now I have my hat.', '🧢 😄'], ["Let's go to the park, Toto!", '🏞️ 🐶']] },
  { id: 54, stage: 6, title: 'The Treasure Map', cover: '🗺️', pages: [
    ['What is this old paper?', '📜 ❓'], ["It is in Grandpa's book.", '📖'], ['Look! It is a map.', '🗺️'], ['Whose map is it?', '🗺️ ❓'], ['It is a treasure map!', '🗺️ ✨'], ['Where does it start?', '🗺️ ❓'], ['It starts at the big tree.', '🌳'], ['Who can come with me?', '❓'], ['My brother can come.', '👦'], ['When can we go?', '🕐 ❓'], ['We can go after lunch.', '🍱'], ['Where is the big tree?', '🌳 ❓'], ['It is by the old bridge.', '🌉'], ['Now where do we go?', '🗺️ ❓'], ['We walk ten steps to the rock.', '👣 🪨'], ['What is under the rock?', '🪨 ❓'], ['It is a small wooden box.', '📦'], ['How can we open it?', '📦 ❓'], ['Why is Grandpa laughing?', '👴 😄'], ['He has the key!', '👴 🔑'], ['What is in the box?', '📦 ❓'], ['It is full of cookies!', '🍪 🎉']] },
  { id: 55, stage: 7, title: 'My First Bike', cover: '🚲', pages: [
    ['Last spring, I got a new bike.', '🚲'], ['It was red and shiny.', '🚲 ✨'], ['Dad took me to the park.', '👨 🏞️'], ['I sat on the bike.', '🧒 🚲'], ['My legs shook a little.', '😬'], ['Dad held the seat.', '👨 🚲'], ['I pushed the pedals.', '🧒 🚲'], ['The bike moved slowly.', '🚲'], ['Then I fell on the grass.', '😮'], ['My knee hurt a lot.', '🤕'], ['I cried for a minute.', '😢'], ['Dad gave me a big hug.', '👨 🧒'], ['I tried again.', '💪'], ['I fell again, too!', '😅'], ['I was very tired.', '😓'], ['We drank some cold water.', '💧'], ['Then Dad said, try one more time.', '👨 🗣️'], ['I looked straight ahead.', '👀'], ['I pushed hard and went fast.', '🚲 💨'], ['Dad let go of the seat.', '👨 🚲'], ['I did not know!', '😮'], ['I rode all the way to the big tree.', '🚲 🌳'], ['Dad ran to me and cheered.', '👨 🎉'], ['That night, I dreamed about my bike.', '🌙 🚲']] },
  { id: 56, stage: 8, title: 'Sports Day', cover: '🏃', pages: [
    ['Next Tuesday is sports day at my school.', '🏫 🏃'], ['All the students will play on the field.', '🧒 🧒'], ['I am going to wear a blue shirt.', '👕 💙'], ['My team will be the blue team.', '💙'], ['My friend Yuna is going to be on my team.', '👧 👧'], ['My mom and dad will come to watch.', '👩 👨'], ['First, we are going to run a race.', '🏃'], ['I will run as fast as I can.', '🏃 💨'], ['Maybe I will get a medal.', '🏅'], ['Then we will play tug of war.', '🪢'], ['We are going to pull the long rope.', '🪢 💪'], ['The red team will be very strong.', '❤️ 💪'], ['But we will not give up.', '💙 💪'], ['We are going to eat lunch together.', '🍱'], ['Mom will bring sandwiches and fruit.', '🥪 🍎'], ['In the afternoon, we will throw small bags.', '🎯'], ['We are going to hit a big ball up high.', '🎯 ⬆️'], ['It will open and candy will fall out.', '🍬 🎉'], ['Everyone will cheer very loudly.', '📣 🎉'], ['After that, the teacher will count the points.', '👩‍🏫 🔢'], ['Which team will win?', '🏆 ❓'], ["I don't know, but it will be fun.", '😄'], ['I am going to sleep early tonight.', '😴 🌙'], ["I can't wait for Tuesday!", '🎉']] },
  { id: 57, stage: 1, plus: true, title: 'ABC School', cover: '🎒', pages: [
    ['A is for art.', '🎨'], ['B is for bag.', '🎒'], ['C is for crayon.', '🖍️'], ['D is for desk.', '🪑'], ['E is for eraser.', '🧽'], ['F is for friend.', '🧒 🧒'], ['G is for glue.', '🧴'], ['H is for hopscotch.', '🦘'], ['I is for ink.', '🖋️'], ['J is for jacket.', '🧥'], ['K is for keyboard.', '⌨️'], ['L is for lunch.', '🍱'], ['M is for map.', '🗺️'], ['I go to school.', '🏫'], ['I sit with my friend.', '🧒 🧒'], ['I love my school!', '🏫 💛']] },
  { id: 58, stage: 2, plus: true, title: 'Dan and the Van', cover: '🚐', pages: [
    ['Dan has a red van.', '🚐'], ['The van is big.', '🚐'], ['Dan puts a big pot in the van.', '🍲'], ['Dan puts a mat in the van.', '🟫'], ['A cat hops in the van.', '🐱'], ['The cat sits on the mat.', '🐱'], ['Dan gets in the van.', '🧑'], ['The van can go fast.', '🚐 💨'], ['Bump! The van hits a bump.', '💥'], ['The pot tips.', '🍲'], ['The lid falls off.', '🍲'], ['Ten hot buns are in the pot!', '🍞 🔥'], ['The cat sniffs the buns.', '🐱 👃'], ['Dan stops the van.', '🛑'], ['Dan and the cat sit in the sun.', '☀️'], ['Yum! Dan and the cat have a bun.', '🍞 😋']] },
  { id: 59, stage: 3, plus: true, title: 'Good Night', cover: '🌙', pages: [
    ['It is night.', '🌙'], ['The sky is dark.', '🌌'], ['It is time for bed.', '🛏️'], ['First, I take a bath.', '🛁'],
    ['The water is warm.', '🛁'], ['I have a little boat.', '⛵'], ['Now I am clean.', '✨'], ['My towel is soft and blue.', '🧺'],
    ['I put on my pajamas.', '👕'], ['My pajamas have stars.', '⭐'], ['I brush my teeth.', '🪥'], ['I brush up and down.', '🪥'],
    ['Mom reads me a book.', '📖'], ['The book is about a little owl.', '🦉'], ['I hug my toy rabbit.', '🐰'], ['Mom turns off the light.', '💡'],
    ['Good night, Mom!', '👩 💛'], ['Good night, moon!', '🌕'], ['I close my eyes.', '😌'], ['Sweet dreams!', '💤']] },
  { id: 60, stage: 4, plus: true, title: "Let's Make Pizza", cover: '🍕', pages: [
    ['Dad, what are you doing?', '👨 ❓'], ['I am making pizza. Can you help me?', '🍕'], ['Yes! What can I do?', '🙋'], ['Please wash your hands first.', '🧼'], ['Okay. My hands are clean.', '👐'], ['Do you like cheese?', '🧀 ❓'], ['Yes, I do. I love cheese!', '🧀 😋'], ['Put the red sauce on the pizza.', '🍅'], ['Is this okay?', '❓'], ['Yes, good job!', '👍'], ['What do you want on top?', '🍕 ❓'], ['I want mushrooms and corn.', '🍄 🌽'], ['How many mushrooms?', '🍄 ❓'], ['Five mushrooms, please.', '🍄'], ['Now it goes in the oven.', '🔥'], ['When is it ready?', '⏰ ❓'], ['It is ready in ten minutes.', '⏰'], ['Mmm, it smells so good!', '😋'], ['Here is a piece for you.', '🍕'], ['Thank you, Dad. It is yummy!', '😋 💛']] },
  { id: 61, stage: 5, plus: true, title: 'The Little Cloud', cover: '☁️', pages: [
    ['A little white cloud lives in the sky.', '☁️'], ['She is soft and fluffy.', '☁️'], ['The sky is big and blue.', '🌤️'], ['Below her, there is a dry farm.', '🌾'], ['The ground is hard and brown.', '🟫'], ['The flowers are thirsty and sad.', '🥀'], ['The farmer looks up at the sky.', '👨‍🌾'], ['I want to help, says the little cloud.', '☁️'], ['But she is too small.', '☁️'], ['A cool wind blows.', '🌬️'], ['More clouds come to her.', '☁️ ☁️'], ['Now she is big and gray.', '🌥️'], ['She feels heavy and full.', '🌧️'], ['Drip, drop! The rain falls.', '🌧️'], ['The rain is cool and gentle.', '💧'], ['The dry ground drinks the water.', '💧'], ['The flowers stand up tall.', '🌷'], ['The farmer is very happy.', '👨‍🌾 😄'], ['Then the warm sun comes out.', '☀️'], ['Look! A beautiful rainbow!', '🌈'], ['The little cloud is white and light again.', '☁️'], ['She is small, but she can help.', '☁️ 💛']] },
  { id: 62, stage: 5, plus: true, title: 'The Red Mitten', cover: '🧤', pages: [
    ['It is a cold winter day.', '❄️'], ['The snow is white and deep.', '❄️'], ['A boy walks in the quiet forest.', '🧒 🌲'], ['He drops one red mitten.', '🧤'], ['The mitten is soft and warm.', '🧤'], ['A tiny mouse finds the mitten.', '🐭'], ['She is cold, so she goes inside.', '🐭 🧤'], ['Then a little frog comes.', '🐸'], ['Can I come in, too?', '🐸 ❓'], ['Yes, come in! says the mouse.', '🐭'], ['Then a fluffy rabbit comes.', '🐰'], ['The mitten is full, but she squeezes in.', '🐰 🧤'], ['Then a big brown bear comes.', '🐻'], ['Oh no! The bear is too big!', '🐻 😮'], ['He pushes in slowly.', '🐻 🧤'], ['The mitten is very tight now.', '🧤'], ['Then a small black ant comes.', '🐜'], ['The ant climbs in, too.', '🐜'], ['Pop! The mitten opens wide.', '💥'], ['All the animals tumble out into the snow.', '🐭 🐸 🐰 🐻'], ['The boy comes back and finds his mitten.', '🧒 🧤'], ['Why is it so big now?', '🧤 ❓']] },
  { id: 63, stage: 6, plus: true, title: "Grandpa's Farm", cover: '🚜', pages: [
    ['Where are we going today?', '🚗 ❓'], ["We are going to Grandpa's farm.", '🚜'], ['Who is waiting for us?', '❓'], ['It is Grandpa!', '👴'], ['What is that big red thing?', '❓'], ['It is his tractor.', '🚜'], ['Who lives in the barn?', '🏠 ❓'], ['The cows live in the barn.', '🐄'], ['What does the cow give us?', '🐄 ❓'], ['She gives us milk.', '🥛'], ['Where are the hens?', '🐔 ❓'], ['They are in the hen house.', '🐔'], ['How many eggs are there?', '🥚 ❓'], ['There are six eggs.', '🥚'], ['Why is the pig so dirty?', '🐷 ❓'], ['He likes to play in the mud.', '🐷'], ['What is Grandpa picking?', '❓'], ['He is picking red tomatoes.', '🍅'], ['When can we eat them?', '🍅 ❓'], ['We can eat them at dinner.', '🍽️'], ['When can we come back?', '❓'], ['We can come back next summer!', '☀️ 💛']] },
  { id: 64, stage: 6, plus: true, title: 'Who Is at the Door?', cover: '🚪', pages: [
    ['Knock, knock! Who is at the door?', '🚪 ❓'], ['It is my friend Ben.', '👦'], ['What is in his hands?', '❓'], ['It is a big blue box.', '🎁'], ['Why does he have a box?', '❓'], ['He smiles, but he does not tell me.', '👦 😊'], ['Knock, knock! Who is it now?', '🚪 ❓'], ['It is my friend Sora.', '👧'], ['What does she have?', '❓'], ['She has some yellow balloons.', '🎈'], ['Where is my mom?', '👩 ❓'], ['She is in the kitchen.', '🍳'], ['What is she making?', '❓'], ['She is making a big chocolate cake.', '🎂'], ['Knock, knock! Who is here?', '🚪 ❓'], ['It is Grandma!', '👵'], ['What is she holding?', '💐 ❓'], ['She is holding pink flowers.', '💐'], ['Why is everyone here?', '❓'], ['Surprise! Happy birthday!', '🎉'], ['How old am I today?', '🎂 ❓'], ['I am eight years old today!', '🎂 8️⃣']] },
  { id: 65, stage: 7, plus: true, title: 'The Rainy Picnic', cover: '☔', pages: [
    ['Last Saturday, we went on a picnic.', '🧺'], ['Mom made sandwiches.', '🥪'], ['Dad packed some juice and fruit.', '🧃 🍎'], ['I carried the big blanket.', '🧺'], ['We drove to the lake.', '🚗'], ['The sky was blue and sunny.', '☀️'], ['We put the blanket on the grass.', '🧺'], ['I opened my sandwich.', '🥪'], ['Then a gray cloud came.', '☁️'], ['The wind blew hard.', '🌬️'], ['Suddenly, it started to rain.', '🌧️'], ['We grabbed our food.', '🥪'], ['We ran to the car.', '🏃'], ['We were all wet!', '💧'], ['I was sad.', '😢'], ['Then Dad had an idea.', '💡'], ['We drove back home.', '🚗 🏠'], ['We put the blanket on the floor.', '🧺'], ['We had our picnic in the living room!', '🏠 🧺'], ['We ate and laughed.', '😄'], ['We listened to the rain.', '🌧️'], ['Later, the rain stopped.', '🌤️'], ['We saw a rainbow from the window.', '🌈'], ['It was the best picnic ever.', '💛']] },
  { id: 66, stage: 7, plus: true, title: 'My First Sleepover', cover: '🏕️', pages: [
    ['Last Friday, I slept at my friend Hana\'s house.', '🏠'], ['It was my first sleepover.', '🌙'], ['I packed my pajamas and my toothbrush.', '🎒'], ['I took my soft pillow, too.', '🛏️'],
    ['Mom drove me to Hana\'s house.', '🚗'], ['Hana opened the door and smiled.', '😊'], ['Her mom made spaghetti for dinner.', '🍝'], ['We ate it all.', '😋'],
    ['After dinner, we played a board game.', '🎲'], ['Hana won the game.', '🏆'], ['Then we built a blanket fort.', '⛺'], ['We put pillows inside it.', '🛏️'],
    ['We read comic books with a flashlight.', '🔦'], ['We told funny stories.', '😂'], ['We laughed so much.', '😆'], ['Then Hana\'s mom turned off the light.', '💡'],
    ['The room was very dark.', '🌑'], ['I missed my mom a little.', '🥺'], ['Hana held my hand.', '🤝'], ['Soon I fell asleep.', '😴'],
    ['In the morning, we ate pancakes.', '🥞'], ['My mom came to pick me up.', '🚗'], ['I said thank you to Hana and her mom.', '💛'], ['It was the best night ever!', '🌟']] },
  { id: 67, stage: 8, plus: true, title: 'Our Class Pet', cover: '🐰', pages: [
    ['Next Monday, a rabbit will come to our class.', '🐰'], ['She will be our class pet.', '🐰'], ['Her name is going to be Snowy.', '🐰'], ['She will be white and fluffy.', '🤍'],
    ['Our teacher is going to bring a big cage.', '👩‍🏫'], ['We will put the cage by the window.', '🪟'], ['Every day, two students will take care of Snowy.', '🧒 🧒'], ['My friend Minho and I are going to be first.', '🙋'],
    ['We will give her fresh water.', '💧'], ['I am going to feed her carrots.', '🥕'], ['Minho will give her some hay.', '🌾'], ['Snowy will love it.', '🐰 💛'],
    ['We are going to clean her cage.', '🧹'], ['It will be hard work.', '💦'], ['But we will do a good job.', '👍'], ['After lunch, Snowy will hop on the rug.', '🐰'],
    ['We will be very quiet.', '🤫'], ['Maybe she will sit on my lap.', '🐰'], ['I will draw a picture of Snowy.', '🖍️'], ['Minho is going to write a story about her.', '✏️'],
    ['Our class will make a book about Snowy.', '📕'], ['On weekends, our teacher will take her home.', '🏠'], ['I will miss her on Saturday and Sunday.', '🥺'], ['I can\'t wait to meet Snowy!', '🐰 💛']] },
  { id: 68, stage: 8, plus: true, title: 'Our Treehouse', cover: '🌳', pages: [
    ['This summer, Dad and I are going to build a treehouse.', '🌳'], ['It will be in the big tree in our yard.', '🌳'], ['First, we will draw a plan.', '📝'], ['The treehouse will have one small window.', '🪟'],
    ['It will have a red roof.', '🔴'], ['Dad is going to buy wood.', '🪵'], ['We will need a hammer and nails.', '🔨'], ['Dad will cut the wood.', '🪚'],
    ['I am going to paint the walls green.', '🎨'], ['We will make a rope ladder.', '🪜'], ['I will climb up the ladder.', '🧗'], ['Inside, there will be a little table.', '🪑'],
    ['I am going to put my books there.', '📚'], ['We will hang a flag on the roof.', '🚩'], ['My little brother will want to come in.', '👦'], ['He will need to say the password.', '🤫'],
    ['The password will be banana!', '🍌'], ['At night, we are going to look at the stars.', '⭐'], ['We will bring warm blankets.', '🧣'], ['Mom will send up cookies in a basket.', '🍪'],
    ['It will be our secret place.', '🤫'], ['I will read and draw there every day.', '📖'], ['It is going to be the best summer ever.', '☀️'], ['I can\'t wait to start!', '🌳 💛']] },
  { id: 69, stage: 1, plus: true, title: 'ABC Zoo', cover: '🐘', pages: [
    ['A is for alligator.', '🐊'], ['B is for bear.', '🐻'], ['C is for camel.', '🐫'], ['D is for duck.', '🦆'],
    ['E is for elephant.', '🐘'], ['F is for flamingo.', '🦩'], ['G is for giraffe.', '🦒'], ['H is for hippo.', '🦛'],
    ['I is for iguana.', '🦎'], ['J is for jaguar.', '🐆'], ['K is for koala.', '🐨'], ['L is for lion.', '🦁'],
    ['M is for monkey.', '🐒'], ['I go to the zoo.', '🧒'], ['I see big animals.', '🐘 🦒'], ['I love the zoo!', '🦁 💛']] },
  { id: 70, stage: 2, plus: true, title: 'Kip the Pup', cover: '🐶', pages: [
    ['Kip is a pup.', '🐶'], ['Kip is not big.', '🐶'], ['Kip can dig.', '🐶'], ['Kip digs and digs.', '🐶'],
    ['Kip digs up a red cup.', '🥤'], ['A bug is in the cup.', '🐞'], ['The bug is red, too.', '🐞'], ['The bug hops on Kip.', '🐞 🐶'],
    ['Kip sits.', '🐶'], ['The bug sits on his nose.', '🐞'], ['Ah, ah, choo!', '🤧'], ['The bug hops off.', '🐞'],
    ['The bug sits in the sun.', '☀️'], ['Kip naps in the sun, too.', '😴'], ['Sam gets the red cup.', '🧒'], ['Good pup, Kip!', '🐶 💛']] },
  { id: 71, stage: 3, plus: true, title: 'My Color Walk', cover: '🌈', pages: [
    ['I go for a walk.', '🚶'], ['I look for colors.', '🌈'], ['The sky is blue.', '🔵'], ['The grass is green.', '🟢'],
    ['The sun is yellow.', '🟡'], ['I see a red apple.', '🍎'], ['I see an orange cat.', '🐱'], ['The cat is on a wall.', '🐱'],
    ['I see pink flowers.', '🌸'], ['I see a brown dog.', '🐶'], ['The dog is big.', '🐶'], ['I see a white bird.', '🐦'],
    ['The bird can fly.', '🐦'], ['Drip, drop. It is rain.', '🌧️'], ['I have a yellow umbrella.', '☂️'], ['Then the sun comes out.', '☀️'],
    ['Look! A rainbow!', '🌈'], ['It has many colors.', '🌈'], ['I like all the colors.', '💛'], ['What color do you like?', '❓']] },
  { id: 72, stage: 4, plus: true, title: 'At the Park', cover: '🛝', pages: [
    ['Mia, do you want to go to the park?', '❓'], ['Yes! Let\'s go.', '👧'], ['Look at the swings!', '👀'], ['Can you push me, please?', '❓'],
    ['Sure. Hold on tight.', '👍'], ['Wow, I am up so high!', '😮'], ['Now it is my turn.', '🙋'], ['Let\'s go down the slide.', '🛝'],
    ['Wheee! That was fun.', '😄'], ['Let\'s play in the sand.', '🏖️'], ['I can make a sand cake.', '🎂'], ['It looks yummy!', '😋'],
    ['Dad, can we have ice cream?', '🍦 ❓'], ['Yes, you can.', '👨'], ['What flavor do you want?', '🍦 ❓'], ['I want chocolate, please.', '🍫'],
    ['I want strawberry!', '🍓'], ['It is getting dark.', '🌆'], ['See you tomorrow, Mia!', '👋'], ['Bye! See you tomorrow!', '👋 💛']] },
  { id: 73, stage: 5, plus: true, title: 'The Sleepy Bear', cover: '🐻', pages: [
    ['Spring is here.', '🌸'], ['The snow is melting.', '💧'], ['A big brown bear sleeps in a dark cave.', '🐻'], ['His name is Bobo.', '🐻'],
    ['He sleeps all winter long.', '😴'], ['Now the sun is warm.', '☀️'], ['Bobo opens his eyes.', '👀'], ['He yawns and stretches.', '🥱'],
    ['He is very hungry.', '😋'], ['Bobo walks out of the cave.', '🐻'], ['The forest is green and bright.', '🌳'], ['He looks for berries.', '🫐'],
    ['But the bushes have only small flowers.', '🌼'], ['He goes to the river.', '🏞️'], ['He tries to catch a fish.', '🐟'], ['Splash! The fish swims away.', '💦'],
    ['Bobo is wet and sad.', '😢'], ['A little bird sings in a tree.', '🐦'], ['Follow me, says the bird.', '🐦'], ['There is honey in an old tree.', '🍯'],
    ['Bobo eats the honey. Yum!', '😋'], ['Thank you, little bird! says Bobo.', '🐻 💛']] },
  { id: 74, stage: 5, plus: true, title: 'The Lion and the Mouse', cover: '🦁', pages: [
    ['A big lion lives in the jungle.', '🦁'], ['He is strong and loud.', '🦁'], ['One day, the lion is sleeping under a tree.', '😴'], ['A little mouse runs over his nose.', '🐭'],
    ['The lion wakes up.', '🦁'], ['He catches the mouse with his big paw.', '🐾'], ['Please let me go! says the mouse.', '🐭'], ['One day, I can help you.', '🐭'],
    ['The lion laughs.', '🦁 😆'], ['You are so small!', '🐭'], ['But he lets the mouse go.', '🐭'], ['Some days later, the lion walks in the jungle.', '🦁'],
    ['Oh no! He is caught in a net.', '🕸️'], ['He pulls and pulls.', '💪'], ['But he cannot get out.', '😢'], ['He roars and roars.', '🦁'],
    ['The little mouse hears him.', '🐭 👂'], ['She runs to the lion.', '🐭'], ['She bites the net with her sharp teeth.', '🐭'], ['Snip, snip! The net breaks.', '✂️'],
    ['The lion is free!', '🦁'], ['Small friends can be big helpers.', '🐭 🦁 💛']] },
  { id: 75, stage: 6, plus: true, title: 'What Season Is It?', cover: '🍂', pages: [
    ['What season is it?', '❓'], ['It is spring!', '🌸'], ['What is on the trees?', '🌳 ❓'], ['Pink flowers are on the trees.', '🌸'],
    ['We can fly a kite.', '🪁'], ['What season is it now?', '❓'], ['It is summer!', '☀️'], ['How is the weather?', '❓'],
    ['It is very hot.', '🥵'], ['We can swim in the pool.', '🏊'], ['What season is it now?', '❓'], ['It is fall!', '🍂'],
    ['What color are the leaves?', '🍁 ❓'], ['They are red and yellow.', '🍁'], ['We can jump in the leaves.', '🍂'], ['What season is it now?', '❓'],
    ['It is winter!', '❄️'], ['What is falling from the sky?', '❓'], ['Snow is falling.', '❄️'], ['We can make a snowman.', '⛄'],
    ['Which season do you like?', '❓'], ['I like them all!', '💛']] },
  { id: 76, stage: 6, plus: true, title: 'Who Helps in Our Town?', cover: '🏘️', pages: [
    ['Who brings the letters?', '✉️ ❓'], ['The mail carrier brings the letters.', '📮'], ['Who puts out fires?', '🔥 ❓'], ['The firefighter puts out fires.', '🚒'],
    ['Who helps sick people?', '🤒 ❓'], ['The doctor helps sick people.', '🩺'], ['Who drives the big bus?', '🚌 ❓'], ['The bus driver drives the big bus.', '🚌'],
    ['Who bakes the bread?', '🍞 ❓'], ['The baker bakes the bread.', '🧑‍🍳'], ['Who keeps us safe?', '❓'], ['The police officer keeps us safe.', '👮'],
    ['Who teaches the children?', '❓'], ['The teacher teaches the children.', '🧑‍🏫'], ['Who grows the vegetables?', '🥕 ❓'], ['The farmer grows the vegetables.', '🧑‍🌾'],
    ['Who fixes the cars?', '🚗 ❓'], ['The mechanic fixes the cars.', '🔧'], ['Who keeps the streets clean?', '❓'], ['The street cleaner keeps the streets clean.', '🧹'],
    ['Who can help, too?', '❓'], ['I can help, too!', '🙋 💛']] },
  { id: 77, stage: 7, plus: true, title: 'Moving Day', cover: '📦', pages: [
    ['Last month, my family moved to a new house.', '🏠'], ['First, we packed our things in boxes.', '📦'], ['I packed my toys and books.', '🧸 📚'], ['Mom put tape on the boxes.', '📦'],
    ['A big truck came to our house.', '🚚'], ['The movers carried the heavy boxes.', '📦'], ['I said goodbye to my old room.', '👋'], ['I felt a little sad.', '😢'],
    ['Then we drove to the new house.', '🚗'], ['The new house had a red door.', '🚪'], ['My new room was empty.', '🏠'], ['It looked very big.', '😮'],
    ['We opened the boxes.', '📦'], ['I found my teddy bear first.', '🧸'], ['Dad put my bed by the window.', '🛏️'], ['Mom hung my pictures on the wall.', '🖼️'],
    ['In the evening, someone knocked on the door.', '🚪'], ['It was a girl from next door.', '👧'], ['She gave us some cookies.', '🍪'], ['Her name was Hana.', '👧'],
    ['We played in my new room.', '😄'], ['Now I have a new friend.', '💛'], ['I like my new home.', '🏠 💛'], ['Moving day was a happy day after all.', '😊']] },
  { id: 78, stage: 7, plus: true, title: 'A Day at the Aquarium', cover: '🐠', pages: [
    ['Last Sunday, Grandma took me to the aquarium.', '🐠'], ['We walked into a big blue room.', '🔵'], ['There was water all around us.', '🌊'], ['Colorful fish swam over our heads.', '🐠'],
    ['I saw a big sea turtle.', '🐢'], ['It swam very slowly.', '🐢'], ['Then I saw a shark!', '🦈'], ['It had many sharp teeth.', '🦈'],
    ['I held Grandma\'s hand tightly.', '👵'], ['Next, we watched the penguins.', '🐧'], ['They jumped into the water.', '🐧 💦'], ['One penguin walked up to the glass.', '🐧'],
    ['It looked right at me!', '🐧 👀'], ['I waved, and it flapped its wings.', '👋'], ['We touched a starfish in a small pool.', '⭐'], ['It felt rough and bumpy.', '⭐'],
    ['After lunch, we saw the jellyfish.', '🪼'], ['They glowed pink and purple in the dark.', '🪼'], ['They looked like little umbrellas.', '☂️'], ['At the gift shop, Grandma bought me a toy whale.', '🐋'],
    ['I named it Bubbles.', '🐋'], ['On the way home, I fell asleep.', '😴'], ['I dreamed about the sea.', '🌊'], ['It was a wonderful day.', '💛']] },
  { id: 79, stage: 8, plus: true, title: 'Christmas Is Coming', cover: '🎄', pages: [
    ['Christmas is coming next week.', '🎄'], ['We are going to get a big tree.', '🌲'], ['Dad will carry it home.', '👨 🌲'], ['We will put it in the living room.', '🛋️'],
    ['I am going to hang the shiny balls.', '🎄'], ['Mom will put on the lights.', '💡'], ['At the top, there will be a gold star.', '⭐'], ['We are going to bake cookies.', '🍪'],
    ['I will make star cookies.', '⭐ 🍪'], ['I am going to make a card for Grandpa.', '💌'], ['I will draw a snowman on it.', '⛄'], ['On Christmas Eve, we will sing songs.', '🎶'],
    ['We will leave milk and cookies for Santa.', '🥛 🍪'], ['Then I will go to bed early.', '😴'], ['Maybe Santa will come at night.', '🎅'], ['In the morning, there will be presents under the tree.', '🎁'],
    ['I will open them with my family.', '🎁 😄'], ['I hope I will get a red sled.', '🛷'], ['After that, we are going to play in the snow.', '❄️'], ['We will make a big snowman.', '⛄'],
    ['I will give him my old scarf.', '🧣'], ['At night, we will have a big dinner.', '🍗'], ['Grandma and Grandpa will come, too.', '👵 👴'], ['It is going to be the best Christmas!', '🎄 💛']] },
  { id: 80, stage: 8, plus: true, title: 'Our New Baby', cover: '👶', pages: [
    ['Mom is going to have a baby soon.', '🤰'], ['I am going to be a big brother!', '👦'], ['We are going to get a little bed for the baby.', '🛏️'], ['Dad and I will paint the baby\'s room.', '🖌️'],
    ['We are going to paint it light yellow.', '🟡'], ['I will give the baby my old teddy bear.', '🧸'], ['The baby will be very small.', '👶'], ['It will cry a lot, Mom says.', '😭'],
    ['But I will not mind.', '😊'], ['I am going to sing songs to the baby.', '🎶'], ['I will read picture books to it, too.', '📖'], ['When it gets bigger, we will play together.', '🧸'],
    ['We will build block towers.', '🧱'], ['I am going to teach the baby my name.', '👦'], ['Maybe it will say my name first!', '😮'], ['I will show the baby my toy cars.', '🚗'],
    ['We will go to the park together.', '🌳'], ['I will push the stroller.', '👶'], ['I will hold the baby\'s tiny hand.', '🤝'], ['I hope it will be a little sister.', '👧'],
    ['Dad says we will love the baby, boy or girl.', '👨 💛'], ['I will be a good big brother.', '👦 💛'], ['I will help Mom every day.', '👩'], ['I can\'t wait to meet the baby!', '👶 💛']] },
  { id: 81, stage: 1, plus: true, title: 'ABC Farm', cover: '🐑', pages: [
    ['A is for alpaca.', '🦙'], ['B is for barn.', '🏠'], ['C is for cow.', '🐄'], ['D is for donkey.', '🫏'],
    ['E is for eagle.', '🦅'], ['F is for farmer.', '🧑‍🌾'], ['G is for goat.', '🐐'], ['H is for horse.', '🐴'],
    ['I is for insect.', '🐜'], ['J is for jeep.', '🚙'], ['K is for kitten.', '🐱'], ['L is for lamb.', '🐑'],
    ['M is for mud.', '🟤'], ['I visit a farm.', '🧒'], ['I hold a little lamb.', '🐑'], ['It is so fluffy!', '🐑 💛']] },
  { id: 82, stage: 2, plus: true, title: 'Gus the Duck', cover: '🦆', pages: [
    ['Gus is a duck.', '🦆'], ['Gus has a drum.', '🥁'], ['Gus sits in the sun.', '☀️'], ['Rum, tum, tum! Gus plays the drum.', '🥁'],
    ['A bunny runs up.', '🐰'], ['The bunny jumps and jumps.', '🐰'], ['Gus drums fast.', '🥁'], ['The bunny jumps up, up, up!', '🐰'],
    ['Bump! The bunny lands on the drum.', '💥'], ['Oh no! The drum has a hole.', '😮'], ['Gus is upset.', '😢'], ['The bunny is upset, too.', '😢'],
    ['The bunny runs to get a tub.', '🪣'], ['Gus drums on the tub.', '🥁'], ['Rum, tum, tum! What fun!', '🎵'], ['Gus and the bunny hug.', '🦆 🐰 💛']] },
  { id: 83, stage: 3, plus: true, title: 'My Body', cover: '🧍', pages: [
    ['This is my body.', '🧍'], ['I have two eyes.', '👀'], ['I can see a red bird.', '🐦'], ['This is my nose.', '👃'],
    ['I can smell the flowers.', '🌸'], ['I have two ears.', '👂'], ['I can hear music.', '🎵'], ['This is my mouth.', '👄'],
    ['I can eat a big apple.', '🍎'], ['I can sing a song, too.', '🎤'], ['I have two hands.', '🙌'], ['I can clap my hands.', '👏'],
    ['I can draw a picture.', '🖍️'], ['I have two feet.', '🦶'], ['I can jump high.', '🦘'], ['I can run fast, too.', '🏃'],
    ['I have two arms.', '💪'], ['I can hug my dad.', '🤗'], ['My body is strong.', '💪'], ['I love my body!', '💛']] },
  { id: 84, stage: 4, plus: true, title: 'On the Phone', cover: '📞', pages: [
    ['Ring, ring!', '📞'], ['Hello?', '📞'], ['Hello. This is Ruby. Can I talk to Leo, please?', '👧'], ['Sure. Just a minute, Ruby.', '👩'],
    ['Hi, Ruby! This is Leo.', '👦'], ['Hi, Leo! What are you doing?', '❓'], ['I am drawing a dinosaur.', '🦕'], ['Cool! Can you come to my house?', '🏠 ❓'],
    ['I have a new toy train. Let\'s play together!', '🚂'], ['That sounds fun! Let me ask my mom.', '👦'], ['Mom, can I go to Ruby\'s house?', '❓'], ['Sure. Have fun!', '👩'],
    ['My mom says yes!', '😄'], ['What time can you come?', '🕑 ❓'], ['Can I come at two o\'clock?', '🕑'], ['Okay! Do you know my house?', '🏠 ❓'],
    ['Is it near the bakery?', '🍞 ❓'], ['Yes. It is the house with a blue door.', '🚪'], ['Great! See you at two!', '👍'], ['Bye, Leo!', '👋 💛']] },
  { id: 85, stage: 5, plus: true, title: 'The Ant and the Grasshopper', cover: '🐜', pages: [
    ['It is a hot summer day.', '☀️'], ['The sun is big and bright.', '☀️'], ['A little ant works hard.', '🐜'], ['She carries a big seed on her back.', '🐜'],
    ['The seed is heavy, but she does not stop.', '🐜'], ['A green grasshopper sits on a leaf.', '🦗'], ['He plays his little violin.', '🎻'], ['Come and play with me! says the grasshopper.', '🦗'],
    ['I can\'t. I am busy, says the ant.', '🐜'], ['Cold winter is coming soon.', '❄️'], ['The grasshopper just laughs.', '🦗'], ['Winter is far away! he says.', '🦗'],
    ['Soon the leaves turn red and yellow.', '🍂'], ['Then the cold winter comes.', '❄️'], ['White snow covers the ground.', '❄️'], ['The grasshopper is cold and hungry.', '🦗'],
    ['He cannot find any food.', '😢'], ['He knocks on a tiny door in the hill.', '🚪'], ['Her home is warm and full of food.', '🏠'], ['Please help me, says the grasshopper.', '🦗'],
    ['She shares her warm food with him.', '🐜 🦗'], ['Thank you! Next summer, I will work, too.', '💛']] },
  { id: 86, stage: 5, plus: true, title: 'The Giant Turnip', cover: '🥬', pages: [
    ['Grandpa plants a little turnip seed.', '👴'], ['The warm sun shines on the garden.', '☀️'], ['The soft rain falls, too.', '🌧️'], ['The turnip grows and grows.', '🌱'],
    ['Now the turnip is giant!', '😮'], ['It is round and white, with big green leaves.', '🥬'], ['Grandpa pulls hard.', '👴'], ['But the turnip does not move.', '🥬'],
    ['Grandma comes to help.', '👵'], ['Grandma and Grandpa pull together.', '👵 👴'], ['A little girl comes to help.', '👧'], ['Now three of them pull.', '👧 👵 👴'],
    ['Still, the turnip does not move.', '🥬'], ['A brown dog comes to help.', '🐶'], ['A fluffy orange cat comes, too.', '🐱'], ['They pull again. Nothing!', '😩'],
    ['Then a tiny gray mouse comes.', '🐭'], ['Can I help, too? asks the mouse.', '🐭'], ['Yes! One, two, three, pull!', '💪'], ['Out comes the giant turnip!', '🥬'],
    ['Everyone falls down and laughs.', '😂'], ['That night, they all eat warm turnip soup.', '🍲']] },
  { id: 87, stage: 6, plus: true, title: 'Who Lives in the Tree?', cover: '🌳', pages: [
    ['There is a big old tree in the park.', '🌳'], ['Who lives in this tree?', '❓'], ['Let\'s take a look.', '👀'], ['What is in the hole?', '❓'],
    ['It is a brown owl.', '🦉'], ['Why is the owl sleeping?', '❓'], ['The owl sleeps in the day. It wakes up at night.', '🦉'], ['Who is running up the tree?', '❓'],
    ['It is a little squirrel.', '🐿️'], ['What does the squirrel have?', '❓'], ['It has a brown acorn.', '🌰'], ['Where is the bird\'s nest?', '❓'],
    ['It is on a high branch.', '🪺'], ['What is in the nest?', '❓'], ['There are three blue eggs.', '🥚'], ['Who is sitting on the eggs?', '❓'],
    ['The mother bird is. She keeps them warm.', '🐦'], ['What is on that green leaf?', '❓'], ['It is a fat caterpillar.', '🐛'], ['What is it doing?', '❓'],
    ['It is eating the leaf. Munch, munch!', '🐛'], ['This tree is a home for many animals!', '🌳 💛']] },
  { id: 88, stage: 6, plus: true, title: 'Walk, Bus, or Boat?', cover: '⛴️', pages: [
    ['How do I go to school?', '🏫 ❓'], ['I walk with my mom.', '🚶'], ['How does Dad go to work?', '❓'], ['He takes the subway.', '🚇'],
    ['Why does he take the subway?', '❓'], ['It is fast. The roads are busy.', '🚗'], ['How do we go to the market?', '❓'], ['We take the green bus.', '🚌'],
    ['Where do we sit?', '❓'], ['We sit by the window.', '🪟'], ['How do we go to the island?', '🏝️ ❓'], ['We go on a big boat.', '⛴️'],
    ['What can we see from the boat?', '❓'], ['We can see white birds and blue waves.', '🌊'], ['How do we go up the mountain?', '⛰️ ❓'], ['We ride a cable car.', '🚡'],
    ['How do I feel up so high?', '❓'], ['I feel a little scared, but it is fun!', '😆'], ['How do we get home late at night?', '🌙 ❓'], ['We take a taxi.', '🚕'],
    ['Which one do I like best? The boat!', '⛴️ 💛'], ['How do you go to school?', '❓']] },
  { id: 89, stage: 7, plus: true, title: 'The New Kid in Class', cover: '👧', pages: [
    ['Last Monday, a new girl came to our class.', '🏫'], ['Her name was Sofia.', '👧'], ['She came from Spain, far away.', '✈️'], ['She did not know any Korean.', '🤔'],
    ['She sat alone and looked shy.', '😶'], ['At lunch, I sat next to her.', '🍱'], ['I smiled and waved.', '👋'], ['She smiled back.', '😊'],
    ['I pointed at my rice.', '🍚'], ['I taught her the Korean word for rice.', '🍚'], ['She said it very slowly.', '🗣️'], ['We laughed together.', '😄'],
    ['Then Sofia taught me a word, too.', '👧'], ['Hola means hello in Spanish!', '👋'], ['Every day, we learned new words.', '📖'], ['I taught her to say thank you in Korean.', '🙏'],
    ['She taught me to say it in Spanish.', '🙏'], ['At recess, we jumped rope together.', '🪢'], ['Sofia was very good at it!', '👏'], ['On Friday, she wrote my name in Korean.', '✏️'],
    ['It was not perfect, but I loved it.', '💛'], ['Now Sofia speaks a little Korean.', '😊'], ['And I know some Spanish words!', '😄'], ['We are a great team now!', '👫 💛']] },
  { id: 90, stage: 7, plus: true, title: 'Strawberry Picking', cover: '🍓', pages: [
    ['Last Saturday, my family went to a strawberry farm.', '🍓'], ['The strawberries grew inside a big greenhouse.', '🏡'], ['It was warm inside.', '☀️'], ['The farmer gave me a little basket.', '🧺'],
    ['The strawberries were red and shiny.', '🍓'], ['Some were still green and small.', '🌱'], ['I picked only the red ones.', '🍓'], ['I ate one right away.', '😋'],
    ['It was sweet and juicy!', '🍓'], ['My little brother ate a big one.', '👦'], ['His mouth was red with juice.', '😄'], ['Soon our basket was full.', '🧺'],
    ['At home, we washed the strawberries.', '💧'], ['Mom cut them into small pieces.', '🔪'], ['We put them in a big pot with sugar.', '🍲'], ['Mom cooked them slowly.', '👩'],
    ['The kitchen smelled so sweet.', '😊'], ['Soon it turned into sweet strawberry jam!', '🍓'], ['We put the jam in small jars.', '🫙'], ['I drew a strawberry on each jar.', '🖍️'],
    ['Then we gave jars to our neighbors.', '🎁'], ['Our old neighbor smiled and said thank you.', '👴'], ['He gave us some apples from his tree.', '🍎'], ['It was a sweet, sweet day!', '🍓 💛']] },
  { id: 91, stage: 8, plus: true, title: 'Grandma Is Coming!', cover: '👵', pages: [
    ['Grandma is coming to our house next week!', '👵'], ['She lives far away by the sea.', '🌊'], ['She is going to stay with us for five days.', '📅'], ['She will sleep in my room.', '🛏️'],
    ['I am going to sleep in my sister\'s room.', '👧'], ['Tomorrow, I will clean my room.', '🧹'], ['I am going to make my bed very neat.', '🛏️'], ['Mom will cook Grandma\'s favorite food.', '👩'],
    ['It is sweet pumpkin soup.', '🎃'], ['I will help Mom wash the pumpkin.', '🎃'], ['On Monday, we are going to meet Grandma at the train station.', '🚉'], ['I will make a big sign that says Welcome, Grandma!', '🪧'],
    ['Then I will give her a big hug.', '🤗'], ['Grandma is going to bring her yarn and needles.', '🧶'], ['She will teach me how to knit.', '🧶'], ['Maybe I will make a little scarf.', '🧣'],
    ['We are going to walk in the park together.', '🌳'], ['I will show her my school, too.', '🏫'], ['Before bed, I will show her my picture books.', '📖'], ['She will tell me stories about Mom as a little girl.', '👧'],
    ['I think they will be very funny.', '😂'], ['We will take a photo together.', '📷'], ['When Grandma goes home, I will miss her.', '😢'], ['This will be a very happy week!', '👵 💛']] },
  { id: 92, stage: 8, plus: true, title: 'The First Day of School', cover: '🎒', pages: [
    ['Tomorrow, I am going to start first grade.', '🏫'], ['My new yellow backpack is ready.', '🎒'], ['I will put my pencil case inside.', '✏️'], ['Mom is going to walk me to school.', '👩'],
    ['The school will be very big.', '🏫'], ['There will be many new faces.', '👀'], ['I will have a new teacher.', '👩‍🏫'], ['Maybe she will be kind and funny.', '😊'],
    ['But I am a little worried.', '😟'], ['What if I get lost?', '❓'], ['What if nobody plays with me?', '❓'], ['Mom says I will be okay.', '👩'],
    ['You will make friends soon, she says.', '👩'], ['I will say hello first.', '👋'], ['I will tell them my name.', '😊'], ['I am going to share my crayons.', '🖍️'],
    ['Maybe I will find a best friend.', '👫'], ['We will sit together at lunch.', '🍱'], ['After school, I will tell Mom everything.', '🗣️'], ['Tonight, I will put my clothes on the chair.', '🪑'],
    ['I am going to wear my new sneakers.', '👟'], ['I am a little scared, but excited, too.', '😬'], ['Tomorrow will be a big day.', '🌟'], ['Good night! See you tomorrow, school!', '🌙 💛']] },
  { id: 93, stage: 1, plus: true, title: 'ABC Night', cover: '🌙', pages: [
    ['N is for night.', '🌙'], ['O is for ostrich.', '🪶'], ['P is for pillow.', '🛏️'], ['Q is for quail.', '🐦'],
    ['R is for raccoon.', '🦝'], ['S is for star.', '⭐'], ['T is for teddy bear.', '🧸'], ['U is for under.', '⬇️'],
    ['V is for valley.', '🏞️'], ['W is for wolf.', '🐺'], ['Wax ends with X.', '🕯️'], ['Y is for yawn.', '🥱'],
    ['Z is for zipper.', '🤐'], ['I look up at the night sky.', '🌌'], ['I count the stars.', '✨'], ['Soon I fall asleep.', '😴']] },
  { id: 94, stage: 2, plus: true, title: 'Jen and the Web', cover: '🕸️', pages: [
    ['Jen is a red spider.', '🕷️'], ['Jen sits on a stem.', '🌿'], ['Jen spins a web.', '🕸️'], ['The web gets big.', '🕸️'],
    ['Then a big gray cloud comes.', '☁️'], ['Rain falls on the web.', '🌧️'], ['Ten big drops! The web is wet.', '💧'], ['The web is a mess.', '😮'],
    ['Poor Jen!', '😢'], ['Then the sun shines again.', '☀️'], ['Jen gets up.', '🕷️'], ['Jen fixes the web.', '🕸️'],
    ['She works and works.', '🕸️'], ['It is the best web yet!', '✨'], ['Jen rests in her web.', '😌'], ['Well done, Jen!', '👏']] },
  { id: 95, stage: 3, plus: true, title: 'Shapes All Around', cover: '🔺', pages: [
    ['I look for shapes at home.', '🔍'], ['This is a clock.', '🕐'], ['It is a circle.', '⚪'], ['The plate is a circle, too.', '🍽️'],
    ['This is my window.', '🪟'], ['It is a square.', '🟦'], ['This is my sandwich.', '🥪'], ['It is a triangle.', '🔺'],
    ['This is my book.', '📕'], ['It is a rectangle.', '▭'], ['I have a cookie.', '🍪'], ['It is a star.', '⭐'],
    ['I have a sticker.', '❤️'], ['It is a heart.', '❤️'], ['I can find an egg.', '🥚'], ['It is an oval shape.', '🥚'],
    ['I can draw shapes, too.', '✏️'], ['I draw a square and a triangle.', '🟦 🔺'], ['It is a little house!', '🏠'], ['Shapes are everywhere!', '✨']] },
  { id: 96, stage: 4, plus: true, title: 'At the Hair Salon', cover: '💇', pages: [
    ['Hello! Welcome to the hair salon.', '💈'], ['Hi! I want a haircut, please.', '🙋'], ['Sure. Please sit here.', '💺'], ['Is the chair too low?', '💺'],
    ['Yes. I can\'t see the mirror!', '🙂'], ['Okay. Up you go!', '⬆️'], ['How do you want your hair?', '💇'], ['Short, please.', '✂️'],
    ['Do you want bangs?', '💇'], ['Yes, please!', '😊'], ['First, I will spray some water.', '💦'], ['Snip, snip, snip!', '✂️'],
    ['Does it tickle?', '😆'], ['Yes! It tickles my ears.', '👂'], ['Hold still, please.', '🙏'], ['Okay. I will not move.', '😐'],
    ['All done! Look in the mirror.', '🪞'], ['Does it look good?', '❓'], ['It looks great! I love it!', '😍'], ['Thank you! See you next time.', '👋']] },
  { id: 97, stage: 5, plus: true, title: 'The Gray Duckling', cover: '🦢', pages: [
    ['It is a warm spring day.', '🌸'], ['A mother duck sits on her nest by the lake.', '🦆'], ['Crack, crack! Three yellow ducklings come out.', '🐣'], ['They are small and fluffy.', '🐥'],
    ['But one big egg is still in the nest.', '🥚'], ['Crack! Out comes a gray duckling.', '🐣'], ['He is bigger than the others.', '🦆'], ['He has big feet and a long neck.', '🦆'],
    ['You look funny! say the yellow ducklings.', '🐥'], ['The gray duckling feels sad and alone.', '😢'], ['He swims away by himself.', '🦆'], ['The days get short and cold.', '🍂'],
    ['Then winter comes. The water turns to ice.', '🧊'], ['The gray duckling hides in the dry grass.', '🌾'], ['The icy wind blows and blows.', '🌬️'], ['At last, spring comes again.', '🌷'],
    ['The grass is soft and green.', '🌿'], ['He sees three white birds on the lake.', '🦢'], ['They are big and beautiful.', '🦢'], ['He looks down at the water.', '💧'],
    ['Wow! He is a white swan, too!', '🦢'], ['Now he swims with his new friends.', '🦢 💛']] },
  { id: 98, stage: 5, plus: true, title: 'The Tiger and the Dried Persimmon', cover: '🐯', pages: [
    ['It is a dark, snowy night.', '🌨️'], ['A big tiger comes down the mountain.', '🐯'], ['He wants something to eat.', '🐯'], ['He sees a little house with a warm light.', '🏠'],
    ['Inside, a baby is crying.', '👶'], ['Waah! Waah! The baby is very loud.', '😭'], ['Stop crying, or the tiger will come! says the mom.', '👩'], ['The baby cries even louder.', '😭'],
    ['The tiger thinks, That baby is not scared of me!', '🐯'], ['Here is a dried persimmon, says the mom.', '🟠'], ['The baby stops crying right away.', '👶'], ['The tiger shakes with fear.', '😨'],
    ['A dried persimmon must be a scary monster!', '👹'], ['Just then, something jumps on his back!', '😱'], ['It is a thief! He wants to take a cow.', '🐄'], ['In the dark, he thinks the tiger is a cow.', '🌑'],
    ['Oh no! The dried persimmon is on my back!', '🐯'], ['The tiger runs as fast as he can.', '💨'], ['The thief holds on tight.', '😨'], ['Then he jumps off into the soft snow.', '❄️'],
    ['The tiger runs far away.', '🐯'], ['He never comes back to that house!', '🏠']] },
  { id: 99, stage: 6, plus: true, title: 'Where Do Animals Sleep?', cover: '🦇', pages: [
    ['Everyone needs sleep. Where do animals sleep?', '😴'], ['Where does the bat sleep?', '🦇'], ['It sleeps in a dark cave.', '🦇'], ['How does it sleep?', '❓'],
    ['It hangs upside down!', '🦇'], ['How does the horse sleep?', '🐴'], ['It can sleep standing up.', '🐴'], ['Where do little birds sleep?', '🐦'],
    ['They sleep on a tree branch.', '🌳'], ['Why don\'t they fall?', '❓'], ['Their feet hold the branch tight.', '🐦'], ['How does the flamingo sleep?', '🦩'],
    ['It stands on one leg!', '🦩'], ['Where do sea otters sleep?', '🦦'], ['They sleep on the water.', '🌊'], ['Why do they hold hands?', '🦦'],
    ['So they do not float away.', '🦦 💛'], ['When does the cat sleep?', '🐱'], ['It naps in the sun all day.', '☀️'], ['Where do I sleep?', '🧒'],
    ['I sleep in my warm bed.', '🛏️'], ['Good night, animals!', '🌙']] },
  { id: 100, stage: 6, plus: true, title: 'What Can Grandpa Fix?', cover: '🧰', pages: [
    ['My grandpa can fix many things.', '👴'], ['What does he have in his toolbox?', '🧰'], ['He has a hammer, glue, and tape.', '🔨'], ['What is wrong with my toy car?', '🚗'],
    ['One wheel came off.', '🛞'], ['How does Grandpa fix it?', '❓'], ['He puts it back with a little glue.', '🚗'], ['Why is the clock so quiet?', '🕰️'],
    ['It needs a new battery.', '🔋'], ['Now the clock ticks again!', '🕰️'], ['What is that squeak?', '🚪'], ['It is the old door.', '🚪'],
    ['Grandpa gives it some oil. Now it is quiet.', '🛢️'], ['Who has a broken umbrella?', '☂️'], ['My sister does!', '👧'], ['Grandpa fixes it with tape.', '☂️'],
    ['What is under Grandpa\'s chair?', '🪑'], ['They are his glasses! He sat on them.', '👓'], ['Oh no! They are bent.', '😮'], ['Who can help Grandpa?', '❓'],
    ['I can! We fix them together.', '🧒 👴'], ['Thank you, my little helper! says Grandpa.', '💛']] },
  { id: 101, stage: 7, plus: true, title: 'The Day the Lights Went Out', cover: '🕯️', pages: [
    ['Last Friday night, there was a big storm.', '⛈️'], ['The rain was very heavy.', '🌧️'], ['We were in the living room.', '🛋️'], ['Suddenly, all the lights went out!', '💡'],
    ['It was so dark!', '🌑'], ['My little brother started to cry.', '😭'], ['Dad found a flashlight in a drawer.', '🔦'], ['Mom put two candles on the table.', '🕯️'],
    ['The candles made a soft yellow light.', '🕯️'], ['Then Dad made shadows on the wall.', '🖐️'], ['He made a bird with his hands.', '🐦'], ['The bird flew across the wall!', '🐦'],
    ['I made a bunny with long ears.', '🐰'], ['My brother stopped crying and giggled.', '😆'], ['Then Mom told us a story.', '📖'], ['It was a funny story about a lazy cat.', '🐱'],
    ['We all laughed a lot.', '😂'], ['We ate bread and milk by candlelight.', '🍞'], ['We could not watch TV.', '📺'], ['But we did not miss it.', '😊'],
    ['Late at night, the lights came back on.', '💡'], ['My brother was already asleep.', '😴'], ['Dad blew out the candles.', '🕯️'], ['That stormy night was so much fun!', '💛']] },
  { id: 102, stage: 7, plus: true, title: 'Making Kimchi', cover: '🥬', pages: [
    ['Last weekend, we went to Grandma\'s house.', '🏠'], ['It was kimchi day!', '🥬'], ['Grandma had many big cabbages.', '🥬'], ['She cut them in half.', '🔪'],
    ['Then we put salt on the cabbages.', '🧂'], ['They stayed in salty water all night.', '🌙'], ['The next morning, the cabbages were soft.', '🥬'], ['Mom washed them in cold water.', '💧'],
    ['Grandma made a red sauce.', '🌶️'], ['It had red pepper, garlic, and green onions.', '🧄'], ['It smelled very strong!', '😝'], ['Grandma\'s neighbor came to help, too.', '👵'],
    ['We all wore red rubber gloves.', '🧤'], ['My gloves were too big for me!', '🧤'], ['We covered every leaf with the red sauce.', '🥬'], ['My hands got very tired.', '😓'],
    ['Grandma tasted the kimchi and smiled.', '😋'], ['We put the kimchi in big brown pots.', '🏺'], ['There was enough kimchi for the whole winter.', '❄️'], ['Then Grandma cooked some pork.', '🍖'],
    ['We wrapped the pork in a cabbage leaf.', '🥬'], ['It was spicy but very good!', '😋'], ['Everyone ate together at one big table.', '🍽️'], ['Now I know how to make kimchi!', '💛']] },
  { id: 103, stage: 8, plus: true, title: 'My Pen Pal', cover: '✉️', pages: [
    ['I have a pen pal in Canada.', '🇨🇦'], ['Her name is Emma.', '👧'], ['Today, I am going to write a letter to her.', '✏️'], ['I will tell her about my town.', '🏙️'],
    ['I will draw a picture of my house, too.', '🖍️'], ['Dear Emma, hello from Korea!', '✉️'], ['My town has a big river and many tall buildings.', '🏙️'], ['Soon there will be pink flowers on the cherry trees.', '🌸'],
    ['Next summer, my family is going to visit Canada!', '✈️'], ['We will fly on a big plane for many hours.', '✈️'], ['We will come to your city.', '🏙️'], ['Will you show me the big lakes?', '🏞️'],
    ['I want to see the tall maple trees, too.', '🍁'], ['We are going to eat pancakes with maple syrup.', '🥞'], ['I will bring you a gift from Korea.', '🎁'], ['It will be a little fan with flowers on it.', '🪭'],
    ['I hope you will like it.', '😊'], ['Please write back soon.', '✉️'], ['Your friend, Minji.', '💛'], ['Then I am going to put the letter in an envelope.', '✉️'],
    ['Dad will take me to the post office.', '📮'], ['My letter will fly across the ocean to Emma.', '✈️'], ['Maybe she will write back next month.', '📬'], ['I will check the mailbox every day!', '📫']] },
  { id: 104, stage: 8, plus: true, title: 'Learning Taekwondo', cover: '🥋', pages: [
    ['Next month, I am going to start taekwondo.', '🥋'], ['The taekwondo school is near my house.', '🏫'], ['I will wear a white uniform.', '🥋'], ['First, I will get a white belt.', '🥋'],
    ['The teacher will show us how to bow.', '🙇'], ['Then we are going to stretch our legs.', '🤸'], ['I will learn how to punch.', '👊'], ['I will learn how to kick, too.', '🦵'],
    ['My kicks will be very high!', '🦵'], ['We will shout loudly when we kick.', '📣'], ['Maybe it will be hard at first.', '😓'], ['But I will practice every day.', '💪'],
    ['I will practice in my room after dinner.', '🏠'], ['My little sister will watch me.', '👧'], ['She is going to clap for me.', '👏'], ['In three months, there will be a belt test.', '📋'],
    ['I am going to try my best.', '💪'], ['If I pass, I will get a yellow belt!', '🟨'], ['Then I will get a green belt and a blue belt.', '🟩 🟦'], ['One day, I am going to get a black belt.', '⬛'],
    ['I will be strong and brave.', '💪'], ['I will be kind to my friends, too.', '🤝'], ['I will keep trying.', '🔥'], ['Taekwondo, here I come!', '🥋']] },
  { id: 105, stage: 1, plus: true, title: 'ABC Home', cover: '🏠', pages: [
    ['A is for armchair.', '🛋️'], ['B is for bed.', '🛏️'], ['C is for clock.', '🕰️'], ['D is for door.', '🚪'],
    ['E is for easel.', '🎨'], ['F is for fan.', '🌀'], ['G is for gate.', '🚧'], ['H is for house.', '🏠'],
    ['I is for iron.', '👔'], ['J is for jar.', '🫙'], ['K is for key.', '🔑'], ['L is for lock.', '🔒'],
    ['M is for mop.', '🧹'], ['Come inside my home.', '🚪'], ['My family lives here.', '👨‍👩‍👧'], ['I love my home!', '❤️']] },
  { id: 106, stage: 2, plus: true, title: 'Bob the Ox', cover: '🐂', pages: [
    ['Bob is an ox.', '🐂'], ['Bob has a big box.', '📦'], ['The box is for his sister, Polly.', '🎁'], ['Polly is on top of the hill.', '⛰️'],
    ['Bob jogs up the hill.', '🐂'], ['It is hot. Bob stops.', '☀️'], ['He sits on a rock.', '🪨'], ['A frog hops on the box.', '🐸'],
    ['Hop, hop! The frog hops off.', '🐸'], ['Bob gets up. He jogs on.', '🐂'], ['Bob is at the top!', '⛰️'], ['Polly opens the box.', '📦'],
    ['It has socks. Lots of socks!', '🧦'], ['Polly puts on the socks.', '🧦'], ['Polly hops and hops.', '🐄'], ['Thank you, Bob!', '❤️']] },
  { id: 107, stage: 3, plus: true, title: 'Moms and Babies', cover: '🦘', pages: [
    ['This is a mother kangaroo.', '🦘'], ['This is her baby.', '🦘'], ['It is in her pocket.', '👜'], ['This is a mother koala.', '🐨'],
    ['Her baby is on her back.', '🐨'], ['This is a mother penguin.', '🐧'], ['Her baby is on her feet.', '🐧'], ['It is warm there.', '☺️'],
    ['This is a mother elephant.', '🐘'], ['Her baby holds her tail.', '🐘'], ['It holds on with its trunk.', '🐘'], ['This is a mother monkey.', '🐒'],
    ['Her baby hugs her tummy.', '🐒'], ['This is a mother cat.', '🐈'], ['She has three kittens.', '🐱'], ['They drink her milk.', '🥛'],
    ['And this is my mom.', '👩'], ['I am her baby!', '👧'], ['I can hug my mom.', '🤗'], ['I love you, Mom!', '❤️']] },
  { id: 108, stage: 4, plus: true, title: 'Can I Borrow It?', cover: '✏️', pages: [
    ['Owen, can I borrow your eraser?', '✏️'], ['Of course. Take it.', '🙂'], ['Thank you, Owen!', '😊'], ['No problem!', '👍'],
    ['Oh no! Where is my pencil?', '😮'], ['I can\'t find it.', '🔍'], ['You can use my pencil.', '✏️'], ['Thanks! You are so kind.', '😊'],
    ['Can I borrow your ruler, too?', '📏'], ['Sorry, I am using it now.', '🙏'], ['Okay. I can wait.', '🙂'], ['Here you are. I am done.', '📏'],
    ['Do you have a green crayon?', '🖍️'], ['Yes, I do. Let\'s share.', '🖍️'], ['Your picture is so pretty!', '🖼️'], ['Thank you. I like yours, too.', '😊'],
    ['Time to clean up!', '🧹'], ['Here is your eraser, Owen.', '✏️'], ['Here is your pencil, Nora.', '✏️'], ['Thanks for sharing!', '🤝']] },
  { id: 109, stage: 5, plus: true, title: 'The Three Little Pigs', cover: '🐷', pages: [
    ['Three little pigs leave home to build new houses.', '🐷'], ['The first pig builds a house of straw.', '🌾'], ['It is quick and easy.', '⏱️'], ['The second pig builds a house of sticks.', '🪵'],
    ['The third pig builds a house of bricks.', '🧱'], ['It is slow, hard work, but the house is strong.', '💪'], ['One day, a big bad wolf comes.', '🐺'], ['He knocks on the straw house.', '🚪'],
    ['Little pig, little pig, let me come in!', '🐺'], ['No, no, no! says the first pig.', '🐷'], ['So the wolf huffs and puffs.', '💨'], ['The straw house falls down!', '🌾'],
    ['The first pig runs to the stick house.', '🏃'], ['The wolf huffs and puffs again.', '💨'], ['The stick house falls down, too!', '🪵'], ['The two pigs run to the brick house.', '🏃'],
    ['The wolf huffs and puffs and puffs.', '💨'], ['But the brick house does not fall.', '🧱'], ['The angry wolf climbs down the chimney.', '🐺'], ['Splash! He lands in a big tub of cold water!', '💦'],
    ['The wet wolf runs into the woods.', '🌲'], ['The three pigs live happily in the brick house.', '🏠']] },
  { id: 110, stage: 5, plus: true, title: 'The Sun and the Wind', cover: '☀️', pages: [
    ['The Sun and the Wind live high in the sky.', '☀️'], ['I am stronger than you! says the Wind.', '🌬️'], ['No, I am stronger! says the Sun.', '☀️'], ['Then they see a man walking on the road.', '🚶'],
    ['He is wearing a long brown coat.', '🧥'], ['Who can take off his coat? asks the Sun.', '🤔'], ['The Wind goes first.', '🌬️'], ['He blows hard. Whoosh!', '💨'],
    ['The trees shake and the leaves fly.', '🍃'], ['The man feels cold.', '🥶'], ['He holds his coat tight.', '🧥'], ['The Wind blows harder and harder.', '💨'],
    ['But the man holds his coat even tighter.', '🧥'], ['At last, the Wind is tired, and he stops.', '😮‍💨'], ['Now it is the Sun\'s turn.', '☀️'], ['The Sun smiles and shines softly.', '😊'],
    ['The air gets nice and warm.', '🌤️'], ['The man opens his coat.', '🧥'], ['The Sun shines brighter and brighter.', '☀️'], ['Now the man is very hot.', '🥵'],
    ['He takes off his coat and rests under a tree.', '🌳'], ['The warm, gentle Sun wins!', '🏆']] },
  { id: 111, stage: 6, plus: true, title: 'Whose Tail Is This?', cover: '🦚', pages: [
    ['Many animals have tails.', '🐾'], ['Whose tail is this?', '❓'], ['It is fluffy and has black rings.', '🔍'], ['It is a raccoon\'s tail!', '🦝'],
    ['Whose tail is this?', '❓'], ['It is big and very colorful.', '🌈'], ['It is a peacock\'s tail!', '🦚'], ['Why does he open his tail?', '🤔'],
    ['He wants to show off his pretty feathers.', '🦚'], ['Whose tail is this?', '❓'], ['It is long and it can hold a branch.', '🌿'], ['It is a monkey\'s tail!', '🐒'],
    ['How does he use it?', '🤔'], ['It helps him hang from the trees.', '🌳'], ['Whose tail is this?', '❓'], ['It is short and round like a cotton ball.', '⚪'],
    ['It is a rabbit\'s tail!', '🐰'], ['Whose tail is this?', '❓'], ['It is flat and wide.', '🔍'], ['It is a beaver\'s tail!', '🦫'],
    ['Do I have a tail? No, I don\'t!', '🧒'], ['But I can wiggle when I dance!', '💃']] },
  { id: 112, stage: 6, plus: true, title: 'Where Does Bread Come From?', cover: '🍞', pages: [
    ['I eat toast every morning.', '🍞'], ['Where does bread come from?', '🤔'], ['It comes from the bakery.', '🥖'], ['Who makes the bread?', '❓'],
    ['The baker makes it early in the morning.', '👩‍🍳'], ['What does the baker use?', '❓'], ['She uses flour, water, and salt.', '🧂'], ['Where does flour come from?', '🤔'],
    ['It comes from a mill.', '🏭'], ['What happens at the mill?', '❓'], ['A big machine turns wheat into soft flour.', '⚙️'], ['Where does wheat come from?', '🤔'],
    ['It grows in a big field on a farm.', '🌾'], ['Who plants the wheat?', '❓'], ['A farmer grows it.', '👨‍🌾'], ['When is the wheat ready?', '📅'],
    ['In summer, the wheat turns gold.', '🌾'], ['Then the farmer cuts it with a big machine.', '🚜'], ['How does the wheat get to the mill?', '❓'], ['A truck takes it there.', '🚚'],
    ['So many people help make my bread!', '🤝'], ['Thank you, everyone! Yum!', '😋']] },
  { id: 113, stage: 7, plus: true, title: 'The Butterfly', cover: '🦋', pages: [
    ['Last spring, our teacher showed us a little green leaf.', '🍃'], ['There was a tiny caterpillar on it!', '🐛'], ['We put it in a big glass jar with fresh leaves.', '🫙'], ['Every day, we gave it more leaves.', '🍃'],
    ['The caterpillar munched and munched.', '🐛'], ['It grew bigger and bigger.', '🐛'], ['One morning, it stopped eating.', '🤔'], ['It hung upside down from a stick.', '🙃'],
    ['Then it made a hard green case around itself.', '🟢'], ['It is resting inside, said our teacher.', '🤫'], ['We waited and waited.', '⏳'], ['Every day, we looked at the jar.', '👀'],
    ['Then one day, the case started to shake!', '😮'], ['Something came out very slowly.', '👀'], ['It had wet, folded wings.', '🦋'], ['Soon its wings were wide open.', '🦋'],
    ['They were orange and black.', '🧡'], ['It was a beautiful butterfly!', '🦋'], ['We all shouted, Wow!', '😲'], ['The next day, we took the jar outside.', '🌳'],
    ['Our teacher opened the lid.', '🫙'], ['The butterfly flew up into the sky.', '🦋'], ['We waved goodbye.', '👋'], ['I still think about our butterfly.', '💭']] },
  { id: 114, stage: 7, plus: true, title: 'The School Play', cover: '🎭', pages: [
    ['Last month, our class did a play.', '🎭'], ['It was about a big forest.', '🌲'], ['I was a tree.', '🌳'], ['At first, I was sad. I wanted to be the king.', '👑'],
    ['But my teacher said, Every part is important.', '👩‍🏫'], ['Mom made my costume.', '✂️'], ['It had green paper leaves.', '🍃'], ['We practiced every day after lunch.', '🗓️'],
    ['I had only one line.', '☝️'], ['It was, The wind is coming!', '🌬️'], ['On the day of the play, my hands were shaking.', '😰'], ['There were so many people!', '👥'],
    ['I saw Mom and Dad in the front.', '👀'], ['Dad waved at me.', '👋'], ['When my turn came, I took a deep breath.', '😮‍💨'], ['I said my line loud and clear.', '📣'],
    ['Then I waved my arms like branches in the wind.', '🌳'], ['Some people in the front smiled.', '😊'], ['At the end, we all bowed.', '🙇'], ['Everyone clapped and clapped.', '👏'],
    ['After the play, Dad gave me flowers.', '💐'], ['You were the best tree ever! he said.', '🌳'], ['I felt so proud.', '😊'], ['Now I want to be in another play!', '🎭']] },
  { id: 115, stage: 8, plus: true, title: 'The Cooking Contest', cover: '🍳', pages: [
    ['Next Friday, there will be a cooking contest at school.', '🍳'], ['My friend Noah and I are going to be a team.', '🤝'], ['We are going to make bibimbap.', '🥗'], ['It is a Korean rice bowl with lots of vegetables.', '🍚'],
    ['I will bring carrots and spinach.', '🥕'], ['Noah will bring mushrooms and bean sprouts.', '🍄'], ['Mom is going to help me cut the carrots.', '🔪'], ['Our teacher says we can wear white cooking hats.', '👨‍🍳'],
    ['Our teacher will cook the eggs at school.', '🍳'], ['First, we will put warm rice in a big bowl.', '🍚'], ['Then we will add the vegetables in a circle.', '🥗'], ['It is going to look like a rainbow!', '🌈'],
    ['Next, we will put an egg on top.', '🍳'], ['Last, we will add a little red pepper paste.', '🌶️'], ['But Noah does not like spicy food.', '😖'], ['So we will make one more bowl without the red paste.', '🥣'],
    ['The judges will taste every dish.', '🥄'], ['They will choose the best one.', '🏆'], ['Maybe we will win a prize.', '🥇'], ['Maybe we will not.', '🤷'],
    ['But it will be fun to cook with my friend.', '😊'], ['And we will eat our bibimbap together!', '🥢'], ['I hope Friday comes soon!', '📅'], ['Let\'s do our best, Noah!', '💪']] },
  { id: 116, stage: 8, plus: true, title: 'A Day in Seoul', cover: '🏯', pages: [
    ['This Saturday, my family is going to visit Seoul.', '🏙️'], ['Seoul is a big city with many people.', '🏙️'], ['We will take the subway there.', '🚇'], ['First, we are going to visit an old palace.', '🏯'],
    ['Long ago, kings and queens lived there.', '👑'], ['We will wear hanbok at the palace.', '👘'], ['My hanbok is going to be blue.', '💙'], ['My little sister will wear a pink one.', '💗'],
    ['Dad will take lots of pictures of us.', '📷'], ['Then we will eat lunch at a busy market.', '🏪'], ['We are going to try hot dumplings.', '🥟'], ['After lunch, we will walk up a green mountain.', '⛰️'],
    ['At the top, there is a tall tower.', '🗼'], ['We will go up the tower in a fast elevator.', '🛗'], ['From the top, we will see the whole city!', '👀'], ['The cars will look like tiny toys.', '🚗'],
    ['We are going to buy a key ring for Grandma.', '🔑'], ['When it gets dark, the city lights will turn on.', '🌃'], ['They will sparkle like stars.', '✨'], ['Then we will take the subway home.', '🚇'],
    ['My sister will fall asleep on the way.', '😴'], ['I think I will be tired, too.', '🥱'], ['But it is going to be a wonderful day!', '🌟'], ['I will tell Grandma all about it.', '👵']] },
  { id: 117, stage: 1, plus: true, title: 'ABC Pond', cover: '🦢', pages: [
    ['N is for newt.', '🦎'], ['O is for otter.', '🦦'], ['P is for pebble.', '🪨'], ['Q is for quack.', '🦆'],
    ['R is for raft.', '🛶'], ['S is for swan.', '🦢'], ['T is for tadpole.', '🐸'], ['U is for upside down.', '🙃'],
    ['V is for vine.', '🌿'], ['W is for willow.', '🌳'], ['Ox ends with X.', '🐂'], ['Y is for yummy.', '😋'],
    ['Z is for zoom.', '💨'], ['I sit by the pond.', '🏞️'], ['I see little tadpoles.', '🐸'], ['Soon they will be frogs!', '🐸']] },
  { id: 118, stage: 2, plus: true, title: 'A Fish Wish', cover: '🐟', pages: [
    ['Pip is a little fish.', '🐟'], ['Pip lives in a dish.', '🥣'], ['The dish is very small.', '🥣'], ['Pip swims in a ring.', '🔄'],
    ['Swish, swish, swish!', '💦'], ['Pip is not happy.', '😢'], ['Pip makes a wish.', '⭐'], ['I wish I could swim in big water!', '🌊'],
    ['Liz looks at Pip.', '👧'], ['Liz gets a big fish tank.', '🐠'], ['She fills it with water.', '💧'], ['She tips the dish.', '🥣'],
    ['Pip slips into the tank!', '💦'], ['Pip swims and spins.', '🐟'], ['Pip has new fish friends.', '🐠'], ['Pip got his wish!', '⭐']] },
  { id: 119, stage: 3, plus: true, title: 'My Best Friend', cover: '👭', pages: [
    ['This is my best friend.', '👭'], ['Her name is Lucy.', '👧'], ['She is seven years old.', '7️⃣'], ['She has long curly hair.', '👧'],
    ['She has a red backpack.', '🎒'], ['She can jump rope.', '🪢'], ['She can jump very fast.', '💨'], ['I can jump rope, too.', '🪢'],
    ['We like the same song.', '🎵'], ['We sing it together.', '🎤'], ['We like the same snack.', '🍿'], ['It is popcorn!', '🍿'],
    ['Lucy has a big smile.', '😁'], ['She can draw cute cats.', '🐱'], ['I can draw fast cars.', '🚗'], ['We show our pictures to each other.', '🖼️'],
    ['Sometimes we are not happy.', '😠'], ['But we say sorry fast.', '🤝'], ['Lucy is my best friend.', '💕'], ['I am her best friend, too!', '💕']] },
  { id: 120, stage: 4, plus: true, title: 'At the Pool', cover: '🏊', pages: [
    ['Let\'s go to the pool!', '🏊'], ['Can you swim?', '❓'], ['A little. I can float.', '🛟'], ['Put on your goggles.', '🥽'],
    ['Okay! Are they on right?', '🥽'], ['Yes. Now hold the side.', '👐'], ['Is the water cold?', '💧'], ['A little. Get in slowly.', '🪜'],
    ['Oh! It is so cold!', '🥶'], ['You will be warm soon.', '☀️'], ['Let\'s kick our legs!', '🦵'], ['Kick, kick, kick!', '💦'],
    ['You are doing great!', '👍'], ['Can I let go now?', '❓'], ['Hold my hands first.', '🤝'], ['Look! I am swimming!', '🏊'],
    ['Good job!', '👏'], ['Let\'s take a break.', '⏸️'], ['Here is your towel.', '🧺'], ['Thank you! Swimming is fun!', '😄']] },
  { id: 121, stage: 5, plus: true, title: 'The Magic Paintbrush', cover: '🖌️', pages: [
    ['Long ago, a poor boy named Lin loves to draw.', '👦'], ['But he has no paintbrush.', '😢'], ['He draws with a stick in the sand.', '✏️'], ['One night, a kind old man gives him a golden brush.', '🖌️'],
    ['Use it to help people, says the old man.', '👴'], ['Lin paints a little blue bird.', '🐦'], ['Flap, flap! The bird flies off the paper!', '🐦'], ['The brush is magic!', '✨'],
    ['Lin sees a hungry family.', '👨‍👩‍👧'], ['He paints a big bowl of warm rice.', '🍚'], ['The rice is real, and they eat it all.', '😋'], ['An old farmer has no water.', '🌾'],
    ['Lin paints a cool, clear river.', '🏞️'], ['Now the farmer\'s plants are green and tall.', '🌱'], ['A greedy man hears about the brush.', '😠'], ['Paint me a mountain of gold! he shouts.', '💰'],
    ['Lin paints a gold mountain far across the sea.', '⛰️'], ['Then he paints a boat for the greedy man.', '⛵'], ['The man sails away fast to get the gold.', '⛵'], ['Lin paints a big wind.', '🌬️'],
    ['The strong wind blows the boat far, far away.', '💨'], ['Lin keeps helping people with his magic brush.', '🖌️']] },
  { id: 122, stage: 5, plus: true, title: 'The Thirsty Crow', cover: '🐦‍⬛', pages: [
    ['The summer sun is hot, and the land is dry.', '☀️'], ['A black crow is very thirsty.', '🐦‍⬛'], ['She flies and flies, looking for water.', '🪽'], ['The ponds are all dry.', '🏜️'],
    ['At last, she sees a tall glass jug.', '🫙'], ['There is a little water at the bottom.', '💧'], ['The crow puts her beak inside.', '🐦‍⬛'], ['But her beak is too short.', '😣'],
    ['She cannot reach the water.', '😢'], ['She tries to push the jug over.', '💪'], ['But the jug is too heavy.', '🏺'], ['The crow sits and thinks.', '🤔'],
    ['Then she sees some small stones on the ground.', '🪨'], ['She has an idea!', '💡'], ['She picks up one stone and drops it in.', '🪨'], ['Plop! The water goes up a little.', '💧'],
    ['She drops in another stone, and another.', '🪨'], ['Plop, plop, plop!', '💦'], ['The water comes up higher and higher.', '⬆️'], ['Now she can reach it!', '🐦‍⬛'],
    ['The crow drinks the cool water.', '😌'], ['A smart idea can solve a big problem.', '💡']] },
  { id: 123, stage: 6, plus: true, title: 'How Do Seeds Travel?', cover: '🌬️', pages: [
    ['Plants make many seeds.', '🌱'], ['But seeds have no legs.', '🤔'], ['How do seeds travel far away?', '❓'], ['Some seeds fly with the wind.', '🌬️'],
    ['What seed can fly?', '❓'], ['A dandelion seed can fly!', '🌼'], ['It has a soft white top like a tiny umbrella.', '☂️'], ['When does it fly?', '❓'],
    ['It flies when the wind blows.', '💨'], ['Some seeds ride on animals.', '🐕'], ['How do they hold on?', '❓'], ['They have tiny hooks that stick to fur.', '🪝'],
    ['Some seeds hide in fruit.', '🍒'], ['Who eats the fruit?', '❓'], ['A bird eats a red berry.', '🐦'], ['Where does the seed go?', '❓'],
    ['The bird flies away and drops the seed far away.', '🐦'], ['Some seeds float on water.', '🌊'], ['A coconut can float across the sea!', '🥥'], ['Why do seeds travel?', '❓'],
    ['They need room to grow into new plants.', '🌳'], ['Seeds are great travelers!', '🌍']] },
  { id: 124, stage: 6, plus: true, title: 'When Do We Say Sorry?', cover: '🙏', pages: [
    ['Some words are magic words.', '✨'], ['When do we say sorry?', '❓'], ['We say sorry when we bump into someone.', '💥'], ['Oops! I am sorry!', '🙏'],
    ['What do we say when we make a mistake?', '❓'], ['We say sorry, too.', '🙏'], ['Why do we say sorry?', '❓'], ['It shows we care about others.', '❤️'],
    ['When do we say thank you?', '❓'], ['We say thank you when someone helps us.', '🤝'], ['Who helps me at school?', '❓'], ['My teacher helps me tie my shoes. Thank you!', '👟'],
    ['Where else do I say thank you?', '❓'], ['At the store, I say thank you to the shop worker.', '🛒'], ['When do we say please?', '❓'], ['We say please when we ask for something.', '🙋'],
    ['Can I have some water, please?', '🥛'], ['How do we say these words?', '❓'], ['We say them with a kind voice and a smile.', '😊'], ['What happens when we use these words?', '❓'],
    ['People feel happy.', '😄'], ['Let\'s use our magic words every day!', '✨']] },
  { id: 125, stage: 7, plus: true, title: 'The Broken Vase', cover: '🏺', pages: [
    ['Last Saturday, it rained all day.', '🌧️'], ['I could not play outside.', '😞'], ['So I played with my ball in the living room.', '⚽'], ['Mom said, No balls in the house, please.', '🙅'],
    ['But I did not listen.', '🙉'], ['I threw the ball high into the air.', '⚽'], ['It hit Mom\'s blue vase.', '🏺'], ['Crash! The vase fell on the floor.', '💥'],
    ['It broke into big pieces.', '💔'], ['My heart beat fast.', '💓'], ['I wanted to hide the pieces.', '🙈'], ['Maybe Mom will not see it, I thought.', '🤔'],
    ['But I felt bad inside.', '😔'], ['Slowly, I went to the kitchen.', '🚶'], ['Mom was making soup.', '🍲'], ['Mom, I broke your vase, I said.', '😢'],
    ['I am very sorry.', '🙏'], ['Mom looked at me for a long time.', '👀'], ['Then she gave me a hug.', '🤗'], ['Thank you for telling me the truth, she said.', '❤️'],
    ['We cleaned up the pieces together.', '🧹'], ['Next time, I will play ball outside.', '⚽'], ['The next day, we bought a new vase.', '🏺'], ['I picked yellow flowers for it.', '🌼']] },
  { id: 126, stage: 7, plus: true, title: 'Fishing with Dad', cover: '🎣', pages: [
    ['Last Sunday, Dad and I went fishing.', '🎣'], ['We went to a quiet river.', '🏞️'], ['Dad carried two fishing rods.', '🎣'], ['I carried a small bucket.', '🪣'],
    ['We sat on a big rock by the water.', '🪨'], ['Dad showed me how to throw the line.', '🎣'], ['Plop! My hook went into the water.', '💧'], ['Then we waited.', '⏳'],
    ['The water was very still.', '🌊'], ['Nothing happened.', '😐'], ['I was a little bored.', '🥱'], ['Dad and I ate rice balls.', '🍙'],
    ['A duck swam by and quacked at us.', '🦆'], ['Suddenly, my line pulled hard!', '❗'], ['Dad, help me! I shouted.', '😮'], ['Dad helped me pull.', '💪'],
    ['Out came a tiny silver fish!', '🐟'], ['It was small and shiny.', '✨'], ['We looked at it in the bucket.', '🪣'], ['It looked a little scared.', '🐟'],
    ['Let\'s put it back, said Dad.', '👨'], ['I gently put it back in the river.', '🏞️'], ['Soon the fish was gone.', '🐟'], ['Fishing with Dad was the best!', '❤️']] },
  { id: 127, stage: 8, plus: true, title: 'Tomorrow\'s Weather', cover: '🌦️', pages: [
    ['Tonight, we are watching the weather news.', '📺'], ['Tomorrow will be Monday.', '📅'], ['It is going to rain all day.', '🌧️'], ['I will take my yellow umbrella.', '☂️'],
    ['I am going to wear my rain boots.', '👢'], ['On Tuesday, it will be cloudy.', '☁️'], ['Maybe it will not rain.', '🤔'], ['I will bring my umbrella just in case.', '☂️'],
    ['On Wednesday, it is going to be sunny.', '☀️'], ['We will go to the park after school.', '🏞️'], ['I am going to play on the slide.', '🛝'], ['On Thursday, it will be windy.', '🌬️'],
    ['I will hold on to my hat.', '🧢'], ['On Friday, it is going to be very cold.', '🥶'], ['I will wear my warm coat and gloves.', '🧤'], ['Maybe it will snow on Saturday!', '❄️'],
    ['I am going to make a snow angel.', '👼'], ['On Sunday, the sun will come out again.', '🌤️'], ['Our family will wash the car together.', '🚗'], ['Will the weather news be right?', '❓'],
    ['I hope so!', '🤞'], ['I will look at the sky every morning.', '🌅'], ['Rain or shine, I will have fun.', '🌈'], ['What will the weather be tomorrow?', '🌦️']] },
  { id: 128, stage: 8, plus: true, title: 'The Art Show', cover: '🎨', pages: [
    ['Next month, our school will have an art show.', '🎨'], ['Every student is going to make one picture.', '🖼️'], ['Our pictures will hang on the wall in the hall.', '🖼️'], ['What am I going to draw?', '🤔'],
    ['I will draw my family.', '👨‍👩‍👦'], ['Mom, Dad, my baby brother, and me.', '👪'], ['I am going to use bright colors.', '🖍️'], ['Dad will have a big smile.', '😁'],
    ['Mom will wear her red scarf.', '🧣'], ['My little brother will hold his toy bear.', '🧸'], ['I will paint a big yellow sun in the sky.', '☀️'], ['My friend Ryan is going to paint the sea.', '🌊'],
    ['Our teacher will help us.', '👩‍🏫'], ['We are going to practice every Friday.', '📅'], ['On the day of the show, my family will come.', '👪'], ['They will walk around and look at the art.', '🚶'],
    ['Grandma will come, too.', '👵'], ['She will take a photo of my picture.', '📷'], ['Maybe my brother will find himself in it!', '👶'], ['I will tell them about my picture.', '🗣️'],
    ['I am going to be so proud.', '😊'], ['After the show, we will take my picture home.', '🏠'], ['We will put it on our wall.', '🖼️'], ['Art makes everyone happy!', '🎨']] },
];
const FREE_BOOKS = STORIES.filter(s => s.stage <= 2 && !s.plus).length;

// 학습 기간 안내: 남은 레슨 수와 하루 레슨 수로 주 5일 기준 기간을 계산
const studyWeeks = (lessons, perDay = 1, daysPerWeek = 5) => Math.ceil(lessons / (perDay * daysPerWeek));
const durationText = weeks => weeks >= 52 ? `약 ${Math.round(weeks / 52 * 10) / 10}년` : weeks >= 8 ? `약 ${Math.round(weeks / 4.3)}개월` : `약 ${weeks}주`;

// 알파벳은 이름으로 읽게 바꿔서 보낸다. 엔진이 "A is for apple"의 A, 철자 "c, a, t"의 a를
// 관사 a(어)로 읽는 일이 많아서. 화면 글자와 채점 문장은 그대로 두고 소리만 바꾼다.
const LETTER_NAMES = { A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'jee', H: 'aitch', I: 'eye', J: 'jay', K: 'kay', L: 'el', M: 'em',
  N: 'en', O: 'oh', P: 'pee', Q: 'cue', R: 'ar', S: 'ess', T: 'tee', U: 'you', V: 'vee', W: 'double you', X: 'ex', Y: 'why', Z: 'zee' };
const nameOf = l => LETTER_NAMES[l.toUpperCase()] || l;
// 이름 소리가 비슷한 글자 (B·D·P처럼 '-이'로 끝나는 글자 등) — 듣고 고르는 문제에서 같은 묶음끼리는 보기로 함께 내지 않는다
const LETTER_RHYME = ['BCDEGPTVZ', 'AHJK', 'IY', 'MN', 'FLSX', 'QUW'];
const soundAlike = (a, b) => LETTER_RHYME.some(g => g.includes(a.toUpperCase()) && g.includes(b.toUpperCase()));
const letterOthers = (ans, n) => shuffle(LETTERS.map(l => l.letter).filter(l => l !== ans && !soundAlike(l, ans))).slice(0, n);
// 스토리북 '천천히' 읽기의 마디: 쉼표·마침표에서, 아니면 3단어마다 끊는다 (마지막에 한 단어만 남지 않게).
// 화면과 AI 음성 미리 만들기가 같은 마디를 쓴다. 단어 번호 묶음을 돌려준다.
function storyChunks(text) {
  const ws = text.split(' '), groups = []; let cur = [];
  ws.forEach((w, k) => {
    cur.push(k);
    const left = ws.length - k - 1;
    if (/[,.!?]$/.test(w) || (cur.length >= 3 && left !== 1) || left === 0) { groups.push(cur); cur = []; }
  });
  // 마디가 관사로 끝나면('I heard a') AI 음성이 a를 '에이'로 강하게 읽어서, 관사는 다음 마디 앞으로 옮긴다 ('I heard' / 'a big dog')
  for (let i = 0; i < groups.length - 1; i++) {
    const g = groups[i], last = g[g.length - 1];
    if (g.length > 1 && /^(a|an|the)$/i.test(ws[last])) groups[i + 1].unshift(g.pop());
  }
  return groups;
}
// 스토리북에서 단어 하나를 읽을 소리: 'A cat sat'의 A는 관사라서 'a'(어)로, 'A is for apple'의 A만 글자 이름(에이)으로
const isLetterLine = text => /^[A-Z] is for |ends with [A-Z]\.?$/.test(text);
// 과거형 read는 문장 전체를 보고 가린다 (아래 pastRead) — 마디·단어만 따로 들어도 '레드'로 읽게 철자 red로 보낸다
const storyWord = (text, w, k = text.split(' ').indexOf(w)) => {
  const x = w.replace(/[.,!?]/g, '');
  if (x === 'A' && !isLetterLine(text)) return 'a';
  return /^read$/i.test(x) && pastRead(text, k) ? x.replace(/ea/, 'e') : x;
};
const chunkSay = (text, g) => g.map(k => storyWord(text, text.split(' ')[k], k)).join(' ');
// read(리드)와 과거형 read(레드)는 철자가 같아서 AI 음성도 기기 목소리도 자주 틀린다.
// 과거로 읽을 자리면 소리가 같은 철자 red로 바꿔 보낸다 (화면 글자와 채점 문장은 그대로).
//  - 같은 마디에 to·will·can·do 같은 말이 있으면 현재 (I like to read. / Where do we read?)
//  - he·she·Mina·Grandma처럼 한 사람 뒤의 read는 과거 (현재라면 reads라고 쓰니까)
//  - I·we·you·they 뒤에서는 문장에 yesterday·last·ago나 다른 과거형(drank·went…)이 있거나,
//    한국어 뜻이 '읽었어요'이거나, 지난 일을 이야기하는 동화의 한 쪽이면 과거
const PAST_FORMS = new Set(VERBS.map(v => v[1]).filter(p => !/^(read|put|cut|hit|let|set)$/.test(p)).concat(['was', 'were', 'went']));
const plainWords = t => t.toLowerCase().split(' ').map(w => w.replace(/[^a-z']/g, ''));
let pastLines = null;
function pastContext() {
  if (pastLines) return pastLines;
  pastLines = new Set();
  for (const [en, ko] of Object.values(SENTENCES).flat()) if (/읽었/.test(ko)) pastLines.add(en);
  for (const [q, a, ko] of Object.values(QA).flat()) if (/읽었/.test(ko)) { pastLines.add(a); pastLines.add(`${q} ${a}`); }
  // 과거형 동사가 세 쪽 넘게 나오는 동화는 지난 일을 이야기하는 책
  for (const s of STORIES) if (s.pages.filter(([t]) => plainWords(t).some(w => PAST_FORMS.has(w))).length >= 3) s.pages.forEach(([t]) => pastLines.add(t));
  return pastLines;
}
function pastRead(text, k) {
  const ws = text.split(' '), low = plainWords(text);
  if (!/^read$/.test(low[k] || '') || k === 0) return false;
  if (/^read, read$/i.test(text.trim())) return k === 1; // 동사 원형, 과거형 짝
  let from = k; while (from > 0 && !/[,.!?]$/.test(ws[from - 1])) from--;
  if (low.slice(from, k).some(w => /^(to|will|can|could|should|must|would|do|does|did|don't|didn't|let's|cannot|can't|won't|i'll|we'll|you'll)$/.test(w))) return false;
  if (!/^(i|you|we|they)$/.test(low[k - 1])) return true;
  return low.some(w => /^(yesterday|last|ago)$/.test(w) || PAST_FORMS.has(w)) || pastContext().has(text.trim());
}
const pastReadText = t => { const ws = String(t).split(' '); return ws.map((w, k) => (/^read[.,!?]*$/i.test(w) && pastRead(t, k) ? w.replace(/ea/, 'e') : w)).join(' '); };
// 그림이 비슷해서 헷갈리는 단어 묶음 — 같은 문제의 보기로 함께 나오지 않게 한다
const LOOKALIKE = [['insect', 'bug'], ['hat', 'cap'], ['jet', 'airplane'], ['van', 'bus', 'car', 'cab', 'truck'], ['mom', 'dad', 'kid'],
  ['pot', 'pan', 'cup', 'can', 'dish'], ['rock', 'log'], ['bear', 'panda'], ['duck', 'chick', 'hen'], ['rat', 'mouse'], ['orange', 'lemon'],
  ['tomato', 'apple'], ['lip', 'teeth', 'nose'], ['bed', 'bath'], ['frog', 'iguana'], ['ice', 'cheese']];
const lookGroup = w => LOOKALIKE.findIndex(g => g.includes(w));
// 그림 보기 고르기: 정답과 (그리고 서로) 그림이 같거나 비슷한 단어는 빼고 n개
function pictureOthers(pool, n, ans) {
  const out = [], pics = new Set([ans.emoji]), groups = new Set([lookGroup(ans.en)]);
  for (const w of shuffle(pool)) {
    if (out.length >= n) break;
    const g = lookGroup(w.en);
    if (w.en === ans.en || pics.has(w.emoji) || (g >= 0 && groups.has(g))) continue;
    out.push(w); pics.add(w.emoji); groups.add(g);
  }
  return out;
}
function speechText(t) {
  const x = pastReadText(String(t).trim());
  if (/^[A-Z]$/.test(x)) return nameOf(x);                                                 // "A" (소문자 a 한 글자는 관사일 수 있어 그대로)
  if (/^([A-Za-z], )+[A-Za-z]\.\s/.test(x)) {                                              // "c, a, t. cat"
    const cut = x.indexOf('. ');
    return x.slice(0, cut).split(', ').map(nameOf).join(', ') + x.slice(cut);
  }
  if (/^[A-Za-z], /.test(x)) return x.split(', ').map(w => /^[A-Za-z]$/.test(w) ? nameOf(w) : w).join(', '); // "A, a, apple" 
  return x.replace(/(^|[.!?] )([A-Z]) is for /, (m, p, l) => `${p}${nameOf(l)}, is for `)  // "A is for apple." (문장 가운데도: "Hello! A is for apple.")
          .replace(/ ends with ([A-Z])\.?$/, (m, l) => ` ends with ${nameOf(l)}.`)          // "box ends with X"
          .replace(/^([A-Z]), ([A-Z])$/, (m, a, b) => `${nameOf(a)}, ${nameOf(b)}`);
}

// 같은 그림체로 미리 그린 그림 (img/manifest.json, server/scripts/pregen-img.js 로 만든다).
// 그림이 있는 이모지는 그림으로 바꿔 보여주고, 없으면 이모지를 그대로 둔다. 글자(이미 esc 한 html)에만 쓴다.
const PICS = { w: {}, s: {}, i: {}, c: {}, a: {}, x: {}, re: null };
function setPics(m) {
  PICS.w = (m && m.w) || {}; PICS.s = (m && m.s) || {}; PICS.i = (m && m.i) || {}; PICS.c = (m && m.c) || {};
  PICS.a = (m && m.a) || {}; PICS.x = (m && m.x) || {};
  const keys = Object.keys(PICS.w).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  PICS.re = keys.length ? new RegExp(keys.join('|'), 'gu') : null;
}
const pic = html => (PICS.re ? String(html).replace(PICS.re, e => `<img class="pic" src="img/${PICS.w[e]}" alt="" draggable="false">`) : html);
// 메뉴·버튼 아이콘: 그린 그림이 있으면 그림, 없으면 이모지
const ico = e => PICS.i[e] ? `<img class="ico" src="img/${PICS.i[e]}" alt="" draggable="false">` : e;
// 책장 표지: 책마다 그린 표지, 없으면 이모지
const bookCover = s => PICS.c[s.id] ? `<img src="img/${PICS.c[s.id]}" alt="" draggable="false">` : s.cover;
// 캐릭터 얼굴: 그린 둥근 얼굴, 없으면 이모지 (헤더·캐릭터 고르기처럼 꾸미기 없이 작게 보일 때)
const avaFace = e => PICS.a[e] ? `<img class="ava-mini" src="img/${PICS.a[e]}" alt="" draggable="false">` : e;
const storyPic = (id, i) => PICS.s[`${id}-${i}`] ? `img/${PICS.s[`${id}-${i}`]}` : null;
