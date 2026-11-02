/* 새싹영어 — 놀이터 (미니게임)
 * 게임마다 단계·점수·콤보가 있고, 끝나면 메달과 오늘 만난 단어를 보여 줘요.
 * 움직임은 requestAnimationFrame으로 돌려서 다른 탭으로 가면 저절로 멈춰요. */

// medals: 동·은·금메달 점수 (메달 수만큼 별을 받아요)
const PLAY_GAMES = {
  balloon: { title: '풍선 팡팡', icon: '🎈', c: '#ff7aa8', hub: '소리를 듣고 둥둥 떠오르는 풍선을 터뜨려요', medals: [60, 250, 550],
    how: ['단어를 잘 듣고 맞는 풍선을 콕!', '틀리거나 놓치면 ❤️가 줄어요', '⭐ 풍선은 보너스, ❤️ 풍선은 목숨을 줘요'] },
  match: { title: '짝꿍 카드', icon: '🃏', c: '#7c5cff', hub: '카드를 기억해서 그림과 단어 짝을 찾아요', medals: [100, 300, 560],
    how: ['처음에 카드를 잘 봐 두세요', '시간 안에 그림과 단어 짝을 모두 찾아요', '🔎 돋보기를 누르면 카드를 잠깐 볼 수 있어요'] },
  frog: { title: '개구리 징검다리', icon: '🐸', c: '#3fae6a', hub: '악어가 오기 전에 글자 연잎을 밟아 단어를 만들어요', medals: [40, 200, 450],
    how: ['단어를 듣고 글자 연잎을 차례로 콕!', '🐊 악어가 오기 전에 단어를 끝내요', '🐞 무당벌레를 잡으면 악어가 뒤로 가요'] },
  fish: { title: '빈칸 낚시', icon: '🐟', c: '#2f9fd8', hub: '빠진 글자를 가진 물고기를 낚아 올려요', medals: [50, 220, 520],
    how: ['빠진 글자를 끌고 가는 물고기를 콕!', '틀리거나 🦈 상어를 누르면 🪱 미끼가 줄어요', '반짝이는 금빛 물고기는 점수가 2배예요'] },
  ox: { title: 'OX 스피드', icon: '⏱️', c: '#ff9f43', hub: '그림과 단어가 맞는지 빨리 골라요. 불꽃 타임을 노려요', medals: [60, 200, 450],
    how: ['그림과 단어가 맞으면 O, 다르면 X!', '맞히면 시간이 늘고, 틀리면 줄어요', '5번 연속 맞히면 🔥 불꽃 타임! 점수가 2배예요'] },
  basket: { title: '첫소리 바구니', icon: '🧺', c: '#c06ad8', hub: '떨어지는 그림의 첫소리 바구니를 빨리 눌러요', medals: [40, 200, 450],
    how: ['단어를 듣고 첫소리 글자 바구니를 콕!', '땅에 떨어지기 전에 담아요', '✨ 반짝이는 그림은 점수가 2배예요'] },
};
const MEDAL_ICONS = ['🥉', '🥈', '🥇'];
const medalCount = (name, score) => PLAY_GAMES[name].medals.filter(m => score >= m).length;
const medalRow = n => `<span class="gm-medals" aria-label="메달 ${n}개">${MEDAL_ICONS.map((m, k) => `<i class="${k < n ? 'on' : ''}">${m}</i>`).join('')}</span>`;

// 게임 효과음: 볼륨은 효과음 설정을 따른다
const GameFx = (() => {
  let ctx = null;
  function tone(freqs, { dur = 0.1, type = 'sine', gain = 0.12, slide = 0 } = {}) {
    const v = gain * Speech.volume.sfx * 2;
    if (v <= 0) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + i * dur;
        o.type = type; o.frequency.setValueAtTime(f, t0);
        if (slide) o.frequency.linearRampToValueAtTime(Math.max(40, f + slide), t0 + dur);
        o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 1.6);
        o.start(t0); o.stop(t0 + dur * 1.7);
      });
    } catch (e) { /* audio unavailable */ }
  }
  return {
    pop: () => tone([820], { dur: 0.08, type: 'triangle', slide: -500, gain: 0.16 }),
    splash: () => tone([320], { dur: 0.22, type: 'sawtooth', slide: -240, gain: 0.05 }),
    coin: () => tone([988, 1319], { dur: 0.07, type: 'square', gain: 0.05 }),
    heart: () => tone([523, 659, 784], { dur: 0.08, type: 'triangle' }),
    lose: () => tone([392, 294, 220], { dur: 0.13, type: 'triangle' }),
    combo: n => { const f = 523 * 2 ** (Math.min(n, 14) / 12); tone([f, f * 1.26], { dur: 0.07, type: 'triangle', gain: 0.13 }); },
    stage: () => tone([523, 659, 784, 1047, 1319], { dur: 0.09, type: 'triangle' }),
    tick: () => tone([1100], { dur: 0.03, gain: 0.06 }),
    count: () => tone([660], { dur: 0.12, type: 'triangle' }),
    go: () => tone([988, 1319], { dur: 0.14, type: 'triangle' }),
    fever: () => tone([660, 784, 988, 1319, 1568], { dur: 0.06, type: 'square', gain: 0.05 }),
  };
})();

