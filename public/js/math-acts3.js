/* 새싹수학 '🤲 해 보기' 3 (2026-11-27): 나무 단계 주제. 틀(mathAct)은 math-acts.js, mR·mSortMount는 math-acts2.js */

// ── 약수와 배수: 사탕을 접시에 똑같이 나눠 약수를 찾고, 수판에 배수를 칠한다 ──
MATH_ACTS.factor = {
  missions: [
    { text: '사탕 12개를 접시에 똑같이 나눠요. 접시 수를 바꿔 가며, 남는 사탕 없이 나눠지는 접시 수를 모두 찾아봐요.', n: 12 },
    { text: '이번에는 사탕 18개예요. 남김없이 나눠지는 접시 수를 모두 찾아봐요.', n: 18 },
    { text: '수판에서 3의 배수를 모두 눌러 칠해 봐요. 3, 6, 9… 3씩 뛰어요.', mul: 3 },
    { text: '파란 칸은 2의 배수예요. 3의 배수이기도 한 수(공배수)를 모두 눌러 봐요.', both: [2, 3] },
  ],
  free: { text: '사탕 24개를 여러 접시에 나눠 봐요.', n: 24, open: true },
  mount(box, m, api) {
    if (m.n) {
      const ds = [...Array(m.n).keys()].map(k => k + 1).filter(k => m.n % k === 0), found = new Set();
      let k = 1;
      box.innerHTML = `<div class="row-center m-act-cut"><button class="btn btn-ghost sm" data-c="-1">➖</button><b class="m-act-n"></b><button class="btn btn-ghost sm" data-c="1">➕ 접시</button></div><div class="m-act-plates"></div><p class="m-act-eq"></p><div class="m-act-chips"></div>`;
      const draw = () => {
        const q = Math.floor(m.n / k), r = m.n % k;
        $('.m-act-n', box).textContent = `접시 ${k}개`;
        $('.m-act-plates', box).innerHTML = `<div class="m-plates">${Array.from({ length: k }, () => `<span class="m-plate">${'🍬'.repeat(q)}</span>`).join('')}</div>${r ? `<p class="m-act-left">남은 사탕 ${'🍬'.repeat(r)}</p>` : ''}`;
        $('.m-act-eq', box).innerHTML = r ? `${m.n} ÷ ${k} = ${q} … 남는 사탕 <b>${r}</b>` : `${m.n} ÷ ${k} = <b>${q}</b>, 남는 사탕 없음!`;
        if (!r) found.add(k);
        $('.m-act-chips', box).innerHTML = [...found].sort((a, b) => a - b).map(x => `<span class="chip">${x}</span>`).join('');
        if (m.open) return api.status(r ? ' ' : `${mJo(k, '은', '는')} ${m.n}의 약수예요`);
        if (ds.every(d => found.has(d))) api.done(`${ds.join(', ')}! 모두 ${m.n}의 약수예요. 남김없이 나누는 수를 약수라고 해요.`);
        else api.status(`찾은 약수 ${found.size}개 / ${ds.length}개`);
      };
      $$('[data-c]', box).forEach(b => b.onclick = () => { const v = k + +b.dataset.c; if (v < 1 || v > m.n) return Speech.sfx.wrong(); k = v; Speech.sfx.tap(); draw(); });
      return draw();
    }
    const N = 30, on = new Set(), want = m.mul ? [...Array(N).keys()].map(x => x + 1).filter(x => x % m.mul === 0) : [...Array(N).keys()].map(x => x + 1).filter(x => x % 6 === 0);
    box.innerHTML = `<div class="m-act-hund"></div>`;
    const v = $('.m-act-hund', box);
    const draw = () => {
      v.innerHTML = Array.from({ length: N }, (_, i) => { const x = i + 1; return `<button class="m-hn ${on.has(x) ? 'on' : ''} ${m.both && x % 2 === 0 ? 'two' : ''}" data-x="${x}">${x}</button>`; }).join('');
      $$('.m-hn', v).forEach(b => b.onclick = () => {
        const x = +b.dataset.x;
        if (!want.includes(x)) { Speech.sfx.wrong(); return api.status(m.mul ? `${mJo(x, '은', '는')} 3씩 뛰어 닿지 않아요` : `${mJo(x, '은', '는')} 2와 3으로 모두 나누어떨어지나요?`); }
        on.add(x); Speech.sfx.tap(); draw();
        if (want.every(w => on.has(w))) api.done(m.mul ? '3, 6, 9 … 30! 3에 1, 2, 3…을 곱한 수가 3의 배수예요.' : '6, 12, 18, 24, 30! 2와 3의 공배수예요. 가장 작은 공배수는 6이에요.');
        else api.status(`${on.size}개 칠했어요`);
      });
    };
    draw();
  },
};

