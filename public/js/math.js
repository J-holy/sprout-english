/* 새싹수학 (시험, 2026-11-26)
 * 「천재들이 만든 수학퍼즐」의 주제 이름과 개념만 참고하고, 이야기·설명·문제는 모두 새로 쓰거나 화면이 매번 새로 만든다 (docs/MATH-TOPICS.md)
 * 주제 카드 하나 = 10분 놀이: ① 수학 이야기 → ② 개념 배우기(눌러 보고 옮겨 보기) → ③ 퍼즐(쉬움·보통·어려움·도전) → ④ 워크시트(화면·인쇄) → ⑤ 별과 천재 카드
 * 틀리면 정답을 바로 보여 주지 않는다: 1번 틀리면 힌트 한 줄, 2번 틀리면 그림 풀이. 시간 제한은 없다 */
const MATH_GAMES = {
  count: { icon: '🍎', title: '수 세기', stage: 'seed', c: '#ff8a65', hub: '그림을 세어 몇 개인지 골라요' },
  big: { icon: '💯', title: '큰 수 퍼즐', stage: 'seed', c: '#ffb74d', hub: '묶음·자릿값·뛰어 세기·크기 비교' },
  shape: { icon: '🔷', title: '모양 찾기', stage: 'seed', c: '#4db6ac', hub: '세모·네모·동그라미를 찾아요' },
  odd: { icon: '🧺', title: '다른 무리 찾기', stage: 'seed', c: '#ffb74d', hub: '같은 무리가 아닌 것을 골라요' },
  pattern: { icon: '🔁', title: '다음에 올 것', stage: 'seed', c: '#9575cd', hub: '규칙을 찾아 빈칸을 채워요' },
  blocks: { icon: '🧱', title: '쌓기나무', stage: 'seed', c: '#ffb74d', hub: '쌓기나무가 모두 몇 개일까' },
  table: { icon: '📊', title: '그림 표 읽기', stage: 'seed', c: '#4db6ac', hub: '표를 보고 답해요' },
  mental: { icon: '⚡', title: '빠른 머리셈', stage: 'sprout', c: '#64b5f6', hub: '더하기·빼기' },
  magic: { icon: '✨', title: '마방진', stage: 'sprout', c: '#f06292', hub: '가로·세로·대각선 합이 모두 15' },
  sudoku: { icon: '🔢', title: '4×4 스도쿠', stage: 'sprout', c: '#aed581', hub: '줄마다 1·2·3·4가 한 번씩' },
  venn: { icon: '⭕', title: '벤 다이어그램', stage: 'sprout', c: '#f06292', hub: '두 동그라미에 나눠요' },
  graph: { icon: '📈', title: '막대그래프', stage: 'sprout', c: '#64b5f6', hub: '그래프를 읽어요' },
  path: { icon: '🗺️', title: '가장 짧은 길', stage: 'sprout', c: '#aed581', hub: '가장 짧은 길을 찾아요' },
  same: { icon: '🧩', title: '똑같은 모양 찾기', stage: 'seed', c: '#4db6ac', hub: '돌리고 뒤집어도 같은 모양' },
  fbox: { icon: '🎩', title: '마술 상자', stage: 'sprout', c: '#9575cd', hub: '넣으면 규칙대로 나와요' },
  logic: { icon: '🔍', title: '누가 무엇을 가졌을까', stage: 'sprout', c: '#64b5f6', hub: '단서로 풀기·거꾸로 풀기' },
  euler: { icon: '✏️', title: '한붓그리기', stage: 'sprout', c: '#aed581', hub: '연필을 떼지 않고 한 번에' },
  match: { icon: '🔥', title: '성냥개비 퍼즐', stage: 'sprout', c: '#ff8a65', hub: '막대 하나 옮겨 식 고치기' },
  balance: { icon: '⚖️', title: '저울 맞추기', stage: 'tree', c: '#ffb74d', hub: '상자 안의 수 찾기' },
  base: { icon: '🏛️', title: '다른 묶음으로 세기', stage: 'tree', c: '#f06292', hub: '5씩 묶기·로마 숫자' },
  pento: { icon: '🟩', title: '펜토미노', stage: 'tree', c: '#4db6ac', hub: '빈칸에 맞는 조각 찾기' },
  trc: { icon: '🔺', title: '세모와 동그라미', stage: 'tree', c: '#ff8a65', hub: '삼각형 이름·지름·세 각의 합' },
  avg: { icon: '📏', title: '고르게 나누기', stage: 'tree', c: '#9575cd', hub: '똑같이 나누기·평균' },
  split: { icon: '🌲', title: '수 쪼개기', stage: 'tree', c: '#aed581', hub: '곱셈 나무·소수' },
  div: { icon: '🍬', title: '나눗셈', stage: 'tree', c: '#f06292', hub: '나눠 담기·나머지' },
  mul: { icon: '✖️', title: '곱셈 퍼즐', stage: 'tree', c: '#ff8a65', hub: '2~9단 곱셈' },
  frac: { icon: '🍕', title: '분수 퍼즐', stage: 'tree', c: '#4db6ac', hub: '색칠한 부분은 얼마일까' },
  factor: { icon: '🍪', title: '약수·배수 퍼즐', stage: 'tree', c: '#ffb74d', hub: '약수와 배수 고르기' },
  angle: { icon: '📐', title: '각 퍼즐', stage: 'tree', c: '#9575cd', hub: '예각·직각·둔각' },
  poly: { icon: '🐝', title: '다각형 퍼즐', stage: 'tree', c: '#64b5f6', hub: '이름과 변의 수' },
  seq: { icon: '🐇', title: '수의 규칙 퍼즐', stage: 'tree', c: '#aed581', hub: '다음에 올 수 찾기' },
  cipher: { icon: '🗝️', title: '암호 풀기', stage: 'tree', c: '#9575cd', hub: '수를 글자로, 글자를 수로' },
  masked: { icon: '🎭', title: '복면산', stage: 'tree', c: '#f06292', hub: '가려진 숫자 찾기' },
  cases: { icon: '🎲', title: '경우의 수', stage: 'tree', c: '#ffb74d', hub: '빠짐없이 세기' },
  area: { icon: '🟦', title: '넓이와 둘레', stage: 'tree', c: '#4db6ac', hub: '칸을 세어 넓이·둘레' },
};
const MATH_LEVELS = [['🌱', '쉬움'], ['🌿', '보통'], ['💪', '어려움'], ['🔥', '도전']];
// 새싹스쿨 그림: 놀이 아이콘(PICS.i['math-…'])과 세기·규칙 스티커(PICS.x['m'+이모지]). 그림이 없으면 이모지
const mIco = k => PICS.i['math-' + k] ? `<img class="ico" src="img/${PICS.i['math-' + k]}" alt="" draggable="false">` : ico(MATH_GAMES[k].icon);
const mPic = e => PICS.x['m' + e] ? `<img class="m-pic" src="img/${PICS.x['m' + e]}" alt="" draggable="false">` : e;
const mDots = (n, cls = '') => `<span class="m-dot ${cls}"></span>`.repeat(n);

