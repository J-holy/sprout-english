/* 새싹영어 — 커리큘럼 구조, 레벨 테스트, 요금제, 상점, FAQ */

const STAGES = [
  { id: 1, levels: ['A', 'B'], title: '알파벳', desc: '소리를 듣고, 대소문자 짝을 찾고, 따라 쓰며 A부터 Z까지 26개 글자와 친구가 돼요.', skills: ['알파벳 소리', '대소문자 짝짓기', '따라 쓰기'], color: '#ff8a65' },
  { id: 2, levels: ['C', 'D', 'E'], title: '파닉스 시작', desc: '글자가 내는 소리를 이어 붙여, 처음으로 단어를 혼자 읽어요.', skills: ['단모음', '장모음·매직 e', '단어 철자'], color: '#ffb74d' },
  { id: 3, levels: ['F', 'G', 'H'], title: '첫 문장', desc: '단어 두세 개를 모아 "This is my cat." 같은 첫 문장을 만들어요.', skills: ['be동사', '문장 순서', '뜻 이해'], color: '#ffd54f' },
  { id: 4, levels: ['I', 'J', 'K', 'L'], title: '일상 대화', desc: '묻고 답하는 짧은 대화로 인사, 기분, 좋아하는 것을 말해요.', skills: ['질문과 대답', '인사', '자기소개'], color: '#aed581' },
  { id: 5, levels: ['M', 'N', 'O', 'P'], title: '묘사하기', desc: '색깔, 크기, 느낌을 넣어 눈앞의 모습을 생생하게 그려 내요.', skills: ['형용사', '색깔·크기', '감정'], color: '#4db6ac' },
  { id: 6, levels: ['Q', 'R', 'S', 'T'], title: '육하원칙', desc: '누가, 언제, 어디서, 왜를 묻고 답하며 이야기를 따라가요.', skills: ['Who/Where', 'When/What', '전치사'], color: '#64b5f6' },
  { id: 7, levels: ['U', 'V', 'W', 'X'], title: '과거 시제', desc: '어제 한 일과 지난 주말 이야기를 과거형으로 들려줘요.', skills: ['규칙 과거형', '불규칙 과거형', '일기 쓰기'], color: '#9575cd' },
  { id: 8, levels: ['Y', 'Z'], title: '미래 시제', desc: 'will과 be going to로 내일 계획과 나의 꿈을 말해요.', skills: ['will', 'be going to', '나의 꿈'], color: '#f06292' },
];
const ALL_LEVELS = STAGES.flatMap(s => s.levels);
const stageOf = lv => STAGES.find(s => s.levels.includes(lv));

// 알파벳·파닉스·문장·질문·동사·스토리북은 content.js 에 있어요.

// 레벨 테스트 문항은 레슨 문항에서 섬마다 새로 뽑아요 (views.js testBlock)

const AVATARS = ['🐰', '🐻', '🦊', '🐼', '🐯', '🐨', '🐸', '🦁', '🐧', '🦄'];