// ── 수의 규칙: 앞 탑들의 규칙을 보고 마지막 탑을 직접 쌓는다 ──
MATH_ACTS.seq = {
  missions: [
    { text: '탑이 규칙대로 높아져요. ➕ ➖로 마지막 탑을 쌓아 봐요.', s: [2, 4, 6, 8], win: '2씩 커져요! 2, 4, 6, 8, 10.' },
    { text: '이번 규칙은 무엇일까요? 마지막 탑을 쌓아 봐요.', s: [1, 4, 7, 10], win: '3씩 커져요! 1, 4, 7, 10, 13.' },
    { text: '홀수 탑이에요. 다음 탑을 쌓아 봐요.', s: [1, 3, 5, 7], win: '홀수는 2씩 커져요! 다음은 9.' },
    { text: '앞의 두 탑을 더하면 다음 탑이 돼요. 마지막 탑을 쌓아 봐요.', s: [1, 1, 2, 3, 5], win: '3 + 5 = 8! 앞의 두 수를 더하는 이 수열을 피보나치 수열이라고 해요.' },
  ],
  free: { text: '내 규칙으로 탑을 쌓아 봐요.', s: [], open: true },
  mount(box, m, api) {
    const ans = m.open ? 0 : m.s.length === 5 ? m.s[3] + m.s[4] : m.s[3] + (m.s[3] - m.s[2]), h = m.open ? [1, 1, 1, 1, 1] : [...m.s, 0];
    let cur = h.length - 1;
    box.innerHTML = `<div class="m-act-tw"></div><div class="row-center"><button class="btn btn-ghost sm" data-c="-1">➖</button><button class="btn btn-ghost sm" data-c="1">➕ 쌓기</button></div>`;
    const draw = () => {
      $('.m-act-tw', box).innerHTML = MathGen.towers(h, cur);
      if (m.open) { $$('.m-tower', box).forEach(t => t.onclick = () => { cur = +t.dataset.t; Speech.sfx.tap(); draw(); }); return api.status('탑을 눌러 고르고 ➕ ➖로 쌓아요'); }
      if (h[cur] === ans) api.done(m.win); else api.status(h[cur] > ans ? '너무 높아요' : ' ');
    };
    $$('[data-c]', box).forEach(b => b.onclick = () => { const v = h[cur] + +b.dataset.c; if (v < 0 || v > 14) return Speech.sfx.wrong(); h[cur] = v; Speech.sfx.tap(); draw(); });
    draw();
  },
};

// ── 암호: 암호표를 눌러 숫자를 글자로, 글자를 숫자로 바꾼다 ──
MATH_ACTS.cipher = {
  missions: [
    { text: '암호 6, 3을 풀어 봐요. 암호표에서 6과 3의 글자를 차례로 눌러요.', code: [6, 3] },
    { text: '암호 14, 5는 무슨 동물일까요? 글자를 눌러 풀어 봐요.', code: [14, 5] },
    { text: '이번에는 거꾸로! "사자"를 암호로 바꿔요. 글자 아래 숫자를 차례로 눌러요.', word: '사자' },
  ],
  free: { text: '내 비밀 낱말을 암호로 만들어 봐요. 글자를 누르면 숫자가 나와요.', open: true },
  mount(box, m, api) {
    const SY = MathGen.SYL, got = [];
    const goal = m.code || (m.word ? [...m.word].map(c => SY.indexOf(c) + 1) : []);
    box.innerHTML = `${m.code ? `<p class="m-act-code">🔒 ${m.code.join(' · ')}</p>` : m.word ? `<p class="m-act-code">✉️ ${m.word}</p>` : ''}<div class="m-act-slots"></div><div class="m-key m-act-key">${[0, 7].map(o => `<table><tr>${SY.slice(o, o + 7).map((c, i) => `<th><button data-k="${o + i}">${c}</button></th>`).join('')}</tr><tr>${SY.slice(o, o + 7).map((_, i) => `<td><button data-k="${o + i}">${o + i + 1}</button></td>`).join('')}</tr></table>`).join('')}</div><div class="row-center"><button class="btn btn-ghost sm" data-back>↩️ 지우기</button></div>`;
    const draw = () => {
      $('.m-act-slots', box).innerHTML = m.open ? `<span class="m-slot">${got.map(k => SY[k]).join('') || '?'}</span><span class="m-slot">${got.map(k => k + 1).join(' · ') || '?'}</span>` : goal.map((_, i) => `<span class="m-slot">${got[i] === undefined ? '?' : m.word ? got[i] + 1 : SY[got[i]]}</span>`).join('');
      if (m.open) return api.status(got.length ? '친구에게 숫자만 알려 주면 비밀 편지가 돼요' : ' ');
      if (got.length === goal.length) { if (got.every((k, i) => k + 1 === goal[i])) api.done(m.word ? `${m.word} → ${goal.join(' · ')}! 약속을 아는 사람만 읽을 수 있어요.` : `${goal.map(n => SY[n - 1]).join('')}! 암호를 풀었어요.`); else api.status('표에서 숫자와 글자를 다시 맞춰 봐요'); }
      else api.status(' ');
    };
    $$('[data-k]', box).forEach(b => b.onclick = () => { if (!m.open && got.length >= goal.length) return; got.push(+b.dataset.k); Speech.sfx.tap(); draw(); });
    $('[data-back]', box).onclick = () => { got.pop(); draw(); };
    draw();
  },
};