const MathGen = (() => {
  const R = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const nearby = (ans, lo, hi, n = 3) => { const s = new Set([ans]); let k = 0; while (s.size < n && k++ < 50) { const v = ans + (R(5) - 2) || ans + 3; if (v >= lo && v <= hi) s.add(v); } for (let v = lo; s.size < n; v++) s.add(v); return shuffle([...s]); };
  let LV = 1; // 0 쉬움 · 1 보통 · 2 어려움 · 3 도전 (2026-11-27 네 단계로. 예전 저장값 0~2는 그대로 쉬움·보통·어려움)
  const H = MATH_HINTS;
  const SHAPES = {
    tri: ['세모', '<polygon points="50,8 94,90 6,90"/>', 3],
    sq: ['네모', '<rect x="12" y="12" width="76" height="76" rx="4"/>', 4],
    circ: ['동그라미', '<circle cx="50" cy="50" r="42"/>', 0],
  };
  const COLORS = ['#ff8a65', '#4db6ac', '#9575cd', '#64b5f6', '#f06292', '#ffd54f'];
  const svg = (k, col, rot = 0) => `<svg viewBox="0 0 100 100" class="m-shape" aria-label="${SHAPES[k][0]}"><g fill="${col}" stroke="#3a2d4f" stroke-width="5" transform="rotate(${rot} 50 50)">${SHAPES[k][1]}</g></svg>`;
  // 나무 단계 그림: 분수 원(색칠 n/d), 각(두 선과 호), 정다각형
  const KN = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'];
  const POLY = { 3: '삼각형', 4: '사각형', 5: '오각형', 6: '육각형', 7: '칠각형', 8: '팔각형' };
  const fracTxt = v => { const [n, d] = v.split('/'); return `<span class="m-fr" aria-label="${KN[d]}분의 ${KN[n]}"><b>${n}</b><b>${d}</b></span>`; };
  const pie = (n, d, cls = 'm-pie') => {
    const P = a => [50 + 44 * Math.cos(a), 50 + 44 * Math.sin(a)].map(x => x.toFixed(2)).join(' ');
    let g = '';
    for (let k = 0; k < d; k++) { const a0 = k / d * 2 * Math.PI - Math.PI / 2, a1 = (k + 1) / d * 2 * Math.PI - Math.PI / 2; g += `<path d="M50 50 L${P(a0)} A44 44 0 0 1 ${P(a1)} Z" fill="${k < n ? '#ff8a65' : '#fff8ec'}"/>`; }
    return `<svg viewBox="0 0 100 100" class="${cls}" aria-label="${d}조각 중 ${n}조각"><g stroke="#3a2d4f" stroke-width="3" stroke-linejoin="round">${g}</g></svg>`;
  };
  const angSvg = (deg, flip = 0) => {
    const r = deg * Math.PI / 180, X = 45 + 58 * Math.cos(r), Y = 82 - 58 * Math.sin(r), ax = 45 + 16 * Math.cos(r), ay = 82 - 16 * Math.sin(r);
    const mark = deg === 90 ? '<path d="M57 82 V70 H45" fill="none" stroke="#ff7043" stroke-width="3"/>' : `<path d="M61 82 A16 16 0 0 0 ${ax.toFixed(1)} ${ay.toFixed(1)}" fill="none" stroke="#ff7043" stroke-width="3"/>`;
    return `<svg viewBox="-12 12 124 78" class="m-ang" aria-label="${deg}도 각"><g ${flip ? 'transform="translate(100 0) scale(-1 1)"' : ''}>${mark}<g stroke="currentColor" stroke-width="5" stroke-linecap="round"><line x1="45" y1="82" x2="104" y2="82"/><line x1="45" y1="82" x2="${X.toFixed(1)}" y2="${Y.toFixed(1)}"/></g><circle cx="45" cy="82" r="4" fill="currentColor"/></g></svg>`;
  };
  const polySvg = (n, col = '#4db6ac', rot = 0) => {
    if (n === 4) rot += 45; // 네모는 반듯하게 (마름모로 보이지 않게)
    const pts = Array.from({ length: n }, (_, k) => { const a = (k / n * 360 - 90 + rot) * Math.PI / 180; return `${(50 + 42 * Math.cos(a)).toFixed(1)},${(52 + 42 * Math.sin(a)).toFixed(1)}`; }).join(' ');
    return `<svg viewBox="0 0 100 100" class="m-shape m-poly" aria-label="${POLY[n]}"><polygon points="${pts}" fill="${col}" stroke="#3a2d4f" stroke-width="5" stroke-linejoin="round"/></svg>`;
  };
  const ODD = [['🍎', '🍓', '🍌', '🍇'], ['🐶', '🐱', '🐥', '🐟'], ['⭐', '🌙'], ['🚗', '⚽', '🎈'], ['🥕', '🥦', '🌽', '🥬']], ODDN = ['과일', '동물', '하늘', '장난감', '채소'];
  // 쌓기나무 그림: h[줄][칸] = 그 칸의 층 수. h[0]이 맨 뒷줄. 앞에서 조금 위·오른쪽으로 비스듬히 본 모습(칸은 왼쪽→오른쪽)
  const blocksSvg = (h, s = 30) => {
    const Y = h.length, X = h[0].length, d = s * 0.5, P = (x, y, z) => [x * s + y * d, -z * s - y * d], pts = a => a.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
    const ST = 'stroke="#3a2d4f" stroke-width="2" stroke-linejoin="round"', cubes = [], floor = [];
    for (let r = 0; r < Y; r++) for (let x = 0; x < X; x++) {
      const y = Y - 1 - r;
      floor.push(`<polygon points="${pts([P(x, y, 0), P(x + 1, y, 0), P(x + 1, y + 1, 0), P(x, y + 1, 0)])}" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-dasharray="4 3"/>`);
      for (let z = 0; z < h[r][x]; z++) cubes.push([x, y, z]);
    }
    cubes.sort((a, b) => b[1] - a[1] || a[0] - b[0] || a[2] - b[2]);
    const draw = ([x, y, z]) => `<polygon ${ST} fill="#ffb74d" points="${pts([P(x, y, z), P(x + 1, y, z), P(x + 1, y, z + 1), P(x, y, z + 1)])}"/>`
      + `<polygon ${ST} fill="#ff8a65" points="${pts([P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)])}"/>`
      + `<polygon ${ST} fill="#ffe082" points="${pts([P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)])}"/>`;
    const maxH = Math.max(1, ...h.flat()), w = X * s + Y * d + 8, top = maxH * s + Y * d + 4;
    return `<svg viewBox="-4 ${(-top).toFixed(1)} ${w.toFixed(1)} ${(top + 6).toFixed(1)}" class="m-blocks" style="width:${Math.round(w * 1.5)}px" aria-label="쌓기나무 ${h.flat().reduce((a, b) => a + b, 0)}개">${floor.join('')}${cubes.map(draw).join('')}</svg>`;
  };
  // 위에서 본 칸마다 층 수 (쌓기나무 그림 풀이)
  const hmap = h => `<div class="m-hmap" style="--c:${h[0].length}">${h.map(r => r.map(v => `<span>${v || ''}</span>`).join('')).join('')}</div>`;
  // 그림 표: rows = [[이모지, 수, 이름?, 그림?]], mode pic(그림) · num(수) · both(그림과 수), hi = 칠할 줄
  const tableHtml = (rows, mode = 'pic', hi = []) => `<table class="m-table"><tbody>${rows.map(([e, n, label, pic], i) => `<tr class="${hi.includes(i) ? 'hi' : ''}"><th>${mPic(e)} ${label || MATH_NAMES[e] || ''}</th><td>${mode === 'num' ? `<b>${n}</b>` : `<span class="m-tpics">${Array.from({ length: n }, () => mPic(pic || e)).join('')}</span>`}${mode === 'both' ? ` <b class="m-tn">${n}</b>` : ''}</td></tr>`).join('')}</tbody></table>`;
  // ── 새싹 더하기 그림 (2026-11-27) ──
  // 벤 다이어그램: 왼쪽 동그라미 A(종류), 오른쪽 B(색). placed = [{ e, r: 'a'|'ab'|'b'|'o' }], hi = 동그라미 칠 영역
  const VENN = { '🍎': ['과일', '빨간'], '🍓': ['과일', '빨간'], '🍒': ['과일', '빨간'], '🍌': ['과일', '노란'], '🍋': ['과일', '노란'], '🍏': ['과일', '초록'],
    '🐞': ['동물', '빨간'], '🐥': ['동물', '노란'], '🐸': ['동물', '초록'], '🚒': ['탈것', '빨간'], '🚕': ['탈것', '노란'] };
  // 받침에 따라 조사 고르기: jo('레몬', '은', '는') → '레몬은'
  const jo = (w, a, b) => w + ((w.charCodeAt(w.length - 1) - 0xac00) % 28 ? a : b);
  const COLN = { 빨간: '빨간 것', 노란: '노란 것', 초록: '초록색 것' };
  const vRegion = (e, A, B) => { const [t, c] = VENN[e]; return t === A ? (c === B ? 'ab' : 'a') : c === B ? 'b' : 'o'; };
  const vName = (r, A, B) => ({ a: `${A}에만`, ab: '두 곳 모두 (겹친 곳)', b: `${COLN[B]}에만`, o: '둘 다 아님 (바깥)' })[r];
  const vennSvg = (A, B, placed = [], hi = null) => {
    const SL = { a: [[78, 92], [78, 132], [102, 62]], ab: [[160, 86], [160, 128]], b: [[242, 92], [242, 132], [218, 62]], o: [[22, 40], [298, 40], [22, 178], [298, 178]] }, used = { a: 0, ab: 0, b: 0, o: 0 };
    const items = placed.map(({ e, r }) => { const [x, y] = SL[r][used[r]++ % SL[r].length]; return `${r === hi ? `<circle cx="${x}" cy="${y - 7}" r="17" fill="#ffd54f" opacity=".8"/>` : ''}<text x="${x}" y="${y}" font-size="28" text-anchor="middle">${e}</text>`; }).join('');
    return `<svg viewBox="0 0 320 210" class="m-venn" aria-label="벤 다이어그램: ${A}, ${COLN[B]}"><rect x="2" y="2" width="316" height="206" rx="14" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="5 4"/>
      <circle cx="120" cy="108" r="80" fill="#64b5f6" fill-opacity=".22" stroke="#1e88e5" stroke-width="3"/><circle cx="200" cy="108" r="80" fill="#f06292" fill-opacity=".22" stroke="#d81b60" stroke-width="3"/>
      <text x="78" y="26" font-size="15" font-weight="700" fill="#1e88e5" text-anchor="middle">${A}</text><text x="242" y="26" font-size="15" font-weight="700" fill="#d81b60" text-anchor="middle">${COLN[B]}</text>${items}</svg>`;
  };
  // 막대그래프: rows = [[이모지, 수]], hi = 읽는 줄을 보여 줄 막대
  const barSvg = (rows, hi = [], title = '') => {
    const n = rows.length, top = Math.max(5, ...rows.map(r => r[1])), W = 56 * n + 46, ph = 150, u = ph / top, base = ph + 30;
    const ticks = Array.from({ length: top + 1 }, (_, k) => `<line x1="34" x2="${W - 6}" y1="${base - k * u}" y2="${base - k * u}" stroke="currentColor" stroke-opacity="${k ? .15 : .6}"/><text x="28" y="${base - k * u + 4}" font-size="11" text-anchor="end" fill="currentColor">${k}</text>`).join('');
    const COLS = ['#ff8a65', '#4db6ac', '#9575cd', '#ffb74d'];
    const bars = rows.map(([e, v], i) => { const x = 46 + i * 56; return `<rect x="${x}" y="${base - v * u}" width="36" height="${v * u}" rx="4" fill="${COLS[i % 4]}" stroke="#3a2d4f" stroke-width="2"/>`
      + (hi.includes(i) ? `<line x1="34" x2="${x}" y1="${base - v * u}" y2="${base - v * u}" stroke="#e53935" stroke-width="2.5" stroke-dasharray="5 3"/><text x="${x + 18}" y="${base - v * u - 6}" font-size="15" font-weight="700" fill="#e53935" text-anchor="middle">${v}</text>` : '')
      + `<text x="${x + 18}" y="${base + 24}" font-size="22" text-anchor="middle">${e}</text>`; }).join('');
    return `<figure class="m-graph">${title ? `<figcaption>${title}</figcaption>` : ''}<svg viewBox="0 0 ${W} ${base + 34}" class="m-bars" style="width:${Math.round(W * 1.35)}px" aria-label="막대그래프">${ticks}${bars}</svg></figure>`;
  };
  // 그림그래프: 아래부터 그림을 쌓는다
  const picGraph = (rows, title = '') => `<figure class="m-graph">${title ? `<figcaption>${title}</figcaption>` : ''}<div class="m-pgraph">${rows.map(([e, v]) => `<div><span class="m-pcol">${Array.from({ length: v }, () => '<i class="m-pdot"></i>').join('')}</span><b>${mPic(e)}</b></div>`).join('')}</div></figure>`;
  // 칸 길: 집(s)에서 학교(g)까지. walls = ['x,y'], routes = [{ pts, col }], nums = { 'x,y': 수 }
  const bfs = (W, H, s, g, walls = []) => {
    const key = (x, y) => x + ',' + y, prev = { [key(...s)]: null }, q = [s];
    while (q.length) { const [x, y] = q.shift(); if (x === g[0] && y === g[1]) break;
      for (const [dx, dy] of [[1, 0], [0, -1], [-1, 0], [0, 1]]) { const nx = x + dx, ny = y + dy, k = key(nx, ny); if (nx < 0 || ny < 0 || nx >= W || ny >= H || walls.includes(k) || k in prev) continue; prev[k] = [x, y]; q.push([nx, ny]); } }
    if (!(key(...g) in prev)) return null;
    const path = []; for (let c = g; c; c = prev[key(...c)]) path.unshift(c); return path;
  };
  const pathSvg = ({ W, H, s, g, walls = [], routes = [], nums = {} }) => {
    const C = 44, cells = [], marks = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = x + ',' + y;
      cells.push(`<rect x="${x * C + 2}" y="${y * C + 2}" width="${C - 4}" height="${C - 4}" rx="7" fill="${walls.includes(k) ? '#c5e1a5' : '#fffaf0'}" stroke="#bcaaa4" stroke-width="1.5"/>`);
      const t = x === s[0] && y === s[1] ? '🏠' : x === g[0] && y === g[1] ? '🏫' : walls.includes(k) ? '🌳' : '';
      if (t) marks.push(`<text x="${x * C + C / 2}" y="${y * C + C / 2 + 9}" font-size="26" text-anchor="middle">${t}</text>`);
      else if (k in nums) marks.push(`<text x="${x * C + C / 2}" y="${y * C + C / 2 + 6}" font-size="16" font-weight="700" text-anchor="middle" fill="#6d4c41">${nums[k]}</text>`); }
    const lines = routes.map(({ pts, col }, i) => { const o = (i - (routes.length - 1) / 2) * 6; return `<polyline points="${pts.map(([x, y]) => `${x * C + C / 2 + o},${y * C + C / 2 + o}`).join(' ')}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`; }).join('');
    return `<svg viewBox="0 0 ${W * C} ${H * C}" class="m-path" style="width:${Math.round(W * C * 1.3)}px" aria-label="칸 길 지도">${cells.join('')}${lines}${marks.join('')}</svg>`;
  };
  const ROUTE = [['#e53935', '빨간 길'], ['#1e88e5', '파란 길'], ['#43a047', '초록 길']];
  const steps = (dirs, s) => { const pts = [s]; for (const [dx, dy] of dirs) { const [x, y] = pts[pts.length - 1]; pts.push([x + dx, y + dy]); } return pts; };
  // 칸마다 집에서 몇 걸음인지 (이야기 그림)
  const distMap = (W, H, s, walls = []) => { const d = { [s.join()]: 0 }, q = [s]; while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [0, -1], [-1, 0], [0, 1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (nx < 0 || ny < 0 || nx >= W || ny >= H || walls.includes(k) || k in d) continue; d[k] = d[x + ',' + y] + 1; q.push([nx, ny]); } } return d; };
  // ── 나무 더하기 그림 (2026-11-27) ──
  // 수의 줄: items(수, '?'는 빈칸), labels = 수 사이에 적을 차이(+3 등), hi = 칠할 칸
  const nseq = (items, labels = [], hi = -1) => `<div class="m-nseq">${items.map((v, i) => `${i ? `<i class="m-diff">${labels[i - 1] || ''}</i>` : ''}${v === '?' ? '<b class="m-q">?</b>' : `<span class="${i === hi ? 'hi' : ''}">${v}</span>`}`).join('')}</div>`;
  // 암호 표: 가~하 14글자에 1~14
  const SYL = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하'];
  const keyTable = (hi = []) => `<div class="m-key">${[0, 7].map(o => `<table><tr>${SYL.slice(o, o + 7).map((c, i) => `<th class="${hi.includes(o + i) ? 'hi' : ''}">${c}</th>`).join('')}</tr><tr>${SYL.slice(o, o + 7).map((_, i) => `<td class="${hi.includes(o + i) ? 'hi' : ''}">${o + i + 1}</td>`).join('')}</tr></table>`).join('')}</div>`;
  const CWORDS = ['바다', '나라', '사자', '하마', '가자', '아가', '마차', '바나나', '가나다', '자라', '파다', '하다', '사다', '차다'];
  const enc = w => [...w].map(c => SYL.indexOf(c) + 1), shiftW = (w, k) => [...w].map(c => SYL[(SYL.indexOf(c) + k + 14) % 14]).join('');
  // 세로 덧셈: rows = ['2🍓', '15', '41'] (마지막 줄이 합)
  const colAdd = (rows, op = '+') => `<table class="m-col"><tbody>${rows.map((r, i) => `<tr class="${i === rows.length - 1 ? 'sum' : ''}"><td>${i === rows.length - 2 ? op : ''}</td>${[...r.padStart(2, ' ')].map(c => `<td>${c === ' ' ? '' : mPic(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  // 칸 모양: cells = ['x,y'], nums = 칸에 번호, edge = 둘레 선을 빨갛게
  const cellsSvg = ({ W, H, cells, nums = false, edge = false }) => {
    const C = 30, has = (x, y) => cells.includes(x + ',' + y), out = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out.push(`<rect x="${x * C}" y="${y * C}" width="${C}" height="${C}" fill="${has(x, y) ? '#81d4fa' : '#fffaf0'}" stroke="#b0bec5" stroke-width="1"/>`);
    if (nums) cells.forEach((k, i) => { const [x, y] = k.split(',').map(Number); out.push(`<text x="${x * C + C / 2}" y="${y * C + C / 2 + 5}" font-size="13" font-weight="700" text-anchor="middle" fill="#0d47a1">${i + 1}</text>`); });
    const lines = [];
    for (const k of cells) { const [x, y] = k.split(',').map(Number);
      if (!has(x, y - 1)) lines.push([x, y, x + 1, y]); if (!has(x, y + 1)) lines.push([x, y + 1, x + 1, y + 1]);
      if (!has(x - 1, y)) lines.push([x, y, x, y + 1]); if (!has(x + 1, y)) lines.push([x + 1, y, x + 1, y + 1]); }
    out.push(lines.map(([a, b, c, d]) => `<line x1="${a * C}" y1="${b * C}" x2="${c * C}" y2="${d * C}" stroke="${edge ? '#e53935' : '#01579b'}" stroke-width="${edge ? 4 : 2.5}" stroke-linecap="round"/>`).join(''));
    return `<svg viewBox="-3 -3 ${W * C + 6} ${H * C + 6}" class="m-cells" style="width:${Math.round((W * C + 6) * 1.5)}px" aria-label="넓이 ${cells.length}칸">${out.join('')}</svg>`;
  };
  const perim = cells => { const has = k => cells.includes(k); let p = 0; for (const k of cells) { const [x, y] = k.split(',').map(Number); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!has(`${x + dx},${y + dy}`)) p++; } return p; };
  const growCells = (W, H, n) => { const s = `${R(W)},${R(H)}`, c = [s]; while (c.length < n) { const [x, y] = c[R(c.length)].split(',').map(Number), [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][R(4)], k = `${x + dx},${y + dy}`; if (x + dx >= 0 && y + dy >= 0 && x + dx < W && y + dy < H && !c.includes(k)) c.push(k); } return c; };
  const rectCells = (w, h, ox = 0, oy = 0) => { const c = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) c.push(`${x + ox},${y + oy}`); return c; };
  // 짝 지은 표 (경우의 수 그림 풀이): a × b
  const comboGrid = (a, b) => `<table class="m-combo"><tr><th></th>${b.map(x => `<th>${mPic(x)}</th>`).join('')}</tr>${a.map(y => `<tr><th>${mPic(y)}</th>${b.map(x => `<td>${mPic(y)}${mPic(x)}</td>`).join('')}</tr>`).join('')}</table>`;
  // ── 큰 수 그림 (2026-11-27) ──
  // 십 묶음(막대 하나 = 10)과 낱개(작은 네모 하나 = 1). label이면 아래에 '묶음 3 · 낱개 4' 적기
  const b10 = (n, label = false) => {
    const t = Math.floor(n / 10), o = n % 10;
    return `<div class="m-b10" aria-label="${n}: 십 묶음 ${t}개, 낱개 ${o}개"><span class="m-rods">${'<i class="m-rod"></i>'.repeat(t)}</span>${o ? `<span class="m-ones">${'<i class="m-one"></i>'.repeat(o)}</span>` : ''}</div>${label ? `<p class="m-b10-lab">십 묶음 ${t}개 · 낱개 ${o}개</p>` : ''}`;
  };
  // 100판: from~from+99를 10칸씩. win = [가운데 수, 반지름]이면 그 둘레만, blank = 비울 수, hi = 칠할 수
  const hund = ({ win = null, blank = [], hi = [] } = {}) => {
    const cell = v => `<span class="${blank.includes(v) ? 'q' : hi.includes(v) ? 'hi' : ''}">${blank.includes(v) ? '?' : v}</span>`;
    if (!win) return `<div class="m-hund">${Array.from({ length: 100 }, (_, i) => cell(i + 1)).join('')}</div>`;
    const [c] = win, rows = [-10, 0, 10].map(d => [-1, 0, 1].map(e => c + d + e));
    return `<div class="m-hund win">${rows.flat().map(cell).join('')}</div>`;
  };
  // ── 묶음 1 그림 (2026-11-27): 마술 상자 · 저울 · 똑같은 모양 · 논리 표 · 다른 묶음 ──
  // 마술 상자: pairs = [[넣은 수, 나온 수]], last = [넣은 수, 나온 수] 마지막 칸, rev면 넣은 수가 ?
  const fbox = (pairs, last, rev = false, lab = '') => `<div class="m-fbox"><div class="m-fbox-hat">🎩 마술 상자${lab ? ` <b>${lab}</b>` : ''}</div><table class="m-ftab"><tr><th>넣은 수</th>${pairs.map(p => `<td>${p[0]}</td>`).join('')}${last ? `<td class="q">${rev ? '?' : last[0]}</td>` : ''}</tr><tr><th>나온 수</th>${pairs.map(p => `<td>${p[1]}</td>`).join('')}${last ? `<td class="q">${rev ? last[1] : '?'}</td>` : ''}</tr></table></div>`;
  // 저울: 'B' 상자, 'T' 세모 추, 수는 무게 추
  const sItem = x => x === 'B' ? '<span class="m-sbox">📦</span>' : x === 'T' ? '<span class="m-sbox">🔺</span>' : `<span class="m-weight">${x}</span>`;
  const scale = (left, right, tilt = 0) => `<div class="m-scale" style="--tilt:${tilt}deg"><div class="m-beam"><div class="m-pan">${left.map(sItem).join('')}</div><div class="m-pan">${right.map(sItem).join('')}</div></div><div class="m-post">▲</div></div>`;
  // 칸 모양(폴리오미노): cells = [[x, y]]
  const pNorm = c => { const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1])); return c.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
  const pKey = c => pNorm(c).map(p => p.join(',')).join(';');
  const pRot = c => pNorm(c.map(([x, y]) => [y, -x])), pFlip = c => pNorm(c.map(([x, y]) => [-x, y]));
  const pVars = (c, flip) => { const out = new Set(); let a = pNorm(c); for (let i = 0; i < 4; i++) { out.add(pKey(a)); if (flip) out.add(pKey(pFlip(a))); a = pRot(a); } return out; };
  const pGrow = n => { const c = [[0, 0]]; while (c.length < n) { const [x, y] = c[R(c.length)], [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][R(4)]; if (Math.abs(x + dx) < 3 && Math.abs(y + dy) < 3 && !c.some(p => p[0] === x + dx && p[1] === y + dy)) c.push([x + dx, y + dy]); } return pNorm(c); };
  const pScale = (c, k) => pNorm(c.flatMap(([x, y]) => Array.from({ length: k * k }, (_, i) => [x * k + i % k, y * k + Math.floor(i / k)])));
  const pSvg = (c, col = '#4db6ac', s = 18) => { c = pNorm(c); const W = Math.max(...c.map(p => p[0])) + 1, H = Math.max(...c.map(p => p[1])) + 1;
    return `<svg viewBox="-2 -2 ${W * s + 4} ${H * s + 4}" class="m-poly-shape" style="width:${W * s + 4}px" aria-label="칸 ${c.length}개 모양">${c.map(([x, y]) => `<rect x="${x * s}" y="${y * s}" width="${s}" height="${s}" fill="${col}" stroke="#3a2d4f" stroke-width="2"/>`).join('')}</svg>`; };
  // 논리 표: 사람 × 물건, sol[i] = i번째 사람이 가진 물건 칸, show면 ○·✗를 채운다
  const FR = [['🐶', '강아지'], ['🐱', '고양이'], ['🐰', '토끼']], IT = [['🍎', '사과'], ['🍌', '바나나'], ['🍓', '딸기']];
  const lTable = (n, sol, show = false, hi = -1) => `<table class="m-ltab"><tr><th></th>${IT.slice(0, n).map(([e]) => `<th>${mPic(e)}</th>`).join('')}</tr>${FR.slice(0, n).map(([e], i) => `<tr><th>${mPic(e)}</th>${IT.slice(0, n).map((_, j) => `<td class="${show && sol[i] === j && j === hi ? 'hi' : ''}">${show ? (sol[i] === j ? '○' : '✗') : ''}</td>`).join('')}</tr>`).join('')}</table>`;
  const perms = n => n === 2 ? [[0, 1], [1, 0]] : [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  // 다른 묶음: 5씩 묶은 막대 그림(바를 정 자처럼 네 줄 + 비스듬한 줄), 로마 숫자
  const tally = n => `<div class="m-tally">${Array.from({ length: Math.floor(n / 5) }, () => '<span class="m-t5"><i></i><i></i><i></i><i></i><b></b></span>').join('')}${n % 5 ? `<span class="m-t5 part">${'<i></i>'.repeat(n % 5)}</span>` : ''}</div>`;
  const roman = (n, sub = true) => { let s = ''; for (const [v, r] of sub ? [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']] : [[10, 'X'], [5, 'V'], [1, 'I']]) while (n >= v) { s += r; n -= v; } return s; };
  const dotGroups = (n, g) => `<div class="m-dgroups">${Array.from({ length: Math.floor(n / g) }, () => `<span class="m-ring">${mDots(g)}</span>`).join('')}${n % g ? `<span>${mDots(n % g, 'b')}</span>` : ''}</div>`;
  // ── 묶음 2 그림 (2026-11-27): 한붓그리기 · 성냥개비 ──
  // 한붓그리기 그림: n = 점 [x, y](0~100), e = 선 [점, 점]
  const FIGS = {
    tri: { n: [[50, 10], [90, 85], [10, 85]], e: [[0, 1], [1, 2], [2, 0]] },
    sq: { n: [[15, 15], [85, 15], [85, 85], [15, 85]], e: [[0, 1], [1, 2], [2, 3], [3, 0]] },
    sqd: { n: [[15, 15], [85, 15], [85, 85], [15, 85]], e: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]] },
    house: { n: [[15, 40], [85, 40], [85, 92], [15, 92], [50, 6]], e: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4]] },
    housex: { n: [[15, 40], [85, 40], [85, 92], [15, 92], [50, 6]], e: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [0, 2], [1, 3]] },
    bow: { n: [[50, 50], [10, 12], [10, 88], [90, 12], [90, 88]], e: [[0, 1], [0, 2], [1, 2], [0, 3], [0, 4], [3, 4]] },
    star: { n: [[50, 6], [92, 38], [76, 92], [24, 92], [8, 38]], e: [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]] },
    twosq: { n: [[8, 25], [50, 25], [92, 25], [92, 75], [50, 75], [8, 75]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4]] },
    twosqd: { n: [[8, 25], [50, 25], [92, 25], [92, 75], [50, 75], [8, 75]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4], [0, 4]] },
    zig: { n: [[8, 80], [36, 20], [64, 80], [92, 20]], e: [[0, 1], [1, 2], [2, 3]] },
    env: { n: [[15, 15], [85, 15], [85, 85], [15, 85]], e: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]] },
    window: { n: [[10, 10], [50, 10], [90, 10], [10, 50], [50, 50], [90, 50], [10, 90], [50, 90], [90, 90]], e: [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8]] },
    tric: { n: [[50, 8], [92, 88], [8, 88], [50, 60]], e: [[0, 1], [1, 2], [2, 0], [0, 3], [1, 3], [2, 3]] },
    plus: { n: [[50, 50], [50, 8], [92, 50], [50, 92], [8, 50]], e: [[0, 1], [0, 2], [0, 3], [0, 4]] },
  };
  const DRAWABLE = ['tri', 'sq', 'sqd', 'house', 'housex', 'bow', 'star', 'twosq', 'twosqd', 'zig'], NOTDRAW = ['env', 'window', 'tric', 'plus'];
  const degs = f => f.n.map((_, i) => f.e.filter(([a, b]) => a === i || b === i).length);
  const oddOf = f => degs(f).map((d, i) => d % 2 ? i : -1).filter(i => i >= 0);
  const figSvg = (f, { labels = {}, used = [], odd = false, size = 150, cls = '' } = {}) => {
    const d = degs(f), lines = f.e.map(([a, b], k) => `<line x1="${f.n[a][0]}" y1="${f.n[a][1]}" x2="${f.n[b][0]}" y2="${f.n[b][1]}" stroke="${used.includes(k) ? '#ff7043' : 'currentColor'}" stroke-width="${used.includes(k) ? 6 : 4}" stroke-linecap="round"/>`).join('');
    const dots = f.n.map(([x, y], i) => `<g class="m-fnode" data-node="${i}"><circle cx="${x}" cy="${y}" r="${odd && d[i] % 2 ? 8 : 6}" fill="${odd && d[i] % 2 ? '#e53935' : '#3a2d4f'}" stroke="#fff" stroke-width="2"/>${labels[i] ? `<text x="${x + (x > 50 ? 9 : -9)}" y="${y - 8}" font-size="13" font-weight="700" text-anchor="middle" fill="#7e57c2">${labels[i]}</text>` : ''}${odd ? `<text x="${x}" y="${y + 20}" font-size="11" text-anchor="middle" fill="${d[i] % 2 ? '#e53935' : '#78909c'}">${d[i]}</text>` : ''}</g>`).join('');
    return `<svg viewBox="-12 -12 124 124" class="m-fig ${cls}" style="width:${size}px" aria-label="점 ${f.n.length}개, 선 ${f.e.length}개 그림">${lines}${dots}</svg>`;
  };
  const figFlip = f => ({ n: f.n.map(([x, y]) => [100 - x, y]), e: f.e });
  // 성냥개비 숫자: 일곱 칸(a 위, b 오른쪽 위, c 오른쪽 아래, d 아래, e 왼쪽 아래, f 왼쪽 위, g 가운데)
  const DIG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcfgd' };
  const segSet = d => new Set(DIG[d]);
  const SEGXY = { a: [8, 6, 38, 6], b: [42, 10, 42, 40], c: [42, 50, 42, 80], d: [8, 84, 38, 84], e: [4, 50, 4, 80], f: [4, 10, 4, 40], g: [8, 45, 38, 45] };
  const stick = ([x1, y1, x2, y2], on = true, hi = false) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${on ? (hi ? '#ff7043' : '#e0b07a') : 'currentColor'}" stroke-opacity="${on ? 1 : .15}" stroke-width="6" stroke-linecap="round"/>${on ? `<circle cx="${x2}" cy="${y2}" r="4" fill="${hi ? '#ff7043' : '#d84315'}"/>` : ''}`;
  const digSvg = (segs, ox = 0, hi = '') => `<g transform="translate(${ox} 0)">${Object.entries(SEGXY).map(([k, xy]) => segs.has(k) ? stick(xy, true, hi.includes(k)) : '').join('')}</g>`;
  // 식 그리기: '6+4=4' 같은 글자열. 숫자는 일곱 칸, +는 두 막대, −는 하나, =는 둘
  const eqSvg = (str, size = 1) => {
    let x = 0, out = '';
    for (const ch of str) {
      if (/\d/.test(ch)) { out += digSvg(segSet(ch), x); x += 56; }
      else if (ch === '+') { out += stick([x + 4, 45, x + 34, 45]) + stick([x + 19, 30, x + 19, 60]); x += 46; }
      else if (ch === '-') { out += stick([x + 4, 45, x + 34, 45]); x += 46; }
      else if (ch === '=') { out += stick([x + 4, 36, x + 34, 36]) + stick([x + 4, 54, x + 34, 54]); x += 46; }
    }
    return `<svg viewBox="-4 0 ${x + 4} 92" class="m-match" style="width:${Math.round((x + 8) * 0.9 * size)}px" aria-label="성냥개비 식 ${str.replace('-', '−')}">${out}</svg>`;
  };
  const stickCount = str => [...str].reduce((n, ch) => n + (/\d/.test(ch) ? DIG[ch].length : ch === '+' || ch === '=' ? 2 : ch === '-' ? 1 : 0), 0);
  // 막대 하나 옮기기 이웃: 같은 숫자 안에서(same), 빼기(less), 더하기(more)
  const digs = Object.keys(DIG);
  const nb = (d, kind) => digs.filter(y => { const A = segSet(d), B = segSet(y); if (y === d) return false; const onlyA = [...A].filter(s => !B.has(s)).length, onlyB = [...B].filter(s => !A.has(s)).length; return kind === 'same' ? onlyA === 1 && onlyB === 1 : kind === 'less' ? onlyA === 1 && onlyB === 0 : onlyA === 0 && onlyB === 1; });
  const eqOk = s => { const m = s.match(/^(\d)([+-])(\d)=(\d)$/); return !!m && (m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3]) === +m[4]; };
  const eqShow = s => s.replace('-', ' − ').replace('+', ' + ').replace('=', ' = ');
  // 식에서 막대 하나를 옮겨 만들 수 있는 모든 식 (숫자 안에서, 또는 한 숫자에서 빼서 다른 숫자에 더하기)
  const oneMoves = s => { const out = new Set(), idx = [0, 2, 4];
    for (const i of idx) for (const y of nb(s[i], 'same')) out.add(s.slice(0, i) + y + s.slice(i + 1));
    for (const i of idx) for (const j of idx) if (i !== j) for (const y of nb(s[i], 'less')) for (const z of nb(s[j], 'more')) { const t = [...s]; t[i] = y; t[j] = z; out.add(t.join('')); }
    return [...out]; };
  // ── 묶음 3 그림 (2026-11-27): 펜토미노 판 · 세모와 동그라미 · 쌓기 탑 · 곱셈 나무 · 나눠 담기 ──
  // 판에 구멍(hole = 칸 모양)을 뚫어 보여 준다. 나머지 칸은 회색으로 채움
  const holeBoard = (hole, W = 5, H = 4, s = 26) => { const h = pNorm(hole), w = Math.max(...h.map(p => p[0])) + 1, hh = Math.max(...h.map(p => p[1])) + 1, ox = Math.floor((W - w) / 2), oy = Math.floor((H - hh) / 2), set = new Set(h.map(([x, y]) => `${x + ox},${y + oy}`));
    let out = ''; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out += `<rect x="${x * s}" y="${y * s}" width="${s}" height="${s}" fill="${set.has(x + ',' + y) ? '#fffaf0' : '#b0bec5'}" stroke="#78909c" stroke-width="1.5"${set.has(x + ',' + y) ? ' stroke-dasharray="4 3"' : ''}/>`;
    return `<svg viewBox="-2 -2 ${W * s + 4} ${H * s + 4}" class="m-board" style="width:${W * s + 4}px" aria-label="빈칸 ${h.length}칸이 있는 판">${out}</svg>`; };
  // 세모: 꼭짓점 세 개와 변 길이·각 표시
  const triSvg = (P, { sides = null, angles = null, right = -1 } = {}) => {
    const pts = P.map(p => p.join(',')).join(' '), mid = (a, b) => [(P[a][0] + P[b][0]) / 2, (P[a][1] + P[b][1]) / 2];
    const lab = sides ? [[0, 1], [1, 2], [2, 0]].map(([a, b], k) => { const [x, y] = mid(a, b); return `<text x="${x}" y="${y}" dy="${y > 60 ? 14 : -6}" font-size="12" font-weight="700" text-anchor="middle" fill="#e53935">${sides[k]}</text>`; }).join('') : '';
    const ang = angles ? P.map(([x, y], k) => `<text x="${x}" y="${y}" dx="${x < 40 ? 14 : x > 80 ? -16 : 0}" dy="${y < 30 ? 22 : -6}" font-size="11" text-anchor="middle" fill="#7e57c2">${angles[k]}</text>`).join('') : '';
    const sq = right >= 0 ? (() => { const [x, y] = P[right]; return `<rect x="${x}" y="${y - 10}" width="10" height="10" fill="none" stroke="#ff7043" stroke-width="2"/>`; })() : '';
    return `<svg viewBox="-12 -12 144 124" class="m-tri" aria-label="세모"><polygon points="${pts}" fill="#ffe0b2" stroke="#3a2d4f" stroke-width="3" stroke-linejoin="round"/>${sq}${lab}${ang}</svg>`; };
  const TRIS = { 정삼각형: [[60, 8], [112, 98], [8, 98]], 이등변: [[60, 4], [96, 98], [24, 98]], 부등변: [[20, 20], [118, 98], [6, 98]], 직각: [[8, 8], [8, 98], [100, 98]], 둔각: [[30, 70], [122, 98], [2, 98]], 예각: [[70, 6], [108, 98], [18, 98]] };
  // 동그라미: 반지름·지름, 직선과 만나는 점
  const circSvg = ({ r = null, d = null, line = null } = {}) => `<svg viewBox="0 0 120 120" class="m-circ" aria-label="동그라미"><circle cx="60" cy="60" r="44" fill="#e3f2fd" stroke="#1e88e5" stroke-width="3"/><circle cx="60" cy="60" r="3" fill="#3a2d4f"/>
    ${r !== null ? `<line x1="60" y1="60" x2="104" y2="60" stroke="#e53935" stroke-width="3"/><text x="82" y="54" font-size="12" font-weight="700" text-anchor="middle" fill="#e53935">${r}</text>` : ''}
    ${d !== null ? `<line x1="16" y1="78" x2="104" y2="78" stroke="#43a047" stroke-width="3"/><text x="60" y="94" font-size="12" font-weight="700" text-anchor="middle" fill="#43a047">${d}</text>` : ''}
    ${line !== null ? `<line x1="0" y1="${[4, 16, 60][line]}" x2="120" y2="${[4, 16, 60][line]}" stroke="#ff7043" stroke-width="3"/>` : ''}</svg>`;
  // 탑(평균 맛보기): 칸마다 쌓은 블록 수
  const towers = (h, hi = -1) => `<div class="m-towers">${h.map((v, i) => `<div class="m-tower ${i === hi ? 'hi' : ''}" data-t="${i}">${v === null ? '<i class="q">?</i>' : '<i></i>'.repeat(v)}<b>${v === null ? '?' : v}</b></div>`).join('')}</div>`;
  // 곱셈 나무: [수, 왼쪽 나무, 오른쪽 나무]
  const isPrime = n => n > 1 && [...Array(Math.floor(Math.sqrt(n)) - 1).keys()].every(i => n % (i + 2));
  const pfac = n => { const f = []; for (let p = 2; n > 1; p++) while (n % p === 0) { f.push(p); n /= p; } return f; };
  const ftree = n => { if (isPrime(n) || n < 4) return [n]; const ds = [...Array(n).keys()].filter(d => d > 1 && d * d <= n && n % d === 0); const d = ds[ds.length - 1]; return [n, ftree(d), ftree(n / d)]; };
  const treeHtml = t => t.length === 1 ? `<span class="m-leaf ${isPrime(t[0]) ? 'p' : ''}">${t[0]}</span>` : `<span class="m-node"><b>${t[0]}</b><span class="m-kids">${treeHtml(t[1])}${treeHtml(t[2])}</span></span>`;
  // 나눠 담기: n개를 k접시에
  const plates = (n, k, e = '🍬') => `<div class="m-plates">${Array.from({ length: k }, (_, i) => `<span class="m-plate">${Array.from({ length: Math.floor(n / k) + (i < n % k ? 1 : 0) }, () => mPic(e)).join('')}</span>`).join('')}</div>`;
  const gen = {
    count(lo, hi) {
      if (lo == null) [lo, hi] = [[1, 5], [1, 10], [6, 15], [15, 25]][LV];
      const n = lo + R(hi - lo + 1), [e, name] = MATH_THINGS[R(MATH_THINGS.length)], u = mUnit(e), say = `${name} 몇 ${u}일까요?`;
      return { ask: `${mPic(e)} ${say}`, say, show: `<div class="m-count">${Array(n).fill(`<span>${mPic(e)}</span>`).join('')}</div>`, opts: nearby(n, Math.max(1, lo - 2), hi + 2), ans: n, hint: H.count,
        explain: `<div class="m-count">${Array.from({ length: n }, (_, k) => `<span class="m-num">${mPic(e)}<i>${k + 1}</i></span>`).join('')}</div><p class="m-eq-num">모두 ${n}${u}</p>` };
    },
    shape() {
      const keys = Object.keys(SHAPES), want = keys[R(3)], cols = shuffle(COLORS);
      const rotOf = k => LV === 0 ? 0 : k === 'tri' ? [0, 15, -15, 180][R(4)] : R(LV >= 2 ? 45 : 30);
      const opts = shuffle(LV === 3 ? [...keys, R(2) ? 'p5' : 'p6'] : keys).map((k, i) => ({ k, html: SHAPES[k] ? svg(k, cols[i], rotOf(k)) : polySvg(k === 'p5' ? 5 : 6, cols[i], R(40)) })), say = (LV >= 2 ? MATH_SAY.shapeHard : MATH_SAY.shape)[want];
      return { ask: say, say, show: '', opts: opts.map(o => o.k), labels: Object.fromEntries(opts.map(o => [o.k, o.html])), ans: want, hint: H.shape,
        explain: `<div class="m-viz m-shapes">${svg(want, '#ffd54f')}</div><p class="m-eq-num">${SHAPES[want][0]} · 뾰족한 곳 ${SHAPES[want][2]}군데</p>` };
    },
    pattern() {
      const units = [[['A', 'B']], [['A', 'A', 'B'], ['A', 'B', 'C'], ['A', 'B', 'B']], [['A', 'B', 'B', 'C'], ['A', 'A', 'B', 'B'], ['A', 'B', 'C', 'C']], [['A', 'B', 'C', 'B'], ['A', 'A', 'B', 'C'], ['A', 'B', 'B', 'C', 'C'], ['A', 'B', 'A', 'C', 'C']]][LV];
      const unit = units[R(units.length)], pool = shuffle(['🍎', '🍌', '🍇', '⭐', '🌙', '❤️', '🐶', '🐱', '🍓', '🐥']);
      const map = { A: pool[0], B: pool[1], C: pool[2] }, seq = Array.from({ length: unit.length * 2 + 2 }, (_, i) => map[unit[i % unit.length]]);
      const hide = LV >= 2 ? unit.length + R(seq.length - unit.length) : seq.length - 1, ans = seq[hide];
      const o = shuffle([ans, ...[...new Set([map.A, map.B, map.C || pool[3], pool[4]])].filter(v => v !== ans).slice(0, LV === 3 ? 3 : 2)]);
      const chunks = []; for (let i = 0; i < seq.length; i += unit.length) chunks.push(seq.slice(i, i + unit.length).map((x, j) => i + j === hide ? `<span class="m-fill">${mPic(x)}</span>` : `<span>${mPic(x)}</span>`).join(''));
      return { ask: MATH_SAY.pattern, say: MATH_SAY.pattern, show: `<div class="m-seq">${seq.map((x, i) => i === hide ? '<b class="m-q">?</b>' : `<span>${mPic(x)}</span>`).join('')}</div>`, opts: o, labels: Object.fromEntries(o.map(v => [v, mPic(v)])), ans, hint: H.pattern,
        explain: `<div class="m-seq m-units">${chunks.map(c => `<span class="m-unit">${c}</span>`).join('')}</div><p class="fine">점선 한 칸이 되풀이되는 한 묶음이에요.</p>` };
    },
    // 다른 무리 찾기 (집합): 쉬움은 과일과 동물, 보통은 네 무리, 도전은 같은 무리 넷과 다른 하나
    odd() {
      const a = LV === 3 ? shuffle([0, 4])[0] : LV === 1 ? shuffle([0, 1, 3])[0] : shuffle([0, 1])[0], b = LV === 3 ? 4 - a : LV === 0 ? 1 - a : shuffle([0, 1, 2, 3].filter(x => x !== a))[0];
      const same = shuffle(ODD[a]).slice(0, LV >= 2 ? 4 : 3), diff = ODD[b][R(ODD[b].length)], all = shuffle([...same, diff]);
      return { ask: MATH_SAY.odd, say: MATH_SAY.odd, show: '', opts: all, labels: Object.fromEntries(all.map(v => [v, mPic(v)])), ans: diff, hint: H.odd,
        explain: `<div class="m-viz m-groups"><span class="m-ring">${same.map(x => `<span>${mPic(x)}</span>`).join('')}<small>${ODDN[a]}</small></span><span class="m-ring alone"><span>${mPic(diff)}</span><small>${ODDN[b]}</small></span></div>` };
    },
    // 머리셈: 쉬움 10까지, 보통 20까지, 도전 50까지(두 자리 ± 한 자리)
    mental(op) {
      const add = op ? op === '+' : R(2) === 0, M = [10, 20, 50, 100][LV]; let a, b, ans;
      if (LV === 3) {
        if (add) { a = 15 + R(65); b = 12 + R(99 - a - 11); } else { a = 30 + R(70); b = 12 + R(a - 17); }
        ans = add ? a + b : a - b; const bt = b - b % 10, bo = b % 10, mid = add ? a + bt : a - bt;
        return { ask: `${a} ${add ? '+' : '−'} ${b} = ?`, show: '', opts: shuffle([ans, ...[...new Set([ans + 10, ans - 10, ans + 1, ans - 1])].filter(v => v >= 0 && v !== ans).slice(0, 3)]), ans, hint: H.mental,
          explain: `<p class="m-eq-num">${a} ${add ? '+' : '−'} ${bt} = ${mid}</p><p class="m-eq-num">${mid} ${add ? '+' : '−'} ${bo} = ${ans}</p><p class="fine">십 묶음 먼저, 낱개는 나중에 ${add ? '더해요' : '빼요'}.</p>` };
      }
      if (LV === 2) { a = 11 + R(add ? 30 : 39); b = 1 + R(9); } else if (add) { a = 1 + R(M - 2); b = 1 + R(M - a); } else { a = 3 + R(M - 2); b = 1 + R(a); }
      ans = add ? a + b : a - b;
      const pic = a <= 20 ? (add ? `<div class="m-viz m-dots">${mDots(a)}<b>+</b>${mDots(b, 'b')}</div>` : `<div class="m-viz m-dots">${mDots(a - b)}${mDots(b, 'gone')}</div>`)
        : `<p class="m-eq-num">${a}${add ? ' → ' + Array.from({ length: b }, (_, k) => a + k + 1).join(', ') : ' → ' + Array.from({ length: b }, (_, k) => a - k - 1).join(', ')}</p>`;
      return { ask: `${a} ${add ? '+' : '−'} ${b} = ?`, show: '', opts: nearby(ans, 0, M, 4), ans, hint: H.mental, explain: `${pic}<p class="m-eq-num">${a} ${add ? '+' : '−'} ${b} = ${ans}</p>` };
    },
    // 곱셈: 쉬움 2·5단, 보통 2~9단, 도전은 빈 곱하는 수 찾기. 틀린 보기는 한 단 옆에서
    mul() {
      if (LV === 3) {
        const a = 11 + R(9), b = 2 + R(4), ans = a * b;
        return { ask: `${a} × ${b} = ?`, show: '', opts: shuffle([ans, ...[...new Set([ans + b, ans - b, ans + 10, ans - 10])].filter(v => v > 0 && v !== ans).slice(0, 3)]), ans, hint: H.mul,
          explain: `<p class="m-eq-num">${a} × ${b} = 10 × ${b} + ${a - 10} × ${b}</p><p class="m-eq-num">= ${10 * b} + ${(a - 10) * b} = ${ans}</p>` };
      }
      const a = LV === 0 ? [2, 5][R(2)] : 2 + R(8), b = LV === 0 ? 1 + R(5) : 2 + R(8), ans = a * b;
      const pic = `<div class="m-viz m-dgrid" style="--c:${a}">${mDots(ans)}</div><p class="m-eq-num">${a}개씩 ${b}줄 = ${ans}</p>`;
      if (LV >= 2) return { ask: `${a} × ? = ${ans}`, show: '', opts: nearby(b, 1, 10, 4), ans: b, hint: H.mul, explain: pic };
      const wrong = shuffle([...new Set([a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, ans + 1, ans - 1])].filter(v => v > 0 && v !== ans)).slice(0, 3);
      return { ask: `${a} × ${b} = ?`, show: '', opts: shuffle([ans, ...wrong]), ans, hint: H.mul, explain: pic };
    },
    // 분수: 색칠한 부분 읽기, 또는 말한 분수에 맞는 그림 고르기
    frac() {
      const ds = [[2, 3, 4], [2, 3, 4, 5, 6, 8], [5, 6, 8], [8, 10, 12]][LV], d = ds[R(ds.length)], n = 1 + R(d - 1), key = `${n}/${d}`;
      const cand = [`${d - n}/${d}`, `${n}/${d + 1}`, `${Math.min(n + 1, d - 1)}/${d}`, `${Math.max(n - 1, 1)}/${d}`, `${n}/${Math.max(d - 1, 2)}`, `${d}/${n + d}`]
        .filter(v => { const [x, y] = v.split('/').map(Number); return x < y; });
      // 크기가 같은 분수(2/3과 4/6)는 보기에 함께 넣지 않는다: 정답이 둘처럼 보이니까
      const val = v => { const [x, y] = v.split('/').map(Number); return Math.round(x / y * 1e6); }, seen = new Set([val(key)]);
      const opts = shuffle([key, ...shuffle([...new Set(cand)]).filter(v => !seen.has(val(v)) && seen.add(val(v))).slice(0, 2)]);
      const explain = `<div class="m-viz">${pie(n, d)}</div><p class="m-eq-num">모두 ${d}조각 중 색칠한 ${n}조각 → ${fracTxt(key)}</p>`;
      if (LV === 0 || R(2)) return { ask: '색칠한 부분은 전체의 얼마일까요?', show: `<div class="m-viz">${pie(n, d)}</div>`, opts, labels: Object.fromEntries(opts.map(v => [v, fracTxt(v)])), ans: key, hint: H.frac, explain };
      return { ask: `색칠한 부분이 <b>${KN[d]}분의 ${KN[n]}</b>인 것을 골라요`, show: `<p class="m-eq-num">${fracTxt(key)}</p>`, opts, labels: Object.fromEntries(opts.map(v => [v, pie(...v.split('/').map(Number), 'm-pie sm')])), ans: key, hint: H.frac, explain };
    },
    // 약수와 배수: 'n의 약수' 또는 'k의 배수'를 네 개 중에서 고른다
    factor() {
      if (R(2)) {
        const ns = [[6, 8, 10, 12], [8, 10, 12, 14, 15, 16, 18, 20], [24, 30, 36], [36, 40, 42, 48]][LV], n = ns[R(ns.length)], mid = [...Array(n).keys()].filter(v => v > 1 && v < n);
        const ds = mid.filter(v => n % v === 0), ans = ds[R(ds.length)], wrong = shuffle(mid.filter(v => n % v)).slice(0, 3);
        return { ask: `${n}의 약수는 어느 것일까요?`, show: '', opts: shuffle([ans, ...wrong]), ans, hint: H.factor,
          explain: `${mathViz({ k: 'nums', to: n, hi: [1, ...ds, n] })}<p class="m-eq-num">${n}의 약수: ${[1, ...ds, n].join(', ')}</p>` };
      }
      const k = [[2, 3, 5], [3, 4, 5, 6, 7, 8, 9], [6, 7, 8, 9, 11, 12], [11, 12, 13, 14, 15, 16]][LV][R(LV === 0 ? 3 : 6)] || 3, ans = k * (2 + R(4));
      const wrong = shuffle([ans - 2, ans - 1, ans + 1, ans + 2, ans + 3].filter(v => v > 1 && v % k)).slice(0, 3), to = Math.ceil((ans + 3) / 6) * 6;
      return { ask: `${k}의 배수는 어느 것일까요?`, show: '', opts: shuffle([ans, ...wrong]), ans, hint: H.factor,
        explain: `${mathViz({ k: 'nums', to, hi: Array.from({ length: Math.floor(to / k) }, (_, i) => k * (i + 1)) })}<p class="m-eq-num">${k}의 배수: ${k}, ${k * 2}, ${k * 3}, …</p>` };
    },
    // 각: 그림을 보고 예각·직각·둔각 (도전은 직각에 가까운 각)
    angle() {
      const kind = ['예각', '직각', '둔각'][R(3)], deg = [{ 예각: [30, 45], 직각: [90], 둔각: [135, 150] }, { 예각: [30, 45, 60, 70], 직각: [90], 둔각: [110, 120, 135, 150] }, { 예각: [70, 75, 80], 직각: [90], 둔각: [100, 105, 110] }, { 예각: [80, 84], 직각: [90], 둔각: [96, 100] }][LV][kind];
      return { ask: '어떤 각일까요?', show: `<div class="m-viz">${angSvg(deg[R(deg.length)], R(2))}</div>`, opts: ['예각', '직각', '둔각'], ans: kind, hint: H.angle,
        explain: `${mathViz({ k: 'angle', all: true })}<p class="m-eq-num">정답: ${kind}</p>` };
    },
    // 다각형: 이름 또는 변의 수
    poly() {
      const ns = [[3, 4, 5], [3, 4, 5, 6, 8], [3, 4, 5, 6, 7, 8], [5, 6, 7, 8]][LV], n = ns[R(ns.length)], show = `<div class="m-viz">${polySvg(n, COLORS[R(6)], LV ? R(60) : 0)}</div>`;
      const explain = `<div class="m-viz">${polySvg(n, '#ffd54f')}</div><p class="m-eq-num">변 ${n}개 → ${POLY[n]}</p>`;
      if (R(2)) { const o = shuffle([n, ...shuffle(ns.filter(v => v !== n)).slice(0, 2)]); return { ask: '이 도형의 이름은 무엇일까요?', show, opts: o.map(v => POLY[v]), ans: POLY[n], hint: H.poly, explain }; }
      return { ask: '변은 모두 몇 개일까요?', show, opts: shuffle([n, ...shuffle([3, 4, 5, 6, 7, 8].filter(v => v !== n)).slice(0, 2)]), ans: n, hint: H.poly, explain };
    },
    // ── 씨앗 더하기 (2026-11-27) ──
    // 쌓기나무: 칸마다 높이를 정해 그림으로 보여 주고 모두 몇 개인지. 쉬움 한 줄, 보통 2×2, 도전 3×2(빈칸도). 뒷줄·왼쪽 칸이 앞·오른쪽보다 낮지 않게 해서 꼭대기는 다 보인다
    blocks() {
      const Y = LV === 0 ? 1 : LV === 3 ? 3 : 2, X = LV >= 2 ? 3 : 2 + (LV === 0 ? R(2) : 0), top = LV === 3 ? 4 : 3, h = [];
      for (let y = 0; y < Y; y++) { h.push([]); for (let x = 0; x < X; x++) {
        const cap = Math.min(y ? h[y - 1][x] : top, x ? h[y][x - 1] : top), lo = LV >= 2 && (x || y) ? 0 : 1;
        h[y].push(LV === 0 ? 1 + R(3) : !x && !y ? (LV >= 2 ? top : 2 + R(2)) : Math.max(lo, cap - R(LV >= 2 ? 3 : 2)));
      } }
      const ans = h.flat().reduce((a, b) => a + b, 0), parts = h.flat().filter(Boolean);
      return { ask: MATH_SAY.blocksAsk, say: MATH_SAY.blocksAsk, show: `<div class="m-viz">${blocksSvg(h)}</div>`, opts: nearby(ans, 1, ans + 4, 3), ans, hint: H.blocks,
        explain: `<div class="m-viz m-hmap-wrap">${blocksSvg(h, 16)}${hmap(h)}</div><p class="m-eq-num">${parts.join(' + ')} = ${ans}</p><p class="fine">위에서 본 칸마다 몇 층인지 적었어요.</p>` };
    },
    // 그림 표 읽기: 쉬움 몇 개, 보통 가장 많은·적은 것, 도전 수로 쓴 표에서 차이·모두
    table() {
      const set = R(2) ? ['🍎', '🍓', '🍌', '🍇'] : ['🐶', '🐱', '🐥', '🐟'], n = LV === 0 ? 3 : 4, items = shuffle(set).slice(0, n);
      const counts = shuffle(Array.from({ length: LV === 0 ? 5 : LV === 3 ? 9 : 7 }, (_, i) => i + 1)).slice(0, n), rows = items.map((e, i) => [e, counts[i]]);
      const u = mUnit(items[0]), nm = e => MATH_NAMES[e], show = tableHtml(rows, LV >= 2 ? 'num' : 'pic');
      const kind = LV === 0 ? 'value' : LV === 1 ? ['value', 'most', 'least'][R(3)] : LV === 2 ? ['diff', 'total'][R(2)] : ['maxmin', 'total'][R(2)];
      const ex = hi => `${tableHtml(rows, 'both', hi)}`;
      if (kind === 'value') { const i = R(n), say = `${nm(items[i])}는 몇 ${u}일까요?`; return { ask: say, say, show, opts: nearby(counts[i], 1, 7, 3), ans: counts[i], hint: H.table, explain: ex([i]) }; }
      if (kind === 'most' || kind === 'least') {
        const i = counts.indexOf(kind === 'most' ? Math.max(...counts) : Math.min(...counts)), say = MATH_SAY[kind === 'most' ? 'tableMost' : 'tableLeast'];
        return { ask: say, say, show, opts: items, labels: Object.fromEntries(items.map(e => [e, mPic(e)])), ans: items[i], hint: H.table, explain: ex([i]) };
      }
      if (kind === 'diff') {
        const [i, j] = shuffle([...Array(n).keys()]).slice(0, 2).sort((a, b) => counts[b] - counts[a]), ans = counts[i] - counts[j], say = `${nm(items[i])}는 ${nm(items[j])}보다 몇 ${u} 더 많을까요?`;
        return { ask: say, say, show, opts: nearby(ans, 1, 7, 3), ans, hint: H.table, explain: `${ex([i, j])}<p class="m-eq-num">${counts[i]} − ${counts[j]} = ${ans}</p>` };
      }
      if (kind === 'maxmin') {
        const hi = counts.indexOf(Math.max(...counts)), lo = counts.indexOf(Math.min(...counts)), ans = counts[hi] - counts[lo], say = `가장 많은 것과 가장 적은 것은 몇 ${u} 차이 날까요?`;
        return { ask: say, say, show, opts: nearby(ans, 1, 9, 3), ans, hint: H.table, explain: `${ex([hi, lo])}<p class="m-eq-num">${counts[hi]} − ${counts[lo]} = ${ans}</p>` };
      }
      const ans = counts.reduce((a, b) => a + b, 0), say = `모두 몇 ${u}일까요?`;
      return { ask: say, say, show, opts: nearby(ans, 4, 40, 3), ans, hint: H.table, explain: `${ex([...Array(n).keys()])}<p class="m-eq-num">${counts.join(' + ')} = ${ans}</p>` };
    },
    // ── 새싹 더하기 (2026-11-27) ──
    // 벤 다이어그램: 쉬움 어디에 들어갈까, 보통 영역의 개수, 도전 '…이지만 …이 아닌'·바깥·겹친 곳 고르기
    venn() {
      const A = ['과일', '과일', '동물', '탈것'][R(4)], B = ['빨간', '노란', '초록'][R(3)], all = Object.keys(VENN);
      const placed = shuffle(all).slice(0, 8).map(e => ({ e, r: vRegion(e, A, B) }));
      const cap = { a: 3, ab: 2, b: 3, o: 4 }, use = { a: 0, ab: 0, b: 0, o: 0 }, ok = placed.filter(p => use[p.r]++ < cap[p.r]);
      const cnt = r => ok.filter(p => p.r === r).length, full = vennSvg(A, B, ok);
      const UA = { 동물: '마리', 탈것: '대' }[A] || '개'; // A 동그라미 안(A에만·A 전체)은 A를 세는 말로, 섞인 곳은 개
      if (LV === 0) {
        const e = all[R(all.length)], r = vRegion(e, A, B), opts = ['a', 'ab', 'b', 'o'].map(k => vName(k, A, B));
        return { ask: `${mPic(e)} ${jo(MATH_NAMES[e], '은', '는')} 어디에 들어갈까요?`, show: `<div class="m-viz">${vennSvg(A, B)}</div>`, opts, ans: vName(r, A, B), hint: H.venn,
          explain: `<div class="m-viz">${vennSvg(A, B, [{ e, r }], r)}</div><p class="m-eq-num">${MATH_NAMES[e]}: ${VENN[e][0]}, ${VENN[e][1]} 색 → ${vName(r, A, B)}</p>` };
      }
      if (LV === 1) {
        const k = [['ab', `겹친 곳에는 몇 ${UA}가 있을까요?`], ['a+ab', `${jo(A, '은', '는')} 모두 몇 ${UA}일까요?`], ['b+ab', `${COLN[B]}은 모두 몇 개일까요?`]][R(3)];
        const rs = k[0].split('+'), ans = rs.reduce((n, r) => n + cnt(r), 0);
        return { ask: k[1], show: `<div class="m-viz">${full}</div>`, opts: nearby(ans, 0, 8, 3), ans, hint: H.venn, explain: `<div class="m-viz">${vennSvg(A, B, ok, rs.length > 1 ? null : rs[0])}</div><p class="m-eq-num">${rs.map(r => `${vName(r, A, B)} ${cnt(r)}`).join(' + ')} = ${ans}</p>` };
      }
      if (LV === 3) {
        const k = [['a+b', '한 동그라미에만 들어가는 것은 모두 몇 개일까요?'], ['a+ab+b', '두 동그라미 가운데 하나라도 들어가는 것은 모두 몇 개일까요?']][R(2)], rs = k[0].split('+'), ans = rs.reduce((n, r) => n + cnt(r), 0);
        return { ask: k[1], show: `<div class="m-viz">${full}</div>`, opts: nearby(ans, 0, 9, 3), ans, hint: H.venn, explain: `<div class="m-viz">${full}</div><p class="m-eq-num">${rs.map(r => `${vName(r, A, B)} ${cnt(r)}`).join(' + ')} = ${ans}</p>` };
      }
      const k = [['b', `${COLN[B]}이지만 ${jo(A, '이', '가')} 아닌 것은 몇 개일까요?`], ['a', `${jo(A, '이지만', '지만')} ${COLN[B]}이 아닌 것은 몇 ${UA}일까요?`], ['o', '어느 동그라미에도 들어가지 않는 것은 몇 개일까요?']][R(3)], ans = cnt(k[0]);
      return { ask: k[1], show: `<div class="m-viz">${full}</div>`, opts: nearby(ans, 0, 6, 3), ans, hint: H.venn, explain: `<div class="m-viz">${vennSvg(A, B, ok, k[0])}</div><p class="m-eq-num">${vName(k[0], A, B)}: ${ans}${k[0] === 'a' ? UA : '개'}</p>` };
    },
    // 막대그래프: 쉬움 그림그래프 읽기, 보통 막대 읽기·가장 많은/적은, 도전 차이·두 가지 합
    graph() {
      const fruit = R(2), set = fruit ? ['🍎', '🍓', '🍌', '🍇'] : ['🐶', '🐱', '🐥', '🐟'], n = LV === 0 ? 3 : 4, items = shuffle(set).slice(0, n);
      const counts = shuffle(Array.from({ length: LV === 0 ? 5 : 8 }, (_, i) => i + 1)).slice(0, n), rows = items.map((e, i) => [e, counts[i]]), nm = e => MATH_NAMES[e];
      const title = `우리 반 친구들이 좋아하는 ${fruit ? '과일' : '동물'}`, show = LV === 0 ? picGraph(rows, title) : barSvg(rows, [], title);
      const kind = LV === 0 ? 'value' : LV === 1 ? ['value', 'most', 'least'][R(3)] : LV === 2 ? ['diff', 'sum'][R(2)] : ['maxmin', 'all'][R(2)];
      if (kind === 'value') { const i = R(n); return { ask: `${jo(nm(items[i]), '을', '를')} 좋아하는 친구는 몇 명일까요?`, show, opts: nearby(counts[i], 1, 8, 3), ans: counts[i], hint: H.graph, explain: barSvg(rows, [i]) }; }
      if (kind === 'most' || kind === 'least') {
        const i = counts.indexOf(kind === 'most' ? Math.max(...counts) : Math.min(...counts));
        return { ask: `가장 ${kind === 'most' ? '많은' : '적은'} 친구가 좋아하는 것은 무엇일까요?`, show, opts: items, labels: Object.fromEntries(items.map(e => [e, mPic(e)])), ans: items[i], hint: H.graph, explain: barSvg(rows, [i]) };
      }
      if (kind === 'maxmin') { const hi = counts.indexOf(Math.max(...counts)), lo = counts.indexOf(Math.min(...counts)), ans = counts[hi] - counts[lo];
        return { ask: '가장 많은 친구가 고른 것과 가장 적은 친구가 고른 것은 몇 명 차이 날까요?', show, opts: nearby(ans, 1, 8, 3), ans, hint: H.graph, explain: `${barSvg(rows, [hi, lo])}<p class="m-eq-num">${counts[hi]} − ${counts[lo]} = ${ans}</p>` }; }
      if (kind === 'all') { const ans = counts.reduce((a, b) => a + b, 0);
        return { ask: '조사한 친구는 모두 몇 명일까요?', show, opts: nearby(ans, 6, 36, 3), ans, hint: H.graph, explain: `${barSvg(rows, [...Array(n).keys()])}<p class="m-eq-num">${counts.join(' + ')} = ${ans}</p>` }; }
      const [i, j] = shuffle([...Array(n).keys()]).slice(0, 2).sort((a, b) => counts[b] - counts[a]);
      if (kind === 'diff') { const ans = counts[i] - counts[j]; return { ask: `${jo(nm(items[i]), '을', '를')} 좋아하는 친구는 ${nm(items[j])}보다 몇 명 더 많을까요?`, show, opts: nearby(ans, 1, 8, 3), ans, hint: H.graph, explain: `${barSvg(rows, [i, j])}<p class="m-eq-num">${counts[i]} − ${counts[j]} = ${ans}</p>` }; }
      const ans = counts[i] + counts[j];
      return { ask: `${jo(nm(items[i]), '과', '와')} ${jo(nm(items[j]), '을', '를')} 좋아하는 친구는 모두 몇 명일까요?`, show, opts: nearby(ans, 2, 16, 3), ans, hint: H.graph, explain: `${barSvg(rows, [i, j])}<p class="m-eq-num">${counts[i]} + ${counts[j]} = ${ans}</p>` };
    },
    // 가장 짧은 길: 쉬움 세 길 가운데 가장 짧은 길, 보통 가장 짧은 걸음 수, 도전 나무를 피해 가는 가장 짧은 걸음 수
    path() {
      if (LV === 0) {
        const W = 5, H = 4, s = [0, 3], g = [3, 1], R1 = [1, 0], U = [0, -1], D = [0, 1];
        const best = steps(shuffle([R1, R1, R1, U, U]), s), up = steps([U, U, U, R1, R1, R1, D], s), right = steps([R1, R1, R1, R1, U, U, [-1, 0]], s);
        const order = shuffle([best, up, right]), routes = order.map((pts, i) => ({ pts, col: ROUTE[i][0] })), ans = ROUTE[order.indexOf(best)][1];
        return { ask: '집에서 학교까지 가장 짧은 길은 어느 길일까요?', show: `<div class="m-viz">${pathSvg({ W, H, s, g, routes })}</div>`, opts: ROUTE.map(r => r[1]),
          labels: Object.fromEntries(ROUTE.map(([c, nm]) => [nm, `<span class="m-swatch" style="background:${c}"></span>${nm}`])), ans, hint: MATH_HINTS.path,
          explain: `<div class="m-viz">${pathSvg({ W, H, s, g, routes: [{ pts: best, col: '#ffb300' }], nums: Object.fromEntries(best.slice(1, -1).map((p, k) => [p.join(), k + 1])) })}</div><p class="m-eq-num">${order.map((p, i) => `${ROUTE[i][1]} ${p.length - 1}칸`).join(' · ')}</p>` };
      }
      // 도전: 학교를 멀리 두고 나무를 4~5그루 심어, 나무 때문에 꼭 돌아가야 하는(가장 짧은 길이 2칸 이상 길어지는) 판만 낸다
      for (let t = 0; t < (LV >= 2 ? 3000 : 50); t++) {
        const W = LV === 3 ? 7 : 5 + R(2), H = LV === 3 ? 5 : 4 + R(2), s = [0, H - 1], g = LV >= 2 ? [W - 1 - R(2), R(2)] : [2 + R(W - 2), R(H - 2)], walls = [], nw = LV === 3 ? 6 + R(2) : 4 + R(2);
        if (LV >= 2) while (walls.length < nw) { const k = `${R(W)},${R(H)}`; if (k !== s.join() && k !== g.join() && !walls.includes(k)) walls.push(k); }
        const p = bfs(W, H, s, g, walls); if (!p) continue;
        const ans = p.length - 1, man = Math.abs(g[0] - s[0]) + Math.abs(g[1] - s[1]);
        if (LV >= 2 && ans < man + 2 && t < 2999) continue;
        return { ask: '집에서 학교까지 가장 짧게 가면 몇 칸일까요?', show: `<div class="m-viz">${pathSvg({ W, H, s, g, walls })}</div>`, opts: LV >= 2 ? shuffle([ans, man, ...nearby(ans, 2, 20, 4).filter(v => v !== ans && v !== man)].slice(0, 3)) : nearby(ans, 2, 14, 3), ans, hint: MATH_HINTS.path,
          explain: `<div class="m-viz">${pathSvg({ W, H, s, g, walls, routes: [{ pts: p, col: '#ffb300' }], nums: Object.fromEntries(p.slice(1, -1).map((q, k) => [q.join(), k + 1])) })}</div><p class="m-eq-num">가장 짧은 길: ${ans}칸${ans > man ? ` (나무가 없으면 ${man}칸인데, 나무를 피해 돌아가서 ${ans - man}칸 더 걸어요)` : ''}</p>` };
      }
    },
    // ── 나무 더하기 (2026-11-27) ──
    // 수의 규칙: 쉬움 +d, 보통 −d·×2·가운데 빈칸, 도전 피보나치(앞 두 수의 합)·차이가 1씩 커지는 줄
    seq() {
      let a, lab;
      if (LV === 0) { const d = 2 + R(4), s0 = 1 + R(9); a = Array.from({ length: 5 }, (_, i) => s0 + d * i); lab = a.map(() => `+${d}`); }
      else if (LV === 1) {
        const t = R(3);
        if (t === 0) { const d = 3 + R(7), s0 = d * 5 + R(20); a = Array.from({ length: 5 }, (_, i) => s0 - d * i); lab = a.map(() => `−${d}`); }
        else if (t === 1) { const s0 = 1 + R(3); a = [s0, s0 * 2, s0 * 4, s0 * 8, s0 * 16]; lab = a.map(() => '×2'); }
        else { const d = 2 + R(8), s0 = R(20); a = Array.from({ length: 5 }, (_, i) => s0 + d * i); lab = a.map(() => `+${d}`); }
      } else if (LV === 3) {
        const t = R(3);
        if (t === 0) { const s0 = 1 + R(2); a = [s0, s0 * 3, s0 * 9, s0 * 27, s0 * 81]; lab = a.map(() => '×3'); }
        else if (t === 1) { const s0 = 1 + R(5); a = [s0]; for (let k = 1; k < 6; k++) a.push(a[k - 1] + 2 * k); lab = a.slice(1).map((_, k) => `+${2 * (k + 1)}`); }
        else { const u = 3 + R(4), v = 1 + R(2); a = [5 + R(10)]; for (let k = 1; k < 7; k++) a.push(a[k - 1] + (k % 2 ? u : -v)); lab = a.slice(1).map((_, k) => k % 2 ? `−${v}` : `+${u}`); }
      } else if (R(2)) { const x = 1 + R(3), y = x + R(3); a = [x, y]; while (a.length < 6) a.push(a[a.length - 1] + a[a.length - 2]); lab = null; }
      else { const s0 = 1 + R(5); a = [s0]; for (let k = 1; k < 6; k++) a.push(a[k - 1] + k); lab = a.slice(1).map((_, k) => `+${k + 1}`); }
      const hide = (LV === 1 || LV === 3) && R(2) ? 2 + R(a.length - 3) : a.length - 1, ans = a[hide], shown = a.map((v, i) => i === hide ? '?' : v);
      const explain = lab ? `${nseq(a, lab, hide)}<p class="m-eq-num">규칙: ${[...new Set(lab)].length === 1 ? lab[0] : [...new Set(lab)].length === 2 ? `${lab[0]}, ${lab[1]}, ${lab[0]}, ${lab[1]} …처럼 번갈아 해요` : `${lab.slice(0, 3).join(', ')} …처럼 차이가 커져요`}</p>`
        : `${nseq(a, [], hide)}<p class="m-eq-num">${a.slice(2).map((v, i) => `${a[i]} + ${a[i + 1]} = ${v}`).join(' · ')}</p>`;
      return { ask: '규칙을 찾아 빈칸에 알맞은 수를 골라요', show: nseq(shown), opts: nearby(ans, 0, 999, 3), ans, hint: H.seq, explain };
    },
    // 암호: 쉬움 수를 글자로 풀기, 보통 낱말을 수로 쓰기, 도전 글자를 몇 칸씩 밀어 쓴 암호 풀기
    cipher() {
      const w = CWORDS[R(CWORDS.length)], others = shuffle(CWORDS.filter(x => x !== w)).sort((a, b) => (a.length !== w.length) - (b.length !== w.length)).slice(0, 2);
      const ex = `${keyTable([...w].map(c => SYL.indexOf(c)))}<p class="m-eq-num">${[...w].map(c => `${c} = ${SYL.indexOf(c) + 1}`).join(' · ')}</p>`;
      if (LV === 0) return { ask: '이 암호를 풀면 무슨 낱말일까요?', show: `${keyTable()}<p class="m-code">${enc(w).join(' - ')}</p>`, opts: shuffle([w, ...others]), ans: w, hint: H.cipher, explain: ex };
      if (LV === 1) {
        const right = enc(w).join('-'), cand = [...new Set([enc(w).map(n => n % 14 + 1).join('-'), [...enc(w)].reverse().join('-'), ...others.map(o => enc(o).join('-'))])].filter(v => v !== right);
        const opts = [right, ...cand.slice(0, 2)];
        return { ask: `'${w}'를 암호로 쓰면 어떻게 될까요?`, show: keyTable(), opts: shuffle(opts), ans: right, hint: H.cipher, explain: ex };
      }
      const k = LV === 3 ? 3 + R(3) : 1 + R(2), e = shiftW(w, k);
      return { ask: `글자마다 표에서 ${k}칸씩 뒤 글자로 바꿔 썼어요. '${e}'는 원래 무슨 낱말일까요?`, show: keyTable(), opts: shuffle([w, ...others]), ans: w, hint: H.cipher,
        explain: `${keyTable([...e].map(c => SYL.indexOf(c)))}<p class="m-eq-num">${[...e].map((c, i) => `${c} → ${k}칸 앞 → ${w[i]}`).join(' · ')}</p>` };
    },
    // 복면산: 쉬움 같은 그림 둘·셋의 합, 보통 두 그림, 도전 세로 덧셈에서 가려진 숫자
    masked() {
      const [p, q] = shuffle(['🍎', '🍌', '🍓', '⭐', '🐱']);
      if (LV === 0) {
        const n = 2 + R(2), x = 1 + R(n === 2 ? 9 : 6);
        return { ask: `${mPic(p)}에 들어갈 수는 얼마일까요?`, show: `<p class="m-eqbig">${Array(n).fill(mPic(p)).join(' + ')} = ${n * x}</p>`, opts: nearby(x, 0, 9, 3), ans: x, hint: H.masked,
          explain: `<p class="m-eq-num">${Array(n).fill(x).join(' + ')} = ${n * x}</p><p class="fine">같은 그림에는 같은 수가 들어가요.</p>` };
      }
      if (LV === 1) {
        const x = 1 + R(9), y = 1 + R(9);
        return { ask: `${mPic(q)}에 들어갈 수는 얼마일까요?`, show: `<p class="m-eqbig">${mPic(p)} + ${mPic(p)} = ${2 * x}</p><p class="m-eqbig">${mPic(p)} + ${mPic(q)} = ${x + y}</p>`, opts: nearby(y, 0, 9, 3), ans: y, hint: H.masked,
          explain: `<p class="m-eq-num">${mPic(p)} = ${2 * x} ÷ 2 = ${x}</p><p class="m-eq-num">${mPic(q)} = ${x + y} − ${x} = ${y}</p>` };
      }
      if (LV === 3) {
        const A = 40 + R(60), B = 11 + R(A - 20), D = A - B, which = R(4), dA = String(A).split(''), dB = String(B).split(''), dig = [dA[0], dA[1], dB[0], dB[1]][which];
        const cover = (arr, i) => arr.map((c, j) => j === i ? '🍓' : c).join(''), rows = [which < 2 ? cover(dA, which) : dA.join(''), which >= 2 ? cover(dB, which - 2) : dB.join(''), String(D).padStart(2, ' ')];
        return { ask: `${mPic('🍓')}에 들어갈 숫자는 무엇일까요? (빼기)`, show: `<div class="m-viz">${colAdd(rows, '−')}</div>`, opts: nearby(+dig, 0, 9, 3), ans: +dig, hint: H.masked,
          explain: `<div class="m-viz">${colAdd([String(A), String(B), String(D).padStart(2, ' ')], '−')}</div><p class="m-eq-num">${which < 2 ? `${D} + ${B} = ${A}` : `${A} − ${D} = ${B}`}</p>` };
      }
      const A = 10 + R(50), B = 10 + R(39), S = A + B;
      if (S > 99) return gen.masked();
      const which = R(4), dA = String(A).split(''), dB = String(B).split(''), dig = [dA[0], dA[1], dB[0], dB[1]][which];
      const cover = (arr, i) => arr.map((c, j) => j === i ? '🍓' : c).join('');
      const rows = [which < 2 ? cover(dA, which) : dA.join(''), which >= 2 ? cover(dB, which - 2) : dB.join(''), String(S)];
      return { ask: `${mPic('🍓')}에 들어갈 숫자는 무엇일까요?`, show: `<div class="m-viz">${colAdd(rows)}</div>`, opts: nearby(+dig, 0, 9, 3), ans: +dig, hint: H.masked,
        explain: `<div class="m-viz">${colAdd([String(A), String(B), String(S)])}</div><p class="m-eq-num">${S} − ${which < 2 ? B : A} = ${which < 2 ? A : B}</p>` };
    },
    // 경우의 수: 쉬움 모자×윗옷, 보통 세 명 줄 서기·세 가지 옷, 도전 악수·숫자 카드로 두 자리 수
    cases() {
      const HATS = ['🧢', '👒', '🎩'], TOPS = ['👕', '👚', '🧥'], SHOES = ['👟', '🥾'];
      if (LV === 0) {
        const a = HATS.slice(0, 2 + R(2)), b = TOPS.slice(0, 2 + R(2)), ans = a.length * b.length;
        return { ask: '모자와 윗옷을 하나씩 골라 입는 방법은 모두 몇 가지일까요?', show: `<div class="m-viz m-pick"><span>${a.map(mPic).join('')}</span><span>${b.map(mPic).join('')}</span></div>`, opts: nearby(ans, 2, 12, 3), ans, hint: H.cases,
          explain: `${comboGrid(a, b)}<p class="m-eq-num">${a.length} × ${b.length} = ${ans}</p>` };
      }
      if (LV === 1) {
        if (R(2)) { const f = ['🐶', '🐱', '🐰'], orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
          return { ask: '친구 세 명이 한 줄로 서는 방법은 모두 몇 가지일까요?', show: `<div class="m-viz m-scene">${f.map(mPic).join('')}</div>`, opts: nearby(6, 2, 12, 3), ans: 6, hint: H.cases,
            explain: `<div class="m-orders">${orders.map(o => `<span>${o.map(i => mPic(f[i])).join('')}</span>`).join('')}</div><p class="m-eq-num">3 × 2 × 1 = 6</p>` }; }
        const a = HATS.slice(0, 2 + R(2)), b = TOPS.slice(0, 2), ans = a.length * b.length * 2;
        return { ask: '모자, 윗옷, 신발을 하나씩 골라 입는 방법은 모두 몇 가지일까요?', show: `<div class="m-viz m-pick"><span>${a.map(mPic).join('')}</span><span>${b.map(mPic).join('')}</span><span>${SHOES.map(mPic).join('')}</span></div>`, opts: nearby(ans, 4, 24, 3), ans, hint: H.cases,
          explain: `${comboGrid(a, b)}<p class="m-eq-num">${a.length} × ${b.length} = ${a.length * b.length}, 신발마다 한 번씩 더 → × 2 = ${ans}</p>` };
      }
      if (LV === 3) {
        const t = R(3);
        if (t === 0) { const cards = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).sort(), nums = [];
          for (const x of cards) for (const y of cards) for (const z of cards) if (x !== y && y !== z && x !== z) nums.push(x * 100 + y * 10 + z);
          return { ask: `숫자 카드 ${cards.join(', ')}을 모두 한 번씩 써서 만들 수 있는 세 자리 수는 몇 개일까요?`, show: `<div class="m-viz m-cards-n">${cards.map(c => `<span>${c}</span>`).join('')}</div>`, opts: nearby(6, 3, 12, 3), ans: 6, hint: H.cases,
            explain: `<div class="m-orders">${nums.map(x => `<span>${x}</span>`).join('')}</div><p class="m-eq-num">3 × 2 × 1 = 6</p>` }; }
        if (t === 1) { const n = 6 + R(2), ans = n * (n - 1) / 2;
          return { ask: `친구 ${n}명이 서로 한 번씩 악수하면 악수는 모두 몇 번일까요?`, show: `<div class="m-viz m-scene">${['🐶', '🐱', '🐰', '🐻', '🐼', '🦊', '🐯'].slice(0, n).map(mPic).join('')}</div>`, opts: nearby(ans, 10, 30, 3), ans, hint: H.cases,
            explain: `<p class="m-eq-num">${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')} = ${ans}</p><p class="fine">첫 친구는 ${n - 1}명과, 다음 친구는 남은 ${n - 2}명과 … 악수해요.</p>` }; }
        return { ask: '친구 네 명이 한 줄로 서는 방법은 모두 몇 가지일까요?', show: `<div class="m-viz m-scene">${['🐶', '🐱', '🐰', '🐻'].map(mPic).join('')}</div>`, opts: nearby(24, 12, 30, 3), ans: 24, hint: H.cases,
          explain: `<p class="m-eq-num">4 × 3 × 2 × 1 = 24</p><p class="fine">맨 앞에 설 친구 4가지, 그다음 3가지, 2가지, 1가지예요.</p>` };
      }
      if (R(2)) {
        const n = 3 + R(3), ans = n * (n - 1) / 2, f = ['🐶', '🐱', '🐰', '🐻', '🐼'].slice(0, n), pairs = [];
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push(`${mPic(f[i])}${mPic(f[j])}`);
        return { ask: `친구 ${n}명이 서로 한 번씩 악수하면 악수는 모두 몇 번일까요?`, show: `<div class="m-viz m-scene">${f.map(mPic).join('')}</div>`, opts: nearby(ans, 2, 12, 3), ans, hint: H.cases,
          explain: `<div class="m-orders">${pairs.map(x => `<span>${x}</span>`).join('')}</div><p class="m-eq-num">${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')} = ${ans}</p>` };
      }
      const n = 3 + R(2), cards = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, n).sort(), nums = [];
      for (const x of cards) for (const y of cards) if (x !== y) nums.push(x * 10 + y);
      return { ask: `숫자 카드 ${cards.join(', ')} 가운데 두 장으로 만들 수 있는 두 자리 수는 모두 몇 개일까요?`, show: `<div class="m-viz m-cards-n">${cards.map(c => `<span>${c}</span>`).join('')}</div>`, opts: nearby(nums.length, 4, 20, 3), ans: nums.length, hint: H.cases,
        explain: `<div class="m-orders">${nums.map(x => `<span>${x}</span>`).join('')}</div><p class="m-eq-num">${n} × ${n - 1} = ${nums.length}</p>` };
    },
    // 넓이와 둘레: 쉬움 직사각형 넓이, 보통 여러 모양 넓이·직사각형 둘레, 도전 여러 모양 둘레
    area() {
      const W = LV === 3 ? 7 : 6, H2 = LV === 3 ? 5 : 4;
      if (LV === 0) { const w = 2 + R(3), h = 2 + R(2), c = rectCells(w, h, R(W - w + 1), R(H2 - h + 1));
        return { ask: '색칠한 모양의 넓이는 작은 네모 몇 개일까요?', show: `<div class="m-viz">${cellsSvg({ W, H: H2, cells: c })}</div>`, opts: nearby(w * h, 2, 16, 3), ans: w * h, hint: H.area,
          explain: `<div class="m-viz">${cellsSvg({ W, H: H2, cells: c, nums: true })}</div><p class="m-eq-num">${w} × ${h} = ${w * h}</p>` }; }
      if (LV === 1 && R(2)) { const w = 2 + R(3), h = 1 + R(3), c = rectCells(w, h, R(W - w + 1), R(H2 - h + 1)), p = perim(c);
        return { ask: '색칠한 네모의 둘레는 작은 선 몇 개 길이일까요?', show: `<div class="m-viz">${cellsSvg({ W, H: H2, cells: c })}</div>`, opts: nearby(p, 4, 20, 3), ans: p, hint: H.area,
          explain: `<div class="m-viz">${cellsSvg({ W, H: H2, cells: c, edge: true })}</div><p class="m-eq-num">${w} + ${h} + ${w} + ${h} = ${p}</p>` }; }
      const c = growCells(W, H2, LV === 3 ? 9 + R(4) : 5 + R(4));
      if (LV === 3 && R(2)) return { ask: '색칠한 모양의 넓이는 작은 네모 몇 개일까요?', show: `<div class="m-viz">${cellsSvg({ W, H: H2, cells: c })}</div>`, opts: nearby(c.length, 6, 16, 3), ans: c.length, hint: H.area,
        explain: `<div class="m-viz">${cellsSvg({ W, H: H2, cells: c, nums: true })}</div><p class="m-eq-num">넓이 ${c.length}</p>` };
      if (LV === 1) return { ask: '색칠한 모양의 넓이는 작은 네모 몇 개일까요?', show: `<div class="m-viz">${cellsSvg({ W, H: H2, cells: c })}</div>`, opts: nearby(c.length, 3, 14, 3), ans: c.length, hint: H.area,
        explain: `<div class="m-viz">${cellsSvg({ W, H: H2, cells: c, nums: true })}</div><p class="m-eq-num">넓이 ${c.length}</p>` };
      const p = perim(c);
      return { ask: '색칠한 모양의 둘레는 작은 선 몇 개 길이일까요?', show: `<div class="m-viz">${cellsSvg({ W, H: H2, cells: c })}</div>`, opts: nearby(p, 6, 32, 3), ans: p, hint: H.area,
        explain: `<div class="m-viz">${cellsSvg({ W, H: H2, cells: c, edge: true })}</div><p class="m-eq-num">빨간 바깥 선 ${p}개</p>` };
    },
    // 큰 수 (수 세기 주제, 2026-11-27): 쉬움 묶음 세기·수에 맞는 묶음 그림, 보통 10씩·1씩 뛰어 세기·자릿값, 도전 크기 비교·100판 빈칸
    big() {
      // 정답 하나와 다른 보기 둘 (모자라면 가까운 수로 채운다)
      const three = (ans, cands) => { const w = [...new Set(cands)].filter(v => v !== ans && v > 0 && v < 100).slice(0, 2); for (let d = 2; w.length < 2 && d < 50; d++) for (const v of [ans + d, ans - d]) if (w.length < 2 && v > 0 && v < 100 && v !== ans && !w.includes(v)) w.push(v); return shuffle([ans, ...w]); };
      const S = MATH_SAY.big, kind = [['bundle', 'pick'], ['skip', 'place'], ['compare', 'board'], ['order3', 'tenmore']][LV][R(2)];
      const n = LV === 0 ? 11 + R(39) : 11 + R(89), t = Math.floor(n / 10), o = n % 10;
      const lab = `<p class="m-eq-num">십 묶음 ${t}개 = ${t * 10}, 낱개 ${o}개 = ${o} → ${n}</p>`;
      if (kind === 'bundle') return { ask: S.bundle, say: S.bundle, show: `<div class="m-viz">${b10(n)}</div>`, opts: three(n, [o && o !== t ? o * 10 + t : n + 1, n + 10 > 99 ? n - 10 : n + 10, n - 1]), ans: n, hint: H.big,
        explain: `<div class="m-viz">${b10(n, true)}</div>${lab}` };
      if (kind === 'pick') {
        const wrong = [...new Set([o && o * 10 + t !== n ? o * 10 + t : n + 1, n + 10 <= 99 ? n + 10 : n - 10, n + 1 <= 99 && o < 9 ? n + 1 : n - 1])].filter(v => v !== n).slice(0, 2), opts = shuffle([n, ...wrong]);
        return { ask: S.pick, say: S.pick, show: `<p class="m-bignum">${n}</p>`, opts, labels: Object.fromEntries(opts.map(v => [v, b10(v)])), ans: n, hint: H.big, explain: `<div class="m-viz">${b10(n, true)}</div>${lab}` };
      }
      if (kind === 'skip') {
        const by = R(2) ? 10 : 1, s0 = by === 10 ? 1 + R(48) : 10 + R(80), a = Array.from({ length: 5 }, (_, i) => s0 + by * i), hide = 1 + R(4), ans = a[hide];
        return { ask: by === 10 ? S.skip10 : S.skip1, say: by === 10 ? S.skip10 : S.skip1, show: nseq(a.map((v, i) => i === hide ? '?' : v)), opts: three(ans, [ans + (by === 10 ? 1 : 10), ans - (by === 10 ? 1 : 10)]), ans, hint: H.big,
          explain: `${nseq(a, a.map(() => `+${by}`), hide)}<p class="fine">${by === 10 ? '10씩 뛰면 십의 자리 숫자가 하나씩 커져요.' : '1씩 뛰면 일의 자리 숫자가 하나씩 커지고, 9 다음에는 십의 자리가 커져요.'}</p>` };
      }
      if (kind === 'place') {
        const tens = R(2), m = t === o ? (o === 9 ? n - 1 : n + 1) : n, mt = Math.floor(m / 10), mo = m % 10, ans = tens ? mt : mo;
        return { ask: tens ? S.placeTens : S.placeOnes, say: tens ? S.placeTens : S.placeOnes, show: `<p class="m-bignum">${m}</p>`, opts: three(ans, [tens ? mo : mt, tens ? mt * 10 : mo * 10]), ans, hint: H.big,
          explain: `<div class="m-viz">${b10(m, true)}</div><p class="m-eq-num">${m} = ${mt * 10} + ${mo} · 십의 자리 ${mt}, 일의 자리 ${mo}</p>` };
      }
      if (kind === 'order3') {
        const a = o && o !== t ? n : n + 1 > 99 ? 98 : n + 1, at = Math.floor(a / 10), ao = a % 10, cand = [...new Set([a, ao * 10 + at, a + 1 <= 99 ? a + 1 : a - 2, a - 10 > 10 ? a - 10 : a + 9])].filter(v => v > 10 && v < 100).slice(0, 3), ans = Math.max(...cand), opts = shuffle(cand);
        return { ask: S.order3, say: S.order3, show: `<p class="m-bignum m-two">${opts.map(v => `<span>${v}</span>`).join('')}</p>`, opts, ans, hint: H.bigCompare,
          explain: `<div class="m-viz m-b10cmp">${opts.map(v => `<figure>${b10(v)}<figcaption>${v}</figcaption></figure>`).join('')}</div><p class="m-eq-num">십의 자리부터 견줘요 · 가장 큰 수: ${ans}</p>` };
      }
      if (kind === 'tenmore') {
        const d = [10, -10, 1, -1][R(4)], m = Math.max(11, Math.min(89, n)), ans = m + d, ask = `${m}보다 ${Math.abs(d)} ${d > 0 ? '큰' : '작은'} 수는 무엇일까요?`;
        return { ask, say: ask, show: `<div class="m-viz">${b10(m)}</div>`, opts: three(ans, [m - d, Math.abs(d) === 10 ? ans + (d > 0 ? 1 : -1) : ans + (d > 0 ? 10 : -10)]), ans, hint: H.bigBoard,
          explain: `<div class="m-viz">${b10(ans, true)}</div><p class="m-eq-num">${m} ${d > 0 ? '+' : '−'} ${Math.abs(d)} = ${ans} · ${Math.abs(d) === 10 ? '십 묶음' : '낱개'}이 하나 ${d > 0 ? '늘어요' : '줄어요'}</p>` };
      }
      if (kind === 'compare') {
        let a = n, b = R(2) && o && o !== t ? o * 10 + t : Math.max(11, Math.min(99, n + [-11, -9, 9, 11, 1, -1][R(6)]));
        if (b === a) b = a === 99 ? 98 : a + 1;
        const ans = Math.max(a, b), opts = shuffle([a, b]);
        return { ask: S.compare, say: S.compare, show: `<p class="m-bignum m-two"><span>${opts[0]}</span><span>${opts[1]}</span></p>`, opts, ans, hint: H.bigCompare,
          explain: `<div class="m-viz m-b10cmp"><figure>${b10(opts[0])}<figcaption>${opts[0]}</figcaption></figure><figure>${b10(opts[1])}<figcaption>${opts[1]}</figcaption></figure></div><p class="m-eq-num">십의 자리부터 견줘요 · 더 큰 수: ${ans}</p>` };
      }
      const c = 12 + R(8) + 10 * R(8), d = [-10, -1, 1, 10][R(4)], ans = c + d;
      return { ask: S.board, say: S.board, show: `<div class="m-viz">${hund({ win: [c], blank: [ans] })}</div>`, opts: three(ans, [c - d, d === 10 || d === -10 ? ans + 1 : ans + 10]), ans, hint: H.bigBoard,
        explain: `<div class="m-viz">${hund({ win: [c], hi: [ans] })}</div><p class="m-eq-num">${d === 10 ? '아래로 한 칸 → 10 커져요' : d === -10 ? '위로 한 칸 → 10 작아져요' : d === 1 ? '오른쪽으로 한 칸 → 1 커져요' : '왼쪽으로 한 칸 → 1 작아져요'} · ${c} → ${ans}</p>` };
    },
    // ── 묶음 1 (2026-11-27) ──
    // 마술 상자(함수): 쉬움 +1~3, 보통 +4~9·−2~5, 어려움 ×2·×3·×5, 도전 상자 두 개 잇기·넣은 수 거꾸로 찾기
    fbox() {
      const RULES = [
        [1, 2, 3].map(k => [x => x + k, `+${k}`]),
        [...[4, 5, 6, 7, 8, 9].map(k => [x => x + k, `+${k}`]), ...[2, 3, 4, 5].map(k => [x => x - k, `−${k}`])],
        [2, 3, 5].map(k => [x => x * k, `×${k}`]),
        [[x => (x + 1) * 2, '+1 다음 ×2'], [x => x * 2 + 1, '×2 다음 +1'], [x => x * 3 - 1, '×3 다음 −1'], [x => (x + 2) * 2, '+2 다음 ×2']],
      ][LV];
      const [f, lab] = RULES[R(RULES.length)], lo = /−(\d)/.test(lab) ? +lab.match(/−(\d)/)[1] + 1 : 1;
      const xs = shuffle(Array.from({ length: LV >= 2 ? 9 : 12 }, (_, i) => lo + i)).slice(0, 4), pairs = xs.slice(0, 3).map(x => [x, f(x)]), x = xs[3], y = f(x);
      const rev = LV === 3 && R(2);
      return { ask: rev ? '무엇을 넣었을까요?' : '이 수를 넣으면 무엇이 나올까요?', show: `<div class="m-viz">${fbox(pairs, [x, y], rev)}</div>`, opts: nearby(rev ? x : y, 0, 200, 3), ans: rev ? x : y, hint: H.fbox,
        explain: `<div class="m-viz">${fbox([...pairs, [x, y]], null, false, lab)}</div><p class="m-eq-num">규칙: ${lab} · ${x} → ${y}</p>` };
    },
    // 저울 맞추기(방정식): 쉬움 상자+추, 보통 같은 상자 여럿, 어려움 양쪽에 상자, 도전 두 저울(세모 추와 상자)
    balance() {
      const ex = steps => `<div class="m-steps">${steps.map(s => `<p class="m-eq-num">${s}</p>`).join('')}</div>`;
      if (LV === 0) { const b = 2 + R(8), k = 1 + R(6);
        return { ask: '상자 하나는 얼마일까요?', show: `<div class="m-viz">${scale(['B', k], [b + k])}</div>`, opts: nearby(b, 1, 15, 3), ans: b, hint: H.balance,
          explain: `${scale(['B'], [b])}${ex([`📦 + ${k} = ${b + k}`, `양쪽에서 똑같이 ${k}만큼 빼면 → 📦 = ${b + k} − ${k} = ${b}`])}` }; }
      if (LV === 1) { const n = 2 + R(2), b = 2 + R(5), k = R(6), L = [...Array(n).fill('B'), ...(k ? [k] : [])];
        return { ask: '상자 하나는 얼마일까요?', show: `<div class="m-viz">${scale(L, [n * b + k])}</div>`, opts: nearby(b, 1, 12, 3), ans: b, hint: H.balance,
          explain: ex([`${Array(n).fill('📦').join(' + ')}${k ? ` + ${k}` : ''} = ${n * b + k}`, k ? `양쪽에서 똑같이 ${k}만큼 빼면 → 📦 ${n}개 = ${n * b}` : `📦 ${n}개 = ${n * b}`, `📦 하나 = ${n * b} ÷ ${n} = ${b}`]) }; }
      if (LV === 2) { const m = 3, j = 1 + R(2), b = 2 + R(5), k1 = R(5), k2 = (m - j) * b + k1;
        return { ask: '상자 하나는 얼마일까요?', show: `<div class="m-viz">${scale([...Array(m).fill('B'), ...(k1 ? [k1] : [])], [...Array(j).fill('B'), k2])}</div>`, opts: nearby(b, 1, 12, 3), ans: b, hint: H.balance,
          explain: ex([`양쪽에서 똑같은 것(📦 ${j}개${k1 ? `, 추 ${k1}만큼` : ''})을 내리면`, `📦 ${m - j}개 = ${k2 - k1}`, `📦 하나 = ${k2 - k1} ÷ ${m - j} = ${b}`]) }; }
      const t = 2 + R(6), askBox = R(2);
      return { ask: askBox ? '상자 하나는 얼마일까요?' : '세모 추 하나는 얼마일까요?', show: `<div class="m-viz m-scales">${scale(['T', 'T'], ['B'])}${scale(['B', 'T'], [3 * t])}</div>`, opts: nearby(askBox ? 2 * t : t, 1, 24, 3), ans: askBox ? 2 * t : t, hint: H.balance,
        explain: ex([`첫 저울: 🔺 두 개 = 📦`, `둘째 저울의 📦를 🔺 두 개로 바꾸면 → 🔺 세 개 = ${3 * t}`, `🔺 = ${t}, 📦 = ${2 * t}`]) };
    },
    // 똑같은 모양(합동과 닮음): 쉬움 그대로, 보통 돌린 모양, 어려움 뒤집은 모양(한 칸 다른 함정), 도전 크기만 다른 닮은 모양
    same() {
      const n = LV >= 2 ? 5 : 4, base = pGrow(n), vars = pVars(base, true), cols = shuffle(['#4db6ac', '#ff8a65', '#9575cd', '#64b5f6', '#f06292']);
      let right = base;
      if (LV === 1) for (let i = 0; i < 4 && pKey(right) === pKey(base); i++) right = pRot(right), right = R(2) ? pRot(right) : right;
      if (LV === 2) { right = pFlip(base); for (let i = R(4); i--;) right = pRot(right); }
      if (LV === 3) right = pScale(base, 2);
      const wrong = [];
      for (let t = 0; wrong.length < 2 && t < 300; t++) {
        let w = LV === 2 && t < 150 ? (() => { const c = base.map(p => [...p]), i = R(c.length), [x, y] = c[R(c.length)], d = [[1, 0], [-1, 0], [0, 1], [0, -1]][R(4)]; c.splice(i, 1); if (c.some(p => p[0] === x + d[0] && p[1] === y + d[1])) return null; c.push([x + d[0], y + d[1]]); return pNorm(c); })() : pGrow(n);
        if (!w || w.length !== n) continue;
        const cc = (() => { const seen = new Set([pKey(w).split(';')[0]]), q = [w[0]]; while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = `${x + dx},${y + dy}`; if (w.some(p => p.join() === k) && !seen.has(k)) { seen.add(k); q.push([x + dx, y + dy]); } } } return seen.size === w.length; })();
        if (!cc || vars.has(pKey(w)) || wrong.some(v => pVars(v, true).has(pKey(w)))) continue;
        if (LV === 3) w = R(2) ? pScale(w, 2) : pNorm(base.flatMap(([x, y]) => [[x * 2, y], [x * 2 + 1, y]]));
        if (LV === 3 && wrong.some(v => pKey(v) === pKey(w))) continue;
        wrong.push(w);
      }
      const opts = shuffle(['a', 'b', 'c']), shapes = { a: right, b: wrong[0], c: wrong[1] };
      const ask = ['똑같은 모양을 골라요', '돌리면 똑같아지는 모양을 골라요', '돌리거나 뒤집으면 똑같아지는 모양을 골라요', '크기만 다르고 모양이 똑같은 것을 골라요'][LV];
      return { ask, say: ask, show: `<div class="m-viz">${pSvg(base, '#ffd54f', LV === 3 ? 14 : 22)}</div>`, opts, labels: Object.fromEntries(opts.map((k, i) => [k, pSvg(shapes[k], cols[i], LV === 3 ? 12 : 18)])), ans: 'a', hint: H.same,
        explain: `<div class="m-viz m-b10cmp"><figure>${pSvg(base, '#ffd54f', 18)}<figcaption>처음 모양</figcaption></figure><figure>${pSvg(right, '#4db6ac', LV === 3 ? 12 : 18)}<figcaption>${['그대로', '돌렸어요', '뒤집었어요', '두 배로 키웠어요'][LV]}</figcaption></figure></div>` };
    },
    // 누가 무엇을 가졌을까(논리)·거꾸로 풀기: 쉬움 둘, 보통 셋(가졌다·안 가졌다), 어려움 셋(안 가졌다만, 표 그려 풀기), 도전 거꾸로 풀기
    logic() {
      if (LV === 3) {
        const st = 1 + R(9), a = 2 + R(5), b = 2 + R(2), mid = st + a, end = mid * b, c = R(3) ? 0 : 1 + R(3), fin = end - c;
        return { ask: '어떤 수에 차례로 셈을 했어요. 처음 수는 얼마일까요?', show: `<p class="m-eqbig">? → +${a} → ×${b}${c ? ` → −${c}` : ''} → ${fin}</p>`, opts: nearby(st, 1, 20, 3), ans: st, hint: H.back,
          explain: `<div class="m-steps">${c ? `<p class="m-eq-num">${fin} + ${c} = ${end}</p>` : ''}<p class="m-eq-num">${end} ÷ ${b} = ${mid}</p><p class="m-eq-num">${mid} − ${a} = ${st}</p><p class="fine">끝에서부터 거꾸로, 더한 것은 빼고 곱한 것은 나눠요.</p></div>` };
      }
      const n = LV === 0 ? 2 : 3, P = perms(n), sol = P[R(P.length)], cand = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { if (sol[i] !== j) cand.push({ i, j, neg: true }); else if (LV === 1) cand.push({ i, j, neg: false }); }
      let clues = [];
      for (let t = 0; t < 200; t++) {
        clues = shuffle(cand).slice(0, LV === 0 ? 1 : 2 + (LV === 2 ? R(2) : 0));
        const fit = P.filter(p => clues.every(c => c.neg ? p[c.i] !== c.j : p[c.i] === c.j));
        if (fit.length === 1) break;
      }
      // 200번 안에 답이 하나로 정해지는 단서를 못 찾으면, 마지막 사람을 뺀 모두의 '안 가졌다' 단서를 준다(늘 답이 하나)
      if (P.filter(p => clues.every(c => c.neg ? p[c.i] !== c.j : p[c.i] === c.j)).length !== 1) clues = cand.filter(c => c.neg && c.i < n - 1);
      const item = R(n), who = sol.indexOf(item), say = c => `${jo(FR[c.i][1], '은', '는')} ${jo(IT[c.j][1], '을', '를')} ${c.neg ? '갖지 않았어요' : '가졌어요'}.`;
      return { ask: `${jo(IT[item][1], '은', '는')} 누가 가졌을까요?`, show: `<ul class="m-clues">${clues.map(c => `<li>${mPic(FR[c.i][0])} ${say(c)}</li>`).join('')}</ul><p class="fine">친구마다 ${IT.slice(0, n).map(f => mPic(f[0])).join(' ')} 가운데 하나씩 가졌어요.</p>`,
        opts: FR.slice(0, n).map(f => f[0]), labels: Object.fromEntries(FR.slice(0, n).map(f => [f[0], mPic(f[0])])), ans: FR[who][0], hint: H.logic,
        explain: `${lTable(n, sol, true, item)}<p class="fine">아닌 칸에 ✗를 하면 남은 칸(○)이 답이에요.</p>` };
    },
    // 다른 묶음으로 세기(진법): 쉬움 5씩 묶은 막대, 보통 2·3·4씩 묶기, 어려움 로마 숫자(I·V·X 더하기), 도전 IV·IX가 있는 로마 숫자·묶음 바꿔 세기
    base() {
      if (LV === 0) { const n = 6 + R(18);
        return { ask: MATH_SAY.big.bundle, say: MATH_SAY.big.bundle, show: `<div class="m-viz">${tally(n)}</div>`, opts: nearby(n, 1, 30, 3), ans: n, hint: H.base, explain: `<div class="m-viz">${tally(n)}</div><p class="m-eq-num">5씩 묶음 ${Math.floor(n / 5)}개 = ${Math.floor(n / 5) * 5}, 낱개 ${n % 5}개 → ${n}</p>` }; }
      if (LV === 1) { const g = 2 + R(3), k = 2 + R(4), r = R(g), n = g * k + r;
        if (R(2)) return { ask: `${g}개씩 묶었어요. 모두 몇 개일까요?`, show: `<div class="m-viz">${dotGroups(n, g)}</div>`, opts: nearby(n, 2, 30, 3), ans: n, hint: H.base, explain: `<p class="m-eq-num">${g} × ${k} + ${r} = ${n}</p>` };
        const lab = (a, b) => `묶음 ${a}개, 낱개 ${b}개`, opts = shuffle([...new Set([lab(k, r), lab(k + 1, r ? r - 1 : 1), lab(k - 1, r + g < 10 ? r + g : r + 1), lab(r, k)])].slice(0, 3));
        if (!opts.includes(lab(k, r))) opts[0] = lab(k, r);
        return { ask: `${n}개를 ${g}개씩 묶으면 어떻게 될까요?`, show: `<div class="m-viz">${mDots(n)}</div>`, opts: shuffle(opts), ans: lab(k, r), hint: H.base, explain: `<div class="m-viz">${dotGroups(n, g)}</div><p class="m-eq-num">${n} = ${g} × ${k} + ${r}</p>` }; }
      if (LV === 2 || R(2)) { const n = LV === 2 ? 1 + R(38) : 4 + R(36), sub = LV === 3, r = roman(n, sub);
        if (LV === 3 && !/IV|IX/.test(r)) return gen.base();
        return { ask: '로마 숫자로 쓴 수예요. 얼마일까요?', show: `<p class="m-bignum m-roman">${r}</p><p class="fine">I = 1 · V = 5 · X = 10${sub ? ' · 작은 수가 앞에 오면 빼요 (IV = 4)' : ''}</p>`, opts: nearby(n, 1, 40, 3), ans: n, hint: H.roman,
          explain: `<p class="m-eq-num">${[...r].map(c => ({ I: 1, V: 5, X: 10 })[c]).join(' · ')} → ${n}</p>${sub ? '<p class="fine">IV는 5 − 1 = 4, IX는 10 − 1 = 9예요.</p>' : ''}` }; }
      const a = 5, k = 2 + R(3), r = R(5), n = a * k + r, g = [3, 4, 6][R(3)], ans = `묶음 ${Math.floor(n / g)}개, 낱개 ${n % g}개`;
      const opts = shuffle([...new Set([ans, `묶음 ${k}개, 낱개 ${r}개`, `묶음 ${Math.floor(n / g) + 1}개, 낱개 ${Math.max(0, n % g - 1)}개`, `묶음 ${Math.max(1, Math.floor(n / g) - 1)}개, 낱개 ${n % g + 1}개`])].slice(0, 3));
      if (!opts.includes(ans)) opts[0] = ans;
      return { ask: `5개씩 묶음 ${k}개와 낱개 ${r}개를 ${g}개씩 다시 묶으면 어떻게 될까요?`, show: `<div class="m-viz">${dotGroups(n, 5)}</div>`, opts: shuffle(opts), ans, hint: H.base,
        explain: `<p class="m-eq-num">5 × ${k} + ${r} = ${n}</p><div class="m-viz">${dotGroups(n, g)}</div><p class="m-eq-num">${n} = ${g} × ${Math.floor(n / g)} + ${n % g}</p>` };
    },
    // ── 묶음 2 (2026-11-27) ──
    // 한붓그리기: 쉬움 어디서 시작할까, 보통 선이 홀수 개 모인 점 세기, 어려움 한 번에 그릴 수 있는 그림 고르기, 도전 한 번에 못 그리는 그림 고르기(큰 그림도)
    euler() {
      const pickFig = k => R(2) ? figFlip(FIGS[k]) : FIGS[k];
      if (LV === 0) {
        const k = shuffle(['sqd', 'house', 'housex', 'twosq', 'zig', 'twosqd'])[0], f = pickFig(k), odd = oddOf(f), even = f.n.map((_, i) => i).filter(i => !odd.includes(i));
        const start = odd[R(odd.length)], pts = shuffle([start, ...shuffle(even).slice(0, 2)]), names = ['가', '나', '다'], labels = Object.fromEntries(pts.map((p, i) => [p, names[i]]));
        return { ask: '어느 점에서 시작하면 한 번에 그릴 수 있을까요?', show: `<div class="m-viz">${figSvg(f, { labels })}</div>`, opts: names, ans: labels[start], hint: H.euler,
          explain: `<div class="m-viz">${figSvg(f, { labels, odd: true })}</div><p class="m-eq-num">선이 홀수 개 모인 빨간 점에서 시작해요 → ${labels[start]}</p>` };
      }
      if (LV === 1) {
        const k = shuffle([...DRAWABLE, ...NOTDRAW])[0], f = pickFig(k), n = oddOf(f).length;
        return { ask: '선이 홀수 개 모인 점은 몇 개일까요?', show: `<div class="m-viz">${figSvg(f)}</div>`, opts: [0, 2, 4], ans: n, hint: H.eulerOdd,
          explain: `<div class="m-viz">${figSvg(f, { odd: true })}</div><p class="m-eq-num">점마다 모인 선의 수를 적었어요 · 홀수인 점 ${n}개</p>` };
      }
      const can = LV === 2, good = can ? shuffle(DRAWABLE)[0] : shuffle(NOTDRAW)[0], others = shuffle(can ? NOTDRAW : DRAWABLE.filter(k => FIGS[k].e.length >= 5)).slice(0, 2);
      const keys = shuffle(['a', 'b', 'c']), figs = { [keys[0]]: pickFig(good), [keys[1]]: pickFig(others[0]), [keys[2]]: pickFig(others[1]) };
      const ask = can ? '한 번에 그릴 수 있는 그림을 골라요' : '한 번에 그릴 수 없는 그림을 골라요';
      return { ask, say: ask, show: '', opts: ['a', 'b', 'c'], labels: Object.fromEntries(['a', 'b', 'c'].map(k => [k, figSvg(figs[k], { size: 92 })])), ans: keys[0], hint: H.eulerOdd,
        explain: `<div class="m-viz m-b10cmp">${['a', 'b', 'c'].map(k => `<figure>${figSvg(figs[k], { odd: true, size: 96 })}<figcaption>홀수 점 ${oddOf(figs[k]).length}개</figcaption></figure>`).join('')}</div><p class="fine">홀수 점이 0개나 2개면 한 번에 그릴 수 있어요.</p>` };
    },
    // 성냥개비: 쉬움 막대 수 세기, 보통 하나 빼거나 더해 만드는 숫자, 어려움 숫자 안에서 하나 옮겨 식 고치기, 도전 다른 숫자로 하나 옮겨 식 고치기
    match() {
      if (LV === 0) {
        const s = R(2) ? String(R(10)) : String(10 + R(90)), n = stickCount(s);
        return { ask: '성냥개비는 모두 몇 개일까요?', show: `<div class="m-viz">${eqSvg(s)}</div>`, opts: nearby(n, 2, 14, 3), ans: n, hint: H.match,
          explain: `<p class="m-eq-num">${[...s].map(c => `${c}: ${DIG[c].length}개`).join(' · ')}${s.length > 1 ? ` → ${n}개` : ''}</p>` };
      }
      if (LV === 1) {
        let d, kind, outs;
        do { d = String(R(10)); kind = R(2) ? 'less' : 'more'; outs = nb(d, kind); } while (!outs.length);
        const ans = outs[R(outs.length)], wrong = shuffle(digs.filter(y => y !== d && !outs.includes(y))).slice(0, 2), opts = shuffle([ans, ...wrong]);
        return { ask: `막대 하나를 ${kind === 'less' ? '빼면' : '더하면'} 어떤 숫자가 될까요?`, show: `<div class="m-viz">${eqSvg(d)}</div>`, opts, labels: Object.fromEntries(opts.map(y => [y, eqSvg(y, .6)])), ans, hint: H.match,
          explain: `<div class="m-viz m-b10cmp"><figure>${eqSvg(d, .8)}<figcaption>${d}</figcaption></figure><figure>${eqSvg(ans, .8)}<figcaption>${ans}</figcaption></figure></div><p class="m-eq-num">${d}에서 막대 하나를 ${kind === 'less' ? '빼면' : '더하면'} ${ans}</p>` };
      }
      for (let t = 0; t < 500; t++) {
        const a = R(10), b = R(10), plus = R(2), c = plus ? a + b : a - b;
        if (c < 0 || c > 9) continue;
        const ok = `${a}${plus ? '+' : '-'}${b}=${c}`, idx = [0, 2, 4];
        let wrongEq;
        if (LV === 2) { const i = idx[R(3)], ys = nb(ok[i], 'same'); if (!ys.length) continue; wrongEq = ok.slice(0, i) + ys[R(ys.length)] + ok.slice(i + 1); }
        else { const [i, j] = shuffle(idx).slice(0, 2), ys = nb(ok[i], 'more'), zs = nb(ok[j], 'less'); if (!ys.length || !zs.length) continue; const w = [...ok]; w[i] = ys[R(ys.length)]; w[j] = zs[R(zs.length)]; wrongEq = w.join(''); }
        if (eqOk(wrongEq)) continue;
        const fixes = oneMoves(wrongEq).filter(eqOk);
        if (fixes.length !== 1 || fixes[0] !== ok) continue; // 막대 하나로 고치는 방법이 꼭 하나뿐인 식만
        const wrongs = shuffle(oneMoves(wrongEq).filter(s => !eqOk(s))).slice(0, 2);
        if (wrongs.length < 2) continue;
        const opts = shuffle([ok, ...wrongs]);
        return { ask: '막대 하나만 옮겨서 맞는 식으로 고치면 어떻게 될까요?', show: `<div class="m-viz">${eqSvg(wrongEq)}</div><p class="fine">지금 식: ${eqShow(wrongEq)} (틀린 식)</p>`, opts, labels: Object.fromEntries(opts.map(s => [s, eqShow(s)])), ans: ok, hint: H.matchEq,
          explain: `<div class="m-viz">${eqSvg(ok, .8)}</div><p class="m-eq-num">${eqShow(wrongEq)} → ${eqShow(ok)}</p>` };
      }
      return gen.match();
    },
    // ── 묶음 3 (2026-11-27) ──
    // 펜토미노: 판의 빈칸에 딱 맞는 조각 고르기. 쉬움 3칸·보통 4칸(돌린 조각)·어려움 5칸(뒤집은 조각, 한 칸 다른 함정)·도전 6칸
    pento() {
      const n = [3, 4, 5, 6][LV], hole = pGrow(n), vars = pVars(hole, LV >= 2);
      let right = hole; for (let i = LV ? 1 + R(3) : 0; i--;) right = pRot(right); if (LV >= 2 && R(2)) right = pFlip(right);
      if (!vars.has(pKey(right))) right = hole;
      const wrong = [];
      for (let t = 0; wrong.length < 2 && t < 400; t++) { const w = pGrow(n); if (pVars(hole, true).has(pKey(w)) || wrong.some(v => pVars(v, true).has(pKey(w)))) continue; let o = w; for (let i = R(4); i--;) o = pRot(o); wrong.push(o); }
      // 세 칸 조각처럼 모양이 몇 가지 없으면, 칸 수가 다른 조각으로 채운다(칸 수 세기 연습)
      while (wrong.length < 2) wrong.push(pGrow(n + (wrong.length ? -1 : 1)));
      const keys = shuffle(['a', 'b', 'c']), shapes = { [keys[0]]: right, [keys[1]]: wrong[0], [keys[2]]: wrong[1] }, cols = ['#4db6ac', '#ff8a65', '#9575cd'];
      return { ask: '빈칸에 딱 맞는 조각을 골라요', say: '빈칸에 딱 맞는 조각을 골라요', show: `<div class="m-viz">${holeBoard(hole, n > 4 ? 6 : 5, 4)}</div>${LV >= 2 ? '<p class="fine">돌리거나 뒤집어서 넣어도 돼요</p>' : LV ? '<p class="fine">돌려서 넣어도 돼요</p>' : ''}`, opts: ['a', 'b', 'c'],
        labels: Object.fromEntries(['a', 'b', 'c'].map((k, i) => [k, pSvg(shapes[k], cols[i], 16)])), ans: keys[0], hint: H.pento,
        explain: `<div class="m-viz m-b10cmp"><figure>${holeBoard(hole, n > 4 ? 6 : 5, 4, 18)}<figcaption>빈칸</figcaption></figure><figure>${pSvg(hole, '#4db6ac', 18)}<figcaption>돌리거나 뒤집어 맞춘 조각</figcaption></figure></div>` };
    },
    // 세모와 동그라미 더 알기: 쉬움 변으로 세모 이름, 보통 각으로 세모 이름, 어려움 반지름·지름, 도전 세 각의 합·원과 직선이 만나는 점
    trc() {
      if (LV === 0) { const kind = ['정삼각형', '이등변', '부등변'][R(3)], sides = { 정삼각형: [5, 5, 5], 이등변: [6, 4, 6], 부등변: [7, 4, 5] }[kind], k = 3 + R(4), sd = sides.map(v => v === 5 && kind === '정삼각형' ? k : v);
        const NAME = { 정삼각형: '정삼각형', 이등변: '이등변삼각형', 부등변: '세 변이 다른 삼각형' };
        return { ask: '변의 길이를 보고 이름을 골라요', show: `<div class="m-viz">${triSvg(TRIS[kind], { sides: sd })}</div>`, opts: Object.values(NAME), ans: NAME[kind], hint: H.triSide,
          explain: `<p class="m-eq-num">${kind === '정삼각형' ? '세 변이 모두 같아요' : kind === '이등변' ? '두 변이 같아요' : '세 변이 모두 달라요'} → ${NAME[kind]}</p>` }; }
      if (LV === 1) { const kind = ['직각', '둔각', '예각'][R(3)], NAME = { 직각: '직각삼각형', 둔각: '둔각삼각형', 예각: '예각삼각형' };
        return { ask: '각을 보고 이름을 골라요', show: `<div class="m-viz">${triSvg(TRIS[kind], { right: kind === '직각' ? 1 : -1 })}</div>`, opts: Object.values(NAME), ans: NAME[kind], hint: H.triAngle,
          explain: `<p class="m-eq-num">${kind === '직각' ? '한 각이 직각이에요' : kind === '둔각' ? '한 각이 직각보다 커요' : '세 각이 모두 직각보다 작아요'} → ${NAME[kind]}</p>` }; }
      if (LV === 2) { const r = 2 + R(9), toD = R(2);
        return { ask: toD ? '반지름이 이만큼이면 지름은 얼마일까요?' : '지름이 이만큼이면 반지름은 얼마일까요?', show: `<div class="m-viz">${circSvg(toD ? { r } : { d: 2 * r })}</div>`, opts: shuffle([...new Set([toD ? 2 * r : r, toD ? r : 2 * r, toD ? 2 * r + 2 : r + 1])]), ans: toD ? 2 * r : r, hint: H.circle,
          explain: `<div class="m-viz">${circSvg({ r, d: 2 * r })}</div><p class="m-eq-num">지름 = 반지름 × 2 → ${r} × 2 = ${2 * r}</p>` }; }
      if (R(2)) { const a = 30 + 5 * R(12), b = 30 + 5 * R(Math.max(1, Math.min(12, (150 - a) / 5))), c = 180 - a - b;
        if (c <= 0) return gen.trc();
        return { ask: '세모의 두 각을 알아요. 나머지 한 각은 몇 도일까요?', show: `<div class="m-viz">${triSvg(TRIS.부등변, { angles: [`${a}°`, '?', `${b}°`] })}</div>`, opts: shuffle([...new Set([c, c + 10, Math.abs(c - 10) || c + 20])]), ans: c, hint: H.triSum,
          explain: `<p class="m-eq-num">세 각을 더하면 늘 180도 → 180 − ${a} − ${b} = ${c}</p>` }; }
      const k = R(3);
      return { ask: '동그라미와 주황색 직선이 만나는 점은 몇 개일까요?', show: `<div class="m-viz">${circSvg({ line: k })}</div>`, opts: [0, 1, 2], ans: k, hint: H.circLine,
        explain: `<p class="m-eq-num">${['떨어져 있으면 0개', '살짝 닿으면 1개', '가로지르면 2개'][k]}</p>` };
    },
    // 고르게 나누기(통계·평균 맛보기): 쉬움 똑같이 나누기, 보통 탑 높이 고르게, 어려움 네 수의 평균, 도전 모르는 한 사람 찾기
    avg() {
      if (LV === 0) { const k = 2 + R(3), each = 2 + R(4), n = k * each;
        return { ask: `사탕 ${n}개를 ${k}명이 똑같이 나누면 한 명에 몇 개일까요?`, show: `<div class="m-viz">${mDots(n)}</div>`, opts: nearby(each, 1, 12, 3), ans: each, hint: H.avg, explain: `<div class="m-viz">${plates(n, k)}</div><p class="m-eq-num">${n} ÷ ${k} = ${each}</p>` }; }
      if (LV === 1) { const m = 3 + R(3), d = 1 + R(2), h = shuffle([m - d, m, m + d]);
        return { ask: '블록을 옮겨 탑 높이를 고르게 맞추면 몇 층이 될까요?', show: `<div class="m-viz">${towers(h)}</div>`, opts: nearby(m, 1, 9, 3), ans: m, hint: H.avg,
          explain: `<p class="m-eq-num">${h.join(' + ')} = ${3 * m}, ${3 * m} ÷ 3 = ${m}</p><div class="m-viz">${towers([m, m, m])}</div>` }; }
      if (LV === 2) { const m = 4 + R(5), d = [R(5) - 2, R(5) - 2, R(5) - 2], vals = [m + d[0], m + d[1], m + d[2], m - d[0] - d[1] - d[2]];
        if (vals.some(v => v < 1)) return gen.avg();
        return { ask: '네 친구가 모은 딱지 수예요. 고르게 나누면 한 명에 몇 장일까요?', show: `<div class="m-viz">${towers(vals)}</div>`, opts: nearby(m, 1, 14, 3), ans: m, hint: H.avg,
          explain: `<p class="m-eq-num">${vals.join(' + ')} = ${4 * m}, ${4 * m} ÷ 4 = ${m}</p>` }; }
      const m = 4 + R(6), a = m - 1 - R(2), b = m + R(3), c = 3 * m - a - b;
      if (c < 1) return gen.avg();
      return { ask: `세 친구의 딱지를 고르게 나누면 한 명에 ${m}장이에요. 두 친구가 ${a}장, ${b}장이면 나머지 친구는 몇 장일까요?`, show: `<div class="m-viz">${towers([a, b, null])}</div>`, opts: nearby(c, 1, 20, 3), ans: c, hint: H.avgBack,
        explain: `<p class="m-eq-num">모두 ${m} × 3 = ${3 * m}장 → ${3 * m} − ${a} − ${b} = ${c}</p>` };
    },
    // 수 쪼개기(소인수분해·인수분해): 쉬움 □ × ? = n, 보통 직사각형으로 늘어놓는 방법, 어려움 곱셈 나무의 남은 수, 도전 더 못 쪼개는 수 고르기·큰 수 쪼개기
    split() {
      if (LV === 0) { const a = 2 + R(4), b = 2 + R(5), n = a * b;
        return { ask: `${n} = ${a} × ? 에서 ?는 얼마일까요?`, show: `<div class="m-viz m-dgrid" style="--c:${b}">${mDots(n)}</div>`, opts: nearby(b, 1, 10, 3), ans: b, hint: H.split, explain: `<p class="m-eq-num">${a}줄에 ${b}개씩 → ${a} × ${b} = ${n}</p>` }; }
      if (LV === 1) { const n = [6, 8, 10, 12, 16, 18, 20, 24][R(8)], pairs = [...Array(n).keys()].filter(d => d > 0 && d * d <= n && n % d === 0).map(d => [d, n / d]);
        return { ask: `블록 ${n}개를 빈틈없이 직사각형으로 늘어놓는 방법은 몇 가지일까요? (돌린 것은 같아요)`, show: `<div class="m-viz">${mDots(n)}</div>`, opts: nearby(pairs.length, 1, 6, 3), ans: pairs.length, hint: H.split,
          explain: `<div class="m-orders">${pairs.map(([a, b]) => `<span>${a} × ${b}</span>`).join('')}</div>` }; }
      if (LV === 2) { const n = [12, 18, 20, 24, 28, 30, 36, 40][R(8)], f = pfac(n), hide = R(f.length), ans = f[hide];
        return { ask: '더 못 쪼갤 때까지 쪼갰어요. ?는 무엇일까요?', show: `<p class="m-eqbig">${n} = ${f.map((v, i) => i === hide ? '?' : v).join(' × ')}</p>`, opts: shuffle([ans, ...[...new Set([ans + 1, ans === 2 ? 3 : ans - 1, ans + 2, 6])].filter(v => v > 1 && v !== ans).slice(0, 2)]), ans, hint: H.split,
          explain: `<div class="m-viz m-ftree">${treeHtml(ftree(n))}</div><p class="m-eq-num">${n} = ${f.join(' × ')}</p>` }; }
      if (R(2)) { const p = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29][R(10)], comp = shuffle([4, 6, 8, 9, 10, 12, 14, 15, 16, 21, 25, 27]).slice(0, 2), opts = shuffle([p, ...comp]);
        return { ask: '더 쪼갤 수 없는 수(1과 자기 자신으로만 나누어떨어지는 수)는 어느 것일까요?', show: '', opts, ans: p, hint: H.prime,
          explain: `<div class="m-orders">${comp.map(c => `<span>${c} = ${pfac(c).join(' × ')}</span>`).join('')}</div><p class="m-eq-num">${p}는 더 쪼갤 수 없어요</p>` }; }
      const n = [48, 60, 72, 84, 90, 96][R(6)], f = pfac(n), hide = f.length - 1 - R(2), ans = f[hide];
      return { ask: '더 못 쪼갤 때까지 쪼갰어요. ?는 무엇일까요?', show: `<p class="m-eqbig">${n} = ${f.map((v, i) => i === hide ? '?' : v).join(' × ')}</p>`, opts: shuffle([...new Set([ans, ans + 2, ans === 2 ? 3 : 2])]), ans, hint: H.split,
        explain: `<div class="m-viz m-ftree">${treeHtml(ftree(n))}</div><p class="m-eq-num">${n} = ${f.join(' × ')}</p>` };
    },
    // 나눗셈 머리셈(숫자와 사칙연산): 쉬움 접시에 나눠 담기, 보통 구구단 나눗셈, 어려움 나머지, 도전 몇 바구니 필요할까(올림)
    div() {
      if (LV === 0) { const k = 2 + R(3), each = 1 + R(5), n = k * each;
        return { ask: `${n} ÷ ${k} = ?`, show: `<div class="m-viz">${plates(n, k)}</div>`, opts: nearby(each, 1, 10, 3), ans: each, hint: H.div, explain: `<div class="m-viz">${plates(n, k)}</div><p class="m-eq-num">접시 ${k}개에 ${each}개씩</p>` }; }
      if (LV === 1) { const k = 2 + R(8), each = 2 + R(8), n = k * each;
        return { ask: `${n} ÷ ${k} = ?`, show: '', opts: nearby(each, 1, 10, 3), ans: each, hint: H.div, explain: `<p class="m-eq-num">${k} × ${each} = ${n} 이니까 ${n} ÷ ${k} = ${each}</p>` }; }
      if (LV === 2) { const k = 3 + R(6), q = 2 + R(7), r = 1 + R(k - 1), n = k * q + r;
        return { ask: `${n} ÷ ${k} = ${q} 나머지 ?`, show: '', opts: nearby(r, 0, k, 3), ans: r, hint: H.divRem, explain: `<p class="m-eq-num">${k} × ${q} = ${k * q}, ${n} − ${k * q} = ${r}</p>` }; }
      const k = 3 + R(5), q = 3 + R(6), r = 1 + R(k - 1), n = k * q + r;
      return { ask: `사과 ${n}개를 한 바구니에 ${k}개씩 담아요. 바구니는 몇 개 있어야 다 담을까요?`, show: '', opts: shuffle([q + 1, q, q + 2]), ans: q + 1, hint: H.divUp,
        explain: `<p class="m-eq-num">${n} ÷ ${k} = ${q} 나머지 ${r} → 남은 ${r}개도 담아야 하니 ${q} + 1 = ${q + 1}바구니</p>` };
    },
  };
  // 3×3 마방진: 1~9로 합이 15. 기본판을 돌리고 뒤집어 8가지 중 하나
  const BASE = [2, 7, 6, 9, 5, 1, 4, 3, 8];
  const rot = g => [6, 3, 0, 7, 4, 1, 8, 5, 2].map(i => g[i]), flip = g => [2, 1, 0, 5, 4, 3, 8, 7, 6].map(i => g[i]);
  function magic(blanks = 3) { let g = BASE; for (let i = R(4); i--;) g = rot(g); if (R(2)) g = flip(g); return { size: 3, sol: g, max: 9, holes: shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, blanks) }; }
  // 4×4 스도쿠: 바른 판을 숫자 바꾸기·줄 바꾸기로 섞는다
  function sudoku(blanks = 6) {
    let g = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
    const p = shuffle([1, 2, 3, 4]); g = g.map(r => r.map(v => p[v - 1]));
    if (R(2)) g = [g[1], g[0], g[2], g[3]]; if (R(2)) g = [g[0], g[1], g[3], g[2]]; if (R(2)) g = [g[2], g[3], g[0], g[1]];
    if (R(2)) g = g.map(r => [r[1], r[0], r[2], r[3]]); if (R(2)) g = g[0].map((_, c) => g.map(r => r[c]));
    return { size: 4, sol: g.flat(), max: 4, holes: shuffle([...Array(16).keys()]).slice(0, blanks) };
  }
  const setLevel = l => { LV = Math.max(0, Math.min(3, l | 0)); };
  // 같은 문제가 이어서 나오지 않게: 종류마다 최근 8문제를 기억하고, 겹치면 다시 만든다.
  // 만들 수 있는 문제가 적은 종류(모양 등)는 15번 해도 안 되면 바로 앞 문제와만 다르게 한다
  const recent = {};
  const fresh = (name, make, keyOf) => (...args) => {
    const h = recent[name] = recent[name] || [];
    let q, key;
    for (let t = 0; t < 30; t++) {
      q = make(...args); key = keyOf(q);
      if (!(t < 15 ? h : h.slice(-1)).includes(key)) break;
    }
    h.push(key); if (h.length > 8) h.shift();
    return q;
  };
  for (const k of Object.keys(gen)) gen[k] = fresh(k, gen[k], q => `${q.ask}|${q.show}|${q.ans}`);
  const magicF = fresh('magic', magic, q => q.sol.join() + '|' + q.holes.join()), sudokuF = fresh('sudoku', sudoku, q => q.sol.join() + '|' + q.holes.join());
  return { gen, magic: magicF, sudoku: sudokuF, shuffle, pie, angSvg, polySvg, fracTxt, POLY, KN, blocksSvg, tableHtml, vennSvg, vRegion, barSvg, picGraph, pathSvg, bfs, distMap, nseq, SYL, keyTable, shiftW, colAdd, cellsSvg, perim, rectCells, comboGrid, b10, hund, fbox, scale, pNorm, pKey, pRot, pFlip, pSvg, FR, IT, lTable, tally, roman, dotGroups, FIGS, figSvg, segSet, eqSvg, SEGXY, stick, holeBoard, triSvg, TRIS, circSvg, towers, isPrime, pfac, ftree, treeHtml, plates, setLevel, get level() { return LV; } };
})();

