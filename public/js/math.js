/* 새싹수학 퍼즐 놀이 (시험, 2026-11-26)
 * 「천재들이 만든 수학퍼즐」의 주제 이름만 참고하고, 문제는 모두 화면이 매번 새로 만든다 (책 내용은 쓰지 않는다. docs/MATH-TOPICS.md)
 * 한 판 = 5문제. 다 맞히면 별(하루 5개까지, 프로필이 있을 때만) */
const MATH_GAMES = {
  count: { icon: '🍎', title: '수 세기', age: '5~6세', c: '#ff8a65', hub: '그림을 세어 몇 개인지 골라요' },
  shape: { icon: '🔷', title: '모양 찾기', age: '5~6세', c: '#4db6ac', hub: '세모·네모·동그라미를 찾아요' },
  pattern: { icon: '🔁', title: '다음에 올 것', age: '5~6세', c: '#9575cd', hub: '규칙을 찾아 빈칸을 채워요' },
  mental: { icon: '⚡', title: '빠른 머리셈', age: '7~8세', c: '#64b5f6', hub: '20까지 더하기·빼기' },
  magic: { icon: '✨', title: '마방진', age: '7~8세', c: '#f06292', hub: '가로·세로·대각선 합이 모두 15' },
  sudoku: { icon: '🔢', title: '4×4 스도쿠', age: '7~8세', c: '#aed581', hub: '줄마다 1·2·3·4가 한 번씩' },
};
const MathGen = (() => {
  const R = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const nearby = (ans, lo, hi, n = 3) => { const s = new Set([ans]); let k = 0; while (s.size < n && k++ < 50) { const v = ans + (R(5) - 2) || ans + 3; if (v >= lo && v <= hi) s.add(v); } for (let v = lo; s.size < n; v++) s.add(v); return shuffle([...s]); };
  const THINGS = ['🍎', '🐥', '⭐', '🌸', '🚗', '🎈', '🐟', '🍓', '🐶', '⚽'];
  const SHAPES = {
    tri: ['세모', '<polygon points="50,8 94,90 6,90"/>'],
    sq: ['네모', '<rect x="12" y="12" width="76" height="76" rx="4"/>'],
    circ: ['동그라미', '<circle cx="50" cy="50" r="42"/>'],
  };
  const COLORS = ['#ff8a65', '#4db6ac', '#9575cd', '#64b5f6', '#f06292', '#ffd54f'];
  const svg = (k, col, rot = 0) => `<svg viewBox="0 0 100 100" class="m-shape" aria-label="${SHAPES[k][0]}"><g fill="${col}" stroke="#3a2d4f" stroke-width="5" transform="rotate(${rot} 50 50)">${SHAPES[k][1]}</g></svg>`;
  const gen = {
    count() { const n = 1 + R(10), e = THINGS[R(THINGS.length)]; return { ask: `${e}는 몇 개일까요?`, show: `<div class="m-count">${Array(n).fill(`<span>${e}</span>`).join('')}</div>`, opts: nearby(n, 1, 10), ans: n }; },
    shape() {
      const keys = Object.keys(SHAPES), want = keys[R(3)], cols = shuffle(COLORS);
      const opts = shuffle(keys).map((k, i) => ({ k, html: svg(k, cols[i], k === 'tri' ? [0, 15, -15][R(3)] : R(30)) }));
      return { ask: `${SHAPES[want][0]}를 골라요`, show: '', opts: opts.map(o => o.k), labels: Object.fromEntries(opts.map(o => [o.k, o.html])), ans: want };
    },
    pattern() {
      const unit = [['A', 'B'], ['A', 'A', 'B'], ['A', 'B', 'C'], ['A', 'B', 'B']][R(4)], pool = shuffle(['🍎', '🍌', '🍇', '⭐', '🌙', '❤️', '🐶', '🐱', '🔺', '🔵']);
      const map = { A: pool[0], B: pool[1], C: pool[2] }, seq = Array.from({ length: unit.length * 2 + 2 }, (_, i) => map[unit[i % unit.length]]);
      const hide = seq.length - 1, ans = seq[hide];
      return { ask: '빈칸에 올 것을 골라요', show: `<div class="m-seq">${seq.map((x, i) => i === hide ? '<b class="m-q">?</b>' : `<span>${x}</span>`).join('')}</div>`, opts: shuffle([ans, ...[...new Set([map.A, map.B, map.C || pool[3], pool[4]])].filter(v => v !== ans).slice(0, 2)]), ans };
    },
    mental() {
      const add = R(2) === 0; let a, b, ans;
      if (add) { a = 1 + R(12); b = 1 + R(20 - a); ans = a + b; } else { a = 5 + R(16); b = 1 + R(a); ans = a - b; }
      return { ask: `${a} ${add ? '+' : '−'} ${b} = ?`, show: '', opts: nearby(ans, 0, 20, 4), ans };
    },
  };
  // 3×3 마방진: 1~9로 합이 15. 기본판을 돌리고 뒤집어 8가지 중 하나, 빈칸 3~4개
  const BASE = [2, 7, 6, 9, 5, 1, 4, 3, 8];
  const rot = g => [6, 3, 0, 7, 4, 1, 8, 5, 2].map(i => g[i]), flip = g => [2, 1, 0, 5, 4, 3, 8, 7, 6].map(i => g[i]);
  function magic(blanks = 3) { let g = BASE; for (let i = R(4); i--;) g = rot(g); if (R(2)) g = flip(g); return { size: 3, sol: g, max: 9, holes: shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, blanks) }; }
  // 4×4 스도쿠: 바른 판을 숫자 바꾸기·줄 바꾸기로 섞고 빈칸 6~8개
  function sudoku(blanks = 6) {
    let g = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
    const p = shuffle([1, 2, 3, 4]); g = g.map(r => r.map(v => p[v - 1]));
    if (R(2)) g = [g[1], g[0], g[2], g[3]]; if (R(2)) g = [g[0], g[1], g[3], g[2]]; if (R(2)) g = [g[2], g[3], g[0], g[1]];
    if (R(2)) g = g.map(r => [r[1], r[0], r[2], r[3]]); if (R(2)) g = g[0].map((_, c) => g.map(r => r[c]));
    return { size: 4, sol: g.flat(), max: 4, holes: shuffle([...Array(16).keys()]).slice(0, blanks) };
  }
  return { gen, magic, sudoku, shuffle };
})();

