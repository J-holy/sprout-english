/* 새싹수학 '🤲 해 보기' 2 (2026-11-27): 씨앗·새싹 단계 주제. 틀(mathAct)은 math-acts.js */
const mR = n => Math.floor(Math.random() * n);
// 수 뒤 조사: 끝자리를 읽은 소리에 받침이 있으면 a (영·일·삼·육·칠·팔·십), 없으면 b
const mJo = (n, a, b) => `${n}${[1, 1, 0, 1, 0, 0, 1, 1, 1, 0][Math.abs(n) % 10] ? a : b}`;
// 공통: 물건을 눌러 고르고 바구니를 눌러 넣는다. 맞는 바구니면 들어가고, 아니면 제자리
function mSortMount(box, m, api, why) {
  const left = MathGen.shuffle(m.items.map((it, i) => ({ ...it, i }))), placed = {};
  let sel = null;
  box.innerHTML = `<div class="m-sort-items"></div><div class="m-sort-bins">${m.bins.map(b => `<button class="m-sort-bin" data-b="${b.k}"><b>${b.label}</b><span></span></button>`).join('')}</div>`;
  const pile = $('.m-sort-items', box);
  const draw = () => {
    pile.innerHTML = left.length ? left.map(it => `<button class="m-sort-it ${sel === it.i ? 'sel' : ''}" data-i="${it.i}" aria-label="${it.name || it.e}">${it.e}</button>`).join('') : '<small>다 넣었어요!</small>';
    $$('.m-sort-bin', box).forEach(b => { $('span', b).innerHTML = (placed[b.dataset.b] || []).join(''); });
    $$('.m-sort-it', pile).forEach(b => { b.onclick = () => { sel = +b.dataset.i; Speech.sfx.tap(); draw(); api.status('어느 바구니에 넣을까요?'); };
      mDrag(b, { find: (x, y) => mAt(x, y, '.m-sort-bin', box), drop: bin => { const n = left.length; sel = +b.dataset.i; bin.click(); if (left.length === n) draw(); return left.length < n; } }); });
  };
  $$('.m-sort-bin', box).forEach(b => b.onclick = () => {
    if (sel === null) return api.status('먼저 물건을 눌러요');
    const k = left.findIndex(it => it.i === sel), it = left[k];
    if (it.k !== b.dataset.b) { Speech.sfx.wrong(); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return api.status(why ? why(it) : '다시 생각해 봐요'); }
    left.splice(k, 1); (placed[it.k] = placed[it.k] || []).push(it.e); sel = null; Speech.sfx.tap(); draw();
    if (!left.length) api.done(m.win || '모두 제자리에 넣었어요!'); else api.status(`${left.length}개 남았어요`);
  });
  draw(); api.status('물건을 끌어서 바구니에 놓아요. 눌러서 고른 다음 바구니를 눌러도 돼요');
}
// 10칸 틀: cells = 0 빈칸 · 1 빨강 · 2 파랑 · 3 덜어 냄(✗)
const mFrame = (cells, cls = '') => `<div class="m-tf ${cls}">${cells.map((c, i) => `<button class="m-tfc" data-c="${i}" aria-label="${['빈칸', '빨간 구슬', '파란 구슬', '덜어 낸 구슬'][c]}">${c === 1 ? '<i class="r"></i>' : c === 2 ? '<i class="b"></i>' : c === 3 ? '<i class="x"></i>' : ''}</button>`).join('')}</div>`;

// ── 수 세기 · 10 짝꿍수: 10칸 틀에 빨강·파랑 구슬을 채워 10을 만든다 ──
MATH_ACTS.count = {
  missions: [
    { text: '칸을 눌러 빨간 구슬을 5개 놓아 봐요.', red: 0, ok: (r, b) => r === 5 && b === 0 && '5개! 다섯 칸 한 줄이 꽉 찼어요.' },
    { text: '칸을 눌러 빨간 구슬을 7개 놓아 봐요.', red: 0, ok: (r, b) => r === 7 && b === 0 && '7개! 다섯 칸 한 줄을 채우고 둘을 더 놓았어요.' },
    { text: '빨간 구슬이 7개 있어요. 파란 구슬로 빈칸을 채워 10을 만들어 봐요. 몇 개가 더 필요할까요?', red: 7, ok: (r, b) => r + b === 10 && '빨강 7개와 파랑 3개를 더하면 10! 7과 3은 10 짝꿍이에요.' },
    { text: '빨간 구슬이 8개 있어요. 파란 구슬로 10을 만들어 봐요.', red: 8, ok: (r, b) => r + b === 10 && '8과 2는 10 짝꿍이에요!' },
    { text: '이번에는 빨간 구슬이 4개예요. 파란 구슬로 10을 만들어 봐요.', red: 4, ok: (r, b) => r + b === 10 && '4와 6은 10 짝꿍이에요!' },
    { text: '빨강과 파랑으로 10칸을 가득 채워서, 10 짝꿍을 네 가지 찾아봐요.', pairs: true },
  ],
  free: { text: '구슬을 마음대로 놓으며 10 짝꿍을 찾아봐요.', pairs: true, open: true },
  mount(box, m, api) {
    const c = Array(10).fill(0), fixed = m.red || 0, found = new Set();
    for (let i = 0; i < fixed; i++) c[i] = 1;
    let col = m.pairs ? 1 : fixed ? 2 : 1;
    box.innerHTML = `${m.pairs ? '<div class="row-center m-act-pal"><button class="btn btn-ghost sm on" data-col="1"><i class="m-bead r"></i> 빨강</button><button class="btn btn-ghost sm" data-col="2"><i class="m-bead b"></i> 파랑</button></div>' : ''}<div class="m-act-tf"></div><p class="m-act-eq"></p><div class="row-center"><button class="btn btn-ghost sm" data-clear>🧽 칸 비우기</button></div><div class="m-act-chips"></div>`;
    $('[data-clear]', box).onclick = () => { for (let i = fixed; i < 10; i++) c[i] = 0; Speech.sfx.tap(); draw(); };
    const v = $('.m-act-tf', box), eq = $('.m-act-eq', box), chips = $('.m-act-chips', box);
    const draw = () => {
      v.innerHTML = mFrame(c);
      const r = c.filter(x => x === 1).length, b = c.filter(x => x === 2).length;
      eq.innerHTML = r + b === 10 ? `<b>${r}</b> + <b>${b}</b> = <b>10</b>` : `빨강 <b>${r}</b> · 파랑 <b>${b}</b> · 빈칸 <b>${10 - r - b}</b>`;
      $$('.m-tfc', v).forEach(e => e.onclick = () => {
        const i = +e.dataset.c;
        if (i < fixed) return Speech.sfx.wrong();
        c[i] = c[i] ? 0 : col; Speech.sfx.tap(); draw();
      });
      if (m.pairs) {
        if (r + b === 10 && r && b) found.add(r);
        chips.innerHTML = [...found].sort((x, y) => x - y).map(k => `<span class="chip">${k} + ${10 - k}</span>`).join('');
        if (found.size >= 4) api.done('10 짝꿍을 네 가지 넘게 찾았어요! 1과 9, 2와 8, 3과 7, 4와 6, 5와 5.'); else api.status(found.size ? `${['한', '두', '세'][found.size - 1]} 가지 찾았어요. 빨강 수를 바꿔 또 찾아봐요` : '10칸을 빨강과 파랑으로 가득 채워요');
        return;
      }
      const w = m.ok && m.ok(r, b); if (w) api.done(w); else api.status(' ');
    };
    $$('[data-col]', box).forEach(b => b.onclick = () => { col = +b.dataset.col; $$('[data-col]', box).forEach(x => x.classList.toggle('on', x === b)); Speech.sfx.tap(); });
    draw();
  },
};