// ── 단계·주제·잠금·진행 ──
const mStage = id => MATH_STAGES.find(s => s.id === id);
const mOpen = stage => mStage(stage).free || Store.hasMath();
const mTopicOf = ({ lesson, game, topic }) => MATH_TOPICS.find(t => t.id === topic || (lesson && t.lessons.includes(lesson)) || (game && (t.game === game || (t.games || []).includes(game))));
const tIco = t => t.icon.startsWith('math-') ? (PICS.i[t.icon] ? `<img class="ico" src="img/${PICS.i[t.icon]}" alt="" draggable="false">` : '🧮') : ico(t.icon);
const mPid = () => (Store.profile() || {}).id || 'guest';
// ── 수학 진행 저장 (2026-11-27) ──
// { done: [배운 레슨 id], prog: { 주제: { story, puzzle, ws, card } }, lv: { 퍼즐: 0~2 } }
// 로그인한 아이는 프로필(p.math)에 넣어 영어 진행처럼 서버로 오간다(PUT api/me/state, 서버 변경 없음). 아이마다 따로.
// 기기에도 늘 같은 내용을 남긴다(로그인 전 체험·서버가 꺼졌을 때). 둘이 다르면 합친다: 한 것은 모두 남기고 지우지 않는다
const M_EMPTY = () => ({ done: [], prog: {}, lv: {} });
const mLocalKey = () => 'math-state-' + mPid();
function mLocal() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(mLocalKey()) || 'null'); } catch {}
  if (s) return s;
  // 예전 기기 저장(math-done-·math-prog-<아이>, math-lv-<퍼즐>)을 처음 한 번 옮겨 온다
  s = M_EMPTY();
  try {
    s.done = JSON.parse(localStorage.getItem('math-done-' + mPid()) || '[]');
    s.prog = JSON.parse(localStorage.getItem('math-prog-' + mPid()) || '{}');
    for (const g of Object.keys(MATH_GAMES)) { const v = localStorage.getItem('math-lv-' + g); if (v !== null) s.lv[g] = +v; }
  } catch {}
  return s;
}
function mMerge(a, b) {
  const out = M_EMPTY();
  out.done = [...new Set([...(a.done || []), ...(b.done || [])])];
  for (const t of new Set([...Object.keys(a.prog || {}), ...Object.keys(b.prog || {})])) {
    const x = (a.prog || {})[t] || {}, y = (b.prog || {})[t] || {}, cards = [x.card, y.card].filter(Boolean).sort();
    out.prog[t] = {};
    for (const k of ['story', 'puzzle', 'ws']) if (x[k] || y[k]) out.prog[t][k] = 1;
    if (cards[0]) out.prog[t].card = cards[0]; // 먼저 받은 날
  }
  out.lv = { ...(b.lv || {}), ...(a.lv || {}) }; // 난이도는 고른 것이라 프로필(a) 쪽을 먼저
  return out;
}
// 지금 아이의 수학 진행 (읽기). 프로필과 기기 기록이 다르면 합쳐서 양쪽에 다시 적는다
function mState() {
  const p = Store.profile(), local = mLocal();
  if (!p) return local;
  const merged = mMerge(p.math || M_EMPTY(), local), js = JSON.stringify(merged);
  if (JSON.stringify(p.math || null) !== js) { p.math = merged; Store.persist(); }
  try { if (localStorage.getItem(mLocalKey()) !== js) localStorage.setItem(mLocalKey(), js); } catch {}
  return merged;
}
// 바꾸기: fn(state)로 고친 뒤 프로필(서버로 감)과 기기에 적는다
function mUpdate(fn) {
  const s = mState(); fn(s);
  const p = Store.profile();
  if (p) { p.math = s; Store.persist(); }
  try { localStorage.setItem(mLocalKey(), JSON.stringify(s)); } catch {}
  return s;
}
// 다른 기기에서 한 수학 진행을 서버에서 가져와 합친다: 수학 화면에 들어올 때(30초에 한 번)와 창이 다시 보일 때.
// 저장은 프로필 전체를 덮어쓰므로, 오래 열어 둔 창이 예전 기록으로 덮지 않게 먼저 합쳐 둔다
let mPulledAt = 0;
async function mPull(force) {
  if (!API.on || !Store.user() || (!force && Date.now() - mPulledAt < 30000)) return false;
  mPulledAt = Date.now();
  try {
    const me = await API.req('GET', 'api/me'); let changed = false;
    for (const sp of me.profiles || []) {
      const lp = Store.user() && Store.user().profiles.find(p => p.id === sp.id);
      if (!lp || !sp.math) continue;
      const m = mMerge(lp.math || M_EMPTY(), sp.math);
      if (JSON.stringify(m) !== JSON.stringify(lp.math || null)) { lp.math = m; changed = true; }
    }
    if (changed) Store.persist();
    return changed;
  } catch { return false; }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  mPull(true).then(ch => { if (ch && location.hash === '#/math') App.route(); });
});
const mathDone = () => mState().done;
const mathMarkDone = id => mUpdate(s => { if (!s.done.includes(id)) s.done.push(id); });
const mProg = () => mState().prog;
const mSteps = t => {
  const pr = mProg()[t.id] || {}, done = mathDone();
  return { story: MATH_STORIES[t.id] ? !!pr.story : null, lesson: t.lessons.every(l => done.includes(l)), puzzle: !!pr.puzzle, ws: !!pr.ws, card: pr.card || null };
};
// 단계를 마쳤다고 적고, 천재 카드가 있는 주제에서 ①~④를 다 마쳤으면 카드를 준다
function mMark(t, step) {
  if (!t) return;
  let got = false;
  mUpdate(s => {
    const pr = s.prog[t.id] = s.prog[t.id] || {};
    if (step) pr[step] = 1;
    const lesson = t.lessons.every(l => s.done.includes(l));
    if (MATH_STORIES[t.id] && !pr.card && pr.story && lesson && pr.puzzle && pr.ws) { pr.card = new Date().toISOString().slice(0, 10); got = true; }
  });
  if (got) setTimeout(() => mathCardModal(t), 900);
}
const mReward = () => { if (!Store.profile()) return 0; const got = Store.addStars(1, 'math', 5); if (got) App.refreshHeader(); return got; };
const mGcard = (t, got = true) => { const c = MATH_STORIES[t.id].card; return `<div class="m-gcard ${got ? '' : 'off'}" title="${esc(c.name)}"><span>${got ? c.icon : '❔'}</span><b>${got ? esc(c.name) : esc(t.title)}</b>${got ? `<small>${esc(c.line)}</small>` : ''}</div>`; };
function mathCardModal(t) {
  Speech.sfx.cheer(); Lesson.confetti(); KoSpeech.say(MATH_SAY.card);
  App.modal(`<div class="center m-gcard-modal">${mGcard(t)}<h2>천재 카드를 받았어요!</h2><p>「${esc(t.title)}」의 이야기·배우기·퍼즐·워크시트를 모두 마쳤어요.</p>
    <p class="fine">모은 천재 카드는 새싹수학 첫 화면에 모여요. 나중에 미니룸 액자에도 걸 수 있게 할게요.</p><div class="row-center"><button class="btn btn-primary" data-close>좋아요!</button></div></div>`);
}
// 잠긴 단계(새싹·나무)를 누르면: 새싹수학 플러스 안내
function mathUpsell(stage) {
  const s = mStage(stage) || MATH_STAGES[1];
  return App.modal(`<div class="upsell"><div class="auth-logo">💎</div><h2>${s.icon} ${s.name} 단계는 새싹수학 플러스예요</h2>
    <p>🌰 씨앗 단계(5~6세쯤)는 지금처럼 <b>무료</b>로 계속할 수 있어요.</p>
    <ul class="perks"><li>🌱 새싹 · 더하기·빼기 · 마방진 · 스도쿠</li><li>🌳 나무 · 곱셈 · 분수 · 약수와 배수 · 각 · 다각형</li><li>📖 개념 배우기 · 🧩 퍼즐(쉬움·보통·어려움·도전) · 🖨️ 워크시트, 문제는 할 때마다 새로</li></ul>
    <div class="row-center"><button class="btn btn-ghost" data-close>나중에</button><a class="btn btn-primary" href="#/pricing" data-close>💎 요금 보기</a></div></div>`);
}

