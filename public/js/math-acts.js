/* 새싹수학 '🤲 해 보기' (2026-11-27)
 * 문제를 맞히기 전에 손으로 직접 해 보며 이해한다: 쌓기나무를 쌓고, 성냥개비를 옮기고, 손가락으로 한 번에 그리고, 각을 벌렸다 오므린다.
 * 주제마다 미션 몇 개를 차례로 하고, 다 마치면 별을 받고 자유롭게 해 본다. 주소 #/math/a_<주제 id>
 * MATH_ACTS[주제 id] = { missions: [{ text, … }], free: { text }, mount(box, m, api) }
 *   api.status(글) 아래 한 줄 · api.done(칭찬 한 줄) 미션 성공 · api.undo() 다시 못 한 상태로 */
const MATH_ACTS = {};
const mSvgPt = (svg, e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };

function mathAct(el, t) {
  const A = MATH_ACTS[t.id], N = A.missions.length;
  let i = 0;
  el.innerHTML = `<div class="wrap sec narrow"><a class="link-btn" href="#/math">← 새싹수학</a><h1 class="page-title">🤲 ${esc(t.title)} 해 보기</h1><div class="card m-area m-act"></div></div>`;
  const area = $('.m-area', el);
  const finish = () => {
    const got = mReward();
    Speech.sfx.cheer(); Lesson.confetti(); mMark(t, 'act');
    area.innerHTML = `<div class="center m-done"><div class="auth-logo">${ico('🏆')}</div><h2>미션 ${N}개를 모두 해냈어요! 🎉</h2>${got ? '<p>⭐ 별 1개를 받았어요</p>' : ''}
      <div class="row-center"><button class="btn btn-primary" data-free>🤲 자유롭게 해 보기</button>${t.game ? `<a class="btn btn-ghost" href="#/math/p_${t.game}">🧩 생각 놀이</a>` : ''}<a class="btn btn-ghost" href="#/math">다른 주제</a></div></div>`;
    KoSpeech.say('미션을 모두 해냈어요! 이제 마음대로 해 봐요.');
    $('[data-free]', area).onclick = () => { i = N; show(); };
  };
  const show = () => {
    const free = i >= N, m = free ? A.free : A.missions[i];
    area.innerHTML = `<p class="m-prog">${free ? '🤲 자유롭게 해 보기' : `미션 ${i + 1} / ${N}`}</p><h2 class="m-ask m-act-ask">${esc(m.text)}</h2>
      <div class="row-center m-say"><button class="btn btn-ghost sm" data-ko>🔊 다시 듣기</button></div>
      <div class="m-act-box"></div><p class="m-eq-num m-tapn m-act-st" aria-live="polite">&nbsp;</p>
      <div class="row-center"><button class="btn btn-ghost" data-reset>처음부터</button>${free ? '<a class="btn btn-primary" href="#/math">다 했어요</a>' : `<button class="btn btn-primary" data-next disabled>${i + 1 < N ? '다음 미션 →' : '다 했어요 →'}</button>`}</div>`;
    const say = m.say || m.text;
    KoSpeech.say(say); $('[data-ko]', area).onclick = () => KoSpeech.say(say);
    const out = $('.m-act-st', area), nb = $('[data-next]', area);
    let ok = false;
    const api = {
      status: s => { out.textContent = s || ' '; },
      done: (line, say) => { out.textContent = line; if (ok || !nb) return; ok = true; nb.disabled = false; Speech.sfx.correct(); setTimeout(() => KoSpeech.say(say || line), 400); },
      undo: () => { if (!nb) return; ok = false; nb.disabled = true; },
    };
    const mount = () => { ok = false; if (nb) nb.disabled = true; out.textContent = ' '; A.mount($('.m-act-box', area), m, api); };
    $('[data-reset]', area).onclick = () => { Speech.sfx.tap(); mount(); };
    if (nb) nb.onclick = () => { KoSpeech.stop(); i++; if (i >= N) finish(); else show(); };
    mount();
  };
  show();
}