// ── 큰 수 세기: 십 묶음과 낱개를 놓아 수를 만들고, 낱개 열 개를 묶어 십 묶음으로 바꾼다 ──
MATH_ACTS.big = {
  missions: [
    { text: '십 묶음과 낱개를 눌러 놓아서 35를 만들어 봐요.', t: 0, o: 0, goal: 35, win: '35! 십 묶음 3개와 낱개 5개예요.' },
    { text: '60을 만들어 봐요. 낱개는 몇 개가 필요할까요?', t: 0, o: 0, goal: 60, win: '60! 십 묶음 6개, 낱개는 하나도 없어요.' },
    { text: '낱개가 열네 개나 있어요. 낱개 열 개를 한 묶음으로 묶으면 모두 얼마인지 보여요.', t: 1, o: 14, goal: 24, tie: true, win: '낱개 열 개를 묶었더니 십 묶음 2개와 낱개 4개, 24예요!' },
    { text: '십 묶음 2개와 낱개 열일곱 개가 있어요. 낱개를 묶어서 모두 얼마인지 알아봐요.', t: 2, o: 17, goal: 37, tie: true, win: '낱개 열 개를 묶었더니 십 묶음 3개와 낱개 7개, 37이에요!' },
    { text: '십 묶음을 하나씩 더해서 100을 만들어 봐요.', t: 7, o: 0, goal: 100, win: '십 묶음 열 개면 100, 백이에요! 세 자리 수의 시작이에요.' },
  ],
  free: { text: '십 묶음과 낱개를 마음대로 놓으며 수를 만들어 봐요.', t: 0, o: 0, open: true },
  mount(box, m, api) {
    let t = m.t, o = m.o;
    box.innerHTML = `<div class="m-act-big"></div><p class="m-act-eq"></p>
      <div class="row-center"><button class="btn btn-ghost sm" data-d="t-">➖ 묶음</button><button class="btn btn-ghost" data-d="t+">➕ 십 묶음</button><button class="btn btn-ghost" data-d="o+">➕ 낱개</button><button class="btn btn-ghost sm" data-d="o-">➖ 낱개</button></div>
      <div class="row-center"><button class="btn btn-primary sm" data-tie>🎀 낱개 열 개 묶기</button></div>`;
    const tieB = $('[data-tie]', box);
    const draw = () => {
      const n = t * 10 + o;
      $('.m-act-big', box).innerHTML = `<div class="m-b10"><span class="m-rods">${'<i class="m-rod"></i>'.repeat(t)}</span>${o ? `<span class="m-ones${o >= 10 ? ' many' : ''}">${'<i class="m-one"></i>'.repeat(o)}</span>` : ''}</div>`;
      $('.m-act-eq', box).innerHTML = `십 묶음 <b>${t}</b>개 · 낱개 <b>${o}</b>개 → <b>${o >= 10 ? '?' : n}</b>`;
      tieB.disabled = o < 10;
      if (m.open) return api.status(o >= 10 ? '낱개가 열 개 넘었어요. 묶어 봐요!' : ' ');
      if (n === m.goal && o < 10) api.done(m.win);
      else { api.undo(); api.status(o >= 10 ? '낱개가 열 개 넘었어요. 열 개를 묶어 봐요.' : ' '); }
    };
    $$('[data-d]', box).forEach(b => b.onclick = () => {
      const d = b.dataset.d;
      if (d === 't+' && t < 10) t++; else if (d === 't-' && t > 0) t--; else if (d === 'o+' && o < 19) o++; else if (d === 'o-' && o > 0) o--; else return;
      Speech.sfx.tap(); draw();
    });
    tieB.onclick = () => { if (o < 10 || t >= 10) return; o -= 10; t++; Speech.sfx.correct(); draw(); };
    draw();
  },
};

// ── 모양: 물건을 세모·네모·동그라미 바구니에 넣고, 점판에 세모·네모를 만든다 ──
MATH_ACTS.shape = {
  missions: [
    { text: '물건을 눌러서 같은 모양 바구니에 넣어 봐요.', sort: true, bins: [{ k: 'tri', label: '🔺 세모' }, { k: 'sq', label: '🟦 네모' }, { k: 'ci', label: '🟠 동그라미' }],
      items: [['🍕', 'tri'], ['⛺', 'tri'], ['🍙', 'tri'], ['📦', 'sq'], ['🖼️', 'sq'], ['📱', 'sq'], ['⚽', 'ci'], ['🍪', 'ci'], ['🕒', 'ci']].map(([e, k]) => ({ e, k })), win: '모두 넣었어요! 뾰족한 곳이 셋이면 세모, 넷이면 네모, 없으면 동그라미예요.' },
    { text: '이번에는 네모와 동그라미예요. 물건을 같은 모양 바구니에 넣어 봐요.', sort: true, bins: [{ k: 'sq', label: '🟦 네모' }, { k: 'ci', label: '🟠 동그라미' }],
      items: [['🔲', 'sq'], ['🧇', 'sq'], ['🟩', 'sq'], ['🍩', 'ci'], ['🪙', 'ci'], ['🌕', 'ci']].map(([e, k]) => ({ e, k })), win: '모두 넣었어요! 뾰족한 곳이 넷이면 네모, 없으면 동그라미예요.' },
    { text: '점을 차례로 눌러 세모(삼각형)를 만들어 봐요. 처음 점을 다시 누르면 닫혀요.', geo: 3 },
    { text: '이번에는 네모(사각형)를 만들어 봐요.', geo: 4 },
    { text: '뾰족한 곳이 다섯 개인 오각형을 만들어 봐요. 처음 점을 다시 누르면 닫혀요.', geo: 5 },
  ],
  free: { text: '점을 이어 마음대로 모양을 만들어 봐요.', geo: 0 },
  mount(box, m, api) {
    if (m.sort) return mSortMount(box, m, api, it => `${it.e}의 뾰족한 곳을 세어 봐요`);
    MATH_ACTS.poly.mount(box, m.geo ? { n: m.geo } : {}, api);
  },
};