// ── 복면산: 그림마다 수를 정해 ➕➖로 바꾸면 식이 바로 계산된다. 모든 식이 맞으면 성공 ──
MATH_ACTS.masked = {
  missions: [
    { text: '같은 그림에는 같은 수가 들어가요. ➕ ➖로 🍎의 수를 바꿔 식을 맞춰 봐요.', v: ['🍎'], eqs: [[['🍎', '🍎'], '+', 8]] },
    { text: '두 식이 모두 맞게 🍎과 🍌의 수를 찾아봐요.', v: ['🍎', '🍌'], eqs: [[['🍎', '🍌'], '+', 9], [['🍌', '🍎'], '-', 1]] },
    { text: '🍓 셋을 더하면 12예요. 🍇까지 찾아봐요.', v: ['🍓', '🍇'], eqs: [[['🍓', '🍓', '🍓'], '+', 12], [['🍓', '🍇'], '+', 10]] },
  ],
  free: { text: '그림의 수를 마음대로 바꿔 봐요.', v: ['🍎', '🍌'], eqs: [[['🍎', '🍌'], '+', null], [['🍎', '🍌'], '-', null]], open: true },
  mount(box, m, api) {
    const val = Object.fromEntries(m.v.map(e => [e, 0]));
    const calc = ([t, op]) => t.map(e => val[e]).reduce((a, b) => op === '+' ? a + b : a - b);
    box.innerHTML = `<div class="m-act-vars">${m.v.map(e => `<div class="m-act-var"><span>${e}</span><button class="btn btn-ghost sm" data-e="${e}" data-c="-1">➖</button><b data-v="${e}"></b><button class="btn btn-ghost sm" data-e="${e}" data-c="1">➕</button></div>`).join('')}</div><div class="m-act-eqs"></div>`;
    const draw = () => {
      m.v.forEach(e => { $(`[data-v="${e}"]`, box).textContent = val[e]; });
      $('.m-act-eqs', box).innerHTML = m.eqs.map(q => { const r = calc(q), ok = q[2] === null || r === q[2]; return `<p class="${q[2] !== null && ok ? 'ok' : ''}">${q[0].join(` ${q[1] === '-' ? '−' : '+'} `)} = ${q[2] ?? '?'} <small>→ ${q[0].map(e => val[e]).join(` ${q[1] === '-' ? '−' : '+'} `)} = <b>${r}</b> ${q[2] === null ? '' : ok ? '✅' : ''}</small></p>`; }).join('');
      if (m.open) return api.status(' ');
      if (m.eqs.every(q => calc(q) === q[2])) api.done(`${m.v.map(e => `${e} = ${val[e]}`).join(', ')}! 가려진 수를 찾았어요.`); else api.status(' ');
    };
    $$('[data-c]', box).forEach(b => b.onclick = () => { const e = b.dataset.e, n = val[e] + +b.dataset.c; if (n < 0 || n > 9) return Speech.sfx.wrong(); val[e] = n; Speech.sfx.tap(); draw(); });
    draw();
  },
};

// ── 경우의 수: 옷을 맞춰 입혀 보고, 동물을 줄 세워 보며 빠짐없이 센다 ──
MATH_ACTS.cases = {
  missions: [
    { text: '윗옷 하나와 아래옷 하나를 골라 입혀 봐요. 서로 다른 옷차림을 모두 찾아봐요.', dress: true },
    { text: '동물 셋을 한 줄로 세워요. 동물을 차례로 눌러 줄을 세우고, 다른 순서를 모두 찾아봐요.', line: ['🐶', '🐱', '🐰'] },
  ],
  free: { text: '옷을 마음대로 입혀 봐요.', dress: true, open: true },
  mount(box, m, api) {
    const found = new Set();
    if (m.dress) {
      const T = [['🟥', '빨강'], ['🟦', '파랑'], ['🟨', '노랑']], B = [['👖', '긴바지'], ['🩳', '반바지']];
      let t = null, b = null;
      box.innerHTML = `<div class="m-act-row"><div class="m-act-side"><small>윗옷</small>${T.map(([e, n], i) => `<button class="btn btn-ghost sm" data-t="${i}">${e} ${n}</button>`).join('')}</div><div class="m-act-kid"></div><div class="m-act-side"><small>아래옷</small>${B.map(([e, n], i) => `<button class="btn btn-ghost sm" data-b="${i}">${e} ${n}</button>`).join('')}</div></div><table class="m-act-combo"></table>`;
      const draw = () => {
        $('.m-act-kid', box).innerHTML = `<span class="m-kid-top" style="background:${t === null ? '#eee' : ['#ef5350', '#42a5f5', '#ffee58'][t]}">${t === null ? '?' : ''}</span><span class="m-kid-bot">${b === null ? '?' : B[b][0]}</span>`;
        $$('[data-t]', box).forEach(x => x.classList.toggle('on', +x.dataset.t === t)); $$('[data-b]', box).forEach(x => x.classList.toggle('on', +x.dataset.b === b));
        if (t !== null && b !== null) found.add(`${t}${b}`);
        $('.m-act-combo', box).innerHTML = `<tr><th></th>${B.map(([e]) => `<th>${e}</th>`).join('')}</tr>${T.map(([e], i) => `<tr><th>${e}</th>${B.map((_, j) => `<td>${found.has(`${i}${j}`) ? '✅' : ''}</td>`).join('')}</tr>`).join('')}`;
        if (m.open) return api.status(`${found.size}가지 입어 봤어요`);
        if (found.size === 6) api.done('윗옷 3가지 × 아래옷 2가지 = 6가지! 표로 정리하면 빠짐없이 셀 수 있어요.'); else api.status(`${found.size}가지 찾았어요`);
      };
      $$('[data-t]', box).forEach(x => x.onclick = () => { t = +x.dataset.t; Speech.sfx.tap(); draw(); });
      $$('[data-b]', box).forEach(x => x.onclick = () => { b = +x.dataset.b; Speech.sfx.tap(); draw(); });
      return draw();
    }
    let row = [];
    box.innerHTML = `<div class="row-center m-act-pool">${m.line.map(e => `<button class="m-card" data-e="${e}">${e}</button>`).join('')}</div><div class="m-act-slots"></div><div class="m-act-chips"></div>`;
    const draw = () => {
      $('.m-act-slots', box).innerHTML = [0, 1, 2].map(i => `<span class="m-slot">${row[i] || (i + 1) + '번'}</span>`).join('');
      $$('[data-e]', box).forEach(x => x.disabled = row.includes(x.dataset.e));
      $('.m-act-chips', box).innerHTML = [...found].map(s => `<span class="chip">${s}</span>`).join('');
      if (found.size === 6) api.done('6가지! 첫째 자리 3가지 × 둘째 자리 2가지 × 셋째 자리 1가지예요.'); else api.status(`${found.size}가지 찾았어요`);
    };
    $$('[data-e]', box).forEach(x => x.onclick = () => {
      row.push(x.dataset.e); Speech.sfx.tap();
      if (row.length === 3) { const k = row.join(''); if (found.has(k)) api.status('이미 찾은 순서예요'); found.add(k); draw(); setTimeout(() => { row = []; draw(); }, 700); return; }
      draw();
    });
    draw();
  },
};

