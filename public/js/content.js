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
    ['ten', '🔟', '열'], ['red', '🟥', '빨간'], ['pig', '🐷', '돼지'], ['pin', '📌', '핀'], ['six', '6️⃣', '여섯'], ['lip', '👄', '입술']],
  D: [ // 짧은 o · 짧은 u · sh · ch · th
    ['dog', '🐶', '개'], ['box', '📦', '상자'], ['fox', '🦊', '여우'], ['pot', '🍲', '냄비'], ['log', '🪵', '통나무'], ['frog', '🐸', '개구리'],
    ['sock', '🧦', '양말'], ['rock', '🪨', '바위'], ['mom', '👩', '엄마'], ['sun', '☀️', '해'], ['bus', '🚌', '버스'], ['cup', '☕', '컵'],
    ['bug', '🐛', '벌레'], ['nut', '🥜', '견과'], ['duck', '🦆', '오리'], ['drum', '🥁', '북'], ['truck', '🚚', '트럭'], ['ship', '🚢', '배'],
    ['fish', '🐟', '물고기'], ['shell', '🐚', '조개'], ['chick', '🐤', '병아리'], ['lunch', '🍱', '점심'], ['bath', '🛁', '목욕'], ['thumb', '👍', '엄지']],
  E: [ // 긴 모음: 매직 e (a_e · i_e · o_e · u_e) · 모음 짝 (ee · ea · ai · oa)
    ['cake', '🎂', '케이크'], ['snake', '🐍', '뱀'], ['plane', '✈️', '비행기'], ['kite', '🪁', '연'], ['bike', '🚲', '자전거'], ['five', '5️⃣', '다섯'],
    ['nine', '9️⃣', '아홉'], ['smile', '😊', '미소'], ['rose', '🌹', '장미'], ['bone', '🦴', '뼈'], ['home', '🏠', '집'], ['nose', '👃', '코'],
    ['cube', '🧊', '큐브'], ['tree', '🌳', '나무'], ['bee', '🐝', '벌'], ['feet', '🦶', '발'], ['sheep', '🐑', '양'], ['leaf', '🍃', '나뭇잎'],
    ['rain', '🌧️', '비'], ['train', '🚆', '기차'], ['snail', '🐌', '달팽이'], ['boat', '⛵', '배'], ['goat', '🐐', '염소'], ['soap', '🧼', '비누']],
};