// 요금: 1단계(알파벳, 20레슨)만 평생 무료, 2단계 파닉스부터 '플러스' (2026-11-26 사용자 결정. 정식 모집 전이라 기존 회원 예외는 두지 않는다)
// 서버 server/lib/pricing.js 의 FREE_LEVELS 와 같은 값. 1개월 19,900원 기준, 오래 쓸수록 월 요금이 내려간다
const FREE_MAX_STAGE = 1;
const freeMax = () => FREE_MAX_STAGE;
const isFreeLevel = lv => stageOf(lv).id <= freeMax();
// 화면 문구에 쓰는 무료·플러스 범위 (로그인 전에는 새로 가입하는 회원 기준)
const FREE = (u) => {
  const n = freeMax(u), lv = STAGES.slice(0, n).flatMap(s => s.levels), lessons = lv.length * LESSONS_PER_LEVEL;
  return { n, range: n === 2 ? '1~2단계' : '1단계', name: n === 2 ? '알파벳·파닉스' : '알파벳', levels: `Level ${lv[0]}~${lv[lv.length - 1]}`, lessons,
    plus: `${n + 1}~8단계`, plusFrom: `${n + 1}단계`, plusLessons: TOTAL_LESSONS - lessons, plusWhat: n === 2 ? '문장·대화·과거·미래' : '파닉스·문장·대화·과거·미래',
    books: STORIES.filter(s => s.stage <= n && !s.plus).length };
};
const PLANS = {
  one: { list: 19900, m1: 19900, m3: 18900, m6: 17900, m12: 15900 },
  two: { list: 29900, m1: 29900, m3: 28400, m6: 26900, m12: 23900 },
};
// 기간 한정 1년 특가 (서버 server/lib/pricing.js의 PROMO와 같은 값, 서버가 있으면 /api/config 값으로 바꾼다)
// 이 기간에 12개월을 결제하면 월 9,900원(두 자녀 14,900원). 쿠폰과 함께 쓰지 않는다
const PROMO = { from: Date.parse('2026-11-20T00:00:00+09:00'), until: Date.parse('2026-12-03T23:59:59+09:00'), months: 12, one: 9900, two: 14900 };
const promoOn = (t = Date.now()) => t >= PROMO.from && t <= PROMO.until;
const promoMonthly = (kids, months) => (months === PROMO.months && promoOn() ? PROMO[kids] : 0);
const promoEndText = () => { const d = new Date(PROMO.until); return `${d.getMonth() + 1}월 ${d.getDate()}일`; };
// '월 ○원부터' 안내에 쓰는 가장 싼 월 요금
const lowestMonthly = (kids = 'one') => promoMonthly(kids, PROMO.months) || PLANS[kids].m12;
const wonText = n => n.toLocaleString('ko-KR') + '원';
// 카카오톡 채널 '새싹스쿨' (11-24 개설): 채널 추가·1:1 채팅 문의
const KAKAO_CHANNEL = { home: 'https://pf.kakao.com/_RxjmvX', chat: 'https://pf.kakao.com/_RxjmvX/chat' };
const WELCOME_RATE = 0.2; // 웰컴쿠폰: 첫 결제 20% 추가 할인 (모든 기간)
const round10 = n => Math.round(n / 10) * 10;
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
  // 아바타 꾸미기: 부위(slot)마다 하나씩, 여러 부위를 함께 입을 수 있어요
  { id: 'acc-bow', kind: 'acc', slot: 'head', emoji: '🎀', name: '리본', cost: 6 },
  { id: 'acc-cap', kind: 'acc', slot: 'head', emoji: '🧢', name: '야구 모자', cost: 6 },
  { id: 'acc-flower', kind: 'acc', slot: 'head', emoji: '🌼', name: '꽃 핀', cost: 5 },
  { id: 'acc-sunhat', kind: 'acc', slot: 'head', emoji: '👒', name: '밀짚모자', cost: 8 },
  { id: 'acc-hat', kind: 'acc', slot: 'head', emoji: '🎩', name: '마술 모자', cost: 8 },
  { id: 'acc-grad', kind: 'acc', slot: 'head', emoji: '🎓', name: '졸업 모자', cost: 10 },
  { id: 'acc-crown', kind: 'acc', slot: 'head', emoji: '👑', name: '왕관', cost: 12 },
  { id: 'acc-glasses', kind: 'acc', slot: 'face', emoji: '🕶️', name: '선글라스', cost: 8 },
  { id: 'acc-specs', kind: 'acc', slot: 'face', emoji: '👓', name: '동그란 안경', cost: 6 },
  { id: 'acc-scarf', kind: 'acc', slot: 'neck', emoji: '🧣', name: '목도리', cost: 6 },
  { id: 'acc-medal', kind: 'acc', slot: 'neck', emoji: '🏅', name: '금메달', cost: 10 },
  { id: 'acc-balloon', kind: 'acc', slot: 'hand', emoji: '🎈', name: '풍선', cost: 5 },
  { id: 'acc-lollipop', kind: 'acc', slot: 'hand', emoji: '🍭', name: '막대사탕', cost: 5 },
  { id: 'acc-wand', kind: 'acc', slot: 'hand', emoji: '🪄', name: '요술봉', cost: 9 },
  { id: 'acc-teddy', kind: 'acc', slot: 'hand', emoji: '🧸', name: '곰 인형', cost: 8 },
  { id: 'acc-chick', kind: 'acc', slot: 'pet', emoji: '🐥', name: '병아리 친구', cost: 10 },
  { id: 'acc-butterfly', kind: 'acc', slot: 'pet', emoji: '🦋', name: '나비 친구', cost: 10 },
  { id: 'acc-turtle', kind: 'acc', slot: 'pet', emoji: '🐢', name: '거북이 친구', cost: 12 },
  { id: 'acc-sparkle', kind: 'acc', slot: 'fx', emoji: '✨', name: '반짝반짝', cost: 7 },
  { id: 'acc-hearts', kind: 'acc', slot: 'fx', emoji: '💖', name: '하트', cost: 7 },
  { id: 'acc-music', kind: 'acc', slot: 'fx', emoji: '🎵', name: '음표', cost: 7 },
  // 11-25 더한 꾸미기
  { id: 'acc-party', kind: 'acc', slot: 'head', emoji: '🎉', name: '파티 모자', cost: 9 },
  { id: 'acc-wreath', kind: 'acc', slot: 'head', emoji: '🌸', name: '꽃 화관', cost: 9 },
  { id: 'acc-mushroom', kind: 'acc', slot: 'head', emoji: '🍄', name: '버섯 모자', cost: 8 },
  { id: 'acc-starpin', kind: 'acc', slot: 'head', emoji: '⭐', name: '별 머리핀', cost: 5 },
  { id: 'acc-heartglasses', kind: 'acc', slot: 'face', emoji: '🩷', name: '하트 선글라스', cost: 9 },
  { id: 'acc-goggles', kind: 'acc', slot: 'face', emoji: '🤿', name: '물안경', cost: 8 },
  { id: 'acc-bowtie', kind: 'acc', slot: 'neck', emoji: '🎗️', name: '나비넥타이', cost: 6 },
  { id: 'acc-pearls', kind: 'acc', slot: 'neck', emoji: '📿', name: '진주 목걸이', cost: 9 },
  { id: 'acc-bell', kind: 'acc', slot: 'neck', emoji: '🔔', name: '방울 목걸이', cost: 7 },
  { id: 'acc-icecream', kind: 'acc', slot: 'hand', emoji: '🍦', name: '아이스크림', cost: 6 },
  { id: 'acc-sunflower', kind: 'acc', slot: 'hand', emoji: '🌻', name: '해바라기', cost: 7 },
  { id: 'acc-bubbles', kind: 'acc', slot: 'hand', emoji: '🫧', name: '비눗방울', cost: 8 },
  { id: 'acc-puppy', kind: 'acc', slot: 'pet', emoji: '🐶', name: '강아지 친구', cost: 12 },
  { id: 'acc-hamster', kind: 'acc', slot: 'pet', emoji: '🐹', name: '햄스터 친구', cost: 11 },
  { id: 'acc-octopus', kind: 'acc', slot: 'pet', emoji: '🐙', name: '문어 친구', cost: 12 },
  { id: 'acc-hedgehog', kind: 'acc', slot: 'pet', emoji: '🦔', name: '고슴도치 친구', cost: 12 },
  { id: 'acc-snow', kind: 'acc', slot: 'fx', emoji: '❄️', name: '눈송이', cost: 7 },
  { id: 'acc-clover', kind: 'acc', slot: 'fx', emoji: '🍀', name: '네잎클로버', cost: 7 },
  { id: 'acc-moon', kind: 'acc', slot: 'fx', emoji: '🌙', name: '달님', cost: 8 },
  // 미니룸 꾸미기 (시험): slot paper 벽지 · floor 바닥 가구 · wall 벽에 거는 것. w는 방 너비에 대한 크기
  { id: 'room-star', kind: 'room', slot: 'paper', emoji: '🌟', name: '별 벽지', cost: 10, img: 'img/room/paper-star.jpg?v=2' },
  { id: 'room-heart', kind: 'room', slot: 'paper', emoji: '💗', name: '하트 벽지', cost: 10, img: 'img/room/paper-heart.jpg?v=2' },
  { id: 'room-stripe', kind: 'room', slot: 'paper', emoji: '💚', name: '줄무늬 벽지', cost: 10, img: 'img/room/paper-stripe.jpg?v=2' },
  { id: 'room-bed', kind: 'room', slot: 'floor', emoji: '🛏️', name: '침대', cost: 14, w: 0.195, img: 'img/room/f-bed.png' },
  { id: 'room-rug', kind: 'room', slot: 'floor', emoji: '🩷', name: '동그란 러그', cost: 6, w: 0.195, img: 'img/room/f-rug.png' },
  { id: 'room-shelf', kind: 'room', slot: 'floor', emoji: '📚', name: '책장', cost: 10, w: 0.13, img: 'img/room/f-shelf.png' },
  { id: 'room-desk', kind: 'room', slot: 'floor', emoji: '✏️', name: '책상', cost: 12, w: 0.124, img: 'img/room/f-desk.png' },
  { id: 'room-sofa', kind: 'room', slot: 'floor', emoji: '🛋️', name: '소파', cost: 12, w: 0.13, img: 'img/room/f-sofa.png' },
  { id: 'room-toybox', kind: 'room', slot: 'floor', emoji: '🧸', name: '장난감 상자', cost: 8, w: 0.098, img: 'img/room/f-toybox.png' },
  { id: 'room-tent', kind: 'room', slot: 'floor', emoji: '⛺', name: '놀이 텐트', cost: 14, w: 0.13, img: 'img/room/f-tent.png' },
  { id: 'room-plant', kind: 'room', slot: 'floor', emoji: '🪴', name: '화분', cost: 5, w: 0.058, img: 'img/room/f-plant.png' },
  { id: 'room-lamp', kind: 'room', slot: 'floor', emoji: '💡', name: '스탠드', cost: 7, w: 0.052, img: 'img/room/f-lamp.png' },
  { id: 'room-window', kind: 'room', slot: 'wall', emoji: '🪟', name: '창문', cost: 9, w: 0.117, img: 'img/room/f-window.png' },
  { id: 'room-frame', kind: 'room', slot: 'wall', emoji: '🖼️', name: '그림 액자', cost: 6, w: 0.065, img: 'img/room/f-frame.png' },
  { id: 'room-clock', kind: 'room', slot: 'wall', emoji: '🕰️', name: '벽시계', cost: 6, w: 0.052, img: 'img/room/f-clock.png' },
  { id: 'room-bunting', kind: 'room', slot: 'wall', emoji: '🎏', name: '깃발 장식', cost: 5, w: 0.143, img: 'img/room/f-bunting.png' },
];
const ACC_SLOTS = [['head', '머리'], ['face', '얼굴'], ['neck', '목'], ['hand', '손'], ['pet', '친구'], ['fx', '효과']];


