/* 새싹수학 퍼즐 놀이 (시험, 2026-11-26)
 * 「천재들이 만든 수학퍼즐」의 주제 이름만 참고하고, 문제는 모두 화면이 매번 새로 만든다 (책 내용은 쓰지 않는다. docs/MATH-TOPICS.md)
 * 한 판 = 5문제. 다 맞히면 별(하루 5개까지, 프로필이 있을 때만) */
const MATH_GAMES = {
  count: { icon: '🍎', title: '수 세기', stage: 'seed', c: '#ff8a65', hub: '그림을 세어 몇 개인지 골라요' },
  shape: { icon: '🔷', title: '모양 찾기', stage: 'seed', c: '#4db6ac', hub: '세모·네모·동그라미를 찾아요' },
  odd: { icon: '🧺', title: '다른 무리 찾기', stage: 'seed', c: '#ffb74d', hub: '같은 무리가 아닌 것을 골라요' },
  pattern: { icon: '🔁', title: '다음에 올 것', stage: 'seed', c: '#9575cd', hub: '규칙을 찾아 빈칸을 채워요' },
  mental: { icon: '⚡', title: '빠른 머리셈', stage: 'sprout', c: '#64b5f6', hub: '20까지 더하기·빼기' },
  magic: { icon: '✨', title: '마방진', stage: 'sprout', c: '#f06292', hub: '가로·세로·대각선 합이 모두 15' },
  sudoku: { icon: '🔢', title: '4×4 스도쿠', stage: 'sprout', c: '#aed581', hub: '줄마다 1·2·3·4가 한 번씩' },
  mul: { icon: '✖️', title: '곱셈 퍼즐', stage: 'tree', c: '#ff8a65', hub: '2~9단 곱셈' },
  frac: { icon: '🍕', title: '분수 퍼즐', stage: 'tree', c: '#4db6ac', hub: '색칠한 부분은 얼마일까' },
  factor: { icon: '🍪', title: '약수·배수 퍼즐', stage: 'tree', c: '#ffb74d', hub: '약수와 배수 고르기' },
  angle: { icon: '📐', title: '각 퍼즐', stage: 'tree', c: '#9575cd', hub: '예각·직각·둔각' },
  poly: { icon: '🐝', title: '다각형 퍼즐', stage: 'tree', c: '#64b5f6', hub: '이름과 변의 수' },
};
// 새싹스쿨 그림: 놀이 아이콘(PICS.i['math-…'])과 세기·규칙 스티커(PICS.x['m'+이모지]). 그림이 없으면 이모지
const mIco = k => PICS.i['math-' + k] ? `<img class="ico" src="img/${PICS.i['math-' + k]}" alt="" draggable="false">` : ico(MATH_GAMES[k].icon);
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
  // 9~10세 그림: 분수 원(색칠 n/d), 각(두 선과 호), 정다각형
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
    },    // ── 9~10세 ──
    // 곱셈: 2~9단. 틀린 보기는 한 단 옆(a×(b±1), (a±1)×b)에서 골라 실수하기 쉬운 답으로
    mul() {
      const a = 2 + R(8), b = 2 + R(8), ans = a * b;
      const wrong = shuffle([...new Set([a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, ans + 1, ans - 1])].filter(v => v > 0 && v !== ans)).slice(0, 3);
      return { ask: `${a} × ${b} = ?`, show: '', opts: shuffle([ans, ...wrong]), ans };
    },
    // 분수: 색칠한 부분 읽기, 또는 말한 분수에 맞는 그림 고르기
    frac() {
      const d = [2, 3, 4, 5, 6, 8][R(6)], n = 1 + R(d - 1), key = `${n}/${d}`;
      const cand = [`${d - n}/${d}`, `${n}/${d + 1}`, `${Math.min(n + 1, d - 1)}/${d}`, `${Math.max(n - 1, 1)}/${d}`, `${n}/${Math.max(d - 1, 2)}`, `${d}/${n + d}`]
        .filter(v => { const [x, y] = v.split('/').map(Number); return x < y; });
      // 크기가 같은 분수(2/3과 4/6)는 보기에 함께 넣지 않는다: 정답이 둘처럼 보이니까
      const val = v => { const [x, y] = v.split('/').map(Number); return Math.round(x / y * 1e6); }, seen = new Set([val(key)]);
      const opts = shuffle([key, ...shuffle([...new Set(cand)]).filter(v => !seen.has(val(v)) && seen.add(val(v))).slice(0, 2)]);
      if (R(2)) return { ask: '색칠한 부분은 전체의 얼마일까요?', show: `<div class="m-viz">${pie(n, d)}</div>`, opts, labels: Object.fromEntries(opts.map(v => [v, fracTxt(v)])), ans: key };
      return { ask: `색칠한 부분이 <b>${KN[d]}분의 ${KN[n]}</b>인 것을 골라요`, show: `<p class="m-eq-num">${fracTxt(key)}</p>`, opts, labels: Object.fromEntries(opts.map(v => [v, pie(...v.split('/').map(Number), 'm-pie sm')])), ans: key };
    },
    // 약수와 배수: 'n의 약수' 또는 'k의 배수'를 네 개 중에서 고른다
    factor() {
      if (R(2)) {
        const n = [8, 10, 12, 14, 15, 16, 18, 20][R(8)], mid = [...Array(n).keys()].filter(v => v > 1 && v < n);
        const ds = mid.filter(v => n % v === 0), ans = ds[R(ds.length)], wrong = shuffle(mid.filter(v => n % v)).slice(0, 3);
        return { ask: `${n}의 약수는 어느 것일까요?`, show: '', opts: shuffle([ans, ...wrong]), ans };
      }
      const k = 3 + R(7), ans = k * (2 + R(4)), wrong = shuffle([ans - 2, ans - 1, ans + 1, ans + 2, ans + 3].filter(v => v > 1 && v % k)).slice(0, 3);
      return { ask: `${k}의 배수는 어느 것일까요?`, show: '', opts: shuffle([ans, ...wrong]), ans };
    },
    // 각: 그림을 보고 예각·직각·둔각
    angle() {
      const kind = ['예각', '직각', '둔각'][R(3)], deg = { 예각: [30, 45, 60, 70], 직각: [90], 둔각: [110, 120, 135, 150] }[kind];
      return { ask: '어떤 각일까요?', show: `<div class="m-viz">${angSvg(deg[R(deg.length)], R(2))}</div>`, opts: ['예각', '직각', '둔각'], ans: kind };
    },
    // 다각형: 이름 또는 변의 수
    poly() {
      const n = [3, 4, 5, 6, 8][R(5)], show = `<div class="m-viz">${polySvg(n, COLORS[R(6)], R(60))}</div>`;
      if (R(2)) { const o = shuffle([n, ...shuffle([3, 4, 5, 6, 8].filter(v => v !== n)).slice(0, 2)]); return { ask: '이 도형의 이름은 무엇일까요?', show, opts: o.map(v => POLY[v]), ans: POLY[n] }; }
      return { ask: '변은 모두 몇 개일까요?', show, opts: shuffle([n, ...shuffle([3, 4, 5, 6, 7, 8].filter(v => v !== n)).slice(0, 2)]), ans: n };
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
  return { gen, magic, sudoku, shuffle, pie, angSvg, polySvg, fracTxt, POLY, KN };
})();