// ── 쌓기나무: 칸을 눌러 쌓고(빼기 모드면 내리고), 비스듬히 본 모습과 앞에서 본 모습을 함께 본다 ──
(() => {
  const S = 3, MAXH = 4;
  const front = h => Array.from({ length: S }, (_, x) => Math.max(...h.map(r => r[x])));
  const frontSvg = (f, col = '#ffb74d') => {
    const s = 22, H = Math.max(1, ...f);
    return `<svg viewBox="-2 -2 ${S * s + 4} ${H * s + 4}" class="m-front" style="width:${S * s * 1.6}px" aria-label="앞에서 본 모양 ${f.join(', ')}층">${f.map((n, x) => Array.from({ length: n }, (_, z) => `<rect x="${x * s}" y="${(H - 1 - z) * s}" width="${s}" height="${s}" fill="${col}" stroke="#3a2d4f" stroke-width="2"/>`).join('')).join('')}<line x1="-2" y1="${H * s}" x2="${S * s + 2}" y2="${H * s}" stroke="currentColor" stroke-width="2"/></svg>`;
  };
  const same = (a, b) => a.every((r, y) => r.every((v, x) => v === b[y][x]));
  const sum = h => h.flat().reduce((a, b) => a + b, 0);
  MATH_ACTS.blocks = {
    missions: [
      { text: '쌓기나무 5개로 마음대로 쌓아 봐요. 칸을 누르면 하나씩 올라가요.', check: h => sum(h) === 5 && '5개로 멋지게 쌓았어요!' },
      { text: '한 칸에 3층짜리 탑을 쌓아 봐요.', check: h => h.flat().includes(3) && '3층 탑 완성! 아래 쌓기나무가 위를 받치고 있어요.' },
      { text: '그림처럼 앞줄에 계단을 쌓아 봐요.', target: [[0, 0, 0], [0, 0, 0], [1, 2, 3]] },
      { text: '그림처럼 쌓아 봐요. 뒤에 숨은 쌓기나무도 잘 보세요.', target: [[0, 1, 0], [1, 2, 1], [0, 1, 0]] },
      { text: '앞에서 보면 그림처럼 보이게 쌓아 봐요. 쌓기나무를 가장 적게 써 볼까요?', front: [2, 1, 3] },
    ],
    free: { text: '마음대로 쌓아 봐요. 앞에서 본 모양도 함께 보여요.' },
    mount(box, m, api) {
      const h = Array.from({ length: S }, () => Array(S).fill(0));
      let rm = false;
      box.innerHTML = `${m.target ? `<div class="m-act-goal"><b>이렇게</b>${MathGen.blocksSvg(m.target, 22)}</div>` : ''}${m.front ? `<div class="m-act-goal"><b>앞에서 본 모양</b>${frontSvg(m.front, '#b39ddb')}</div>` : ''}
        <div class="m-act-row"><div class="m-act-view"></div><div class="m-act-side"><small>앞에서 본 모양</small><div class="m-act-front"></div></div></div>
        <div class="m-act-row"><div class="m-bgrid" role="grid" aria-label="위에서 본 칸. 누르면 쌓기나무를 올려요">${h.map((r, y) => r.map((_, x) => `<button class="m-bcell" data-y="${y}" data-x="${x}"></button>`).join('')).join('')}</div>
        <div class="m-act-tools"><small>↑ 뒤</small><button class="btn btn-ghost sm on" data-mode="add">➕ 쌓기</button><button class="btn btn-ghost sm" data-mode="rm">➖ 빼기</button><small>↓ 앞</small></div></div>`;
      const view = $('.m-act-view', box), fv = $('.m-act-front', box);
      const draw = () => {
        view.innerHTML = MathGen.blocksSvg(h, 30); fv.innerHTML = frontSvg(front(h));
        $$('.m-bcell', box).forEach(b => { const v = h[+b.dataset.y][+b.dataset.x]; b.textContent = v || ''; b.classList.toggle('on', v > 0); b.setAttribute('aria-label', `${v}층`); });
        const n = sum(h);
        let win = false;
        if (m.check) win = m.check(h);
        else if (m.target) win = same(h, m.target) && `똑같이 쌓았어요! 쌓기나무 ${n}개예요.`;
        else if (m.front) { const f = front(h); if (f.every((v, x) => v === m.front[x])) win = n === m.front.reduce((a, b) => a + b, 0) ? `앞모습이 똑같아요! ${n}개로 가장 적게 쌓았어요.` : `앞모습이 똑같아요! ${n}개를 썼어요. 더 적게도 쌓을 수 있을까요?`; }
        if (win) api.done(win); else api.status(n ? `쌓기나무 ${n}개` : '칸을 눌러 쌓아 봐요');
      };
      $$('[data-mode]', box).forEach(b => b.onclick = () => { rm = b.dataset.mode === 'rm'; $$('[data-mode]', box).forEach(x => x.classList.toggle('on', x === b)); Speech.sfx.tap(); });
      $$('.m-bcell', box).forEach(b => b.onclick = () => {
        const y = +b.dataset.y, x = +b.dataset.x;
        if (rm ? !h[y][x] : h[y][x] >= MAXH) return Speech.sfx.wrong();
        h[y][x] += rm ? -1 : 1; Speech.sfx.tap(); draw();
      });
      draw();
    },
  };
})();