const FAQ = [
  { cat: '요금', q: '정말 무료로 쓸 수 있나요?', get a() { const f = FREE(); return `네. ${f.range}(${f.name}, ${f.levels} ${f.lessons}레슨)와 스토리북 ${f.books}권, 놀이터, 말하기 연습, 부모 리포트는 기간 제한 없이 평생 무료예요. 카드 등록도 필요 없어요.`; } },
  { cat: '요금', q: '7일 체험은 뭔가요?', get a() { const f = FREE(); return `아이가 무료 단계를 마치고 처음으로 플러스 단계(${f.plusFrom})에 들어갈 때, 7일 무료 체험을 시작할 수 있어요. 체험하는 7일 동안은 8단계까지 모든 단계와 스토리북을 쓸 수 있어요. 체험이 끝나도 자동 결제는 없고, ${f.range}는 계속 무료로 이어져요.`; } },
  { cat: '요금', q: '플러스는 얼마예요?', a: `아이 1명 기준 1개월 ${wonText(PLANS.one.m1)}, 3개월은 월 ${wonText(PLANS.one.m3)}, 6개월은 월 ${wonText(PLANS.one.m6)}, 12개월은 월 ${wonText(PLANS.one.m12)}이에요. 형제·자매를 2명 이상 등록하면 1개월 ${wonText(PLANS.two.m1)}, 3개월 월 ${wonText(PLANS.two.m3)}, 6개월 월 ${wonText(PLANS.two.m6)}, 12개월 월 ${wonText(PLANS.two.m12)}이에요. 가입하면 받는 웰컴쿠폰으로 가입 후 10일 안의 첫 결제는 ${Math.round(WELCOME_RATE * 100)}% 더 할인돼요.${promoOn() ? ` 1년 특가 기간(${promoEndText()}까지)에는 12개월이 월 ${wonText(PROMO.one)}(형제·자매 월 ${wonText(PROMO.two)})이고, 이때는 쿠폰을 함께 쓰지 않아요(쿠폰은 남아요).` : ''} 한 번만 결제하는 이용권이라 자동으로 다시 결제되지 않아요.` },
  { cat: '요금', q: '형제·자매가 같이 쓸 수 있나요?', a: '한 계정에서 여러 아이 프로필을 만들 수 있고, 무료 구간은 모두 함께 써요. 아이를 2명 이상 등록하면 플러스를 결제할 때 형제·자매 요금이 자동으로 적용돼요.' },
  { cat: '멤버십', q: '체험 중에 플러스를 사면 남은 기간과 진도는요?', a: '남은 체험 기간은 플러스 기간에 더해지고, 학습 진도와 기록도 그대로 유지돼요.' },
  { cat: '멤버십', q: '다시 결제되나요? 환불하려면?', a: '플러스는 한 번만 결제하는 이용권이라 자동으로 다시 결제되지 않아요. 따로 해지할 필요가 없고, 이용 기간이 끝나기 3일 전에 알려 드려요. 결제 후 7일 이내이고 플러스 학습(2단계 이상 레슨, 플러스 스토리북)을 시작하지 않았으면 부모페이지에서 바로 전액 환불돼요. 플러스 학습을 시작했거나 7일이 지났으면 고객센터로 신청해 주세요. 이용을 시작한 달(30일 단위)을 빼고 남은 달만큼 환불해 드려요(예: 12개월 이용권을 5일 썼다면 1개월치를 빼고 11개월치 환불). 1개월 이용권은 이용을 시작하면 환불되지 않아요.' },
  { cat: '계정', q: '가입은 어떻게 하나요?', a: '카카오·네이버·Google 계정으로 바로 시작하거나, 이메일로 받은 6자리 인증코드만 입력하면 돼요. 비밀번호는 필요 없어요.' },
  { cat: '학습', q: '하루에 얼마나 학습하면 좋을까요?', a: '하루 10~15분, 레슨 1개를 권장해요. 더 하고 싶어 하면 2개까지 좋아요. 부모페이지에서 하루 목표 레슨 수를 정할 수 있고, 목표를 채우면 학습 도장이 찍혀요.' },
  { cat: '학습', q: '전체 과정을 마치는 데 얼마나 걸리나요?', a: '8단계 26레벨, 레벨마다 10일(9일 학습 + 1일 복습)로 모두 260레슨이에요. 주 5일 하루 1레슨이면 약 1년, 하루 2레슨이면 약 6개월 걸려요. 레벨 진단으로 중간 단계부터 시작하면 더 짧아지고, 모험 지도에서 남은 기간을 확인할 수 있어요.' },
  { cat: '학습', q: '어느 레벨부터 시작해야 하나요?', a: '첫 프로필을 만들면 레벨 테스트를 볼 수 있어요. 결과에 따라 알맞은 레벨부터 시작하고, 이전 레벨도 언제든 복습할 수 있어요.' },
  { cat: '학습', q: '별(⭐)은 어디에 쓰나요?', a: '레슨 별점, 스토리 완독, 말하기 80점 이상, 놀이터 게임으로 별을 모아요. 모은 별로 별 상점에서 스티커와 아바타 꾸미기 아이템을 살 수 있어요.' },
  { cat: '학습', q: '소리가 너무 크거나 작아요.', a: '레슨 화면 위쪽 🔊 버튼이나 부모페이지 > 설정에서 목소리와 효과음 볼륨을 따로 조절할 수 있어요. 읽어주는 목소리도 설정에서 고를 수 있어요.' },
  { cat: '학습', q: '앱처럼 홈 화면에 놓을 수 있어요?', a: '네. 휴대폰·태블릿으로 처음 들어오면 기기에 맞는 설치 방법을 알려 드려요. 다시 보려면 맨 아래 "📲 앱으로 설치하기"를 눌러 주세요. 아이폰·아이패드는 Safari의 공유 버튼 › "홈 화면에 추가", 안드로이드는 Chrome 메뉴(⋮) › "홈 화면에 추가" 또는 "앱 설치"를 눌러 주세요. 인터넷이 연결되어 있어야 쓸 수 있어요. 아이폰·아이패드의 홈 화면 앱은 로그인 정보를 따로 저장해서, 처음에 한 번 로그인해 주세요.' },
  { cat: '학습', q: '휴대폰에서 마이크(말하기 연습)가 안 돼요.', a: '① 카카오톡·인스타그램 등 앱 안에서 열었다면 Chrome(안드로이드)이나 Safari(iPhone)로 다시 열어 주세요. 화면 위 "브라우저로 열기" 버튼을 눌러도 돼요. ② iPhone·iPad의 Safari는 설정 › Safari › 마이크 "허용", 설정 › 일반 › 키보드 › "받아쓰기"를 켜 주세요. Chrome은 로그인한 뒤 설정 앱 › Chrome › 마이크를 켜 주세요. ③ 안드로이드는 주소창 왼쪽 자물쇠 › 권한 › 마이크 "허용" 후 새로고침해 주세요. 도움말 페이지의 🎤 마이크 테스트로 바로 확인할 수 있어요. 마이크가 안 되는 환경에서는 듣고 따라 말하기로 진행돼요.' },
  { cat: '학습', q: '틀린 문제는 다시 볼 수 있나요?', a: '틀린 문제는 자동으로 오답노트에 저장돼요. 오답노트에서 다시 풀어 맞히면 목록에서 사라져요.' },
  { cat: '학습', q: '워크시트는 어떻게 받나요?', a: '부모페이지 > 워크시트에서 레벨을 골라 바로 인쇄하거나 PDF로 저장해요. 인쇄한 날짜가 기록돼요.' },
  { cat: '계정', q: '학습 알림은 어떻게 받나요?', a: '레슨을 마칠 때마다 부모페이지 > 학습알림에 기록이 남아요. 브라우저 알림을 허용하면 학습 완료와 매일 정해진 시간의 학습 리마인더를 알림으로 받을 수 있어요.' },
];