// 모든 게임이 같이 쓰는 틀: 머리글(단계·목숨·점수·듣기), 효과, 결과 화면
function playKit(el, area, name, { hearts = 0, heartIcon = '❤️' } = {}) {
  area.innerHTML = `<div class="gm-hud"><span class="gm-stage"></span><span class="gm-hearts"></span><span class="gm-score">⭐ <b>0</b></span><button class="btn btn-ghost sm gm-say" aria-label="다시 듣기" hidden>🔊 듣기</button></div>
    <div class="gm-bar"><i></i></div>
    <div class="gm-box"><div class="gm-board"></div><div class="gm-fx" aria-hidden="true"></div><span class="gm-combo" hidden></span></div>`;
  const box = $('.gm-box', area), fx = $('.gm-fx', area), comboEl = $('.gm-combo', area), barEl = $('.gm-bar', area), sayBtn = $('.gm-say', area);
  const g = { score: 0, combo: 0, bestCombo: 0, right: 0, hearts, maxHearts: hearts, over: false, seen: new Map() };
  const alive = () => !g.over && document.body.contains(area);
  const after = (ms, fn) => setTimeout(() => { if (alive()) fn(); }, ms);
  const loop = fn => {
    let last = performance.now();
    const step = now => {
      if (!alive()) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now; // 다른 탭에 다녀와도 한 번에 뛰지 않게
      fn(dt, now);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  // 움직이는 것은 손을 떼기 전에 빠져나가므로 닿는 순간 반응한다 (키보드는 click으로)
  const tap = (b, fn) => {
    b.addEventListener('pointerdown', e => { if (e.button) return; e.preventDefault(); fn(e); });
    b.addEventListener('click', e => { if (e.detail === 0) fn(e); });
  };
  const drawHearts = () => {
    if (!g.maxHearts) return;
    const hearts = $('.gm-hearts', area);
    hearts.setAttribute('aria-label', `남은 목숨 ${g.hearts}개`);
    hearts.innerHTML = Array.from({ length: g.maxHearts }, (_, k) => `<i class="${k < g.hearts ? '' : 'off'}">${heartIcon}</i>`).join('');
  };
  const spot = a => {
    const o = fx.getBoundingClientRect();
    if (!a || !a.getBoundingClientRect) return a || { x: o.width / 2, y: o.height / 2 };
    const r = a.getBoundingClientRect();
    return { x: r.left - o.left + r.width / 2, y: r.top - o.top + r.height / 2 };
  };
  const float = (text, anchor, cls = '') => {
    const pos = spot(anchor), t = document.createElement('span');
    t.className = `gm-float ${cls}`; t.textContent = text;
    t.style.left = `${Math.max(36, Math.min(fx.clientWidth - 36, pos.x))}px`; t.style.top = `${pos.y}px`;
    fx.appendChild(t); setTimeout(() => t.remove(), 1000);
  };
  const burst = (anchor, n = 12) => {
    if (kit.reduced) return;
    const pos = spot(anchor), colors = ['#ff6b8b', '#ffd23f', '#58c472', '#33a8ff', '#b388ff', '#ff9f43'];
    for (let k = 0; k < n; k++) {
      const d = document.createElement('i'), a = (k / n) * Math.PI * 2, r = 46 + Math.random() * 50;
      d.className = 'gm-spark'; d.style.left = `${pos.x}px`; d.style.top = `${pos.y}px`; d.style.background = colors[k % colors.length];
      d.style.setProperty('--dx', `${Math.cos(a) * r}px`); d.style.setProperty('--dy', `${Math.sin(a) * r}px`);
      fx.appendChild(d); setTimeout(() => d.remove(), 650);
    }
  };
  const addScore = n => { g.score += n; $('.gm-score b', area).textContent = g.score; };
  const mult = () => (g.combo >= 6 ? 3 : g.combo >= 3 ? 2 : 1);
  const drawCombo = () => {
    comboEl.hidden = g.combo < 2;
    comboEl.textContent = `🔥 ${g.combo}연속${mult() > 1 ? ` · 점수 ${mult()}배` : ''}`;
    comboEl.classList.toggle('hot', mult() > 1);
  };
  const CHEERS = { 3: '좋아요!', 5: '멋져요!', 8: '대단해요!', 12: '최고예요!', 16: '영어 왕!' };
  const kit = {
    g, board: $('.gm-board', area), box, alive, after, loop, tap, float, burst,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    stage: t => { $('.gm-stage', area).textContent = t; },
    bar: (f, low = false) => { barEl.firstElementChild.style.width = `${Math.max(0, Math.min(1, f)) * 100}%`; barEl.classList.toggle('low', low); },
    barEnd: icon => { barEl.dataset.end = icon; },
    // 단어를 들려주고 듣기 버튼이 다시 들려줄 단어로 기억한다
    say(text) { sayBtn.hidden = false; sayBtn.onclick = () => Speech.speak(text); Speech.speak(text); },
    meet(w, missed = false) { const s = g.seen.get(w.en) || { ...w, missed: false }; s.missed = s.missed || missed; g.seen.set(w.en, s); },
    // 맞힘: 연속 기록과 배수를 올린다
    hit(base, anchor, factor = 1) {
      g.combo++; g.right++; g.bestCombo = Math.max(g.bestCombo, g.combo);
      const pts = base * mult() * factor; addScore(pts);
      float(`+${pts}`, anchor, 'pts'); burst(anchor); GameFx.combo(g.combo); drawCombo();
      if (CHEERS[g.combo]) float(CHEERS[g.combo], null, 'cheer');
      return pts;
    },
    bonus(pts, anchor, label = '') { addScore(pts); float(`${label}+${pts}`, anchor, 'pts gold'); burst(anchor, 8); GameFx.coin(); },
    add: addScore,
    miss() { g.combo = 0; drawCombo(); },
    lose() {
      g.hearts = Math.max(0, g.hearts - 1); g.combo = 0; drawCombo(); drawHearts(); GameFx.lose();
      box.classList.remove('hurt'); void box.offsetWidth; box.classList.add('hurt');
      return g.hearts > 0;
    },
    gain(anchor) { if (g.hearts < g.maxHearts) { g.hearts++; drawHearts(); GameFx.heart(); float(heartIcon, anchor, 'pts'); } },
    // 화면 가운데 큰 글씨. 끝나면 이어서 진행한다 (게임을 나갔으면 이어가지 않는다)
    banner: (big, small = '', ms = 1300) => new Promise(res => {
      const b = document.createElement('div'); b.className = 'gm-banner'; b.innerHTML = `<b>${big}</b>${small ? `<small>${small}</small>` : ''}`;
      box.appendChild(b); setTimeout(() => { b.remove(); if (alive()) res(); }, ms);
    }),
    async stageIntro(k, total, tip) {
      kit.stage(`${k + 1}단계`); kit.gain(); GameFx.stage();
      await kit.banner(k === total - 1 && total > 1 ? '마지막 단계!' : `${k + 1}단계`, tip);
    },
    finish({ clear = false, stats = [], note = '' } = {}) {
      if (g.over) return; g.over = true;
      if (clear && g.hearts) addScore(g.hearts * 10);
      const best = (Store.profile().games || {})[name] || 0, medals = medalCount(name, g.score), def = PLAY_GAMES[name];
      const r = Store.gameResult(name, g.score, medals);
      const nextAt = def.medals.find(m => r.best < m);
      const goal = nextAt ? `${MEDAL_ICONS[def.medals.indexOf(nextAt)]} 메달까지 <b>${nextAt - r.best}점</b> 남았어요!` : `메달을 다 모았어요! 다음엔 <b>${r.best + 10}점</b>에 도전!`;
      const seen = [...g.seen.values()].sort((a, b) => b.missed - a.missed).slice(0, 12);
      area.innerHTML = `<div class="result card anim-in gm-result"><div class="gm-medal-big">${medals ? MEDAL_ICONS[medals - 1] : '🌱'}</div>
        <div class="stamp">${g.score}<br>점</div>
        <h2>${r.newBest ? '🏆 새 기록!' : clear ? '끝까지 해냈어요!' : medals ? '잘했어요!' : '조금씩 늘고 있어요!'}</h2>
        ${note ? `<p class="gm-note">${note}</p>` : ''}
        <p>${r.newBest && best ? `지난 기록 ${best}점을 넘었어요 · ` : r.newBest ? '' : `최고 기록 ${r.best}점 · `}${r.got ? `⭐ ${r.got}개 받았어요!` : medals ? '오늘 게임 별은 다 받았어요' : '메달을 따면 별을 받아요'}</p>
        <div class="chips center-chips">${[`🔥 최고 ${g.bestCombo}연속`, ...stats].map(s => `<span class="chip">${s}</span>`).join('')}</div>
        <p class="gm-goal">${medalRow(medalCount(name, r.best))} ${goal}</p>
        ${seen.length ? `<h4 class="gm-seen-title">오늘 만난 단어 <small>눌러서 들어요</small></h4>
        <div class="gm-seen">${seen.map(w => `<button class="gm-word ${w.missed ? 'missed' : ''}" data-say="${esc(w.en)}"><span>${pic(w.emoji)}</span><b>${esc(w.en)}</b></button>`).join('')}</div>` : ''}
        <div class="row-center"><a class="btn btn-ghost" href="#/play">놀이터</a><button class="btn btn-primary" data-again>한 번 더</button></div></div>`;
      $$('[data-say]', area).forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
      $('[data-again]', area).onclick = () => Views.play(el, name, true);
      Speech.sfx.cheer(); if (medals || r.newBest) Lesson.confetti(); App.refreshHeader();
    },
  };
  $('.gm-hud .gm-hearts', area).hidden = !hearts;
  drawHearts();
  return kit;
}

// 단어를 겹치지 않게 차례로 꺼낸다 (다 쓰면 다시 섞는다)
const wordQueue = list => { let q = []; return () => { if (!q.length) q = shuffle(list); return q.pop(); }; };
const uniqueWords = (list, n) => shuffle(list).filter((w, k, a) => a.findIndex(x => x.en === w.en) === k).slice(0, n);
const lenClass = en => (en.length >= 8 ? 'xlong' : en.length >= 6 ? 'long' : '');

const PLAY_RUN = {
  // 🎈 풍선 팡팡: 위로 떠오르는 풍선 중에서 들은 단어를 터뜨린다. 단계가 오르면 풍선이 많고 빨라지고, 그림만·글자만 나온다
  async balloon(k, { pool, reach }) {
    const STAGES = [
      { n: 3, speed: 40, goal: 3, show: 'both', tip: '듣고 맞는 풍선을 콕!' },
      { n: 3, speed: 50, goal: 3, show: 'both', tip: '풍선이 빨라져요' },
      { n: 4, speed: 56, goal: 3, show: 'pic', tip: '이제 그림만 보여요' },
      { n: 4, speed: 62, goal: 3, show: reach > 2 ? 'word' : 'pic', tip: reach > 2 ? '이제 글자만 보여요' : '풍선이 더 빨라져요' },
      { n: 4, speed: 74, goal: 4, show: 'both', tip: '아주 빨라요!' },
    ];
    const COLORS = ['#ff7aa8', '#ffd23f', '#5cc8ff', '#7ed957', '#b388ff'];
    k.board.innerHTML = `<div class="gm-sky"><i class="gm-cloud a">☁️</i><i class="gm-cloud b">☁️</i><i class="gm-cloud c">☁️</i></div>`;
    const sky = $('.gm-sky', k.board), nextWord = wordQueue(pool), total = STAGES.reduce((n, s) => n + s.goal, 0);
    let items = [], target = null, st = 0, inStage = 0, cleared = 0, playing = false, saidAgain = false;
    const remove = it => { it.el.remove(); items = items.filter(x => x !== it); };
    const clearAll = () => { items.forEach(it => it.el.remove()); items = []; };
    // 풍선이 벽에 닿지 않게 칸 가운데를 고르게 나눈다 (3칸 17·50·83%, 4칸 13·38·62·87%)
    const laneX = (lane, lanes) => { const edge = lanes > 3 ? 13 : 17; return edge + ((100 - edge * 2) * lane) / Math.max(1, lanes - 1); };
    const spawn = (html, color, lane, lanes, y, data) => {
      const b = document.createElement('button');
      b.className = `gm-balloon n${lanes} ${data.kind || ''}`; b.style.left = `${laneX(lane, lanes)}%`; b.style.setProperty('--c', color);
      b.setAttribute('aria-label', data.aria); b.innerHTML = `<span class="b-face">${html}</span>`;
      sky.appendChild(b);
      const it = { el: b, y, phase: Math.random() * 6, v: STAGES[st].speed * (k.reduced ? 0.7 : 1) * (data.fast || 1), ...data };
      items.push(it); k.tap(b, () => onTap(it));
    };
    const nextRound = () => {
      if (!k.alive()) return;
      const s = STAGES[st]; clearAll();
      const ans = nextWord(), opts = shuffle([ans, ...pictureOthers(pool, s.n - 1, ans)]), h = sky.clientHeight;
      target = ans; saidAgain = false; k.meet(ans);
      // 아래쪽에서 계단처럼 떠오른다. 정답 풍선은 맨 위에서 시작하지 않게 해 누를 시간을 넉넉히 준다
      const starts = shuffle(opts.map((_, i) => i)), top = starts.indexOf(0), ansAt = opts.indexOf(ans);
      if (top === ansAt) [starts[top], starts[(top + 1) % starts.length]] = [starts[(top + 1) % starts.length], starts[top]];
      opts.forEach((o, i) => {
        const face = `${s.show !== 'word' ? `<span class="b-pic">${pic(o.emoji)}</span>` : ''}${s.show !== 'pic' ? `<small class="${lenClass(o.en)}">${esc(o.en)}</small>` : ''}`;
        spawn(face, COLORS[(i + st) % COLORS.length], i, opts.length, h * 0.5 + (starts[i] * h * 0.42) / Math.max(1, opts.length - 1), { en: o.en, aria: o.en });
      });
      if (k.g.hearts < k.g.maxHearts && Math.random() < 0.3) spawn('❤️', '#fff', Math.floor(Math.random() * opts.length), opts.length, h + 90, { kind: 'life', aria: '목숨 풍선', fast: 1.5 });
      else if (st > 0 && Math.random() < 0.35) spawn('⭐', '#ffd23f', Math.floor(Math.random() * opts.length), opts.length, h + 90, { kind: 'gold', aria: '보너스 풍선', fast: 1.7 });
      k.say(ans.en); playing = true;
    };
    const advance = () => {
      inStage++; cleared++; k.bar(cleared / total);
      if (inStage < STAGES[st].goal) return k.after(900, nextRound);
      k.after(800, async () => {
        clearAll(); k.add((st + 1) * 20);
        k.float(`단계 보너스 +${(st + 1) * 20}`, null, 'cheer');
        if (++st >= STAGES.length) return k.finish({ clear: true, stats: [`🎈 ${k.g.right}개 터뜨림`] });
        inStage = 0; await k.stageIntro(st, STAGES.length, STAGES[st].tip); nextRound();
      });
    };
    const gameOver = () => k.finish({ stats: [`🎈 ${k.g.right}개 터뜨림`, `${st + 1}단계까지`] });
    function onTap(it) {
      if (!playing || !items.includes(it)) return;
      if (it.kind === 'gold') { k.bonus(30, it.el); return remove(it); }
      if (it.kind === 'life') { k.burst(it.el, 8); k.gain(it.el); return remove(it); }
      if (it.en === target.en) {
        playing = false; k.hit(10, it.el); GameFx.pop(); remove(it);
        items.forEach(x => x.el.classList.add('gone')); Speech.speak(target.en);
        return advance();
      }
      k.meet(target, true); k.float('아니에요', it.el, 'oops');
      remove(it); GameFx.splash(); Speech.speak(target.en);
      if (!k.lose()) { playing = false; k.after(900, gameOver); }
    }
    k.loop((dt, now) => {
      if (!playing) return;
      const h = sky.clientHeight;
      for (const it of [...items]) {
        it.y -= it.v * dt;
        const sway = k.reduced ? 0 : Math.sin(now / 900 + it.phase) * 4;
        it.el.style.transform = `translate(calc(-50% + ${sway.toFixed(1)}px), ${it.y.toFixed(1)}px)`;
        if (!saidAgain && it.en === target.en && it.y < h * 0.3) { saidAgain = true; Speech.speak(target.en); }
        if (it.y > -it.el.offsetHeight - 34) continue;
        if (it.kind) remove(it);
        else if (it.en !== target.en) it.y = h + 30;
        else { // 정답 풍선을 놓쳤다
          playing = false; k.meet(target, true);
          k.float(`${target.en}!`, { x: sky.clientWidth / 2, y: 60 }, 'oops'); Speech.speak(target.en);
          k.after(1000, k.lose() ? nextRound : gameOver);
          break;
        }
      }
    });
    k.barEnd('🏆'); await k.stageIntro(0, STAGES.length, STAGES[0].tip); nextRound();
  },

  // 🃏 짝꿍 카드: 처음에 잠깐 본 카드를 기억해 시간 안에 짝을 찾는다. 단계마다 카드가 늘어난다
  async match(k, { pool }) {
    const STAGES = [{ pairs: 4, time: 50, peek: 2.4, tip: '카드를 잘 봐 두세요' }, { pairs: 6, time: 80, peek: 3.2, tip: '카드가 많아져요' }, { pairs: 8, time: 110, peek: 4, tip: '카드가 아주 많아요!' }];
    let st = 0, looks = 2, left = 0, T = 1, ticking = false, used = [], moves = 0, peeking = false;
    const pickPairs = n => {
      const rest = pool.filter(w => !used.includes(w.en)), first = rest[Math.floor(Math.random() * rest.length)] || pool[0];
      let picks = [first, ...pictureOthers(rest, n - 1, first)];
      if (picks.length < n) picks = [...picks, ...pictureOthers(pool.filter(w => !picks.some(x => x.en === w.en)), n - picks.length, first)];
      used.push(...picks.map(w => w.en)); return picks;
    };
    const play = async () => {
      const s = STAGES[st], picks = pickPairs(s.pairs);
      const cards = shuffle(picks.flatMap(w => [{ id: w.en, w, face: w.emoji, kind: 'pic' }, { id: w.en, w, face: w.en, kind: 'word' }]));
      let open = [], found = 0, resolve = null;
      k.board.innerHTML = `<div class="memory n${s.pairs}">${cards.map((c, i) => `<button class="mcard ${c.kind}" data-k="${i}" aria-label="카드 ${i + 1}"><span class="back">🌱</span><span class="front ${c.kind === 'word' ? lenClass(c.id) : ''}">${c.kind === 'pic' ? pic(esc(c.face)) : esc(c.face)}</span></button>`).join('')}</div>
        <div class="gm-tools"><button class="btn btn-ghost sm" data-look>🔎 잠깐 보기 ${looks}번</button></div>`;
      const cardEls = $$('.mcard', k.board), lookBtn = $('[data-look]', k.board);
      const flipAllUnmatched = on => cardEls.forEach(c => { if (!c.classList.contains('matched') && !open.includes(+c.dataset.k)) c.classList.toggle('flip', on); });
      const settle = () => { if (resolve) { clearTimeout(resolve.t); resolve.run(); } };
      const stageDone = () => {
        ticking = false; const bonus = Math.round(left) * 2; k.add(bonus);
        k.float(`남은 시간 +${bonus}`, null, 'cheer');
        k.after(1100, async () => {
          if (++st >= STAGES.length) {
            k.add(looks * 15);
            return k.finish({ clear: true, stats: [`🃏 ${moves}번 뒤집기`, ...(looks ? [`🔎 아껴서 +${looks * 15}`] : [])] });
          }
          await k.stageIntro(st, STAGES.length, STAGES[st].tip); play();
        });
      };
      cardEls.forEach(b => k.tap(b, () => {
        if (peeking || !ticking) return;
        settle();
        const i = +b.dataset.k;
        if (b.classList.contains('flip')) return;
        b.classList.add('flip'); open.push(i); Speech.sfx.tap();
        if (cards[i].kind === 'word') Speech.speak(cards[i].id);
        if (open.length < 2) return;
        moves++;
        const [a, c] = open, A = cardEls[a], C = cardEls[c];
        if (cards[a].id === cards[c].id) {
          open = []; found++; left = Math.min(T, left + 2);
          [A, C].forEach(x => x.classList.add('matched'));
          k.hit(20, C); k.meet(cards[a].w); Speech.speak(cards[a].id);
          if (found === s.pairs) stageDone();
        } else {
          k.miss(); GameFx.splash(); k.meet(cards[a].w, true); k.meet(cards[c].w, true);
          const run = () => { [A, C].forEach(x => { x.classList.remove('flip'); x.classList.add('nope'); setTimeout(() => x.classList.remove('nope'), 300); }); open = []; resolve = null; };
          resolve = { run, t: setTimeout(run, 850) };
        }
      }));
      k.tap(lookBtn, () => {
        if (!looks || peeking || !ticking) return;
        settle();
        looks--; peeking = true; lookBtn.textContent = `🔎 잠깐 보기 ${looks}번`; lookBtn.disabled = !looks; GameFx.coin();
        flipAllUnmatched(true);
        k.after(1100, () => { flipAllUnmatched(false); peeking = false; });
      });
      lookBtn.disabled = !looks;
      T = left = s.time; k.bar(1);
      // 처음에는 카드를 모두 보여 준다
      peeking = true; ticking = true; cardEls.forEach(c => c.classList.add('flip'));
      k.after(s.peek * 1000, () => { cardEls.forEach(c => c.classList.remove('flip')); peeking = false; });
    };
    k.loop(dt => {
      if (!ticking || peeking) return;
      const before = Math.ceil(left);
      left -= dt; k.bar(left / T, left < 10);
      if (left < 10 && Math.ceil(left) !== before) GameFx.tick();
      if (left <= 0) {
        ticking = false; GameFx.lose();
        k.banner('시간이 다 됐어요', '', 1100).then(() => k.finish({ stats: [`🃏 ${st + 1}단계까지`] }));
      }
    });
    await k.stageIntro(0, STAGES.length, STAGES[0].tip); play();
  },

  // 🐸 개구리 징검다리: 악어가 오기 전에 글자 연잎을 차례로 밟는다. 뒤로 갈수록 힌트가 사라지고 연잎이 움직인다
  async frog(k, { pool, spell }) {
    const STAGES = [
      { min: 3, max: 4, words: 3, decoy: 2, ghost: 'all', drift: 0, pace: 4.4, tip: '흐린 글자를 따라 밟아요' },
      { min: 3, max: 5, words: 3, decoy: 3, ghost: 'first', drift: 14, pace: 3.8, tip: '연잎이 움직여요' },
      { min: 4, max: 7, words: 3, decoy: 4, ghost: '', drift: 22, pace: 3.3, tip: '힌트 없이 해 봐요!' },
    ];
    const used = new Set();
    const plan = STAGES.map(s => {
      let list = uniqueWords(spell(s.min, s.max).filter(w => !used.has(w.en)), s.words);
      if (list.length < s.words) list = [...list, ...uniqueWords(spell(3, 8).filter(w => !used.has(w.en) && !list.includes(w)), s.words - list.length)];
      list.forEach(w => used.add(w.en)); return list;
    });
    const total = plan.flat().length, ABC = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let st = 0, idx = 0, done = 0, built = 0, cur = null, wrongs = 0;
    const render = () => {
      const s = STAGES[st], w = plan[st][idx], letters = w.en.split('');
      const pads = shuffle(letters.concat(pickOthers(ABC.filter(x => !letters.includes(x)), s.decoy)));
      const rows = [], perRow = pads.length > 8 ? 4 : 3;
      for (let i = 0; i < pads.length; i += perRow) rows.push(pads.slice(i, i + perRow));
      const ghost = i => (s.ghost === 'all' || (s.ghost === 'first' && i === 0) ? ` class="ghost">${letters[i]}` : '>_');
      k.board.innerHTML = `<div class="pond frog-pond"><div class="frog-target"><span class="ft-pic">${pic(w.emoji)}</span><b class="ft-word">${letters.map((_, i) => `<i${ghost(i)}</i>`).join('')}</b></div>
        <div class="pads">${rows.map((r, i) => `<div class="pad-row" data-i="${i}">${r.map((l, j) => `<button class="pad" data-l="${l}" style="--d:${((i * 3 + j) % 5) * 0.2}s">${l}</button>`).join('')}</div>`).join('')}</div>
        <div class="croc-lane" aria-hidden="true"><span class="croc">🐊</span><span class="croc-goal">🪷</span></div><span class="frog" aria-hidden="true">🐸</span></div>`;
      const pond = $('.frog-pond', k.board), frog = $('.frog', k.board);
      const start = { x: pond.clientWidth - 40, y: pond.clientHeight - 62 };
      cur = { w, letters, at: 0, miss: false, T: letters.length * s.pace + 3, t: 0, on: null, pond, frog: { el: frog, x: start.x, y: start.y, t: 1, from: start, to: start }, done: false, lady: null, ladyAt: 2 + Math.random() * 4 };
      wrongs = 0; k.meet(w); k.say(w.en);
      $$('.pad', k.board).forEach(b => k.tap(b, () => {
        if (!cur || cur.done || b.classList.contains('used')) return;
        if (b.dataset.l === cur.letters[cur.at]) {
          b.classList.add('used'); b.classList.remove('hint'); GameFx.pop();
          cur.on = b; cur.frog.t = 0; cur.frog.from = { x: cur.frog.x, y: cur.frog.y };
          const slot = $$('.ft-word i', k.board)[cur.at]; slot.textContent = cur.letters[cur.at]; slot.classList.remove('ghost'); slot.classList.add('on');
          cur.at++;
          if (cur.at === cur.letters.length) wordDone(b);
          else if (wrongs >= 2) showHint();
        } else {
          cur.miss = true; wrongs++; cur.t += cur.T * 0.1; k.miss(); k.meet(w, true);
          b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 400);
          k.float('풍덩!', b, 'oops'); GameFx.splash(); Speech.speak(w.en);
          if (wrongs >= 2) showHint();
        }
      }));
    };
    const showHint = () => { $$('.pad.hint', k.board).forEach(x => x.classList.remove('hint')); $$('.pad:not(.used)', k.board).find(x => x.dataset.l === cur.letters[cur.at])?.classList.add('hint'); };
    const nextWord = async () => {
      if (++idx < plan[st].length) return render();
      k.add((st + 1) * 20); k.float(`단계 보너스 +${(st + 1) * 20}`, null, 'cheer');
      if (++st >= STAGES.length) return k.finish({ clear: true, note: '🐸 개구리가 집에 왔어요! 🏠', stats: [`📝 단어 ${built}개 완성`] });
      idx = 0; cur = null; await k.stageIntro(st, STAGES.length, STAGES[st].tip); render();
    };
    function wordDone(b) {
      cur.done = true; done++; built++;
      const time = Math.round((1 - cur.t / cur.T) * 10);
      if (cur.miss) { k.miss(); k.bonus(10 + time, b); } else k.hit(20 + time, b);
      $('.ft-word', k.board).classList.add('done'); Speech.speak(cur.w.en);
      k.bar(done / total); k.after(1200, nextWord);
    }
    function caught() {
      cur.done = true; k.meet(cur.w, true);
      $('.croc', k.board).classList.add('bite'); k.float('악어다!', cur.pond.querySelector('.croc'), 'oops');
      $$('.ft-word i', k.board).forEach((x, i) => { x.textContent = cur.letters[i]; x.classList.remove('ghost'); });
      $('.ft-word', k.board).classList.add('missed'); Speech.speak(cur.w.en);
      if (k.lose()) { done++; k.bar(done / total); k.after(1500, nextWord); } else k.after(1500, () => k.finish({ stats: [`📝 단어 ${built}개 완성`, `${st + 1}단계까지`] }));
    }
    k.loop((dt, now) => {
      if (!cur) return;
      const s = STAGES[st];
      if (s.drift && !k.reduced) $$('.pad-row', k.board).forEach(r => { r.style.transform = `translateX(${(Math.sin(now / 1100 + +r.dataset.i * 2) * s.drift).toFixed(1)}px)`; });
      // 개구리: 연잎으로 포물선을 그리며 뛰고, 앉은 연잎을 따라 움직인다
      const f = cur.frog, box = cur.pond.getBoundingClientRect();
      let to = f.to;
      if (cur.on) { const r = cur.on.getBoundingClientRect(); to = { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 - 12 }; }
      f.t = Math.min(1, f.t + dt / 0.32);
      f.x = f.from.x + (to.x - f.from.x) * f.t; f.y = f.from.y + (to.y - f.from.y) * f.t;
      f.el.style.transform = `translate(calc(${f.x.toFixed(1)}px - 50%), calc(${(f.y - Math.sin(f.t * Math.PI) * 34).toFixed(1)}px - 50%)) scale(${(1 + Math.sin(f.t * Math.PI) * 0.2).toFixed(2)})`;
      if (cur.done) return;
      cur.t += dt;
      const frac = Math.min(1, cur.t / cur.T), lane = $('.croc-lane', k.board), croc = $('.croc', k.board);
      croc.style.left = `calc(${(frac * 100).toFixed(1)}% - ${(frac * 44).toFixed(1)}px)`;
      lane.classList.toggle('low', frac > 0.75);
      // 🐞 무당벌레: 잡으면 악어가 뒤로 물러난다
      if (!cur.lady && cur.t > cur.ladyAt && cur.ladyAt > 0) {
        cur.ladyAt = -1;
        const b = document.createElement('button'); b.className = 'lady'; b.textContent = '🐞'; b.setAttribute('aria-label', '무당벌레');
        cur.pond.appendChild(b);
        const ly = { el: b, x: -50, y: 130 + Math.random() * 70 };
        cur.lady = ly;
        k.tap(b, () => { if (cur.done) return; k.bonus(15, b); cur.t = Math.max(0, cur.t - cur.T * 0.25); b.remove(); ly.el = null; });
      }
      const ly = cur.lady;
      if (ly && ly.el) {
        ly.x += dt * 60;
        ly.el.style.transform = `translate(${ly.x.toFixed(1)}px, ${(ly.y + Math.sin(now / 240) * 12).toFixed(1)}px)`;
        if (ly.x > cur.pond.clientWidth + 50) { ly.el.remove(); ly.el = null; }
      }
      if (frac >= 1) caught();
    });
    k.barEnd('🏠'); await k.stageIntro(0, STAGES.length, STAGES[0].tip); render();
  },

  // 🐟 빈칸 낚시: 헤엄치는 물고기 중 빠진 글자를 낚는다. 뒤로 갈수록 빨라지고 상어가 나오고 빈칸이 두 개가 된다
  async fish(k, { pool, spell }) {
    const STAGES = [
      { q: 4, n: 3, speed: 34, shark: 0, two: false, tip: '빠진 글자를 찾아요' },
      { q: 4, n: 4, speed: 46, shark: 1, two: false, tip: '🦈 상어를 조심해요!' },
      { q: 4, n: 5, speed: 58, shark: 1, two: true, tip: '빈칸이 두 개예요!' },
    ];
    const VOWELS = 'aeiou', CONS = 'bcdfghjklmnprstvwyz';
    const words = uniqueWords(spell(3, 7), STAGES.reduce((n, s) => n + s.q, 0));
    const known = new Set(pool.map(w => w.en)), total = words.length;
    let st = 0, inStage = 0, idx = 0, cur = null, fishes = [], treasure = null, lock = true, caughtN = 0, reel = null;
    const clearFish = () => { fishes.forEach(f => f.el.remove()); fishes = []; };
    // 비슷한 종류의 글자로 헷갈리게 하되, 넣어도 다른 진짜 단어가 되는 글자는 뺀다
    const decoys = (ans, w, i, n) => shuffle((VOWELS.includes(ans) ? VOWELS : CONS).split('').filter(l => l !== ans && !known.has(w.slice(0, i) + l + w.slice(i + 1)))).slice(0, n);
    const spawnFish = () => {
      clearFish();
      const s = STAGES[st], pond = $('.pond', k.board), ans = cur.w.en[cur.blanks[cur.at]];
      const letters = shuffle([ans, ...decoys(ans, cur.w.en, cur.blanks[cur.at], s.n - 1)]);
      const swimmers = letters.map(l => ({ l })).concat(Array.from({ length: s.shark }, () => ({ shark: true })));
      const W = pond.clientWidth, top = $('.fish-q', k.board).offsetHeight + 34, gap = (pond.clientHeight - top - 60) / Math.max(1, swimmers.length - 1);
      shuffle(swimmers).forEach((sw, i) => {
        const b = document.createElement('button'), dir = Math.random() < 0.5 ? 1 : -1, gold = !sw.shark && Math.random() < 0.22;
        const body = sw.shark ? '🦈' : gold ? '🐠' : ['🐟', '🐠', '🐡'][i % 3];
        b.className = `fish ${sw.shark ? 'shark' : ''} ${gold ? 'gold' : ''}`; b.setAttribute('aria-label', sw.shark ? '상어' : `글자 ${sw.l}`);
        b.innerHTML = `<span class="fish-body">${body}</span>${sw.shark ? '' : `<span class="fish-tow"><i></i><b>${sw.l}</b></span>`}`;
        pond.appendChild(b);
        // 양쪽 가장자리에서 안쪽을 보고 시작해, 가운데쯤 모인 뒤부터 제멋대로 돌아선다
        const half = b.offsetWidth / 2, base = s.speed * (sw.shark ? 1.5 : gold ? 1.25 : 1) * (k.reduced ? 0.6 : 1), inset = half + Math.random() * W * 0.06, reach = W * (0.35 + Math.random() * 0.25);
        const f = { el: b, l: sw.l, shark: sw.shark, gold, dir, y: top + i * gap, x: dir > 0 ? inset : W - inset, goal: dir > 0 ? reach : W - reach, wait: null, half, swing: sw.shark ? 0 : half, base, v: base * (0.8 + Math.random() * 0.4) };
        fishes.push(f); k.tap(b, () => onFish(f));
      });
      lock = false;
    };
    // 몸통은 그 자리에 두고 돌아선다 (끌던 글자만 반대쪽 꼬리로 옮겨 간다)
    const turn = f => {
      f.x += f.dir * f.swing; f.dir *= -1;
      f.el.classList.remove('turned'); void f.el.offsetWidth; f.el.classList.add('turned');
    };
    const drawWord = () => {
      const w = cur.w.en, parts = w.split('').map((c, i) => {
        const b = cur.blanks.indexOf(i);
        if (b < 0) return c;
        return b < cur.at ? `<u class="got">${c}</u>` : `<u class="${b === cur.at ? 'on' : ''}">_</u>`;
      });
      $('.ft-word', k.board).innerHTML = parts.join('');
    };
    const nextQ = () => {
      const s = STAGES[st], w = words[idx];
      if (!w) return k.finish({ clear: true, stats: [`🐟 ${caughtN}마리 낚음`] });
      const count = s.two && w.en.length >= 4 ? 2 : 1;
      const blanks = shuffle(w.en.split('').map((_, i) => i)).slice(0, count).sort((a, b) => a - b);
      cur = { w, blanks, at: 0 };
      k.board.innerHTML = `<div class="pond fish-pond"><i class="gm-bubble a"></i><i class="gm-bubble b"></i><i class="gm-bubble c"></i><div class="fish-q"><span class="ft-pic">${pic(w.emoji)}</span><b class="ft-word ${lenClass(w.en)}"></b></div><div class="fish-line" hidden><i>🎣</i></div></div>`;
      treasure = null; drawWord(); k.meet(w); k.say(w.en); spawnFish();
      if (st > 0 && Math.random() < 0.3) {
        const pond = $('.pond', k.board), b = document.createElement('button');
        b.className = 'treasure'; b.textContent = '💎'; b.setAttribute('aria-label', '보석'); pond.appendChild(b);
        treasure = { el: b, x: -40, y: pond.clientHeight - 58 };
        k.tap(b, () => { if (!treasure || treasure.el !== b) return; k.bonus(25, b); b.remove(); treasure = null; });
      }
    };
    const nextAfter = () => {
      idx++; inStage++; k.bar(idx / total);
      if (inStage < STAGES[st].q) return k.after(650, nextQ);
      k.add((st + 1) * 20); k.float(`단계 보너스 +${(st + 1) * 20}`, null, 'cheer');
      k.after(850, async () => {
        clearFish(); if (++st >= STAGES.length) return k.finish({ clear: true, stats: [`🐟 ${caughtN}마리 낚음`] });
        inStage = 0; await k.stageIntro(st, STAGES.length, STAGES[st].tip); nextQ();
      });
    };
    function onFish(f) {
      if (lock || f.flee || !fishes.includes(f)) return;
      if (f.shark) { k.float('앗, 상어!', f.el, 'oops'); turn(f); return wrongFish(); }
      if (f.l === cur.w.en[cur.blanks[cur.at]]) {
        lock = true; caughtN++; cur.at++; drawWord();
        k.hit(15, f.el, f.gold ? 2 : 1); GameFx.pop();
        const line = $('.fish-line', k.board); line.hidden = false; line.style.left = `${f.x + f.el.offsetWidth * 0.25 * f.dir}px`; line.style.height = `${f.y + 20}px`;
        reel = { f, line };
        return;
      }
      k.float('그 글자가 아니에요', f.el, 'oops'); k.meet(cur.w, true);
      f.flee = true; turn(f); f.v = Math.max(f.v, 60) * 2.4; f.el.classList.add('nope');
      wrongFish();
    }
    function wrongFish() {
      GameFx.splash(); Speech.speak(cur.w.en);
      if (!k.lose()) { lock = true; k.after(900, () => k.finish({ stats: [`🐟 ${caughtN}마리 낚음`, `${st + 1}단계까지`] })); }
    }
    k.loop((dt, now) => {
      if (!cur) return;
      const pond = $('.pond', k.board); if (!pond) return;
      const W = pond.clientWidth;
      for (const f of [...fishes]) {
        if (reel && reel.f === f) continue;
        f.x += f.dir * f.v * dt;
        if (f.flee && (f.x > W + 66 || f.x < -66)) { f.el.remove(); fishes = fishes.filter(x => x !== f); continue; }
        if (!f.flee) {
          if (f.wait === null && (f.dir > 0 ? f.x >= f.goal : f.x <= f.goal)) f.wait = 1.5 + Math.random() * 2.5;
          if (f.wait !== null) f.wait -= dt;
          // 벽에 닿기 전에 돌아서서 글자가 늘 화면 안에 있게 한다
          const atWall = f.dir > 0 ? f.x >= W - f.half - f.swing : f.x <= f.half + f.swing;
          if (atWall || (f.wait !== null && f.wait <= 0)) { turn(f); f.wait = 1.5 + Math.random() * 2.5; f.v = f.base * (0.8 + Math.random() * 0.4); }
        }
        const wob = k.reduced ? 0 : Math.sin(now / 500 + f.y) * 5;
        f.el.style.transform = `translate(calc(${f.x.toFixed(1)}px - 50%), ${(f.y + wob).toFixed(1)}px)`;
        f.el.classList.toggle('swim-r', f.dir > 0); // 오른쪽으로 갈 때는 몸을 뒤집고 글자를 왼쪽에 끈다
      }
      if (treasure) {
        treasure.x += dt * 34;
        treasure.el.style.transform = `translate(${treasure.x.toFixed(1)}px, ${treasure.y}px)`;
        if (treasure.x > W + 40) { treasure.el.remove(); treasure = null; }
      }
      // 낚싯줄로 끌어올린다
      if (reel) {
        const r = reel; r.f.y -= dt * 620;
        r.f.el.style.transform = `translate(calc(${r.f.x.toFixed(1)}px - 50%), ${r.f.y.toFixed(1)}px) rotate(${r.f.dir > 0 ? -70 : 70}deg)`; // 입이 위로, 끌던 글자는 아래로
        r.line.style.height = `${Math.max(0, r.f.y + 20)}px`;
        if (r.f.y < -60) {
          reel = null; r.line.hidden = true; r.f.el.remove(); fishes = fishes.filter(x => x !== r.f);
          if (cur.at < cur.blanks.length) { spawnFish(); Speech.speak(cur.w.en); } else { clearFish(); $('.ft-word', k.board).classList.add('done'); Speech.speak(cur.w.en); nextAfter(); }
        }
      }
    });
    k.barEnd('🏆'); await k.stageIntro(0, STAGES.length, STAGES[0].tip); nextQ();
  },

  // ⏱️ OX 스피드: 맞히면 시간이 늘고 틀리면 준다. 5연속이면 불꽃 타임. 단계가 오르면 비슷한 단어와 소리 카드가 나온다
  async ox(k, { pool }) {
    const MAX_T = 40;
    let left = 30, played = 0, cur = null, answered = 0, lv = 1, fever = 0, lock = true, streakSame = 0, lastSame = null, running = false;
    const nextWord = wordQueue(pool);
    k.board.innerHTML = `<div class="ox-stage"><div class="gm-ox-card card" tabindex="-1"><span class="ox-lean o">O</span><span class="ox-lean x">X</span><span class="ft-pic"></span><b class="ox-word"></b><small class="ox-reveal"></small></div>
      <div class="ox-btns"><button class="ox-btn o" data-a="1" aria-label="맞아요">O</button><button class="ox-btn x" data-a="0" aria-label="아니에요">X</button></div></div>`;
    const card = $('.gm-ox-card', k.board), stageBox = $('.ox-stage', k.board);
    // 단계가 오를수록 글자가 비슷한 단어로 헷갈리게 한다
    const similar = w => {
      const near = shuffle(pool).find(x => x.en !== w.en && x.emoji !== w.emoji && (lookGroup(x.en) < 0 || lookGroup(x.en) !== lookGroup(w.en)) && (x.en[0] === w.en[0] || (x.en.length === w.en.length && x.en.slice(-2) === w.en.slice(-2))));
      return near || pictureOthers(pool, 1, w)[0] || w;
    };
    const deal = () => {
      if (!running) return;
      const w = nextWord();
      let same = Math.random() < 0.5;
      if (lastSame === same && streakSame >= 2) same = !same; // 같은 답이 세 번 넘게 이어지지 않게
      streakSame = lastSame === same ? streakSame + 1 : 1; lastSame = same;
      const shown = same ? w : lv >= 2 ? similar(w) : pictureOthers(pool, 1, w)[0] || w;
      const sound = lv >= 3 && Math.random() < 0.5;
      cur = { w, ok: shown.en === w.en, shown, at: performance.now() };
      $('.ft-pic', card).innerHTML = pic(w.emoji);
      const wordEl = $('.ox-word', card);
      wordEl.textContent = sound ? '🔊 잘 들어요' : shown.en; wordEl.classList.toggle('sound', sound);
      $('.ox-reveal', card).textContent = '';
      card.classList.remove('deal'); void card.offsetWidth; card.classList.add('deal');
      k.say(shown.en); lock = false;
    };
    const answer = yes => {
      if (lock || !cur || left <= 0) return;
      answered++; lock = true;
      k.meet(cur.w, yes !== cur.ok);
      if (yes === cur.ok) {
        const quick = performance.now() - cur.at < 1500;
        k.hit(10 + (quick ? 5 : 0), card, fever > 0 ? 2 : 1);
        if (quick) k.float('⚡ 번개!', { x: 60, y: 30 }, 'pts gold');
        left = Math.min(MAX_T, left + (played > 75 ? 0 : lv === 1 ? 1 : lv === 2 ? 0.7 : 0.4)); // 끝없이 이어지지 않게 갈수록 조금만 늘어난다
        const nl = Math.min(3, 1 + Math.floor(k.g.right / 6));
        if (nl > lv) { lv = nl; k.stage(`${lv}단계`); GameFx.stage(); k.float(lv === 2 ? '비슷한 단어가 나와요!' : '소리도 잘 들어요!', null, 'cheer'); }
        if (k.g.combo % 10 === 5) { fever = 6; stageBox.classList.add('fever'); GameFx.fever(); k.float('🔥 불꽃 타임!', null, 'cheer'); }
        return deal();
      }
      k.miss(); GameFx.splash(); left = Math.max(0.2, left - 2);
      card.classList.remove('nope'); void card.offsetWidth; card.classList.add('nope');
      $('.ox-reveal', card).textContent = cur.ok ? `맞아요! ${cur.w.en}` : `이 그림은 ${cur.w.en}`;
      Speech.speak(cur.w.en);
      k.after(850, deal);
    };
    k.tap($('.ox-btn.o', k.board), () => answer(true));
    k.tap($('.ox-btn.x', k.board), () => answer(false));
    // 카드를 O쪽(왼쪽)이나 X쪽(오른쪽)으로 밀어도 된다
    let sx = null;
    card.addEventListener('pointerdown', e => { if (lock) return; sx = e.clientX; try { card.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } });
    card.addEventListener('pointermove', e => {
      if (sx === null) return;
      const dx = e.clientX - sx; card.style.transform = `translateX(${dx}px) rotate(${dx / 16}deg)`;
      card.dataset.lean = dx < -30 ? 'o' : dx > 30 ? 'x' : '';
    });
    const release = e => {
      if (sx === null) return;
      const dx = e.clientX - sx; sx = null; card.style.transform = ''; card.dataset.lean = '';
      if (dx <= -70) answer(true); else if (dx >= 70) answer(false);
    };
    card.addEventListener('pointerup', release); card.addEventListener('pointercancel', () => { sx = null; card.style.transform = ''; card.dataset.lean = ''; });
    const keys = e => {
      if (!k.alive()) return window.removeEventListener('keydown', keys);
      if (e.key === 'ArrowLeft' || e.key === 'o' || e.key === 'O') answer(true);
      if (e.key === 'ArrowRight' || e.key === 'x' || e.key === 'X') answer(false);
    };
    window.addEventListener('keydown', keys);
    k.stage('1단계'); k.barEnd('⏱️'); k.bar(left / MAX_T);
    k.loop(dt => {
      if (!running) return;
      if (fever > 0) { fever -= dt; if (fever <= 0) stageBox.classList.remove('fever'); }
      const before = Math.ceil(left); left -= dt * (1 + played * 0.012); played += dt; // 갈수록 시간이 빨리 줄어든다
      if (left < 6 && Math.ceil(left) !== before) GameFx.tick();
      k.bar(left / MAX_T, left < 6);
      if (left <= 0) { running = false; lock = true; k.banner('시간 끝!', '', 900).then(() => k.finish({ stats: [`✅ ${answered}문제 중 ${k.g.right}개`, `${lv}단계까지`] })); }
    });
    for (const n of ['3', '2', '1']) { GameFx.count(); await k.banner(n, n === '3' ? '준비하세요!' : '', 650); }
    GameFx.go(); running = true; deal();
  },

  // 🧺 첫소리 바구니: 떨어지는 그림이 땅에 닿기 전에 첫소리 바구니를 누른다. 바구니가 늘고 빨라진다
  async basket(k, { pool }) {
    // 첫 글자와 첫소리가 다른 단어는 뺀다 (ship, phone 등). 모음은 소리가 여러 가지라 뺀다
    const good = pool.filter(w => /^[a-z]/.test(w.en) && !'aeiou'.includes(w.en[0]) && !/^(sh|ch|th|ph|kn|wr|ce|ci)/.test(w.en));
    const byFirst = {}; good.forEach(w => (byFirst[w.en[0]] = byFirst[w.en[0]] || []).push(w));
    const STAGES = [{ n: 2, items: 5, fall: 10, tip: '첫소리 바구니를 콕!' }, { n: 3, items: 6, fall: 8.5, tip: '바구니가 세 개예요' }, { n: 4, items: 7, fall: 7, tip: '빨리 떨어져요!' }];
    const CK = l => (l === 'c' ? 'k' : l === 'k' ? 'c' : ''); // c와 k는 첫소리가 같아 같이 내지 않는다
    const lettersUsed = new Set();
    const letterSet = (n, must) => {
      const out = must ? [must] : [];
      for (const l of [...shuffle(Object.keys(byFirst).filter(x => !lettersUsed.has(x))), ...shuffle(Object.keys(byFirst))]) {
        if (out.length >= n) break;
        if (!out.includes(l) && !out.includes(CK(l))) out.push(l);
      }
      return out;
    };
    // 글자마다 단어가 넉넉하면 단계 내내 같은 바구니, 아니면 그림마다 바구니를 바꾼다
    const planStage = s => {
      const ls = shuffle(Object.keys(byFirst).filter(l => byFirst[l].length >= Math.ceil(s.items / s.n))).filter((l, i, a) => !a.slice(0, i).includes(CK(l))).slice(0, s.n);
      if (ls.length === s.n) {
        const lists = ls.map(l => shuffle(byFirst[l])), items = [];
        for (let i = 0; items.length < s.items; i++) { const w = lists[i % s.n].pop(); if (w) items.push(w); }
        ls.forEach(l => lettersUsed.add(l));
        return { fixed: shuffle(ls), items: shuffle(items) };
      }
      return { fixed: null, items: uniqueWords(good, s.items) };
    };
    const total = STAGES.reduce((n, s) => n + s.items, 0);
    let st = 0, plan = null, idx = 0, cur = null, done = 0;
    const renderStage = () => {
      const s = STAGES[st]; plan = planStage(s); idx = 0;
      k.board.innerHTML = `<div class="orchard"><i class="gm-cloud a">☁️</i><i class="gm-cloud b">☁️</i><div class="bk-drop"><span class="ft-pic"></span></div><p class="bk-word" aria-live="polite"></p>
        <div class="baskets n${s.n}">${Array.from({ length: s.n }, () => `<button class="basket"><b></b><span class="bk-pile"></span><span class="bk-ico">🧺</span></button>`).join('')}</div></div>`;
      $$('.basket', k.board).forEach(b => k.tap(b, () => onBasket(b)));
      if (plan.fixed) $$('.basket', k.board).forEach((b, i) => { b.dataset.l = plan.fixed[i]; $('b', b).textContent = plan.fixed[i]; });
      nextItem();
    };
    const nextItem = () => {
      const s = STAGES[st], w = plan.items[idx];
      const baskets = $$('.basket', k.board), drop = $('.bk-drop', k.board);
      if (!plan.fixed) {
        const ls = shuffle(letterSet(s.n, w.en[0]));
        baskets.forEach((b, i) => { b.dataset.l = ls[i]; $('b', b).textContent = ls[i]; b.classList.remove('swap'); void b.offsetWidth; b.classList.add('swap'); });
      }
      baskets.forEach(b => b.classList.remove('hint', 'got'));
      const gold = Math.random() < 0.2;
      drop.className = `bk-drop ${gold ? 'gold' : ''}`; drop.style.transition = ''; drop.style.opacity = '';
      $('.ft-pic', drop).innerHTML = pic(w.emoji);
      $('.bk-word', k.board).innerHTML = '';
      const H = $('.orchard', k.board).clientHeight - $('.baskets', k.board).offsetHeight - drop.offsetHeight - 10;
      cur = { w, gold, y: -drop.offsetHeight, H, v: (H + drop.offsetHeight) / (s.fall * (k.reduced ? 1.3 : 1)), tried: false, again: false, phase: Math.random() * 6, done: false, drop };
      k.meet(w); k.say(w.en);
    };
    const showWord = w => { $('.bk-word', k.board).innerHTML = `<u>${esc(w.en[0])}</u>${esc(w.en.slice(1))}`; };
    const advance = () => {
      idx++; done++; k.bar(done / total);
      if (idx < plan.items.length) return k.after(1000, nextItem);
      k.add((st + 1) * 20); k.float(`단계 보너스 +${(st + 1) * 20}`, null, 'cheer');
      k.after(1100, async () => {
        if (++st >= STAGES.length) return k.finish({ clear: true, stats: [`🧺 ${k.g.right}개 담음`] });
        cur = null; await k.stageIntro(st, STAGES.length, STAGES[st].tip); renderStage();
      });
    };
    function onBasket(b) {
      if (!cur || cur.done) return;
      const w = cur.w;
      if (b.dataset.l === w.en[0]) {
        cur.done = true;
        if (cur.tried) { k.bonus(5, b); } else k.hit(10, b, cur.gold ? 2 : 1);
        GameFx.pop(); showWord(w); Speech.speak(w.en);
        b.classList.add('got');
        // 그림이 바구니로 날아간다
        const d = cur.drop, dr = d.getBoundingClientRect(), br = b.getBoundingClientRect();
        d.style.transition = 'transform .32s ease-in, opacity .32s ease-in';
        d.style.transform = `translate(calc(-50% + ${(br.left + br.width / 2 - dr.left - dr.width / 2).toFixed(1)}px), ${(cur.y + br.top - dr.top).toFixed(1)}px) scale(.3)`; d.style.opacity = '.2';
        const pile = $('.bk-pile', b);
        setTimeout(() => { if (plan.fixed && pile.isConnected) { pile.insertAdjacentHTML('beforeend', `<i>${pic(w.emoji)}</i>`); while (pile.children.length > 3) pile.firstElementChild.remove(); } }, 320);
        return advance();
      }
      if (cur.tried) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); return; } // 한 그림에서 목숨은 한 번만 줄어든다
      cur.tried = true; k.meet(w, true);
      b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
      k.float('다시 들어 봐요', b, 'oops'); GameFx.splash(); Speech.speak(w.en);
      $$('.basket', k.board).find(x => x.dataset.l === w.en[0])?.classList.add('hint');
      if (!k.lose()) { cur.done = true; showWord(w); k.after(1100, () => k.finish({ stats: [`🧺 ${k.g.right}개 담음`, `${st + 1}단계까지`] })); }
    }
    k.loop((dt, now) => {
      if (!cur || cur.done) return;
      cur.y += cur.v * dt;
      const sway = k.reduced ? 0 : Math.sin(now / 700 + cur.phase) * 16;
      cur.drop.style.transform = `translate(calc(-50% + ${sway.toFixed(1)}px), ${cur.y.toFixed(1)}px)`;
      if (!cur.again && cur.y > cur.H * 0.45) { cur.again = true; Speech.speak(cur.w.en); }
      if (cur.y >= cur.H) {
        cur.done = true; k.meet(cur.w, true);
        const w = cur.w; showWord(w); Speech.speak(w.en); cur.drop.classList.add('splat');
        $$('.basket', k.board).find(x => x.dataset.l === w.en[0])?.classList.add('hint');
        if (k.lose()) advance(); else k.after(1100, () => k.finish({ stats: [`🧺 ${k.g.right}개 담음`, `${st + 1}단계까지`] }));
      }
    });
    k.barEnd('🏆'); await k.stageIntro(0, STAGES.length, STAGES[0].tip); renderStage();
  },
};