const mHome = () => {
  const done = mathDone(), lock = s => !mOpen(s.id);
  const btn = (s, href, label, ok) => lock(s) ? `<button class="btn btn-ghost sm" data-lock="${s.id}">${label}</button>` : `<a class="btn btn-ghost sm ${ok ? 'm-ok' : ''}" href="${href}">${label}${ok ? ' ✓' : ''}</a>`;
  const cardTopics = MATH_TOPICS.filter(t => MATH_STORIES[t.id]), got = cardTopics.filter(t => mSteps(t).card);
  return `<div class="wrap sec">
    <h1 class="page-title">${ico('🧮')} 새싹수학 <small class="chip">시험 중</small></h1>
    <div class="m-intro">
      <div class="card m-intro-card"><b>이렇게 배워요 · 한 주제 10분</b><p>📜 <b>수학 이야기</b> 옛날 수수께끼 듣기<br>📖 <b>배우기</b> 눌러 보고 옮겨 보기<br>🧩 <b>퍼즐</b> 쉬움·보통·어려움·도전, 할 때마다 새 문제<br>🖨️ <b>워크시트</b> 화면에서 풀고 인쇄도<br>🏅 <b>천재 카드</b> 다 마치면 한 장!</p></div>
      <div class="card m-intro-card"><b>단계</b><p>${MATH_STAGES.map(s => `${s.icon} <b>${s.name}</b> <small>${s.age}</small> ${MATH_TOPICS.filter(t => t.stage === s.id).map(t => t.title).join('·')}${s.free ? ' <i class="chip">무료</i>' : ''}`).join('<br>')}</p></div>
      <div class="card m-intro-card"><b>부모님께</b><p>틀리면 정답을 바로 보여 주지 않아요. 한 번 틀리면 힌트, 두 번 틀리면 그림 풀이를 보여 줘요. 시간 제한은 없어요. 워크시트는 인쇄하면 다음 장에 정답이 있어요. 새싹·나무 단계는 <a href="#/pricing">새싹수학 플러스</a>예요.</p></div>
    </div>
    <div class="card m-cards"><b>🏅 내 천재 카드 <small>${got.length} / ${cardTopics.length}</small></b><div class="m-card-row">${cardTopics.map(t => mGcard(t, !!mSteps(t).card)).join('')}</div></div>
    ${MATH_STAGES.map(s => `<h2 class="sec-sub m-stage">${s.icon} ${s.name} <small>${s.age} · ${s.desc}${s.free ? ' · 무료' : lock(s) ? ' · 🔒 플러스' : ''}</small></h2>
      <div class="m-topics">${MATH_TOPICS.filter(t => t.stage === s.id).map(t => {
        const ls = t.lessons.map(id => MATH_LESSONS.find(l => l.id === id)), st = mSteps(t);
        const all = st.lesson && st.puzzle && st.ws && st.story !== false;
        return `<div class="card m-topic ${all ? 'done' : ''} ${lock(s) ? 'locked' : ''}">
          <div class="m-topic-head"><span class="m-l-ico">${tIco(t)}</span><b>${t.title}</b>${lock(s) ? '<span class="m-lock" aria-label="잠김">🔒</span>' : st.card ? `<span class="m-cardmark" title="천재 카드">${MATH_STORIES[t.id].card.icon}</span>` : all ? '<span>✅</span>' : ''}</div>
          <div class="m-topic-btns">${st.story !== null ? btn(s, `#/math/s_${t.id}`, '📜 이야기', st.story) : ''}${ls.map(l => btn(s, `#/math/${l.id}`, `📖 ${ls.length > 1 ? l.title : '배우기'}`, done.includes(l.id))).join('')}${(t.games || [t.game]).map((g, i) => btn(s, `#/math/p_${g}`, `🧩 ${i ? MATH_GAMES[g].title : '퍼즐'}`, i ? false : st.puzzle)).join('')}${btn(s, `#/math/w_${t.id}`, '🖨️ 워크시트', st.ws)}${Object.entries(t.wsMore || {}).map(([k, w]) => btn(s, `#/math/w_${t.id}_${k}`, `🖨️ ${w.title} 워크시트`, false)).join('')}</div></div>`;
      }).join('')}</div>`).join('')}
    <p class="fine">새싹수학은 시험 중이에요. 퍼즐과 워크시트 문제는 할 때마다 새로 만들어져요. 로그인하면 진행과 천재 카드가 아이별로 저장돼서 다른 기기에서도 이어져요.</p></div>`;
};

