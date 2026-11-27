/* 새싹수학 새 주제 (2026-11-27): 선대칭 · 소수 · 부피
 * 생각 놀이 문제(MathGen.gen.sym/dec/vol), 그림(mathViz: sym · dec · line · cuboid), 🤲 해 보기(MATH_ACTS)
 * 「프랑스 원리 수학」1·2권 차례에서 주제만 골랐고, 그림·문제는 모두 새로 만든다 */
Object.assign(MATH_GAMES, {
  sym: { icon: '🦋', title: '선대칭 생각 놀이', stage: 'sprout', c: '#9575cd', hub: '반쪽을 보고 나머지 찾기' },
  dec: { icon: '📏', title: '소수 생각 놀이', stage: 'tree', c: '#64b5f6', hub: '0.1이 몇 개일까' },
  vol: { icon: '📦', title: '부피 생각 놀이', stage: 'tree', c: '#ffb74d', hub: '쌓기나무로 부피 재기' },
});

const MM = (() => {
  const R = n => Math.floor(Math.random() * n), shuffle = MathGen.shuffle, LV = () => MathGen.level;
  const nearby = (ans, lo, hi, n = 3) => { const s = new Set([ans]); for (let k = 0; s.size < n && k < 60; k++) { const v = ans + (R(7) - 3); if (v >= lo && v <= hi) s.add(v); } for (let v = lo; s.size < n; v++) s.add(v); return shuffle([...s]); };
  const key = c => c.map(p => p.join(',')).sort().join(';');

  // ── 선대칭: W×H 칸 판, 세로 대칭축(가운데) 또는 가로 대칭축 ──
  // half: 축 한쪽의 칠한 칸들 [x,y] (세로축이면 x < W/2). 축에 닿는 칸에서 시작해 이웃 칸으로 자라게 해서 한 덩어리가 되게 한다
  const growHalf = (W, H, n, axis) => {
    const hw = axis === 'v' ? W / 2 : W, hh = axis === 'v' ? H : H / 2;
    const start = axis === 'v' ? [hw - 1, R(H)] : [R(W), hh - 1], c = [start];
    for (let t = 0; c.length < n && t < 400; t++) {
      const [x, y] = c[R(c.length)], [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][R(4)], nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < hw && ny < hh && !c.some(p => p[0] === nx && p[1] === ny)) c.push([nx, ny]);
    }
    return c;
  };
  const mirror = (c, W, H, axis) => c.map(([x, y]) => axis === 'v' ? [W - 1 - x, y] : [x, H - 1 - y]);
  const shiftOver = (c, W, H, axis) => c.map(([x, y]) => axis === 'v' ? [x + W / 2, y] : [x, y + H / 2]);
  const symSvg = ({ W, H, a = [], b = [], axis = 'v', ca = '#9575cd', cb = '#ce93d8', s = 24, q = false }) => {
    const cell = ([x, y], col) => `<rect x="${x * s}" y="${y * s}" width="${s}" height="${s}" fill="${col}" stroke="#3a2d4f" stroke-width="1.5"/>`;
    const grid = Array.from({ length: W * H }, (_, i) => `<rect x="${(i % W) * s}" y="${Math.floor(i / W) * s}" width="${s}" height="${s}" fill="#fff" stroke="#d6cfe0" stroke-width="1"/>`).join('');
    const ax = axis === 'v' ? `<line x1="${W * s / 2}" y1="-6" x2="${W * s / 2}" y2="${H * s + 6}" stroke="#e53935" stroke-width="3" stroke-dasharray="7 5"/>` : `<line x1="-6" y1="${H * s / 2}" x2="${W * s + 6}" y2="${H * s / 2}" stroke="#e53935" stroke-width="3" stroke-dasharray="7 5"/>`;
    const qm = q ? (axis === 'v' ? `<text x="${W * s * 0.75}" y="${H * s / 2 + 9}" text-anchor="middle" font-size="26" font-weight="700" fill="#b0a6c0">?</text>` : `<text x="${W * s / 2}" y="${H * s * 0.75 + 9}" text-anchor="middle" font-size="26" font-weight="700" fill="#b0a6c0">?</text>`) : '';
    return `<svg viewBox="-8 -8 ${W * s + 16} ${H * s + 16}" class="m-sym" style="width:${W * s + 16}px" aria-label="선대칭 판">${grid}${a.map(p => cell(p, ca)).join('')}${b.map(p => cell(p, cb)).join('')}${ax}${qm}</svg>`;
  };
  // 이야기·배우기용 고정 그림
  const BF = [[2, 0], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2], [1, 3], [2, 3], [2, 4], [1, 5], [2, 5]];
  const symFixed = s => s === 'half' ? symSvg({ W: 6, H: 6, a: BF, q: true }) : symSvg({ W: 6, H: 6, a: BF, b: s === 'full' ? mirror(BF, 6, 6, 'v') : [], ...(s === 'bfly' ? { b: mirror(BF, 6, 6, 'v'), cb: '#9575cd' } : {}) });
  // 정다각형·도형의 대칭축 수 (도전)
  const AXES = [['정삼각형', 3, 3], ['정사각형', 4, 4], ['정오각형', 5, 5], ['정육각형', 6, 6]];

  const gen = {
    sym() {
      const lv = LV();
      if (lv === 3) {
        const [name, n, ans] = AXES[R(AXES.length)];
        return { ask: `${name}에는 대칭축이 몇 개 있을까요?`, show: `<div class="m-viz">${MathGen.polySvg(n, '#ce93d8', 0)}</div>`, opts: shuffle([ans, ...shuffle([1, 2, 3, 4, 5, 6, 8].filter(v => v !== ans)).slice(0, 2)]), ans, hint: MATH_HINTS.sym,
          explain: `<div class="m-viz">${MathGen.polySvg(n, '#ffd54f', 0)}</div><p class="m-eq-num">반으로 접어 꼭 맞는 선을 모두 찾으면 ${ans}개예요. 변과 각이 모두 같은 도형은 변의 수만큼 대칭축이 있어요.</p>` };
      }
      const axis = lv === 2 ? 'h' : 'v', W = lv === 0 ? 4 : 6, H = lv === 0 ? 4 : axis === 'h' ? 6 : 5, n = lv === 0 ? 3 : lv === 1 ? 5 : 6;
      let half, right, wrong1, wrong2;
      for (let t = 0; t < 50; t++) {
        half = growHalf(W, H, n, axis); right = mirror(half, W, H, axis); wrong1 = shiftOver(half, W, H, axis);
        if (key(wrong1) !== key(right)) break;
      }
      // 한 칸만 다른 반쪽
      wrong2 = right.map(p => [...p]);
      for (let t = 0; t < 60; t++) {
        const i = R(wrong2.length), [x, y] = wrong2[i], d = [[1, 0], [-1, 0], [0, 1], [0, -1]][R(4)], nx = x + d[0], ny = y + d[1];
        const ok = axis === 'v' ? nx >= W / 2 && nx < W && ny >= 0 && ny < H : ny >= H / 2 && ny < H && nx >= 0 && nx < W;
        if (ok && !wrong2.some(p => p[0] === nx && p[1] === ny)) { wrong2[i] = [nx, ny]; break; }
      }
      const sets = { a: right, b: wrong1, c: wrong2 }, opts = shuffle(['a', 'b', 'c']).filter((k, i, arr) => arr.findIndex(z => key(sets[z]) === key(sets[k])) === i);
      if (opts.length < 3) return gen.sym();
      const s = lv === 0 ? 20 : 15;
      return { ask: lv === 0 ? '빨간 선으로 접으면 꼭 맞는 그림을 골라요' : '반쪽을 보고, 선대칭이 되게 완성한 그림을 골라요', show: `<div class="m-viz">${symSvg({ W, H, a: half, axis, q: true })}</div>`,
        opts, labels: Object.fromEntries(opts.map(k => [k, symSvg({ W, H, a: half, b: sets[k], axis, s })])), ans: 'a', hint: MATH_HINTS.sym,
        explain: `<div class="m-viz">${symSvg({ W, H, a: half, b: right, axis })}</div><p class="fine">빨간 선에서 떨어진 칸 수가 양쪽이 똑같아요.</p>` };
    },
    // 소수: 쉬움 색칠한 조각 → 0.□, 보통 1.□ · 0.1이 몇 개, 어려움 수직선, 도전 크기 비교·덧셈
    dec() {
      const lv = LV(), f = n => n % 10 ? (n / 10).toFixed(1) : String(n / 10); // 0.1이 열 개면 1.0이 아니라 1
      if (lv === 0 || (lv === 1 && R(2))) {
        const n = lv === 0 ? 1 + R(9) : 11 + R(9), ans = f(n);
        const o = shuffle([ans, ...shuffle([...new Set([f(n + 1), f(n - 1), f(n % 10 ? (Math.floor(n / 10) * 10 + 10 - n % 10) : n + 2), String(n % 10 || n)])].filter(v => v !== ans && +v > 0)).slice(0, 2)]);
        return { ask: '색칠한 부분을 소수로 나타내면 얼마일까요?', show: decSvg(n), opts: o, ans, hint: MATH_HINTS.dec, explain: `${decSvg(n)}<p class="m-eq-num">0.1이 ${n}개 → ${ans}</p>` };
      }
      if (lv === 1) {
        const n = 2 + R(17), ans = f(n);
        return { ask: `0.1이 ${n}개면 얼마일까요?`, show: '', opts: shuffle([ans, ...shuffle([f(n + 10 > 19 ? n - 1 : n + 10), String(n), f(n + 1)].filter(v => v !== ans)).slice(0, 2)]), ans, hint: MATH_HINTS.dec, explain: `${decSvg(n)}<p class="m-eq-num">0.1 × ${n} = ${ans}</p>` };
      }
      if (lv === 2) {
        const at = 1 + R(19), ans = f(at);
        return { ask: '화살표가 가리키는 수는 얼마일까요?', show: lineSvg(at, 20), opts: shuffle([ans, ...shuffle([f(at + 1), f(at - 1), f(at + 2)].filter(v => v !== ans && +v >= 0)).slice(0, 2)]), ans, hint: MATH_HINTS.dec,
          explain: `${lineSvg(at, 20, true)}<p class="m-eq-num">한 칸은 0.1 · ${at}칸 → ${ans}</p>` };
      }
      if (R(2)) {
        let a = 1 + R(19), b = 1 + R(19); while (b === a) b = 1 + R(19);
        const ans = f(Math.max(a, b));
        return { ask: '더 큰 수를 골라요', show: '', opts: shuffle([f(a), f(b)]), ans, hint: MATH_HINTS.dec, explain: `${decSvg(a)}${decSvg(b)}<p class="m-eq-num">${f(Math.max(a, b))} > ${f(Math.min(a, b))}</p>` };
      }
      const a = 1 + R(9), b = 1 + R(9), ans = f(a + b);
      return { ask: `${f(a)} + ${f(b)} = ?`, show: '', opts: shuffle([ans, ...shuffle([f(a + b + 1), f(a + b - 1), `0.${a + b}`].filter(v => v !== ans && v !== '0.0')).slice(0, 2)]), ans, hint: MATH_HINTS.dec,
        explain: `${decSvg(a + b)}<p class="m-eq-num">0.1이 ${a}개 + ${b}개 = ${a + b}개 → ${ans}</p>` };
    },
    // 부피: 쉬움 한 층, 보통 2층, 어려움 한 층 개수×층 수, 도전 어느 상자가 더 클까
    vol() {
      const lv = LV();
      if (lv === 3) {
        const A = [2 + R(3), 2 + R(2), 1 + R(3)]; let B; do B = [2 + R(3), 2 + R(2), 1 + R(3)]; while (B[0] * B[1] * B[2] === A[0] * A[1] * A[2]);
        const va = A[0] * A[1] * A[2], vb = B[0] * B[1] * B[2], ans = va > vb ? '가' : '나';
        return { ask: '부피가 더 큰 상자를 골라요', show: `<div class="m-viz m-b10cmp"><figure>${cub(...A, 16)}<figcaption>가</figcaption></figure><figure>${cub(...B, 16)}<figcaption>나</figcaption></figure></div>`, opts: ['가', '나'], ans, hint: MATH_HINTS.vol,
          explain: `<p class="m-eq-num">가: ${A.join(' × ')} = ${va}</p><p class="m-eq-num">나: ${B.join(' × ')} = ${vb}</p>` };
      }
      const l = 2 + R(lv ? 3 : 2), w = 1 + R(lv ? 2 : 2) + (lv ? 1 : 0), h = lv === 0 ? 1 : lv === 1 ? 2 : 2 + R(2), ans = l * w * h;
      if (lv === 2 && R(2)) return { ask: `한 층에 ${l * w}개씩 ${h}층을 쌓으면 모두 몇 개일까요?`, show: '', opts: nearby(ans, 4, 60, 3), ans, hint: MATH_HINTS.vol, explain: `<div class="m-viz">${cub(l, w, h)}</div><p class="m-eq-num">${l * w} × ${h} = ${ans}</p>` };
      return { ask: '쌓기나무는 모두 몇 개일까요?', show: `<div class="m-viz">${cub(l, w, h)}</div>`, opts: nearby(ans, 2, 60, 3), ans, hint: MATH_HINTS.vol,
        explain: `<div class="m-viz">${cub(l, w, h)}</div><p class="m-eq-num">${l} × ${w} = ${l * w}${h > 1 ? `, ${l * w} × ${h} = ${ans}` : ''}</p>` };
    },
  };
  // 소수 막대: 10칸짜리 막대를 n칸까지 칠한다 (10칸이 넘으면 막대 둘)
  function decSvg(n) {
    const bars = Math.max(1, Math.ceil(n / 10)), s = 22;
    return `<div class="m-viz"><svg viewBox="-2 -2 ${10 * s + 4} ${bars * (s + 10)}" class="m-dec" style="width:${10 * s + 4}px" aria-label="10칸 중 칠한 칸 ${n}개">${Array.from({ length: bars }, (_, b) => Array.from({ length: 10 }, (_, i) => `<rect x="${i * s}" y="${b * (s + 10)}" width="${s}" height="${s}" fill="${b * 10 + i < n ? '#8d6e63' : '#fff8e1'}" stroke="#3a2d4f" stroke-width="1.5" rx="2"/>`).join('')).join('')}</svg></div>`;
  }
  // 수직선 0~max/10, at칸에 화살표
  function lineSvg(at, max = 10, labels = false) {
    const s = max > 10 ? 15 : 26, W = max * s;
    const ticks = Array.from({ length: max + 1 }, (_, i) => `<line x1="${i * s}" y1="${i % 10 ? 30 : 24}" x2="${i * s}" y2="${i % 10 ? 42 : 48}" stroke="#3a2d4f" stroke-width="${i % 10 ? 1.5 : 2.5}"/>${i % 10 === 0 ? `<text x="${i * s}" y="66" text-anchor="middle" font-size="15" font-weight="700">${i / 10}</text>` : labels && i === at ? `<text x="${i * s}" y="66" text-anchor="middle" font-size="12" fill="#e53935" font-weight="700">${(i / 10).toFixed(1)}</text>` : ''}`).join('');
    return `<div class="m-viz"><svg viewBox="-14 0 ${W + 28} 72" class="m-line" style="width:${W + 28}px" aria-label="수직선"><line x1="0" y1="36" x2="${W}" y2="36" stroke="#3a2d4f" stroke-width="2.5"/>${ticks}<path d="M${at * s} 28 l-7 -14 h14 z" fill="#e53935"/></svg></div>`;
  }
  const cub = (l, w, h, s = 26) => MathGen.blocksSvg(Array.from({ length: w }, () => Array(l).fill(h)), s);
  return { gen, symSvg, symFixed, decSvg, lineSvg, cub, mirror, growHalf, key };
})();
Object.assign(MathGen.gen, MM.gen);

