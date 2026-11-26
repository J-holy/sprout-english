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
// 새싹스쿨 그림: 놀이 아이콘(PICS.i['math-…'])과 세기·규칙 스티커(PICS.x['m'+이모지]). 그림이 없으면 이모지
const mIco = k => PICS.i['math-' + k] ? `<img class="ico" src="img/${PICS.i['math-' + k]}" alt="" draggable="false">` : MATH_GAMES[k].icon;
const mPic = e => PICS.x['m' + e] ? `<img class="m-pic" src="img/${PICS.x['m' + e]}" alt="" draggable="false">` : e;
const MathGen = (() => {
  const R = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const nearby = (ans, lo, hi, n = 3) => { const s = new Set([ans]); let k = 0; while (s.size < n && k++ < 50) { const v = ans + (R(5) - 2) || ans + 3; if (v >= lo && v <= hi) s.add(v); } for (let v = lo; s.size < n; v++) s.add(v); return shuffle([...s]); };
  const THINGS = [['🍎', '사과는'], ['🐥', '병아리는'], ['⭐', '별은'], ['🌸', '꽃은'], ['🚗', '자동차는'], ['🎈', '풍선은'], ['🐟', '물고기는'], ['🍓', '딸기는'], ['🐶', '강아지는'], ['⚽', '공은']];
  const SHAPES = {
    tri: ['세모', '<polygon points="50,8 94,90 6,90"/>'],
    sq: ['네모', '<rect x="12" y="12" width="76" height="76" rx="4"/>'],
    circ: ['동그라미', '<circle cx="50" cy="50" r="42"/>'],
  };
  const COLORS = ['#ff8a65', '#4db6ac', '#9575cd', '#64b5f6', '#f06292', '#ffd54f'];
  const svg = (k, col, rot = 0) => `<svg viewBox="0 0 100 100" class="m-shape" aria-label="${SHAPES[k][0]}"><g fill="${col}" stroke="#3a2d4f" stroke-width="5" transform="rotate(${rot} 50 50)">${SHAPES[k][1]}</g></svg>`;
  const gen = {
    count(lo = 1, hi = 10) { const n = lo + R(hi - lo + 1), [e, name] = THINGS[R(THINGS.length)]; return { ask: `${mPic(e)} ${name} 몇 개일까요?`, show: `<div class="m-count">${Array(n).fill(`<span>${mPic(e)}</span>`).join('')}</div>`, opts: nearby(n, Math.max(1, lo - 2), hi), ans: n }; },
    shape() {
      const keys = Object.keys(SHAPES), want = keys[R(3)], cols = shuffle(COLORS);
      const opts = shuffle(keys).map((k, i) => ({ k, html: svg(k, cols[i], k === 'tri' ? [0, 15, -15][R(3)] : R(30)) }));
      return { ask: `${SHAPES[want][0]}를 골라요`, show: '', opts: opts.map(o => o.k), labels: Object.fromEntries(opts.map(o => [o.k, o.html])), ans: want };
    },
    pattern() {
      const unit = [['A', 'B'], ['A', 'A', 'B'], ['A', 'B', 'C'], ['A', 'B', 'B']][R(4)], pool = shuffle(['🍎', '🍌', '🍇', '⭐', '🌙', '❤️', '🐶', '🐱', '🍓', '🐥']);
      const map = { A: pool[0], B: pool[1], C: pool[2] }, seq = Array.from({ length: unit.length * 2 + 2 }, (_, i) => map[unit[i % unit.length]]);
      const hide = seq.length - 1, ans = seq[hide]; let o;
      return { ask: '빈칸에 올 것을 골라요', show: `<div class="m-seq">${seq.map((x, i) => i === hide ? '<b class="m-q">?</b>' : `<span>${mPic(x)}</span>`).join('')}</div>`, opts: o = shuffle([ans, ...[...new Set([map.A, map.B, map.C || pool[3], pool[4]])].filter(v => v !== ans).slice(0, 2)]), labels: Object.fromEntries(o.map(v => [v, mPic(v)])), ans };
    },
    mental(op) {
      const add = op ? op === '+' : R(2) === 0; let a, b, ans;
      if (add) { a = 1 + R(12); b = 1 + R(20 - a); ans = a + b; } else { a = 5 + R(16); b = 1 + R(a); ans = a - b; }
      return { ask: `${a} ${add ? '+' : '−'} ${b} = ?`, show: '', opts: nearby(ans, 0, 20, 4), ans };
    },
    // 다른 무리 찾기 (집합): 같은 무리 셋과 다른 무리 하나
    odd() {
      const sets = [['🍎', '🍓', '🍌', '🍇'], ['🐶', '🐱', '🐥', '🐟'], ['⭐', '🌙'], ['🚗', '⚽', '🎈']];
      const [a, b] = shuffle([0, 1]).map(i => sets[i]), same = shuffle(a).slice(0, 3), diff = b[R(b.length)];
      const all = shuffle([...same, diff]);
      return { ask: '다른 무리에 들어가는 것을 골라요', show: '', opts: all, labels: Object.fromEntries(all.map(v => [v, mPic(v)])), ans: diff };
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
  const lesson = MATH_LESSONS.find(l => l.id === game);
  if (lesson) return mathLesson(el, lesson, reward);
  if (!game || !MATH_GAMES[game]) {
    KoSpeech.stop();
    el.innerHTML = `<div class="wrap sec">
      <h1 class="page-title">${ico('🧮')} 새싹수학 <small class="chip">시험 중</small></h1>
      ${UI.mascot('개념을 배우고, 따라 읽고, 따라 써 본 다음 문제로 확인해요. 다 끝내면 별을 줄게!')}
      <h2 class="sec-title m-sec">${ico('📖')} 개념 배우기 <small>배우기 → 따라 읽기 → 따라 쓰기 → 확인</small></h2>
      ${[['5~6세', '수와 모양'], ['7~8세', '셈과 퍼즐']].map(([age, t]) => `<h3 class="sec-sub">${age} <small>${t}</small></h3>
        <div class="m-lessons">${MATH_LESSONS.filter(l => l.age === age).map((l, i) => `<a class="m-lesson card ${mathDone().includes(l.id) ? 'done' : ''}" href="#/math/${l.id}"><span class="m-l-ico">${lIco(l)}</span><b>${l.title}</b><small>${mathDone().includes(l.id) ? '✅ 다 배웠어요' : `${l.steps.length}단계`}</small></a>`).join('')}</div>`).join('')}
      <h2 class="sec-title m-sec">${ico('🎯')} 퍼즐 놀이 <small>한 판에 5문제, 다 맞히면 별 (하루 5개까지)</small></h2>
      ${[['5~6세', '수와 모양 놀이'], ['7~8세', '셈과 퍼즐']].map(([age, t]) => `<h3 class="sec-sub">${age} <small>${t}</small></h3>
        <div class="game-grid">${Object.entries(MATH_GAMES).filter(([, d]) => d.age === age).map(([k, d]) => `<a class="game-card" href="#/math/${k}" style="--c:${d.c}"><span>${mIco(k)}</span><b>${d.title}</b><small>${d.hub}</small></a>`).join('')}</div>`).join('')}
      <p class="fine">새싹수학은 시험 중이에요. 문제는 할 때마다 새로 만들어져요.</p></div>`;
    return;
  }
  const d = MATH_GAMES[game];
  KoSpeech.stop();
  el.innerHTML = `<div class="wrap sec narrow"><a class="link-btn" href="#/math">← 새싹수학</a><h1 class="page-title">${mIco(game)} ${d.title}</h1><div class="card m-area"></div></div>`;
  const area = $('.m-area', el);
  const done = (ok, total) => {
    const all = ok === total, got = all ? reward() : 0;
    if (all) { Speech.sfx.cheer(); Lesson.confetti(); }
    area.innerHTML = `<div class="center m-done"><div class="auth-logo">${ico(all ? '🏆' : '🌱')}</div><h2>${MathGen.gen[game] ? `${ok} / ${total} 맞혔어요!` : '퍼즐 완성! 🎉'}</h2>${got ? '<p>⭐ 별 1개를 받았어요</p>' : all && p ? '<p class="fine">오늘 수학 별은 다 받았어요</p>' : ''}
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

// ── 개념 레슨 (math-lessons.js) ──────────────────────────────
const lIco = l => l.icon.startsWith('math-') ? (PICS.i[l.icon] ? `<img class="ico" src="img/${PICS.i[l.icon]}" alt="" draggable="false">` : '🧮')
  : l.icon.startsWith('m') && PICS.x[l.icon] ? `<img class="m-pic" src="img/${PICS.x[l.icon]}" alt="" draggable="false">` : ico(l.icon);
const mathDoneKey = () => 'math-done-' + ((Store.profile() || {}).id || 'guest');
const mathDone = () => { try { return JSON.parse(localStorage.getItem(mathDoneKey()) || '[]'); } catch { return []; } };
const mathMarkDone = id => { try { const d = mathDone(); if (!d.includes(id)) localStorage.setItem(mathDoneKey(), JSON.stringify([...d, id])); } catch {} };

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
    case 'grid': return `<div class="m-grid show ${v.n === 3 ? 'magic' : 'sudoku'}" style="--n:${v.n}">${v.vals.map(x => `<span class="m-cell fixed">${x || ''}</span>`).join('')}</div>`;
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

function mathLesson(el, L, reward) {
  let i = 0;
  el.innerHTML = `<div class="wrap sec narrow"><a class="link-btn" href="#/math">← 새싹수학</a><h1 class="page-title">${lIco(L)} ${L.title}</h1>
    <div class="lesson-progress m-lprog"><div class="bar"></div></div><div class="card m-area m-lesson-area"></div></div>`;
  const area = $('.m-area', el), bar = $('.m-lprog .bar', el);
  const sayBtns = t => `<div class="row-center m-say"><button class="btn btn-ghost" data-ko="${esc(t)}">🔊 듣기</button><button class="btn btn-ghost" data-ko-slow="${esc(t)}">🐢 천천히</button></div>`;
  const wireSay = () => {
    $$('[data-ko]', area).forEach(b => b.onclick = () => KoSpeech.say(b.dataset.ko));
    $$('[data-ko-slow]', area).forEach(b => b.onclick = () => KoSpeech.say(b.dataset.koSlow, { slow: true }));
  };
  const next = () => { i++; show(); };
  const finish = () => {
    KoSpeech.stop(); mathMarkDone(L.id); const got = reward();
    Speech.sfx.cheer(); Lesson.confetti(); bar.style.width = '100%';
    area.innerHTML = `<div class="center m-done"><div class="auth-logo">${ico('🏆')}</div><h2>「${L.title}」 다 배웠어요!</h2>${got ? '<p>⭐ 별 1개를 받았어요</p>' : ''}
      <div class="row-center"><a class="btn btn-ghost" href="#/math">다른 개념</a><button class="btn btn-primary" data-again>처음부터 다시</button></div></div>`;
    $('[data-again]', area).onclick = () => mathLesson(el, L, reward);
  };
  const show = () => {
    if (i >= L.steps.length) return finish();
    const st = L.steps[i]; bar.style.width = `${Math.round(i / L.steps.length * 100)}%`;
    const tag = { learn: '📖 배워요', read: '🗣️ 따라 읽어요', write: '✏️ 따라 써요', quiz: '❓ 확인해요', play: '🧩 해 봐요' }[st.type];
    const head = `<p class="m-prog">${i + 1} / ${L.steps.length} · <b>${tag}</b></p>`;
    if (st.type === 'learn') {
      area.innerHTML = `${head}${mathViz(st.viz)}<p class="m-text">${esc(st.text)}</p>${sayBtns(st.text)}<div class="row-center"><button class="btn btn-primary" data-next>다음 →</button></div>`;
      wireSay(); KoSpeech.say(st.text); $('[data-next]', area).onclick = next;
    } else if (st.type === 'read') {
      area.innerHTML = `${head}${mathViz(st.viz)}<p class="m-read">${esc(st.text)}</p><p class="fine center">먼저 듣고, 소리 내어 따라 읽어 봐요.</p>${sayBtns(st.text)}<div class="row-center"><button class="btn btn-primary" data-next disabled>따라 읽었어요 ✅</button></div>`;
      wireSay(); const nb = $('[data-next]', area);
      KoSpeech.say(st.text, { onEnd: () => { nb.disabled = false; } }); setTimeout(() => { nb.disabled = false; }, 4000);
      nb.onclick = next;
    } else if (st.type === 'write') {
      area.innerHTML = `${head}<h2 class="m-ask">「${esc(st.glyph)}」 따라 쓰기</h2>${sayBtns(st.say)}<div class="m-write"></div>`;
      wireSay(); KoSpeech.say(st.say); mathTrace($('.m-write', area), st.glyph, () => setTimeout(next, 500));
    } else if (st.type === 'quiz') {
      const q = MathGen.gen[st.gen](...(st.args || []));
      area.innerHTML = `${head}<h2 class="m-ask">${q.ask}</h2>${q.show}<div class="options m-opts">${q.opts.map(o => `<button class="option" data-v="${o}">${q.labels ? q.labels[o] : o}</button>`).join('')}</div>`;
      $$('.option', area).forEach(b => b.onclick = () => {
        if (String(q.ans) === b.dataset.v) { b.classList.add('right'); Speech.sfx.correct(); $$('.option', area).forEach(x => x.disabled = true); setTimeout(next, 700); }
        else { b.classList.add('wrong'); b.disabled = true; Speech.sfx.wrong(); }
      });
    } else if (st.type === 'play') {
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p>${sayBtns(st.text)}<div class="row-center"><a class="btn btn-ghost" href="#/math/${st.game}">퍼즐 하러 가기</a><button class="btn btn-primary" data-next>레슨 마치기</button></div>`;
      wireSay(); KoSpeech.say(st.text); $('[data-next]', area).onclick = next;
    }
  };
  show();
}
