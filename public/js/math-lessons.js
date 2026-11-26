/* 새싹수학 개념 레슨 (2026-11-26)
 * 「천재들이 만든 수학퍼즐」에 나오는 개념(수 세기·평면도형·집합·규칙·머리셈·마방진·스도쿠)을 골라
 * 새싹스쿨이 직접 쓴 짧은 설명으로 배우고 → 따라 읽고 → 따라 쓰고 → 문제로 확인한다. 책의 문장·그림·문제는 옮기지 않는다.
 * 단계: learn(개념 카드) · read(따라 읽기) · write(따라 쓰기) · quiz(확인 문제, MathGen)
 * viz(그림): count{e,n} · seq{items} · shape{s} · add{e,a,b} · sub{e,a,b} · group{groups} · grid{n,vals} */
const MATH_LESSONS = [
  { id: 'num1', age: '5~6세', icon: 'm🍎', title: '수 세기 1~5', topic: '수의 기원', steps: [
    { type: 'learn', viz: { k: 'count', e: '🍎', n: 3 }, text: '물건을 셀 때는 하나씩 손가락으로 짚으면서 세요. 마지막에 말한 수가 모두 몇 개인지 알려 줘요.' },
    { type: 'read', viz: { k: 'count', e: '🍎', n: 3 }, text: '하나, 둘, 셋. 사과는 모두 세 개예요.' },
    { type: 'learn', viz: { k: 'count', e: '⭐', n: 5 }, text: '숫자로 쓰면 1, 2, 3, 4, 5예요. 1은 일, 하나라고 읽고, 5는 오, 다섯이라고 읽어요.' },
    { type: 'read', text: '일, 이, 삼, 사, 오.' },
    { type: 'write', glyph: '3', say: '삼, 셋' },
    { type: 'write', glyph: '5', say: '오, 다섯' },
    { type: 'quiz', gen: 'count', args: [1, 5] }, { type: 'quiz', gen: 'count', args: [1, 5] },
  ] },
  { id: 'num2', age: '5~6세', icon: 'm🐥', title: '수 세기 6~10', topic: '수의 기원', steps: [
    { type: 'learn', viz: { k: 'count', e: '🐥', n: 7 }, text: '다섯보다 많으면 다섯 개를 먼저 묶어 세고, 남은 것을 이어서 세면 쉬워요.' },
    { type: 'read', text: '여섯, 일곱, 여덟, 아홉, 열.' },
    { type: 'learn', viz: { k: 'count', e: '🍓', n: 10 }, text: '10은 십, 열이라고 읽어요. 손가락을 모두 펴면 열 개예요.' },
    { type: 'read', viz: { k: 'count', e: '🍓', n: 10 }, text: '딸기가 열 개 있어요.' },
    { type: 'write', glyph: '7', say: '칠, 일곱' },
    { type: 'write', glyph: '10', say: '십, 열' },
    { type: 'quiz', gen: 'count', args: [6, 10] }, { type: 'quiz', gen: 'count', args: [6, 10] },
  ] },
  { id: 'shape', age: '5~6세', icon: 'math-shape', title: '세모·네모·동그라미', topic: '평면도형', steps: [
    { type: 'learn', viz: { k: 'shape', s: 'tri' }, text: '세모는 곧은 선 세 개로 둘러싸여 있고, 뾰족한 곳이 세 군데예요.' },
    { type: 'learn', viz: { k: 'shape', s: 'sq' }, text: '네모는 곧은 선 네 개로 둘러싸여 있고, 뾰족한 곳이 네 군데예요.' },
    { type: 'learn', viz: { k: 'shape', s: 'circ' }, text: '동그라미는 둥글게 굽은 선 하나로 둘러싸여 있어서 뾰족한 곳이 없어요.' },
    { type: 'read', viz: { k: 'shape', s: 'all' }, text: '세모는 셋, 네모는 넷, 동그라미는 뾰족한 곳이 없어요.' },
    { type: 'write', glyph: '세모', say: '세모' },
    { type: 'write', glyph: '네모', say: '네모' },
    { type: 'quiz', gen: 'shape' }, { type: 'quiz', gen: 'shape' },
  ] },
  { id: 'group', age: '5~6세', icon: '🧺', title: '같은 것끼리 모으기', topic: '집합', steps: [
    { type: 'learn', viz: { k: 'group', groups: [['🍎', '🍓', '🍌'], ['🐶', '🐱', '🐥']] }, text: '과일은 과일끼리, 동물은 동물끼리 모을 수 있어요. 같은 성질을 가진 것끼리 모은 무리를 집합이라고 해요.' },
    { type: 'read', text: '같은 것끼리 모은 무리를 집합이라고 해요.' },
    { type: 'learn', viz: { k: 'group', groups: [['🍎', '❤️', '🍓'], ['🍌', '⭐', '🌙']] }, text: '색으로도 모을 수 있어요. 빨간 것끼리, 노란 것끼리 모아 봐요.' },
    { type: 'write', glyph: '집합', say: '집합' },
    { type: 'quiz', gen: 'odd' }, { type: 'quiz', gen: 'odd' },
  ] },
  { id: 'pattern', age: '5~6세', icon: 'math-pattern', title: '규칙 찾기', topic: '규칙 찾기', steps: [
    { type: 'learn', viz: { k: 'seq', items: ['🍎', '🍌', '🍎', '🍌', '🍎', '🍌'] }, text: '사과, 바나나, 사과, 바나나. 똑같은 차례가 계속 되풀이되는 것을 규칙이라고 해요.' },
    { type: 'read', viz: { k: 'seq', items: ['🍎', '🍌', '🍎', '🍌', '🍎', '?'] }, text: '사과 다음에는 바나나가 와요.' },
    { type: 'learn', viz: { k: 'seq', items: ['⭐', '⭐', '🌙', '⭐', '⭐', '🌙'] }, text: '별, 별, 달. 세 개가 한 묶음이 되어 되풀이되기도 해요. 한 묶음을 찾으면 다음을 알 수 있어요.' },
    { type: 'write', glyph: '규칙', say: '규칙' },
    { type: 'quiz', gen: 'pattern' }, { type: 'quiz', gen: 'pattern' },
  ] },
  { id: 'add', age: '7~8세', icon: 'math-mental', title: '더하기', topic: '머리셈', steps: [
    { type: 'learn', viz: { k: 'add', e: '🍎', a: 2, b: 3 }, text: '사과 두 개와 사과 세 개를 합치면 모두 다섯 개예요. 이렇게 합치는 것을 더하기라고 해요.' },
    { type: 'read', text: '이 더하기 삼은 오와 같아요.' },
    { type: 'learn', viz: { k: 'add', e: '⭐', a: 4, b: 1 }, text: '더하기는 플러스 기호로 쓰고, 같다는 등호로 써요. 4 더하기 1은 5예요.' },
    { type: 'write', glyph: '+', say: '더하기' },
    { type: 'write', glyph: '=', say: '같아요' },
    { type: 'quiz', gen: 'mental', args: ['+'] }, { type: 'quiz', gen: 'mental', args: ['+'] },
  ] },
  { id: 'sub', age: '7~8세', icon: '🧮', title: '빼기', topic: '머리셈', steps: [
    { type: 'learn', viz: { k: 'sub', e: '🍓', a: 5, b: 2 }, text: '딸기 다섯 개 중에서 두 개를 먹으면 세 개가 남아요. 덜어 내는 것을 빼기라고 해요.' },
    { type: 'read', text: '오 빼기 이는 삼과 같아요.' },
    { type: 'learn', viz: { k: 'sub', e: '🎈', a: 6, b: 1 }, text: '빼기는 마이너스 기호로 써요. 6 빼기 1은 5예요.' },
    { type: 'write', glyph: '−', say: '빼기' },
    { type: 'write', glyph: '빼기', say: '빼기' },
    { type: 'quiz', gen: 'mental', args: ['−'] }, { type: 'quiz', gen: 'mental', args: ['−'] },
  ] },
  { id: 'magic', age: '7~8세', icon: 'math-magic', title: '마방진', topic: '마방진', steps: [
    { type: 'learn', viz: { k: 'grid', n: 3, vals: [2, 7, 6, 9, 5, 1, 4, 3, 8] }, text: '마방진은 1부터 9까지 숫자를 한 번씩 넣은 네모 판이에요. 가로, 세로, 대각선 어느 줄을 더해도 15가 돼요.' },
    { type: 'read', text: '이 더하기 칠 더하기 육은 십오예요.' },
    { type: 'learn', viz: { k: 'grid', n: 3, vals: [2, 7, 6, 9, 5, 1, 4, 3, 8] }, text: '가운데에는 늘 5가 들어가요. 빈칸이 있으면 같은 줄의 두 수를 더해서 15가 되려면 얼마가 남는지 생각해요.' },
    { type: 'write', glyph: '15', say: '십오' },
    { type: 'quiz', gen: 'mental', args: ['+'] },
    { type: 'play', game: 'magic', text: '이제 마방진 퍼즐을 직접 풀어 볼까요?' },
  ] },
  { id: 'sudoku', age: '7~8세', icon: 'math-sudoku', title: '스도쿠', topic: '스도쿠', steps: [
    { type: 'learn', viz: { k: 'grid', n: 4, vals: [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1] }, text: '스도쿠는 빈칸에 숫자를 채우는 퍼즐이에요. 가로줄에도, 세로줄에도 같은 숫자가 두 번 들어가면 안 돼요.' },
    { type: 'read', text: '한 줄에 일, 이, 삼, 사가 한 번씩 들어가요.' },
    { type: 'learn', viz: { k: 'grid', n: 4, vals: [1, 2, 3, 0, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1] }, text: '첫째 줄에는 1, 2, 3이 있으니 빈칸에는 남은 숫자 4가 들어가요.' },
    { type: 'write', glyph: '4', say: '사, 넷' },
    { type: 'play', game: 'sudoku', text: '이제 4×4 스도쿠를 직접 풀어 볼까요?' },
  ] },
];