// ── 단계·주제·잠금 ──
const mStage = id => MATH_STAGES.find(s => s.id === id);
const mOpen = stage => mStage(stage).free || Store.hasMath();
const mTopicOf = ({ lesson, game, topic }) => MATH_TOPICS.find(t => t.id === topic || (lesson && t.lessons.includes(lesson)) || (game && t.game === game));
const tIco = t => t.icon.startsWith('math-') ? (PICS.i[t.icon] ? `<img class="ico" src="img/${PICS.i[t.icon]}" alt="" draggable="false">` : '🧮') : ico(t.icon);
// 잠긴 단계(새싹·나무)를 누르면: 새싹수학 플러스 안내
function mathUpsell(stage) {
  const s = mStage(stage) || MATH_STAGES[1];
  return App.modal(`<div class="upsell"><div class="auth-logo">💎</div><h2>${s.icon} ${s.name} 단계는 새싹수학 플러스예요</h2>
    <p>🌰 씨앗 단계(5~6세쯤)는 지금처럼 <b>무료</b>로 계속할 수 있어요.</p>
    <ul class="perks"><li>🌱 새싹 · 더하기·빼기 · 마방진 · 스도쿠</li><li>🌳 나무 · 곱셈 · 분수 · 약수와 배수 · 각 · 다각형</li><li>📖 개념 배우기 · 🧩 퍼즐 · 🖨️ 워크시트, 문제는 할 때마다 새로</li></ul>
    <div class="row-center"><button class="btn btn-ghost" data-close>나중에</button><a class="btn btn-primary" href="#/pricing" data-close>💎 요금 보기</a></div></div>`);
}
const mHome = () => {
  const done = mathDone(), lock = s => !mOpen(s.id);
  const btn = (s, href, label) => lock(s) ? `<button class="btn btn-ghost sm" data-lock="${s.id}">${label}</button>` : `<a class="btn btn-ghost sm" href="${href}">${label}</a>`;
  return `<div class="wrap sec">
    <h1 class="page-title">${ico('🧮')} 새싹수학 <small class="chip">시험 중</small></h1>
    <div class="m-intro">
      <div class="card m-intro-card"><b>이렇게 배워요</b><p>📖 <b>배우기</b> 그림과 소리로 개념 익히기<br>→ 🧩 <b>퍼즐로 해 보기</b> 할 때마다 새 문제<br>→ 🖨️ <b>워크시트로 연습</b> 인쇄해서 쓰고 풀기</p></div>
      <div class="card m-intro-card"><b>단계</b><p>${MATH_STAGES.map(s => `${s.icon} <b>${s.name}</b> <small>${s.age}</small> ${MATH_TOPICS.filter(t => t.stage === s.id).map(t => t.title).join('·')}${s.free ? ' <i class="chip">무료</i>' : ''}`).join('<br>')}</p></div>
      <div class="card m-intro-card"><b>부모님께</b><p>배운 주제는 ✅로 표시되고, 다 마치면 별을 받아요(하루 5개까지). 워크시트는 맨 아래에 정답이 있어 바로 채점할 수 있어요. 새싹·나무 단계는 <a href="#/pricing">새싹수학 플러스</a>예요.</p></div>
    </div>
    ${MATH_STAGES.map(s => `<h2 class="sec-sub m-stage">${s.icon} ${s.name} <small>${s.age} · ${s.desc}${s.free ? ' · 무료' : lock(s) ? ' · 🔒 플러스' : ''}</small></h2>
      <div class="m-topics">${MATH_TOPICS.filter(t => t.stage === s.id).map(t => {
        const ls = t.lessons.map(id => MATH_LESSONS.find(l => l.id === id)), all = ls.every(l => done.includes(l.id));
        return `<div class="card m-topic ${all ? 'done' : ''} ${lock(s) ? 'locked' : ''}">
          <div class="m-topic-head"><span class="m-l-ico">${tIco(t)}</span><b>${t.title}</b>${lock(s) ? '<span class="m-lock" aria-label="잠김">🔒</span>' : all ? '<span>✅</span>' : ''}</div>
          <div class="m-topic-btns">${ls.map(l => btn(s, `#/math/${l.id}`, `📖 ${ls.length > 1 ? l.title : '개념 배우기'}${done.includes(l.id) ? ' ✅' : ''}`)).join('')}${btn(s, `#/math/p_${t.game}`, '🧩 퍼즐')}${btn(s, `#/math/w_${t.id}`, '🖨️ 워크시트')}</div></div>`;
      }).join('')}</div>`).join('')}
    <p class="fine">새싹수학은 시험 중이에요. 퍼즐과 워크시트 문제는 할 때마다 새로 만들어져요.</p></div>`;
};

