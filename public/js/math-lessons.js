/* 새싹수학 개념 레슨 (2026-11-26)
 * 「천재들이 만든 수학퍼즐」에 나오는 개념(수 세기·평면도형·집합·규칙·머리셈·마방진·스도쿠)을 골라
 * 새싹스쿨이 직접 쓴 짧은 설명으로 배우고 → 따라 읽고 → 따라 쓰고 → 문제로 확인한다. 책의 문장·그림·문제는 옮기지 않는다.
 * 단계: learn(개념 카드, 🔊 듣기) · write(따라 쓰기) · quiz(확인 문제, MathGen) · play(퍼즐로 가기)
 *       조작(씨앗): tap{e,n} 하나씩 눌러 세기 · corners{s} 뾰족한 곳 누르기 · sort{groups} 바구니에 옮기기 · extend{unit,shown,blanks} 규칙 이어 채우기
 * 2026-11-26 저녁: 따라 읽기(read)는 뺐다 — 수학은 읽기보다 퍼즐·워크시트로 연습한다
 * viz(그림): count{e,n} · seq{items} · shape{s} · add{e,a,b} · sub{e,a,b} · group{groups} · grid{n,vals}
 *            · array{e,r,c} · frac{n,d} · nums{to,hi} · angle{deg | all} · poly{s:[변의 수…]} */