// ── 성냥개비: 막대를 눌러 손에 들고, 빈자리를 눌러 놓는다. 숫자 만들기 → 숫자 바꾸기 → 막대 하나 옮겨 식 고치기 ──
(() => {
  const DIG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcfgd' };
  const digOf = set => { for (const [d, s] of Object.entries(DIG)) if (s.length === set.size && [...s].every(k => set.has(k))) return d; return null; };
  // 판: 글자열 '6+4=4' 또는 '_'(빈 숫자 칸) → 칸 목록. 칸 = { t:'d', on:Set } · { t:'o', on:Set(h,v) } · { t:'e' }
  const parse = str => [...str].map(ch => /\d/.test(ch) ? { t: 'd', on: new Set(DIG[ch]) } : ch === '_' ? { t: 'd', on: new Set() } : ch === '+' ? { t: 'o', on: new Set('hv') } : ch === '-' ? { t: 'o', on: new Set('h') } : { t: 'e' });
  const OXY = { h: [4, 45, 34, 45], v: [19, 30, 19, 60] };
  const read = b => b.map(c => c.t === 'd' ? digOf(c.on) : c.t === 'o' ? (c.on.has('h') ? (c.on.has('v') ? '+' : '-') : null) : '=');
  const truth = b => {
    const s = read(b); if (s.includes(null)) return null;
    const str = s.join(''), [l, r] = str.split('='); if (!/^\d[+-]\d$/.test(l) || !/^\d$/.test(r)) return null;
    return { str, ok: (l[1] === '+' ? +l[0] + +l[2] : +l[0] - +l[2]) === +r };
  };
  const key = b => b.map(c => c.t === 'e' ? '=' : [...c.on].sort().join('')).join('|');
  const diff = (a, b) => a.reduce((n, c, k) => n + (c.t === 'e' ? 0 : [...new Set([...c.on, ...b[k].on])].filter(s => c.on.has(s) !== b[k].on.has(s)).length), 0);
  // 막대 하나 옮겨 고칠 수 있는 틀린 식 만들기 (맞는 식에서 막대 하나를 옮겨 틀리게)
  const wrongEq = () => {
    for (let tries = 0; tries < 400; tries++) {
      const a = Math.floor(Math.random() * 10), b = Math.floor(Math.random() * 10), plus = Math.random() < .5, c = plus ? a + b : a - b;
      if (c < 0 || c > 9) continue;
      const good = parse(`${a}${plus ? '+' : '-'}${b}=${c}`), slots = [];
      good.forEach((cl, k) => { if (cl.t === 'd') 'abcdefg'.split('').forEach(s => slots.push([k, s])); if (cl.t === 'o') slots.push([k, 'h'], [k, 'v']); });
      const from = slots.filter(([k, s]) => good[k].on.has(s)), to = slots.filter(([k, s]) => !good[k].on.has(s));
      const [fk, fs] = from[Math.floor(Math.random() * from.length)], [tk, ts] = to[Math.floor(Math.random() * to.length)];
      const bad = good.map(cl => cl.t === 'e' ? cl : { t: cl.t, on: new Set(cl.on) });
      bad[fk].on.delete(fs); bad[tk].on.add(ts);
      const tr = truth(bad);
      if (tr && !tr.ok) return bad;
    }
    return parse('6+4=4');
  };
  const W = c => c.t === 'd' ? 56 : 46;
  const boardSvg = b => {
    let x = 0, out = '';
    b.forEach((c, k) => {
      if (c.t === 'd') out += `<g transform="translate(${x} 0)">${Object.entries(MathGen.SEGXY).map(([s, xy]) => `<g class="m-seg" data-k="${k}" data-s="${s}">${MathGen.stick(xy, c.on.has(s))}<line x1="${xy[0]}" y1="${xy[1]}" x2="${xy[2]}" y2="${xy[3]}" stroke="transparent" stroke-width="16"/></g>`).join('')}</g>`;
      else if (c.t === 'o') out += `<g transform="translate(${x} 0)">${Object.entries(OXY).map(([s, xy]) => `<g class="m-seg" data-k="${k}" data-s="${s}">${MathGen.stick(xy, c.on.has(s))}<line x1="${xy[0]}" y1="${xy[1]}" x2="${xy[2]}" y2="${xy[3]}" stroke="transparent" stroke-width="16"/></g>`).join('')}</g>`;
      else out += `<g transform="translate(${x} 0)">${MathGen.stick([4, 36, 34, 36])}${MathGen.stick([4, 54, 34, 54])}</g>`;
      x += W(c);
    });
    return `<svg viewBox="-6 0 ${x + 8} 92" class="m-match play m-act-match" style="width:${Math.min(560, Math.round((x + 12) * 1.25))}px">${out}</svg>`;
  };
  MATH_ACTS.match = {
    missions: [
      { text: '막대 3개를 손에 들었어요. 빈자리를 눌러 놓아서 숫자 7을 만들어 봐요.', board: '_', hand: 3, goal: b => read(b)[0] === '7' && '7 완성! 7은 막대 3개로 만들어요.' },
      { text: '막대 5개로 숫자를 만들어 봐요. 서로 다른 숫자를 두 개 찾으면 성공이에요.', board: '_', hand: 5, five: true },
      { text: '6에서 막대 하나를 빼서 다른 자리에 옮겨, 9를 만들어 봐요.', board: '6', hand: 0, goal: b => read(b)[0] === '9' && '9 완성! 막대 하나만 옮겼는데 다른 숫자가 됐어요.' },
      { text: '틀린 식이에요. 막대 하나만 옮겨서 맞는 식으로 고쳐 봐요.', eq: true },
      { text: '하나 더! 막대 하나만 옮겨서 맞는 식을 만들어 봐요.', eq: true },
    ],
    free: { text: '막대를 마음대로 옮겨 식을 만들어 봐요. 맞는 식이 되면 알려 줘요.', board: '8+8=8', hand: 6, open: true },
    mount(box, m, api) {
      const b = m.eq ? wrongEq() : parse(m.board), start = b.map(c => c.t === 'e' ? c : { t: c.t, on: new Set(c.on) }), found = new Set();
      let hand = m.hand || 0;
      box.innerHTML = `<div class="m-act-board"></div><p class="m-act-hand"></p>`;
      const view = $('.m-act-board', box), hd = $('.m-act-hand', box);
      const draw = () => {
        view.innerHTML = boardSvg(b);
        hd.innerHTML = hand ? `손에 든 막대 ${'<i class="m-stk"></i>'.repeat(hand)} ${hand}개` : '손에 든 막대 없음';
        $$('.m-seg', view).forEach(g => g.onclick = () => {
          const c = b[+g.dataset.k], s = g.dataset.s;
          if (c.on.has(s)) { c.on.delete(s); hand++; } else if (hand > 0) { c.on.add(s); hand--; } else return Speech.sfx.wrong();
          Speech.sfx.tap(); draw(); judge();
        });
      };
      const judge = () => {
        if (m.goal) { const w = hand === 0 && m.goal(b); return w ? api.done(w) : api.status(hand ? '빈자리를 눌러 막대를 놓아요' : read(b)[0] ? `지금은 ${read(b)[0]}` : '숫자 모양이 아니에요'); }
        if (m.five) {
          const d = hand === 0 && read(b)[0];
          if (d) found.add(d);
          const list = [...found].join(', ');
          if (found.size >= 2) return api.done(`${list}! 막대 5개로 2, 3, 5를 만들 수 있어요.`);
          return api.status(found.size ? `찾은 숫자: ${list} · 막대를 눌러 빼고 다른 숫자도 만들어 봐요` : hand ? '빈자리를 눌러 막대를 놓아요' : '숫자 모양이 아니에요. 막대를 다시 옮겨 봐요');
        }
        const tr = hand === 0 && truth(b);
        if (m.open) return api.status(hand ? `손에 든 막대 ${hand}개` : tr ? (tr.ok ? `${tr.str.replace('-', '−')} 맞는 식이에요! 🎉` : `${tr.str.replace('-', '−')} 은 틀린 식이에요`) : '숫자와 기호 모양을 맞춰 봐요');
        if (hand) return api.status('막대를 놓을 빈자리를 눌러요');
        if (!tr) return api.status(diff(b, start) ? '숫자나 기호 모양이 아니에요. 다시 옮겨 봐요' : ' ');
        if (tr.ok && diff(b, start) === 2) return api.done(`${tr.str.replace('-', '−')} 맞는 식이 됐어요!`);
        if (tr.ok) return api.status('맞는 식이지만, 막대는 하나만 옮겨야 해요. 처음부터 해 봐요');
        api.status(diff(b, start) ? `${tr.str.replace('-', '−')} 아직 틀린 식이에요` : ' ');
      };
      draw(); judge();
    },
  };
})();