/* ---------- 놀이터 (미니게임) ---------- */
Views.play = (el, game, quick) => {
  const p = Store.profile(), best = name => (p.games || {})[name] || 0;
  // 아이가 이미 배운 범위의 그림 단어만 쓴다 (관리자는 전체)
  const reach = Store.isAdmin() ? 99 : ALL_LEVELS.indexOf(Store.currentLevel()) + 1;
  const pool = reach <= 2 ? PICTURE_WORDS.filter(w => LETTERS.some(l => l.word === w.en)) : PICTURE_WORDS;
  if (!game) {
    const got = Object.keys(PLAY_GAMES).reduce((n, g) => n + medalCount(g, best(g)), 0), all = Object.keys(PLAY_GAMES).length * 3;
    el.innerHTML = `<div class="wrap sec">
      <h1 class="page-title">🎈 놀이터</h1>
      ${UI.mascot(`레슨이 지루할 땐 게임으로 단어를 익혀요! 메달을 따면 별을 줄게 (하루 6개까지)`)}
      <p class="gm-shelf">🏅 내 메달 <b>${got}</b> / ${all}개</p>
      <div class="game-grid">
        ${Object.entries(PLAY_GAMES).map(([g, d]) => `<a class="game-card" href="#/play/${g}" style="--c:${d.c}"><span>${ico(d.icon)}</span><b>${d.title}</b><small>${d.hub}</small><em>최고 ${best(g)}점 ${medalRow(medalCount(g, best(g)))}</em></a>`).join('')}
      </div></div>`;
    return;
  }
  const def = PLAY_GAMES[game];
  el.innerHTML = `<div class="wrap sec narrow"><a class="link-btn" href="#/play">← 놀이터</a><div class="game-area"></div></div>`;
  const area = $('.game-area', el);
  // 철자 게임용: 짧고 글자만 있는 단어
  const spell = (min, max) => pool.filter(w => new RegExp(`^[a-z]{${min},${max}}$`).test(w.en));
  const lives = { balloon: { hearts: 3 }, frog: { hearts: 3 }, fish: { hearts: 5, heartIcon: '🪱' }, basket: { hearts: 4 } }[game];
  const begin = () => {
    const kit = playKit(el, area, game, lives);
    // 게임판이 한 화면에 들어오게 (위에 붙어 있는 머리글 아래로)
    window.scrollTo({ top: area.getBoundingClientRect().top + scrollY - ($('.site-header')?.offsetHeight || 0) - 4, behavior: 'instant' });
    PLAY_RUN[game](kit, { pool, reach, spell });
  };
  if (quick) return begin();
  const n = medalCount(game, best(game));
  area.innerHTML = `<div class="card gm-start anim-in"><div class="gm-start-ico" style="--c:${def.c}">${ico(def.icon)}</div><h1>${def.title}</h1>
    <ul class="gm-how">${def.how.map(t => `<li>${t}</li>`).join('')}</ul>
    <p class="gm-goal">최고 <b>${best(game)}점</b> ${medalRow(n)}</p>
    <p class="fine">${MEDAL_ICONS.map((m, k) => `${m} ${def.medals[k]}점`).join(' · ')}</p>
    <button class="btn btn-primary lg" data-start>시작!</button></div>`;
  $('[data-start]', area).onclick = begin;
};