// ── 같은 것끼리(집합): 정한 규칙대로 바구니에 나눠 담는다 ──
MATH_ACTS.group = {
  missions: [
    { text: '과일은 과일 바구니에, 동물은 동물 바구니에 넣어 봐요.', bins: [{ k: 'f', label: '🧺 과일' }, { k: 'a', label: '🏠 동물' }], items: [['🍎', 'f'], ['🍌', 'f'], ['🍇', 'f'], ['🐶', 'a'], ['🐱', 'a'], ['🐥', 'a'], ['🍓', 'f'], ['🐰', 'a']].map(([e, k]) => ({ e, k })), win: '같은 성질끼리 모은 무리를 집합이라고 해요!' },
    { text: '하늘을 나는 것과 물에 사는 것으로 나눠 봐요.', bins: [{ k: 's', label: '☁️ 하늘' }, { k: 'w', label: '🌊 물' }], items: [['🐦', 's'], ['🦋', 's'], ['✈️', 's'], ['🐟', 'w'], ['🐙', 'w'], ['🐳', 'w'], ['🦅', 's'], ['🐠', 'w']].map(([e, k]) => ({ e, k })) },
    { text: '땅에서 달리는 탈것과 물에 뜨는 탈것으로 나눠 봐요.', bins: [{ k: 'l', label: '🛣️ 땅' }, { k: 'w', label: '🌊 물' }], items: [['🚗', 'l'], ['🚌', 'l'], ['🚲', 'l'], ['🚂', 'l'], ['⛵', 'w'], ['🚤', 'w'], ['🛳️', 'w']].map(([e, k]) => ({ e, k })), win: '땅에서 달리는 것과 물에 뜨는 것으로 나눴어요!' },
    { text: '과일과 채소로 나눠 봐요.', bins: [{ k: 'f', label: '🧺 과일' }, { k: 'v', label: '🥬 채소' }], items: [['🍎', 'f'], ['🍌', 'f'], ['🍇', 'f'], ['🍑', 'f'], ['🥕', 'v'], ['🥦', 'v'], ['🥒', 'v'], ['🍆', 'v']].map(([e, k]) => ({ e, k })), win: '과일 무리와 채소 무리로 나눴어요!' },
    { text: '이번에는 세 무리예요. 탈것, 몸에 걸치는 것, 먹을 것으로 나눠 봐요.', bins: [{ k: 'v', label: '🚗 탈것' }, { k: 'c', label: '👕 걸치는 것' }, { k: 'f', label: '🍞 먹을 것' }], items: [['🚲', 'v'], ['🚌', 'v'], ['🚀', 'v'], ['🧢', 'c'], ['👗', 'c'], ['🧦', 'c'], ['🍔', 'f'], ['🍩', 'f'], ['🥕', 'f']].map(([e, k]) => ({ e, k })) },
  ],
  mount(box, m, api) { mSortMount(box, m, api); },
};
MATH_ACTS.group.free = MATH_ACTS.group.missions[4];

// ── 규칙 찾기: 구슬 줄에 규칙대로 다음 구슬을 꿴다 ──
(() => {
  const C = { r: '빨강', y: '노랑', b: '파랑', g: '초록' };
  const bead = k => `<i class="m-bead ${k}"></i>`;
  MATH_ACTS.pattern = {
    missions: [
      { text: '규칙을 찾아 다음 구슬 네 개를 꿰어 봐요.', unit: 'ry', win: '규칙대로 꿰었어요! 빨강, 노랑이 한 묶음이에요.' },
      { text: '이번 규칙은 조금 길어요. 다음 구슬을 꿰어 봐요.', unit: 'rrb', win: '규칙대로 꿰었어요! 빨강, 빨강, 파랑이 한 묶음이에요.' },
      { text: '세 가지 색이 돌아가요. 다음 구슬을 꿰어 봐요.', unit: 'ybg', win: '규칙대로 꿰었어요! 노랑, 파랑, 초록이 한 묶음이에요.' },
      { text: '이 규칙도 찾아봐요.', unit: 'gbb', win: '규칙대로 꿰었어요! 초록, 파랑, 파랑이 한 묶음이에요.' },
      { text: '구슬 네 개가 한 묶음이에요. 다음 구슬을 꿰어 봐요.', unit: 'rryy', win: '규칙대로 꿰었어요! 빨강, 빨강, 노랑, 노랑이 한 묶음이에요.' },
      { text: '마지막 규칙이에요. 어디서부터 다시 되풀이되는지 찾아봐요.', unit: 'rgbg', win: '규칙대로 꿰었어요! 빨강, 초록, 파랑, 초록이 한 묶음이에요.' },
    ],
    free: { text: '내 규칙을 정해 구슬을 꿰어 봐요.', open: true },
    mount(box, m, api) {
      const shown = m.open ? [] : [...m.unit.repeat(2)], need = m.open ? 0 : Math.max(4, m.unit.length + 1), add = [];
      box.innerHTML = `<div class="m-act-string"></div><div class="row-center m-act-pal">${Object.entries(C).map(([k, n]) => `<button class="btn btn-ghost sm" data-k="${k}" aria-label="${n}">${bead(k)} ${n}</button>`).join('')}${m.open ? '<button class="btn btn-ghost sm" data-back>↩️</button>' : ''}</div>`;
      const s = $('.m-act-string', box);
      const draw = () => { s.innerHTML = `${shown.map(bead).join('')}${add.map(k => bead(k)).join('')}${Array.from({ length: Math.max(0, need - add.length) }, () => '<i class="m-bead q">?</i>').join('')}`; };
      $$('[data-k]', box).forEach(b => b.onclick = () => {
        const k = b.dataset.k;
        if (m.open) { add.push(k); Speech.sfx.tap(); draw(); return api.status(add.length >= 6 ? '멋진 구슬 줄이에요! 규칙이 보이나요?' : `구슬 ${add.length}개`); }
        if (add.length >= need) return;
        const want = m.unit[(shown.length + add.length) % m.unit.length];
        if (k !== want) { Speech.sfx.wrong(); return api.status(`앞에서 ${[...m.unit].map(x => C[x]).join(', ')} 차례가 되풀이돼요. 몇 번째인지 세어 봐요`); }
        add.push(k); Speech.sfx.tap(); draw();
        if (add.length === need) api.done(m.win); else api.status(' ');
      });
      if (m.open) $('[data-back]', box).onclick = () => { add.pop(); draw(); };
      draw();
    },
  };
})();

// ── 그림 표: 흩어진 물건을 눌러 표의 제 줄로 옮기고, 표를 보고 답한다 ──
MATH_ACTS.table = {
  missions: [
    { text: '과일을 하나씩 눌러 표에 옮겨 봐요. 다 옮기면 가장 많은 과일을 눌러요.', kinds: ['🍎', '🍌', '🍓'], ask: 'max', win: '맞아요! 줄이 가장 긴 과일이 가장 많아요.' },
    { text: '탈것을 표에 옮겨 봐요. 다 옮기면 가장 많은 탈것을 눌러요.', kinds: ['🚗', '🚌', '🚲'], ask: 'max', win: '맞아요! 줄이 가장 긴 탈것이 가장 많아요.' },
    { text: '채소를 표에 옮겨 봐요. 다 옮기면 가장 적은 채소를 눌러요.', kinds: ['🥕', '🥦', '🥒'], ask: 'min', win: '맞아요! 줄이 가장 짧은 채소가 가장 적어요.' },
    { text: '동물을 표에 옮겨 봐요. 다 옮기면 가장 적은 동물을 눌러요.', kinds: ['🐶', '🐱', '🐰', '🐥'], ask: 'min', win: '맞아요! 줄이 가장 짧은 동물이 가장 적어요.' },
    { text: '과일 네 가지를 표에 옮겨 봐요. 다 옮기면 가장 많은 과일을 눌러요.', kinds: ['🍎', '🍌', '🍓', '🍇'], ask: 'max', win: '맞아요! 네 줄 가운데 가장 긴 줄이 가장 많아요.' },
  ],
  free: { text: '과일을 표에 옮기며 세어 봐요.', kinds: ['🍎', '🍌', '🍓', '🍇'] },
  mount(box, m, api) {
    let n; do { n = m.kinds.map(() => 1 + mR(5)); } while (m.ask && n.filter(v => v === (m.ask === 'max' ? Math.max(...n) : Math.min(...n))).length > 1);
    const items = MathGen.shuffle(n.flatMap((k, i) => Array(k).fill(i))).map((k, j) => ({ k, j, on: true })), got = n.map(() => 0);
    box.innerHTML = `<div class="m-sort-items m-act-scene"></div><table class="m-act-tab"></table>`;
    const sc = $('.m-act-scene', box), tb = $('.m-act-tab', box);
    const draw = () => {
      sc.innerHTML = items.filter(x => x.on).map(x => `<button class="m-sort-it" data-j="${x.j}">${m.kinds[x.k]}</button>`).join('') || '<small>다 옮겼어요!</small>';
      tb.innerHTML = m.kinds.map((e, i) => `<tr data-r="${i}"><th>${e}</th><td>${`<span>${e}</span>`.repeat(got[i])}</td><td class="n">${got[i]}</td></tr>`).join('');
      $$('.m-sort-it', sc).forEach(b => { b.onclick = () => { const it = items[+b.dataset.j]; it.on = false; got[it.k]++; Speech.sfx.tap(); draw(); };
        // 끌어서 표의 줄에 놓아도 된다. 다른 줄이면 제자리로
        mDrag(b, { find: (x, y) => mAt(x, y, 'tr[data-r]', tb), drop: tr => { const it = items[+b.dataset.j]; if (+tr.dataset.r === it.k) { b.onclick(); return true; } Speech.sfx.wrong(); api.status(`${m.kinds[it.k]} 줄에 놓아요`); return false; } }); });
      const left = items.filter(x => x.on).length;
      if (left) return api.status(`${left}개 남았어요`);
      if (!m.ask) return api.status('다 옮겼어요! 무엇이 가장 많은가요?');
      api.status(m.ask === 'max' ? '가장 많은 줄을 눌러요' : '가장 적은 줄을 눌러요');
      $$('tr', tb).forEach(r => r.onclick = () => {
        const i = +r.dataset.r, t = m.ask === 'max' ? Math.max(...got) : Math.min(...got);
        if (got[i] === t) { r.classList.add('hi'); api.done(`맞아요! ${m.kinds[i]} ${got[i]}${mUnit(m.kinds[i])}, 줄이 ${m.ask === 'max' ? '가장 길어요' : '가장 짧아요'}.`, m.win); }
        else { Speech.sfx.wrong(); api.status('줄의 길이를 견주어 봐요'); }
      });
    };
    draw();
  },
};