const MATH_LESSONS = [
  { id: 'num1', stage: 'seed', icon: 'm🍎', title: '수 세기 1~5', topic: '수의 기원', steps: [
    { type: 'learn', viz: { k: 'count', e: '🍎', n: 3 }, text: '물건을 셀 때는 하나씩 손가락으로 짚으면서 세요. 마지막에 말한 수가 모두 몇 개인지 알려 줘요.' },
    { type: 'tap', e: '🍎', n: 5, text: '사과를 하나씩 눌러서 세어 봐요.' },
    { type: 'learn', viz: { k: 'count', e: '⭐', n: 5 }, text: '숫자로 쓰면 1, 2, 3, 4, 5예요. 1은 일, 하나라고 읽고, 5는 오, 다섯이라고 읽어요.' },
    { type: 'write', glyph: '3', say: '삼, 셋' },
    { type: 'write', glyph: '5', say: '오, 다섯' },
    { type: 'quiz', gen: 'count', args: [1, 5] }, { type: 'quiz', gen: 'count', args: [1, 5] },
  ] },
  { id: 'num2', stage: 'seed', icon: 'm🐥', title: '수 세기 6~10', topic: '수의 기원', steps: [
    { type: 'learn', viz: { k: 'count', e: '🐥', n: 7 }, text: '다섯보다 많으면 다섯 마리를 먼저 묶어 세고, 남은 것을 이어서 세면 쉬워요.' },
    { type: 'tap', e: '🐥', n: 8, text: '병아리를 하나씩 눌러서 세어 봐요. 다섯 다음에는 여섯이에요.' },
    { type: 'learn', viz: { k: 'count', e: '🍓', n: 10 }, text: '10은 십, 열이라고 읽어요. 손가락을 모두 펴면 열 개예요.' },
    { type: 'learn', viz: { k: 'count', e: '🚗', n: 3 }, text: '무엇을 세느냐에 따라 수 뒤에 붙이는 말이 달라요. 사과나 공은 한 개, 두 개. 강아지나 병아리 같은 동물은 한 마리, 두 마리. 자동차는 한 대, 두 대. 꽃은 한 송이, 두 송이라고 세요.' },
    { type: 'write', glyph: '7', say: '칠, 일곱' },
    { type: 'write', glyph: '10', say: '십, 열' },
    { type: 'quiz', gen: 'count', args: [6, 10] }, { type: 'quiz', gen: 'count', args: [6, 10] },
  ] },
  { id: 'shape', stage: 'seed', icon: 'math-shape', title: '세모·네모·동그라미', topic: '평면도형', steps: [
    { type: 'learn', viz: { k: 'shape', s: 'tri' }, text: '세모는 곧은 선 세 개로 둘러싸여 있고, 뾰족한 곳이 세 군데예요.' },
    { type: 'corners', s: 'tri', text: '세모의 뾰족한 곳을 하나씩 눌러 봐요.' },
    { type: 'learn', viz: { k: 'shape', s: 'sq' }, text: '네모는 곧은 선 네 개로 둘러싸여 있고, 뾰족한 곳이 네 군데예요.' },
    { type: 'corners', s: 'sq', text: '네모의 뾰족한 곳도 하나씩 눌러 봐요.' },
    { type: 'learn', viz: { k: 'shape', s: 'circ' }, text: '동그라미는 둥글게 굽은 선 하나로 둘러싸여 있어서 뾰족한 곳이 없어요.' },
    { type: 'write', glyph: '세모', say: '세모' },
    { type: 'write', glyph: '네모', say: '네모' },
    { type: 'quiz', gen: 'shape' }, { type: 'quiz', gen: 'shape' },
  ] },
  { id: 'group', stage: 'seed', icon: '🧺', title: '같은 것끼리 모으기', topic: '집합', steps: [
    { type: 'learn', viz: { k: 'group', groups: [['🍎', '🍓', '🍌'], ['🐶', '🐱', '🐥']] }, text: '과일은 과일끼리, 동물은 동물끼리 모을 수 있어요. 같은 성질을 가진 것끼리 모은 무리를 집합이라고 해요.' },
    { type: 'sort', groups: [['🍎 과일 바구니', ['🍎', '🍓', '🍌']], ['🐾 동물 바구니', ['🐶', '🐱', '🐥']]], text: '하나를 누르고, 들어갈 바구니를 눌러서 옮겨 봐요.' },
    { type: 'learn', viz: { k: 'group', groups: [['🍎', '❤️', '🍓'], ['🍌', '⭐', '🌙']] }, text: '색으로도 모을 수 있어요. 빨간 것끼리, 노란 것끼리 모아 봐요.' },
    { type: 'sort', groups: [['❤️ 빨간 바구니', ['🍎', '❤️', '🍓']], ['💛 노란 바구니', ['🍌', '⭐', '🌙']]], text: '이번에는 색깔 바구니에 옮겨 봐요.' },
    { type: 'write', glyph: '집합', say: '집합' },
    { type: 'quiz', gen: 'odd' }, { type: 'quiz', gen: 'odd' },
  ] },
  { id: 'pattern', stage: 'seed', icon: 'math-pattern', title: '규칙 찾기', topic: '규칙 찾기', steps: [
    { type: 'learn', viz: { k: 'seq', items: ['🍎', '🍌', '🍎', '🍌', '🍎', '🍌'] }, text: '사과, 바나나, 사과, 바나나. 똑같은 차례가 계속 되풀이되는 것을 규칙이라고 해요.' },
    { type: 'extend', unit: ['🍎', '🍌'], shown: 4, blanks: 2, text: '규칙에 맞게 빈칸 두 개를 채워 봐요.' },
    { type: 'learn', viz: { k: 'seq', items: ['⭐', '⭐', '🌙', '⭐', '⭐', '🌙'] }, text: '별, 별, 달. 세 개가 한 묶음이 되어 되풀이되기도 해요. 한 묶음을 찾으면 다음을 알 수 있어요.' },
    { type: 'extend', unit: ['⭐', '⭐', '🌙'], shown: 5, blanks: 3, text: '한 묶음을 찾아서 빈칸 세 개를 채워 봐요.' },
    { type: 'write', glyph: '규칙', say: '규칙' },
    { type: 'quiz', gen: 'pattern' }, { type: 'quiz', gen: 'pattern' },
  ] },
  { id: 'add', stage: 'sprout', icon: 'math-mental', title: '더하기', topic: '머리셈', steps: [
    { type: 'learn', viz: { k: 'add', e: '🍎', a: 2, b: 3 }, text: '사과 두 개와 사과 세 개를 합치면 모두 다섯 개예요. 이렇게 합치는 것을 더하기라고 해요.' },
    { type: 'learn', viz: { k: 'add', e: '⭐', a: 4, b: 1 }, text: '더하기는 플러스 기호로 쓰고, 같다는 등호로 써요. 4 더하기 1은 5예요.' },
    { type: 'write', glyph: '+', say: '더하기' },
    { type: 'write', glyph: '=', say: '같아요' },
    { type: 'quiz', gen: 'mental', args: ['+'] }, { type: 'quiz', gen: 'mental', args: ['+'] },
  ] },
  { id: 'sub', stage: 'sprout', icon: '🧮', title: '빼기', topic: '머리셈', steps: [
    { type: 'learn', viz: { k: 'sub', e: '🍓', a: 5, b: 2 }, text: '딸기 다섯 개 중에서 두 개를 먹으면 세 개가 남아요. 덜어 내는 것을 빼기라고 해요.' },
    { type: 'learn', viz: { k: 'sub', e: '🎈', a: 6, b: 1 }, text: '빼기는 마이너스 기호로 써요. 6 빼기 1은 5예요.' },
    { type: 'write', glyph: '−', say: '빼기' },
    { type: 'write', glyph: '빼기', say: '빼기' },
    { type: 'quiz', gen: 'mental', args: ['−'] }, { type: 'quiz', gen: 'mental', args: ['−'] },
  ] },
  { id: 'magic', stage: 'sprout', icon: 'math-magic', title: '마방진', topic: '마방진', steps: [
    { type: 'learn', viz: { k: 'grid', n: 3, vals: [2, 7, 6, 9, 5, 1, 4, 3, 8] }, text: '마방진은 1부터 9까지 숫자를 한 번씩 넣은 네모 판이에요. 가로, 세로, 대각선 어느 줄을 더해도 15가 돼요.' },
    { type: 'learn', viz: { k: 'grid', n: 3, vals: [2, 7, 6, 9, 5, 1, 4, 3, 8] }, text: '가운데에는 늘 5가 들어가요. 빈칸이 있으면 같은 줄의 두 수를 더해서 15가 되려면 얼마가 남는지 생각해요.' },
    { type: 'write', glyph: '15', say: '십오' },
    { type: 'quiz', gen: 'mental', args: ['+'] },
    { type: 'play', game: 'magic', text: '이제 마방진 퍼즐을 직접 풀어 볼까요?' },
  ] },
  { id: 'sudoku', stage: 'sprout', icon: 'math-sudoku', title: '스도쿠', topic: '스도쿠', steps: [
    { type: 'learn', viz: { k: 'grid', n: 4, vals: [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1] }, text: '스도쿠는 빈칸에 숫자를 채우는 퍼즐이에요. 가로줄에도, 세로줄에도 같은 숫자가 두 번 들어가면 안 돼요.' },
    { type: 'learn', viz: { k: 'grid', n: 4, vals: [1, 2, 3, 0, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1] }, text: '첫째 줄에는 1, 2, 3이 있으니 빈칸에는 남은 숫자 4가 들어가요.' },
    { type: 'write', glyph: '4', say: '사, 넷' },
    { type: 'play', game: 'sudoku', text: '이제 4×4 스도쿠를 직접 풀어 볼까요?' },
  ] },
  { id: 'mul', stage: 'tree', icon: '✖️', title: '곱셈', topic: '곱셈 알고리즘', steps: [
    { type: 'learn', viz: { k: 'array', e: '🍎', r: 3, c: 4 }, text: '사과가 한 줄에 네 개씩 세 줄 있어요. 4를 세 번 더하는 대신 곱하기로 한 번에 셀 수 있어요.' },
    { type: 'learn', viz: { k: 'array', e: '⭐', r: 2, c: 5 }, text: '곱하기는 가위표처럼 생긴 기호로 써요. 5 곱하기 2는 5를 두 번 더한 것과 같아서 10이에요.' },
    { type: 'learn', viz: { k: 'array', e: '🍓', r: 4, c: 3 }, text: '곱하는 두 수의 자리를 바꾸어도 답은 같아요. 4 곱하기 3도, 3 곱하기 4도 모두 12예요.' },
    { type: 'write', glyph: '×', say: '곱하기' },
    { type: 'write', glyph: '곱하기', say: '곱하기' },
    { type: 'quiz', gen: 'mul' }, { type: 'quiz', gen: 'mul' },
  ] },
  { id: 'frac', stage: 'tree', icon: '🍕', title: '분수', topic: '분수', steps: [
    { type: 'learn', viz: { k: 'frac', n: 1, d: 2 }, text: '피자 한 판을 똑같이 둘로 나누면 한 조각은 전체의 이분의 일이에요. 똑같이 나눈 것 가운데 몇 개인지 나타내는 수를 분수라고 해요.' },
    { type: 'learn', viz: { k: 'frac', n: 3, d: 4 }, text: '분수는 가로 막대의 아래와 위에 수를 써요. 아래에는 모두 몇 조각으로 나눴는지, 위에는 그중 몇 조각인지 써요. 아래 수를 분모, 위 수를 분자라고 해요.' },
    { type: 'learn', viz: { k: 'frac', n: 3, d: 4 }, text: '네 조각 중 세 조각을 색칠하면 사분의 삼이에요. 읽을 때는 아래에 있는 분모를 먼저 읽어요.' },
    { type: 'write', glyph: '분수', say: '분수' },
    { type: 'write', glyph: '3/4', say: '사분의 삼' },
    { type: 'quiz', gen: 'frac' }, { type: 'quiz', gen: 'frac' },
  ] },
  { id: 'factor', stage: 'tree', icon: '🍪', title: '약수와 배수', topic: '약수와 배수', steps: [
    { type: 'learn', viz: { k: 'array', e: '🍪', r: 3, c: 4 }, text: '쿠키 열두 개를 친구들에게 남김없이 똑같이 나눠 줄 수 있을까요? 한 명, 두 명, 세 명, 네 명, 여섯 명, 열두 명이면 하나도 남지 않아요.' },
    { type: 'learn', viz: { k: 'nums', to: 12, hi: [1, 2, 3, 4, 6, 12] }, text: '12를 나누었을 때 남는 것 없이 딱 나누어떨어지게 하는 수를 12의 약수라고 해요. 12의 약수는 1, 2, 3, 4, 6, 12예요.' },
    { type: 'learn', viz: { k: 'nums', to: 20, hi: [3, 6, 9, 12, 15, 18] }, text: '3에 1, 2, 3, 4를 차례로 곱하면 3, 6, 9, 12가 돼요. 이렇게 3을 몇 번씩 곱해서 나오는 수를 3의 배수라고 해요.' },
    { type: 'write', glyph: '약수', say: '약수' },
    { type: 'write', glyph: '배수', say: '배수' },
    { type: 'quiz', gen: 'factor' }, { type: 'quiz', gen: 'factor' },
  ] },
  { id: 'angle', stage: 'tree', icon: '📐', title: '각', topic: '각', steps: [
    { type: 'learn', viz: { k: 'angle', deg: 60 }, text: '한 점에서 곧은 선 두 개가 뻗어 나가면 각이 생겨요. 두 선이 많이 벌어질수록 큰 각이에요.' },
    { type: 'learn', viz: { k: 'angle', deg: 90 }, text: '공책 모서리처럼 반듯하게 선 각을 직각이라고 해요. 직각은 90도예요.' },
    { type: 'learn', viz: { k: 'angle', all: true }, text: '직각보다 작은 각은 예각이에요. 직각보다 크고, 쭉 편 일직선보다 작은 각은 둔각이에요.' },
    { type: 'write', glyph: '직각', say: '직각' },
    { type: 'write', glyph: '90°', say: '구십 도' },
    { type: 'quiz', gen: 'angle' }, { type: 'quiz', gen: 'angle' },
  ] },
  { id: 'poly', stage: 'tree', icon: '🐝', title: '다각형', topic: '다각형', steps: [
    { type: 'learn', viz: { k: 'poly', s: [3, 4, 5, 6] }, text: '곧은 선으로만 둘러싸인 도형을 다각형이라고 해요. 둘러싼 선 하나하나를 변, 변과 변이 만나는 점을 꼭짓점이라고 해요.' },
    { type: 'learn', viz: { k: 'poly', s: [5] }, text: '변이 다섯 개면 오각형이에요. 다각형은 변의 수와 꼭짓점의 수가 언제나 같아요.' },
    { type: 'learn', viz: { k: 'poly', s: [6] }, text: '벌집 한 칸은 변이 여섯 개인 육각형이에요. 동그라미는 굽은 선으로 되어 있어서 다각형이 아니에요.' },
    { type: 'write', glyph: '변', say: '변' },
    { type: 'write', glyph: '육각형', say: '육각형' },
    { type: 'quiz', gen: 'poly' }, { type: 'quiz', gen: 'poly' },
  ] },
];