// 그림: 새 주제의 viz 종류를 더한다
{
  const base = mathViz;
  mathViz = v => {
    if (!v) return '';
    if (v.k === 'sym') return `<div class="m-viz">${MM.symFixed(v.s)}</div>`;
    if (v.k === 'dec') return MM.decSvg(v.n);
    if (v.k === 'line') return MM.lineSvg(v.at, v.max || 10, true);
    if (v.k === 'cuboid') return `<div class="m-viz">${v.top ? MM.cub(v.l, v.w, 1) : MM.cub(v.l, v.w, v.h)}</div>`;
    return base(v);
  };
}

// ── 🤲 선대칭 해 보기: 빨간 축 반대쪽 칸을 눌러 칠해 반쪽을 완성한다. 자유 놀이는 한쪽만 눌러도 거울처럼 양쪽이 칠해진다 ──
MATH_ACTS.sym = {
  missions: [
    { text: '빨간 선이 대칭축이에요. 오른쪽 칸을 눌러서 왼쪽과 똑같이 마주 보게 칠해 봐요.', W: 4, H: 4, half: [[1, 0], [0, 1], [1, 1], [1, 2]], axis: 'v' },
    { text: '이번에는 조금 더 큰 그림이에요. 오른쪽을 칠해서 선대칭 모양을 완성해 봐요.', W: 6, H: 5, half: [[2, 0], [1, 1], [2, 1], [0, 2], [2, 2], [2, 3], [1, 4]], axis: 'v' },
    { text: '대칭축이 가로로 누웠어요. 아래쪽 칸을 칠해서 위쪽과 마주 보게 해 봐요.', W: 5, H: 6, half: [[2, 0], [1, 1], [2, 1], [3, 1], [0, 2], [2, 2], [4, 2]], axis: 'h' },
  ],
  free: { text: '거울 놀이예요. 왼쪽 칸을 누르면 오른쪽에도 똑같이 칠해져요. 멋진 무늬를 만들어 봐요.', W: 8, H: 6, half: [], axis: 'v', open: true },
  mount(box, m, api) {
    const { W, H, axis } = m, s = Math.min(38, Math.floor(300 / W)), want = MM.key(MM.mirror(m.half, W, H, axis));
    let half = m.half.map(p => [...p]), mine = [];
    const isHalf = (x, y) => axis === 'v' ? x < W / 2 : y < H / 2;
    box.innerHTML = `<div class="m-act-sym"></div><div class="row-center"><button class="btn btn-ghost sm" data-clear>🧽 칸 비우기</button></div>`;
    const draw = () => {
      const all = m.open ? [...half, ...MM.mirror(half, W, H, axis)] : half;
      $('.m-act-sym', box).innerHTML = MM.symSvg({ W, H, a: all, b: m.open ? [] : mine, axis, s, ca: '#9575cd', cb: '#ce93d8' }).replace('<svg ', '<svg data-board ');
      const svg = $('[data-board]', box);
      svg.onclick = e => {
        const p = mSvgPt(svg, e), x = Math.floor(p.x / s), y = Math.floor(p.y / s);
        if (x < 0 || y < 0 || x >= W || y >= H) return;
        if (m.open) { if (!isHalf(x, y)) return Speech.sfx.wrong(); const i = half.findIndex(q => q[0] === x && q[1] === y); i >= 0 ? half.splice(i, 1) : half.push([x, y]); }
        else { if (isHalf(x, y)) { api.status('이쪽은 이미 그려져 있어요. 빨간 선 건너편을 눌러요.'); return Speech.sfx.wrong(); } const i = mine.findIndex(q => q[0] === x && q[1] === y); i >= 0 ? mine.splice(i, 1) : mine.push([x, y]); }
        Speech.sfx.tap(); draw();
      };
      if (m.open) return api.status(' ');
      if (MM.key(mine) === want) api.done('꼭 맞아요! 빨간 선으로 접으면 양쪽이 딱 겹쳐요.');
      else { api.undo(); api.status(mine.length ? `칠한 칸 ${mine.length}개 · 왼쪽과 마주 보는지 확인해 봐요` : ' '); }
    };
    $('[data-clear]', box).onclick = () => { if (m.open) half = []; mine = []; Speech.sfx.tap(); draw(); };
    draw();
  },
};