// ── 한붓그리기: 손가락(마우스)을 떼지 않고 점에서 점으로 끌어 그린다. 떼면 처음부터. 마지막엔 내 그림을 만들어 본다 ──
(() => {
  const FIGS = MathGen.FIGS;
  const degs = f => f.n.map((_, i) => f.e.filter(([a, b]) => a === i || b === i).length);
  const connected = f => {
    const act = f.n.map((_, i) => f.e.some(([a, b]) => a === i || b === i)), first = act.indexOf(true);
    if (first < 0) return false;
    const seen = new Set([first]), st = [first];
    while (st.length) { const v = st.pop(); f.e.forEach(([a, b]) => { const w = a === v ? b : b === v ? a : -1; if (w >= 0 && !seen.has(w)) { seen.add(w); st.push(w); } }); }
    return act.every((on, i) => !on || seen.has(i));
  };
  const GRID = { n: Array.from({ length: 9 }, (_, k) => [15 + (k % 3) * 35, 15 + Math.floor(k / 3) * 35]), e: [] };
  const SVG0 = '<svg viewBox="-8 -8 116 116" class="m-fig play m-act-fig">';
  const svgOf = (f, o) => `${SVG0}${figIn(f, o)}</svg>`;
  const figIn = (f, { used = [], cur = null, odd = false, sel = null, tmp = null } = {}) => {
    const d = degs(f);
    return `${f.e.map(([a, b], k) => `<line x1="${f.n[a][0]}" y1="${f.n[a][1]}" x2="${f.n[b][0]}" y2="${f.n[b][1]}" stroke="${used.includes(k) ? '#ff7043' : 'currentColor'}" stroke-opacity="${used.includes(k) ? 1 : .55}" stroke-width="${used.includes(k) ? 7 : 4}" stroke-linecap="round"/>`).join('')}
      ${tmp ? `<line x1="${tmp[0]}" y1="${tmp[1]}" x2="${tmp[2]}" y2="${tmp[3]}" stroke="#ff7043" stroke-width="4" stroke-dasharray="4 4" stroke-linecap="round"/>` : ''}
      ${f.n.map(([x, y], i) => { const red = odd && d[i] % 2; return `<g class="m-fnode" data-node="${i}"><circle cx="${x}" cy="${y}" r="${i === cur || i === sel ? 9 : 7}" fill="${i === cur || i === sel ? '#ff7043' : red ? '#e53935' : '#3a2d4f'}" stroke="#fff" stroke-width="2"/>${odd && d[i] ? `<text x="${x}" y="${y + 19}" font-size="10" text-anchor="middle" fill="${red ? '#e53935' : '#78909c'}">${d[i]}</text>` : ''}</g>`; }).join('')}`;
  };
  // 끌어서 그리기. onEnd(결과): 'done' 다 그림 · 'lift' 중간에 뗌 · 'stuck' 막힘
  const drawMode = (view, f, api, { hintAfter = 2, onDone } = {}) => {
    let used = [], cur = null, tmp = null, fails = 0, busy = false;
    view.innerHTML = svgOf(f, {});
    const svg = $('svg', view);
    const paint = () => { svg.innerHTML = figIn(f, { used, cur, tmp, odd: fails >= hintAfter }); };
    const near = p => f.n.findIndex(([x, y]) => Math.hypot(x - p.x, y - p.y) < 11);
    const fail = msg => { fails++; busy = false; Speech.sfx.wrong(); api.status(msg + (fails >= hintAfter ? ' · 빨간 점(선이 홀수 개 모인 점)에서 시작해 봐요' : '')); used = []; cur = null; tmp = null; paint(); };
    svg.onpointerdown = e => {
      const i = near(mSvgPt(svg, e)); if (i < 0) return;
      e.preventDefault(); try { svg.setPointerCapture(e.pointerId); } catch (_) {}
      busy = true; used = []; cur = i; tmp = null; Speech.sfx.tap(); api.status('손을 떼지 말고 선을 따라가요'); paint();
    };
    svg.onpointermove = e => {
      if (!busy) return;
      const p = mSvgPt(svg, e), j = near(p);
      if (j >= 0 && j !== cur) {
        const k = f.e.findIndex(([a, b], q) => !used.includes(q) && ((a === cur && b === j) || (b === cur && a === j)));
        if (k >= 0) {
          used.push(k); cur = j; Speech.sfx.tap();
          if (used.length === f.e.length) { busy = false; tmp = null; paint(); return onDone ? onDone() : api.done('한 번에 다 그렸어요! ✏️'); }
          if (!f.e.some(([a, b], q) => !used.includes(q) && (a === cur || b === cur))) return fail('막혔어요! 다른 점에서 다시 시작해 봐요');
        }
      }
      tmp = [f.n[cur][0], f.n[cur][1], p.x, p.y]; paint();
    };
    svg.onpointerup = svg.onpointercancel = () => { if (!busy) return; busy = false; if (used.length < f.e.length) fail(used.length ? '손을 뗐어요! 처음부터 다시 그려 봐요' : '점을 누른 채로 선을 따라 끌어요'); };
    api.status('점 하나를 누르고, 손을 떼지 않고 선을 따라 끌어요');
    paint();
  };
  MATH_ACTS.euler = {
    missions: [
      { text: '점 하나에 손가락을 대고, 떼지 말고 선을 따라 끌어서 네모를 한 번에 그려 봐요.', fig: 'sq' },
      { text: '이번에는 집 모양이에요. 어느 점에서 시작하면 한 번에 그릴 수 있을까요?', fig: 'house' },
      { text: '리본 모양도 한 번에 그려 봐요.', fig: 'bow' },
      { text: '별을 한 번에 그려 봐요.', fig: 'star' },
      { text: '봉투 모양도 한 번에 그려질까요? 해 보고, 안 되면 아래 단추를 눌러요.', fig: 'env', no: true },
      { text: '내 그림을 만들어 봐요. 점 두 개를 차례로 누르면 선이 생겨요. 한 번에 그릴 수 있는 그림을 만들고 그려 보세요.', make: true },
    ],
    free: { text: '점을 이어 내 그림을 만들고, 한 번에 그려 봐요.', make: true, open: true },
    mount(box, m, api) {
      if (m.fig) {
        box.innerHTML = `<div class="m-act-view m-act-draw"></div>${m.no ? '<div class="row-center"><button class="btn btn-ghost" data-no>🙅 한 번에 안 돼요</button></div>' : ''}`;
        drawMode($('.m-act-draw', box), FIGS[m.fig], api, { hintAfter: m.no ? 99 : 2 });
        if (m.no) $('[data-no]', box).onclick = () => {
          $('.m-act-draw', box).innerHTML = svgOf(FIGS[m.fig], { odd: true });
          api.done('맞아요! 선이 홀수 개 모인 빨간 점이 4개라서 한 번에 못 그려요. 0개나 2개여야 해요.');
        };
        return;
      }
      // 만들기: 점 두 개를 눌러 선을 잇고(다시 누르면 지움), 그려 보기로 넘어간다
      const f = { n: GRID.n, e: [] };
      let sel = null;
      box.innerHTML = `<div class="m-act-view m-act-draw"></div><div class="row-center"><button class="btn btn-ghost" data-try disabled>✏️ 한 번에 그려 보기</button><button class="btn btn-ghost" data-edit hidden>🔧 다시 만들기</button></div>`;
      const view = $('.m-act-draw', box), tb = $('[data-try]', box), eb = $('[data-edit]', box);
      const verdict = () => {
        const odd = degs(f).filter(d => d % 2).length, con = connected(f);
        tb.disabled = !(f.e.length >= 3 && con && (odd === 0 || odd === 2));
        api.status(f.e.length < 3 ? `선 ${f.e.length}개 · 선을 3개 넘게 이어 봐요` : !con ? '선이 모두 이어져 있어야 해요' : odd === 0 || odd === 2 ? `빨간 점 ${odd}개 → 한 번에 그릴 수 있어요! 그려 보기를 눌러요` : `빨간 점 ${odd}개 → 한 번에 못 그려요. 선을 더하거나 빼 봐요`);
      };
      const edit = () => {
        view.innerHTML = svgOf(f, { odd: true, sel });
        $$('.m-fnode', view).forEach(g => g.onclick = () => {
          const i = +g.dataset.node;
          if (sel === null) { sel = i; Speech.sfx.tap(); return edit(); }
          if (sel === i) { sel = null; return edit(); }
          const [a, b] = [Math.min(sel, i), Math.max(sel, i)], [x1, y1] = f.n[a], [x2, y2] = f.n[b];
          // 가운데 점을 건너뛰는 선은 막는다(가로·세로·대각선으로 두 칸)
          if (f.n.some(([x, y], k) => k !== a && k !== b && Math.abs((x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)) < 1 && x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1, y2) && y <= Math.max(y1, y2))) { Speech.sfx.wrong(); api.status('바로 옆 점끼리만 이어요'); sel = null; return edit(); }
          const k = f.e.findIndex(([p, q]) => p === a && q === b);
          if (k >= 0) f.e.splice(k, 1); else f.e.push([a, b]);
          Speech.sfx.tap(); sel = i; edit(); verdict();
        });
      };
      tb.onclick = () => {
        sel = null; tb.hidden = true; eb.hidden = false;
        const g = { n: f.n, e: f.e.map(x => [...x]) };
        drawMode(view, g, api, { hintAfter: 1, onDone: () => (m.open ? api.status('내 그림을 한 번에 다 그렸어요! ✏️') : api.done('내가 만든 그림을 한 번에 그렸어요! ✏️')) });
      };
      eb.onclick = () => { tb.hidden = false; eb.hidden = true; api.undo(); edit(); verdict(); };
      edit(); verdict();
    },
  };
})();