// ── 똑같은 모양: 조각을 돌리고 뒤집어 그림자에 맞추고, 크게 키워 닮은 모양을 만든다 ──
(() => {
  const SH = { L: [[0, 0], [0, 1], [0, 2], [1, 2]], T: [[0, 0], [1, 0], [2, 0], [1, 1]], S: [[1, 0], [2, 0], [0, 1], [1, 1]], F: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], N: [[1, 0], [1, 1], [0, 2], [1, 2], [0, 3]] };
  const big = (c, k) => MathGen.pNorm(c.flatMap(([x, y]) => Array.from({ length: k * k }, (_, i) => [x * k + i % k, y * k + Math.floor(i / k)])));
  MATH_ACTS.same = {
    missions: [
      { text: '🔄 돌리기를 눌러 조각을 회색 그림자와 똑같이 만들어 봐요.', sh: 'L', rot: 1 },
      { text: '이번 조각도 돌려서 맞춰 봐요.', sh: 'T', rot: 2 },
      { text: '돌리기만으로는 안 될 수도 있어요. ↔️ 뒤집기도 써 봐요.', sh: 'S', flip: true },
      { text: '돌리고 뒤집어서 맞춰 봐요.', sh: 'F', rot: 3, flip: true },
      { text: '➕ 키우기를 눌러 조각을 그림자와 똑같은 크기로 만들어 봐요. 모양은 같고 크기만 달라요.', sh: 'L', grow: 2 },
    ],
    free: { text: '조각을 마음대로 돌리고 뒤집고 키워 봐요.', sh: 'N', open: true },
    mount(box, m, api) {
      let goal = MathGen.pNorm(SH[m.sh]);
      for (let i = 0; i < (m.rot || 0); i++) goal = MathGen.pRot(goal);
      if (m.flip) goal = MathGen.pFlip(goal);
      if (m.grow) goal = big(goal, m.grow);
      let cur = MathGen.pNorm(SH[m.sh]), k = 1;
      box.innerHTML = `<div class="m-act-row">${m.open ? '' : `<div class="m-act-goal"><b>그림자</b><div class="m-act-shadow"></div></div>`}<div class="m-act-goal"><b>내 조각</b><div class="m-act-piece"></div></div></div>
        <div class="row-center"><button class="btn btn-ghost sm" data-rot>🔄 돌리기</button><button class="btn btn-ghost sm" data-flip>↔️ 뒤집기</button>${m.grow || m.open ? '<button class="btn btn-ghost sm" data-big>➕ 키우기</button><button class="btn btn-ghost sm" data-small>➖ 줄이기</button>' : ''}</div>`;
      if (!m.open) $('.m-act-shadow', box).innerHTML = MathGen.pSvg(goal, '#cfd8dc', m.grow ? 16 : 26);
      const draw = () => {
        const c = big(cur, k);
        $('.m-act-piece', box).innerHTML = MathGen.pSvg(c, '#4db6ac', m.grow || m.open ? 16 : 26);
        if (m.open) return api.status(k > 1 ? `${k}배로 키웠어요. 모양은 그대로예요` : ' ');
        if (MathGen.pKey(c) === MathGen.pKey(goal)) api.done(m.grow ? '크기만 다르고 모양이 같은 것을 닮음이라고 해요!' : '딱 맞아요! 돌리거나 뒤집어서 겹치는 모양을 합동이라고 해요.'); else api.status(' ');
      };
      $('[data-rot]', box).onclick = () => { cur = MathGen.pRot(cur); Speech.sfx.tap(); draw(); };
      $('[data-flip]', box).onclick = () => { cur = MathGen.pFlip(cur); Speech.sfx.tap(); draw(); };
      if ($('[data-big]', box)) { $('[data-big]', box).onclick = () => { if (k >= 3) return Speech.sfx.wrong(); k++; Speech.sfx.tap(); draw(); }; $('[data-small]', box).onclick = () => { if (k <= 1) return Speech.sfx.wrong(); k--; Speech.sfx.tap(); draw(); }; }
      draw();
    },
  };
})();