const SAMPLE_REVIEWS = [
  { rating: 4, name: '6살 하린 보호자', text: '알파벳 따라쓰기를 정말 좋아해요. 매일 도장 모으는 재미로 스스로 앱을 켜요.', date: '2026-09-02' },
  { rating: 4, name: '7살 도윤 보호자', text: '말하기 연습에서 점수가 올라가니까 발음 연습을 계속 하려고 해요. 부모 리포트로 약한 단어를 확인할 수 있어 좋아요.', date: '2026-09-14' },
  { rating: 3, name: '8살 서아 보호자', text: '오답노트 기능 덕분에 틀린 문제를 다시 풀 수 있어요. 스토리북이 조금 더 많았으면 좋겠어요.', date: '2026-09-21' },
  { rating: 4, name: '5살 지호 보호자', text: '레벨 테스트로 시작 레벨을 정해주니 너무 쉽거나 어렵지 않아서 좋았어요.', date: '2026-10-01' },
  { rating: 4, name: '9살 은우 보호자', text: '과거형 단계에서 불규칙 동사를 게임처럼 익히더라고요. 하루 15분이면 충분해요.', date: '2026-10-08' },
  { rating: 2, name: '6살 민준 보호자', text: '음성 인식이 아이 목소리를 가끔 잘 못 알아들어요. 그래도 듣고 따라하기는 유용해요.', date: '2026-10-11' },
  { rating: 4, name: '7살 예린 보호자', text: '스토리북을 읽어줄 때 단어가 하나씩 강조돼서 아이가 글자를 따라가며 읽어요.', date: '2026-10-19' },
];
const RATING_LABELS = { 4: '매우 좋아요', 3: '좋아요', 2: '그럭저럭 쓸만해요', 1: '개선이 필요해요' };