Views.math = (el, game) => {
  KoSpeech.stop();
  // 주소: #/math/<레슨 id> · #/math/s_<주제 이야기> · #/math/p_<퍼즐> · #/math/w_<주제 워크시트> (예전 주소 #/math/count 같은 퍼즐 이름도 받는다)
  const lesson = game && MATH_LESSONS.find(l => l.id === game);
  const pzKey = game && (game.startsWith('p_') ? game.slice(2) : !lesson && MATH_GAMES[game] ? game : null);
  const [wsId, wsKey] = game && game.startsWith('w_') ? game.slice(2).split('_') : [], wsTopic = wsId && MATH_TOPICS.find(t => t.id === wsId && (!wsKey || (t.wsMore || {})[wsKey]));
  const stTopic = game && game.startsWith('s_') && MATH_STORIES[game.slice(2)] && MATH_TOPICS.find(t => t.id === game.slice(2));
  const stage = lesson ? lesson.stage : pzKey && MATH_GAMES[pzKey] ? MATH_GAMES[pzKey].stage : (wsTopic || stTopic) ? (wsTopic || stTopic).stage : null;
  if (stage && !mOpen(stage)) { location.hash = '#/math'; return void setTimeout(() => mathUpsell(stage), 50); }
  if (lesson) return mathLesson(el, lesson);
  if (wsTopic) return mathWorksheet(el, wsTopic, wsKey);
  if (stTopic) return mathStory(el, stTopic);
  if (!pzKey || !MATH_GAMES[pzKey]) {
    el.innerHTML = mHome();
    $$('[data-lock]', el).forEach(b => b.onclick = () => mathUpsell(b.dataset.lock));
    mPull().then(ch => { if (ch && location.hash === '#/math') App.route(); });
    return;
  }
  mathPuzzle(el, pzKey);
};