// ── 더하기·빼기: 10칸 틀 두 개로 10을 먼저 만들어 더하고(10 짝꿍), 구슬을 눌러 덜어 낸다 ──
MATH_ACTS.addsub = {
  missions: [
    { text: '8 + 5예요. 파란 구슬을 하나씩 눌러 위 틀부터 채워 봐요. 10을 먼저 만들면 쉬워요.', a: 8, b: 5 },
    { text: '7 + 6도 10을 먼저 만들어 더해 봐요.', a: 7, b: 6 },
    { text: '9 + 4예요. 9의 10 짝꿍은 몇일까요?', a: 9, b: 4 },
    { text: '13 − 5예요. 구슬을 눌러서 5개를 덜어 내 봐요. 아래 틀의 3개부터 빼면 쉬워요.', a: 13, sub: 5 },
    { text: '12 − 4도 구슬을 덜어 내서 풀어 봐요.', a: 12, sub: 4 },
  ],
  free: { text: '파란 구슬을 더하거나 구슬을 덜어 내며 마음대로 셈해 봐요.', a: 6, b: 9, open: true },
  mount(box, m, api) {
    const c = Array(20).fill(0);
    for (let i = 0; i < m.a; i++) c[i] = 1;
    let tray = m.b || 0, gone = 0;
    box.innerHTML = `<div class="m-act-tf2"></div>${m.b ? '<div class="m-act-tray"></div>' : ''}<p class="m-act-eq"></p>`;
    const v = $('.m-act-tf2', box), tr = $('.m-act-tray', box), eq = $('.m-act-eq', box);
    const draw = () => {
      v.innerHTML = mFrame(c.slice(0, 10)) + mFrame(c.slice(10), 'two');
      if (tr) tr.innerHTML = tray ? `${Array.from({ length: tray }, () => '<button class="m-tray-b" aria-label="파란 구슬"><i class="m-bead b"></i></button>').join('')}` : '<small>다 옮겼어요</small>';
      const red = c.filter(x => x === 1).length, blue = c.filter(x => x === 2).length;
      if (m.b) {
        const in1 = c.slice(0, 10).filter(x => x === 2).length;
        eq.innerHTML = `${m.a} + ${m.b}${blue ? ` → ${m.a} + <b>${in1}</b> = ${m.a + in1}${blue > in1 ? `, ${m.a + in1} + <b>${blue - in1}</b> = <b>${m.a + blue}</b>` : ''}` : ''}`;
        if (!tray && !m.open) api.done(`${m.a} + ${m.b} = ${m.a + m.b}! ${m.a}에 ${mJo(10 - m.a, '을', '를')} 더해 10을 만들고, 남은 ${mJo(m.b - (10 - m.a), '을', '를')} 더했어요.`);
        else api.status(tray ? '파란 구슬을 눌러 틀로 옮겨요' : `${m.a} + ${m.b} = ${m.a + m.b}`);
      } else {
        eq.innerHTML = `${m.a} − ${gone} = <b>${m.a - gone}</b>`;
        if (!m.open && gone === m.sub) api.done(`${m.a} − ${m.sub} = ${m.a - m.sub}! ${m.a - 10}개를 먼저 빼서 10을 만들고, ${m.sub - (m.a - 10)}개를 더 뺐어요.`);
        else if (!m.open && gone > m.sub) api.status('너무 많이 뺐어요. 처음부터 해 봐요');
        else api.status(`${gone}개 덜어 냈어요`);
      }
      $$('.m-tfc', v).forEach((e, idx) => e.onclick = () => {
        if (m.b && !m.open) return;
        const i = idx; if (c[i] !== 1 && c[i] !== 2) return Speech.sfx.wrong();
        c[i] = 3; gone++; Speech.sfx.tap(); draw();
      });
      if (tr) $$('.m-tray-b', tr).forEach(b => b.onclick = () => { const i = c.findIndex(x => x === 0); if (i < 0) return; c[i] = 2; tray--; Speech.sfx.tap(); draw(); });
    };
    draw();
  },
};

// ── 마방진: 수 카드를 눌러 빈칸에 놓으면 줄마다 합이 바로 보인다. 모든 줄이 15면 완성 ──
MATH_ACTS.magic = {
  missions: [
    { text: '수 카드를 빈칸에 끌어 놓거나, 카드를 누르고 빈칸을 눌러 넣어요. 가로·세로·대각선의 합이 모두 15가 되게요.', holes: 2 },
    { text: '이번에는 빈칸이 세 개예요. 줄마다 합이 15가 되게 넣어 봐요.', holes: 3 },
    { text: '빈칸이 더 많아요. 합이 15가 안 되는 줄을 보고 카드를 바꿔 봐요.', holes: 5 },
    { text: '빈칸이 여섯 개예요. 빨간 합을 보며 카드를 바꿔 봐요.', holes: 6 },
    { text: '가운데 5만 남았어요. 1부터 9까지 모두 넣어 마방진을 완성해 봐요.', holes: 8 },
  ],
  free: { text: '1부터 9까지 마음대로 넣으며 합을 견주어 봐요.', holes: 9, open: true },
  mount(box, m, api) {
    const q = MathGen.magic(m.holes === 9 ? 8 : m.holes);
    if (m.holes === 8) q.holes = [0, 1, 2, 3, 5, 6, 7, 8];
    const g = q.sol.map((v, i) => q.holes.includes(i) || m.holes === 9 ? null : v), giv = g.map(v => v !== null);
    let pool = m.holes === 9 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : q.holes.map(i => q.sol[i]).sort((a, b) => a - b), sel = null;
    if (m.holes === 9) g.fill(null), giv.fill(false);
    box.innerHTML = `<div class="m-act-magic"></div><div class="row-center m-act-pool"></div>`;
    const v = $('.m-act-magic', box), p = $('.m-act-pool', box);
    const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const sum = l => l.every(i => g[i] !== null) ? l.reduce((s, i) => s + g[i], 0) : null;
    const draw = () => {
      const s = L.map(sum), tag = k => `<span class="m-sum ${s[k] === 15 ? 'ok' : s[k] !== null ? 'no' : ''}">${s[k] ?? ''}</span>`;
      v.innerHTML = `<span class="m-sum d">${tag(7)}</span><span></span><span></span><span></span><span class="m-sum d">${tag(6)}</span>
        ${[0, 1, 2].map(r => `<span></span>${[0, 1, 2].map(cc => { const i = r * 3 + cc; return `<button class="m-mg ${giv[i] ? 'giv' : ''}" data-i="${i}">${g[i] ?? ''}</button>`; }).join('')}${tag(r)}`).join('')}
        <span></span>${[3, 4, 5].map(tag).join('')}<span></span>`;
      p.innerHTML = pool.map((n, j) => `<button class="m-card ${sel === j ? 'sel' : ''}" data-j="${j}">${n}</button>`).join('') || '<small>카드를 다 넣었어요</small>';
      $$('.m-card', p).forEach(b => { b.onclick = () => { sel = +b.dataset.j; Speech.sfx.tap(); draw(); };
        // 끌어서 빈칸에 놓아도 된다
        mDrag(b, { find: (x, y) => mAt(x, y, '.m-mg', v), drop: c => { const i = +c.dataset.i; if (giv[i] || g[i] !== null) { Speech.sfx.wrong(); api.status('빈칸에 놓아요'); return false; } sel = +b.dataset.j; c.click(); return true; } }); });
      $$('.m-mg', v).forEach(b => b.onclick = () => {
        const i = +b.dataset.i; if (giv[i]) return Speech.sfx.wrong();
        if (g[i] !== null) { pool.push(g[i]); pool.sort((a, b2) => a - b2); g[i] = null; sel = null; }
        else if (sel !== null) { g[i] = pool[sel]; pool.splice(sel, 1); sel = null; }
        else return api.status('먼저 아래 수 카드를 눌러요');
        Speech.sfx.tap(); draw();
      });
      if (s.every(x => x === 15)) api.done('모든 줄의 합이 15! 마방진 완성이에요. 가운데는 늘 5예요.');
      else api.status(g.includes(null) ? '카드를 눌러 빈칸에 넣어요 · 넣은 칸을 다시 누르면 빠져요' : '합이 15가 아닌 줄(빨강)이 있어요. 칸을 눌러 빼고 바꿔 봐요');
    };
    draw();
  },
};