// ── 🤲 소수 해 보기: 초콜릿 조각(0.1)을 눌러 칠해 소수를 만든다 ──
MATH_ACTS.dec = {
  missions: [
    { text: '초콜릿 한 조각은 0.1이에요. 조각을 눌러서 0.4를 만들어 봐요.', goal: 4 },
    { text: '0.7을 만들어 봐요. 몇 조각을 칠하면 될까요?', goal: 7 },
    { text: '초콜릿 하나를 다 채우면 1이에요. 1.3을 만들어 봐요.', goal: 13 },
    { text: '절반은 0.5예요. 초콜릿의 절반만 칠해 봐요.', goal: 5 },
  ],
  free: { text: '조각을 마음대로 칠하며 소수를 만들어 봐요.', open: true },
  mount(box, m, api) {
    let n = 0;
    box.innerHTML = `<div class="m-act-dec"></div><p class="m-act-eq"></p><div class="row-center"><button class="btn btn-ghost sm" data-c="-1">➖ 한 조각 빼기</button><button class="btn btn-ghost sm" data-clear>🧽 칸 비우기</button></div>`;
    const draw = () => {
      $('.m-act-dec', box).innerHTML = `<div class="m-dec-bars">${[0, 1].map(b => `<div class="m-dec-bar">${Array.from({ length: 10 }, (_, i) => `<button class="m-dec-p${b * 10 + i < n ? ' on' : ''}" data-i="${b * 10 + i}" aria-label="${b * 10 + i + 1}번째 조각"></button>`).join('')}</div>`).join('')}</div>`;
      $('.m-act-eq', box).innerHTML = `0.1이 <b>${n}</b>개 → <b>${(n / 10).toFixed(1)}</b>`;
      $$('.m-dec-p', box).forEach(b => b.onclick = () => { const i = +b.dataset.i; n = i < n ? i : i + 1; Speech.sfx.tap(); draw(); });
      if (m.open) return api.status(n === 10 ? '열 조각이 다 차면 1이에요!' : ' ');
      if (n === m.goal) api.done({ 4: '0.4! 0.1이 네 개예요.', 7: '0.7! 0.1이 일곱 개예요.', 13: '1.3! 하나를 다 채우고 세 조각 더예요.', 5: '0.5! 열 조각 중 다섯 조각, 딱 절반이에요.' }[m.goal]);
      else { api.undo(); api.status(' '); }
    };
    $('[data-c]', box).onclick = () => { if (n > 0) { n--; Speech.sfx.tap(); draw(); } };
    $('[data-clear]', box).onclick = () => { n = 0; Speech.sfx.tap(); draw(); };
    draw();
  },
};

