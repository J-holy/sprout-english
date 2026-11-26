/* 새싹수학 (시험, 2026-11-26)
 * 「천재들이 만든 수학퍼즐」의 주제 이름과 개념만 참고하고, 이야기·설명·문제는 모두 새로 쓰거나 화면이 매번 새로 만든다 (docs/MATH-TOPICS.md)
 * 주제 카드 하나 = 10분 놀이: ① 천재 이야기 → ② 개념 배우기(눌러 보고 옮겨 보기) → ③ 퍼즐(쉬움·보통·도전) → ④ 워크시트(화면·인쇄) → ⑤ 별과 천재 카드
 * 틀리면 정답을 바로 보여 주지 않는다: 1번 틀리면 힌트 한 줄, 2번 틀리면 그림 풀이. 시간 제한은 없다 */
const MATH_GAMES = {
  count: { icon: '🍎', title: '수 세기', stage: 'seed', c: '#ff8a65', hub: '그림을 세어 몇 개인지 골라요' },
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
  mul: { icon: '✖️', title: '곱셈 퍼즐', stage: 'tree', c: '#ff8a65', hub: '2~9단 곱셈' },
  frac: { icon: '🍕', title: '분수 퍼즐', stage: 'tree', c: '#4db6ac', hub: '색칠한 부분은 얼마일까' },
  factor: { icon: '🍪', title: '약수·배수 퍼즐', stage: 'tree', c: '#ffb74d', hub: '약수와 배수 고르기' },
  angle: { icon: '📐', title: '각 퍼즐', stage: 'tree', c: '#9575cd', hub: '예각·직각·둔각' },
  poly: { icon: '🐝', title: '다각형 퍼즐', stage: 'tree', c: '#64b5f6', hub: '이름과 변의 수' },
};
const MATH_LEVELS = [['🌱', '쉬움'], ['🌿', '보통'], ['🔥', '도전']];
// 새싹스쿨 그림: 놀이 아이콘(PICS.i['math-…'])과 세기·규칙 스티커(PICS.x['m'+이모지]). 그림이 없으면 이모지
const mIco = k => PICS.i['math-' + k] ? `<img class="ico" src="img/${PICS.i['math-' + k]}" alt="" draggable="false">` : ico(MATH_GAMES[k].icon);
const mPic = e => PICS.x['m' + e] ? `<img class="m-pic" src="img/${PICS.x['m' + e]}" alt="" draggable="false">` : e;
const mDots = (n, cls = '') => `<span class="m-dot ${cls}"></span>`.repeat(n);

