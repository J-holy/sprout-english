/* 새싹영어 — 문항 생성기 + 레슨 진행 엔진 */
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickOthers = (pool, n, not) => shuffle([...new Set(pool)].filter(x => x !== not)).slice(0, n);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const words = s => s.replace(/[.?!,]/g, '').split(/\s+/);

const Gen = (() => {
  // 스테이지 은행을 레벨 수만큼 나눠 각 레벨 몫을 돌려줌
  function levelItems(level) {
    const st = stageOf(level), k = st.levels.indexOf(level), n = st.levels.length;
    let bank;
    if (st.id === 1) bank = LETTERS;
    else if (st.id === 2) return PHONICS[level].map(([en, emoji, ko]) => ({ en, emoji, ko }));
    else if (QA[st.id]) bank = QA[st.id].map(([q, a, ko]) => ({ q, a, ko }));
    else bank = SENTENCES[st.id].map(([en, ko, emoji]) => ({ en, ko, emoji }));
    const size = Math.ceil(bank.length / n);
    return bank.slice(k * size, k * size + size);
  }
  // 레벨마다 1~9일째: 새 항목 + 앞에서 배운 항목 복습, 10일째: 레벨 전체 복습
  const isReviewDay = idx => idx >= LESSONS_PER_LEVEL - 1;
  function lessonItems(level, idx) {
    const items = levelItems(level), newDays = LESSONS_PER_LEVEL - 1;
    if (isReviewDay(idx)) return shuffle(items).slice(0, 6);
    const per = Math.ceil(items.length / newDays);
    const fresh = items.slice(idx * per, idx * per + per);
    const review = shuffle(items.slice(0, idx * per)).slice(0, Math.max(2, 5 - fresh.length));
    let chunk = fresh.concat(review);
    if (chunk.length < 4) chunk = chunk.concat(shuffle(items.filter(x => !chunk.includes(x))).slice(0, 4 - chunk.length));
    return chunk;
  }

  const choice = (key, title, answer, others, extra = {}) => ({ type: 'choice', key, title, answer, options: shuffle([answer, ...others]), ...extra });

  const B = {
    1: (L, t) => {
      const pool = LETTERS.map(x => x.letter);
      const [word, emoji] = L.words[t % L.words.length]; // 날마다 다른 그림 단어
      // X는 x로 시작하는 쉬운 단어가 없어서 끝소리로 배운다 (box, fox, six)
      const sound = L.ending ? `${word} ends with ${L.letter}` : `${L.letter} is for ${word}`;
      return [
        () => choice(`ltr-listen-${L.letter}`, '소리를 듣고 알파벳을 골라요', L.letter, pickOthers(pool, 2, L.letter), { say: L.letter, big: '🔊' }),
        () => choice(`ltr-case-${L.letter}`, '대문자와 짝인 소문자를 골라요', L.letter.toLowerCase(), pickOthers(pool, 2, L.letter).map(x => x.toLowerCase()), { show: L.letter, say: L.letter }),
        () => choice(`ltr-start-${L.letter}-${word}`, L.ending ? '어떤 글자로 끝날까요?' : '어떤 글자로 시작할까요?', L.letter, pickOthers(pool, 2, L.letter), { show: emoji, sub: word, say: word }),
        () => ({ type: 'trace', key: `ltr-trace-${L.letter}-${t % 2}`, title: '글자를 따라 써요', letter: t % 2 ? L.letter.toLowerCase() : L.letter, say: L.letter }),
        () => ({ type: 'speak', key: `ltr-speak-${L.letter}-${word}`, title: '따라 말해요', target: sound, show: emoji }),
      ];
    },
    2: (W, level) => {
      const all = Object.values(PHONICS).flat();
      const pool = all.map(([en, e]) => `${e} ${en}`);
      return [
        () => choice(`ph-listen-${W.en}`, '소리를 듣고 단어를 골라요', `${W.emoji} ${W.en}`, pickOthers(pool, 2, `${W.emoji} ${W.en}`), { say: W.en, big: '🔊' }),
        () => ({ type: 'tiles', key: `ph-spell-${W.en}`, title: '글자를 순서대로 눌러 단어를 만들어요', show: W.emoji, say: W.en, answer: W.en.split(''), tiles: shuffle(W.en.split('').concat(pickOthers('abcdefghijklmnopqrstuvwxyz'.split(''), 2, W.en[0]))), joiner: '' }),
        () => choice(`ph-first-${W.en}`, '첫소리는 무엇일까요?', W.en[0], pickOthers('bcdfghjklmnprstvwz'.split(''), 2, W.en[0]), { show: W.emoji, say: W.en }),
        () => choice(`ph-mean-${W.en}`, '뜻을 골라요', W.ko, pickOthers(all.map(x => x[2]), 2, W.ko), { show: W.en, say: W.en }),
        () => ({ type: 'speak', key: `ph-speak-${W.en}`, title: '따라 말해요', target: W.en, show: W.emoji }),
        // Level E부터 듣고 철자를 직접 쳐 보는 타자 연습
        ...(level === 'E' ? [() => ({ type: 'type', key: `ph-type-${W.en}`, title: '듣고 단어를 써 봐요 ⌨️', show: W.emoji, say: W.en, answer: W.en })] : []),
      ];
    },
    sentence: (S, t, st) => {
      const bank = SENTENCES[st].map(x => x[0]);
      const ws = words(S.en), blankable = ws.map((w, i) => [w, i]).filter(([w]) => w.length > 2);
      const [bw, bi] = blankable[t % blankable.length] || [ws[0], 0];
      const distract = pickOthers(bank.flatMap(words).filter(w => w.length > 2 && w.toLowerCase() !== bw.toLowerCase()), 2);
      const list = [
        () => ({ type: 'tiles', key: `s-order-${S.en}`, title: '단어를 순서대로 놓아 문장을 만들어요', sub: S.ko, say: S.en, show: S.emoji, answer: ws, tiles: shuffle(ws), joiner: ' ' }),
        () => choice(`s-fill-${S.en}-${bi}`, '빈칸에 알맞은 단어를 골라요', bw, distract, { show: ws.map((w, i) => i === bi ? '____' : w).join(' '), sub: S.ko, sayAfter: S.en }),
        () => choice(`s-mean-${S.en}`, '문장의 뜻을 골라요', S.ko, pickOthers(SENTENCES[st].map(x => x[1]), 2, S.ko), { show: S.en, say: S.en }),
        () => choice(`s-listen-${S.en}`, '듣고 알맞은 문장을 골라요', S.en, pickOthers(bank, 2, S.en), { say: S.en, big: '🔊' }),
        () => ({ type: 'speak', key: `s-speak-${S.en}`, title: '문장을 따라 말해요', target: S.en, show: S.emoji, sub: S.ko }),
      ];
      // 5단계부터는 빈칸 단어를 직접 쳐서 쓰기
      if (st >= 5) list.push(() => ({ type: 'type', key: `s-type-${S.en}-${bi}`, title: '빈칸에 들어갈 단어를 써 봐요 ⌨️', answer: bw, show: ws.map((w, i) => i === bi ? '____' : w).join(' '), sub: S.ko, sayAfter: S.en }));
      if (st === 7) {
        const v = VERBS.find(([b, p]) => ws.includes(p)) || VERBS[t % VERBS.length];
        const wrong = WRONG_PAST[v[0]] || v[0] + 'ed';
        list.push(() => choice(`past-${v[0]}`, `"${v[0]}"의 과거형을 골라요`, v[1], [...new Set([v[0], wrong])].filter(x => x !== v[1]).slice(0, 2), { show: `${v[0]} → ?`, sayAfter: `${v[0]}, ${v[1]}` }));
      }
      return list;
    },
    qa: (Q, t, st) => {
      const answers = QA[st].map(x => x[1]);
      const ws = words(Q.a);
      return [
        () => choice(`qa-pick-${Q.q}`, '질문에 알맞은 대답을 골라요', Q.a, pickOthers(answers, 2, Q.a), { show: Q.q, say: Q.q, sayAfter: Q.a }),
        () => ({ type: 'tiles', key: `qa-order-${Q.q}`, title: '대답을 순서대로 만들어요', show: Q.q, say: Q.q, answer: ws, tiles: shuffle(ws), joiner: ' ' }),
        () => choice(`qa-mean-${Q.q}`, '대화의 뜻을 골라요', Q.ko, pickOthers(QA[st].map(x => x[2]), 2, Q.ko), { show: `${Q.q}\n${Q.a}`, say: `${Q.q} ${Q.a}` }),
        () => ({ type: 'speak', key: `qa-speak-${Q.q}`, title: '질문을 듣고 대답해요', target: Q.a, prompt: Q.q, sub: Q.ko.split(' — ')[1] }),
      ];
    },
  };

  function lesson(level, idx, n = 8) {
    const st = stageOf(level).id;
    const items = lessonItems(level, idx);
    const builders = items.map((it, t) => st === 1 ? B[1](it, t + idx) : st === 2 ? B[2](it, level) : QA[st] ? B.qa(it, t, st) : B.sentence(it, t, st));
    const qs = []; let r = idx;
    for (let i = 0; qs.length < n; i++) {
      const bs = builders[i % builders.length];
      qs.push(bs[(r + Math.floor(i / builders.length) + i) % bs.length]());
      r++;
    }
    // 같은 문항 중복 제거 후 부족하면 보충
    const seen = new Set(); const out = [];
    for (const q of qs) if (!seen.has(q.key)) { seen.add(q.key); out.push(q); }
    for (const bs of builders) for (const b of bs) { if (out.length >= n) break; const q = b(); if (!seen.has(q.key)) { seen.add(q.key); out.push(q); } }
    return out.slice(0, n);
  }
  // 레슨 중간 ⚡챌린지: 1단계 알파벳 풍선, 2단계 단어 두더지, 3단계부터 문장 O/X
  function challenge(level) {
    const st = stageOf(level).id, upto = ALL_LEVELS.slice(0, ALL_LEVELS.indexOf(level) + 1);
    const same = upto.filter(lv => stageOf(lv).id === st);
    const pool = same.flatMap(levelItems);
    if (st === 1) return { kind: 'balloon', title: '알파벳 풍선 팡팡', how: '소리를 듣고 맞는 글자 풍선을 터뜨려요!', pool: pool.map(L => L.letter) };
    if (st === 2) return { kind: 'mole', title: '단어 두더지 잡기', how: '소리를 듣고 맞는 그림 두더지를 잡아요!', pool };
    if (QA[st]) return { kind: 'ox', title: '대답 O/X 스피드', how: '질문을 듣고, 알맞은 대답이면 ⭕ 아니면 ❌!', pool: pool.map(x => ({ say: x.q, show: x.a, others: pool.map(y => y.a) })) };
    return { kind: 'ox', title: '그림 문장 O/X 스피드', how: '문장을 듣고 그림과 맞으면 ⭕ 아니면 ❌!', pool: pool.map(x => ({ say: x.en, text: x.en, show: x.emoji, others: pool.map(y => y.emoji) })) };
  }
  return { lesson, levelItems, isReviewDay, challenge };
})();