// ── 저울 맞추기: 추를 눌러 저울에 올리고 내리며, 상자의 무게를 찾는다 ──
MATH_ACTS.balance = {
  missions: [
    { text: '📦 상자는 몇일까요? 추를 눌러 오른쪽 접시에 올려 저울을 맞춰 봐요. 올린 추를 누르면 내려와요.', box: 5, n: 1 },
    { text: '이번 상자도 무게를 찾아봐요.', box: 7, n: 1 },
    { text: '똑같은 상자 두 개예요. 저울을 맞추고, 상자 하나의 무게를 알아봐요.', box: 4, n: 2 },
  ],
  free: { text: '추를 마음대로 올려 봐요.', box: 6, n: 1, open: true },
  mount(box, m, api) {
    const W = [1, 2, 3, 5], right = [], L = m.box * m.n;
    box.innerHTML = `<div class="m-act-scale"></div><div class="row-center m-act-pool">${W.map(w => `<button class="m-weight m-act-w" data-w="${w}">${w}</button>`).join('')}</div>`;
    const draw = () => {
      const R = right.reduce((a, b) => a + b, 0);
      MathGen.scaleSet($('.m-act-scale', box), '<span class="m-sbox">📦</span>'.repeat(m.n), right.map((w, i) => `<button class="m-weight" data-r="${i}">${w}</button>`).join(''), MathGen.tiltOf(L, R));
      $$('[data-r]', box).forEach(b => b.onclick = () => { right.splice(+b.dataset.r, 1); Speech.sfx.tap(); draw(); });
      if (m.open) return api.status(`오른쪽 ${R}`);
      if (R === L) api.done(m.n > 1 ? `상자 두 개가 ${mJo(L, '이니까', '니까')}, 상자 하나는 ${L} ÷ 2 = ${mJo(m.box, '이에요', '예요')}!` : `저울이 맞았어요! 상자는 ${mJo(m.box, '이에요', '예요')}.`);
      else api.status(R > L ? `오른쪽 ${R} · 오른쪽이 무거워요` : `오른쪽 ${R} · 왼쪽이 무거워요`);
    };
    $$('[data-w]', box).forEach(b => b.onclick = () => { if (right.length >= 8) return Speech.sfx.wrong(); right.push(+b.dataset.w); Speech.sfx.tap(); draw(); });
    draw();
  },
};

// ── 다른 묶음으로 세기: 막대를 그어 5씩 묶고, 로마 숫자 카드를 놓아 수를 만든다 ──
MATH_ACTS.base = {
  missions: [
    { text: '✏️ 긋기를 눌러 막대를 그어요. 다섯 번째 막대는 비스듬히 묶어요. 13을 만들어 봐요.', tally: 13 },
    { text: '로마 숫자 카드를 눌러 8을 만들어 봐요. I은 1, V는 5, X는 10이에요.', roman: 8 },
    { text: '로마 숫자로 14를 만들어 봐요.', roman: 14 },
    { text: '로마 숫자로 9를 만들어 봐요. 큰 수 앞의 작은 수는 빼요.', roman: 9 },
  ],
  free: { text: '로마 숫자 카드를 마음대로 놓아 봐요.', roman: 0, open: true },
  mount(box, m, api) {
    if (m.tally) {
      let n = 0;
      box.innerHTML = `<div class="m-act-tal"></div><p class="m-act-eq"></p><div class="row-center"><button class="btn btn-ghost sm" data-c="-1">➖</button><button class="btn btn-ghost" data-c="1">✏️ 긋기</button></div>`;
      const draw = () => { $('.m-act-tal', box).innerHTML = MathGen.tally(n); $('.m-act-eq', box).innerHTML = `5 묶음 <b>${Math.floor(n / 5)}</b>개와 <b>${n % 5}</b> → <b>${n}</b>`; if (n === m.tally) api.done('13! 5씩 묶음 2개와 3개예요. 묶으면 세기 쉬워요.'); else api.status(' '); };
      $$('[data-c]', box).forEach(b => b.onclick = () => { const v = n + +b.dataset.c; if (v < 0 || v > 30) return; n = v; Speech.sfx.tap(); draw(); });
      return draw();
    }
    let s = '';
    const val = str => { const V = { I: 1, V: 5, X: 10 }; let t = 0; for (let i = 0; i < str.length; i++) { const a = V[str[i]], b = V[str[i + 1]] || 0; t += a < b ? -a : a; } return t; };
    box.innerHTML = `<p class="m-act-roman"></p><div class="row-center m-act-pool">${['I', 'V', 'X'].map(c => `<button class="m-card" data-r="${c}">${c}</button>`).join('')}<button class="m-card" data-r="" aria-label="지우기">⌫</button></div>`;
    const draw = () => {
      const ok = s && s === MathGen.roman(val(s));
      $('.m-act-roman', box).innerHTML = `<b>${s || '?'}</b> = ${s ? (ok ? val(s) : '바른 로마 숫자가 아니에요') : ''}`;
      if (m.open) return api.status(' ');
      if (s === MathGen.roman(m.roman)) api.done(`${s} = ${m.roman}! ${m.roman === 9 ? 'X(10) 앞의 I(1)은 빼서 9예요.' : m.roman === 14 ? 'X(10) + IV(4) = 14예요.' : 'V(5) + III(3) = 8이에요.'}`); else api.status(' ');
    };
    $$('[data-r]', box).forEach(b => b.onclick = () => { s = b.dataset.r ? (s + b.dataset.r).slice(0, 8) : s.slice(0, -1); Speech.sfx.tap(); draw(); });
    draw();
  },
};