// 단계: 나이 대신 귀여운 이름 (나이는 작게). 씨앗만 무료, 새싹·나무는 새싹수학 플러스(Store.hasMath)
const MATH_STAGES = [
  { id: 'seed', icon: '🌰', name: '씨앗', age: '5~6세쯤', desc: '수와 모양 놀이', free: true },
  { id: 'sprout', icon: '🌱', name: '새싹', age: '7~8세쯤', desc: '셈과 퍼즐' },
  { id: 'tree', icon: '🌳', name: '나무', age: '9~10세쯤', desc: '곱셈·분수·도형' },
];
// 주제 카드: 개념 레슨(lessons) + 퍼즐(game, MATH_GAMES) + 워크시트(ws: 한 줄 요약 sum, 따라 쓰기 trace, 문제 gen·args)
const MATH_TOPICS = [
  { id: 'count', stage: 'seed', icon: 'math-count', title: '수 세기', lessons: ['num1', 'num2'], game: 'count',
    ws: { sum: '물건을 하나씩 짚으며 세면, 마지막에 말한 수가 모두의 개수예요.', trace: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], gen: 'count', args: [1, 10], n: 8 } },
  { id: 'shape', stage: 'seed', icon: 'math-shape', title: '모양', lessons: ['shape'], game: 'shape',
    ws: { sum: '세모는 뾰족한 곳이 셋, 네모는 넷, 동그라미는 뾰족한 곳이 없어요.', trace: ['세모', '네모', '동그라미'], gen: 'shape', n: 6 } },
  { id: 'group', stage: 'seed', icon: '🧺', title: '같은 것끼리', lessons: ['group'], game: 'odd',
    ws: { sum: '같은 성질을 가진 것끼리 모은 무리를 집합이라고 해요.', trace: ['집합', '과일', '동물'], gen: 'odd', n: 6 } },
  { id: 'pattern', stage: 'seed', icon: 'math-pattern', title: '규칙 찾기', lessons: ['pattern'], game: 'pattern',
    ws: { sum: '똑같은 차례가 되풀이되는 것을 규칙이라고 해요. 한 묶음을 찾으면 다음을 알 수 있어요.', trace: ['규칙', '다음'], gen: 'pattern', n: 6 } },
  { id: 'addsub', stage: 'sprout', icon: 'math-mental', title: '더하기·빼기', lessons: ['add', 'sub'], game: 'mental',
    ws: { sum: '합치는 것은 더하기(+), 덜어 내는 것은 빼기(−)예요. 같다는 등호(=)로 써요.', trace: ['+', '−', '=', '더하기', '빼기'], gen: 'mental', n: 8 } },
  { id: 'magic', stage: 'sprout', icon: 'math-magic', title: '마방진', lessons: ['magic'], game: 'magic',
    ws: { sum: '3×3 마방진은 가로·세로·대각선 세 수의 합이 모두 15예요. 가운데는 늘 5예요.', trace: ['15', '마방진'], grid: 'magic', n: 4 } },
  { id: 'sudoku', stage: 'sprout', icon: 'math-sudoku', title: '스도쿠', lessons: ['sudoku'], game: 'sudoku',
    ws: { sum: '가로줄·세로줄·굵은 네모 안에 1, 2, 3, 4가 한 번씩만 들어가요.', trace: ['1', '2', '3', '4'], grid: 'sudoku', n: 4 } },
  { id: 'mul', stage: 'tree', icon: '✖️', title: '곱셈', lessons: ['mul'], game: 'mul',
    ws: { sum: '같은 수를 여러 번 더할 때는 곱하기(×)로 한 번에 셀 수 있어요. 순서를 바꿔 곱해도 답은 같아요.', trace: ['×', '곱하기'], gen: 'mul', n: 8 } },
  { id: 'frac', stage: 'tree', icon: '🍕', title: '분수', lessons: ['frac'], game: 'frac',
    ws: { sum: '똑같이 나눈 것 가운데 몇 개인지 나타내는 수가 분수예요. 아래는 분모, 위는 분자예요.', trace: ['분수', '분모', '분자', '3/4'], gen: 'frac', n: 8 } },
  { id: 'factor', stage: 'tree', icon: '🍪', title: '약수와 배수', lessons: ['factor'], game: 'factor',
    ws: { sum: '어떤 수를 남김없이 나누는 수는 약수, 어떤 수에 1, 2, 3…을 곱한 수는 배수예요.', trace: ['약수', '배수'], gen: 'factor', n: 8 } },
  { id: 'angle', stage: 'tree', icon: '📐', title: '각', lessons: ['angle'], game: 'angle',
    ws: { sum: '직각은 90도예요. 직각보다 작으면 예각, 크면 둔각이에요.', trace: ['직각', '예각', '둔각', '90°'], gen: 'angle', n: 6 } },
  { id: 'poly', stage: 'tree', icon: '🐝', title: '다각형', lessons: ['poly'], game: 'poly',
    ws: { sum: '곧은 선으로만 둘러싸인 도형이 다각형이에요. 변의 수와 꼭짓점의 수는 같아요.', trace: ['변', '꼭짓점', '육각형'], gen: 'poly', n: 6 } },
];