// ── 스도쿠: 칸을 고르고 수를 눌러 넣는다. 같은 줄·같은 굵은 네모에 겹치면 빨갛게 ──
MATH_ACTS.sudoku = {
  missions: [{ text: '빈칸을 누르고 아래 수를 골라 넣어요. 가로줄·세로줄·굵은 네모에 1, 2, 3, 4가 한 번씩!', holes: 3 }, { text: '빈칸이 다섯 개예요. 줄마다 빠진 수를 찾아 넣어요.', holes: 5 }, { text: '빈칸이 더 많아요. 겹치는 수(빨강)가 없게 채워 봐요.', holes: 8 }, { text: '도전! 빈칸이 열 개예요.', holes: 10 }, { text: '마지막 도전! 빈칸이 열두 개예요. 확실한 칸부터 채워요.', holes: 12 }],
  free: { text: '빈칸이 많은 스도쿠를 풀어 봐요.', holes: 11 },
  mount(box, m, api) {
    const q = MathGen.sudoku(m.holes), g = q.sol.map((v, i) => q.holes.includes(i) ? 0 : v), giv = g.map(Boolean);
    let cur = q.holes[0];
    box.innerHTML = `<div class="m-act-sdk"></div><div class="row-center m-act-pool">${[1, 2, 3, 4].map(n => `<button class="m-card" data-n="${n}">${n}</button>`).join('')}<button class="m-card" data-n="0" aria-label="지우기">⌫</button></div>`;
    const v = $('.m-act-sdk', box);
    const bad = i => { if (!g[i]) return false; const r = Math.floor(i / 4), c = i % 4, br = r - r % 2, bc = c - c % 2; return g.some((x, j) => j !== i && x === g[i] && (Math.floor(j / 4) === r || j % 4 === c || (Math.floor(j / 4) - Math.floor(j / 4) % 2 === br && j % 4 - j % 4 % 2 === bc))); };
    const draw = () => {
      v.innerHTML = g.map((x, i) => `<button class="m-sd ${giv[i] ? 'giv' : ''} ${i === cur ? 'cur' : ''} ${bad(i) ? 'bad' : ''} ${i % 4 === 1 ? 'br' : ''} ${Math.floor(i / 4) === 1 ? 'bb' : ''}" data-i="${i}">${x || ''}</button>`).join('');
      $$('.m-sd', v).forEach(b => b.onclick = () => { const i = +b.dataset.i; if (giv[i]) return Speech.sfx.wrong(); cur = i; Speech.sfx.tap(); draw(); });
      if (g.every(Boolean) && !g.some((_, i) => bad(i))) api.done('스도쿠 완성! 줄마다 1, 2, 3, 4가 한 번씩 들어갔어요.'); else api.status(g.some((_, i) => bad(i)) ? '빨간 수가 같은 줄이나 네모에 겹쳤어요' : ' ');
    };
    $$('[data-n]', box).forEach(b => b.onclick = () => { if (cur === null || giv[cur]) return; g[cur] = +b.dataset.n; Speech.sfx.tap(); draw(); });
    draw();
  },
};

// ── 벤 다이어그램: 물건을 고르고 들어갈 곳(왼쪽·겹친 곳·오른쪽·바깥)을 누른다 ──
MATH_ACTS.venn = {
  missions: [
    { text: '물건을 누르고, 들어갈 곳을 눌러요. 과일이면서 빨간 것은 겹친 곳이에요.', A: '과일', B: '빨간', items: ['🍎', '🍓', '🍌', '🍋', '🦀', '🚒', '🐸'] },
    { text: '이번에는 동물과 노란 것이에요.', A: '동물', B: '노란', items: ['🐥', '🦀', '🐸', '🍌', '🚕', '🍋', '🍎'] },
    { text: '동물과 초록색 것으로 나눠 봐요.', A: '동물', B: '초록', items: ['🐸', '🐥', '🦀', '🍏', '🍌', '🚒'] },
    { text: '이번에는 탈것과 빨간 것이에요.', A: '탈것', B: '빨간', items: ['🚒', '🚕', '🍎', '🍓', '🦀', '🍌', '🐸'] },
    { text: '마지막이에요. 과일과 노란 것으로 나눠 봐요. 물건이 많으니 하나씩 따져 봐요.', A: '과일', B: '노란', items: ['🍌', '🍋', '🍎', '🍓', '🍒', '🐥', '🚕', '🐸'] },
  ],
  free: { text: '과일과 초록색 것으로 나눠 봐요.', A: '과일', B: '초록', items: ['🍏', '🐸', '🍎', '🍌', '🐥', '🚒'] },
  mount(box, m, api) {
    const left = MathGen.shuffle(m.items), placed = [], N = { 빨간: '빨간 것', 노란: '노란 것', 초록: '초록색 것' }[m.B];
    let sel = null;
    box.innerHTML = `<div class="m-sort-items"></div><div class="m-act-venn"></div><div class="row-center m-act-vbtn"><button class="btn btn-ghost sm" data-r="a">🔵 ${m.A}에만</button><button class="btn btn-ghost sm" data-r="ab">💜 겹친 곳</button><button class="btn btn-ghost sm" data-r="b">🔴 ${N}에만</button><button class="btn btn-ghost sm" data-r="o">⬜ 바깥</button></div>`;
    const draw = () => {
      $('.m-sort-items', box).innerHTML = left.map((e, i) => `<button class="m-sort-it ${sel === i ? 'sel' : ''}" data-i="${i}">${e}</button>`).join('') || '<small>다 넣었어요!</small>';
      $('.m-act-venn', box).innerHTML = MathGen.vennSvg(m.A, m.B, placed);
      $$('.m-sort-it', box).forEach(b => { b.onclick = () => { sel = +b.dataset.i; Speech.sfx.tap(); draw(); };
        mDrag(b, { find: spot, drop: t => { const n = left.length; sel = +b.dataset.i; t.click(); if (left.length === n) draw(); return left.length < n; } }); });
    };
    // 끌어서 놓은 곳: 그림의 동그라미 안(왼쪽·겹친 곳·오른쪽·바깥) 또는 아래 단추
    const spot = (x, y) => {
      const btn = mAt(x, y, '[data-r]', box); if (btn) return btn;
      const svg = $('.m-act-venn svg', box), r = svg && svg.getBoundingClientRect();
      if (!r || x < r.left || x > r.right || y < r.top || y > r.bottom) return null;
      const vx = (x - r.left) / r.width * 320, vy = (y - r.top) / r.height * 210, inA = Math.hypot(vx - 120, vy - 108) <= 80, inB = Math.hypot(vx - 200, vy - 108) <= 80;
      return $(`[data-r="${inA ? (inB ? 'ab' : 'a') : inB ? 'b' : 'o'}"]`, box);
    };
    $$('[data-r]', box).forEach(b => b.onclick = () => {
      if (sel === null) return api.status('먼저 물건을 눌러요');
      const e = left[sel], r = MathGen.vRegion(e, m.A, m.B);
      if (r !== b.dataset.r) { Speech.sfx.wrong(); return api.status(`${e}는 ${m.A}인가요? ${N}인가요? 둘 다 따져 봐요`); }
      placed.push({ e, r }); left.splice(sel, 1); sel = null; Speech.sfx.tap(); draw();
      if (!left.length) api.done('다 넣었어요! 두 무리에 모두 드는 것은 겹친 곳에 있어요.'); else api.status(`${left.length}개 남았어요`);
    });
    draw(); api.status('물건을 끌어서 들어갈 곳에 놓아요. 눌러서 고른 다음 아래 단추를 눌러도 돼요');
  },
};