// ── 펜토미노: 조각을 고르고 돌리고 뒤집어, 판의 칸을 눌러 놓는다. 판을 빈틈없이 채우면 성공 ──
(() => {
  const P = { L: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]], P: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], V: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], U: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]], Y: [[1, 0], [0, 1], [1, 1], [1, 2], [1, 3]] };
  const COL = ['#4db6ac', '#ff8a65', '#9575cd', '#64b5f6', '#f06292'];
  MATH_ACTS.pento = {
    missions: [
      { text: '조각을 눌러 고르고, 🔄 ↔️로 모양을 바꾼 다음 판의 칸을 눌러 놓아요. 두 조각으로 판을 빈틈없이 채워 봐요.', W: 5, H: 2, ps: ['L', 'L'] },
      { text: '세 조각으로 판을 채워 봐요.', W: 5, H: 3, ps: ['L', 'P', 'V'] },
      { text: '다른 세 조각으로도 채워 봐요.', W: 5, H: 3, ps: ['P', 'U', 'Y'] },
    ],
    mount(box, m, api) {
      const g = Array(m.W * m.H).fill(-1), shapes = m.ps.map(k => MathGen.pNorm(P[k])), used = m.ps.map(() => false);
      let sel = 0;
      box.innerHTML = `<div class="m-act-pb" style="--c:${m.W}"></div><div class="row-center"><button class="btn btn-ghost sm" data-rot>🔄 돌리기</button><button class="btn btn-ghost sm" data-flip>↔️ 뒤집기</button></div><div class="row-center m-act-tray2"></div>`;
      const draw = () => {
        $('.m-act-pb', box).innerHTML = g.map((v, i) => `<button class="m-pc" data-i="${i}" style="${v >= 0 ? `background:${COL[v]}` : ''}"></button>`).join('');
        $('.m-act-tray2', box).innerHTML = shapes.map((c, j) => used[j] ? '' : `<button class="m-ptray ${j === sel ? 'sel' : ''}" data-j="${j}">${MathGen.pSvg(c, COL[j], 16)}</button>`).join('') || '<small>다 놓았어요</small>';
        $$('.m-ptray', box).forEach(b => b.onclick = () => { sel = +b.dataset.j; Speech.sfx.tap(); draw(); });
        $$('.m-pc', box).forEach(b => b.onclick = () => {
          const i = +b.dataset.i;
          if (g[i] >= 0) { const j = g[i]; g.forEach((v, k) => { if (v === j) g[k] = -1; }); used[j] = false; sel = j; Speech.sfx.tap(); api.undo(); return draw(); }
          if (sel === null || used[sel]) return api.status('아래에서 조각을 골라요');
          const x0 = i % m.W, y0 = Math.floor(i / m.W), [ax, ay] = shapes[sel][0], cells = shapes[sel].map(([x, y]) => [x - ax + x0, y - ay + y0]);
          if (!cells.every(([x, y]) => x >= 0 && y >= 0 && x < m.W && y < m.H && g[y * m.W + x] < 0)) { Speech.sfx.wrong(); return api.status('거기에는 안 들어가요. 돌리거나 다른 칸에 놓아 봐요'); }
          cells.forEach(([x, y]) => { g[y * m.W + x] = sel; }); used[sel] = true; sel = used.indexOf(false); if (sel < 0) sel = null; Speech.sfx.tap(); draw();
          if (g.every(v => v >= 0)) api.done('판을 빈틈없이 채웠어요! 놓은 조각을 누르면 다시 뺄 수 있어요.'); else api.status('조각의 맨 윗줄 왼쪽 칸이 누른 칸에 놓여요');
        });
      };
      $('[data-rot]', box).onclick = () => { if (sel === null) return; shapes[sel] = MathGen.pRot(shapes[sel]); Speech.sfx.tap(); draw(); };
      $('[data-flip]', box).onclick = () => { if (sel === null) return; shapes[sel] = MathGen.pFlip(shapes[sel]); Speech.sfx.tap(); draw(); };
      draw(); api.status('조각의 맨 윗줄 왼쪽 칸이 누른 칸에 놓여요');
    },
  };
  MATH_ACTS.pento.free = { text: '세 조각으로 판을 채워 봐요.', W: 5, H: 3, ps: ['F' in P ? 'F' : 'P', 'U', 'Y'] };
})();