const MathGen = (() => {
  const R = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const nearby = (ans, lo, hi, n = 3) => { const s = new Set([ans]); let k = 0; while (s.size < n && k++ < 50) { const v = ans + (R(5) - 2) || ans + 3; if (v >= lo && v <= hi) s.add(v); } for (let v = lo; s.size < n; v++) s.add(v); return shuffle([...s]); };
  let LV = 1; // 0 쉬움 · 1 보통 · 2 도전
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
  const ODD = [['🍎', '🍓', '🍌', '🍇'], ['🐶', '🐱', '🐥', '🐟'], ['⭐', '🌙'], ['🚗', '⚽', '🎈']], ODDN = ['과일', '동물', '하늘', '장난감'];
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
  const gen = {
    count(lo, hi) {
      if (lo == null) [lo, hi] = [[1, 5], [1, 10], [6, 15]][LV];
      const n = lo + R(hi - lo + 1), [e, name] = MATH_THINGS[R(MATH_THINGS.length)], u = mUnit(e), say = `${name} 몇 ${u}일까요?`;
      return { ask: `${mPic(e)} ${say}`, say, show: `<div class="m-count">${Array(n).fill(`<span>${mPic(e)}</span>`).join('')}</div>`, opts: nearby(n, Math.max(1, lo - 2), hi + 2), ans: n, hint: H.count,
        explain: `<div class="m-count">${Array.from({ length: n }, (_, k) => `<span class="m-num">${mPic(e)}<i>${k + 1}</i></span>`).join('')}</div><p class="m-eq-num">모두 ${n}${u}</p>` };
    },
    shape() {
      const keys = Object.keys(SHAPES), want = keys[R(3)], cols = shuffle(COLORS);
      const rotOf = k => LV === 0 ? 0 : k === 'tri' ? [0, 15, -15, 180][R(4)] : R(LV === 2 ? 45 : 30);
      const opts = shuffle(keys).map((k, i) => ({ k, html: svg(k, cols[i], rotOf(k)) })), say = (LV === 2 ? MATH_SAY.shapeHard : MATH_SAY.shape)[want];
      return { ask: say, say, show: '', opts: opts.map(o => o.k), labels: Object.fromEntries(opts.map(o => [o.k, o.html])), ans: want, hint: H.shape,
        explain: `<div class="m-viz m-shapes">${svg(want, '#ffd54f')}</div><p class="m-eq-num">${SHAPES[want][0]} · 뾰족한 곳 ${SHAPES[want][2]}군데</p>` };
    },
    pattern() {
      const units = [[['A', 'B']], [['A', 'A', 'B'], ['A', 'B', 'C'], ['A', 'B', 'B']], [['A', 'B', 'B', 'C'], ['A', 'A', 'B', 'B'], ['A', 'B', 'C', 'C']]][LV];
      const unit = units[R(units.length)], pool = shuffle(['🍎', '🍌', '🍇', '⭐', '🌙', '❤️', '🐶', '🐱', '🍓', '🐥']);
      const map = { A: pool[0], B: pool[1], C: pool[2] }, seq = Array.from({ length: unit.length * 2 + 2 }, (_, i) => map[unit[i % unit.length]]);
      const hide = LV === 2 ? unit.length + R(seq.length - unit.length) : seq.length - 1, ans = seq[hide];
      const o = shuffle([ans, ...[...new Set([map.A, map.B, map.C || pool[3], pool[4]])].filter(v => v !== ans).slice(0, 2)]);
      const chunks = []; for (let i = 0; i < seq.length; i += unit.length) chunks.push(seq.slice(i, i + unit.length).map((x, j) => i + j === hide ? `<span class="m-fill">${mPic(x)}</span>` : `<span>${mPic(x)}</span>`).join(''));
      return { ask: MATH_SAY.pattern, say: MATH_SAY.pattern, show: `<div class="m-seq">${seq.map((x, i) => i === hide ? '<b class="m-q">?</b>' : `<span>${mPic(x)}</span>`).join('')}</div>`, opts: o, labels: Object.fromEntries(o.map(v => [v, mPic(v)])), ans, hint: H.pattern,
        explain: `<div class="m-seq m-units">${chunks.map(c => `<span class="m-unit">${c}</span>`).join('')}</div><p class="fine">점선 한 칸이 되풀이되는 한 묶음이에요.</p>` };
    },
    // 다른 무리 찾기 (집합): 쉬움은 과일과 동물, 보통은 네 무리, 도전은 같은 무리 넷과 다른 하나
    odd() {
      const a = LV === 1 ? shuffle([0, 1, 3])[0] : shuffle([0, 1])[0], b = LV === 0 ? 1 - a : shuffle([0, 1, 2, 3].filter(x => x !== a))[0];
      const same = shuffle(ODD[a]).slice(0, LV === 2 ? 4 : 3), diff = ODD[b][R(ODD[b].length)], all = shuffle([...same, diff]);
      return { ask: MATH_SAY.odd, say: MATH_SAY.odd, show: '', opts: all, labels: Object.fromEntries(all.map(v => [v, mPic(v)])), ans: diff, hint: H.odd,
        explain: `<div class="m-viz m-groups"><span class="m-ring">${same.map(x => `<span>${mPic(x)}</span>`).join('')}<small>${ODDN[a]}</small></span><span class="m-ring alone"><span>${mPic(diff)}</span><small>${ODDN[b]}</small></span></div>` };
    },
    // 머리셈: 쉬움 10까지, 보통 20까지, 도전 50까지(두 자리 ± 한 자리)
    mental(op) {
      const add = op ? op === '+' : R(2) === 0, M = [10, 20, 50][LV]; let a, b, ans;
      if (LV === 2) { a = 11 + R(add ? 30 : 39); b = 1 + R(9); } else if (add) { a = 1 + R(M - 2); b = 1 + R(M - a); } else { a = 3 + R(M - 2); b = 1 + R(a); }
      ans = add ? a + b : a - b;
      const pic = a <= 20 ? (add ? `<div class="m-viz m-dots">${mDots(a)}<b>+</b>${mDots(b, 'b')}</div>` : `<div class="m-viz m-dots">${mDots(a - b)}${mDots(b, 'gone')}</div>`)
        : `<p class="m-eq-num">${a}${add ? ' → ' + Array.from({ length: b }, (_, k) => a + k + 1).join(', ') : ' → ' + Array.from({ length: b }, (_, k) => a - k - 1).join(', ')}</p>`;
      return { ask: `${a} ${add ? '+' : '−'} ${b} = ?`, show: '', opts: nearby(ans, 0, M, 4), ans, hint: H.mental, explain: `${pic}<p class="m-eq-num">${a} ${add ? '+' : '−'} ${b} = ${ans}</p>` };
    },
    // 곱셈: 쉬움 2·5단, 보통 2~9단, 도전은 빈 곱하는 수 찾기. 틀린 보기는 한 단 옆에서
    mul() {
      const a = LV === 0 ? [2, 5][R(2)] : 2 + R(8), b = LV === 0 ? 1 + R(5) : 2 + R(8), ans = a * b;
      const pic = `<div class="m-viz m-dgrid" style="--c:${a}">${mDots(ans)}</div><p class="m-eq-num">${a}개씩 ${b}줄 = ${ans}</p>`;
      if (LV === 2) return { ask: `${a} × ? = ${ans}`, show: '', opts: nearby(b, 1, 10, 4), ans: b, hint: H.mul, explain: pic };
      const wrong = shuffle([...new Set([a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, ans + 1, ans - 1])].filter(v => v > 0 && v !== ans)).slice(0, 3);
      return { ask: `${a} × ${b} = ?`, show: '', opts: shuffle([ans, ...wrong]), ans, hint: H.mul, explain: pic };
    },
    // 분수: 색칠한 부분 읽기, 또는 말한 분수에 맞는 그림 고르기
    frac() {
      const ds = [[2, 3, 4], [2, 3, 4, 5, 6, 8], [5, 6, 8]][LV], d = ds[R(ds.length)], n = 1 + R(d - 1), key = `${n}/${d}`;
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
        const ns = [[6, 8, 10, 12], [8, 10, 12, 14, 15, 16, 18, 20], [24, 30, 36]][LV], n = ns[R(ns.length)], mid = [...Array(n).keys()].filter(v => v > 1 && v < n);
        const ds = mid.filter(v => n % v === 0), ans = ds[R(ds.length)], wrong = shuffle(mid.filter(v => n % v)).slice(0, 3);
        return { ask: `${n}의 약수는 어느 것일까요?`, show: '', opts: shuffle([ans, ...wrong]), ans, hint: H.factor,
          explain: `${mathViz({ k: 'nums', to: n, hi: [1, ...ds, n] })}<p class="m-eq-num">${n}의 약수: ${[1, ...ds, n].join(', ')}</p>` };
      }
      const k = [[2, 3, 5], [3, 4, 5, 6, 7, 8, 9], [6, 7, 8, 9, 11, 12]][LV][R(LV === 0 ? 3 : 6)] || 3, ans = k * (2 + R(4));
      const wrong = shuffle([ans - 2, ans - 1, ans + 1, ans + 2, ans + 3].filter(v => v > 1 && v % k)).slice(0, 3), to = Math.ceil((ans + 3) / 6) * 6;
      return { ask: `${k}의 배수는 어느 것일까요?`, show: '', opts: shuffle([ans, ...wrong]), ans, hint: H.factor,
        explain: `${mathViz({ k: 'nums', to, hi: Array.from({ length: Math.floor(to / k) }, (_, i) => k * (i + 1)) })}<p class="m-eq-num">${k}의 배수: ${k}, ${k * 2}, ${k * 3}, …</p>` };
    },
    // 각: 그림을 보고 예각·직각·둔각 (도전은 직각에 가까운 각)
    angle() {
      const kind = ['예각', '직각', '둔각'][R(3)], deg = [{ 예각: [30, 45], 직각: [90], 둔각: [135, 150] }, { 예각: [30, 45, 60, 70], 직각: [90], 둔각: [110, 120, 135, 150] }, { 예각: [70, 75, 80], 직각: [90], 둔각: [100, 105, 110] }][LV][kind];
      return { ask: '어떤 각일까요?', show: `<div class="m-viz">${angSvg(deg[R(deg.length)], R(2))}</div>`, opts: ['예각', '직각', '둔각'], ans: kind, hint: H.angle,
        explain: `${mathViz({ k: 'angle', all: true })}<p class="m-eq-num">정답: ${kind}</p>` };
    },
    // 다각형: 이름 또는 변의 수
    poly() {
      const ns = [[3, 4, 5], [3, 4, 5, 6, 8], [3, 4, 5, 6, 7, 8]][LV], n = ns[R(ns.length)], show = `<div class="m-viz">${polySvg(n, COLORS[R(6)], LV ? R(60) : 0)}</div>`;
      const explain = `<div class="m-viz">${polySvg(n, '#ffd54f')}</div><p class="m-eq-num">변 ${n}개 → ${POLY[n]}</p>`;
      if (R(2)) { const o = shuffle([n, ...shuffle(ns.filter(v => v !== n)).slice(0, 2)]); return { ask: '이 도형의 이름은 무엇일까요?', show, opts: o.map(v => POLY[v]), ans: POLY[n], hint: H.poly, explain }; }
      return { ask: '변은 모두 몇 개일까요?', show, opts: shuffle([n, ...shuffle([3, 4, 5, 6, 7, 8].filter(v => v !== n)).slice(0, 2)]), ans: n, hint: H.poly, explain };
    },
    // ── 씨앗 더하기 (2026-11-27) ──
    // 쌓기나무: 칸마다 높이를 정해 그림으로 보여 주고 모두 몇 개인지. 쉬움 한 줄, 보통 2×2, 도전 3×2(빈칸도). 뒷줄·왼쪽 칸이 앞·오른쪽보다 낮지 않게 해서 꼭대기는 다 보인다
    blocks() {
      const Y = LV === 0 ? 1 : 2, X = LV === 2 ? 3 : 2 + (LV === 0 ? R(2) : 0), h = [];
      for (let y = 0; y < Y; y++) { h.push([]); for (let x = 0; x < X; x++) {
        const cap = Math.min(y ? h[y - 1][x] : 3, x ? h[y][x - 1] : 3), lo = LV === 2 && (x || y) ? 0 : 1;
        h[y].push(LV === 0 ? 1 + R(3) : !x && !y ? (LV === 2 ? 3 : 2 + R(2)) : Math.max(lo, cap - R(LV === 2 ? 3 : 2)));
      } }
      const ans = h.flat().reduce((a, b) => a + b, 0), parts = h.flat().filter(Boolean);
      return { ask: MATH_SAY.blocksAsk, say: MATH_SAY.blocksAsk, show: `<div class="m-viz">${blocksSvg(h)}</div>`, opts: nearby(ans, 1, ans + 4, 3), ans, hint: H.blocks,
        explain: `<div class="m-viz m-hmap-wrap">${blocksSvg(h, 16)}${hmap(h)}</div><p class="m-eq-num">${parts.join(' + ')} = ${ans}</p><p class="fine">위에서 본 칸마다 몇 층인지 적었어요.</p>` };
    },
    // 그림 표 읽기: 쉬움 몇 개, 보통 가장 많은·적은 것, 도전 수로 쓴 표에서 차이·모두
    table() {
      const set = R(2) ? ['🍎', '🍓', '🍌', '🍇'] : ['🐶', '🐱', '🐥', '🐟'], n = LV === 0 ? 3 : 4, items = shuffle(set).slice(0, n);
      const counts = shuffle(Array.from({ length: LV === 0 ? 5 : 7 }, (_, i) => i + 1)).slice(0, n), rows = items.map((e, i) => [e, counts[i]]);
      const u = mUnit(items[0]), nm = e => MATH_NAMES[e], show = tableHtml(rows, LV === 2 ? 'num' : 'pic');
      const kind = LV === 0 ? 'value' : LV === 1 ? ['value', 'most', 'least'][R(3)] : ['diff', 'total'][R(2)];
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
      const ans = counts.reduce((a, b) => a + b, 0), say = `모두 몇 ${u}일까요?`;
      return { ask: say, say, show, opts: nearby(ans, 4, 30, 3), ans, hint: H.table, explain: `${ex([...Array(n).keys()])}<p class="m-eq-num">${counts.join(' + ')} = ${ans}</p>` };
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
      const k = [['b', `${COLN[B]}이지만 ${jo(A, '이', '가')} 아닌 것은 몇 개일까요?`], ['a', `${jo(A, '이지만', '지만')} ${COLN[B]}이 아닌 것은 몇 ${UA}일까요?`], ['o', '어느 동그라미에도 들어가지 않는 것은 몇 개일까요?']][R(3)], ans = cnt(k[0]);
      return { ask: k[1], show: `<div class="m-viz">${full}</div>`, opts: nearby(ans, 0, 6, 3), ans, hint: H.venn, explain: `<div class="m-viz">${vennSvg(A, B, ok, k[0])}</div><p class="m-eq-num">${vName(k[0], A, B)}: ${ans}${k[0] === 'a' ? UA : '개'}</p>` };
    },
    // 막대그래프: 쉬움 그림그래프 읽기, 보통 막대 읽기·가장 많은/적은, 도전 차이·두 가지 합
    graph() {
      const fruit = R(2), set = fruit ? ['🍎', '🍓', '🍌', '🍇'] : ['🐶', '🐱', '🐥', '🐟'], n = LV === 0 ? 3 : 4, items = shuffle(set).slice(0, n);
      const counts = shuffle(Array.from({ length: LV === 0 ? 5 : 8 }, (_, i) => i + 1)).slice(0, n), rows = items.map((e, i) => [e, counts[i]]), nm = e => MATH_NAMES[e];
      const title = `우리 반 친구들이 좋아하는 ${fruit ? '과일' : '동물'}`, show = LV === 0 ? picGraph(rows, title) : barSvg(rows, [], title);
      const kind = LV === 0 ? 'value' : LV === 1 ? ['value', 'most', 'least'][R(3)] : ['diff', 'sum'][R(2)];
      if (kind === 'value') { const i = R(n); return { ask: `${jo(nm(items[i]), '을', '를')} 좋아하는 친구는 몇 명일까요?`, show, opts: nearby(counts[i], 1, 8, 3), ans: counts[i], hint: H.graph, explain: barSvg(rows, [i]) }; }
      if (kind === 'most' || kind === 'least') {
        const i = counts.indexOf(kind === 'most' ? Math.max(...counts) : Math.min(...counts));
        return { ask: `가장 ${kind === 'most' ? '많은' : '적은'} 친구가 좋아하는 것은 무엇일까요?`, show, opts: items, labels: Object.fromEntries(items.map(e => [e, mPic(e)])), ans: items[i], hint: H.graph, explain: barSvg(rows, [i]) };
      }
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
      for (let t = 0; t < 50; t++) {
        const W = 5 + R(2), H = 4 + R(2), s = [0, H - 1], g = [2 + R(W - 2), R(H - 2)], walls = [];
        if (LV === 2) while (walls.length < 3) { const k = `${R(W)},${R(H)}`; if (k !== s.join() && k !== g.join() && !walls.includes(k)) walls.push(k); }
        const p = bfs(W, H, s, g, walls); if (!p) continue;
        const ans = p.length - 1, man = Math.abs(g[0] - s[0]) + Math.abs(g[1] - s[1]);
        if (LV === 2 && ans === man && t < 30) continue; // 도전은 나무 때문에 돌아가야 하는 판을 먼저
        return { ask: '집에서 학교까지 가장 짧게 가면 몇 칸일까요?', show: `<div class="m-viz">${pathSvg({ W, H, s, g, walls })}</div>`, opts: nearby(ans, 2, 14, 3), ans, hint: MATH_HINTS.path,
          explain: `<div class="m-viz">${pathSvg({ W, H, s, g, walls, routes: [{ pts: p, col: '#ffb300' }], nums: Object.fromEntries(p.slice(1, -1).map((q, k) => [q.join(), k + 1])) })}</div><p class="m-eq-num">가장 짧은 길: ${ans}칸</p>` };
      }
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
  const setLevel = l => { LV = Math.max(0, Math.min(2, l | 0)); };
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
  return { gen, magic: magicF, sudoku: sudokuF, shuffle, pie, angSvg, polySvg, fracTxt, POLY, KN, blocksSvg, tableHtml, vennSvg, vRegion, barSvg, picGraph, pathSvg, bfs, distMap, setLevel, get level() { return LV; } };
})();

// ── 단계·주제·잠금·진행 ──
const mStage = id => MATH_STAGES.find(s => s.id === id);
const mOpen = stage => mStage(stage).free || Store.hasMath();
const mTopicOf = ({ lesson, game, topic }) => MATH_TOPICS.find(t => t.id === topic || (lesson && t.lessons.includes(lesson)) || (game && t.game === game));
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
    <ul class="perks"><li>🌱 새싹 · 더하기·빼기 · 마방진 · 스도쿠</li><li>🌳 나무 · 곱셈 · 분수 · 약수와 배수 · 각 · 다각형</li><li>📖 개념 배우기 · 🧩 퍼즐(쉬움·보통·도전) · 🖨️ 워크시트, 문제는 할 때마다 새로</li></ul>
    <div class="row-center"><button class="btn btn-ghost" data-close>나중에</button><a class="btn btn-primary" href="#/pricing" data-close>💎 요금 보기</a></div></div>`);
}

const mHome = () => {
  const done = mathDone(), lock = s => !mOpen(s.id);
  const btn = (s, href, label, ok) => lock(s) ? `<button class="btn btn-ghost sm" data-lock="${s.id}">${label}</button>` : `<a class="btn btn-ghost sm ${ok ? 'm-ok' : ''}" href="${href}">${label}${ok ? ' ✓' : ''}</a>`;
  const cardTopics = MATH_TOPICS.filter(t => MATH_STORIES[t.id]), got = cardTopics.filter(t => mSteps(t).card);
  return `<div class="wrap sec">
    <h1 class="page-title">${ico('🧮')} 새싹수학 <small class="chip">시험 중</small></h1>
    <div class="m-intro">
      <div class="card m-intro-card"><b>이렇게 배워요 · 한 주제 10분</b><p>📜 <b>천재 이야기</b> 옛날 수수께끼 듣기<br>📖 <b>배우기</b> 눌러 보고 옮겨 보기<br>🧩 <b>퍼즐</b> 쉬움·보통·도전, 할 때마다 새 문제<br>🖨️ <b>워크시트</b> 화면에서 풀고 인쇄도<br>🏅 <b>천재 카드</b> 다 마치면 한 장!</p></div>
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
          <div class="m-topic-btns">${st.story !== null ? btn(s, `#/math/s_${t.id}`, '📜 이야기', st.story) : ''}${ls.map(l => btn(s, `#/math/${l.id}`, `📖 ${ls.length > 1 ? l.title : '배우기'}`, done.includes(l.id))).join('')}${btn(s, `#/math/p_${t.game}`, '🧩 퍼즐', st.puzzle)}${btn(s, `#/math/w_${t.id}`, '🖨️ 워크시트', st.ws)}</div></div>`;
      }).join('')}</div>`).join('')}
    <p class="fine">새싹수학은 시험 중이에요. 퍼즐과 워크시트 문제는 할 때마다 새로 만들어져요. 로그인하면 진행과 천재 카드가 아이별로 저장돼서 다른 기기에서도 이어져요.</p></div>`;
};

Views.math = (el, game) => {
  KoSpeech.stop();
  // 주소: #/math/<레슨 id> · #/math/s_<주제 이야기> · #/math/p_<퍼즐> · #/math/w_<주제 워크시트> (예전 주소 #/math/count 같은 퍼즐 이름도 받는다)
  const lesson = game && MATH_LESSONS.find(l => l.id === game);
  const pzKey = game && (game.startsWith('p_') ? game.slice(2) : !lesson && MATH_GAMES[game] ? game : null);
  const wsTopic = game && game.startsWith('w_') && MATH_TOPICS.find(t => t.id === game.slice(2));
  const stTopic = game && game.startsWith('s_') && MATH_STORIES[game.slice(2)] && MATH_TOPICS.find(t => t.id === game.slice(2));
  const stage = lesson ? lesson.stage : pzKey && MATH_GAMES[pzKey] ? MATH_GAMES[pzKey].stage : (wsTopic || stTopic) ? (wsTopic || stTopic).stage : null;
  if (stage && !mOpen(stage)) { location.hash = '#/math'; return void setTimeout(() => mathUpsell(stage), 50); }
  if (lesson) return mathLesson(el, lesson);
  if (wsTopic) return mathWorksheet(el, wsTopic);
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

// ③ 퍼즐: 쉬움·보통·도전. 한 판 5문제, 처음에 다 맞히면 별
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
      <div class="row-center">${topic ? `<a class="btn btn-primary" href="#/math/w_${topic.id}">🖨️ 워크시트로 연습</a>` : ''}<button class="btn btn-ghost" data-again>한 판 더</button><a class="btn btn-ghost" href="#/math">다른 주제</a></div></div>`;
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
  const blanks = game === 'magic' ? [2, 3, 5][lv] : [4, 6, 9][lv];
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
    // 천재 이야기 그림
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