// ── 막대그래프: 조사한 수만큼 칸을 눌러 막대를 세우고, 그래프를 읽는다 ──
MATH_ACTS.graph = {
  missions: [
    { text: '친구들이 좋아하는 과일을 조사했어요. 칸을 눌러 수만큼 막대를 세워 봐요. 다 세우면 가장 많은 것을 눌러요.', kinds: ['🍎', '🍌', '🍓', '🍇'], ask: 'max', win: '맞아요! 가장 긴 막대가 가장 많아요. 그래프로 보니 한눈에 알 수 있어요.' },
    { text: '좋아하는 동물로 막대그래프를 만들어 봐요. 다 세우면 가장 적은 것을 눌러요.', kinds: ['🐶', '🐱', '🐰'], ask: 'min', win: '맞아요! 가장 짧은 막대가 가장 적어요. 그래프로 보니 한눈에 알 수 있어요.' },
    { text: '타고 싶은 탈것을 조사했어요. 막대를 세우고 가장 많은 것을 눌러요.', kinds: ['🚗', '🚌', '🚲'], ask: 'max', win: '맞아요! 가장 긴 막대가 가장 많이 고른 탈것이에요.' },
    { text: '좋아하는 채소로 막대그래프를 만들어 봐요. 다 세우면 가장 적은 것을 눌러요.', kinds: ['🥕', '🥦', '🥒', '🍆'], ask: 'min', win: '맞아요! 가장 짧은 막대가 가장 적게 고른 채소예요.' },
    { text: '동물 네 가지로 막대그래프를 만들어 봐요. 다 세우면 가장 많은 것을 눌러요.', kinds: ['🐶', '🐱', '🐰', '🐥'], ask: 'max', win: '맞아요! 네 막대 가운데 가장 긴 막대가 가장 많아요.' },
  ],
  free: { text: '칸을 눌러 마음대로 막대그래프를 만들어 봐요.', kinds: ['🍎', '🍌', '🍓', '🍇'], open: true },
  mount(box, m, api) {
    const H = 6; let n; do { n = m.kinds.map(() => 1 + mR(H)); } while (m.ask && n.filter(v => v === (m.ask === 'max' ? Math.max(...n) : Math.min(...n))).length > 1);
    const h = m.kinds.map(() => 0);
    box.innerHTML = `${m.open ? '' : `<div class="m-act-data">${m.kinds.map((e, i) => `<span>${e.repeat(n[i])}</span>`).join('')}</div>`}<div class="m-act-bars" style="--c:${m.kinds.length}"></div>`;
    const v = $('.m-act-bars', box);
    let asking = false;
    const draw = () => {
      v.innerHTML = Array.from({ length: H }, (_, r) => { const lv = H - r; return `<b class="ax">${lv}</b>${m.kinds.map((_, i) => `<button class="m-bar ${h[i] >= lv ? 'on' : ''}" data-i="${i}" data-l="${lv}" aria-label="${m.kinds[i]} ${lv}"></button>`).join('')}`; }).join('') + `<span></span>${m.kinds.map((e, i) => `<button class="m-bar-k" data-k="${i}">${e}</button>`).join('')}`;
      $$('.m-bar', v).forEach(b => b.onclick = () => { const i = +b.dataset.i, l = +b.dataset.l; h[i] = h[i] === l ? l - 1 : l; Speech.sfx.tap(); draw(); });
      $$('.m-bar-k', v).forEach(b => b.onclick = () => {
        if (!asking) return;
        const i = +b.dataset.k, t = m.ask === 'max' ? Math.max(...h) : Math.min(...h);
        if (h[i] === t) api.done(`맞아요! ${m.kinds[i]} 막대가 ${m.ask === 'max' ? '가장 길어요' : '가장 짧아요'}. 그래프로 보니 한눈에 알 수 있어요.`, m.win); else { Speech.sfx.wrong(); api.status('막대 길이를 견주어 봐요'); }
      });
      if (m.open) return api.status(' ');
      asking = h.every((v2, i) => v2 === n[i]);
      api.status(asking ? (m.ask === 'max' ? '그래프 완성! 가장 많은 것의 그림을 눌러요' : '그래프 완성! 가장 적은 것의 그림을 눌러요') : '위 그림 수만큼 칸을 눌러 막대를 세워요');
    };
    draw();
  },
};

// ── 가장 짧은 길: 집에서 출발해 옆 칸을 눌러 한 칸씩 걸어 학교까지 간다 ──
(() => {
  const W = 5, H = 4;
  const bfs = (walls, s, g) => { const d = { [s]: 0 }, q = [s]; while (q.length) { const v = q.shift(); const x = v % W, y = Math.floor(v / W); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, w = ny * W + nx; if (nx < 0 || ny < 0 || nx >= W || ny >= H || walls.includes(w) || w in d) continue; d[w] = d[v] + 1; q.push(w); } } return d[g]; };
  MATH_ACTS.path = {
    missions: [
      { text: '🏠 집에서 출발해요. 옆 칸을 차례로 눌러 🏫 학교까지 가장 짧게 가 봐요.', walls: [], win: '7걸음, 가장 짧은 길이에요! 가로 4칸과 세로 3칸을 더한 수예요.' },
      { text: '가장 짧은 길은 하나만 있을까요? 다른 가장 짧은 길을 하나 더 찾아봐요.', walls: [], two: true },
      { text: '🌳 나무가 있는 칸은 못 지나가요. 가장 짧은 길로 가 봐요.', walls: [6, 7, 8], win: '7걸음, 가장 짧은 길이에요! 나무를 피해도 걸음 수는 그대로예요.' },
      { text: '나무가 여기저기 있어요. 가장 짧은 길을 찾아봐요.', walls: [10, 12, 7, 3], win: '7걸음, 가장 짧은 길이에요! 가로 4칸과 세로 3칸을 더한 수예요.' },
      { text: '이번에는 나무를 빙 돌아가야 해요. 가장 짧은 길은 몇 걸음일까요?', walls: [3, 8, 13, 16], win: '9걸음, 가장 짧은 길이에요! 나무를 돌아가느라 두 걸음 더 걸었어요.' },
    ],
    free: { text: '마음대로 길을 걸어 봐요.', walls: [8, 12], open: true },
    mount(box, m, api) {
      const s = (H - 1) * W, g = W - 1, best = bfs(m.walls, s, g), found = new Set();
      let p = [s];
      box.innerHTML = `<div class="m-act-map" style="--c:${W}"></div><div class="row-center"><button class="btn btn-ghost sm" data-back>↩️ 한 칸 뒤로</button></div>`;
      const v = $('.m-act-map', box);
      const draw = () => {
        const cur = p[p.length - 1];
        v.innerHTML = Array.from({ length: W * H }, (_, i) => `<button class="m-cellp ${p.includes(i) ? 'on' : ''} ${i === cur ? 'cur' : ''}" data-i="${i}">${i === s ? '🏠' : i === g ? '🏫' : m.walls.includes(i) ? '🌳' : i === cur ? '🚶' : p.includes(i) ? p.indexOf(i) : ''}</button>`).join('');
        $$('.m-cellp', v).forEach(b => b.onclick = () => {
          const i = +b.dataset.i, cx = cur % W, cy = Math.floor(cur / W), x = i % W, y = Math.floor(i / W);
          if (cur === g || m.walls.includes(i) || p.includes(i) || Math.abs(cx - x) + Math.abs(cy - y) !== 1) return Speech.sfx.wrong();
          p.push(i); Speech.sfx.tap(); draw();
          if (i !== g) return api.status(`${p.length - 1}걸음`);
          const n = p.length - 1;
          if (m.open) return api.status(`${n}걸음에 도착! 가장 짧은 길은 ${best}걸음이에요`);
          if (n > best) return api.status(`${n}걸음에 도착! 그런데 ${best}걸음 길이 있어요. 처음부터 다시 해 봐요`);
          found.add(p.join());
          if (m.two) return found.size >= 2 ? api.done(`${best}걸음 길을 두 가지 찾았어요! 학교 쪽으로만 가면 모두 가장 짧은 길이에요.`) : (api.status(`${best}걸음! 처음부터 눌러 다른 길로도 가 봐요`), setTimeout(() => { p = [s]; draw(); }, 900));
          api.done(m.win);
        });
      };
      $('[data-back]', box).onclick = () => { if (p.length > 1) p.pop(); Speech.sfx.tap(); draw(); api.status(`${p.length - 1}걸음`); };
      draw(); api.status('집 옆 칸부터 눌러요');
    },
  };
})();