// ── 각: 빨간 손잡이를 끌어 각을 벌렸다 오므린다. 각도기 눈금과 각의 이름이 바로 보인다 ──
(() => {
  const CX = 110, CY = 118, R = 96;
  const kind = d => d <= 0 ? '' : d < 90 ? '예각' : d === 90 ? '직각' : d < 180 ? '둔각' : '평각(일직선)';
  const svg = d => {
    const r = d * Math.PI / 180, X = CX + R * Math.cos(r), Y = CY - R * Math.sin(r);
    const ticks = Array.from({ length: 19 }, (_, k) => { const a = k * 10 * Math.PI / 180, l = k % 3 ? 6 : 11; return `<line x1="${CX + (R + 8) * Math.cos(a)}" y1="${CY - (R + 8) * Math.sin(a)}" x2="${CX + (R + 8 + l) * Math.cos(a)}" y2="${CY - (R + 8 + l) * Math.sin(a)}" stroke="currentColor" stroke-opacity=".5" stroke-width="1.5"/>${k % 3 ? '' : `<text x="${CX + (R + 28) * Math.cos(a)}" y="${CY - (R + 28) * Math.sin(a) + 4}" font-size="10" text-anchor="middle" fill="currentColor" fill-opacity=".6">${k * 10}</text>`}`; }).join('');
    const ar = 26, mark = d === 90 ? `<path d="M${CX + 18} ${CY} V${CY - 18} H${CX}" fill="none" stroke="#ff7043" stroke-width="3"/>` : d > 0 ? `<path d="M${CX} ${CY} L${CX + ar} ${CY} A${ar} ${ar} 0 ${d > 180 ? 1 : 0} 0 ${CX + ar * Math.cos(r)} ${CY - ar * Math.sin(r)} Z" fill="#ff7043" fill-opacity=".25" stroke="#ff7043" stroke-width="2"/>` : '';
    return `<path d="M${CX - R - 8} ${CY} A${R + 8} ${R + 8} 0 0 1 ${CX + R + 8} ${CY}" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="1.5"/>${ticks}${mark}
      <g stroke="currentColor" stroke-width="6" stroke-linecap="round"><line x1="${CX}" y1="${CY}" x2="${CX + R}" y2="${CY}"/><line x1="${CX}" y1="${CY}" x2="${X}" y2="${Y}"/></g>
      <circle cx="${CX}" cy="${CY}" r="5" fill="currentColor"/><circle class="m-act-knob" cx="${X}" cy="${Y}" r="13" fill="#ff7043" stroke="#fff" stroke-width="3"/>`;
  };
  MATH_ACTS.angle = {
    missions: [
      { text: '빨간 손잡이를 잡고 돌려서 각을 벌렸다 오므렸다 해 봐요. 그다음 쭉 펴서 일직선을 만들어요.', ok: d => d === 180, win: '쭉 편 일직선은 180도예요. 직각 두 개만큼이에요.' },
      { text: '공책 모서리처럼 반듯한 직각을 만들어 봐요.', ok: d => d === 90, win: '직각 완성! 직각은 90도예요.' },
      { text: '직각보다 작은 각, 예각을 만들어 봐요.', ok: d => d > 5 && d < 85, win: d => `${d}도는 직각보다 작으니까 예각이에요.` },
      { text: '직각보다 크고 일직선보다 작은 각, 둔각을 만들어 봐요.', ok: d => d > 95 && d < 175, win: d => `${d}도는 직각보다 크니까 둔각이에요.` },
      { text: '직각의 반, 45도를 만들어 봐요. 눈금을 잘 보세요.', ok: d => d === 45, win: '45도! 직각을 반으로 나눈 각이에요.' },
      { text: '120도를 만들어 봐요.', ok: d => d === 120, win: '120도, 둔각이에요. 직각보다 30도 더 벌어졌어요.' },
    ],
    free: { text: '마음대로 각을 벌렸다 오므렸다 해 봐요.' },
    mount(box, m, api) {
      let d = 30;
      box.innerHTML = `<div class="m-act-view m-act-angv"><svg viewBox="-20 -20 260 152" class="m-act-ang"></svg></div><p class="m-act-deg"></p>`;
      const sv = $('svg', box), out = $('.m-act-deg', box);
      let drag = false;
      const set = v => {
        // 45·90·120·180 가까이(±2도)에서는 살짝 붙는다. 손으로 딱 맞추기 어려워서
        v = Math.max(0, Math.min(180, Math.round(v)));
        for (const t of [45, 90, 120, 180]) if (Math.abs(v - t) <= 2) v = t;
        if (v === d && sv.firstChild) return;
        d = v; sv.innerHTML = svg(d); sv.setAttribute('aria-label', `${d}도, ${kind(d)}`); out.innerHTML = `<b>${d}°</b> ${kind(d)}`;
        if (m.ok && m.ok(d)) api.done(typeof m.win === 'function' ? m.win(d) : m.win); else if (m.ok) api.status(' ');
      };
      const move = e => { const p = mSvgPt(sv, e); let a = Math.atan2(CY - p.y, p.x - CX) * 180 / Math.PI; if (a < -90) a = 180; else if (a < 0) a = 0; set(a); };
      sv.onpointerdown = e => { e.preventDefault(); try { sv.setPointerCapture(e.pointerId); } catch (_) {} drag = true; move(e); };
      sv.onpointermove = e => { if (drag) move(e); };
      sv.onpointerup = sv.onpointercancel = () => { drag = false; };
      d = -1; set(30);
    },
  };
})();