// 문제 하나 묻기 (퍼즐·레슨 확인 문제): 1번 틀리면 힌트, 2번 틀리면 그림 풀이. onRight(처음에 맞혔는지)
function mathAsk(area, q, { head = '', onRight }) {
  area.innerHTML = `${head}<h2 class="m-ask">${q.ask}</h2>${q.say ? `<div class="row-center m-say"><button class="btn btn-ghost sm" data-ko>🔊 다시 듣기</button></div>` : ''}${q.show}
    <div class="options m-opts">${q.opts.map(o => `<button class="option" data-v="${esc(String(o))}">${q.labels ? q.labels[o] : o}</button>`).join('')}</div><div class="m-help" aria-live="polite"></div>`;
  if (q.say) { KoSpeech.say(q.say); $('[data-ko]', area).onclick = () => KoSpeech.say(q.say); }
  let miss = 0;
  $$('.option', area).forEach(b => b.onclick = () => {
    if (String(q.ans) === b.dataset.v) { b.classList.add('right'); Speech.sfx.correct(); $$('.option', area).forEach(x => x.disabled = true); setTimeout(() => onRight(miss === 0), 750); return; }
    b.classList.add('wrong'); b.disabled = true; Speech.sfx.wrong(); miss++;
    $('.m-help', area).innerHTML = mHelp(q, miss);
    KoSpeech.say(miss === 1 ? q.hint : MATH_SAY.look);
  });
}
const mHelp = (q, miss) => !q.hint ? '' : `<p class="m-hint">💡 ${esc(q.hint)}</p>${miss >= 2 && q.explain ? `<div class="m-explain"><b>🔍 그림 풀이</b>${q.explain}</div>` : ''}`;

// ③ 퍼즐: 쉬움·보통·어려움·도전. 한 판 5문제, 처음에 다 맞히면 별
function mathPuzzle(el, game) {
  const d = MATH_GAMES[game], topic = mTopicOf({ game }), saved = mState().lv[game];
  let lv = saved === undefined ? (d.stage === 'seed' ? 0 : 1) : saved;
  el.innerHTML = `<div class="wrap sec narrow"><a class="link-btn" href="#/math">← 새싹수학</a><h1 class="page-title">${mIco(game)} ${d.title}</h1>
    <div class="m-levels" role="tablist">${MATH_LEVELS.map(([i, n], k) => `<button role="tab" data-lv="${k}" class="${k === lv ? 'on' : ''}" aria-selected="${k === lv}">${i} ${n}</button>`).join('')}</div><div class="card m-area"></div></div>`;
  const area = $('.m-area', el);
  $$('[data-lv]', el).forEach(b => b.onclick = () => { mUpdate(st => { st.lv[game] = +b.dataset.lv; }); Speech.sfx.tap(); mathPuzzle(el, game); });
  const done = (ok, total) => {
    const all = ok === total, got = all ? mReward() : 0;
    if (all) { Speech.sfx.cheer(); Lesson.confetti(); }
    mMark(topic, 'puzzle');
    area.innerHTML = `<div class="center m-done"><div class="auth-logo">${ico(all ? '🏆' : '🌱')}</div><h2>${MathGen.gen[game] ? `${ok} / ${total} 처음에 맞혔어요!` : '퍼즐 완성! 🎉'}</h2>${got ? '<p>⭐ 별 1개를 받았어요</p>' : all && Store.profile() ? '<p class="fine">오늘 수학 별은 다 받았어요</p>' : ''}
      ${!all && MathGen.gen[game] ? '<p class="fine">처음에 다 맞히면 별을 받아요. 한 번 더 해 볼까요?</p>' : ''}
      <div class="row-center">${topic ? `<a class="btn btn-primary" href="#/math/w_${topic.id}${(Object.entries(topic.wsMore || {}).find(([, w]) => w.gen === game) || [''])[0] ? '_' + Object.entries(topic.wsMore).find(([, w]) => w.gen === game)[0] : ''}">🖨️ 워크시트로 연습</a>` : ''}<button class="btn btn-ghost" data-again>한 판 더</button><a class="btn btn-ghost" href="#/math">다른 주제</a></div></div>`;
    $('[data-again]', area).onclick = () => mathPuzzle(el, game);
  };
  // 보기 고르는 놀이
  if (MathGen.gen[game]) {
    let i = 0, ok = 0; const N = 5;
    const next = () => {
      if (i >= N) return done(ok, N);
      MathGen.setLevel(lv);
      mathAsk(area, MathGen.gen[game](), { head: `<p class="m-prog">${i + 1} / ${N} · ${MATH_LEVELS[lv].join(' ')}</p>`, onRight: first => { if (first) ok++; i++; next(); } });
    };
    return next();
  }
  // 칸 채우는 퍼즐 (마방진·스도쿠): 빈칸을 누르고 아래 숫자를 누른다. 틀리면 1번은 힌트, 2번부터는 빈칸 하나를 채워 준다
  const blanks = game === 'magic' ? [2, 3, 5, 6][lv] : [4, 6, 9, 11][lv];
  const pz = game === 'magic' ? MathGen.magic(blanks) : MathGen.sudoku(blanks), n = pz.size, val = pz.sol.map((v, i) => pz.holes.includes(i) ? 0 : v);
  let sel = pz.holes[0], miss = 0;
  const hint = game === 'magic' ? '💡 한 줄에 두 수가 있으면, 15에서 두 수를 빼면 남은 칸의 수예요.' : '💡 한 줄에 세 수가 있으면, 1·2·3·4 가운데 빠진 수가 남은 칸의 수예요.';
  const draw = msg => {
    area.innerHTML = `<p class="m-prog">${MATH_LEVELS[lv].join(' ')} · 빈칸 ${pz.holes.length}개</p><p class="m-rule">${game === 'magic' ? '가로·세로·대각선 세 수의 합이 모두 <b>15</b>가 되게 빈칸을 채워요' : '가로줄·세로줄·굵은 네모 안에 <b>1, 2, 3, 4</b>가 한 번씩 들어가게 채워요'}</p>
      <div class="m-grid ${game}" style="--n:${n}">${val.map((v, i) => `<button class="m-cell ${pz.holes.includes(i) ? 'hole' : 'fixed'} ${sel === i ? 'sel' : ''}" data-i="${i}" ${pz.holes.includes(i) ? '' : 'disabled'}>${v || ''}</button>`).join('')}</div>
      <div class="m-pad">${Array.from({ length: pz.max }, (_, k) => `<button class="btn btn-ghost" data-n="${k + 1}">${k + 1}</button>`).join('')}<button class="btn btn-ghost" data-n="0">지우기</button></div>
      <div class="row-center"><button class="btn btn-primary" data-check>다 했어요</button></div><p class="m-msg m-hint" aria-live="polite">${msg || ''}</p>`;
    $$('.m-cell.hole', area).forEach(b => b.onclick = () => { sel = +b.dataset.i; Speech.sfx.tap(); draw(); });
    $$('[data-n]', area).forEach(b => b.onclick = () => { if (sel === null) return; val[sel] = +b.dataset.n; Speech.sfx.tap(); const nx = pz.holes.find(h => !val[h]); if (val[sel] && nx !== undefined) sel = nx; draw(); });
    $('[data-check]', area).onclick = () => {
      if (pz.holes.some(h => !val[h])) return ($('.m-msg', area).textContent = '아직 빈칸이 있어요.');
      // 답은 정해 둔 한 가지가 아니어도 규칙만 맞으면 정답 (마방진은 합, 스도쿠는 겹치지 않기)
      const rows = [...Array(n).keys()].map(r => val.slice(r * n, r * n + n)), cols = [...Array(n).keys()].map(c => rows.map(r => r[c]));
      let good;
      if (game === 'magic') { const s = a => a.reduce((x, y) => x + y, 0); good = [...rows, ...cols, [val[0], val[4], val[8]], [val[2], val[4], val[6]]].every(l => s(l) === 15) && new Set(val).size === 9; }
      else { const boxes = [0, 2, 8, 10].map(o => [val[o], val[o + 1], val[o + 4], val[o + 5]]); good = [...rows, ...cols, ...boxes].every(l => new Set(l).size === 4); }
      if (good) { $$('.m-cell', area).forEach(c => c.classList.add('ok')); return setTimeout(() => done(miss ? 0 : 1, 1), 600); }
      Speech.sfx.wrong(); miss++;
      if (miss === 1) return draw(`${game === 'magic' ? '합이 15가 아닌 줄이 있어요.' : '같은 숫자가 겹친 줄이 있어요.'}<br>${hint}`);
      // 그림 풀이: 틀린 칸 하나를 정답으로 채워 보여 준다
      const wrongCell = pz.holes.find(h => val[h] !== pz.sol[h]);
      if (wrongCell !== undefined) { val[wrongCell] = pz.sol[wrongCell]; sel = wrongCell; }
      draw(`🔍 노란 칸에 알맞은 수를 넣어 줬어요. 나머지도 다시 살펴봐요!`);
    };
  };
  draw();
}

// ── 개념 레슨 (math-lessons.js) ──────────────────────────────
const lIco = l => l.icon.startsWith('math-') ? (PICS.i[l.icon] ? `<img class="ico" src="img/${PICS.i[l.icon]}" alt="" draggable="false">` : '🧮')
  : l.icon.startsWith('m') && PICS.x[l.icon] ? `<img class="m-pic" src="img/${PICS.x[l.icon]}" alt="" draggable="false">` : ico(l.icon);

// 한국어 읽어주기: 미리 만든 AI 음성(audio/ko), 없으면 기기 목소리(ko-KR)
const KoSpeech = (() => {
  let man = null, cur = null;
  fetch('audio/ko/manifest.json').then(r => r.ok ? r.json() : null).then(m => { man = m; }).catch(() => {});
  const synth = window.speechSynthesis;
  const stop = () => { if (cur) { cur.onended = null; cur.pause(); cur = null; } try { synth && synth.cancel(); } catch {} };
  const device = (text, slow, onEnd) => {
    if (!synth) return onEnd && onEnd();
    const u = new SpeechSynthesisUtterance(text), v = synth.getVoices().find(x => /^ko/i.test(x.lang));
    if (v) u.voice = v; u.lang = 'ko-KR'; u.rate = slow ? 0.7 : 0.95; u.onend = () => onEnd && onEnd(); synth.speak(u);
  };
  const say = (text, { slow, onEnd } = {}) => {
    stop();
    if (!text) return;
    const f = man && man[text];
    if (!f) return device(text, slow, onEnd);
    cur = new Audio('audio/ko/' + f); cur.playbackRate = slow ? 0.75 : 1; cur.onended = () => onEnd && onEnd();
    cur.play().catch(() => device(text, slow, onEnd));
  };
  return { say, stop };
})();