// ── 천재 이야기 (① 1분): 옛날 수수께끼·발견을 새싹스쿨이 새로 쓴 짧은 이야기. 책의 문장·그림은 쓰지 않는다
// 그림(viz)은 mathViz: scene{items} · pair{a,b,n} · rope · count · seq · group · shape · grid
const MATH_STORIES = {
  count: { card: { icon: '🪨', name: '돌멩이 양치기', line: '하나에 하나씩 짝지어 세었어요' }, pages: [
    { viz: { k: 'scene', items: ['⛰️', '🐑', '🐑', '🐑', '🌿'] }, text: '아주 먼 옛날, 숫자가 없던 때에 양을 치는 아이가 있었대요. 양들은 아침마다 풀을 먹으러 나갔다가 저녁에 돌아왔어요.' },
    { viz: { k: 'pair', a: '🐑', b: '🪨', n: 5 }, text: '아이는 꾀를 냈어요. 양 한 마리가 나갈 때마다 주머니에 돌멩이를 하나씩 넣었어요.' },
    { viz: { k: 'pair', a: '🐑', b: '🪨', n: 5, miss: 1 }, text: '저녁에는 양 한 마리가 들어올 때마다 돌멩이를 하나씩 꺼냈어요. 돌멩이가 남으면, 아직 돌아오지 않은 양이 있다는 뜻이에요.' },
    { viz: { k: 'count', e: '🪨', n: 5 }, text: '이렇게 하나에 하나씩 짝지어 세는 생각에서 수가 생겨났대요. 우리도 하나씩 짚으며 세어 볼까요?' },
  ] },
  shape: { card: { icon: '🪢', name: '밧줄 당기는 사람', line: '밧줄로 세모를 만들었어요' }, pages: [
    { viz: { k: 'scene', items: ['🌊', '🌾', '🌾', '🌾', '🏠'] }, text: '옛날 이집트에는 큰 강이 있었어요. 해마다 강물이 넘치면 밭과 밭 사이의 경계가 지워졌대요.' },
    { viz: { k: 'rope' }, text: '그래서 밧줄 당기는 사람들이 나섰어요. 매듭을 똑같은 간격으로 묶은 긴 밧줄을 들고 왔지요.' },
    { viz: { k: 'rope', tri: true }, text: '세 사람이 밧줄을 팽팽하게 당겨 세 군데를 잡으면, 곧은 선 세 개로 된 세모가 생겼어요.' },
    { viz: { k: 'shape', s: 'all' }, text: '세모와 네모로 밭을 반듯하게 다시 나눌 수 있었대요. 우리도 모양을 알아볼까요?' },
  ] },
  group: { card: { icon: '🌿', name: '린네', line: '닮은 것끼리 무리를 지었어요' }, pages: [
    { viz: { k: 'scene', items: ['🌸', '🐞', '🌿', '🦋'] }, text: '옛날 스웨덴에 꽃과 벌레를 아주 좋아하는 린네라는 아이가 있었어요.' },
    { viz: { k: 'scene', items: ['🌸', '🐦', '🌻', '🐟', '🦋', '🌷', '🐞', '🐠'] }, text: '어른이 된 린네는 세상의 식물과 동물에 이름을 붙이고 싶었어요. 그런데 너무 많아서 헷갈렸대요.' },
    { viz: { k: 'group', groups: [['🌸', '🌻', '🌷'], ['🐟', '🐠'], ['🦋', '🐞']] }, text: '린네는 닮은 것끼리 무리를 지어 모았어요. 꽃은 꽃끼리, 물고기는 물고기끼리 모으니 한눈에 보였어요.' },
    { viz: { k: 'group', groups: [['🍎', '🍓', '🍌'], ['🐶', '🐱', '🐥']] }, text: '같은 성질을 가진 것끼리 모은 무리를 집합이라고 해요. 우리도 바구니에 모아 볼까요?' },
  ] },
  pattern: { card: { icon: '🌕', name: '달을 보는 사람', line: '되풀이되는 달 모양을 찾았어요' }, pages: [
    { viz: { k: 'scene', items: ['🌃', '🌙', '⭐', '✨'] }, text: '아주 옛날 사람들은 밤마다 하늘의 달을 올려다보았어요.' },
    { viz: { k: 'seq', items: ['🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'] }, text: '달은 가느다란 눈썹 모양에서 점점 차올라 동그래지고, 다시 가늘어졌어요.' },
    { viz: { k: 'seq', items: ['🌓', '🌕', '🌗', '🌑', '🌓', '🌕', '🌗', '?'] }, text: '사람들은 달 모양이 똑같은 차례로 되풀이된다는 것을 알아챘어요. 그래서 다음 보름달이 언제 뜰지 맞힐 수 있었대요.' },
    { viz: { k: 'seq', items: ['🍎', '🍌', '🍎', '🍌', '🍎', '?'] }, text: '되풀이되는 차례를 찾으면 다음을 알 수 있어요. 이것이 바로 규칙이에요!' },
  ] },
  magic: { card: { icon: '🐢', name: '낙서 거북', line: '등딱지에 신기한 판이 있었어요' }, pages: [
    { viz: { k: 'scene', items: ['🌧️', '🌊', '🐢'] }, text: '옛날 중국에 큰 홍수가 났을 때, 강에서 커다란 거북이 한 마리 나왔대요.' },
    { viz: { k: 'grid', n: 3, vals: [4, 9, 2, 3, 5, 7, 8, 1, 6] }, text: '거북의 등딱지에는 점들이 세 줄, 세 칸으로 새겨져 있었어요. 점의 수를 숫자로 쓰면 이렇게 돼요.' },
    { viz: { k: 'grid', n: 3, vals: [4, 9, 2, 3, 5, 7, 8, 1, 6] }, text: '가로로 더해도, 세로로 더해도, 비스듬히 더해도 모두 15였어요. 사람들은 깜짝 놀랐대요.' },
    { viz: { k: 'scene', items: ['✨', '🔢', '✨'] }, text: '이렇게 어느 줄을 더해도 같은 수가 되는 판을 마방진이라고 해요. 우리도 만들어 볼까요?' },
  ] },
};