// ── 🤲 부피 해 보기: 가로·세로·높이를 늘리고 줄여 상자 모양으로 쌓기나무를 쌓는다 ──
MATH_ACTS.vol = {
  missions: [
    { text: '바닥에 쌓기나무를 가로 세 개, 세로 두 개로 깔아 봐요. 높이는 한 층이에요.', goal: [3, 2, 1] },
    { text: '이제 똑같은 층을 하나 더 올려서 두 층으로 만들어 봐요. 모두 몇 개일까요?', goal: [3, 2, 2] },
    { text: '쌓기나무 스물네 개로 상자 모양을 만들어 봐요. 가로, 세로, 높이를 바꿔 봐요.', vol: 24 },
  ],
  free: { text: '가로, 세로, 높이를 마음대로 바꾸며 부피를 재어 봐요.', open: true },
  mount(box, m, api) {
    const d = { l: 1, w: 1, h: 1 }, NM = { l: '가로', w: '세로', h: '높이' };
    box.innerHTML = `<div class="m-act-vol"></div><p class="m-act-eq"></p><div class="m-vol-ctl">${['l', 'w', 'h'].map(k => `<div class="row-center"><b>${NM[k]}</b><button class="btn btn-ghost sm" data-k="${k}" data-d="-1">➖</button><span data-v="${k}"></span><button class="btn btn-ghost sm" data-k="${k}" data-d="1">➕</button></div>`).join('')}</div>`;
    const draw = () => {
      const v = d.l * d.w * d.h;
      $('.m-act-vol', box).innerHTML = `<div class="m-viz">${MM.cub(d.l, d.w, d.h, 24)}</div>`;
      ['l', 'w', 'h'].forEach(k => { $(`[data-v="${k}"]`, box).textContent = d[k]; });
      $('.m-act-eq', box).innerHTML = `${d.l} × ${d.w} × ${d.h} = <b>${v}</b>개`;
      if (m.open) return api.status(' ');
      const ok = m.goal ? d.l === m.goal[0] && d.w === m.goal[1] && d.h === m.goal[2] : v === m.vol;
      if (ok) api.done(m.goal ? (m.goal[2] === 1 ? '한 층에 3 곱하기 2, 여섯 개예요!' : '여섯 개씩 두 층, 열두 개예요! 층 수를 곱하면 돼요.') : '스물네 개! 가로, 세로, 높이를 곱해서 24가 되면 모두 정답이에요.');
      else { api.undo(); api.status(' '); }
    };
    $$('[data-k]', box).forEach(b => b.onclick = () => { const k = b.dataset.k, nv = d[k] + +b.dataset.d; if (nv < 1 || nv > 5) return Speech.sfx.wrong(); d[k] = nv; Speech.sfx.tap(); draw(); });
    draw();
  },
};