// ── 세모와 동그라미: 점 셋을 눌러 삼각형을 만들면 세 각과 그 합이 보인다. 컴퍼스로 동그라미를 그린다 ──
(() => {
  const G = 6, P = k => [10 + (k % G) * 16, 10 + Math.floor(k / G) * 16];
  const ang = (a, b, c) => { const v1 = [b[0] - a[0], b[1] - a[1]], v2 = [c[0] - a[0], c[1] - a[1]]; return Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / Math.hypot(...v1) / Math.hypot(...v2)) * 180 / Math.PI; };
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  MATH_ACTS.trc = {
    missions: [
      { text: '점 세 개를 눌러 삼각형을 만들어 봐요. 세 각을 더하면 얼마일까요?', want: 'any' },
      { text: '한 각이 직각인 직각삼각형을 만들어 봐요.', want: 'right' },
      { text: '두 변의 길이가 같은 이등변삼각형을 만들어 봐요.', want: 'iso' },
      { text: '한 각이 직각보다 큰 둔각삼각형을 만들어 봐요.', want: 'obtuse' },
      { text: '컴퍼스예요. 빨간 손잡이를 끌어 반지름이 3칸인 동그라미를 그려 봐요.', circle: 3 },
    ],
    free: { text: '점을 눌러 여러 삼각형을 만들어 봐요. 세 각의 합은 늘 같을까요?', want: 'free' },
    mount(box, m, api) {
      if (m.circle) {
        let r = 1, drag = false;
        box.innerHTML = `<div class="m-act-view"><svg viewBox="-4 -4 128 128" class="m-act-dots m-act-comp"></svg></div><p class="m-act-eq"></p>`;
        const s = $('svg', box);
        const draw = () => {
          s.innerHTML = `${Array.from({ length: 7 }, (_, i) => `<line x1="${4 + i * 18}" y1="4" x2="${4 + i * 18}" y2="112" stroke="currentColor" stroke-opacity=".12"/><line x1="4" y1="${4 + i * 18}" x2="112" y2="${4 + i * 18}" stroke="currentColor" stroke-opacity=".12"/>`).join('')}<circle cx="58" cy="58" r="${r * 18}" fill="#e3f2fd" fill-opacity=".6" stroke="#1e88e5" stroke-width="2.5"/><line x1="${58 - r * 18}" y1="58" x2="${58 + r * 18}" y2="58" stroke="#43a047" stroke-width="2" stroke-dasharray="3 3"/><line x1="58" y1="58" x2="${58 + r * 18}" y2="58" stroke="#e53935" stroke-width="3"/><circle cx="58" cy="58" r="3.5" fill="#3a2d4f"/><circle cx="${58 + r * 18}" cy="58" r="7" fill="#ff7043" stroke="#fff" stroke-width="2"/>`;
          $('.m-act-eq', box).innerHTML = `반지름 <b style="color:#e53935">${r}</b>칸 · 지름 <b style="color:#43a047">${r * 2}</b>칸`;
          if (r === m.circle) api.done(`반지름 3칸이면 지름은 6칸! 지름은 반지름의 두 배예요.`); else api.status('손잡이를 오른쪽·왼쪽으로 끌어요');
        };
        const move = e => { const p = mSvgPt(s, e), v = Math.max(1, Math.min(3, Math.round(Math.abs(p.x - 58) / 18))); if (v !== r) { r = v; Speech.sfx.tap(); draw(); } };
        s.onpointerdown = e => { e.preventDefault(); try { s.setPointerCapture(e.pointerId); } catch (_) {} drag = true; move(e); };
        s.onpointermove = e => { if (drag) move(e); }; s.onpointerup = s.onpointercancel = () => { drag = false; };
        return draw();
      }
      let pts = [];
      box.innerHTML = `<div class="m-act-view"></div><p class="m-act-eq"></p><div class="row-center"><button class="btn btn-ghost sm" data-clear>🧹 새로 만들기</button></div>`;
      const v = $('.m-act-view', box);
      const draw = () => {
        const xy = pts.map(P);
        let info = '';
        if (pts.length === 3) {
          // 세 각(반올림). 크기가 같은 두 각은 같게 보이고, 합은 꼭 180이 되게 맞춘다
          const E = [ang(xy[0], xy[1], xy[2]), ang(xy[1], xy[0], xy[2]), ang(xy[2], xy[0], xy[1])];
          const pr = [[0, 1, 2], [0, 2, 1], [1, 2, 0]].find(([a, b]) => Math.abs(E[a] - E[b]) < .01), A = E.map(Math.round);
          if (pr) { const [a, b, c] = pr; A[b] = A[a]; A[c] = 180 - 2 * A[a]; } else { const k = E.map((e, i) => [Math.abs(e - A[i]), i]).sort((x, y) => y[0] - x[0])[0][1]; A[k] += 180 - A[0] - A[1] - A[2]; }
          const right = E.some(a => Math.abs(a - 90) < .01), obt = E.some(a => a > 90.01), iso = !!pr;
          const name = `${iso ? '이등변삼각형이면서 ' : ''}${right ? '직각' : obt ? '둔각' : '예각'}삼각형`;
          info = `${A.map(a => `<b>${a}°</b>`).join(' + ')} = <b>180°</b> · ${name}`;
          const ok = m.want === 'any' ? true : m.want === 'right' ? right : m.want === 'iso' ? iso : m.want === 'obtuse' ? obt : false;
          if (ok) api.done(m.want === 'any' ? '세 각을 더하면 180도! 어떤 삼각형이든 늘 180도예요.' : `${m.want === 'iso' ? '이등변삼각형' : m.want === 'right' ? '직각삼각형' : '둔각삼각형'} 완성! 세 각의 합은 이번에도 180도예요.`);
          else api.status(m.want === 'free' ? `${name}이에요. 새로 만들기로 다른 삼각형도 만들어 봐요` : `${name}이에요. 새로 만들기로 다시 해 봐요`);
        } else api.status(`점 ${pts.length} / 3`);
        v.innerHTML = `<svg viewBox="0 0 100 100" class="m-act-dots">${pts.length === 3 ? `<polygon points="${xy.join(' ')}" fill="#ffcc80" fill-opacity=".7" stroke="#3a2d4f" stroke-width="2" stroke-linejoin="round"/>` : `<polyline points="${xy.join(' ')}" fill="none" stroke="#3a2d4f" stroke-width="2"/>`}${Array.from({ length: G * G }, (_, k) => { const [x, y] = P(k), on = pts.includes(k); return `<g class="m-pdot" data-k="${k}"><circle cx="${x}" cy="${y}" r="7" fill="transparent"/><circle cx="${x}" cy="${y}" r="${on ? 3.8 : 2.2}" fill="${on ? '#e64a19' : '#b0bec5'}"/></g>`; }).join('')}</svg>`;
        $('.m-act-eq', box).innerHTML = info;
        $$('.m-pdot', v).forEach(g => g.onclick = () => {
          const k = +g.dataset.k; if (pts.length >= 3 || pts.includes(k)) return Speech.sfx.wrong();
          const q = [...pts, k].map(P);
          if (q.length === 3 && (q[1][0] - q[0][0]) * (q[2][1] - q[0][1]) - (q[1][1] - q[0][1]) * (q[2][0] - q[0][0]) === 0) { Speech.sfx.wrong(); return api.status('세 점이 한 줄 위에 있으면 삼각형이 안 돼요'); }
          pts.push(k); Speech.sfx.tap(); draw();
        });
      };
      $('[data-clear]', box).onclick = () => { pts = []; Speech.sfx.tap(); draw(); };
      draw();
    },
  };
})();

