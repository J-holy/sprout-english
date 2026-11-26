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
  { id: 'num3', stage: 'seed', icon: '🧺', title: '열씩 묶어 세기', topic: '수의 기원', game: 'big', steps: [
    { type: 'learn', viz: { k: 'b10', n: 23 }, text: '물건이 많으면 하나씩 세다가 헷갈리기 쉬워요. 열 개씩 묶어 두면 한눈에 셀 수 있어요. 막대 하나가 열 개 한 묶음이에요.' },
    { type: 'bundle', e: '🍓', n: 23, text: '딸기를 하나씩 눌러 바구니에 담아요. 열 개가 차면 한 묶음이 돼요.' },
    { type: 'learn', viz: { k: 'b10', n: 34, label: true }, text: '묶음이 세 개, 낱개가 네 개면 삼십사예요. 묶음 수는 앞에, 낱개 수는 뒤에 써요. 앞자리를 십의 자리, 뒷자리를 일의 자리라고 해요.' },
    { type: 'tens', target: 47, text: '십 묶음과 낱개 단추를 눌러서 사십칠을 만들어 봐요.' },
    { type: 'write', glyph: '34', say: '삼십사' },
    { type: 'quiz', gen: 'big', lv: 0 }, { type: 'quiz', gen: 'big', lv: 0 },
  ] },
  { id: 'num4', stage: 'seed', icon: '💯', title: '백까지 세기', topic: '수의 기원', game: 'big', steps: [
    { type: 'learn', viz: { k: 'hund' }, text: '1부터 100까지 수를 열 줄로 늘어놓은 판이에요. 오른쪽으로 한 칸 가면 1이 커지고, 아래로 한 칸 내려가면 10이 커져요.' },
    { type: 'hop', start: 10, step: 10, count: 10, max: 100, by: 5, text: '10에서 시작해서 10씩 뛰어 세어 봐요. 100까지 가 볼까요?' },
    { type: 'learn', viz: { k: 'b10', n: 100 }, text: '십 묶음이 열 개 모이면 100, 백이에요. 백은 세 자리 수의 시작이에요.' },
    { type: 'learn', viz: { k: 'b10cmp', a: 47, b: 52 }, text: '두 수 가운데 어느 쪽이 큰지는 십의 자리부터 봐요. 사십칠과 오십이에서는 십의 자리 5가 4보다 크니까 오십이가 더 커요.' },
    { type: 'write', glyph: '100', say: '백' },
    { type: 'quiz', gen: 'big', lv: 1 }, { type: 'quiz', gen: 'big', lv: 2 },
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
  { id: 'blocks', stage: 'seed', icon: '🧱', title: '쌓기나무', topic: '쌓기나무', steps: [
    { type: 'learn', viz: { k: 'blocks', h: [[1]] }, text: '쌓기나무는 반듯한 상자 모양의 나무 조각이에요. 위에서 봐도, 앞에서 봐도, 옆에서 봐도 모두 네모예요.' },
    { type: 'learn', viz: { k: 'blocks', h: [[3]] }, text: '쌓기나무를 위로 쌓으면 층이 생겨요. 위에 있는 쌓기나무는 아래 쌓기나무가 받치고 있어요.' },
    { type: 'build', target: [1, 2, 3], text: '한 층, 두 층, 세 층 계단을 쌓아 봐요. 더하기 단추를 누르면 하나씩 올라가요.' },
    { type: 'learn', viz: { k: 'blocks', h: [[2, 1], [1, 1]] }, text: '뒤에 있는 쌓기나무는 앞에 가려서 다 보이지 않을 때도 있어요. 칸마다 몇 층인지 세어 더하면 모두 몇 개인지 알 수 있어요.' },
    { type: 'write', glyph: '층', say: '층' },
    { type: 'quiz', gen: 'blocks' }, { type: 'quiz', gen: 'blocks' },
  ] },
  { id: 'table', stage: 'seed', icon: '📊', title: '그림 표 읽기', topic: '표 만들기', steps: [
    { type: 'learn', viz: { k: 'scene', items: ['🍎', '🍌', '🍎', '🍓', '🍌', '🍎'] }, text: '과일이 섞여 있으면 무엇이 몇 개인지 한눈에 알기 어려워요.' },
    { type: 'tally', rows: ['🍎', '🍌', '🍓'], items: ['🍎', '🍎', '🍎', '🍌', '🍌', '🍓'], text: '과일을 하나씩 눌러서 표의 제자리로 옮겨 봐요.' },
    { type: 'learn', viz: { k: 'table', rows: [['🍎', 3], ['🍌', 2], ['🍓', 1]] }, text: '종류별로 한 줄에 모은 것을 표라고 해요. 사과 줄이 가장 길어서, 사과가 가장 많다는 것을 바로 알 수 있어요.' },
    { type: 'write', glyph: '표', say: '표' },
    { type: 'quiz', gen: 'table' }, { type: 'quiz', gen: 'table' },
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
  { id: 'venn', stage: 'sprout', icon: '⭕', title: '벤 다이어그램', topic: '벤 다이어그램', steps: [
    { type: 'learn', viz: { k: 'venn', A: '과일', B: '빨간' }, text: '과일 동그라미와 빨간 것 동그라미를 살짝 겹쳐 그렸어요. 두 무리에 모두 들어가는 것은 가운데 겹친 곳에 넣어요. 이런 그림을 벤 다이어그램이라고 해요.' },
    { type: 'sort', groups: [['🔵 과일에만', ['🍌', '🍏']], ['🩷 빨간 것에만', ['🚒', '🐞']], ['🟣 겹친 곳', ['🍎', '🍓']], ['⬜ 바깥', ['🐸', '🚕']]], text: '하나를 누르고, 들어갈 곳을 눌러서 옮겨 봐요. 과일이면서 빨간 것은 겹친 곳이에요.' },
    { type: 'learn', viz: { k: 'venn', A: '과일', B: '빨간', items: ['🍌', '🍏', '🚒', '🐞', '🍎', '🍓', '🐸', '🚕'] }, text: '사과와 딸기는 과일이면서 빨개서 겹친 곳에 있어요. 바나나는 과일이지만 빨갛지 않아서 과일 쪽에만 있어요. 개구리는 둘 다 아니라서 바깥에 있어요.' },
    { type: 'write', glyph: '겹친 곳', say: '겹친 곳' },
    { type: 'quiz', gen: 'venn' }, { type: 'quiz', gen: 'venn' },
  ] },
  { id: 'graph', stage: 'sprout', icon: '📈', title: '막대그래프', topic: '그래프', steps: [
    { type: 'learn', viz: { k: 'bar', rows: [['🍎', 5], ['🍌', 3], ['🍇', 6]], table: true }, text: '표에 적은 수를 막대 길이로 그리면 그래프가 돼요. 막대가 길수록 많다는 뜻이에요.' },
    { type: 'bars', rows: [['🍎', 4], ['🍓', 2], ['🍌', 5]], text: '표를 보고 더하기 단추로 막대를 올려서 그래프를 만들어 봐요.' },
    { type: 'learn', viz: { k: 'bar', rows: [['🍎', 4], ['🍓', 2], ['🍌', 5]], hi: [2] }, text: '가장 긴 막대가 가장 많은 것이에요. 막대 끝에서 옆으로 줄을 따라가면 몇인지 읽을 수 있어요.' },
    { type: 'write', glyph: '그래프', say: '그래프' },
    { type: 'quiz', gen: 'graph' }, { type: 'quiz', gen: 'graph' },
  ] },
  { id: 'path', stage: 'sprout', icon: '🗺️', title: '가장 짧은 길', topic: '최단 거리', steps: [
    { type: 'learn', viz: { k: 'path', W: 4, H: 3, s: [0, 2], g: [3, 0] }, text: '집에서 학교까지 가는 길은 여러 가지예요. 칸을 하나 지날 때마다 한 걸음이에요.' },
    { type: 'walk', W: 4, H: 3, s: [0, 2], g: [3, 0], text: '집 옆 칸을 눌러 한 걸음씩 학교까지 가 봐요. 몇 걸음이면 갈 수 있을까요?' },
    { type: 'learn', viz: { k: 'path', W: 4, H: 3, s: [0, 2], g: [3, 0], best: true }, text: '오른쪽과 위쪽으로만 가면 돌아가지 않아서 가장 짧아요. 오른쪽 세 칸, 위로 두 칸이니까 다섯 걸음이에요.' },
    { type: 'walk', W: 5, H: 4, s: [0, 3], g: [4, 0], walls: ['2,2', '2,1', '3,3'], text: '이번에는 나무를 피해서 가장 짧은 길로 가 봐요.' },
    { type: 'write', glyph: '거리', say: '거리' },
    { type: 'quiz', gen: 'path' }, { type: 'quiz', gen: 'path' },
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
  { id: 'seq', stage: 'tree', icon: '🐇', title: '수의 규칙', topic: '등차수열·피보나치수열', steps: [
    { type: 'learn', viz: { k: 'nseq', items: [2, 4, 6, 8, 10], labels: ['+2', '+2', '+2', '+2'] }, text: '2, 4, 6, 8, 10. 앞 수에 2씩 더해 가는 규칙이 있어요. 같은 수만큼 커지는 규칙을 찾으면 다음 수를 알 수 있어요.' },
    { type: 'hop', start: 3, step: 3, count: 6, max: 20, text: '3에서 시작해서 3씩 뛰어 세어 봐요. 다음 수를 차례로 눌러요.' },
    { type: 'learn', viz: { k: 'nseq', items: [1, 1, 2, 3, 5, 8] }, text: '1, 1, 2, 3, 5, 8. 앞의 두 수를 더하면 다음 수가 되는 규칙도 있어요. 이 수의 줄을 피보나치 수열이라고 해요.' },
    { type: 'write', glyph: '수열', say: '수열' },
    { type: 'quiz', gen: 'seq' }, { type: 'quiz', gen: 'seq' },
  ] },
  { id: 'cipher', stage: 'tree', icon: '🗝️', title: '암호', topic: '암호', steps: [
    { type: 'learn', viz: { k: 'key' }, text: '글자마다 수를 하나씩 정해 두면 글자를 수로 바꿔 쓸 수 있어요. 정해 둔 약속을 아는 사람만 읽을 수 있는 글을 암호라고 해요.' },
    { type: 'decode', nums: [6, 3], text: '6과 3을 표에서 찾아, 알맞은 글자를 차례로 눌러 암호를 풀어 봐요.' },
    { type: 'learn', viz: { k: 'cshift', w: '바다', s: 1 }, text: '약속을 바꾸면 같은 낱말도 다른 암호가 돼요. 글자를 표에서 한 칸씩 뒤로 밀어 쓰면 바다는 사라가 돼요.' },
    { type: 'decode', nums: [7, 9], text: '이번 암호는 7과 9예요. 무슨 동물일까요?' },
    { type: 'write', glyph: '암호', say: '암호' },
    { type: 'quiz', gen: 'cipher' }, { type: 'quiz', gen: 'cipher' },
  ] },
  { id: 'masked', stage: 'tree', icon: '🎭', title: '복면산', topic: '복면산', steps: [
    { type: 'learn', viz: { k: 'eq', rows: ['🍎 + 🍎 = 6'] }, text: '숫자 대신 그림이 가면을 쓰고 있는 셈을 복면산이라고 해요. 같은 그림에는 같은 수가 들어가요. 사과 두 개를 더해 6이니까 사과는 3이에요.' },
    { type: 'guess', e: '🍌', a: 3, sum: 7, text: '바나나에 어떤 수를 넣으면 맞을까요? 수를 눌러 확인해 봐요.' },
    { type: 'learn', viz: { k: 'col', rows: ['2🍓', '15', '41'] }, text: '두 자리 셈에서도 가려진 숫자를 찾을 수 있어요. 더하기를 거꾸로 빼기로 바꾸면 돼요. 41에서 15를 빼면 26이니까 딸기는 6이에요.' },
    { type: 'guess', e: '⭐', a: 8, sum: 15, text: '별에 어떤 수를 넣으면 맞을까요?' },
    { type: 'write', glyph: '복면산', say: '복면산' },
    { type: 'quiz', gen: 'masked' }, { type: 'quiz', gen: 'masked' },
  ] },
  { id: 'cases', stage: 'tree', icon: '🎲', title: '경우의 수', topic: '경우의 수', steps: [
    { type: 'learn', viz: { k: 'pick', groups: [['🧢', '👒'], ['👕', '👚']] }, text: '모자 두 개와 윗옷 두 개가 있어요. 하나씩 골라 입는 방법은 몇 가지일까요?' },
    { type: 'combo', a: ['🧢', '👒'], b: ['👕', '👚'], text: '모자 하나와 윗옷 하나를 눌러서 짝을 지어 봐요. 다른 짝을 모두 찾아요.' },
    { type: 'learn', viz: { k: 'combo', a: ['🧢', '👒'], b: ['👕', '👚'] }, text: '모자마다 윗옷을 두 가지씩 입을 수 있어서 2 곱하기 2, 네 가지예요. 표를 그려 하나씩 짝지으면 빠뜨리지 않아요. 일어날 수 있는 가짓수를 경우의 수라고 해요.' },
    { type: 'combo', a: ['🧢', '👒', '🎩'], b: ['👕', '👚'], text: '이번에는 모자가 세 개예요. 짝을 모두 찾아봐요.' },
    { type: 'write', glyph: '가지', say: '가지' },
    { type: 'quiz', gen: 'cases' }, { type: 'quiz', gen: 'cases' },
  ] },
  { id: 'area', stage: 'tree', icon: '🟦', title: '넓이와 둘레', topic: '평면도형의 측정', steps: [
    { type: 'learn', viz: { k: 'cells', W: 5, H: 3, rect: [3, 2, 1, 0], nums: true }, text: '넓이는 작은 네모가 몇 개 들어가는지로 잴 수 있어요. 이 모양은 작은 네모 여섯 개만큼 넓어요.' },
    { type: 'paint', W: 5, H: 4, n: 6, text: '칸을 눌러 넓이가 6인 모양을 칠해 봐요. 칸끼리 붙어 있어야 해요.' },
    { type: 'learn', viz: { k: 'cells', W: 5, H: 3, rect: [3, 2, 1, 0], edge: true }, text: '둘레는 모양의 바깥 선 길이예요. 작은 선을 하나씩 세면 돼요. 가로 3칸, 세로 2칸인 네모의 둘레는 작은 선 열 개예요.' },
    { type: 'write', glyph: '넓이', say: '넓이' },
    { type: 'write', glyph: '둘레', say: '둘레' },
    { type: 'quiz', gen: 'area' }, { type: 'quiz', gen: 'area' },
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
  { id: 'count', stage: 'seed', icon: 'math-count', title: '수 세기', lessons: ['num1', 'num2', 'num3', 'num4'], game: 'count', games: ['count', 'big'],
    ws: { sum: '물건을 하나씩 짚으며 세면, 마지막에 말한 수가 모두의 개수예요.', trace: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], gen: 'count', args: [1, 10], n: 8 } ,
    wsMore: { big: { title: '큰 수', sum: '열 개씩 묶으면 십 묶음 하나예요. 십 묶음 몇 개와 낱개 몇 개로 큰 수를 나타내요. 십 묶음이 열 개면 100이에요.', trace: ['10', '34', '100'], gen: 'big', n: 8, mix: true } } },
  { id: 'shape', stage: 'seed', icon: 'math-shape', title: '모양', lessons: ['shape'], game: 'shape',
    ws: { sum: '세모는 뾰족한 곳이 셋, 네모는 넷, 동그라미는 뾰족한 곳이 없어요.', trace: ['세모', '네모', '동그라미'], gen: 'shape', n: 6 } },
  { id: 'group', stage: 'seed', icon: '🧺', title: '같은 것끼리', lessons: ['group'], game: 'odd',
    ws: { sum: '같은 성질을 가진 것끼리 모은 무리를 집합이라고 해요.', trace: ['집합', '과일', '동물'], gen: 'odd', n: 6 } },
  { id: 'pattern', stage: 'seed', icon: 'math-pattern', title: '규칙 찾기', lessons: ['pattern'], game: 'pattern',
    ws: { sum: '똑같은 차례가 되풀이되는 것을 규칙이라고 해요. 한 묶음을 찾으면 다음을 알 수 있어요.', trace: ['규칙', '다음'], gen: 'pattern', n: 6 } },
  { id: 'blocks', stage: 'seed', icon: '🧱', title: '쌓기나무', lessons: ['blocks'], game: 'blocks',
    ws: { sum: '쌓기나무는 칸마다 몇 층인지 세어 더해요. 위에 있는 쌓기나무 아래에는 받치는 쌓기나무가 꼭 있어요.', trace: ['층', '쌓기나무'], gen: 'blocks', n: 6 } },
  { id: 'table', stage: 'seed', icon: '📊', title: '그림 표', lessons: ['table'], game: 'table',
    ws: { sum: '섞여 있는 것을 종류별로 한 줄에 모으면 표가 돼요. 표를 보면 무엇이 많고 적은지 한눈에 알 수 있어요.', trace: ['표', '많다', '적다'], gen: 'table', n: 6 } },
  { id: 'addsub', stage: 'sprout', icon: 'math-mental', title: '더하기·빼기', lessons: ['add', 'sub'], game: 'mental',
    ws: { sum: '합치는 것은 더하기(+), 덜어 내는 것은 빼기(−)예요. 같다는 등호(=)로 써요.', trace: ['+', '−', '=', '더하기', '빼기'], gen: 'mental', n: 8 } },
  { id: 'magic', stage: 'sprout', icon: 'math-magic', title: '마방진', lessons: ['magic'], game: 'magic',
    ws: { sum: '3×3 마방진은 가로·세로·대각선 세 수의 합이 모두 15예요. 가운데는 늘 5예요.', trace: ['15', '마방진'], grid: 'magic', n: 4 } },
  { id: 'sudoku', stage: 'sprout', icon: 'math-sudoku', title: '스도쿠', lessons: ['sudoku'], game: 'sudoku',
    ws: { sum: '가로줄·세로줄·굵은 네모 안에 1, 2, 3, 4가 한 번씩만 들어가요.', trace: ['1', '2', '3', '4'], grid: 'sudoku', n: 4 } },
  { id: 'venn', stage: 'sprout', icon: '⭕', title: '벤 다이어그램', lessons: ['venn'], game: 'venn',
    ws: { sum: '두 무리를 동그라미로 그려 겹치면, 두 무리에 모두 드는 것은 겹친 곳에 넣어요. 이런 그림을 벤 다이어그램이라고 해요.', trace: ['겹친 곳', '바깥'], gen: 'venn', n: 6 } },
  { id: 'graph', stage: 'sprout', icon: '📈', title: '막대그래프', lessons: ['graph'], game: 'graph',
    ws: { sum: '수를 막대 길이로 나타낸 것이 막대그래프예요. 가장 긴 막대가 가장 많아요.', trace: ['그래프', '막대'], gen: 'graph', n: 6 } },
  { id: 'path', stage: 'sprout', icon: '🗺️', title: '가장 짧은 길', lessons: ['path'], game: 'path',
    ws: { sum: '돌아가지 않고 학교 쪽으로만 가면 가장 짧아요. 가로 칸 수와 세로 칸 수를 더하면 가장 짧은 걸음 수예요.', trace: ['거리', '짧다'], gen: 'path', n: 6 } },
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
  { id: 'seq', stage: 'tree', icon: '🐇', title: '수의 규칙', lessons: ['seq'], game: 'seq',
    ws: { sum: '같은 수만큼 커지거나, 앞의 두 수를 더하는 것처럼 수의 줄에는 규칙이 있어요. 규칙을 찾으면 다음 수를 알 수 있어요.', trace: ['수열', '+3'], gen: 'seq', n: 8 } },
  { id: 'cipher', stage: 'tree', icon: '🗝️', title: '암호', lessons: ['cipher'], game: 'cipher',
    ws: { sum: '글자마다 수를 정해 두면 글자를 수로 바꿔 쓸 수 있어요. 약속을 아는 사람만 읽을 수 있는 글이 암호예요.', trace: ['암호', '약속'], gen: 'cipher', n: 6 } },
  { id: 'masked', stage: 'tree', icon: '🎭', title: '복면산', lessons: ['masked'], game: 'masked',
    ws: { sum: '숫자 대신 그림이 가면을 쓴 셈이 복면산이에요. 같은 그림에는 같은 숫자가 들어가요. 더하기를 거꾸로 빼기로 바꿔 찾아요.', trace: ['복면산', '='], gen: 'masked', n: 8 } },
  { id: 'cases', stage: 'tree', icon: '🎲', title: '경우의 수', lessons: ['cases'], game: 'cases',
    ws: { sum: '일어날 수 있는 가짓수를 경우의 수라고 해요. 표를 그려 하나씩 짝지으면 빠뜨리지 않고 셀 수 있어요.', trace: ['가지', '경우'], gen: 'cases', n: 6 } },
  { id: 'area', stage: 'tree', icon: '🟦', title: '넓이와 둘레', lessons: ['area'], game: 'area',
    ws: { sum: '넓이는 작은 네모가 몇 개 들어가는지, 둘레는 바깥 선이 몇 개인지로 잴 수 있어요.', trace: ['넓이', '둘레'], gen: 'area', n: 6 } },
];

// ── 수학 이야기 (① 1분): 옛날 수수께끼·발견을 새싹스쿨이 새로 쓴 짧은 이야기. 책의 문장·그림은 쓰지 않는다
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

// ── 씨앗 더하기 (2026-11-27): 쌓기나무 · 그림 표 읽기 ──
const MATH_NAMES = { '🍎': '사과', '🍓': '딸기', '🍌': '바나나', '🍇': '포도', '🐶': '강아지', '🐱': '고양이', '🐥': '병아리', '🐟': '물고기' };
Object.assign(MATH_STORIES, {
  blocks: { card: { icon: '🧱', name: '탑 쌓는 장인', line: '층마다 세어 더했어요' }, pages: [
    { viz: { k: 'scene', items: ['⛰️', '🧱', '🛕'] }, text: '옛날 어느 마을에 돌을 반듯하게 다듬어 탑을 쌓는 장인이 있었대요.' },
    { viz: { k: 'blocks', h: [[1, 1, 1]] }, text: '장인은 맨 아래층에 돌을 나란히 놓았어요. 아래층이 튼튼해야 위층을 올릴 수 있거든요.' },
    { viz: { k: 'blocks', h: [[3, 2, 1]] }, text: '한 층씩 올릴 때마다 장인은 돌을 몇 개 썼는지 세어 두었어요. 층마다 센 수를 더하면 탑에 든 돌이 모두 몇 개인지 알 수 있었지요.' },
    { viz: { k: 'blocks', h: [[2, 1], [1, 1]] }, text: '뒤에 숨어서 안 보이는 돌도 꼭 있어요. 위에 돌이 있으면 그 아래에도 받치는 돌이 있거든요. 우리도 쌓기나무를 세어 볼까요?' },
  ] },
  table: { card: { icon: '🌧️', name: '비를 재는 관리', line: '비 온 양을 표에 적었어요' }, pages: [
    { viz: { k: 'scene', items: ['🌧️', '🌾', '🌾', '🏡'] }, text: '옛날 조선에서는 비가 얼마나 오는지가 아주 중요했어요. 비가 알맞게 와야 벼가 잘 자라니까요.' },
    { viz: { k: 'scene', items: ['🌧️', '🏺', '💧'] }, text: '그래서 비를 받는 그릇을 마을마다 두고, 빗물이 얼마나 고였는지 재었대요.' },
    { viz: { k: 'table', rows: [['🌸', 2, '봄', '💧'], ['☀️', 5, '여름', '💧'], ['🍂', 3, '가을', '💧'], ['⛄', 1, '겨울', '💧']] }, text: '잰 것을 철마다 표에 차례로 적었어요. 표로 모아 두니 언제 비가 가장 많이 왔는지 한눈에 보였어요.' },
    { viz: { k: 'table', rows: [['🍎', 3], ['🍌', 2], ['🍓', 1]] }, text: '흩어진 것을 종류별로 모아 표로 만들면 세기도, 견주기도 쉬워요. 우리도 표를 만들어 볼까요?' },
  ] },
});
Object.assign(MATH_HINTS, {
  blocks: '아래에 숨어 있는 쌓기나무도 있어요. 칸마다 몇 층인지 세어 더해 봐요.',
  table: '표에서 그 줄을 손가락으로 짚고 세어 봐요.',
});
Object.assign(MATH_SAY, { blocksAsk: '쌓기나무는 모두 몇 개일까요?', tableMost: '가장 많은 것은 무엇일까요?', tableLeast: '가장 적은 것은 무엇일까요?', tableDone: '표가 완성됐어요!' });
MATH_VOICE.push(MATH_SAY.blocksAsk, MATH_SAY.tableMost, MATH_SAY.tableLeast, MATH_SAY.tableDone,
  ...Object.keys(MATH_NAMES).map(e => `${MATH_NAMES[e]}는 몇 ${mUnit(e)}일까요?`), ...['개', '마리'].map(u => `모두 몇 ${u}일까요?`));

// ── 새싹 더하기 (2026-11-27): 벤 다이어그램 · 막대그래프 · 가장 짧은 길 ──
Object.assign(MATH_NAMES, { '🍒': '체리', '🍋': '레몬', '🍏': '풋사과', '🐞': '무당벌레', '🐸': '개구리', '🚒': '소방차', '🚕': '택시' });
Object.assign(MATH_STORIES, {
  venn: { card: { icon: '⭕', name: '벤 선생님', line: '동그라미를 겹쳐 그렸어요' }, pages: [
    { viz: { k: 'scene', items: ['🏫', '📚', '✏️'] }, text: '옛날 영국에 벤이라는 선생님이 있었어요. 학생들에게 무리와 무리가 어떻게 겹치는지 쉽게 보여 주고 싶었대요.' },
    { viz: { k: 'venn', A: '과일', B: '빨간' }, text: '벤 선생님은 무리마다 동그라미를 하나씩 그리고, 두 동그라미를 살짝 겹쳐 그렸어요.' },
    { viz: { k: 'venn', A: '과일', B: '빨간', items: ['🍌', '🍏', '🚒', '🐞', '🍎', '🍓', '🐸'] }, text: '두 무리에 모두 들어가는 것은 겹친 곳에, 하나에만 들어가는 것은 그쪽에만 넣었어요. 어디에도 안 들어가는 것은 바깥에 두었지요.' },
    { viz: { k: 'scene', items: ['⭕', '⭕'] }, text: '이 그림은 선생님 이름을 따서 벤 다이어그램이라고 불러요. 우리도 나누어 볼까요?' },
  ] },
  graph: { card: { icon: '📊', name: '막대를 그린 플레이페어', line: '수를 막대로 나타냈어요' }, pages: [
    { viz: { k: 'scene', items: ['🚢', '📦', '⚓'] }, text: '옛날 스코틀랜드에 플레이페어라는 사람이 있었어요. 나라끼리 배로 물건을 사고파는 일을 늘 적어 두었대요.' },
    { viz: { k: 'table', rows: [['🍎', 5], ['🍌', 3], ['🍇', 6]], mode: 'num' }, text: '그런데 수만 적어 두니, 어느 것이 더 많은지 한눈에 보이지 않았어요.' },
    { viz: { k: 'bar', rows: [['🍎', 5], ['🍌', 3], ['🍇', 6]] }, text: '그래서 수만큼 길쭉한 막대를 그려 나란히 세웠어요. 그러자 가장 긴 막대가 가장 많다는 것이 단번에 보였지요.' },
    { viz: { k: 'bar', rows: [['🍎', 5], ['🍌', 3], ['🍇', 6]], hi: [2] }, text: '수를 막대나 그림으로 나타낸 것을 그래프라고 해요. 우리도 그래프를 읽어 볼까요?' },
  ] },
  path: { card: { icon: '🗺️', name: '다익스트라', line: '가까운 곳부터 걸음을 셌어요' }, pages: [
    { viz: { k: 'scene', items: ['☕', '🏙️', '🤔'] }, text: '네덜란드의 다익스트라라는 사람이 카페에 앉아 생각했어요. 두 곳 사이의 가장 짧은 길은 어떻게 찾을까?' },
    { viz: { k: 'path', W: 5, H: 4, s: [0, 3], g: [4, 0], walls: ['2,2', '2,1', '3,3'] }, text: '갈 수 있는 길이 아주 많았어요. 하나하나 다 걸어 보면 너무 오래 걸리지요.' },
    { viz: { k: 'path', W: 5, H: 4, s: [0, 3], g: [4, 0], walls: ['2,2', '2,1', '3,3'], dist: true }, text: '다익스트라는 가까운 칸부터 차례로 몇 걸음인지 적어 나갔어요. 그러면 학교 칸에 적힌 수가 가장 짧은 걸음 수가 되었대요.' },
    { viz: { k: 'path', W: 5, H: 4, s: [0, 3], g: [4, 0], walls: ['2,2', '2,1', '3,3'], best: true }, text: '지금도 길을 알려 주는 지도가 이 생각을 써요. 우리도 가장 짧은 길을 찾아볼까요?' },
  ] },
});
Object.assign(MATH_HINTS, {
  venn: '두 무리에 모두 들어가면 겹친 곳, 하나에만 들어가면 그쪽에만 넣어요.',
  graph: '막대 끝에서 옆으로 줄을 따라가 수를 읽어 봐요.',
  path: '돌아가지 않게, 학교 쪽으로만 가는 길을 찾아 칸을 세어 봐요.',
});
Object.assign(MATH_SAY, { graphDone: '그래프가 완성됐어요!', pathBest: '가장 짧은 길로 왔어요!', pathLonger: '도착했어요! 더 짧은 길도 찾아볼까요?' });
MATH_VOICE.push(MATH_SAY.graphDone, MATH_SAY.pathBest, MATH_SAY.pathLonger);

// ── 나무 더하기 (2026-11-27): 수의 규칙 · 암호 · 복면산 · 경우의 수 · 넓이와 둘레 ──
Object.assign(MATH_STORIES, {
  seq: { card: { icon: '🐇', name: '피보나치', line: '앞의 두 수를 더했어요' }, pages: [
    { viz: { k: 'scene', items: ['🏛️', '📜', '🐇'] }, text: '옛날 이탈리아에 피보나치라는 수학자가 있었어요. 어느 날 토끼 수수께끼를 생각했대요.' },
    { viz: { k: 'scene', items: ['🐇', '🐇', '➡️', '🐇', '🐇', '🐰', '🐰'] }, text: '아기 토끼 한 쌍이 자라 어른이 되면, 달마다 아기 토끼 한 쌍을 낳아요. 그러면 토끼는 몇 쌍이 될까요?' },
    { viz: { k: 'nseq', items: [1, 1, 2, 3, 5, 8] }, text: '달마다 세어 보니 1, 1, 2, 3, 5, 8. 앞의 두 수를 더하면 다음 수가 되었어요.' },
    { viz: { k: 'scene', items: ['🌻', '🐚', '🍍'] }, text: '이 수의 줄은 해바라기 씨앗이나 소라 껍데기 무늬에서도 찾을 수 있대요. 우리도 수의 규칙을 찾아볼까요?' },
  ] },
  cipher: { card: { icon: '🗝️', name: '카이사르', line: '글자를 몇 칸씩 밀어 썼어요' }, pages: [
    { viz: { k: 'scene', items: ['🏛️', '⚔️', '✉️'] }, text: '옛날 로마에 카이사르라는 장군이 있었어요. 멀리 있는 부하에게 몰래 편지를 보내야 했대요.' },
    { viz: { k: 'scene', items: ['✉️', '🕵️', '❓'] }, text: '편지를 누가 가로채 읽으면 큰일이었어요. 그래서 카이사르는 꾀를 냈어요.' },
    { viz: { k: 'cshift', w: '바다', s: 1 }, text: '글자를 몇 칸씩 밀어서 다른 글자로 바꿔 썼대요. 몇 칸 밀었는지 아는 부하만 편지를 풀 수 있었지요.' },
    { viz: { k: 'key' }, text: '이렇게 약속을 아는 사람만 읽을 수 있게 바꾼 글을 암호라고 해요. 우리도 암호를 풀어 볼까요?' },
  ] },
  masked: { card: { icon: '🎭', name: '퍼즐 작가 듀드니', line: '숫자에 가면을 씌웠어요' }, pages: [
    { viz: { k: 'scene', items: ['📰', '🧩', '✏️'] }, text: '옛날 영국에 듀드니라는 퍼즐 작가가 있었어요. 사람들을 즐겁게 하는 수수께끼를 날마다 만들었대요.' },
    { viz: { k: 'eq', rows: ['🍎 + 🍎 = 6'] }, text: '듀드니는 숫자 대신 글자나 그림을 넣은 셈을 냈어요. 숫자가 가면을 쓰고 숨어 있는 셈이지요.' },
    { viz: { k: 'col', rows: ['2🍓', '15', '41'] }, text: '같은 그림에는 같은 숫자가 들어가요. 거꾸로 빼 보거나, 수를 하나씩 넣어 보면서 가면을 벗겼대요.' },
    { viz: { k: 'scene', items: ['🎭', '➡️', '🔢'] }, text: '이렇게 가려진 숫자를 찾는 셈을 복면산이라고 해요. 우리도 가면을 벗겨 볼까요?' },
  ] },
  cases: { card: { icon: '🎲', name: '파스칼', line: '빠짐없이 세었어요' }, pages: [
    { viz: { k: 'scene', items: ['✍️', '🎲', '✉️'] }, text: '옛날 프랑스의 파스칼은 친구와 편지를 주고받으며 주사위 놀이 이야기를 했대요.' },
    { viz: { k: 'scene', items: ['🎲', '🎲'] }, text: '주사위 두 개를 던지면 나올 수 있는 모양이 몇 가지일까? 하나라도 빠뜨리거나 두 번 세면 틀리지요.' },
    { viz: { k: 'combo', a: ['🧢', '👒'], b: ['👕', '👚'] }, text: '파스칼은 표를 그려 하나씩 짝지으며 빠짐없이 세었대요. 그러면 빠뜨리지도, 두 번 세지도 않아요.' },
    { viz: { k: 'scene', items: ['🔢', '✅'] }, text: '일어날 수 있는 가짓수를 경우의 수라고 해요. 우리도 빠짐없이 세어 볼까요?' },
  ] },
});
Object.assign(MATH_HINTS, {
  seq: '앞 수와 뒤 수가 얼마씩 차이 나는지 살펴봐요.',
  cipher: '표에서 글자 아래의 수를 찾아 차례로 바꿔 봐요.',
  masked: '더하기를 거꾸로 빼기로 바꿔 보거나, 수를 하나씩 넣어 봐요.',
  cases: '표를 그려 하나씩 짝지어 빠짐없이 세어 봐요.',
  area: '넓이는 칠한 칸 수, 둘레는 바깥 선의 수예요. 하나씩 세어 봐요.',
});
Object.assign(MATH_SAY, { decoded: '암호를 풀었어요!', painted: '모양을 칠했어요!' });
MATH_VOICE.push(MATH_SAY.decoded, MATH_SAY.painted, ...MATH_CNT.map(c => `모두 ${c} 가지예요!`));

// ── 큰 수 (2026-11-27): 수 세기 주제에 열씩 묶어 세기·백까지 세기·큰 수 퍼즐·큰 수 워크시트 ──
// 양치기 이야기에 이어지는 쪽 (count-4 ~ count-6)
MATH_STORIES.count.pages.push(
  { viz: { k: 'scene', items: ['⛰️', '🐑', '🐑', '🐑', '🐑', '🐑', '🐑'] }, text: '시간이 흘러 양이 아주 많아졌어요. 돌멩이도 너무 많아져서, 주머니가 터질 것 같았대요.' },
  { viz: { k: 'b10', n: 32 }, text: '아이는 돌멩이 열 개를 끈에 꿰어 한 줄로 묶었어요. 한 줄은 양 열 마리라는 뜻이에요. 줄 세 개와 낱개 두 개면 서른두 마리였지요.' },
  { viz: { k: 'b10', n: 100 }, text: '줄이 열 개가 되자, 아이는 열 줄을 큰 끈으로 다시 하나로 묶었어요. 양 백 마리였어요. 열씩 묶어 세면 아무리 많아도 셀 수 있었대요.' },
);
Object.assign(MATH_HINTS, {
  big: '막대 하나는 열 개 한 묶음이에요. 묶음부터 세고, 낱개를 이어서 세어 봐요.',
  bigCompare: '십의 자리 숫자부터 견줘 봐요. 십의 자리가 같으면 일의 자리를 봐요.',
  bigBoard: '100판에서 오른쪽은 1씩, 아래쪽은 10씩 커져요.',
});
MATH_SAY.big = {
  bundle: '모두 몇 개일까요?', pick: '이 수를 나타낸 그림을 골라요', skip10: '10씩 뛰어 세었어요. 빈칸에 알맞은 수를 골라요', skip1: '1씩 뛰어 세었어요. 빈칸에 알맞은 수를 골라요',
  placeTens: '이 수에서 십의 자리 숫자는 무엇일까요?', placeOnes: '이 수에서 일의 자리 숫자는 무엇일까요?', compare: '더 큰 수를 골라요', board: '100판의 빈칸에 알맞은 수를 골라요',
};
MATH_SAY.bundled = '열씩 묶어서 다 셌어요!';
MATH_VOICE.push(...Object.values(MATH_SAY.big), MATH_SAY.bundled, ...Object.values(MATH_HINTS).filter(h => /묶음|십의 자리|100판/.test(h)));