// ── 마술 상자: 수를 넣어 보며 나오는 수를 보고 상자의 규칙을 알아맞힌다 ──
(() => {
  const RULES = { '+2': x => x + 2, '+3': x => x + 3, '+5': x => x + 5, '×2': x => x * 2, '×3': x => x * 3, '−1': x => x - 1 };
  MATH_ACTS.fbox = {
    missions: [
      { text: '상자에 수를 넣어 봐요. 나오는 수를 보고 상자의 규칙을 맞혀요.', rule: '+2', win: '맞아요! 넣은 수에 2를 더하는 상자예요.' },
      { text: '이번 상자도 수를 넣어 보며 규칙을 찾아봐요.', rule: '+3', win: '맞아요! 넣은 수에 3을 더하는 상자예요. 늘 같은 규칙으로 바꾸는 것을 함수라고 해요.' },
      { text: '이번 상자는 수가 작아져요. 어떤 규칙일까요?', rule: '−1', win: '맞아요! 넣은 수에서 1을 빼는 상자예요.' },
      { text: '이번 상자는 어떤 규칙일까요? 여러 수를 넣어 봐요.', rule: '×2', win: '맞아요! 넣은 수에 2를 곱하는 상자예요.' },
      { text: '마지막 상자예요. 1, 2, 3을 차례로 넣어 보며 규칙을 찾아봐요.', rule: '×3', win: '맞아요! 넣은 수에 3을 곱하는 상자예요. 1을 넣으면 3, 2를 넣으면 6이에요.' },
    ],
    free: { text: '아무 수나 넣어 보며 상자를 관찰해 봐요.', rule: '+5', open: true },
    mount(box, m, api) {
      const rows = [], opts = MathGen.shuffle([m.rule, ...MathGen.shuffle(Object.keys(RULES).filter(k => k !== m.rule)).slice(0, 3)]);
      box.innerHTML = `<div class="m-act-fbox"><span class="m-fb-in">?</span><span class="m-fb-box">🎩</span><span class="m-fb-out">?</span></div><div class="row-center m-act-pool">${[1, 2, 3, 4, 5, 6].map(n => `<button class="m-card" data-n="${n}">${n}</button>`).join('')}</div><table class="m-act-io"></table><div class="row-center m-act-guess" hidden>${opts.map(o => `<button class="btn btn-ghost sm" data-g="${o}">${o}</button>`).join('')}</div>`;
      const tb = $('.m-act-io', box), gs = $('.m-act-guess', box);
      const draw = () => { tb.innerHTML = rows.length ? `<tr><th>넣은 수</th>${rows.map(([a]) => `<td>${a}</td>`).join('')}</tr><tr><th>나온 수</th>${rows.map(([, b]) => `<td>${b}</td>`).join('')}</tr>` : ''; };
      $$('[data-n]', box).forEach(b => b.onclick = () => {
        const x = +b.dataset.n, y = RULES[m.rule](x);
        $('.m-fb-in', box).textContent = x; $('.m-fb-out', box).textContent = '…'; Speech.sfx.tap();
        setTimeout(() => { $('.m-fb-out', box).textContent = y; if (!rows.some(r => r[0] === x)) rows.push([x, y]); rows.sort((a, c) => a[0] - c[0]); draw(); if (!m.open && rows.length >= 2) { gs.hidden = false; api.status('규칙을 알겠으면 아래에서 골라요'); } }, 450);
      });
      $$('[data-g]', box).forEach(b => b.onclick = () => { if (b.dataset.g === m.rule) api.done(m.win); else { Speech.sfx.wrong(); api.status('표의 넣은 수와 나온 수를 견주어 봐요'); } });
      draw(); api.status('수 카드를 눌러 상자에 넣어요');
    },
  };
})();

// ── 누가 무엇을 가졌을까: 단서를 읽고 표의 칸을 눌러 ✗와 ○를 적는다 ──
MATH_ACTS.logic = {
  missions: [
    { text: '단서를 읽고 표의 칸을 눌러 ✗(아니에요)와 ○(맞아요)를 적어요. 누가 무엇을 가졌는지 ○로 찾아봐요.', win: '맞아요! 단서로 하나씩 지워 나가면 찾을 수 있어요.' },
    { text: '새 단서예요. 표를 채워 누가 무엇을 가졌는지 찾아봐요.', win: '맞아요! 단서로 하나씩 지워 나가면 찾을 수 있어요.' },
    { text: '이번에는 ✗부터 적어 봐요. 한 줄에 ✗가 두 개면 남은 칸이 ○예요.', win: '맞아요! ✗를 먼저 적으면 남은 칸이 ○로 보여요.' },
    { text: '또 새 단서예요. 한 물건은 한 사람만 가졌어요. 세로줄도 살펴봐요.', win: '맞아요! 가로줄과 세로줄에 ○가 하나씩 들어갔어요.' },
    { text: '마지막 단서예요. 표를 끝까지 채워 모두 찾아봐요.', win: '맞아요! 단서 두 개로 세 사람을 모두 찾았어요.' },
  ],
  free: { text: '단서로 표를 채워 봐요.' },
  mount(box, m, api) {
    const sol = MathGen.shuffle([0, 1, 2]), F = MathGen.FR, I = MathGen.IT, who = mR(3), others = [0, 1, 2].filter(i => i !== who);
    const jo = (w, a, b) => w + ((w.charCodeAt(w.length - 1) - 0xac00) % 28 ? a : b);
    const clues = [`${F[who][0]} ${jo(F[who][1], '은', '는')} ${jo(I[sol[who]][1], '을', '를')} 가졌어요.`, `${F[others[0]][0]} ${jo(F[others[0]][1], '은', '는')} ${jo(I[sol[others[1]]][1], '을', '를')} 갖지 않았어요.`];
    const t = [0, 1, 2].map(() => [0, 0, 0]); // 0 빈칸 · 1 ✗ · 2 ○
    box.innerHTML = `<ol class="m-act-clues">${clues.map(c => `<li>${c}</li>`).join('')}</ol><table class="m-ltab m-act-lt"></table>`;
    const tb = $('.m-act-lt', box);
    const draw = () => {
      tb.innerHTML = `<tr><th></th>${I.map(([e]) => `<th>${mPic(e)}</th>`).join('')}</tr>${F.map(([e], i) => `<tr><th>${mPic(e)}</th>${I.map((_, j) => `<td><button class="m-lc" data-i="${i}" data-j="${j}">${['', '✗', '○'][t[i][j]]}</button></td>`).join('')}</tr>`).join('')}`;
      $$('.m-lc', tb).forEach(b => b.onclick = () => { const i = +b.dataset.i, j = +b.dataset.j; t[i][j] = (t[i][j] + 1) % 3; Speech.sfx.tap(); draw(); });
      const os = t.map(r => r.indexOf(2)), ok = t.every((r, i) => r.filter(x => x === 2).length === 1 && os[i] === sol[i]);
      if (ok) api.done(`${F.map(([e], i) => `${e} ${I[sol[i]][0]}`).join(', ')}! 단서로 하나씩 지워 나가면 찾을 수 있어요.`, m.win);
      else api.status(t.flat().filter(x => x === 2).length === 3 ? '○ 자리가 단서와 맞는지 다시 읽어 봐요' : '한 사람은 하나만 가졌어요. 줄마다 ○는 하나예요');
    };
    draw();
  },
};