function mathViz(v) {
  if (!v) return '';
  const row = (e, n, cls = '') => Array.from({ length: n }, () => `<span class="${cls}">${mPic(e)}</span>`).join('');
  const SH = { tri: '<polygon points="50,8 94,90 6,90"/>', sq: '<rect x="12" y="12" width="76" height="76" rx="4"/>', circ: '<circle cx="50" cy="50" r="42"/>' };
  const COL = { tri: '#ff8a65', sq: '#64b5f6', circ: '#ffd54f' };
  const sh = k => `<svg viewBox="0 0 100 100" class="m-shape"><g fill="${COL[k]}" stroke="#3a2d4f" stroke-width="5">${SH[k]}</g></svg>`;
  switch (v.k) {
    case 'count': return `<div class="m-viz m-count">${row(v.e, v.n)}</div>`;
    case 'seq': return `<div class="m-viz m-seq">${v.items.map(x => x === '?' ? '<b class="m-q">?</b>' : `<span>${mPic(x)}</span>`).join('')}</div>`;
    case 'shape': return `<div class="m-viz m-shapes">${(v.s === 'all' ? ['tri', 'sq', 'circ'] : [v.s]).map(sh).join('')}</div>`;
    case 'add': return `<div class="m-viz m-eq"><span class="m-g">${row(v.e, v.a)}</span><b>+</b><span class="m-g">${row(v.e, v.b)}</span><b>=</b><span class="m-g">${row(v.e, v.a + v.b)}</span></div><p class="m-eq-num">${v.a} + ${v.b} = ${v.a + v.b}</p>`;
    case 'sub': return `<div class="m-viz m-eq"><span class="m-g">${row(v.e, v.a - v.b)}${row(v.e, v.b, 'm-gone')}</span><b>→</b><span class="m-g">${row(v.e, v.a - v.b)}</span></div><p class="m-eq-num">${v.a} − ${v.b} = ${v.a - v.b}</p>`;
    case 'group': return `<div class="m-viz m-groups">${v.groups.map(g => `<span class="m-ring">${g.map(x => `<span>${mPic(x)}</span>`).join('')}</span>`).join('')}</div>`;
    case 'array': return `<div class="m-viz m-array" style="--c:${v.c}">${row(v.e, v.r * v.c)}</div><p class="m-eq-num">${v.c} × ${v.r} = ${v.r * v.c}</p>`;
    case 'frac': return `<div class="m-viz">${MathGen.pie(v.n, v.d)}</div><p class="m-eq-num">${MathGen.fracTxt(v.n + '/' + v.d)}</p>`;
    case 'nums': return `<div class="m-viz m-nums">${Array.from({ length: v.to }, (_, k) => `<span class="${v.hi.includes(k + 1) ? 'hi' : ''}">${k + 1}</span>`).join('')}</div>`;
    case 'angle': return v.all ? `<div class="m-viz m-angs">${[['예각', 45], ['직각', 90], ['둔각', 135]].map(([t, d]) => `<figure>${MathGen.angSvg(d)}<figcaption>${t}</figcaption></figure>`).join('')}</div>` : `<div class="m-viz">${MathGen.angSvg(v.deg)}</div>`;
    case 'poly': return `<div class="m-viz m-angs">${v.s.map((n, k) => `<figure>${MathGen.polySvg(n, ['#4db6ac', '#ff8a65', '#9575cd', '#64b5f6'][k % 4])}<figcaption>${MathGen.POLY[n]}</figcaption></figure>`).join('')}</div>`;
    case 'grid': return `<div class="m-grid show ${v.n === 3 ? 'magic' : 'sudoku'}" style="--n:${v.n}">${v.vals.map(x => `<span class="m-cell fixed">${x || ''}</span>`).join('')}</div>`;
    case 'blocks': return `<div class="m-viz">${MathGen.blocksSvg(v.h)}</div>`;
    case 'table': return `<div class="m-viz">${MathGen.tableHtml(v.rows, v.mode || 'both')}</div>`;
    case 'venn': return `<div class="m-viz">${MathGen.vennSvg(v.A, v.B, (v.items || []).map(e => ({ e, r: MathGen.vRegion(e, v.A, v.B) })))}</div>`;
    case 'bar': return v.table ? `<div class="m-viz m-bars-make"><div>${MathGen.tableHtml(v.rows, 'num')}</div>${MathGen.barSvg(v.rows, v.hi || [])}</div>` : `<div class="m-viz">${MathGen.barSvg(v.rows, v.hi || [])}</div>`;
    case 'path': {
      const o = { W: v.W, H: v.H, s: v.s, g: v.g, walls: v.walls || [] };
      if (v.best) { const p = MathGen.bfs(v.W, v.H, v.s, v.g, o.walls); o.routes = [{ pts: p, col: '#ffb300' }]; o.nums = Object.fromEntries(p.slice(1, -1).map((q, k) => [q.join(), k + 1])); }
      if (v.dist) o.nums = MathGen.distMap(v.W, v.H, v.s, o.walls);
      return `<div class="m-viz">${MathGen.pathSvg(o)}</div>`;
    }
    case 'b10': return `<div class="m-viz">${MathGen.b10(v.n, v.label)}</div>`;
    case 'b10cmp': return `<div class="m-viz m-b10cmp">${[v.a, v.b].map(n => `<figure>${MathGen.b10(n)}<figcaption>${n}</figcaption></figure>`).join('')}</div>`;
    case 'hund': return `<div class="m-viz">${MathGen.hund({ hi: v.hi || [] })}</div>`;
    case 'fbox': return `<div class="m-viz">${MathGen.fbox(v.pairs, null, false, v.lab || '')}</div>`;
    case 'scale': return `<div class="m-viz">${MathGen.scale(v.left, v.right)}</div>`;
    case 'pshapes': return `<div class="m-viz m-b10cmp">${v.list.map(([c, col, sz]) => `<figure>${MathGen.pSvg(c, col, sz || 24)}</figure>`).join('')}</div>`;
    case 'ltab': return `<div class="m-viz">${MathGen.lTable(v.n, v.sol || [], !!v.sol)}</div>`;
    case 'back': return `<div class="m-viz m-steps"><p class="m-eqbig">? → +${v.a} → ×${v.b} → ${v.end}</p><p class="m-eqbig">${(v.end / v.b) - v.a} ← −${v.a} ← ÷${v.b} ← ${v.end}</p></div>`;
    case 'tally': return `<div class="m-viz">${MathGen.tally(v.n)}</div>`;
    case 'roman': return `<div class="m-viz"><table class="m-key m-rtab"><tr>${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `<th>${MathGen.roman(n, false)}</th>`).join('')}</tr><tr>${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `<td>${n}</td>`).join('')}</tr></table></div>`;
    case 'fig': return `<div class="m-viz">${MathGen.figSvg(MathGen.FIGS[v.fig], { odd: !!v.odd, size: 190 })}</div>`;
    case 'match': return v.fix ? `<div class="m-viz m-b10cmp"><figure>${MathGen.eqSvg(v.s, .7)}<figcaption>틀린 식</figcaption></figure><figure>${MathGen.eqSvg(v.fix, .7)}<figcaption>고친 식</figcaption></figure></div>` : `<div class="m-viz">${MathGen.eqSvg(v.s)}</div>`;
    case 'hole': return `<div class="m-viz">${MathGen.holeBoard(v.cells, 5, 4)}</div>`;
    case 'tris': return `<div class="m-viz m-b10cmp">${v.list.map(([k, sd]) => `<figure>${MathGen.triSvg(MathGen.TRIS[k], { sides: sd, right: k === '직각' ? 1 : -1 })}<figcaption>${{ 정삼각형: '정삼각형', 이등변: '이등변삼각형', 부등변: '세 변이 다른 삼각형', 직각: '직각삼각형' }[k]}</figcaption></figure>`).join('')}</div>`;
    case 'circ': return `<div class="m-viz">${MathGen.circSvg({ r: v.r ?? null, d: v.d ?? null })}</div>`;
    case 'circlines': return `<div class="m-viz m-b10cmp">${[0, 1, 2].map(k => `<figure>${MathGen.circSvg({ line: k })}<figcaption>${k}점</figcaption></figure>`).join('')}</div>`;
    case 'towers': return `<div class="m-viz">${MathGen.towers(v.h)}</div>`;
    case 'rects': return `<div class="m-viz m-b10cmp">${[...Array(v.n).keys()].filter(d => d > 0 && d * d <= v.n && v.n % d === 0).map(d => `<figure><div class="m-dgrid" style="--c:${v.n / d}">${mDots(v.n)}</div><figcaption>${d} × ${v.n / d}</figcaption></figure>`).join('')}</div>`;
    case 'ftree': return `<div class="m-viz m-ftree">${MathGen.treeHtml(MathGen.ftree(v.n))}</div>`;
    case 'plates': return `<div class="m-viz">${MathGen.plates(v.n, v.kk)}</div>`;
    case 'nseq': return `<div class="m-viz">${MathGen.nseq(v.items, v.labels || [])}</div>`;
    case 'key': return `<div class="m-viz">${MathGen.keyTable()}</div>`;
    case 'cshift': return `<div class="m-viz m-cshift">${[...v.w].map(c => `<span><b>${c}</b><i>↓ ${v.s}칸</i><b>${MathGen.shiftW(c, v.s)}</b></span>`).join('')}</div>`;
    case 'eq': return `<div class="m-viz m-eqs">${v.rows.map(r => `<p class="m-eqbig">${r.split(' ').map(t => /\p{Extended_Pictographic}/u.test(t) ? mPic(t) : t).join(' ')}</p>`).join('')}</div>`;
    case 'col': return `<div class="m-viz">${MathGen.colAdd(v.rows)}</div>`;
    case 'pick': return `<div class="m-viz m-pick">${v.groups.map(g => `<span>${g.map(mPic).join('')}</span>`).join('')}</div>`;
    case 'combo': return `<div class="m-viz">${MathGen.comboGrid(v.a, v.b)}</div>`;
    case 'cells': return `<div class="m-viz">${MathGen.cellsSvg({ W: v.W, H: v.H, cells: v.cells || MathGen.rectCells(...v.rect), nums: v.nums, edge: v.edge })}</div>`;
    // 수학 이야기 그림
    case 'scene': return `<div class="m-viz m-scene">${v.items.map(x => `<span>${mPic(x)}</span>`).join('')}</div>`;
    case 'pair': return `<div class="m-viz m-pair"><div>${Array.from({ length: v.n }, (_, k) => `<span class="${v.miss && k >= v.n - v.miss ? 'm-away' : ''}">${mPic(v.a)}</span>`).join('')}</div><div class="m-links">${'<i></i>'.repeat(v.n)}</div><div>${row(v.b, v.n)}</div></div>`;
    case 'rope': {
      if (!v.tri) return `<div class="m-viz"><svg viewBox="0 0 260 70" class="m-rope" aria-label="매듭 밧줄"><path d="M12 35 Q130 62 248 35" stroke="#a1887f" stroke-width="6" fill="none" stroke-linecap="round"/>${Array.from({ length: 12 }, (_, k) => { const t = (k + .5) / 12, x = 12 * (1 - t) ** 2 + 260 * (1 - t) * t + 248 * t * t, y = 35 + 54 * (1 - t) * t; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#6d4c41"/>`; }).join('')}</svg></div>`;
      const P = [[130, 18], [232, 170], [28, 170]], knots = [];
      for (let s = 0; s < 3; s++) for (let k = 0; k < 4; k++) { const [a, b] = [P[s], P[(s + 1) % 3]], t = k / 4; knots.push(`<circle cx="${(a[0] + (b[0] - a[0]) * t).toFixed(1)}" cy="${(a[1] + (b[1] - a[1]) * t).toFixed(1)}" r="6" fill="#6d4c41"/>`); }
      return `<div class="m-viz"><svg viewBox="0 0 260 200" class="m-rope tri" aria-label="밧줄로 만든 세모"><polygon points="${P.map(p => p.join(',')).join(' ')}" fill="#fff3e0" stroke="#a1887f" stroke-width="6" stroke-linejoin="round"/>${knots.join('')}${P.map(([x, y]) => `<text x="${x}" y="${y + (y < 50 ? -2 : 26)}" font-size="26" text-anchor="middle">🙋</text>`).join('')}</svg></div>`;
    }
  }
  return '';
}

// 따라 쓰기: 연한 글자 위를 손가락으로 덧쓰면 덮은 정도로 확인한다 (영어 레슨 trace와 같은 방식, 한글·여러 글자도)
function mathTrace(box, glyph, onOk) {
  const W = 360, H = 260;
  box.innerHTML = `<div class="trace-wrap"><canvas class="trace m-trace" width="${W}" height="${H}" aria-label="${esc(glyph)} 따라 쓰기"></canvas></div>
    <div class="row-center"><button class="btn btn-ghost" data-clear>지우기</button><button class="btn btn-primary" data-check disabled>다 썼어요</button></div><p class="m-msg fine" aria-live="polite"></p>`;
  const cv = box.querySelector('canvas'), c = cv.getContext('2d');
  const fam = '"Jua", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "Baloo 2", sans-serif';
  const mk = () => { const x = document.createElement('canvas'); x.width = W; x.height = H; return x; };
  let size = 220; c.font = `bold ${size}px ${fam}`; const w = c.measureText(glyph).width; if (w > W - 40) size = Math.floor(size * (W - 40) / w);
  const font = `bold ${size}px ${fam}`, cy = H / 2 + size * 0.06;
  const put = (ctx, fill) => { ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = fill; ctx.fillText(glyph, W / 2, cy); };
  const mask = mk(), mc = mask.getContext('2d'); put(mc, '#000');
  const ink = mk(), ic = ink.getContext('2d');
  const guide = () => { c.clearRect(0, 0, W, H); put(c, getComputedStyle(document.documentElement).getPropertyValue('--trace-guide').trim() || '#e4e0ea'); };
  guide();
  let drawing = false, last = null, len = 0;
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
  const line = (ctx, a, b, col) => { ctx.strokeStyle = col; ctx.lineWidth = Math.max(12, size / 12); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); };
  cv.onpointerdown = e => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); };
  cv.onpointermove = e => { if (!drawing) return; const p = pos(e); line(c, last, p, '#ff7043'); line(ic, last, p, '#000'); len += Math.hypot(p[0] - last[0], p[1] - last[1]); last = p; box.querySelector('[data-check]').disabled = len < 80; };
  cv.onpointerup = cv.onpointercancel = () => { drawing = false; };
  box.querySelector('[data-clear]').onclick = () => { ic.clearRect(0, 0, W, H); len = 0; guide(); box.querySelector('[data-check]').disabled = true; };
  box.querySelector('[data-check]').onclick = () => {
    const m = mc.getImageData(0, 0, W, H).data, d = ic.getImageData(0, 0, W, H).data;
    let mN = 0, cov = 0, iN = 0, on = 0;
    for (let k = 3; k < m.length; k += 16) { const a = m[k] > 0, b = d[k] > 0; if (a) { mN++; if (b) cov++; } if (b) { iN++; if (a) on++; } }
    const ok = cov / Math.max(mN, 1) > 0.3 && on / Math.max(iN, 1) > 0.4;
    if (ok) { Speech.sfx.correct(); onOk(); }
    else { Speech.sfx.wrong(); box.querySelector('.m-msg').textContent = '연한 글자 위를 따라서 한 번 더 써 볼까요?'; }
  };
}

const mSayBtns = t => `<div class="row-center m-say"><button class="btn btn-ghost" data-ko="${esc(t)}">🔊 듣기</button><button class="btn btn-ghost" data-ko-slow="${esc(t)}">🐢 천천히</button></div>`;
const mWireSay = area => {
  $$('[data-ko]', area).forEach(b => { if (b.dataset.ko) b.onclick = () => KoSpeech.say(b.dataset.ko); });
  $$('[data-ko-slow]', area).forEach(b => b.onclick = () => KoSpeech.say(b.dataset.koSlow, { slow: true }));
};

// ① 수학 이야기: 그림 + 한국어 음성, 3~4장
function mathStory(el, t) {
  const S = MATH_STORIES[t.id], first = t.lessons[0];
  let i = 0;
  el.innerHTML = `<div class="wrap sec narrow"><a class="link-btn" href="#/math">← 새싹수학</a><h1 class="page-title">📜 ${esc(t.title)} · 수학 이야기</h1>
    <div class="lesson-progress m-lprog"><div class="bar"></div></div><div class="card m-area m-story"></div></div>`;
  const area = $('.m-area', el), bar = $('.m-lprog .bar', el);
  const show = () => {
    const pg = S.pages[i], last = i === S.pages.length - 1;
    bar.style.width = `${Math.round((i + 1) / S.pages.length * 100)}%`;
    // 장면 쪽은 그린 그림(pregen-math-story.js), 수학 도해 쪽은 그대로 mathViz
    const pic = typeof MATH_STORY_PICS !== 'undefined' && MATH_STORY_PICS[`${t.id}-${i}`];
    area.innerHTML = `<p class="m-prog">${i + 1} / ${S.pages.length}</p>${pic ? `<div class="m-story-pic"><img src="img/${pic}" alt="" draggable="false"></div>` : mathViz(pg.viz)}<p class="m-text">${esc(pg.text)}</p>${mSayBtns(pg.text)}
      <div class="row-center">${i ? '<button class="btn btn-ghost" data-prev>← 앞으로</button>' : ''}${last ? `<a class="btn btn-primary" href="#/math/${first}">📖 배우러 가기</a>` : '<button class="btn btn-primary" data-next>다음 →</button>'}</div>`;
    mWireSay(area); KoSpeech.say(pg.text);
    const nx = $('[data-next]', area), pv = $('[data-prev]', area);
    if (nx) nx.onclick = () => { i++; show(); };
    if (pv) pv.onclick = () => { i--; show(); };
    if (last) mMark(t, 'story');
  };
  show();
}

// ② 개념 배우기: 설명(🔊) · 눌러 보고 옮겨 보는 조작 · 따라 쓰기 · 확인 문제
function mathLesson(el, L) {
  let i = 0;
  el.innerHTML = `<div class="wrap sec narrow"><a class="link-btn" href="#/math">← 새싹수학</a><h1 class="page-title">${lIco(L)} ${L.title}</h1>
    <div class="lesson-progress m-lprog"><div class="bar"></div></div><div class="card m-area m-lesson-area"></div></div>`;
  const area = $('.m-area', el), bar = $('.m-lprog .bar', el);
  const next = () => { i++; show(); };
  const finish = () => {
    KoSpeech.stop(); mathMarkDone(L.id); const got = mReward(), tp = mTopicOf({ lesson: L.id });
    Speech.sfx.cheer(); Lesson.confetti(); bar.style.width = '100%'; mMark(tp);
    const more = tp && tp.lessons.find(id => id !== L.id && !mathDone().includes(id));
    area.innerHTML = `<div class="center m-done"><div class="auth-logo">${ico('🏆')}</div><h2>「${L.title}」 다 배웠어요!</h2>${got ? '<p>⭐ 별 1개를 받았어요</p>' : ''}
      <p>${more ? '다음 배우기도 이어서 해 볼까요?' : '이제 퍼즐로 해 볼까요?'}</p>
      <div class="row-center">${more ? `<a class="btn btn-primary" href="#/math/${more}">📖 ${MATH_LESSONS.find(l => l.id === more).title}</a>` : ''}${tp ? `<a class="btn ${more ? 'btn-ghost' : 'btn-primary'}" href="#/math/p_${L.game || tp.game}">🧩 퍼즐로 해 보기</a>` : ''}</div>
      <div class="row-center"><a class="btn btn-ghost" href="#/math">다른 주제</a><button class="btn btn-ghost" data-again>처음부터 다시</button></div></div>`;
    $('[data-again]', area).onclick = () => mathLesson(el, L);
  };
  const ready = (nb, line) => { nb.disabled = false; Speech.sfx.correct(); if (line) setTimeout(() => KoSpeech.say(line), 500); };
  const show = () => {
    if (i >= L.steps.length) return finish();
    const st = L.steps[i]; bar.style.width = `${Math.round(i / L.steps.length * 100)}%`;
    const tag = { learn: '📖 배워요', tap: '👆 눌러 봐요', corners: '👆 눌러 봐요', sort: '🧺 옮겨 봐요', extend: '🔁 채워 봐요', build: '🧱 쌓아 봐요', tally: '📊 표를 만들어요', bars: '📈 그래프를 만들어요', walk: '🚶 걸어 봐요', hop: '🐇 뛰어 세어요', bundle: '🧺 묶어 봐요', tens: '💯 수를 만들어요', machine: '🎩 넣어 봐요', scale: '⚖️ 맞춰 봐요', turn: '🔄 돌려 봐요', grid: '🔍 표를 채워요', stroke: '✏️ 그려 봐요', sticks: '🔥 막대를 옮겨요', circle: '⭕ 그어 봐요', level: '📏 고르게 맞춰요', tree: '🌲 쪼개 봐요', share: '🍬 나눠 담아요', decode: '🗝️ 암호를 풀어요', guess: '🎭 넣어 봐요', combo: '👕 짝지어 봐요', paint: '🟦 칠해 봐요', write: '✏️ 따라 써요', quiz: '❓ 확인해요', play: '🧩 해 봐요' }[st.type];
    const head = `<p class="m-prog">${i + 1} / ${L.steps.length} · <b>${tag}</b></p>`;
    const nextBtn = '<div class="row-center"><button class="btn btn-primary" data-next disabled>다음 →</button></div>';
    if (st.type === 'learn') {
      area.innerHTML = `${head}${mathViz(st.viz)}<p class="m-text">${esc(st.text)}</p>${mSayBtns(st.text)}<div class="row-center"><button class="btn btn-primary" data-next>다음 →</button></div>`;
      mWireSay(area); KoSpeech.say(st.text); $('[data-next]', area).onclick = next;
    } else if (st.type === 'tap') {
      // 하나씩 눌러 세기: 누를 때마다 번호가 붙고 수를 읽어 준다
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-tap">${Array.from({ length: st.n }, (_, k) => `<button class="m-tapi" data-k="${k}" aria-label="${k + 1}번째">${mPic(st.e)}</button>`).join('')}</div><p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area); let c = 0; nb.onclick = next;
      $$('.m-tapi', area).forEach(b => b.onclick = () => {
        if (b.classList.contains('on')) return;
        c++; b.classList.add('on'); b.insertAdjacentHTML('beforeend', `<i>${c}</i>`); Speech.sfx.tap(); KoSpeech.say(MATH_NATIVE[c - 1]); out.textContent = c;
        if (c === st.n) { const u = mUnit(st.e); out.textContent = `모두 ${c}${u}!`; ready(nb, `모두 ${MATH_CNT[c - 1]} ${u}예요!`); }
      });
    } else if (st.type === 'corners') {
      // 뾰족한 곳(꼭짓점) 누르기
      const P = st.s === 'tri' ? [[50, 8], [94, 90], [6, 90]] : [[12, 12], [88, 12], [88, 88], [12, 88]];
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz"><svg viewBox="-12 -12 124 124" class="m-corners" aria-label="뾰족한 곳 누르기"><polygon points="${P.map(p => p.join(',')).join(' ')}" fill="${st.s === 'tri' ? '#ff8a65' : '#64b5f6'}" stroke="#3a2d4f" stroke-width="5" stroke-linejoin="round"/>${P.map(([x, y], k) => `<g class="cn" data-k="${k}" role="button" tabindex="0"><circle cx="${x}" cy="${y}" r="13" fill="#fff" stroke="#3a2d4f" stroke-width="3"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="700"></text></g>`).join('')}</svg></div><p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area); let c = 0; nb.onclick = next;
      $$('.cn', area).forEach(g => g.onclick = g.onkeydown = e => {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        if (g.classList.contains('on')) return;
        c++; g.classList.add('on'); g.querySelector('text').textContent = c; g.querySelector('circle').setAttribute('fill', '#ffd54f'); Speech.sfx.tap(); KoSpeech.say(MATH_NATIVE[c - 1]); out.textContent = c;
        if (c === P.length) { out.textContent = `뾰족한 곳 ${c}군데!`; ready(nb, `뾰족한 곳이 ${MATH_CNT[c - 1]} 군데예요!`); }
      });
    } else if (st.type === 'sort') {
      // 바구니에 옮기기: 하나를 누르고 바구니를 누른다
      const items = MathGen.shuffle(st.groups.flatMap(([, xs], gi) => xs.map(x => [x, gi])));
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-sort">${items.map(([x, gi]) => `<button class="m-sorti" data-g="${gi}">${mPic(x)}</button>`).join('')}</div>
        <div class="m-baskets">${st.groups.map(([name], gi) => `<button class="m-basket" data-gi="${gi}"><b>${esc(name)}</b><span class="m-in"></span></button>`).join('')}</div><p class="m-msg fine" aria-live="polite"></p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), msg = $('.m-msg', area); let sel = null; nb.onclick = next;
      $$('.m-sorti', area).forEach(b => b.onclick = () => { $$('.m-sorti', area).forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); Speech.sfx.tap(); msg.textContent = '이제 들어갈 바구니를 눌러요.'; });
      $$('.m-basket', area).forEach(bk => bk.onclick = () => {
        if (!sel) { msg.textContent = '먼저 위에서 하나를 골라요.'; return; }
        if (sel.dataset.g === bk.dataset.gi) {
          $('.m-in', bk).insertAdjacentHTML('beforeend', `<span>${sel.innerHTML}</span>`); sel.remove(); sel = null; Speech.sfx.correct(); msg.textContent = '';
          if (!$$('.m-sorti', area).length) { msg.textContent = '🎉 다 모았어요!'; ready(nb, MATH_SAY.sorted); }
        } else { bk.classList.remove('shake'); void bk.offsetWidth; bk.classList.add('shake'); Speech.sfx.wrong(); KoSpeech.say(MATH_SAY.wrongBasket); msg.textContent = '다른 바구니예요. 다시 생각해 봐요.'; }
      });
    } else if (st.type === 'extend') {
      // 규칙 이어 채우기: 빈칸을 앞에서부터 차례로 채운다
      const seq = Array.from({ length: st.shown + st.blanks }, (_, k) => st.unit[k % st.unit.length]);
      const choices = MathGen.shuffle([...new Set([...st.unit, ['🍇', '🐶', '❤️'].find(x => !st.unit.includes(x))])]);
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz m-seq">${seq.map((x, k) => k < st.shown ? `<span>${mPic(x)}</span>` : `<b class="m-q" data-b="${k}">?</b>`).join('')}</div>
        <div class="options m-opts">${choices.map(x => `<button class="option" data-v="${x}">${mPic(x)}</button>`).join('')}</div>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area); let k = st.shown; nb.onclick = next;
      $$('.option', area).forEach(b => b.onclick = () => {
        if (k >= seq.length) return;
        if (b.dataset.v === seq[k]) { $(`[data-b="${k}"]`, area).outerHTML = `<span class="m-fill">${mPic(seq[k])}</span>`; k++; Speech.sfx.correct(); if (k === seq.length) ready(nb, MATH_SAY.extended); }
        else { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); Speech.sfx.wrong(); }
      });
    } else if (st.type === 'build') {
      // 쌓기나무 쌓기: 칸마다 ➕·➖로 쌓아 보이는 층 수를 맞춘다
      const h = st.target.map(() => 0), sum = () => h.reduce((a, b) => a + b, 0);
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz m-build-view"></div>
        <div class="m-build">${st.target.map((t, k) => `<div class="m-build-col"><b>${t}층</b><button class="btn btn-ghost sm" data-add="${k}" aria-label="${k + 1}번째 칸에 하나 올리기">➕</button><button class="btn btn-ghost sm" data-sub="${k}" aria-label="${k + 1}번째 칸에서 하나 내리기">➖</button></div>`).join('')}</div>
        <p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area), view = $('.m-build-view', area); nb.onclick = next;
      const draw = () => { view.innerHTML = MathGen.blocksSvg([h]); out.textContent = sum() ? `지금 ${sum()}개` : ' '; };
      const check = () => { if (h.every((v, k) => v === st.target[k])) { out.textContent = `모두 ${sum()}개!`; ready(nb, `모두 ${MATH_CNT[sum() - 1]} 개예요!`); } };
      $$('[data-add]', area).forEach(b => b.onclick = () => { const k = +b.dataset.add; if (h[k] >= 4) return; h[k]++; Speech.sfx.tap(); draw(); check(); });
      $$('[data-sub]', area).forEach(b => b.onclick = () => { const k = +b.dataset.sub; if (!h[k]) return; h[k]--; Speech.sfx.tap(); nb.disabled = true; draw(); });
      draw();
    } else if (st.type === 'tally') {
      // 표 만들기: 섞인 것을 하나씩 눌러 표의 제 줄로 옮긴다
      const items = MathGen.shuffle(st.items), cnt = st.rows.map(() => 0);
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-sort">${items.map(x => `<button class="m-sorti" data-e="${x}">${mPic(x)}</button>`).join('')}</div>
        <table class="m-table tally"><tbody>${st.rows.map((e, r) => `<tr data-r="${r}"><th>${mPic(e)} ${MATH_NAMES[e] || ''}</th><td class="m-in"></td><td class="m-cnt">0</td></tr>`).join('')}</tbody></table>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area); nb.onclick = next;
      $$('.m-sorti', area).forEach(b => b.onclick = () => {
        const r = st.rows.indexOf(b.dataset.e), tr = $(`tr[data-r="${r}"]`, area);
        $('.m-in', tr).insertAdjacentHTML('beforeend', `<span>${b.innerHTML}</span>`); cnt[r]++; $('.m-cnt', tr).textContent = cnt[r]; b.remove();
        Speech.sfx.tap(); KoSpeech.say(MATH_NATIVE[cnt[r] - 1]);
        if (!$$('.m-sorti', area).length) ready(nb, MATH_SAY.tableDone);
      });
    } else if (st.type === 'bars') {
      // 막대그래프 만들기: 표를 보고 ➕·➖로 막대 높이를 맞춘다
      const h = st.rows.map(() => 0);
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz m-bars-make"><div>${MathGen.tableHtml(st.rows, 'num')}</div><div class="m-bars-view"></div></div>
        <div class="m-build">${st.rows.map(([e], k) => `<div class="m-build-col"><b>${mPic(e)}</b><button class="btn btn-ghost sm" data-add="${k}" aria-label="${MATH_NAMES[e]} 막대 올리기">➕</button><button class="btn btn-ghost sm" data-sub="${k}" aria-label="${MATH_NAMES[e]} 막대 내리기">➖</button></div>`).join('')}</div>
        <p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area), view = $('.m-bars-view', area); nb.onclick = next;
      const draw = () => { view.innerHTML = MathGen.barSvg(st.rows.map(([e], k) => [e, h[k]])); };
      const check = () => { if (h.every((v, k) => v === st.rows[k][1])) { out.textContent = '그래프 완성!'; ready(nb, MATH_SAY.graphDone); } };
      $$('[data-add]', area).forEach(b => b.onclick = () => { const k = +b.dataset.add; if (h[k] >= 8) return; h[k]++; Speech.sfx.tap(); draw(); check(); });
      $$('[data-sub]', area).forEach(b => b.onclick = () => { const k = +b.dataset.sub; if (!h[k]) return; h[k]--; Speech.sfx.tap(); nb.disabled = true; out.textContent = ' '; draw(); });
      draw();
    } else if (st.type === 'walk') {
      // 길 걸어 보기: 옆 칸을 눌러 한 걸음씩, 집에서 학교까지. 앞 칸을 다시 누르면 한 걸음 되돌아간다
      const { W, H, s: s0, g, walls = [] } = st, best = MathGen.bfs(W, H, s0, g, walls).length - 1;
      let trail = [s0];
      const at = (p, q) => p[0] === q[0] && p[1] === q[1];
      const draw = msg => {
        const cells = [];
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const k = trail.findIndex(p => at(p, [x, y])), wall = walls.includes(x + ',' + y);
          cells.push(`<button class="m-wcell ${wall ? 'wall' : ''} ${k >= 0 ? 'on' : ''}" data-x="${x}" data-y="${y}" ${wall ? 'disabled' : ''}>${at([x, y], s0) ? '🏠' : at([x, y], g) ? '🏫' : wall ? '🌳' : k > 0 ? k : ''}</button>`);
        }
        $('.m-walk', area).innerHTML = cells.join('');
        $('.m-walk', area).style.setProperty('--w', W);
        $('.m-tapn', area).textContent = msg || (trail.length > 1 ? `${trail.length - 1}걸음` : ' ');
        $$('.m-wcell', area).forEach(b => b.onclick = () => {
          const p = [+b.dataset.x, +b.dataset.y], cur = trail[trail.length - 1];
          if (at(cur, g)) return;
          if (trail.length > 1 && at(p, trail[trail.length - 2])) { trail.pop(); Speech.sfx.tap(); return draw(); }
          if (Math.abs(p[0] - cur[0]) + Math.abs(p[1] - cur[1]) !== 1 || trail.some(q => at(q, p))) return;
          trail.push(p); Speech.sfx.tap();
          if (at(p, g)) {
            const n = trail.length - 1, good = n === best;
            draw(good ? `가장 짧은 길로 왔어요! ${n}걸음` : `도착! ${n}걸음이에요. ${best}걸음 길도 있어요.`);
            nb.disabled = false; if (good) Speech.sfx.correct(); setTimeout(() => KoSpeech.say(good ? MATH_SAY.pathBest : MATH_SAY.pathLonger), 400);
            return;
          }
          draw();
        });
      };
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-walk"></div><p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>
        <div class="row-center"><button class="btn btn-ghost" data-reset>처음부터</button><button class="btn btn-primary" data-next disabled>다음 →</button></div>`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area); nb.onclick = next;
      $('[data-reset]', area).onclick = () => { trail = [s0]; Speech.sfx.tap(); draw(); };
      draw();
    } else if (st.type === 'hop') {
      // 뛰어 세기: 수직선에서 다음 수를 차례로 누른다
      const want = Array.from({ length: st.count }, (_, k) => st.start + st.step * k); let k = 1;
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz m-hop-seq"></div><div class="m-hop">${Array.from({ length: st.max + 1 }, (_, n) => n).filter(n => n % (st.by || 1) === 0).map(n => `<button class="m-hopn ${n === st.start ? 'on' : ''}" data-n="${n}">${n}</button>`).join('')}</div>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), seqBox = $('.m-hop-seq', area); nb.onclick = next;
      const draw = () => { seqBox.innerHTML = MathGen.nseq(want.map((v, i) => i < k ? v : '?'), want.map(() => `+${st.step}`)); };
      draw();
      $$('.m-hopn', area).forEach(b => b.onclick = () => {
        if (k >= want.length) return;
        if (+b.dataset.n === want[k]) { b.classList.add('on'); k++; Speech.sfx.correct(); draw(); if (k === want.length) ready(nb, MATH_SAY.extended); }
        else { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); Speech.sfx.wrong(); }
      });
    } else if (st.type === 'decode') {
      // 암호 풀기: 표의 글자를 눌러 수를 차례로 글자로 바꾼다
      const ans = st.nums.map(n => MathGen.SYL[n - 1]); let k = 0;
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><p class="m-code">${st.nums.join(' - ')}</p><p class="m-code m-decoded"></p>
        <div class="m-keypad">${MathGen.SYL.map((c, i) => `<button class="m-keyb" data-c="${c}">${c}<small>${i + 1}</small></button>`).join('')}</div>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-decoded', area); nb.onclick = next;
      const draw = () => { out.innerHTML = ans.map((c, i) => i < k ? `<b>${c}</b>` : '<b class="m-q">?</b>').join(''); };
      draw();
      $$('.m-keyb', area).forEach(b => b.onclick = () => {
        if (k >= ans.length) return;
        if (b.dataset.c === ans[k]) { k++; Speech.sfx.correct(); draw(); if (k === ans.length) ready(nb, MATH_SAY.decoded); }
        else { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); Speech.sfx.wrong(); }
      });
    } else if (st.type === 'guess') {
      // 가려진 수 찾기: 수를 하나 넣어 보고 맞는지 확인한다
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><p class="m-eqbig">${mPic(st.e)} + ${st.a} = ${st.sum}</p>
        <div class="m-pad">${Array.from({ length: 10 }, (_, n) => `<button class="btn btn-ghost" data-n="${n}">${n}</button>`).join('')}</div><p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area); nb.onclick = next;
      $$('[data-n]', area).forEach(b => b.onclick = () => {
        const n = +b.dataset.n, got = n + st.a;
        if (got === st.sum) { out.textContent = `${n} + ${st.a} = ${got} ✅`; ready(nb, MATH_SAY.right); }
        else { out.textContent = `${n} + ${st.a} = ${got} → ${got > st.sum ? '너무 커요' : '너무 작아요'}`; Speech.sfx.wrong(); }
      });
    } else if (st.type === 'combo') {
      // 옷 입혀 보기: 위에서 하나, 아래에서 하나를 골라 짝을 만들고, 모든 짝을 찾는다
      const found = new Set(), total = st.a.length * st.b.length; let pa = null, pb = null;
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-combo-pick"><div>${st.a.map(x => `<button class="m-sorti" data-a="${x}">${mPic(x)}</button>`).join('')}</div><div>${st.b.map(x => `<button class="m-sorti" data-b="${x}">${mPic(x)}</button>`).join('')}</div></div>
        <div class="m-orders m-found"></div><p class="m-eq-num m-tapn" aria-live="polite">0 / ${total}가지</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area), box = $('.m-found', area); nb.onclick = next;
      const tryPair = () => {
        if (!pa || !pb) return;
        const key = pa + pb;
        if (found.has(key)) { Speech.sfx.wrong(); out.textContent = `이미 찾은 짝이에요 · ${found.size} / ${total}가지`; }
        else { found.add(key); box.insertAdjacentHTML('beforeend', `<span>${mPic(pa)}${mPic(pb)}</span>`); Speech.sfx.correct(); out.textContent = `${found.size} / ${total}가지`; if (found.size === total) ready(nb, `모두 ${MATH_CNT[total - 1]} 가지예요!`); }
        pa = pb = null; $$('.m-sorti', area).forEach(x => x.classList.remove('sel'));
      };
      $$('[data-a]', area).forEach(b => b.onclick = () => { $$('[data-a]', area).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); pa = b.dataset.a; Speech.sfx.tap(); tryPair(); });
      $$('[data-b]', area).forEach(b => b.onclick = () => { $$('[data-b]', area).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); pb = b.dataset.b; Speech.sfx.tap(); tryPair(); });
    } else if (st.type === 'paint') {
      // 칸 칠하기: 붙어 있는 칸 n개를 칠하면 넓이 n, 둘레도 보여 준다
      const on = new Set();
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-walk m-paint" style="--w:${st.W}">${Array.from({ length: st.W * st.H }, (_, i) => `<button class="m-wcell" data-k="${i % st.W},${Math.floor(i / st.W)}" aria-label="칸"></button>`).join('')}</div>
        <p class="m-eq-num m-tapn" aria-live="polite">넓이 0</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area); nb.onclick = next;
      const joined = () => { const cells = [...on]; if (!cells.length) return false; const seen = new Set([cells[0]]), q = [cells[0]];
        while (q.length) { const [x, y] = q.shift().split(',').map(Number); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = `${x + dx},${y + dy}`; if (on.has(k) && !seen.has(k)) { seen.add(k); q.push(k); } } }
        return seen.size === cells.length; };
      $$('.m-wcell', area).forEach(b => b.onclick = () => {
        const k = b.dataset.k; on.has(k) ? on.delete(k) : on.add(k); b.classList.toggle('on'); Speech.sfx.tap(); nb.disabled = true;
        const n = on.size, ok = n === st.n && joined();
        out.textContent = ok ? `넓이 ${n} · 둘레 ${MathGen.perim([...on])} 🎉` : n === st.n ? `넓이 ${n} · 칸끼리 붙어 있게 칠해요` : `넓이 ${n}`;
        if (ok) ready(nb, MATH_SAY.painted);
      });
    } else if (st.type === 'bundle') {
      // 열씩 묶기: 흩어진 것을 하나씩 눌러 바구니에 담고, 열 개가 차면 한 묶음이 된다
      let inTray = 0, tens = 0; const size = st.size || 10;
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-sort m-scatter">${Array.from({ length: st.n }, () => `<button class="m-sorti">${mPic(st.e)}</button>`).join('')}</div>
        <div class="m-bundles"><div class="m-tray" aria-label="묶는 중"></div><div class="m-tied" data-label="${size === 10 ? '열' : MATH_CNT[size - 1]} 개 묶음"></div></div><p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area), tray = $('.m-tray', area), tied = $('.m-tied', area); nb.onclick = next;
      const show = () => { out.textContent = `묶음 ${tens} · 낱개 ${inTray}`; };
      $$('.m-scatter .m-sorti', area).forEach(b => b.onclick = () => {
        b.remove(); inTray++; tray.insertAdjacentHTML('beforeend', `<span>${mPic(st.e)}</span>`); Speech.sfx.tap(); KoSpeech.say(MATH_NATIVE[inTray - 1]);
        if (inTray === size) { tens++; inTray = 0; tray.innerHTML = ''; tied.insertAdjacentHTML('beforeend', `<span class="m-tie">${mPic(st.e)}<b>${size}</b></span>`); Speech.sfx.correct(); }
        show();
        if (!$$('.m-scatter .m-sorti', area).length) { const n = tens * size + inTray; out.textContent = `묶음 ${tens} · 낱개 ${inTray} → ${n}`; ready(nb, MATH_SAY.bundled); }
      });
    } else if (st.type === 'tens') {
      // 십 묶음과 낱개로 수 만들기
      let t = 0, o = 0;
      const T = Math.floor(st.target / 10), O = st.target % 10;
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><p class="m-bignum">${st.target}</p><div class="m-viz m-tens-view"></div>
        <div class="m-build"><div class="m-build-col"><b>십 묶음</b><button class="btn btn-ghost sm" data-t="1" aria-label="십 묶음 하나 더">➕</button><button class="btn btn-ghost sm" data-t="-1" aria-label="십 묶음 하나 빼기">➖</button></div>
        <div class="m-build-col"><b>낱개</b><button class="btn btn-ghost sm" data-o="1" aria-label="낱개 하나 더">➕</button><button class="btn btn-ghost sm" data-o="-1" aria-label="낱개 하나 빼기">➖</button></div></div>
        <p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area), view = $('.m-tens-view', area); nb.onclick = next;
      const draw = () => { view.innerHTML = MathGen.b10(t * 10 + o); out.textContent = `${t * 10 + o}`; if (t === T && o === O) { out.textContent = `${st.target} 완성!`; ready(nb, MATH_SAY.right); } else nb.disabled = true; };
      $$('[data-t]', area).forEach(b => b.onclick = () => { t = Math.max(0, Math.min(10, t + +b.dataset.t)); Speech.sfx.tap(); draw(); });
      $$('[data-o]', area).forEach(b => b.onclick = () => { o = Math.max(0, Math.min(9, o + +b.dataset.o)); Speech.sfx.tap(); draw(); });
      draw();
    } else if (st.type === 'machine') {
      // 마술 상자: 수를 넣어 보고(누르기) 나온 수를 표에 모은 뒤, 규칙을 고른다
      const f = { '+': x => x + st.k, '×': x => x * st.k }[st.op], lab = `${st.op}${st.k}`, pairs = [];
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz m-fbox-view"></div>
        <div class="m-pad">${[1, 2, 3, 4, 5, 6].map(n => `<button class="btn btn-ghost" data-in="${n}">${n} 넣기</button>`).join('')}</div>
        <div class="m-rule-pick" hidden><p class="m-ask">상자의 규칙은 무엇일까요?</p><div class="options m-opts">${MathGen.shuffle(st.choices).map(c => `<button class="option" data-rule="${c}">${c}</button>`).join('')}</div></div>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), view = $('.m-fbox-view', area), pick = $('.m-rule-pick', area); nb.onclick = next;
      const draw = () => { view.innerHTML = MathGen.fbox(pairs, null); };
      draw();
      $$('[data-in]', area).forEach(b => b.onclick = () => {
        const x = +b.dataset.in; if (pairs.some(p => p[0] === x)) return; pairs.push([x, f(x)]); b.disabled = true; Speech.sfx.tap(); draw();
        if (pairs.length >= 3) pick.hidden = false;
      });
      $$('[data-rule]', area).forEach(b => b.onclick = () => {
        if (b.dataset.rule === lab) { b.classList.add('right'); $$('[data-rule]', area).forEach(x => x.disabled = true); ready(nb, MATH_SAY.right); }
        else { b.classList.add('wrong'); b.disabled = true; Speech.sfx.wrong(); }
      });
    } else if (st.type === 'scale') {
      // 저울 맞추기: 상자에 수를 넣어 보면 저울이 기울거나 반듯해진다
      const sumOf = (side, b) => side.reduce((a, x) => a + (x === 'B' ? b : x), 0);
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz m-scale-view"></div>
        <div class="m-pad">${Array.from({ length: 10 }, (_, n) => `<button class="btn btn-ghost" data-n="${n}">${n}</button>`).join('')}</div><p class="m-eq-num m-tapn" aria-live="polite">상자에 넣을 수를 눌러 봐요</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area), view = $('.m-scale-view', area); nb.onclick = next;
      view.innerHTML = MathGen.scale(st.left, st.right);
      $$('[data-n]', area).forEach(b => b.onclick = () => {
        const n = +b.dataset.n, L = sumOf(st.left, n), Rt = sumOf(st.right, n), tilt = Math.max(-14, Math.min(14, (Rt - L) * 3));
        view.innerHTML = MathGen.scale(st.left.map(x => x === 'B' ? n : x), st.right.map(x => x === 'B' ? n : x), tilt);
        if (L === Rt) { out.textContent = `📦 = ${n} · 저울이 반듯해요! ⚖️`; ready(nb, MATH_SAY.balanced); }
        else { out.textContent = `📦 = ${n} → ${L > Rt ? '상자 쪽이 무거워요' : '상자 쪽이 가벼워요'}`; Speech.sfx.wrong(); nb.disabled = true; }
      });
    } else if (st.type === 'turn') {
      // 돌리고 뒤집기: 단추로 모양을 돌리거나 뒤집어 처음 모양과 똑같이 맞춘다
      let cur = MathGen.pNorm(st.start);
      const goal = MathGen.pKey(st.goal);
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz m-b10cmp"><figure>${st.board ? MathGen.holeBoard(st.goal, 5, 4, 22) : MathGen.pSvg(st.goal, '#ffd54f', 22)}<figcaption>${st.board ? '이 빈칸에 맞게' : '이 모양처럼'}</figcaption></figure><figure class="m-turn-view"></figure></div>
        <div class="row-center"><button class="btn btn-ghost" data-rot>↻ 돌리기</button>${st.flip ? '<button class="btn btn-ghost" data-flip>⇋ 뒤집기</button>' : ''}</div><p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), view = $('.m-turn-view', area), out = $('.m-tapn', area); nb.onclick = next;
      const draw = () => { view.innerHTML = MathGen.pSvg(cur, '#4db6ac', 22); if (MathGen.pKey(cur) === goal) { out.textContent = '똑같아졌어요!'; ready(nb, MATH_SAY.sameShape); } else { out.textContent = ' '; nb.disabled = true; } };
      $('[data-rot]', area).onclick = () => { cur = MathGen.pRot(cur); Speech.sfx.tap(); draw(); };
      const fl = $('[data-flip]', area); if (fl) fl.onclick = () => { cur = MathGen.pFlip(cur); Speech.sfx.tap(); draw(); };
      draw();
    } else if (st.type === 'grid') {
      // 논리 표 채우기: 칸을 누르면 빈칸 → ✗ → ○. 사람마다 ○ 하나씩 맞게 놓으면 끝
      const n = st.sol.length, val = Array.from({ length: n * n }, () => 0), MARK = ['', '✗', '○'];
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><ul class="m-clues">${st.clues.map(c => `<li>${c}</li>`).join('')}</ul><div class="m-viz m-grid-view"></div>
        <div class="row-center"><button class="btn btn-primary" data-check-grid>다 채웠어요</button></div><p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), view = $('.m-grid-view', area), out = $('.m-tapn', area); nb.onclick = next;
      const draw = () => {
        view.innerHTML = `<table class="m-ltab play"><tr><th></th>${MathGen.IT.slice(0, n).map(([e]) => `<th>${mPic(e)}</th>`).join('')}</tr>${MathGen.FR.slice(0, n).map(([e], i) => `<tr><th>${mPic(e)}</th>${Array.from({ length: n }, (_, j) => `<td><button data-c="${i * n + j}" aria-label="칸">${MARK[val[i * n + j]]}</button></td>`).join('')}</tr>`).join('')}</table>`;
        $$('[data-c]', view).forEach(b => b.onclick = () => { const k = +b.dataset.c; val[k] = (val[k] + 1) % 3; Speech.sfx.tap(); draw(); });
      };
      draw();
      $('[data-check-grid]', area).onclick = () => {
        const ok = st.sol.every((j, i) => val[i * n + j] === 2) && val.filter(v => v === 2).length === n;
        if (ok) { out.textContent = '맞았어요! 표로 찾았어요.'; ready(nb, MATH_SAY.right); } else { out.textContent = '○가 맞지 않는 줄이 있어요. 단서를 다시 읽어 봐요.'; Speech.sfx.wrong(); }
      };
    } else if (st.type === 'stroke') {
      // 한붓그리기: 점을 차례로 눌러 선을 따라간다. 같은 선은 두 번 못 지나고, 막히면 처음부터
      const f = MathGen.FIGS[st.fig];
      let cur = null, used = [];
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz m-stroke"></div><p class="m-eq-num m-tapn" aria-live="polite">시작할 점을 눌러요</p>
        <div class="row-center"><button class="btn btn-ghost" data-reset>처음부터</button><button class="btn btn-primary" data-next disabled>다음 →</button></div>`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area), view = $('.m-stroke', area); nb.onclick = next;
      const draw = () => {
        view.innerHTML = MathGen.figSvg(f, { used, size: 230, cls: 'play' }).replace(`data-node="${cur}"><circle`, `data-node="${cur}" class="m-fnode cur"><circle`);
        $$('.m-fnode', view).forEach(g => g.onclick = () => {
          const i = +g.dataset.node;
          if (cur === null) { cur = i; Speech.sfx.tap(); out.textContent = '선을 따라 다음 점을 눌러요'; return draw(); }
          const k = f.e.findIndex(([a, b], j) => !used.includes(j) && ((a === cur && b === i) || (b === cur && a === i)));
          if (k < 0) { Speech.sfx.wrong(); out.textContent = '그 점으로 가는 남은 선이 없어요'; return; }
          used.push(k); cur = i; Speech.sfx.tap();
          if (used.length === f.e.length) { out.textContent = '한 번에 다 그렸어요! ✏️'; draw(); return ready(nb, MATH_SAY.stroked); }
          const left = f.e.some(([a, b], j) => !used.includes(j) && (a === cur || b === cur));
          out.textContent = left ? `선 ${used.length} / ${f.e.length}` : '막혔어요! 처음부터 다른 점에서 시작해 봐요';
          draw();
        });
      };
      $('[data-reset]', area).onclick = () => { cur = null; used = []; out.textContent = '시작할 점을 눌러요'; Speech.sfx.tap(); draw(); };
      draw();
    } else if (st.type === 'sticks') {
      // 성냥개비 숫자: 막대를 눌러 빼고(손에 듦), 빈자리를 눌러 놓는다. 목표 숫자가 되면 끝
      const goal = MathGen.segSet(st.to); let on = MathGen.segSet(st.from), hand = 0;
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz m-b10cmp"><figure>${MathGen.eqSvg(st.to, .8)}<figcaption>만들 숫자</figcaption></figure><figure class="m-sticks"></figure></div><p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area), view = $('.m-sticks', area); nb.onclick = next;
      const draw = () => {
        view.innerHTML = `<svg viewBox="-6 0 58 92" class="m-match play" style="width:140px">${Object.entries(MathGen.SEGXY).map(([k, xy]) => `<g class="m-seg" data-s="${k}">${MathGen.stick(xy, on.has(k))}<line x1="${xy[0]}" y1="${xy[1]}" x2="${xy[2]}" y2="${xy[3]}" stroke="transparent" stroke-width="16"/></g>`).join('')}</svg>`;
        out.textContent = hand ? `손에 든 막대 ${hand}개 · 빈자리를 눌러 놓아요` : ' ';
        $$('.m-seg', view).forEach(g => g.onclick = () => {
          const k = g.dataset.s;
          if (on.has(k)) { on.delete(k); hand++; Speech.sfx.tap(); }
          else if (hand > 0) { on.add(k); hand--; Speech.sfx.tap(); }
          else { Speech.sfx.wrong(); return; }
          draw();
          const same = on.size === goal.size && [...goal].every(s => on.has(s));
          if (same && (st.mode !== 'move' || hand === 0)) { out.textContent = `${st.to} 완성!`; ready(nb, MATH_SAY.right); } else nb.disabled = true;
        });
      };
      draw();
    } else if (st.type === 'circle') {
      // 반지름·지름 긋기: 단추를 누르면 선이 그어지고 길이를 보여 준다
      const got = new Set();
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz m-circ-view">${MathGen.circSvg()}</div>
        <div class="row-center"><button class="btn btn-ghost" data-line="r">반지름 긋기</button><button class="btn btn-ghost" data-line="d">지름 긋기</button></div><p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area), view = $('.m-circ-view', area); nb.onclick = next;
      $$('[data-line]', area).forEach(b => b.onclick = () => {
        got.add(b.dataset.line); Speech.sfx.tap();
        view.innerHTML = MathGen.circSvg({ r: got.has('r') ? st.r : null, d: got.has('d') ? st.r * 2 : null });
        out.textContent = got.size === 2 ? `반지름 ${st.r}, 지름 ${st.r * 2} — 지름은 반지름의 두 배!` : b.dataset.line === 'r' ? `반지름 ${st.r}` : `지름 ${st.r * 2}`;
        if (got.size === 2) ready(nb, MATH_SAY.circleDone);
      });
    } else if (st.type === 'level') {
      // 탑 높이 고르게: 높은 탑을 눌러 블록을 들고, 낮은 탑을 눌러 놓는다
      const h = [...st.h]; let from = null;
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz m-level-view"></div><p class="m-eq-num m-tapn" aria-live="polite">블록을 덜어 낼 탑을 눌러요</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area), view = $('.m-level-view', area); nb.onclick = next;
      const draw = () => {
        view.innerHTML = MathGen.towers(h, from === null ? -1 : from);
        $$('.m-tower', view).forEach(t => t.onclick = () => {
          const i = +t.dataset.t;
          if (from === null) { if (!h[i]) return; from = i; out.textContent = '블록을 놓을 탑을 눌러요'; Speech.sfx.tap(); return draw(); }
          if (i !== from) { h[from]--; h[i]++; Speech.sfx.tap(); }
          from = null; out.textContent = '블록을 덜어 낼 탑을 눌러요'; draw();
          if (h.every(v => v === h[0])) { out.textContent = `모두 ${h[0]}층으로 고르게 됐어요!`; ready(nb, MATH_SAY.leveled); }
        });
      };
      draw();
    } else if (st.type === 'tree') {
      // 곱셈 나무: 쪼갤 수 있는 수를 누르고 곱셈 짝을 골라 더 못 쪼갤 때까지
      const node = n => ({ n, kids: null }), root = node(st.n);
      const leaves = (t, acc = []) => { if (t.kids) t.kids.forEach(k => leaves(k, acc)); else acc.push(t); return acc; };
      const html = t => t.kids ? `<span class="m-node"><b>${t.n}</b><span class="m-kids">${t.kids.map(html).join('')}</span></span>` : `<button class="m-leaf ${MathGen.isPrime(t.n) ? 'p' : ''}" data-id="${t.id}">${t.n}</button>`;
      let seq = 0, sel = null;
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-viz m-ftree m-tree-view"></div><div class="m-pairs row-center"></div><p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area), view = $('.m-tree-view', area), pairs = $('.m-pairs', area); nb.onclick = next;
      const draw = () => {
        leaves(root).forEach(l => { if (l.id === undefined) l.id = seq++; });
        view.innerHTML = html(root);
        $$('.m-leaf', view).forEach(b => b.onclick = () => {
          const l = leaves(root).find(x => x.id === +b.dataset.id);
          if (MathGen.isPrime(l.n)) { out.textContent = `${l.n}: 더 쪼갤 수 없는 수(소수)예요`; return; }
          sel = l; Speech.sfx.tap();
          pairs.innerHTML = [...Array(l.n).keys()].filter(d => d > 1 && d * d <= l.n && l.n % d === 0).map(d => `<button class="btn btn-ghost sm" data-p="${d}">${d} × ${l.n / d}</button>`).join('');
          $$('[data-p]', pairs).forEach(p => p.onclick = () => { const d = +p.dataset.p; sel.kids = [node(d), node(sel.n / d)]; pairs.innerHTML = ''; Speech.sfx.correct(); draw(); });
        });
        const ls = leaves(root);
        if (ls.every(l => MathGen.isPrime(l.n))) { out.textContent = `${st.n} = ${ls.map(l => l.n).sort((a, b) => a - b).join(' × ')}`; ready(nb, MATH_SAY.treeDone); }
      };
      draw();
    } else if (st.type === 'share') {
      // 나눠 담기: 사탕을 누를 때마다 다음 접시에 하나씩
      const k = st.k; let i = 0;
      const cnt = Array(k).fill(0);
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p><div class="m-sort">${Array.from({ length: st.n }, () => `<button class="m-sorti">${mPic('🍬')}</button>`).join('')}</div><div class="m-plates m-share">${Array.from({ length: k }, (_, j) => `<span class="m-plate" data-pl="${j}"></span>`).join('')}</div><p class="m-eq-num m-tapn" aria-live="polite">&nbsp;</p>${nextBtn}`;
      KoSpeech.say(st.text);
      const nb = $('[data-next]', area), out = $('.m-tapn', area); nb.onclick = next;
      $$('.m-sort .m-sorti', area).forEach(b => b.onclick = () => {
        b.remove(); const j = i++ % k; cnt[j]++; $(`[data-pl="${j}"]`, area).insertAdjacentHTML('beforeend', mPic('🍬')); Speech.sfx.tap();
        if (!$$('.m-sort .m-sorti', area).length) { out.textContent = `${st.n} ÷ ${k} = ${cnt[0]} · 한 접시에 ${cnt[0]}개씩`; ready(nb, MATH_SAY.shared); }
      });
    } else if (st.type === 'write') {
      area.innerHTML = `${head}<h2 class="m-ask">「${esc(st.glyph)}」 따라 쓰기</h2>${mSayBtns(st.say)}<div class="m-write"></div>`;
      mWireSay(area); KoSpeech.say(st.say); mathTrace($('.m-write', area), st.glyph, () => setTimeout(next, 500));
    } else if (st.type === 'quiz') {
      MathGen.setLevel(st.lv ?? (L.stage === 'seed' ? 0 : 1));
      mathAsk(area, MathGen.gen[st.gen](...(st.args || [])), { head, onRight: next });
    } else if (st.type === 'play') {
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p>${mSayBtns(st.text)}<div class="row-center"><a class="btn btn-ghost" href="#/math/p_${st.game}">🧩 퍼즐 하러 가기</a><button class="btn btn-primary" data-next>레슨 마치기</button></div>`;
      mWireSay(area); KoSpeech.say(st.text); $('[data-next]', area).onclick = next;
    }
  };
  show();
}

// ④ 워크시트: 화면에서 풀고(1번 틀리면 힌트, 2번은 그림 풀이), 인쇄도 한다(A4, 이름·날짜, 정답은 다음 장)
function mathWorksheet(el, t, key) {
  const s = mStage(t.stage), w = key ? t.wsMore[key] : t.ws, p = Store.profile(), NUM = ['①', '②', '③', '④', '⑤'];
  let qs = [], miss = [], solved = [], first = 0;
  // 수준: 쉬움·보통·어려움·도전 (주제별로 기억. 섞는 워크시트는 고른 수준까지 차례로 섞는다)
  const lvKey = 'ws_' + t.id + (key ? '_' + key : ''), savedLv = mState().lv[lvKey];
  let lv = savedLv === undefined ? (w.mix ? 2 : t.stage === 'seed' ? 0 : 1) : savedLv;
  const make = () => {
    let probs, answers;
    if (w.grid) {
      // 마방진·스도쿠: 빈칸 있는 판을 n개, 정답은 작은 판으로 (화면에서는 🧩 퍼즐로 푼다)
      const pzs = Array.from({ length: w.n }, () => w.grid === 'magic' ? MathGen.magic([2, 3, 5, 6][lv]) : MathGen.sudoku([4, 6, 9, 11][lv]));
      const board = (pz, sol) => `<div class="mws-grid ${w.grid}" style="--n:${pz.size}">${pz.sol.map((v, i) => `<span class="${pz.holes.includes(i) ? (sol ? 'ans' : 'hole') : ''}">${pz.holes.includes(i) && !sol ? '' : v}</span>`).join('')}</div>`;
      probs = pzs.map((pz, i) => `<div class="mws-q"><b>${i + 1}.</b> ${w.grid === 'magic' ? '세 수의 합이 모두 15가 되게 채워요' : '줄마다 1·2·3·4가 한 번씩'}${board(pz)}</div>`);
      answers = pzs.map((pz, i) => `<div class="mws-a"><b>${i + 1}.</b>${board(pz, true)}</div>`);
    } else {
      MathGen.setLevel(lv);
      const seen = new Set(); qs = [];
      for (let k = 0; qs.length < w.n && k < w.n * 20; k++) { if (w.mix) MathGen.setLevel(qs.length % (lv + 1)); const q = MathGen.gen[w.gen](...(w.args || [])), key = q.ask + q.show + q.opts.join(); if (!seen.has(key)) { seen.add(key); qs.push(q); } }
      miss = qs.map(() => 0); solved = qs.map(() => false); first = 0;
      probs = qs.map((q, i) => `<div class="mws-q" data-q="${i}"><b>${i + 1}.</b> <span class="mws-ask">${q.ask}</span>${q.show}<div class="mws-opts">${q.opts.map((o, j) => `<button class="mws-o" data-v="${esc(String(o))}">${NUM[j]} ${q.labels ? q.labels[o] : o}</button>`).join('')}</div><div class="mws-help no-print" aria-live="polite"></div></div>`);
      answers = qs.map((q, i) => { const j = q.opts.findIndex(o => String(o) === String(q.ans)); return `<span class="mws-a"><b>${i + 1}.</b> ${NUM[j]}${q.labels ? '' : ` ${q.ans}`}</span>`; });
    }
    $('.mws-probs', el).innerHTML = probs.join('');
    $('.mws-answers', el).innerHTML = answers.join('');
    score();
  };
  const score = () => {
    const box = $('.mws-score', el);
    if (w.grid) { box.innerHTML = `마방진·스도쿠는 <a href="#/math/p_${t.game}">🧩 퍼즐</a>에서 화면으로 풀 수 있어요. 워크시트는 인쇄해서 풀어요.`; return; }
    const n = solved.filter(Boolean).length;
    box.innerHTML = n < qs.length ? `✏️ 화면에서 바로 풀어 봐요 · <b>${n} / ${qs.length}</b>` : `🎉 다 풀었어요! 처음에 맞힌 문제 <b>${first} / ${qs.length}</b>`;
  };
  el.innerHTML = `<div class="wrap sec narrow worksheet-wrap">
    <div class="no-print row"><a class="link-btn" href="#/math">← 새싹수학</a><button class="btn btn-ghost" data-new>🔄 새 문제</button></div>
    <div class="no-print m-levels" role="tablist">${MATH_LEVELS.map(([i, n], k) => `<button role="tab" data-wlv="${k}" class="${k === lv ? 'on' : ''}" aria-selected="${k === lv}">${i} ${n}</button>`).join('')}</div>
    <div class="no-print row"><button class="btn btn-ghost" data-ans>👀 정답 보기</button><button class="btn btn-primary" data-print>🖨️ 워크시트 인쇄</button></div>
    <p class="no-print fine">화면에서 보기를 눌러 풀 수 있어요. 정답은 화면에서는 가려 두고, 인쇄하거나 PDF로 저장하면 다음 장에 나와요.</p>
    <p class="no-print mws-score" aria-live="polite"></p>
    <article class="worksheet m-ws">
      <header><b><img class="logo-inline" src="img/logo.svg" alt=""> 새싹스쿨 · 새싹수학 워크시트</b><span>${s.icon} ${s.name} 단계 · ${esc(key ? w.title : t.title)} · <span class="mws-lv">${MATH_LEVELS[lv][1]}</span></span><span>이름: ${p ? esc(p.name) : '________'} &nbsp; 날짜: ________</span></header>
      <h3>1. 알아 두어요</h3><p class="mws-sum">${esc(w.sum)}</p>
      <h3>2. 따라 써 보세요</h3>
      <div class="mws-trace ${w.trace.every(x => x.length <= 3) && w.trace.length > 3 ? 'short' : ''}">${w.trace.map(x => `<div class="ws-trace"><span class="dotted">${esc(x)} &nbsp; ${esc(x)} &nbsp; ${esc(x)}</span><span class="line"></span></div>`).join('')}</div>
      <h3>3. 문제를 풀어요 <small>${w.grid ? '' : '알맞은 것에 ○ 해요'}</small></h3>
      <div class="mws-probs ${w.grid ? 'grids' : ''}"></div>
      <footer>참 잘했어요! 스티커를 붙여요 → ☐</footer>
      <section class="mws-ans-page"><h3>정답 <small>${esc(key ? w.title : t.title)}</small></h3><div class="mws-answers ${w.grid ? 'grids' : ''}"></div></section>
    </article></div>`;
  make();
  $('.mws-probs', el).onclick = e => {
    const b = e.target.closest('.mws-o'); if (!b) return;
    const box = b.closest('.mws-q'), i = +box.dataset.q, q = qs[i];
    if (solved[i] || b.classList.contains('no')) return;
    if (String(q.ans) === b.dataset.v) {
      b.classList.add('ok'); solved[i] = true; if (!miss[i]) first++; Speech.sfx.correct(); $('.mws-help', box).innerHTML = '';
      $$('.mws-o', box).forEach(x => x.disabled = true); score();
      if (solved.every(Boolean)) { const got = mReward(); Speech.sfx.cheer(); Lesson.confetti(); mMark(t, 'ws'); if (got) App.toast('⭐ 별 1개를 받았어요'); }
    } else {
      b.classList.add('no'); miss[i]++; Speech.sfx.wrong(); $('.mws-help', box).innerHTML = mHelp(q, miss[i]);
      if (t.stage === 'seed') KoSpeech.say(miss[i] === 1 ? q.hint : MATH_SAY.look);
    }
  };
  $$('[data-wlv]', el).forEach(b => b.onclick = () => {
    lv = +b.dataset.wlv; mUpdate(st => { st.lv[lvKey] = lv; }); Speech.sfx.tap();
    $$('[data-wlv]', el).forEach(x => { const on = +x.dataset.wlv === lv; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
    $('.mws-lv', el).textContent = MATH_LEVELS[lv][1]; make();
  });
  $('[data-new]', el).onclick = () => { Speech.sfx.tap(); make(); };
  $('[data-ans]', el).onclick = e => { const on = $('.m-ws', el).classList.toggle('show-ans'); e.target.textContent = on ? '🙈 정답 가리기' : '👀 정답 보기'; };
  $('[data-print]', el).onclick = () => { if (w.grid) mMark(t, 'ws'); window.print(); };
}