/* ---------------- ⚡ 미니 챌린지 (20초 게임) ---------------- */
const Challenge = (() => {
  const SECONDS = 20;
  // spec: Gen.challenge() 결과. onEnd(score)
  function run(el, spec, onEnd) {
    el.className = 'lesson-body anim-in';
    el.innerHTML = `<div class="ch-intro"><div class="ch-badge">⚡ 챌린지!</div><h2>${esc(spec.title)}</h2><p>${esc(spec.how)}</p>
      <p class="fine">${SECONDS}초 동안 몇 개나 맞힐 수 있을까요? 연속으로 맞히면 🔥콤보!</p>
      <button class="btn btn-primary lg" data-go>▶ 시작!</button></div>`;
    el.querySelector('[data-go]').onclick = () => play(el, spec, onEnd);
  }
  function play(el, spec, onEnd) {
    let score = 0, combo = 0, best = 0, over = false, round = null;
    const end = Date.now() + SECONDS * 1000;
    el.innerHTML = `<div class="ch-head"><span>⚡ ${esc(spec.title)}</span><span class="ch-score">⭐ 0</span><span class="ch-combo"></span></div>
      <div class="ch-time"><i></i></div><div class="ch-stage"></div>`;
    const stage = el.querySelector('.ch-stage'), bar = el.querySelector('.ch-time i');
    const tick = setInterval(() => {
      if (!document.body.contains(el)) return clearInterval(tick);
      const left = Math.max(0, end - Date.now()); bar.style.width = left / (SECONDS * 10) + '%';
      if (!left) finish();
    }, 100);
    const finish = () => {
      if (over) return; over = true; clearInterval(tick); Speech.stop();
      onEnd({ score, best });
    };
    const hit = ok => {
      if (over) return;
      if (ok) { score++; combo++; best = Math.max(best, combo); Speech.sfx.correct(); } else { combo = 0; Speech.sfx.wrong(); }
      el.querySelector('.ch-score').textContent = `⭐ ${score}`;
      el.querySelector('.ch-combo').textContent = combo >= 2 ? `🔥 ${combo}콤보` : '';
      setTimeout(() => { if (!over && document.body.contains(el)) next(); }, ok ? 350 : 700);
    };
    const pickOne = a => a[Math.floor(Math.random() * a.length)];
    const next = () => {
      if (spec.kind === 'balloon') {
        const ans = pickOne(spec.pool);
        const opts = shuffle([ans, ...pickOthers(LETTERS.map(l => l.letter), 3, ans)]);
        const colors = ['#ff7aa8', '#ffd23f', '#5cc8ff', '#7ed957'];
        stage.innerHTML = `<div class="sky ch-sky">${opts.map((o, k) => `<button class="balloon" style="--c:${colors[k]};--d:${k * 0.2}s;--x:${k * 25 + 2}%" data-v="${o}"><span class="ch-letter">${k % 2 ? o.toLowerCase() : o}</span></button>`).join('')}</div>`;
        Speech.speak(ans);
        stage.querySelectorAll('.balloon').forEach(b => b.onclick = () => {
          const ok = b.dataset.v === ans; b.classList.add(ok ? 'pop' : 'nope');
          stage.querySelectorAll('.balloon').forEach(x => x.disabled = true); hit(ok);
        });
      } else if (spec.kind === 'mole') {
        const ans = pickOne(spec.pool);
        const opts = shuffle([ans, ...pickOthers(spec.pool, 3, ans)]);
        stage.innerHTML = `<div class="moles">${opts.map((o, k) => `<button class="mole" style="--d:${k * 0.08}s" data-v="${esc(o.en)}"><span class="mole-pic">${o.emoji}</span><small>${esc(o.en)}</small></button>`).join('')}</div>
          <button class="btn btn-ghost sm ch-again" data-again>🔊 다시</button>`;
        Speech.speak(ans.en);
        stage.querySelector('[data-again]').onclick = () => Speech.speak(ans.en);
        stage.querySelectorAll('.mole').forEach(b => b.onclick = () => {
          const ok = b.dataset.v === ans.en; b.classList.add(ok ? 'whack' : 'nope');
          stage.querySelectorAll('.mole').forEach(x => x.disabled = true); hit(ok);
        });
      } else {
        const item = pickOne(spec.pool), truth = Math.random() < 0.5;
        const shown = truth ? item.show : pickOne(item.others.filter(o => o !== item.show)) || item.show;
        const isTrue = shown === item.show;
        stage.innerHTML = `<div class="ox-card">${item.text ? `<p class="ox-text">${esc(item.text)}</p>` : `<p class="ox-q">🔊 ${esc(item.say)}</p>`}
          <div class="ox-show ${item.text ? 'pic' : ''}">${esc(shown)}</div></div>
          <div class="ox-btns"><button class="ox o" data-v="1" aria-label="맞아요">⭕</button><button class="ox x" data-v="0" aria-label="아니에요">❌</button></div>`;
        Speech.speak(item.say);
        stage.querySelectorAll('.ox').forEach(b => b.onclick = () => {
          const ok = (b.dataset.v === '1') === isTrue; b.classList.add(ok ? 'right' : 'wrong');
          stage.querySelectorAll('.ox').forEach(x => x.disabled = true); hit(ok);
        });
      }
    };
    next();
  }
  return { run, SECONDS };
})();