// 로그인 화면·로그인 뒤 알림에 무작위로 보여 주는 환영 인사 [제목, 한 줄 덧붙임]. 시간대 인사와 언제나 쓰는 인사를 섞어서 고른다
const GREETINGS = {
  morning: [
    ['좋은 아침이에요! ☀️', '오늘도 한 뼘 더 자라 볼까요?'],
    ['상쾌한 아침이에요 🌤️', '아침에 듣는 영어 한 마디가 하루를 밝혀요.'],
    ['일찍 오셨네요! 🐣', '부지런한 새싹이 제일 먼저 자라요.'],
  ],
  day: [
    ['기다리고 있었어요! 🗺️', '오늘의 모험이 준비됐어요.'],
    ['반가워요! 🌼', '햇살 좋은 오늘, 영어 놀이 한 판 어때요?'],
    ['어서 오세요! 🎈', '오늘은 어떤 단어를 만나게 될까요?'],
  ],
  evening: [
    ['오늘 하루도 수고 많으셨어요 🌙', '영어 한 마디로 기분 좋게 마무리해요.'],
    ['저녁 모험을 떠나 볼까요? ✨', '잠들기 전 스토리북 한 권도 좋아요.'],
  ],
  night: [
    ['늦게까지 함께해 주셔서 고마워요 🌟', '짧게 하나만 하고 푹 쉬어요.'],
  ],
  any: [
    ['새싹이 쑥쑥 자라는 중이에요 🌱', '꾸준히 오는 것만으로도 충분히 잘하고 있어요.'],
    ['오늘도 와 주셔서 고마워요 💛', '아이와 함께하는 이 시간이 제일 소중해요.'],
    ['친구들이 기다리고 있었어요 🐰', '동물 친구들이 모두 반가워해요.'],
    ['다시 만나서 정말 기뻐요! 👏', '오늘도 신나는 영어 모험을 시작해요.'],
    ['새싹 나무가 기다리고 있어요 🌳', '오늘도 물 주고 쑥쑥 키워요.'],
    ['오늘도 멋진 하루예요 🌈', '작은 한 걸음이 큰 실력이 돼요.'],
    ['어서 와요, 영어 탐험가님! 🧭', '새로운 섬이 기다리고 있어요.'],
  ],
};
const greeting = (h = new Date().getHours()) => {
  const pool = [...GREETINGS[h < 5 || h >= 22 ? 'night' : h < 11 ? 'morning' : h < 17 ? 'day' : 'evening'], ...GREETINGS.any];
  return pool[Math.floor(Math.random() * pool.length)];
};