// ── 분수: 피자를 똑같이 자르고, 조각을 눌러 칠한다 ──
(() => {
  const sector = (k, n, on) => {
    const a0 = (k / n) * 2 * Math.PI - Math.PI / 2, a1 = ((k + 1) / n) * 2 * Math.PI - Math.PI / 2, r = 80;
    const p = n === 1 ? `<circle cx="100" cy="100" r="${r}"/>` : `<path d="M100 100 L${100 + r * Math.cos(a0)} ${100 + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${100 + r * Math.cos(a1)} ${100 + r * Math.sin(a1)} Z"/>`;
    return `<g class="m-slice ${on ? 'on' : ''}" data-k="${k}" fill="${on ? '#ff8a65' : '#fff3e0'}" stroke="#8d6e63" stroke-width="3" stroke-linejoin="round">${p}</g>`;
  };
  MATH_ACTS.frac = {
    missions: [
      { text: '✂️ 단추로 피자를 4조각으로 똑같이 자르고, 1조각을 눌러 칠해 봐요.', ok: (k, n) => n === 4 && k === 1, win: '4분의 1! 넷으로 똑같이 나눈 것 가운데 하나예요.' },
      { text: '4조각 피자에서 4분의 3을 칠해 봐요.', ok: (k, n) => n === 4 && k === 3, win: '4분의 3! 조금만 남았어요.' },
      { text: '피자를 3조각으로 자르고, 3분의 2를 칠해 봐요.', ok: (k, n) => n === 3 && k === 2, win: '3분의 2! 분모 3은 나눈 조각 수, 분자 2는 칠한 조각 수예요.' },
      { text: '피자를 6조각으로 자르고, 피자의 반만큼 칠해 봐요.', ok: (k, n) => n === 6 && k === 3, win: '6분의 3은 피자의 반, 2분의 1과 같아요!' },
      { text: '8조각 피자에서 4분의 1만큼 칠해 봐요. 몇 조각을 칠해야 할까요?', ok: (k, n) => n === 8 && k === 2, win: '8조각 가운데 2조각이 4분의 1이에요. 8분의 2와 4분의 1은 같아요.' },
    ],
    free: { text: '마음대로 자르고 칠해 봐요.' },
    mount(box, m, api) {
      let n = 2, on = [];
      box.innerHTML = `<div class="m-act-row"><div class="m-act-view m-act-pie"></div><div class="m-act-side m-act-fr"></div></div>
        <div class="row-center m-act-cut"><button class="btn btn-ghost sm" data-c="-1" aria-label="조각 줄이기">➖</button><b class="m-act-n"></b><button class="btn btn-ghost sm" data-c="1" aria-label="조각 늘리기">✂️ 더 자르기</button></div>`;
      const view = $('.m-act-pie', box), fr = $('.m-act-fr', box), nl = $('.m-act-n', box);
      const draw = () => {
        const k = on.filter(Boolean).length;
        view.innerHTML = `<svg viewBox="10 10 180 180" class="m-act-pizza" aria-label="${n}조각 가운데 ${k}조각 칠함">${Array.from({ length: n }, (_, j) => sector(j, n, on[j])).join('')}</svg>`;
        nl.textContent = `${n}조각`;
        fr.innerHTML = k ? `${MathGen.fracTxt(`${k}/${n}`)}<small>칠한 ${k}조각<br>전체 ${n}조각</small>` : '<small>조각을 눌러<br>칠해요</small>';
        $$('.m-slice', view).forEach(g => g.onclick = () => { const j = +g.dataset.k; on[j] = !on[j]; Speech.sfx.tap(); draw(); });
        if (m.ok && m.ok(k, n)) api.done(m.win); else if (m.ok) api.status(' ');
      };
      $$('[data-c]', box).forEach(b => b.onclick = () => { const v = n + +b.dataset.c; if (v < 1 || v > 8) return Speech.sfx.wrong(); n = v; on = []; Speech.sfx.tap(); draw(); });
      draw();
    },
  };
})();