// 문장 은행: [영어, 뜻, 그림]
const SENTENCES = {
  3: [
    // F: be동사 · this/that
    ['This is a cat.', '이것은 고양이예요.', '🐱'], ['That is a dog.', '저것은 개예요.', '🐶'], ['It is a big dog.', '그것은 큰 개예요.', '🐕'],
    ['I am happy.', '나는 행복해요.', '😊'], ['I am six.', '나는 여섯 살이에요.', '6️⃣'], ['You are my friend.', '너는 내 친구야.', '🤝'],
    ['She is my mom.', '그녀는 우리 엄마예요.', '👩'], ['He is my dad.', '그는 우리 아빠예요.', '👨'], ['We are kids.', '우리는 어린이예요.', '🧒'],
    ['It is a pen.', '그것은 펜이에요.', '🖊️'], ['That is my bag.', '저것은 내 가방이에요.', '🎒'], ['This is my hat.', '이것은 내 모자예요.', '🎩'],
    ['It is red.', '그것은 빨간색이에요.', '🔴'], ['The sun is hot.', '해가 뜨거워요.', '☀️'], ['The cup is blue.', '컵이 파래요.', '🥤'],
    ['It is a fish.', '그것은 물고기예요.', '🐟'], ['I am a boy.', '나는 남자아이예요.', '👦'], ['I am a girl.', '나는 여자아이예요.', '👧'],
    ['They are my toys.', '그것들은 내 장난감이에요.', '🧸'], ['This is a book.', '이것은 책이에요.', '📕'],
    // G: have · like · see
    ['I like apples.', '나는 사과를 좋아해요.', '🍎'], ['I like milk.', '나는 우유를 좋아해요.', '🥛'], ['I have a red ball.', '나는 빨간 공이 있어요.', '🔴'],
    ['I see a bird.', '나는 새를 봐요.', '🐦'], ['I have a pet.', '나는 애완동물이 있어요.', '🐹'], ['I like cats.', '나는 고양이를 좋아해요.', '🐈'],
    ['She has a doll.', '그녀는 인형이 있어요.', '👧'], ['He has a bike.', '그는 자전거가 있어요.', '🚲'], ['We like ice cream.', '우리는 아이스크림을 좋아해요.', '🍦'],
    ['I see a big tree.', '나는 큰 나무를 봐요.', '🌳'], ['I have two hands.', '나는 손이 두 개 있어요.', '🙌'], ['I like my school.', '나는 우리 학교를 좋아해요.', '🏫'],
    ['They have a car.', '그들은 차가 있어요.', '🚗'], ['I see the moon.', '나는 달을 봐요.', '🌙'], ['I like to read.', '나는 읽는 것을 좋아해요.', '📖'],
    ['She likes pink.', '그녀는 분홍색을 좋아해요.', '🌸'], ['He likes trains.', '그는 기차를 좋아해요.', '🚆'], ['I have a little sister.', '나는 여동생이 있어요.', '👧'],
    ['We see the stars.', '우리는 별을 봐요.', '⭐'], ['I like rainy days.', '나는 비 오는 날을 좋아해요.', '🌧️'],
    // H: can · 위치 · 복수
    ['We can run.', '우리는 달릴 수 있어요.', '🏃'], ['I can jump.', '나는 뛸 수 있어요.', '🦘'], ['I can swim.', '나는 수영할 수 있어요.', '🏊'],
    ['A bird can fly.', '새는 날 수 있어요.', '🐦'], ['A fish can swim.', '물고기는 헤엄칠 수 있어요.', '🐟'], ['I can sing a song.', '나는 노래를 부를 수 있어요.', '🎤'],
    ['The cat is on the bed.', '고양이가 침대 위에 있어요.', '🛏️'], ['The ball is in the box.', '공이 상자 안에 있어요.', '📦'], ['The dog is under the table.', '개가 탁자 밑에 있어요.', '🐕'],
    ['I see three ducks.', '나는 오리 세 마리를 봐요.', '🦆'], ['There are two cats.', '고양이가 두 마리 있어요.', '🐱'], ['The apples are red.', '사과들이 빨개요.', '🍎'],
    ['My shoes are new.', '내 신발은 새것이에요.', '👟'], ['Look at the frog.', '개구리를 봐요.', '🐸'], ['Open the door.', '문을 열어요.', '🚪'],
    ['Sit down, please.', '앉아 주세요.', '🪑'], ["Let's play together.", '같이 놀자.', '🤸'], ['It is time to sleep.', '잘 시간이에요.', '😴'],
    ['I can ride a bike.', '나는 자전거를 탈 수 있어요.', '🚲'], ['Wash your hands.', '손을 씻어요.', '🧼'],
  ],
  5: [
    // M: 색깔 · 크기 · 모양
    ['The big bear is brown.', '큰 곰은 갈색이에요.', '🐻'], ['I have a small yellow duck.', '나는 작은 노란 오리가 있어요.', '🦆'], ['The tall tree is green.', '키 큰 나무는 초록색이에요.', '🌳'],
    ['Her dress is purple.', '그녀의 드레스는 보라색이에요.', '👗'], ['The long train is fast.', '긴 기차는 빨라요.', '🚆'], ['The tiny ant is black.', '작은 개미는 검은색이에요.', '🐜'],
    ['I want the big red apple.', '나는 큰 빨간 사과를 원해요.', '🍎'], ['The little cat is soft.', '작은 고양이는 부드러워요.', '🐈'], ['My new shoes are white.', '내 새 신발은 하얀색이에요.', '👟'],
    ['The old car is slow.', '그 낡은 차는 느려요.', '🚗'], ['The giraffe has a long neck.', '기린은 목이 길어요.', '🦒'], ['The mouse has small ears.', '쥐는 귀가 작아요.', '🐭'],
    ['The ocean is deep and blue.', '바다는 깊고 파래요.', '🌊'], ['The snowman is round and white.', '눈사람은 둥글고 하얘요.', '⛄'], ['The pumpkin is big and orange.', '호박은 크고 주황색이에요.', '🎃'],
    ['The grass is short and green.', '잔디는 짧고 초록색이에요.', '🌱'],
    // N: 사람 · 감정
    ['My sister is very kind.', '우리 언니는 아주 친절해요.', '👧'], ['He is strong and brave.', '그는 힘세고 용감해요.', '💪'], ['I feel sleepy today.', '나는 오늘 졸려요.', '😴'],
    ['I am a little scared.', '나는 조금 무서워요.', '😨'], ['The old man is funny.', '그 할아버지는 재미있어요.', '👴'], ['She is happy and excited.', '그녀는 기쁘고 신이 나요.', '🤩'],
    ['My brother is angry.', '우리 형은 화가 났어요.', '😠'], ['The baby is cute and small.', '아기는 귀엽고 작아요.', '👶'], ['My teacher is smart.', '우리 선생님은 똑똑해요.', '🧑‍🏫'],
    ['I feel nervous before the test.', '나는 시험 전에 긴장돼요.', '😬'], ['Our coach is tall and fast.', '우리 코치님은 키가 크고 빨라요.', '🏃'], ['The girl looks surprised.', '그 여자아이는 놀란 것 같아요.', '😲'],
    ['My friend is shy.', '내 친구는 수줍음이 많아요.', '😊'], ['Grandma is gentle and warm.', '할머니는 다정하고 따뜻해요.', '👵'], ['The clown is silly.', '광대는 우스꽝스러워요.', '🤡'],
    ['I am proud of you.', '나는 네가 자랑스러워.', '🏅'],
    // O: 맛 · 촉감 · 날씨 · 소리
    ['The soup is too hot.', '수프가 너무 뜨거워요.', '🍲'], ['This cake is so sweet.', '이 케이크는 정말 달아요.', '🍰'], ['The lemon is sour.', '레몬은 셔요.', '🍋'],
    ['The ice is cold and hard.', '얼음은 차갑고 단단해요.', '🧊'], ['The pillow is soft.', '베개는 부드러워요.', '🛏️'], ['The sky is dark.', '하늘이 어두워요.', '🌌'],
    ['It is windy today.', '오늘은 바람이 불어요.', '🌬️'], ['It is a sunny day.', '화창한 날이에요.', '☀️'], ['The chips are salty.', '감자칩은 짜요.', '🍟'],
    ['The rock is heavy.', '돌은 무거워요.', '🪨'], ['The feather is light.', '깃털은 가벼워요.', '🪶'], ['The road is wet after the rain.', '비가 온 뒤 길이 젖었어요.', '🌧️'],
    ['The flowers smell nice.', '꽃들이 좋은 냄새가 나요.', '🌸'], ['The music is loud.', '음악 소리가 커요.', '🔊'], ['The library is quiet.', '도서관은 조용해요.', '📚'],
    ['The kitten is warm and fuzzy.', '아기 고양이는 따뜻하고 보송보송해요.', '🐱'],
    // P: 비교 · 장소
    ['My room is clean.', '내 방은 깨끗해요.', '🛏️'], ['The flowers are pretty.', '꽃들이 예뻐요.', '🌸'], ['An elephant is bigger than a dog.', '코끼리는 개보다 커요.', '🐘'],
    ['A turtle is slower than a rabbit.', '거북이는 토끼보다 느려요.', '🐢'], ['My bag is heavier than yours.', '내 가방은 네 것보다 무거워.', '🎒'], ['Summer is hotter than spring.', '여름은 봄보다 더워요.', '☀️'],
    ['The park is big and green.', '공원은 크고 푸르러요.', '🏞️'], ['Our kitchen is small but cozy.', '우리 부엌은 작지만 아늑해요.', '🍳'], ['The beach has white sand.', '해변에는 하얀 모래가 있어요.', '🏖️'],
    ['The city is busy and noisy.', '도시는 바쁘고 시끄러워요.', '🏙️'], ['The farm has many animals.', '농장에는 동물이 많아요.', '🐄'], ['This is the best day ever.', '오늘은 최고의 날이에요.', '🌟'],
    ['The mountain is very high.', '산이 아주 높아요.', '⛰️'], ['My dad is taller than my mom.', '아빠는 엄마보다 키가 커요.', '👨'], ['The red car is faster than the blue car.', '빨간 차는 파란 차보다 빨라요.', '🏎️'],
    ['The cheetah is the fastest animal.', '치타는 가장 빠른 동물이에요.', '🐆'],
  ],
  7: [
    // U: 규칙 과거형 (-ed)
    ['I played soccer yesterday.', '나는 어제 축구를 했어요.', '⚽'], ['They watched a movie.', '그들은 영화를 봤어요.', '🎬'], ['I helped my mom.', '나는 엄마를 도왔어요.', '🤲'],
    ['The dog jumped high.', '개가 높이 뛰었어요.', '🐕'], ['She cleaned her room.', '그녀는 방을 청소했어요.', '🧹'], ['We walked to the park.', '우리는 공원까지 걸어갔어요.', '🚶'],
    ['I washed my hands.', '나는 손을 씻었어요.', '🧼'], ['He opened the window.', '그는 창문을 열었어요.', '🪟'], ['We visited Grandma.', '우리는 할머니 댁을 방문했어요.', '👵'],
    ['I painted a picture.', '나는 물감으로 그림을 그렸어요.', '🎨'], ['She danced at the party.', '그녀는 파티에서 춤을 췄어요.', '💃'], ['The baby cried at night.', '아기가 밤에 울었어요.', '👶'],
    ['We cooked pancakes.', '우리는 팬케이크를 만들었어요.', '🥞'], ['I climbed a tree.', '나는 나무에 올랐어요.', '🌳'], ['He brushed his teeth.', '그는 이를 닦았어요.', '🪥'],
    ['The bus stopped here.', '버스가 여기에 섰어요.', '🚌'],
    // V: 불규칙 과거형 1
    ['We went to the park.', '우리는 공원에 갔어요.', '🏞️'], ['She ate a sandwich.', '그녀는 샌드위치를 먹었어요.', '🥪'], ['I saw a rainbow.', '나는 무지개를 봤어요.', '🌈'],
    ['He drank some water.', '그는 물을 조금 마셨어요.', '💧'], ['We made a snowman.', '우리는 눈사람을 만들었어요.', '⛄'], ['I read a book last night.', '나는 어젯밤에 책을 읽었어요.', '📖'],
    ['I had a good day.', '나는 좋은 하루를 보냈어요.', '🌟'], ['He ran to school.', '그는 학교로 뛰어갔어요.', '🏫'], ['We sang a song.', '우리는 노래를 불렀어요.', '🎤'],
    ['I wrote a letter.', '나는 편지를 썼어요.', '✉️'], ['The baby slept well.', '아기가 잘 잤어요.', '👶'], ['I came home at five.', '나는 다섯 시에 집에 왔어요.', '🏠'],
    ['We swam in the sea.', '우리는 바다에서 수영했어요.', '🏊'], ['She gave me a gift.', '그녀가 나에게 선물을 줬어요.', '🎁'], ['I got a new toy.', '나는 새 장난감을 받았어요.', '🧸'],
    ['He sat on the bench.', '그는 벤치에 앉았어요.', '🪑'],
    // W: 불규칙 과거형 2
    ['I bought some bread.', '나는 빵을 샀어요.', '🍞'], ['We took a picture.', '우리는 사진을 찍었어요.', '📷'], ['The bird flew away.', '새가 날아갔어요.', '🐦'],
    ['I drew a cat.', '나는 고양이를 그렸어요.', '🐱'], ['He rode a horse.', '그는 말을 탔어요.', '🐴'], ['I found my lost sock.', '나는 잃어버린 양말을 찾았어요.', '🧦'],
    ['She caught the ball.', '그녀가 공을 잡았어요.', '⚾'], ['Our team won the game.', '우리 팀이 경기에서 이겼어요.', '🏆'], ['I felt sick yesterday.', '나는 어제 아팠어요.', '🤒'],
    ['We met a new friend.', '우리는 새 친구를 만났어요.', '🤝'], ['I lost my pencil.', '나는 연필을 잃어버렸어요.', '✏️'], ['Dad brought a cake.', '아빠가 케이크를 가져왔어요.', '🎂'],
    ['She told me a story.', '그녀가 나에게 이야기를 해줬어요.', '📖'], ['I wore my blue coat.', '나는 파란 코트를 입었어요.', '🧥'], ['We built a sandcastle.', '우리는 모래성을 쌓았어요.', '🏰'],
    ['The plant grew tall.', '식물이 크게 자랐어요.', '🌱'],
    // X: 일기 쓰기 (was/were · 순서)
    ['Yesterday was my birthday.', '어제는 내 생일이었어요.', '🎂'], ['The movie was very funny.', '영화는 정말 재미있었어요.', '🎬'], ['We were at the beach.', '우리는 해변에 있었어요.', '🏖️'],
    ['I did my homework.', '나는 숙제를 했어요.', '📝'], ['First, I woke up early.', '먼저, 나는 일찍 일어났어요.', '⏰'], ['Then, I ate breakfast.', '그다음, 나는 아침을 먹었어요.', '🍳'],
    ['After school, I played outside.', '방과 후에 나는 밖에서 놀았어요.', '🛝'], ['At night, I read a story.', '밤에 나는 이야기를 읽었어요.', '🌙'], ['Last summer, we went camping.', '지난여름에 우리는 캠핑을 갔어요.', '🏕️'],
    ['It rained all day.', '하루 종일 비가 왔어요.', '🌧️'], ['The concert was amazing.', '음악회는 정말 멋졌어요.', '🎻'], ['I was tired after the trip.', '여행 후에 나는 피곤했어요.', '😪'],
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
    ['We will see a dolphin.', '우리는 돌고래를 볼 거예요.', '🐬'], ['I will never give up.', '나는 절대 포기하지 않을 거예요.', '🌟'],
    // Z: be going to · 나의 꿈
    ['I am going to bake cookies.', '나는 쿠키를 구울 거예요.', '🍪'], ['He is going to fly a kite.', '그는 연을 날릴 거예요.', '🪁'], ['We are going to plant a tree.', '우리는 나무를 심을 거예요.', '🌱'],
    ['I am going to draw a picture.', '나는 그림을 그릴 거예요.', '🎨'], ['My dream is to be a singer.', '내 꿈은 가수가 되는 거예요.', '🎤'], ['I am going to visit Jeju.', '나는 제주도에 갈 거예요.', '✈️'],
    ['She is going to learn piano.', '그녀는 피아노를 배울 거예요.', '🎹'], ['They are going to watch a play.', '그들은 연극을 볼 거예요.', '🎭'], ['I am going to read ten books.', '나는 책 열 권을 읽을 거예요.', '📚'],
    ['We are going to build a robot.', '우리는 로봇을 만들 거예요.', '🤖'], ['When I grow up, I will be a pilot.', '나는 커서 조종사가 될 거예요.', '🧑‍✈️'], ['I want to be a chef.', '나는 요리사가 되고 싶어요.', '🧑‍🍳'],
    ['My dream is to travel the world.', '내 꿈은 세계 여행이에요.', '🌍'], ['I am going to save money.', '나는 돈을 모을 거예요.', '🐷'], ['Next year, I will be eight.', '내년에 나는 여덟 살이 될 거예요.', '🎂'],
    ['I hope to be a scientist.', '나는 과학자가 되기를 바라요.', '🔬'], ['We are going to go camping.', '우리는 캠핑을 갈 거예요.', '🏕️'], ['I am going to help animals.', '나는 동물들을 도울 거예요.', '🐾'],
    ['Someday, I will fly to the moon.', '언젠가 나는 달에 갈 거예요.', '🚀'], ['I will keep learning English.', '나는 영어를 계속 배울 거예요.', '🌱'],
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
    ['Is it a cat?', 'No, it is a dog.', '고양이야? — 아니, 개야.'], ['How many apples are there?', 'There are three apples.', '사과가 몇 개 있어? — 사과가 세 개 있어.'],
    ['What is that?', 'It is a kite.', '저건 뭐야? — 연이야.'], ['What color is the sky?', 'The sky is blue.', '하늘은 무슨 색이야? — 하늘은 파래.'],
    ['How many legs does a dog have?', 'A dog has four legs.', '개는 다리가 몇 개야? — 개는 다리가 네 개야.'], ['Is it big?', 'No, it is small.', '그거 커? — 아니, 작아.'],
    ['What shape is it?', 'It is a circle.', '무슨 모양이야? — 동그라미야.'], ['How many pencils do you have?', 'I have five pencils.', '연필 몇 자루 있어? — 다섯 자루 있어.'],
    ['Whose book is this?', 'It is my book.', '이건 누구 책이야? — 내 책이야.'], ['Is the water cold?', 'Yes, it is very cold.', '물이 차가워? — 응, 아주 차가워.'],
    ['What is in the box?', 'There is a teddy bear in it.', '상자 안에 뭐가 있어? — 곰 인형이 있어.'], ['What color are bananas?', 'Bananas are yellow.', '바나나는 무슨 색이야? — 바나나는 노란색이야.'],
    ['Is this an egg?', 'Yes, it is an egg.', '이거 달걀이야? — 응, 달걀이야.'], ['What do you see?', 'I see a rainbow.', '뭐가 보여? — 무지개가 보여.'],
    // K: 좋아하는 것 · 할 수 있는 것 · 원하는 것
    ['Do you like pizza?', 'Yes, I do.', '피자 좋아해? — 응, 좋아해.'], ['Can you swim?', "No, I can't.", '수영할 수 있어? — 아니, 못 해.'],
    ['What do you want?', 'I want some juice.', '뭘 원해? — 주스를 원해.'], ['What is your favorite food?', 'My favorite food is noodles.', '제일 좋아하는 음식은? — 국수야.'],
    ['Do you have a pet?', 'Yes, I have a hamster.', '애완동물 있어? — 응, 햄스터가 있어.'], ['Can you play soccer?', 'Yes, I can.', '축구할 수 있어? — 응, 할 수 있어.'],
    ['What do you like to do?', 'I like to draw.', '뭐 하는 걸 좋아해? — 그림 그리는 걸 좋아해.'], ['Do you like carrots?', "No, I don't.", '당근 좋아해? — 아니, 안 좋아해.'],
    ['What animal do you like?', 'I like pandas.', '어떤 동물을 좋아해? — 판다를 좋아해.'], ['Can I help you?', 'Yes, please.', '도와줄까? — 응, 부탁해.'],
    ['Do you want some milk?', 'No, thank you.', '우유 좀 줄까? — 아니, 괜찮아.'], ['Can you count to ten?', 'Yes, I can.', '열까지 셀 수 있어? — 응, 할 수 있어.'],
    ['What sport do you like?', 'I like basketball.', '어떤 운동을 좋아해? — 농구를 좋아해.'], ['Do you like music?', 'Yes, I love music.', '음악 좋아해? — 응, 정말 좋아해.'],
    ['Can your dog run fast?', 'Yes, it can.', '너희 개는 빨리 달릴 수 있어? — 응, 할 수 있어.'], ['Which one do you want?', 'I want the red one.', '어떤 걸 원해? — 빨간 걸 원해.'],
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
    ['What is the dog doing?', 'The dog is digging a hole.', '개는 뭐 하고 있어? — 구멍을 파고 있어.'], ['Who wants cake?', 'I want cake!', '케이크 먹을 사람? — 나요!'],
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
    ['Why do you like dogs?', 'Because they are cute.', '왜 개를 좋아해? — 귀엽거든.'], ['How is your mom?', 'She is fine.', '어머니는 잘 계셔? — 잘 계셔.'],
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

// 스토리북 (단계마다 4권, 1~2단계 16쪽 안팎 · 3~4단계 20쪽 · 5~6단계 22쪽 · 7~8단계 24쪽) — 단계에서 배운 표현으로만 써서 아이가 혼자 따라 읽을 수 있어요
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
    ['This is my mom.', '👩'], ['She is kind.', '👩 💗'], ['She can cook.', '👩 🍳'], ['This is my dad.', '👨'], ['He is tall.', '👨 📏'], ['He can sing.', '👨 🎤'], ['This is my sister.', '👧'], ['She is six.', '👧 6️⃣'], ['She likes cats.', '👧 💗 🐱'], ['This is my baby brother.', '👶'], ['He is very small.', '👶 🍼'], ['He likes his toy duck.', '👶 🦆'], ['This is my grandma.', '👵'], ['She has a garden.', '👵 🌻 🌷'], ['This is my grandpa.', '👴'], ['He has a big hat.', '👴 👒'], ['This is my dog, Coco.', '🐶'], ['Coco can run fast.', '🐶 💨'], ['We are a happy family.', '👨‍👩‍👧‍👦 🐶 😊'], ['I love my family.', '🧒 ❤️ 👨‍👩‍👧‍👦']] },
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
    ['Today is my birthday!', '🎂 🎉'], ['How old are you?', '👧 ❓'], ['I am eight!', '🧒 8️⃣'], ['Happy birthday!', '👫 🎉'], ['Who is coming?', '❓ 👫'], ['My friends are coming.', '👫 👫'], ['What is in the box?', '🎁 ❓'], ['It is a present for you.', '🎁 👦'], ['Can I open it?', '🧒 🎁 ❓'], ['Yes, you can.', '👧 👍'], ['Wow, it is a robot!', '🤖 😲'], ['Do you like it?', '👧 ❓'], ['Yes, I love it!', '🧒 😍 🤖'], ['Thank you so much!', '🧒 🙏'], ['Where is the cake?', '🎂 ❓'], ['It is on the table.', '🎂 🍽️'], ['What color is it?', '🎂 🎨 ❓'], ['It is pink and white.', '🎂 💗 🤍'], ['Make a wish!', '🕯️ ✨'], ['Blow out the candles!', '🧒 💨 🕯️']] },
  { id: 5, stage: 5, title: 'The Rainy Day', cover: '🌧️', pages: [
    ['The sky is gray and dark.', '☁️ ☁️ ☁️'], ['The wind is cold.', '🌬️ 🥶'], ['I hear a loud sound. Boom!', '⛈️ ⚡ 👂'], ['My little dog is scared.', '🐶 😨'], ['Big drops fall on the roof.', '🏠 🌧️'], ['The window is wet.', '🪟 💧'], ['I want to go outside.', '🧒 🚪 🌧️'], ['I wear my yellow boots.', '🧒 🥾'], ['I wear my green raincoat.', '🧒 🧥'], ['I take my red umbrella.', '🧒 ☂️'], ['The puddles are deep and fun.', '💦 💧 😄'], ['I jump in a big puddle. Splash!', '🧒 💦 💦'], ['A little frog jumps, too!', '🐸 💦'], ['The frog is green and shiny.', '🐸 ✨'], ['My socks are wet and cold.', '🧦 💧 🥶'], ['I go back home.', '🧒 🏠'], ['Mom gives me warm milk.', '👩 🥛 🧒'], ['The milk is sweet and warm.', '🥛 😋'], ['Now the sun is out.', '☀️ 😎'], ['The sky is bright and blue!', '🌤️ 🌈'], ['I see a big rainbow.', '🌈 🧒'], ['What a wet and happy day!', '🧒 💦 😄']] },
  { id: 13, stage: 5, title: 'The Big Red Kite', cover: '🪁', pages: [
    ['I have a big red kite.', '🪁'], ['It has a long tail.', '🪁 🎀'], ['The tail is yellow and green.', '🎀 💛 💚'], ['The wind is strong today.', '🌬️ 🍃 🌳'], ['Dad and I go to the hill.', '👨 🧒 ⛰️'], ['The hill is high and green.', '⛰️ 🌿'], ['I hold the long string.', '🧒 🧵'], ['I run fast with my kite.', '🏃 💨 🪁'], ['Up, up, up it goes!', '🪁 ⬆️'], ['My kite flies high and far.', '🪁 ☁️'], ['It looks so small in the sky.', '☁️ 🪁 ☁️'], ['A bird flies next to it.', '🐦 🪁'], ['The bird is little and brown.', '🐦 🤎'], ['Oh no! The wind is too strong.', '🌬️ 🌬️ 😨'], ['My kite goes into a tall tree.', '🪁 🌳 😟'], ['Dad is very tall.', '👨 📏'], ['He gets my kite for me.', '👨 🙌 🪁'], ['The string is long and thin.', '🧵 🪁'], ['I fly my kite again.', '🧒 🪁 😊'], ['My kite comes down slowly.', '🪁 ⬇️ 🌿'], ['I am tired but happy.', '🧒 😪 😊'], ['What a happy, windy day!', '😄 🌬️ 🪁']] },
  { id: 25, stage: 5, title: 'The Little Seed', cover: '🌱', pages: [
    ['I have a little seed.', '🌰'], ['It is small and brown.', '🌰 🤎'], ['I put it in a pot.', '🪴 🌰'], ['The soil is soft and dark.', '🟫'], ['I give it some water.', '💧 🪴'], ['I put it by the sunny window.', '🪟 ☀️'], ['Day one. Nothing.', '🪴 🤔'], ['Day two. Still nothing.', '🪴 😕'], ['Day three. Look!', '🪴 👀'], ['A tiny green sprout!', '🌱 ✨'], ['It is very small and thin.', '🌱'], ['I am so happy.', '🧒 😄 🌱'], ['It gets taller every day.', '🌱 ⬆️'], ['The leaves are big and green.', '🌿 💚'], ['One morning, I see a bud.', '🌿 🟢'], ['The bud opens slowly.', '🌷'], ['It is a beautiful flower!', '🌻'], ['The flower is tall and yellow.', '🌻 💛'], ['A bee comes to visit.', '🐝 🌻'], ['The bee is busy and fuzzy.', '🐝 ✨'], ['My flower is the best!', '🧒 🌻 💛'], ['Plants are amazing!', '🌱 🌿 🌻']] },
  { id: 26, stage: 5, title: 'The Snow Day', cover: '⛄', pages: [
    ['It is a cold winter morning.', '❄️ 🌅'], ['Everything is white.', '🏠 ❄️'], ['The snow is soft and deep.', '❄️ ❄️'], ['I put on my warm coat.', '🧒 🧥'], ['I wear a red hat and blue gloves.', '🧒 🧣 🧤'], ['My brother is ready, too.', '👦 🧥'], ['We run outside.', '🏃 🏃 ❄️'], ['The air is fresh and cold.', '🌬️ 🥶'], ['We make a big snowman.', '⛄'], ['He has a long orange nose.', '⛄ 🥕'], ['His eyes are black stones.', '⛄ ⚫ ⚫'], ['He looks funny and happy.', '⛄ 😄'], ['We make snowballs.', '⚪ ⚪'], ['My brother throws one at me!', '👦 ⚪ 💥'], ['We laugh and laugh.', '😂 😂'], ['My cheeks are red and cold.', '🧒 🥶'], ['We lie down in the snow.', '🧒 ❄️'], ['We make snow angels.', '👼 ❄️'], ['Mom calls us inside.', '👩 🏠'], ['The hot cocoa is sweet and warm.', '☕ 😋'], ['My toes are warm now.', '🦶 🔥'], ['I love snowy days!', '🧒 ❄️ 💙']] },
  { id: 6, stage: 6, title: 'Where Is Max?', cover: '🐶', pages: [
    ['Where is Max the dog?', '🐶 ❓'], ['It is time for dinner.', '🥣 🕕'], ['Is he under the bed? No!', '🛏️ ❌'], ['Is he in the kitchen? No!', '🍳 ❌'], ['Is he in the bathroom? No!', '🛁 ❌'], ['Is he in the garden? No!', '🌷 ❌'], ['Who can help me?', '🧒 🤔'], ['My sister can help me.', '👧 🙋‍♀️'], ['What does Max like?', '👧 🤔 🐶'], ['He likes his red ball.', '🐶 🔴'], ['Where is his ball?', '🔴 ❓'], ['It is not in his bed.', '🐾 🛏️ ❌'], ['We look behind the door. No!', '🚪 ❌'], ['We look in the car. No!', '🚗 ❌'], ['Then we hear a sound.', '👂 🎵'], ['What is that sound?', '🧒 👂 ❓'], ['It is coming from the living room.', '🛋️ 🔊'], ['Look! He is behind the sofa.', '🛋️ 🐶'], ['What is he doing?', '👀 🐶'], ['Max is sleeping. Shh!', '🐶 💤 🤫'], ['He is sleeping with his ball.', '🐶 💤 🔴'], ['We found you, Max!', '🧒 👧 🐶 💛']] },
  { id: 14, stage: 6, title: 'Busy Sunday', cover: '📅', pages: [
    ['When do we wake up? At eight!', '⏰ 8️⃣'], ['Who wakes up first? My dog!', '🐶 ⏰'], ['What do we eat? Pancakes!', '🥞 😋'], ['Who makes them? Dad does!', '👨‍🍳 🥞'], ['What do we drink? Orange juice!', '🧃 🍊'], ['Where do we go? To the park!', '🏞️ 🌳'], ['How do we go? By bike!', '🚲 🚲'], ['Who do we see? Our friends!', '👫 👋'], ['What do we play? Tag!', '🏃 🏃‍♀️ 💨'], ['Who is it? Mina is it!', '👧 🏃'], ['Where do we hide? Behind a tree!', '🌳 🫣'], ['When do we eat lunch? At noon!', '🕛 🍱'], ['What is in the box? Rice and eggs!', '🍱 🍚 🥚'], ['Where do we read? Under a tree!', '🌳 📖'], ['What do we read? A dinosaur book!', '📖 🦕'], ['What do we see? A squirrel!', '🐿️ 👀'], ['Where is it going? Up the tree!', '🐿️ ⬆️ 🌳'], ['When do we go home? At four!', '🏠 🕓'], ['What do we do at home? We take a bath!', '🛁 🫧'], ['How do we feel? Tired but happy!', '😪 😊'], ['Why are we happy? We are together!', '👨‍👩‍👧 💛'], ['Good night, Sunday!', '🌙 😴']] },
  { id: 27, stage: 6, title: 'The Missing Cake', cover: '🍰', pages: [
    ['Where is my cake?', '🎂 ❓'], ['It is not on the table.', '🍽️ ❌'], ['Who has my cake?', '🧒 🤔'], ['Is it Dad?', '👨 ❓'], ['No. Dad is reading a book.', '👨 📖'], ['Is it Mom?', '👩 ❓'], ['No. Mom is working.', '👩 💻'], ['Is it my sister?', '👧 ❓'], ['No. She is sleeping.', '👧 💤'], ['What is that on the floor?', '🟫 ❓'], ['It is a little crumb.', '🍰 👀'], ['Where does it go?', '👣 ❓'], ['Look! More crumbs!', '🍰 🍰'], ['They go to the garden.', '🌷 👣'], ['Who is in the garden?', '🌷 ❓'], ['It is my dog, Coco!', '🐶'], ['What is Coco doing?', '🐶 ❓'], ['Coco is eating my cake!', '🐶 🎂 😋'], ['Why, Coco, why?', '🧒 😫'], ['Coco looks so happy.', '🐶 😊'], ['How can I be mad?', '🧒 🤷'], ['We can share next time!', '🧒 🐶 💛']] },
  { id: 28, stage: 6, title: 'A Day at the Beach', cover: '🏖️', pages: [
    ['Where are we going today?', '🚗 ❓'], ['We are going to the beach!', '🏖️'], ['How do we get there?', '🚗 ❓'], ['We go by car.', '🚗 💨'], ['When do we get there?', '🕐 ❓'], ['At ten in the morning!', '🕙 ☀️'], ['What do we see?', '👀 ❓'], ['The big blue sea!', '🌊'], ['What is Dad doing?', '👨 ❓'], ['He is setting up the umbrella.', '👨 ⛱️'], ['What is Mom doing?', '👩 ❓'], ['She is reading a book.', '👩 📖'], ['What am I doing?', '🧒 ❓'], ['I am building a sandcastle.', '🧒 🏰'], ['Who is helping me?', '🤔'], ['My little brother is!', '👦 🪣'], ['What is that in the sand?', '🏖️ ❓'], ['It is a little crab!', '🦀'], ['Where is it going?', '🦀 ❓'], ['Into the water!', '🦀 🌊'], ['Why is the sky orange?', '🌅 ❓'], ['The sun is going down. Bye, beach!', '🌅 👋']] },
  { id: 7, stage: 7, title: 'My Weekend', cover: '🎡', pages: [
    ['On Saturday, I went to the zoo.', '🎟️ 🦁 🦓'], ['I went with my mom and dad.', '👨 👩 🧒'], ['We took the bus.', '🚌'], ['I saw a tall giraffe.', '🦒'], ['It ate green leaves.', '🦒 🍃'], ['I saw a big elephant.', '🐘'], ['It drank a lot of water.', '🐘 💧'], ['The monkeys jumped and played.', '🐒 🐒 🌴'], ['One monkey waved at me!', '🐒 👋 🧒'], ['I ate ice cream with my dad.', '👨 🧒 🍦'], ['It was cold and sweet.', '🍦 😋'], ['I bought a toy lion.', '🦁 🛍️'], ['We came home at five.', '🏠 🕔'], ['I was very tired.', '🧒 😪'], ['On Sunday, it rained all morning.', '🌧️ 🏠'], ['I read books with my mom.', '👩 🧒 📚'], ['We made cookies together.', '👩 🧒 🍪'], ['The cookies smelled so good.', '🍪 😋'], ['Then the rain stopped.', '🌧️ ➡️ 🌤️'], ['In the afternoon, I played with my friends.', '👫 ⚽'], ['We played soccer in the park.', '⚽ 🌳'], ['We laughed a lot.', '😂 😂'], ['At night, I wrote in my diary.', '🌙 📔 ✏️'], ['I had a great weekend!', '🌟 😄']] },
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
];

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
  return groups;
}
// 스토리북에서 단어 하나를 읽을 소리: 'A cat sat'의 A는 관사라서 'a'(어)로, 'A is for apple'의 A만 글자 이름(에이)으로
const isLetterLine = text => /^[A-Z] is for |ends with [A-Z]\.?$/.test(text);
const storyWord = (text, w) => { const x = w.replace(/[.,!?]/g, ''); return x === 'A' && !isLetterLine(text) ? 'a' : x; };
const chunkSay = (text, g) => g.map(k => storyWord(text, text.split(' ')[k])).join(' ');
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
  const x = String(t).trim();
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
const PICS = { w: {}, s: {}, i: {}, re: null };
function setPics(m) {
  PICS.w = (m && m.w) || {}; PICS.s = (m && m.s) || {}; PICS.i = (m && m.i) || {};
  const keys = Object.keys(PICS.w).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  PICS.re = keys.length ? new RegExp(keys.join('|'), 'gu') : null;
}
const pic = html => (PICS.re ? String(html).replace(PICS.re, e => `<img class="pic" src="img/${PICS.w[e]}" alt="" draggable="false">`) : html);
// 메뉴·버튼 아이콘: 그린 그림이 있으면 그림, 없으면 이모지
const ico = e => PICS.i[e] ? `<img class="ico" src="img/${PICS.i[e]}" alt="" draggable="false">` : e;
const storyPic = (id, i) => PICS.s[`${id}-${i}`] ? `img/${PICS.s[`${id}-${i}`]}` : null;