// ① 천재 이야기: 그림 + 한국어 음성, 3~4장
function mathStory(el, t) {
  const S = MATH_STORIES[t.id], first = t.lessons[0];
  let i = 0;
  el.innerHTML = `<div class="wrap sec narrow"><a class="link-btn" href="#/math">← 새싹수학</a><h1 class="page-title">📜 ${esc(t.title)} · 천재 이야기</h1>
    <div class="lesson-progress m-lprog"><div class="bar"></div></div><div class="card m-area m-story"></div></div>`;
  const area = $('.m-area', el), bar = $('.m-lprog .bar', el);
  const show = () => {
    const pg = S.pages[i], last = i === S.pages.length - 1;
    bar.style.width = `${Math.round((i + 1) / S.pages.length * 100)}%`;
    area.innerHTML = `<p class="m-prog">${i + 1} / ${S.pages.length}</p>${mathViz(pg.viz)}<p class="m-text">${esc(pg.text)}</p>${mSayBtns(pg.text)}
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
      <div class="row-center">${more ? `<a class="btn btn-primary" href="#/math/${more}">📖 ${MATH_LESSONS.find(l => l.id === more).title}</a>` : ''}${tp ? `<a class="btn ${more ? 'btn-ghost' : 'btn-primary'}" href="#/math/p_${tp.game}">🧩 퍼즐로 해 보기</a>` : ''}</div>
      <div class="row-center"><a class="btn btn-ghost" href="#/math">다른 주제</a><button class="btn btn-ghost" data-again>처음부터 다시</button></div></div>`;
    $('[data-again]', area).onclick = () => mathLesson(el, L);
  };
  const ready = (nb, line) => { nb.disabled = false; Speech.sfx.correct(); if (line) setTimeout(() => KoSpeech.say(line), 500); };
  const show = () => {
    if (i >= L.steps.length) return finish();
    const st = L.steps[i]; bar.style.width = `${Math.round(i / L.steps.length * 100)}%`;
    const tag = { learn: '📖 배워요', tap: '👆 눌러 봐요', corners: '👆 눌러 봐요', sort: '🧺 옮겨 봐요', extend: '🔁 채워 봐요', build: '🧱 쌓아 봐요', tally: '📊 표를 만들어요', bars: '📈 그래프를 만들어요', walk: '🚶 걸어 봐요', write: '✏️ 따라 써요', quiz: '❓ 확인해요', play: '🧩 해 봐요' }[st.type];
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
    } else if (st.type === 'write') {
      area.innerHTML = `${head}<h2 class="m-ask">「${esc(st.glyph)}」 따라 쓰기</h2>${mSayBtns(st.say)}<div class="m-write"></div>`;
      mWireSay(area); KoSpeech.say(st.say); mathTrace($('.m-write', area), st.glyph, () => setTimeout(next, 500));
    } else if (st.type === 'quiz') {
      MathGen.setLevel(L.stage === 'seed' ? 0 : 1);
      mathAsk(area, MathGen.gen[st.gen](...(st.args || [])), { head, onRight: next });
    } else if (st.type === 'play') {
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p>${mSayBtns(st.text)}<div class="row-center"><a class="btn btn-ghost" href="#/math/p_${st.game}">🧩 퍼즐 하러 가기</a><button class="btn btn-primary" data-next>레슨 마치기</button></div>`;
      mWireSay(area); KoSpeech.say(st.text); $('[data-next]', area).onclick = next;
    }
  };
  show();
}

// ④ 워크시트: 화면에서 풀고(1번 틀리면 힌트, 2번은 그림 풀이), 인쇄도 한다(A4, 이름·날짜, 정답은 다음 장)
function mathWorksheet(el, t) {
  const s = mStage(t.stage), w = t.ws, p = Store.profile(), NUM = ['①', '②', '③', '④', '⑤'];
  let qs = [], miss = [], solved = [], first = 0;
  const lv = t.stage === 'seed' ? 0 : 1;
  const make = () => {
    let probs, answers;
    if (w.grid) {
      // 마방진·스도쿠: 빈칸 있는 판을 n개, 정답은 작은 판으로 (화면에서는 🧩 퍼즐로 푼다)
      const pzs = Array.from({ length: w.n }, () => w.grid === 'magic' ? MathGen.magic(3 + (Math.random() < .5 ? 1 : 0)) : MathGen.sudoku(6 + Math.floor(Math.random() * 3)));
      const board = (pz, sol) => `<div class="mws-grid ${w.grid}" style="--n:${pz.size}">${pz.sol.map((v, i) => `<span class="${pz.holes.includes(i) ? (sol ? 'ans' : 'hole') : ''}">${pz.holes.includes(i) && !sol ? '' : v}</span>`).join('')}</div>`;
      probs = pzs.map((pz, i) => `<div class="mws-q"><b>${i + 1}.</b> ${w.grid === 'magic' ? '세 수의 합이 모두 15가 되게 채워요' : '줄마다 1·2·3·4가 한 번씩'}${board(pz)}</div>`);
      answers = pzs.map((pz, i) => `<div class="mws-a"><b>${i + 1}.</b>${board(pz, true)}</div>`);
    } else {
      MathGen.setLevel(lv);
      const seen = new Set(); qs = [];
      for (let k = 0; qs.length < w.n && k < w.n * 20; k++) { const q = MathGen.gen[w.gen](...(w.args || [])), key = q.ask + q.show + q.opts.join(); if (!seen.has(key)) { seen.add(key); qs.push(q); } }
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
    <div class="no-print row"><a class="link-btn" href="#/math">← 새싹수학</a><button class="btn btn-ghost" data-new>🔄 새 문제</button><button class="btn btn-ghost" data-ans>👀 정답 보기</button><button class="btn btn-primary" data-print>🖨️ 워크시트 인쇄</button></div>
    <p class="no-print fine">화면에서 보기를 눌러 풀 수 있어요. 정답은 화면에서는 가려 두고, 인쇄하거나 PDF로 저장하면 다음 장에 나와요.</p>
    <p class="no-print mws-score" aria-live="polite"></p>
    <article class="worksheet m-ws">
      <header><b><img class="logo-inline" src="img/logo.svg" alt=""> 새싹스쿨 · 새싹수학 워크시트</b><span>${s.icon} ${s.name} 단계 · ${esc(t.title)}</span><span>이름: ${p ? esc(p.name) : '________'} &nbsp; 날짜: ________</span></header>
      <h3>1. 알아 두어요</h3><p class="mws-sum">${esc(w.sum)}</p>
      <h3>2. 따라 써 보세요</h3>
      <div class="mws-trace ${w.trace.every(x => x.length <= 3) && w.trace.length > 3 ? 'short' : ''}">${w.trace.map(x => `<div class="ws-trace"><span class="dotted">${esc(x)} &nbsp; ${esc(x)} &nbsp; ${esc(x)}</span><span class="line"></span></div>`).join('')}</div>
      <h3>3. 문제를 풀어요 <small>${w.grid ? '' : '알맞은 것에 ○ 해요'}</small></h3>
      <div class="mws-probs ${w.grid ? 'grids' : ''}"></div>
      <footer>참 잘했어요! 스티커를 붙여요 → ☐</footer>
      <section class="mws-ans-page"><h3>정답 <small>${esc(t.title)}</small></h3><div class="mws-answers ${w.grid ? 'grids' : ''}"></div></section>
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
  $('[data-new]', el).onclick = () => { Speech.sfx.tap(); make(); };
  $('[data-ans]', el).onclick = e => { const on = $('.m-ws', el).classList.toggle('show-ans'); e.target.textContent = on ? '🙈 정답 가리기' : '👀 정답 보기'; };
  $('[data-print]', el).onclick = () => { if (w.grid) mMark(t, 'ws'); window.print(); };
}