/* ---------------- 레슨 진행 엔진 ---------------- */
const Lesson = (() => {
  // 난이도: 쉬움=보기 2개+힌트, 어려움=보기 4개
  function adjust(questions, diff) {
    if (diff === 'normal') return questions;
    return questions.map(q => {
      if (q.type !== 'choice') return { ...q, hint: diff === 'easy' };
      if (diff === 'easy') return { ...q, options: shuffle([q.answer, q.options.find(o => o !== q.answer)]) };
      const kind = q.key.split('-').slice(0, 2).join('-');
      const pool = questions.filter(x => x.type === 'choice' && x.key.startsWith(kind)).flatMap(x => x.options).filter(o => !q.options.includes(o));
      return pool.length ? { ...q, options: shuffle([...q.options, pool[0]]) } : q;
    });
  }
  function volumeButton() {
    const v = Speech.volume;
    return `<div class="vol-wrap"><button class="icon-btn" data-vol aria-label="소리 크기">🔊</button>
      <div class="vol-pop" hidden><label>🗣️ 목소리<input type="range" min="0" max="1" step="0.1" value="${v.voice}" data-k="voice"></label>
      <label>🎵 효과음<input type="range" min="0" max="1" step="0.1" value="${v.sfx}" data-k="sfx"></label></div></div>`;
  }
  function wireVolume(root) {
    const btn = root.querySelector('[data-vol]'), pop = root.querySelector('.vol-pop');
    btn.onclick = () => { pop.hidden = !pop.hidden; };
    pop.querySelectorAll('input').forEach(r => r.oninput = () => { Speech.setVolume(r.dataset.k, +r.value); if (r.dataset.k === 'sfx') Speech.sfx.tap(); });
    pop.querySelector('[data-k=voice]').onchange = () => Speech.speak('Hello!');
  }

  function run(root, questions, { title = '레슨', onDone, onExit, recordSpeech = true, difficulty = 'normal', challenge = null } = {}) {
    questions = adjust(questions, difficulty);
    let i = 0, correct = 0, answeredAt = -1, combo = 0, comboStar = false, played = false, bonus = 0; const wrong = []; const t0 = Date.now();
    const challengeAt = Math.min(3, questions.length - 2); // 4번째 문제 다음에 ⚡챌린지
    const diffLabel = { easy: '🐣 쉬움', normal: '🐥 보통', hard: '🦅 도전' }[difficulty];
    root.innerHTML = `
      <div class="lesson">
        <div class="lesson-top">
          <button class="icon-btn" data-exit aria-label="그만하기">✕</button>
          <div class="lesson-progress"><div class="bar"></div></div>
          <span class="lesson-count"></span>
          ${volumeButton()}
        </div>
        <div class="lesson-title">${esc(title)} · <span class="diff">${diffLabel}</span></div>
        <div class="lesson-body"></div>
        <div class="lesson-feedback" hidden></div>
      </div>`;
    const body = root.querySelector('.lesson-body'), fb = root.querySelector('.lesson-feedback');
    wireVolume(root);
    root.querySelector('[data-exit]').onclick = () => { Speech.stop(); if (confirm('레슨을 그만할까요? 진행 내용은 저장되지 않아요.')) onExit && onExit(); };

    function show() {
      const q = questions[i];
      root.querySelector('.bar').style.width = `${i / questions.length * 100}%`;
      root.querySelector('.lesson-count').textContent = `${i + 1} / ${questions.length}`;
      fb.hidden = true; fb.className = 'lesson-feedback';
      body.innerHTML = ''; body.className = 'lesson-body anim-in';
      (R[q.type] || R.choice)(body, q, answer);
    }
    function answer(ok, q, detail = '') {
      if (answeredAt === i) return; // 한 문제는 한 번만 채점한다
      answeredAt = i;
      if (ok) { correct++; combo++; Speech.sfx.correct(); } else {
        combo = 0;
        Speech.sfx.wrong();
        if (q.type !== 'trace' && q.type !== 'speak') wrong.push({ key: q.key, q });
      }
      if (q.sayAfter) Speech.speakLater(q.sayAfter, 350);
      const correctText = q.type === 'tiles' ? q.answer.join(q.joiner) : q.answer;
      // 🔥 콤보: 3연속부터 표시, 5연속이면 보너스 별 (레슨마다 한 번, 하루 3개까지)
      let comboHtml = combo >= 3 ? `<span class="combo-pill">🔥 ${combo}연속!</span>` : '';
      if (combo === 5 && !comboStar && recordSpeech && Store.profile()) { comboStar = true; if (Store.addStars(1, 'combo', 3)) comboHtml += ' <span class="combo-pill star">⭐ 콤보 보너스!</span>'; }
      fb.innerHTML = `
        <div class="fb-msg">${comboHtml}${ok ? pick(['참 잘했어요! 🎉', '정답이에요! ⭐', '멋져요! 👏', '최고예요! 🌟']) : '아쉬워요! 다시 확인해봐요 💪'}
          ${!ok && correctText ? `<div class="fb-answer">정답: <b>${esc(correctText)}</b></div>` : ''}${detail}</div>
        <button class="btn btn-primary" data-next>${i + 1 < questions.length ? '계속하기' : '결과 보기'}</button>`;
      fb.className = 'lesson-feedback ' + (ok ? 'ok' : 'bad'); fb.hidden = false;
      const next = fb.querySelector('[data-next]'); next.focus();
      next.onclick = () => {
        Speech.stop();
        if (challenge && !played && i === challengeAt) { played = true; return playChallenge(); }
        i++; i < questions.length ? show() : finish();
      };
    }
    function playChallenge() {
      fb.hidden = true;
      root.querySelector('.lesson-count').textContent = '⚡';
      Challenge.run(body, challenge, ({ score, best }) => {
        const got = recordSpeech && Store.profile() ? Store.challengeResult(score) : 0;
        bonus += score;
        body.innerHTML = `<div class="ch-result anim-in"><div class="ch-badge">⚡ 챌린지 끝!</div><div class="ch-big">⭐ ${score}</div>
          <p>${score >= 8 ? '대단해요! 챔피언이에요 🏆' : score >= 4 ? '잘했어요! 👏' : '좋아요, 다음엔 더 많이! 💪'}${best >= 3 ? ` · 최고 🔥${best}콤보` : ''}${got ? ` · 별 ${got}개 획득!` : ''}</p>
          <button class="btn btn-primary lg" data-cont>레슨 계속하기 ▶</button></div>`;
        Speech.sfx.cheer(); if (score >= 6) confetti();
        body.querySelector('[data-cont]').onclick = () => { i++; show(); };
      });
    }
    function finish() {
      root.querySelector('.bar').style.width = '100%';
      onDone && onDone({ correct, total: questions.length, wrong, seconds: (Date.now() - t0) / 1000, bonus });
    }
    R.recordSpeech = recordSpeech;
    show();
  }
  const pick = a => a[Math.floor(Math.random() * a.length)];

  function head(q) {
    return `<div class="q-title">${esc(q.title || '')}</div>
      ${q.prompt ? `<div class="q-prompt"><button class="sound-btn" data-say="${esc(q.prompt)}">🔊</button> ${esc(q.prompt)}</div>` : ''}
      ${q.big ? `<button class="q-big sound-btn" data-say="${esc(q.say)}" aria-label="다시 듣기">${q.big}</button>` : ''}
      ${q.show ? `<div class="q-show ${q.show.length <= 3 ? 'huge' : ''}">${esc(q.show).replace(/\n/g, '<br>')}${q.say && !q.big ? ` <button class="sound-btn small" data-say="${esc(q.say)}" aria-label="듣기">🔊</button>` : ''}</div>` : ''}
      ${q.sub ? `<div class="q-sub">${esc(q.sub)}</div>` : ''}`;
  }
  function wireSay(el, q) {
    el.querySelectorAll('[data-say]').forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
    if (q.say) Speech.speakLater(q.say, 250);
  }

  const R = {
    choice(el, q, done) {
      el.innerHTML = head(q) + `<div class="options ${q.options.some(o => o.length > 18) ? 'stack' : ''}">${q.options.map(o => `<button class="option" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
      wireSay(el, q);
      el.querySelectorAll('.option').forEach(b => b.onclick = () => {
        const ok = b.dataset.v === q.answer;
        el.querySelectorAll('.option').forEach(x => { x.disabled = true; if (x.dataset.v === q.answer) x.classList.add('right'); });
        if (!ok) b.classList.add('wrong');
        done(ok, q);
      });
    },
    type(el, q, done) {
      el.innerHTML = head(q) + `<div class="type-slots" aria-hidden="true">${[...q.answer].map(c => `<i class="${c === ' ' ? 'sp' : ''}"></i>`).join('')}</div>
        <form class="type-form" autocomplete="off"><input class="type-input" name="t" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="${q.answer.length + 4}" aria-label="정답을 써요">
        <button class="btn btn-primary">확인</button></form>
        ${q.hint ? '<button class="link-btn" data-hint>💡 첫 글자 보기</button>' : ''}`;
      wireSay(el, q);
      const f = el.querySelector('form'), input = f.t, slots = [...el.querySelectorAll('.type-slots i')];
      const fill = () => slots.forEach((s, k) => { s.textContent = input.value[k] || ''; s.classList.toggle('on', !!input.value[k]); });
      input.oninput = fill; setTimeout(() => input.focus(), 50);
      const hint = el.querySelector('[data-hint]');
      if (hint) hint.onclick = () => { input.value = q.answer[0]; fill(); input.focus(); hint.remove(); };
      f.onsubmit = e => {
        e.preventDefault(); if (!input.value.trim()) return input.focus();
        const ok = input.value.trim().toLowerCase() === q.answer.toLowerCase();
        input.disabled = true; el.querySelectorAll('button').forEach(b => b.disabled = true);
        el.querySelector('.type-slots').classList.add(ok ? 'right' : 'wrong');
        if (ok) Speech.speak(q.answer);
        done(ok, q);
      };
    },
    tiles(el, q, done) {
      const placed = [];
      el.innerHTML = head(q) + `<div class="tile-line" aria-label="만든 답"></div><div class="tile-bank"></div>
        <div class="row-center"><button class="btn btn-ghost" data-reset>처음부터</button>${q.hint ? '<button class="btn btn-ghost" data-hint>💡 힌트</button>' : ''}<button class="btn btn-primary" data-check disabled>확인</button></div>`;
      wireSay(el, q);
      const hint = el.querySelector('[data-hint]');
      if (hint) hint.onclick = () => {
        // 다음에 올 카드를 대신 놓아준다
        const want = q.answer[placed.length]; if (want === undefined) return;
        const k = q.tiles.findIndex((t, j) => t === want && !placed.includes(j));
        if (k >= 0 && placed.every((t, j) => q.tiles[t] === q.answer[j])) { placed.push(k); draw(); }
        else { placed.length = 0; draw(); }
      };
      const line = el.querySelector('.tile-line'), bank = el.querySelector('.tile-bank'), check = el.querySelector('[data-check]');
      const draw = () => {
        line.innerHTML = placed.map((t, k) => `<button class="tile placed" data-k="${k}">${esc(q.tiles[t])}</button>`).join('') || '<span class="tile-hint">아래 카드를 눌러요</span>';
        bank.innerHTML = q.tiles.map((t, k) => `<button class="tile" data-k="${k}" ${placed.includes(k) ? 'disabled' : ''}>${esc(t)}</button>`).join('');
        bank.querySelectorAll('.tile').forEach(b => b.onclick = () => { Speech.sfx.tap(); placed.push(+b.dataset.k); draw(); });
        line.querySelectorAll('.tile').forEach(b => b.onclick = () => { placed.splice(placed.indexOf(+b.dataset.k), 1); draw(); });
        check.disabled = placed.length !== q.answer.length;
      };
      el.querySelector('[data-reset]').onclick = () => { placed.length = 0; draw(); };
      check.onclick = () => {
        const got = placed.map(k => q.tiles[k]);
        const ok = got.join('|').toLowerCase() === q.answer.join('|').toLowerCase();
        el.querySelectorAll('button').forEach(b => b.disabled = true);
        line.classList.add(ok ? 'right' : 'wrong');
        if (ok) Speech.speak(q.answer.join(' '));
        done(ok, q);
      };
      draw();
    },
    trace(el, q, done) {
      el.innerHTML = head({ ...q, show: '' }) + `<div class="trace-wrap"><canvas class="trace" width="320" height="320" aria-label="${esc(q.letter)} 따라 쓰기"></canvas></div>
        <div class="row-center"><button class="btn btn-ghost" data-say="${esc(q.say)}">🔊 듣기</button><button class="btn btn-ghost" data-clear>지우기</button><button class="btn btn-primary" data-check disabled>다 썼어요</button></div>`;
      wireSay(el, q);
      const cv = el.querySelector('canvas'), c = cv.getContext('2d');
      const font = `bold 250px "Baloo 2", "Arial Rounded MT Bold", Arial, sans-serif`;
      const guide = () => {
        c.clearRect(0, 0, 320, 320);
        c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--trace-guide') || '#ddd';
        c.fillText(q.letter, 160, 175);
        c.setLineDash([6, 8]); c.strokeStyle = '#bbb'; c.lineWidth = 2; c.strokeText(q.letter, 160, 175); c.setLineDash([]);
      };
      // 글자 모양 마스크 (채점용)
      const mask = document.createElement('canvas'); mask.width = mask.height = 320;
      const mc = mask.getContext('2d'); mc.font = font; mc.textAlign = 'center'; mc.textBaseline = 'middle'; mc.fillText(q.letter, 160, 175);
      const ink = document.createElement('canvas'); ink.width = ink.height = 320; const ic = ink.getContext('2d');
      guide();
      let drawing = false, last = null, length = 0;
      const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 320 / r.width, (e.clientY - r.top) * 320 / r.height]; };
      const stroke = (ctx2, a, b, color, w) => { ctx2.strokeStyle = color; ctx2.lineWidth = w; ctx2.lineCap = 'round'; ctx2.beginPath(); ctx2.moveTo(...a); ctx2.lineTo(...b); ctx2.stroke(); };
      cv.onpointerdown = e => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); };
      cv.onpointermove = e => {
        if (!drawing) return; const p = pos(e);
        stroke(c, last, p, '#ff7043', 16); stroke(ic, last, p, '#000', 16);
        length += Math.hypot(p[0] - last[0], p[1] - last[1]); last = p;
        el.querySelector('[data-check]').disabled = length < 120;
      };
      cv.onpointerup = cv.onpointercancel = () => { drawing = false; };
      el.querySelector('[data-clear]').onclick = () => { ic.clearRect(0, 0, 320, 320); length = 0; guide(); el.querySelector('[data-check]').disabled = true; };
      el.querySelector('[data-check]').onclick = () => {
        const m = mc.getImageData(0, 0, 320, 320).data, d = ic.getImageData(0, 0, 320, 320).data;
        let maskN = 0, cover = 0, inkN = 0, onMask = 0;
        for (let k = 3; k < m.length; k += 16) {
          const inM = m[k] > 0, inD = d[k] > 0;
          if (inM) { maskN++; if (inD) cover++; }
          if (inD) { inkN++; if (inM) onMask++; }
        }
        const coverage = cover / Math.max(maskN, 1), precision = onMask / Math.max(inkN, 1);
        const ok = coverage > 0.35 && precision > 0.45;
        el.querySelectorAll('button').forEach(b => b.disabled = true);
        done(ok, q, `<div class="fb-answer">글자 덮은 정도 ${Math.round(coverage * 100)}% · 선 안쪽 정확도 ${Math.round(precision * 100)}%</div>`);
      };
    },
    speak(el, q, done) {
      let tries = 0;
      el.innerHTML = head({ ...q, say: null, sub: null }) + `
        <div class="speak-target">${words(q.target).map(w => `<span>${esc(w)}</span>`).join(' ')}</div>
        ${q.sub ? `<div class="q-sub">${esc(q.sub)}</div>` : ''}
        <div class="speak-result" aria-live="polite"></div>
        <div class="row-center">
          <button class="btn btn-ghost" data-listen>🔊 원어민 듣기</button>
          <button class="btn btn-ghost" data-slow>🐢 천천히</button>
          ${Speech.canListen ? '<button class="btn btn-primary mic" data-mic>🎤 말하기</button>' : '<button class="btn btn-primary" data-self>따라 말했어요</button>'}
        </div>
        ${Speech.canListen ? '<button class="link-btn" data-skip>지금은 말하기 어려워요 (건너뛰기)</button>' : '<p class="hint">이 브라우저는 음성 인식을 지원하지 않아 "듣고 따라 말하기"로 진행해요. Chrome/Edge에서는 AI 발음 코칭을 쓸 수 있어요.</p>'}`;
      el.querySelectorAll('[data-say]').forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
      const res = el.querySelector('.speak-result');
      el.querySelector('[data-listen]').onclick = () => Speech.speak(q.target);
      el.querySelector('[data-slow]').onclick = () => Speech.speak(q.target, { slow: true });
      Speech.speakLater(q.prompt ? q.prompt : q.target, 250);
      const self = el.querySelector('[data-self]');
      if (self) self.onclick = () => { el.querySelectorAll('button').forEach(b => b.disabled = true); done(true, q); };
      const skip = el.querySelector('[data-skip]');
      if (skip) skip.onclick = () => { el.querySelectorAll('button').forEach(b => b.disabled = true); done(false, q); };
      const mic = el.querySelector('[data-mic]');
      if (mic) mic.onclick = async () => {
        mic.disabled = true; mic.classList.add('rec'); mic.textContent = '🎙️ 듣고 있어요…';
        try {
          const alts = await Speech.listen();
          const r = Speech.score(q.target, alts); tries++;
          const pass = passMark();
          if (R.recordSpeech && Store.profile()) Store.recordSpeaking(q.target, r.score);
          const spans = el.querySelectorAll('.speak-target span');
          r.words.forEach((w, k) => { if (spans[k]) spans[k].className = w.ok === 1 ? 'ok' : w.ok ? 'mid' : 'no'; });
          res.innerHTML = `<div class="score-pill ${r.score >= 80 ? 'good' : r.score >= 60 ? 'mid' : 'low'}">${r.score}점</div><div class="heard">들은 말: "${esc(r.heard)}"</div>`;
          if (r.score >= pass || tries >= 3) {
            el.querySelectorAll('button').forEach(b => b.disabled = true);
            mic.classList.remove('rec'); mic.textContent = '✅ 완료';
            return done(r.score >= pass, q, `<div class="fb-answer">${coach(r)}</div>`); // 채점이 끝나면 마이크를 다시 켜지 않는다
          } else {
            res.innerHTML += `<div class="hint">${coach(r)} (${3 - tries}번 더 해볼 수 있어요)</div>`;
          }
        } catch (e) {
          res.innerHTML = `<div class="hint">${e.message === 'not-allowed' ? '마이크 권한을 허용해 주세요.' : '소리를 듣지 못했어요. 마이크 가까이에서 또박또박 말해볼까요?'}</div>`;
        }
        mic.disabled = false; mic.classList.remove('rec'); mic.textContent = '🎤 다시 말하기';
      };
    },
  };
  // "아이 목소리 너그럽게" 설정이면 통과 점수를 낮춘다
  const passMark = () => { const u = Store.user(); return u && u.settings.gentle === false ? 60 : 45; };
  function coach(r) {
    const miss = r.words.filter(w => w.ok < 1).map(w => w.w);
    if (!miss.length) return '완벽한 발음이에요! 원어민 같아요 🌟';
    return `<b>${miss.slice(0, 3).map(esc).join(', ')}</b> 발음을 한 번 더 들어보고 연습해봐요.`;
  }

  function confetti() {
    const box = document.createElement('div'); box.className = 'confetti';
    const colors = ['#ff7043', '#ffca28', '#66bb6a', '#42a5f5', '#ab47bc', '#ec407a'];
    for (let k = 0; k < 70; k++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%'; s.style.background = colors[k % colors.length];
      s.style.animationDelay = Math.random() * 0.6 + 's'; s.style.animationDuration = 1.8 + Math.random() * 1.4 + 's';
      s.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(s);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 3600);
  }
  return { run, confetti, renderers: R, passMark };
})();