// 틀렸을 때: 1번 틀리면 힌트 한 줄(음성도), 2번 틀리면 그림 풀이
const MATH_HINTS = {
  count: '하나씩 손가락으로 짚으면서 세어 봐요.',
  shape: '뾰족한 곳을 세어 봐요. 세모는 셋, 네모는 넷, 동그라미는 하나도 없어요.',
  odd: '과일인지 동물인지, 무리 이름을 붙여 봐요.',
  pattern: '되풀이되는 한 묶음을 먼저 찾아봐요.',
  mental: '더하기는 합치기, 빼기는 덜어 내기예요. 손가락으로 세어 봐도 좋아요.',
  mul: '곱하기는 같은 수를 여러 번 더한 것과 같아요.',
  frac: '아래 수는 모두 몇 조각인지, 위 수는 색칠한 조각이 몇 개인지예요.',
  factor: '약수는 남김없이 나누어떨어지는 수, 배수는 곱셈구구에 나오는 수예요.',
  angle: '공책 모서리 같은 직각과 견주어 봐요.',
  poly: '곧은 선을 하나씩 세어 봐요.',
};
// 씨앗 문제·조작 놀이에서 읽어 주는 말 (pregen-tts-ko.js가 함께 음성을 만든다)
const MATH_THINGS = [['🍎', '사과는'], ['🐥', '병아리는'], ['⭐', '별은'], ['🌸', '꽃은'], ['🚗', '자동차는'], ['🎈', '풍선은'], ['🐟', '물고기는'], ['🍓', '딸기는'], ['🐶', '강아지는'], ['⚽', '공은']];
// 세는 말(단위): 동물은 마리, 탈것은 대, 꽃은 송이, 나머지 물건은 개
const MATH_UNIT = { '🐥': '마리', '🐶': '마리', '🐱': '마리', '🐟': '마리', '🐰': '마리', '🚗': '대', '🚲': '대', '🌸': '송이', '🌷': '송이' };
const mUnit = e => MATH_UNIT[e] || '개';
const MATH_UNITS = ['개', '마리', '대', '송이'];
const MATH_NATIVE = ['하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열하나', '열둘', '열셋', '열넷', '열다섯'];
const MATH_CNT = ['한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
const MATH_SAY = {
  shape: { tri: '세모를 골라요', sq: '네모를 골라요', circ: '동그라미를 골라요' },
  shapeHard: { tri: '뾰족한 곳이 세 군데인 모양을 골라요', sq: '뾰족한 곳이 네 군데인 모양을 골라요', circ: '뾰족한 곳이 없는 모양을 골라요' },
  odd: '다른 무리에 들어가는 것을 골라요', pattern: '빈칸에 올 것을 골라요',
  right: '맞았어요!', look: '그림을 보고 정답을 찾아봐요.', sorted: '잘 모았어요!', wrongBasket: '다른 바구니예요. 다시 생각해 봐요.',
  extended: '규칙을 찾았어요!', card: '천재 카드를 받았어요!',
};
const MATH_VOICE = [
  ...MATH_NATIVE, ...MATH_UNITS.flatMap(u => MATH_CNT.map(c => `모두 ${c} ${u}예요!`)), '뾰족한 곳이 세 군데예요!', '뾰족한 곳이 네 군데예요!',
  ...MATH_THINGS.map(([e, n]) => `${n} 몇 ${mUnit(e)}일까요?`), ...Object.values(MATH_SAY.shape), ...Object.values(MATH_SAY.shapeHard),
  MATH_SAY.odd, MATH_SAY.pattern, MATH_SAY.right, MATH_SAY.look, MATH_SAY.sorted, MATH_SAY.wrongBasket, MATH_SAY.extended, MATH_SAY.card,
];