Views.math = (el, game) => {
  const p = Store.profile();
  const reward = () => { if (!p) return 0; const got = Store.addStars(1, 'math', 5); if (got) App.refreshHeader(); return got; };
  KoSpeech.stop();
  // 주소: #/math/<레슨 id> · #/math/p_<퍼즐> · #/math/w_<주제> (예전 주소 #/math/count 같은 퍼즐 이름도 받는다)
  const lesson = game && MATH_LESSONS.find(l => l.id === game);
  const pzKey = game && (game.startsWith('p_') ? game.slice(2) : !lesson && MATH_GAMES[game] ? game : null);
  const wsTopic = game && game.startsWith('w_') && MATH_TOPICS.find(t => t.id === game.slice(2));
  const stage = lesson ? lesson.stage : pzKey && MATH_GAMES[pzKey] ? MATH_GAMES[pzKey].stage : wsTopic ? wsTopic.stage : null;
  if (stage && !mOpen(stage)) { location.hash = '#/math'; return void setTimeout(() => mathUpsell(stage), 50); }
  if (lesson) return mathLesson(el, lesson, reward);
  if (wsTopic) return mathWorksheet(el, wsTopic);
  if (!pzKey || !MATH_GAMES[pzKey]) {
    el.innerHTML = mHome();
    $$('[data-lock]', el).forEach(b => b.onclick = () => mathUpsell(b.dataset.lock));
    return;
  }
  game = pzKey;
  const d = MATH_GAMES[game], topic = mTopicOf({ game });
  el.innerHTML = `<div class="wrap sec narrow"><a class="link-btn" href="#/math">← 새싹수학</a><h1 class="page-title">${mIco(game)} ${d.title}</h1><div class="card m-area"></div></div>`;
  const area = $('.m-area', el);
  const done = (ok, total) => {
    const all = ok === total, got = all ? reward() : 0;
    if (all) { Speech.sfx.cheer(); Lesson.confetti(); }
    area.innerHTML = `<div class="center m-done"><div class="auth-logo">${ico(all ? '🏆' : '🌱')}</div><h2>${MathGen.gen[game] ? `${ok} / ${total} 맞혔어요!` : '퍼즐 완성! 🎉'}</h2>${got ? '<p>⭐ 별 1개를 받았어요</p>' : all && p ? '<p class="fine">오늘 수학 별은 다 받았어요</p>' : ''}
      <div class="row-center"><a class="btn btn-ghost" href="#/math">다른 주제</a>${topic ? `<a class="btn btn-ghost" href="#/math/w_${topic.id}">🖨️ 워크시트</a>` : ''}<button class="btn btn-primary" data-again>한 판 더</button></div></div>`;
    $('[data-again]', area).onclick = () => Views.math(el, 'p_' + game);
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
    case 'array': return `<div class="m-viz m-array" style="--c:${v.c}">${row(v.e, v.r * v.c)}</div><p class="m-eq-num">${v.c} × ${v.r} = ${v.r * v.c}</p>`;
    case 'frac': return `<div class="m-viz">${MathGen.pie(v.n, v.d)}</div><p class="m-eq-num">${MathGen.fracTxt(v.n + '/' + v.d)}</p>`;
    case 'nums': return `<div class="m-viz m-nums">${Array.from({ length: v.to }, (_, k) => `<span class="${v.hi.includes(k + 1) ? 'hi' : ''}">${k + 1}</span>`).join('')}</div>`;
    case 'angle': return v.all ? `<div class="m-viz m-angs">${[['예각', 45], ['직각', 90], ['둔각', 135]].map(([t, d]) => `<figure>${MathGen.angSvg(d)}<figcaption>${t}</figcaption></figure>`).join('')}</div>` : `<div class="m-viz">${MathGen.angSvg(v.deg)}</div>`;
    case 'poly': return `<div class="m-viz m-angs">${v.s.map((n, k) => `<figure>${MathGen.polySvg(n, ['#4db6ac', '#ff8a65', '#9575cd', '#64b5f6'][k % 4])}<figcaption>${MathGen.POLY[n]}</figcaption></figure>`).join('')}</div>`;
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
    KoSpeech.stop(); mathMarkDone(L.id); const got = reward(), tp = mTopicOf({ lesson: L.id });
    Speech.sfx.cheer(); Lesson.confetti(); bar.style.width = '100%';
    area.innerHTML = `<div class="center m-done"><div class="auth-logo">${ico('🏆')}</div><h2>「${L.title}」 다 배웠어요!</h2>${got ? '<p>⭐ 별 1개를 받았어요</p>' : ''}
      <p>이제 같은 주제로 더 해 볼까요?</p>
      <div class="row-center">${tp ? `<a class="btn btn-primary" href="#/math/p_${tp.game}">🧩 퍼즐로 해 보기</a><a class="btn btn-ghost" href="#/math/w_${tp.id}">🖨️ 워크시트</a>` : ''}</div>
      <div class="row-center"><a class="btn btn-ghost" href="#/math">다른 주제</a><button class="btn btn-ghost" data-again>처음부터 다시</button></div></div>`;
    $('[data-again]', area).onclick = () => mathLesson(el, L, reward);
  };
  const show = () => {
    if (i >= L.steps.length) return finish();
    const st = L.steps[i]; bar.style.width = `${Math.round(i / L.steps.length * 100)}%`;
    const tag = { learn: '📖 배워요', write: '✏️ 따라 써요', quiz: '❓ 확인해요', play: '🧩 해 봐요' }[st.type];
    const head = `<p class="m-prog">${i + 1} / ${L.steps.length} · <b>${tag}</b></p>`;
    if (st.type === 'learn') {
      area.innerHTML = `${head}${mathViz(st.viz)}<p class="m-text">${esc(st.text)}</p>${sayBtns(st.text)}<div class="row-center"><button class="btn btn-primary" data-next>다음 →</button></div>`;
      wireSay(); KoSpeech.say(st.text); $('[data-next]', area).onclick = next;
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
      area.innerHTML = `${head}<p class="m-text">${esc(st.text)}</p>${sayBtns(st.text)}<div class="row-center"><a class="btn btn-ghost" href="#/math/p_${st.game}">🧩 퍼즐 하러 가기</a><button class="btn btn-primary" data-next>레슨 마치기</button></div>`;
      wireSay(); KoSpeech.say(st.text); $('[data-next]', area).onclick = next;
    }
  };
  show();
}