Views.math = (el, game) => {
  const p = Store.profile();
  const reward = () => { if (!p) return 0; const got = Store.addStars(1, 'math', 5); if (got) App.refreshHeader(); return got; };
  if (!game || !MATH_GAMES[game]) {
    el.innerHTML = `<div class="wrap sec">
      <h1 class="page-title">🧮 새싹수학 <small class="chip">시험 중</small></h1>
      ${UI.mascot('수학 퍼즐로 머리를 말랑말랑하게! 한 판에 5문제, 다 맞히면 별을 줄게 (하루 5개까지)')}
      ${[['5~6세', '수와 모양 놀이'], ['7~8세', '셈과 퍼즐']].map(([age, t]) => `<h2 class="sec-sub">${age} <small>${t}</small></h2>
        <div class="game-grid">${Object.entries(MATH_GAMES).filter(([, d]) => d.age === age).map(([k, d]) => `<a class="game-card" href="#/math/${k}" style="--c:${d.c}"><span>${d.icon}</span><b>${d.title}</b><small>${d.hub}</small></a>`).join('')}</div>`).join('')}
      <p class="fine">새싹수학은 시험 중이에요. 문제는 할 때마다 새로 만들어져요.</p></div>`;
    return;
  }
  const d = MATH_GAMES[game];
  el.innerHTML = `<div class="wrap sec narrow"><a class="link-btn" href="#/math">← 새싹수학</a><h1 class="page-title">${d.icon} ${d.title}</h1><div class="card m-area"></div></div>`;
  const area = $('.m-area', el);
  const done = (ok, total) => {
    const all = ok === total, got = all ? reward() : 0;
    if (all) { Speech.sfx.cheer(); Lesson.confetti(); }
    area.innerHTML = `<div class="center m-done"><div class="auth-logo">${all ? '🏆' : '🌱'}</div><h2>${MathGen.gen[game] ? `${ok} / ${total} 맞혔어요!` : '퍼즐 완성! 🎉'}</h2>${got ? '<p>⭐ 별 1개를 받았어요</p>' : all && p ? '<p class="fine">오늘 수학 별은 다 받았어요</p>' : ''}
      <div class="row-center"><a class="btn btn-ghost" href="#/math">다른 놀이</a><button class="btn btn-primary" data-again>한 판 더</button></div></div>`;
    $('[data-again]', area).onclick = () => Views.math(el, game);
  };
  // 보기 고르는 놀이 (수 세기·모양·규칙·머리셈)
  if (MathGen.gen[game]) {
    let i = 0, ok = 0; const N = 5;
    const next = () => {
      if (i >= N) return done(ok, N);
      const q = MathGen.gen[game]();
      area.innerHTML = `<p class="m-prog">${i + 1} / ${N}</p><h2 class="m-ask">${q.ask}</h2>${q.show}
        <div class="options m-opts">${q.opts.map(o => `<button class="option" data-v="${o}">${q.labels ? q.labels[o] : o}</button>`).join('')}</div>`;
      let first = true;
      $$('.option', area).forEach(b => b.onclick = () => {
        const right = String(q.ans) === b.dataset.v;
        if (right) { b.classList.add('right'); Speech.sfx.correct(); if (first) ok++; $$('.option', area).forEach(x => x.disabled = true); i++; setTimeout(next, 700); }
        else { b.classList.add('wrong'); b.disabled = true; Speech.sfx.wrong(); first = false; }
      });
    };
    return next();
  }
  // 칸 채우는 퍼즐 (마방진·스도쿠): 빈칸을 누르고 아래 숫자를 누른다
  const pz = game === 'magic' ? MathGen.magic(3) : MathGen.sudoku(6), n = pz.size, val = pz.sol.map((v, i) => pz.holes.includes(i) ? 0 : v);
  let sel = pz.holes[0];
  const draw = () => {
    area.innerHTML = `<p class="m-rule">${game === 'magic' ? '가로·세로·대각선 세 수의 합이 모두 <b>15</b>가 되게 빈칸을 채워요' : '가로줄·세로줄·굵은 네모 안에 <b>1, 2, 3, 4</b>가 한 번씩 들어가게 채워요'}</p>
      <div class="m-grid ${game}" style="--n:${n}">${val.map((v, i) => `<button class="m-cell ${pz.holes.includes(i) ? 'hole' : 'fixed'} ${sel === i ? 'sel' : ''}" data-i="${i}" ${pz.holes.includes(i) ? '' : 'disabled'}>${v || ''}</button>`).join('')}</div>
      <div class="m-pad">${Array.from({ length: pz.max }, (_, k) => `<button class="btn btn-ghost" data-n="${k + 1}">${k + 1}</button>`).join('')}<button class="btn btn-ghost" data-n="0">지우기</button></div>
      <div class="row-center"><button class="btn btn-primary" data-check>다 했어요</button></div><p class="m-msg fine" aria-live="polite"></p>`;
    $$('.m-cell.hole', area).forEach(b => b.onclick = () => { sel = +b.dataset.i; Speech.sfx.tap(); draw(); });
    $$('[data-n]', area).forEach(b => b.onclick = () => { if (sel === null) return; val[sel] = +b.dataset.n; Speech.sfx.tap(); const nx = pz.holes.find(h => !val[h]); if (val[sel] && nx !== undefined) sel = nx; draw(); });
    $('[data-check]', area).onclick = () => {
      if (pz.holes.some(h => !val[h])) return ($('.m-msg', area).textContent = '아직 빈칸이 있어요.');
      // 답은 정해 둔 한 가지가 아니어도 규칙만 맞으면 정답 (마방진은 합, 스도쿠는 겹치지 않기)
      const rows = [...Array(n).keys()].map(r => val.slice(r * n, r * n + n)), cols = [...Array(n).keys()].map(c => rows.map(r => r[c]));
      let good;
      if (game === 'magic') { const s = a => a.reduce((x, y) => x + y, 0); good = [...rows, ...cols, [val[0], val[4], val[8]], [val[2], val[4], val[6]]].every(l => s(l) === 15) && new Set(val).size === 9; }
      else { const boxes = [0, 2, 8, 10].map(o => [val[o], val[o + 1], val[o + 4], val[o + 5]]); good = [...rows, ...cols, ...boxes].every(l => new Set(l).size === 4); }
      if (good) { $$('.m-cell', area).forEach(c => c.classList.add('ok')); setTimeout(() => done(1, 1), 600); }
      else { Speech.sfx.wrong(); $('.m-msg', area).textContent = game === 'magic' ? '합이 15가 아닌 줄이 있어요. 다시 살펴봐요!' : '같은 숫자가 겹친 줄이 있어요. 다시 살펴봐요!'; }
    };
  };
  draw();
};