// ── 다각형: 점판의 점을 차례로 눌러 꼭짓점을 찍고, 첫 점을 다시 누르면 닫힌다 ──
(() => {
  const G = 5, P = k => [10 + (k % G) * 20, 10 + Math.floor(k / G) * 20];
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const hit = (p1, p2, p3, p4) => { const d1 = cross(p3, p4, p1), d2 = cross(p3, p4, p2), d3 = cross(p1, p2, p3), d4 = cross(p1, p2, p4); return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0)); };
  // 한 줄 위에 있는 꼭짓점은 빼고 센다
  const corners = pts => pts.filter((p, i) => cross(pts[(i - 1 + pts.length) % pts.length], p, pts[(i + 1) % pts.length]) !== 0);
  const simple = pts => { const n = pts.length; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 1)) continue; if (hit(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) return false; } return true; };
  const area2 = pts => Math.abs(pts.reduce((s, p, i) => s + cross([0, 0], p, pts[(i + 1) % pts.length]), 0));
  MATH_ACTS.poly = {
    missions: [3, 4, 5, 6, 8].map(n => ({ text: `점을 차례로 눌러 ${MathGen.POLY[n]}을 만들어 봐요. 처음 점을 다시 누르면 닫혀요.${n === 8 ? ' 변이 여덟 개예요!' : ''}`, n })),
    free: { text: '점을 이어 마음대로 다각형을 만들어 봐요.' },
    mount(box, m, api) {
      let pts = [], closed = false;
      box.innerHTML = `<div class="m-act-view m-act-polyv"></div><div class="row-center"><button class="btn btn-ghost sm" data-undo>↩️ 하나 지우기</button></div>`;
      const view = $('.m-act-polyv', box);
      const draw = () => {
        const xy = pts.map(P), cs = closed ? corners(xy) : [];
        view.innerHTML = `<svg viewBox="0 0 100 100" class="m-act-dots" aria-label="점판">${closed ? `<polygon points="${xy.join(' ')}" fill="#4db6ac" fill-opacity=".55" stroke="#3a2d4f" stroke-width="2.5" stroke-linejoin="round"/>` : `<polyline points="${xy.join(' ')}" fill="none" stroke="#3a2d4f" stroke-width="2.5" stroke-linejoin="round"/>`}
          ${Array.from({ length: G * G }, (_, k) => { const [x, y] = P(k), i = pts.indexOf(k); return `<g class="m-pdot" data-k="${k}"><circle cx="${x}" cy="${y}" r="9" fill="transparent"/><circle cx="${x}" cy="${y}" r="${i >= 0 ? 4 : 2.6}" fill="${i === 0 && !closed ? '#ff7043' : i >= 0 ? '#3a2d4f' : '#b0bec5'}"/></g>`; }).join('')}
          ${cs.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#ff7043"/>`).join('')}</svg>`;
        $$('.m-pdot', view).forEach(g => g.onclick = () => {
          if (closed) return;
          const k = +g.dataset.k;
          if (k === pts[0] && pts.length >= 3) {
            const xy2 = pts.map(P);
            if (!simple(xy2)) { Speech.sfx.wrong(); return api.status('선이 서로 엇갈렸어요. 하나 지우기로 고쳐 봐요'); }
            if (!area2(xy2)) { Speech.sfx.wrong(); return api.status('모두 한 줄 위에 있어서 도형이 안 돼요'); }
            closed = true; Speech.sfx.tap(); draw(); return judge();
          }
          if (pts.includes(k)) return Speech.sfx.wrong();
          pts.push(k); Speech.sfx.tap(); draw(); api.status(pts.length === 1 ? '다음 점을 눌러요' : `점 ${pts.length}개 · 처음 점(주황)을 누르면 닫혀요`);
        });
      };
      const judge = () => {
        const c = corners(pts.map(P)).length, name = MathGen.POLY[c] || `${c}각형`;
        if (m.n) { if (c === m.n) api.done(`${name} 완성! 변 ${c}개, 꼭짓점 ${c}개예요.`); else api.status(`변이 ${c}개인 ${name}이에요. ${MathGen.POLY[m.n]}은 변이 ${m.n}개예요. 하나 지우기로 고쳐 봐요`); }
        else api.status(`${name}! 변 ${c}개, 꼭짓점 ${c}개`);
      };
      $('[data-undo]', box).onclick = () => { if (closed) { closed = false; api.undo(); } else pts.pop(); Speech.sfx.tap(); draw(); api.status(pts.length ? `점 ${pts.length}개` : '점을 눌러 시작해요'); };
      draw(); api.status('점을 눌러 시작해요');
    },
  };
})();

// ── 곱셈: 판의 칸을 누르면 그만큼 줄과 개수로 사탕이 놓인다. 돌려 보기로 순서를 바꾼다 ──
(() => {
  const RW = 6, CL = 8;
  MATH_ACTS.mul = {
    missions: [
      { text: '사탕을 3줄에 4개씩 놓아 봐요. 3줄 4번째 칸을 누르면 돼요.', ok: (r, c) => r === 3 && c === 4 && '4 × 3 = 12! 4개씩 3줄이면 12개예요.' },
      { text: '🔄 돌려 보기를 눌러서 4줄에 3개씩으로 바꿔 봐요. 사탕은 몇 개가 될까요?', ok: (r, c, turned) => r === 4 && c === 3 && turned && '3 × 4 = 12, 그대로 12개! 순서를 바꿔 곱해도 같아요.' },
      { text: '사탕 12개를 똑같은 줄로 놓는 방법을 세 가지 찾아봐요.', twelve: true },
      { text: '5줄에 6개씩 놓아 봐요. 모두 몇 개일까요?', ok: (r, c) => r === 5 && c === 6 && '6 × 5 = 30! 6씩 5번 뛰어 세면 6, 12, 18, 24, 30.' },
    ],
    free: { text: '칸을 눌러 마음대로 곱셈을 만들어 봐요.' },
    mount(box, m, api) {
      let r = 0, c = 0, turned = false;
      const found = new Set();
      box.innerHTML = `<div class="m-act-arr" style="--c:${CL}"></div><p class="m-act-eq"></p><div class="row-center"><button class="btn btn-ghost sm" data-turn>🔄 돌려 보기</button></div>`;
      const g = $('.m-act-arr', box), eq = $('.m-act-eq', box);
      const draw = () => {
        g.innerHTML = Array.from({ length: RW * CL }, (_, k) => { const y = Math.floor(k / CL), x = k % CL, on = y < r && x < c; return `<button class="m-arr ${on ? 'on' : ''}" data-y="${y}" data-x="${x}" aria-label="${y + 1}줄 ${x + 1}개">${on ? '🍬' : ''}</button>`; }).join('');
        eq.innerHTML = r && c ? `${c}개씩 ${r}줄 · ${c} × ${r} = <b>${r * c}</b>개` : '칸을 눌러 봐요';
        $$('.m-arr', g).forEach(b => b.onclick = () => { r = +b.dataset.y + 1; c = +b.dataset.x + 1; turned = false; Speech.sfx.tap(); draw(); judge(); });
      };
      const judge = () => {
        if (m.twelve) {
          if (r * c === 12) found.add(`${c} × ${r}`);
          const list = [...found].join(', ');
          return found.size >= 3 ? api.done(`${list}! 모두 12개예요. 12는 여러 가지 곱셈으로 만들 수 있어요.`, '세 가지 모두 찾았어요! 모두 12개예요. 12는 여러 가지 곱셈으로 만들 수 있어요.') : api.status(found.size ? `찾은 방법: ${list}` : r && c ? `${r * c}개예요. 12개가 되게 해 봐요` : ' ');
        }
        const w = m.ok && r && c && m.ok(r, c, turned);
        if (w) api.done(w); else if (m.ok) api.status(' ');
      };
      $('[data-turn]', box).onclick = () => { if (!r) return; if (c > RW) { Speech.sfx.wrong(); return api.status(`판이 좁아서 ${c}줄은 못 놓아요`); } [r, c] = [c, r]; turned = true; Speech.sfx.tap(); draw(); judge(); };
      draw();
    },
  };
})();

// ── 넓이와 둘레: 칸을 눌러 칠하면 넓이(칸 수)와 둘레(바깥 선 수)가 바로 보인다 ──
(() => {
  const RW = 5, CL = 7;
  const info = on => {
    const cells = [...on].map(k => [Math.floor(k / CL), k % CL]), has = (y, x) => on.has(y * CL + x);
    let per = 0; cells.forEach(([y, x]) => { per += 4 - [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dy, dx]) => has(y + dy, x + dx) && x + dx >= 0 && x + dx < CL).length; });
    const seen = new Set(), st = cells.length ? [cells[0]] : [];
    if (st.length) seen.add(st[0].join());
    while (st.length) { const [y, x] = st.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dy, dx]) => { const ny = y + dy, nx = x + dx; if (nx >= 0 && nx < CL && has(ny, nx) && !seen.has(`${ny},${nx}`)) { seen.add(`${ny},${nx}`); st.push([ny, nx]); } }); }
    const ys = cells.map(c => c[0]), xs = cells.map(c => c[1]), rect = cells.length && (Math.max(...ys) - Math.min(...ys) + 1) * (Math.max(...xs) - Math.min(...xs) + 1) === cells.length;
    return { a: cells.length, per, one: cells.length > 0 && seen.size === cells.length, rect };
  };
  MATH_ACTS.area = {
    missions: [
      { text: '칸 6개를 이어 칠해서 넓이가 6인 모양을 만들어 봐요.', ok: s => s.a === 6 && `넓이 6! 둘레는 ${mJo(s.per, '이에요', '예요')}.` },
      { text: '넓이가 4이고 둘레가 8인 모양을 만들어 봐요.', ok: s => s.a === 4 && s.per === 8 && '정사각형이에요! 넓이 4, 둘레 8.' },
      { text: '이번에는 넓이는 4 그대로, 둘레가 10인 모양을 만들어 봐요.', ok: s => s.a === 4 && s.per === 10 && '넓이는 같아도 모양에 따라 둘레가 달라져요!' },
      { text: '둘레가 12인 직사각형을 만들어 봐요.', ok: s => s.rect && s.per === 12 && `넓이 ${s.a}, 둘레 12인 직사각형! 다른 직사각형도 있을까요?` },
    ],
    free: { text: '칸을 칠해 마음대로 모양을 만들고, 넓이와 둘레를 견주어 봐요.' },
    mount(box, m, api) {
      const on = new Set();
      box.innerHTML = `<div class="m-act-arr m-act-area" style="--c:${CL}"></div><p class="m-act-eq"></p>`;
      const g = $('.m-act-area', box), eq = $('.m-act-eq', box);
      const draw = () => {
        g.innerHTML = Array.from({ length: RW * CL }, (_, k) => `<button class="m-arr m-cell ${on.has(k) ? 'on' : ''}" data-k="${k}" aria-label="${on.has(k) ? '칠한 칸' : '빈 칸'}"></button>`).join('');
        const s = info(on);
        eq.innerHTML = s.a ? `넓이 <b>${s.a}</b>칸 · 둘레 <b>${s.per}</b>` : '칸을 눌러 칠해요';
        $$('.m-cell', g).forEach(b => b.onclick = () => { const k = +b.dataset.k; on.has(k) ? on.delete(k) : on.add(k); Speech.sfx.tap(); draw(); });
        if (!m.ok) return;
        if (s.a && !s.one) return api.status('칸이 모두 한 덩어리로 이어져야 해요');
        const w = s.a && m.ok(s); if (w) api.done(w); else api.status(' ');
      };
      draw();
    },
  };
})();