// ── 고르게 나누기(평균): 높은 탑의 블록을 눌러 낮은 탑으로 옮겨 키를 똑같이 맞춘다 ──
MATH_ACTS.avg = {
  missions: [
    { text: '탑을 눌러 맨 위 블록을 들고, 다른 탑을 눌러 옮겨요. 세 탑의 높이를 똑같이 맞춰 봐요.', h: [5, 1, 3] },
    { text: '네 탑을 똑같이 맞춰 봐요.', h: [6, 2, 4, 4] },
    { text: '이번에도 똑같이 맞춰 봐요. 몇 층씩이 될까요?', h: [7, 3, 2] },
  ],
  free: { text: '블록을 옮기며 놀아 봐요.', h: [8, 2, 5, 1], open: true },
  mount(box, m, api) {
    const h = [...m.h], avg = h.reduce((a, b) => a + b, 0) / h.length;
    let hand = null;
    box.innerHTML = `<div class="m-act-tw"></div><p class="m-act-eq"></p>`;
    const draw = () => {
      $('.m-act-tw', box).innerHTML = MathGen.towers(h, hand ?? -1);
      $('.m-act-eq', box).innerHTML = hand !== null ? `🧱 블록을 들었어요 · 놓을 탑을 눌러요` : `모두 <b>${h.reduce((a, b) => a + b, 0)}</b>층 · 탑 <b>${h.length}</b>개`;
      $$('.m-tower', box).forEach(t => t.onclick = () => {
        const i = +t.dataset.t;
        if (hand === null) { if (!h[i]) return Speech.sfx.wrong(); hand = i; h[i]--; }
        else { h[i]++; hand = null; }
        Speech.sfx.tap(); draw();
      });
      if (!m.open && hand === null && h.every(x => x === avg)) api.done(`모두 ${avg}층! 똑같이 고르게 나눈 수를 평균이라고 해요. ${m.h.reduce((a, b) => a + b, 0)} ÷ ${h.length} = ${avg}.`); else if (!m.open) api.status(' ');
    };
    draw();
  },
};