// ── 인쇄용 워크시트 (A4): 개념 한 줄 → 따라 쓰기 → 문제(MathGen, 인쇄할 때마다 새로) → 정답 (인쇄하면 다음 장) ──
function mathWorksheet(el, t) {
  const s = mStage(t.stage), w = t.ws, p = Store.profile(), NUM = ['①', '②', '③', '④'];
  const make = () => {
    let probs, answers;
    if (w.grid) {
      // 마방진·스도쿠: 빈칸 있는 판을 n개, 정답은 작은 판으로
      const pzs = Array.from({ length: w.n }, () => w.grid === 'magic' ? MathGen.magic(3 + (Math.random() < .5 ? 1 : 0)) : MathGen.sudoku(6 + Math.floor(Math.random() * 3)));
      const board = (pz, sol) => `<div class="mws-grid ${w.grid}" style="--n:${pz.size}">${pz.sol.map((v, i) => `<span class="${pz.holes.includes(i) ? (sol ? 'ans' : 'hole') : ''}">${pz.holes.includes(i) && !sol ? '' : v}</span>`).join('')}</div>`;
      probs = pzs.map((pz, i) => `<div class="mws-q"><b>${i + 1}.</b> ${w.grid === 'magic' ? '세 수의 합이 모두 15가 되게 채워요' : '줄마다 1·2·3·4가 한 번씩'}${board(pz)}</div>`);
      answers = pzs.map((pz, i) => `<div class="mws-a"><b>${i + 1}.</b>${board(pz, true)}</div>`);
    } else {
      const seen = new Set(), qs = [];
      for (let k = 0; qs.length < w.n && k < w.n * 20; k++) { const q = MathGen.gen[w.gen](...(w.args || [])), key = q.ask + q.show + q.opts.join(); if (!seen.has(key)) { seen.add(key); qs.push(q); } }
      probs = qs.map((q, i) => `<div class="mws-q"><b>${i + 1}.</b> <span class="mws-ask">${q.ask}</span>${q.show}<div class="mws-opts">${q.opts.map((o, j) => `<span>${NUM[j]} ${q.labels ? q.labels[o] : o}</span>`).join('')}</div></div>`);
      answers = qs.map((q, i) => { const j = q.opts.findIndex(o => String(o) === String(q.ans)); return `<span class="mws-a"><b>${i + 1}.</b> ${NUM[j]}${q.labels ? '' : ` ${q.ans}`}</span>`; });
    }
    $('.mws-probs', el).innerHTML = probs.join('');
    $('.mws-answers', el).innerHTML = answers.join('');
  };
  el.innerHTML = `<div class="wrap sec narrow worksheet-wrap">
    <div class="no-print row"><a class="link-btn" href="#/math">← 새싹수학</a><button class="btn btn-ghost" data-new>🔄 새 문제</button><button class="btn btn-primary" data-print>🖨️ 워크시트 인쇄</button></div>
    <p class="no-print fine">인쇄하거나 PDF로 저장해요. 문제는 누를 때마다 새로 만들어지고, 정답은 다음 장에 나와요.</p>
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
  $('[data-new]', el).onclick = () => { Speech.sfx.tap(); make(); };
  $('[data-print]', el).onclick = () => window.print();
}