// ── 수 쪼개기: 곱셈 나무를 직접 키운다. 쪼갤 수 있는 수를 누르고 곱셈 짝을 고른다 ──
MATH_ACTS.split = {
  missions: [
    { text: '12를 눌러 두 수의 곱으로 쪼개 봐요. 더 쪼갤 수 없는 수(소수)만 남을 때까지 쪼개요.', n: 12 },
    { text: '18도 끝까지 쪼개 봐요.', n: 18 },
    { text: '30을 쪼개 봐요. 어떤 짝으로 먼저 쪼개도 끝은 같을까요?', n: 30 },
  ],
  free: { text: '36을 여러 방법으로 쪼개 봐요.', n: 36, open: true },
  mount(box, m, api) {
    let rows = [[m.n]], sel = null;
    box.innerHTML = `<div class="m-act-ftree"></div><div class="row-center m-act-pairs"></div>`;
    const draw = () => {
      const last = rows[rows.length - 1];
      $('.m-act-ftree', box).innerHTML = rows.map((r, ri) => `<div class="m-ft-row">${r.map((x, i) => ri === rows.length - 1 ? `<button class="m-ft ${MathGen.isPrime(x) ? 'pr' : ''} ${sel === i ? 'sel' : ''}" data-i="${i}">${x}</button>` : `<span class="m-ft ${MathGen.isPrime(x) ? 'pr' : ''}">${x}</span>`).join('<i>×</i>')}</div>`).join('<div class="m-ft-dn">↓</div>');
      const pairs = sel === null ? [] : [...Array(last[sel]).keys()].filter(d => d > 1 && d * d <= last[sel] && last[sel] % d === 0).map(d => [d, last[sel] / d]);
      $('.m-act-pairs', box).innerHTML = pairs.map(([a, b]) => `<button class="btn btn-ghost sm" data-p="${a},${b}">${a} × ${b}</button>`).join('');
      $$('.m-ft[data-i]', box).forEach(b => b.onclick = () => { const i = +b.dataset.i; if (MathGen.isPrime(last[i])) { Speech.sfx.wrong(); return api.status(`${mJo(last[i], '은', '는')} 1과 자기 자신으로만 나눠지는 소수예요. 더 못 쪼개요`); } sel = i; Speech.sfx.tap(); draw(); api.status('어떤 두 수의 곱으로 쪼갤까요?'); });
      $$('[data-p]', box).forEach(b => b.onclick = () => { const [a, c] = b.dataset.p.split(',').map(Number); rows.push(last.flatMap((x, i) => i === sel ? [a, c] : [x]).sort((p, q) => p - q)); sel = null; Speech.sfx.tap(); draw(); });
      if (last.every(x => MathGen.isPrime(x))) { const s = `${m.n} = ${last.join(' × ')}`; if (m.open) api.status(`${s}! 위로 돌아가 다른 짝으로도 해 봐요`); else api.done(`${s}! 소수의 곱으로 나타냈어요. 어떤 순서로 쪼개도 결과는 같아요.`); }
      else if (sel === null) api.status('쪼갤 수(초록이 아닌 수)를 눌러요');
    };
    draw();
  },
};

// ── 나눗셈: 접시를 눌러 사탕을 하나씩 나눠 주고, 봉지에 똑같이 담는다 ──
MATH_ACTS.div = {
  missions: [
    { text: '사탕 12개를 접시 3개에 똑같이 나눠요. 접시를 눌러 사탕을 하나씩 놓아요.', n: 12, k: 3 },
    { text: '사탕 14개를 접시 4개에 똑같이 나눠요. 남는 사탕은 어떻게 될까요?', n: 14, k: 4 },
    { text: '사탕 15개를 한 봉지에 3개씩 담아요. 사탕을 눌러 봉지에 넣어요. 봉지는 몇 개가 될까요?', n: 15, bag: 3 },
  ],
  free: { text: '사탕 20개를 마음대로 나눠 봐요.', n: 20, k: 4, open: true },
  mount(box, m, api) {
    let pile = m.n;
    if (m.bag) {
      const bags = [0];
      box.innerHTML = `<div class="m-act-pile"></div><div class="m-plates m-act-bags"></div><p class="m-act-eq"></p>`;
      const draw = () => {
        $('.m-act-pile', box).innerHTML = pile ? Array.from({ length: pile }, () => '<button class="m-candy">🍬</button>').join('') : '<small>다 담았어요</small>';
        $('.m-act-bags', box).innerHTML = bags.map(b => `<span class="m-plate m-bag">${'🍬'.repeat(b)}</span>`).join('');
        const full = bags.filter(b => b === m.bag).length;
        $('.m-act-eq', box).innerHTML = `봉지 <b>${full}</b>개 꽉 참`;
        $$('.m-candy', box).forEach(c => c.onclick = () => { pile--; bags[bags.length - 1]++; if (bags[bags.length - 1] === m.bag && pile) bags.push(0); Speech.sfx.tap(); draw(); });
        if (!pile) api.done(`${m.n} ÷ ${m.bag} = ${m.n / m.bag}! ${m.bag}개씩 담으면 봉지 ${m.n / m.bag}개예요.`); else api.status(`남은 사탕 ${pile}개`);
      };
      return draw();
    }
    const pl = Array(m.k).fill(0);
    box.innerHTML = `<div class="m-act-pile"></div><div class="m-plates m-act-pls"></div><p class="m-act-eq"></p>`;
    const draw = () => {
      $('.m-act-pile', box).innerHTML = pile ? '🍬'.repeat(pile) : '<small>사탕이 없어요</small>';
      $('.m-act-pls', box).innerHTML = pl.map((c, i) => `<button class="m-plate" data-p="${i}">${'🍬'.repeat(c) || '<small>접시</small>'}</button>`).join('');
      $$('[data-p]', box).forEach(b => b.onclick = () => { if (!pile) return Speech.sfx.wrong(); pl[+b.dataset.p]++; pile--; Speech.sfx.tap(); draw(); });
      const same = pl.every(c => c === pl[0]), q = Math.floor(m.n / m.k), r = m.n % m.k;
      $('.m-act-eq', box).innerHTML = `접시마다 ${pl.join(' · ')}`;
      if (m.open) return api.status(pile ? `남은 사탕 ${pile}개` : ' ');
      if (same && pile < m.k && pl[0] === q) api.done(r ? `${m.n} ÷ ${m.k} = ${q}, 나머지 ${r}! 똑같이 더 나눌 수 없는 ${r}개가 나머지예요.` : `${m.n} ÷ ${m.k} = ${q}! 한 접시에 ${q}개씩이에요.`);
      else if (!same && pile < m.k && pl.reduce((a, b) => a + b, 0) === m.n - pile) api.status('접시마다 사탕 수가 달라요. 처음부터 똑같이 나눠 봐요');
      else api.status(`남은 사탕 ${pile}개`);
    };
    draw();
  },
};
