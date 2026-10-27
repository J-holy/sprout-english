/* 새싹영어 — 화면(View) 렌더러 */
const won = n => n.toLocaleString('ko-KR') + '원';
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const fmtDate = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const fmtDay = t => new Date(t).toLocaleDateString('ko-KR');
// 알파벳 따라 말하기 문장 (X는 끝소리)
const letterLine = (it, w = it.word) => it.ending ? `${w} ends with ${it.letter}` : `${it.letter} is for ${w}`;
// 설정의 목소리 목록: 자동 / AI 음성 / 이 기기 목소리(자연스러운 순)
const voiceOptions = () => [
  `<option value="">자동 (가장 자연스러운 목소리)</option>`,
  Speech.neuralAvailable ? `<option value="neural">🌟 AI 자연 음성</option>` : '',
  ...Speech.voices().slice(0, 20).map(v => `<option value="${esc(v.uri)}">${v.natural ? '★ ' : ''}${esc(v.name)} (${esc(v.lang)})</option>`),
].join('');
const dayLabel = d => `Day ${d + 1}${Gen.isReviewDay(d) ? ' · 복습' : ''}`;
const scoreClass = s => s >= 80 ? 'good' : s >= 60 ? 'mid' : 'low';
const avatarHtml = (p, cls = '') => `<span class="avatar ${cls}">${p.avatar}${Store.accEmoji(p) ? `<i class="acc">${Store.accEmoji(p)}</i>` : ''}</span>`;
// 놀이터·카드에 쓸 그림 단어 (알파벳 단어 + 파닉스 단어)
const PICTURE_WORDS = [...LETTERS.flatMap(l => l.words.map(([en, emoji]) => ({ en, emoji }))), ...Object.values(PHONICS).flat().map(([en, emoji]) => ({ en, emoji }))]
  .filter((w, i, a) => a.findIndex(x => x.en === w.en) === i);

const Views = {};

/* ---------- 공용 컴포넌트 ---------- */
const UI = {
  mascot(text, mood = '🌱') { return `<div class="mascot-say"><span class="mascot-face" aria-hidden="true">${mood}</span><p class="bubble-say">${text}</p></div>`; },
  stageCarousel(id = 'carousel') {
    return `<div class="carousel" id="${id}" tabindex="0" aria-roledescription="carousel">
      <button class="car-nav prev" aria-label="이전 단계">‹</button>
      <div class="car-stage"></div>
      <button class="car-nav next" aria-label="다음 단계">›</button>
      <div class="car-dots">${STAGES.map((s, i) => `<button aria-label="STAGE ${s.id}" data-i="${i}"></button>`).join('')}</div>
    </div>`;
  },
  wireCarousel(root, { auto = true } = {}) {
    let i = 0, timer;
    const stage = $('.car-stage', root);
    const sample = s => Gen.levelItems(s.levels[0]).slice(0, 3).map(it => {
      const en = it.letter ? `${it.letter} ${it.word}` : it.en || it.q;
      return `<button class="sample-chip" data-say="${esc(it.letter ? letterLine(it) : en)}">${it.emoji || '💬'} ${esc(en)} 🔊</button>`;
    }).join('');
    const draw = () => {
      const s = STAGES[i];
      stage.style.setProperty('--c', s.color);
      stage.innerHTML = `<div class="anim-in">
        <div class="island" aria-hidden="true">${['🏝️', '🌋', '🏔️', '🏕️', '🌳', '🏰', '🛸', '🚀'][i]}</div>
        <em class="stage-tag">STAGE ${s.id} · ${s.title}섬</em>
        <div class="level-row">${s.levels.map(l => `<span class="level-box">${l}</span>`).join('')}</div>
        <p class="stage-desc">${s.desc}</p>
        <p class="fine">레벨 ${s.levels.length}개 · ${s.levels.length * LESSONS_PER_LEVEL}일 (하루 1레슨이면 ${durationText(studyWeeks(s.levels.length * LESSONS_PER_LEVEL))})</p>
        <div class="chips center-chips">${s.skills.map(k => `<span class="chip">${k}</span>`).join('')}</div>
        <div class="stage-sample">${sample(s)}</div></div>`;
      $$('.car-dots button', root).forEach((b, k) => b.classList.toggle('on', k === i));
      $$('[data-say]', stage).forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
    };
    const go = k => { i = (k + STAGES.length) % STAGES.length; draw(); restart(); };
    const restart = () => { clearInterval(timer); if (auto) timer = setInterval(() => { if (!document.body.contains(root)) return clearInterval(timer); i = (i + 1) % STAGES.length; draw(); }, 6000); };
    $('.prev', root).onclick = () => go(i - 1);
    $('.next', root).onclick = () => go(i + 1);
    $$('.car-dots button', root).forEach(b => b.onclick = () => go(+b.dataset.i));
    root.onkeydown = e => { if (e.key === 'ArrowLeft') go(i - 1); if (e.key === 'ArrowRight') go(i + 1); };
    root.onmouseenter = () => clearInterval(timer); root.onmouseleave = restart;
    draw(); restart();
  },
  plans() {
    return `<div class="plans">
      <div class="seg" role="tablist"><button class="on" data-kids="one" role="tab">👧 한 자녀</button><button data-kids="two" role="tab">👧👦 두 자녀</button></div>
      <div class="plan-cards"></div>
      <p class="fine center">모든 상품 자동갱신은 부모페이지에서 언제든 해지할 수 있어요 · 데모라 실제 결제는 일어나지 않아요.</p>
    </div>`;
  },
  wirePlans(root) {
    let kids = 'one';
    const loggedIn = !!Store.user();
    const draw = () => {
      const P = PLANS[kids];
      $('.plan-cards', root).innerHTML = [1, 6, 12].map(months => {
        const monthly = planMonthly(kids, months);
        const q = loggedIn ? Store.quote(kids, months) : { rate: P.coupon[months], monthly: Math.min(monthly, Math.round(P.list * (1 - P.coupon[months]))) };
        q.total = q.monthly * months;
        const disc = Math.round((1 - monthly / P.list) * 100);
        return `<div class="plan-card ${months === 12 ? 'best' : ''}">
          ${months === 12 ? '<span class="ribbon">가장 저렴해요</span>' : ''}
          <h4>${months}개월</h4>
          <p class="plan-fit">${{ 1: '먼저 한 달 해보기', 6: `하루 2레슨이면 전체 과정 완주 (${durationText(studyWeeks(TOTAL_LESSONS, 2))})`, 12: `하루 1레슨으로 전체 과정 완주 (${durationText(studyWeeks(TOTAL_LESSONS))})` }[months]}</p>
          <dl><dt>정가</dt><dd class="strike">월 ${won(P.list)}</dd>
          <dt>멤버십가</dt><dd><b>월 ${won(monthly)}</b> <small>${disc}%↓</small></dd>
          ${q.rate ? `<dt>쿠폰 적용</dt><dd class="hot"><span class="pct">${Math.round(q.rate * 100)}%</span>월 ${won(q.monthly)}</dd>` : ''}</dl>
          <div class="plan-total">총 <b>${won(q.total)}</b> ${months === 1 ? '/ 매월' : ''}</div>
          <button class="btn btn-primary full" data-buy="${months}">선택하기</button></div>`;
      }).join('');
      $$('[data-buy]', root).forEach(b => b.onclick = () => App.buy(kids, +b.dataset.buy));
    };
    $$('.seg button', root).forEach(b => b.onclick = () => { kids = b.dataset.kids; $$('.seg button', root).forEach(x => x.classList.toggle('on', x === b)); draw(); });
    draw();
  },
  faq(list) {
    return `<div class="faq">${list.map(f => `<details class="faq-item"><summary><span class="q">Q</span>${esc(f.q)}</summary><div class="faq-a">${esc(f.a)}</div></details>`).join('')}</div>`;
  },
  ratingBars(reviews) {
    const n = reviews.length || 1;
    return `<div class="rating-bars"><div class="rb-total">후기 ${reviews.length}개</div>${[4, 3, 2, 1].map(r => {
      const c = reviews.filter(x => x.rating === r).length; const pct = Math.round(c / n * 100);
      return `<div class="rb-row"><span class="rb-label">${['', '😢', '😐', '🙂', '😍'][r]} ${RATING_LABELS[r]}</span><div class="rb-bar"><i style="width:${pct}%"></i></div><span class="rb-pct">${pct}%</span><span class="rb-cnt">${c}명</span></div>`;
    }).join('')}</div>`;
  },
  reviewCard(r, admin = false) {
    return `<article class="review-card"><div class="rv-top"><span class="rv-rate r${r.rating}">${['', '😢', '😐', '🙂', '😍'][r.rating]} ${RATING_LABELS[r.rating]}</span>${r.sample ? '<span class="tag">예시</span>' : ''}
      ${admin ? `<button class="link-btn danger" data-delrev="${r.id}">삭제</button>` : ''}</div>
      <p>${esc(r.text)}</p><footer>${esc(r.name)} · ${esc(r.date)}</footer></article>`;
  },
  empty(icon, text, action = '') { return `<div class="empty"><div class="empty-ico">${icon}</div><p>${text}</p>${action}</div>`; },
  starsInfo() {
    return `<ul class="earn"><li>📚 레슨 마치기 <b>⭐1~3</b></li><li>📖 새 스토리 완독 <b>⭐2</b></li><li>🎤 말하기 80점 이상 <b>⭐1</b> <small>(하루 5개)</small></li><li>🎈 놀이터 게임 <b>⭐1~3</b> <small>(하루 6개)</small></li></ul>`;
  },
};

/* ---------- 홈 ---------- */
Views.home = el => {
  const u = Store.user();
  // 예시 후기는 빼고, 실제 회원이 남긴 후기 중 '매우 좋아요'(4점)만 최신순으로 보여준다
  const realReviews = Store.reviews().filter(r => !r.sample);
  const bestReviews = realReviews.filter(r => r.rating === 4).slice(0, 3);
  const cta = u ? '#/study' : '#/signup';
  el.innerHTML = `
  <section class="hero">
    <div class="clouds" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="wrap hero-inner">
      <div class="hero-text">
        <span class="eyebrow">5~10세 · 하루 15분</span>
        <h1>“엄마, 영어 <span class="wiggle">더</span> 할래!”<br>아이가 <mark>먼저</mark> 찾는 영어</h1>
        <p>놀이처럼 듣고, 말하고, 읽는 동안 알파벳부터 문장 말하기까지 자연스럽게 익혀요. 부모님은 매일 리포트로 확인만 하세요.</p>
        <div class="row">
          <a class="btn btn-primary lg" href="#/sample/A">▶ 가입 없이 3분 체험</a>
          <a class="btn btn-ghost lg" href="#/leveltest">🧪 무료 레벨 진단</a>
        </div>
        <ul class="trust"><li>✅ 7일 무료</li><li>✅ 카드 등록 없음</li><li>✅ 자동결제 없음</li><li>✅ 광고 없음</li></ul>
      </div>
      <div class="card mini-quiz tilt" id="miniQuiz" aria-label="지금 바로 풀어보는 문제"></div>
    </div>
  </section>

  <section class="wrap sec">
    <h2 class="sec-title">이런 고민, 있으셨죠?</h2>
    <div class="worry-grid">
      ${[['😩', '영어만 하자고 하면 도망가요', '🎈', '게임·스티커·별 모으기로 아이가 먼저 하자고 해요'],
         ['🤷', '집에서 뭘 어떻게 가르쳐야 할지 모르겠어요', '🗺️', '레벨 진단 후 매일 할 레슨이 정해져요. 버튼 하나만 누르면 돼요'],
         ['🗣️', '읽기는 해도 입 밖으로 말을 못 해요', '🎤', 'AI가 단어마다 발음을 짚어주고 칭찬해줘요'],
         ['⏰', '바빠서 옆에서 봐줄 시간이 없어요', '📊', '아이 혼자 끝까지 하고, 결과는 부모님 리포트로 받아요']]
        .map(([a, q, b, ans]) => `<div class="worry card"><p class="w-q"><span>${a}</span>${q}</p><p class="w-a"><span>${b}</span>${ans}</p></div>`).join('')}
    </div>
  </section>

  <section class="band"><div class="wrap sec">
    <h2 class="sec-title">꾸준히 하면 이렇게 자라요</h2>
    <p class="sec-desc">눌러서 아이가 하게 될 말을 들어보세요.</p>
    <ol class="grow">
      ${[['🔤', '알파벳 소리', '대소문자와 첫소리를 알아요', 'A is for apple.'], ['🐱', '단어 읽기', '파닉스로 처음 보는 단어도 읽어요', 'c, a, t. cat!'],
         ['💬', '문장 말하기', '묻고 대답하며 대화해요', 'My name is Mia. I am seven.'], ['📖', '내 이야기', '어제 한 일, 내 꿈을 영어로 말해요', 'Yesterday I went to the park. I will be a doctor.']]
        .map(([e, t, d, say], k) => `<li><button class="grow-step" data-say="${esc(say)}"><span class="g-n">${k + 1}</span><span class="g-e">${e}</span><b>${t}</b><small>${d}</small><em>🔊 “${esc(say)}”</em></button></li>`).join('')}
    </ol>
    <p class="center fine">8단계 26레벨 · 레슨 ${TOTAL_LESSONS}개 · 하루 1레슨(주 5일)이면 ${durationText(studyWeeks(TOTAL_LESSONS))}, 하루 2레슨이면 ${durationText(studyWeeks(TOTAL_LESSONS, 2))} 과정</p>
    <div class="center"><a class="btn btn-ghost" href="#/study">📚 학습 내용 자세히 보기</a></div>
  </div></section>

  <section class="wrap sec two-col">
    <div>
      <h2 class="sec-title left">부모님은 확인만 하세요</h2>
      <ul class="check-list big">
        <li>레슨을 마치면 바로 학습 알림</li>
        <li>정답률·학습 시간·발음 점수를 한눈에</li>
        <li>약한 단어와 문장은 자동으로 복습</li>
        <li>레벨별 워크시트 바로 인쇄</li>
      </ul>
      <p class="fine">카카오톡 연동 없이 부모페이지에서 언제든 볼 수 있어요.</p>
    </div>
    <div class="card report-preview" aria-label="부모 리포트 예시">
      <span class="sticker-label">예시 화면</span>
      <div class="rp-head"><span class="avatar">🐰</span><div><b>하린이의 이번 주</b><small>Level C · 파닉스 시작섬</small></div></div>
      <div class="rp-kpis"><div><b>🔥 5일</b><small>연속 학습</small></div><div><b>86%</b><small>정답률</small></div><div><b>72분</b><small>학습 시간</small></div></div>
      <div class="rp-bars">${[8, 12, 0, 15, 10, 14, 13].map((m, k) => `<div><i style="height:${m / 15 * 100}%"></i><small>${'월화수목금토일'[k]}</small></div>`).join('')}</div>
      <div class="rp-noti">📚 하린이가 Level C Day 2를 완료했어요! 정답률 88%</div>
    </div>
  </section>

  <section class="band"><div class="wrap sec two-col">
    <div class="card speak-demo" id="speakDemo"></div>
    <div>${UI.mascot('마이크 버튼을 누르고 따라 말해봐! 단어마다 초록·노랑·빨강으로 알려줄게.', '🌱')}
      <h3 class="sec-sub">AI 발음 코치, 지금 해보세요</h3>
      <p class="sec-desc left">아이 목소리에 맞춰 너그럽게 채점해서 자신감부터 키워요.</p></div>
  </div></section>

  <section class="wrap sec two-col">
    <div>
      <h2 class="sec-title left">부모님들의 ‘매우 좋아요’ 후기</h2>
      ${realReviews.length ? UI.ratingBars(realReviews) : '<p class="sec-desc left">아직 등록된 후기가 없어요.</p>'}
      <div class="row"><a class="btn btn-ghost" href="#/reviews">후기 전체 보기</a>${u ? '<a class="btn btn-ghost" href="#/reviews">✍️ 후기 남기기</a>' : ''}</div>
    </div>
    <div class="review-stack">${bestReviews.length ? bestReviews.map(r => UI.reviewCard(r)).join('')
      : `<div class="card empty-review"><div class="empty-ico">💌</div><p>첫 번째 ‘매우 좋아요’ 후기를 기다리고 있어요.</p><a class="btn btn-primary" href="${u ? '#/reviews' : '#/signup'}">${u ? '후기 남기기' : '7일 무료로 써 보기'}</a></div>`}</div>
  </section>

  <section class="wrap sec final-cta">
    <div class="card cta-card">
      <div class="cta-emoji" aria-hidden="true">🌱🐰🎈</div>
      <h2>오늘 저녁 15분, 아이와 함께 시작해보세요</h2>
      <p>7일 동안 모든 기능을 무료로 쓰고, 체험이 끝나도 자동으로 결제되지 않아요.</p>
      <div class="row-center"><a class="btn btn-primary lg" href="${cta}">${u ? '📚 학습하러 가기' : '🌱 7일 무료로 시작하기'}</a><a class="btn btn-ghost lg" href="#/pricing">💰 요금·할인 보기</a></div>
    </div>
  </section>`;

  $$('[data-say]', el).forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
  UI.miniQuiz($('#miniQuiz', el));
  Views.speakWidget($('#speakDemo', el), ['I like apples.', 'This is a cat.', 'How are you?', 'I will be a doctor.'], false);
};

// 홈 히어로: 가입 없이 바로 푸는 3문제
UI.miniQuiz = box => {
  let n = 0, right = 0;
  // 그림만 보고 헷갈리지 않는 단어만 쓴다
  const CLEAR = ['apple', 'ball', 'cat', 'dog', 'egg', 'fish', 'hat', 'lion', 'moon', 'pig', 'sun', 'bus', 'cup', 'fox', 'bed', 'whale', 'zebra', 'tiger', 'rabbit', 'cheese', 'ship', 'chick'];
  const pool = PICTURE_WORDS.filter(w => CLEAR.includes(w.en));
  const draw = () => {
    if (n >= 3) {
      box.innerHTML = `<span class="sticker-label">바로 해보기</span><div class="mq-done anim-in"><div class="mq-big">${right === 3 ? '🏆' : '🌟'}</div>
        <h3>${right}개 맞혔어요!</h3><p>이런 문제를 놀이처럼 하루 8개씩 풀어요.</p>
        <a class="btn btn-primary full" href="#/sample/A">▶ 3분 체험 레슨 이어하기</a><button class="link-btn" data-again>다시 풀기</button></div>`;
      $('[data-again]', box).onclick = () => { n = 0; right = 0; draw(); };
      if (right >= 2) Lesson.confetti();
      return;
    }
    const ans = pool[Math.floor(Math.random() * pool.length)];
    const opts = shuffle([ans, ...pickOthers(pool, 2, ans)]);
    box.innerHTML = `<span class="sticker-label">바로 해보기 ${n + 1}/3</span>
      <p class="mq-q">소리를 듣고 그림을 골라요</p>
      <button class="mq-play" aria-label="다시 듣기">🔊</button>
      <div class="mq-opts">${opts.map(o => `<button class="mq-opt" data-en="${esc(o.en)}" aria-label="${esc(o.en)}">${o.emoji}</button>`).join('')}</div>
      <p class="mq-fb" aria-live="polite">눌러서 들어보세요 👆</p>`;
    const play = () => Speech.speak(ans.en);
    $('.mq-play', box).onclick = play;
    if (n > 0) setTimeout(play, 300); // 첫 문제는 아이가 직접 🔊를 누르게 한다
    $$('.mq-opt', box).forEach(b => b.onclick = () => {
      const ok = b.dataset.en === ans.en;
      $$('.mq-opt', box).forEach(x => { x.disabled = true; if (x.dataset.en === ans.en) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong'); else right++;
      ok ? Speech.sfx.correct() : Speech.sfx.wrong();
      $('.mq-fb', box).innerHTML = `${ok ? '정답! 👏' : '아쉬워요!'} <b>${esc(ans.en)}</b>`;
      setTimeout(() => Speech.speak(ans.en), 300);
      setTimeout(() => { n++; draw(); }, 1400);
    });
  };
  draw();
};

/* 말하기 위젯 (홈 데모 + AI 말하기 공용) */
Views.speakWidget = (box, sentences, record = true) => {
  let k = 0;
  const draw = () => {
    const s = sentences[k];
    box.innerHTML = `<div class="sw-head"><span class="chip">🎤 AI 발음 코치</span><button class="link-btn" data-next>다른 문장 ↻</button></div>
      <div class="speak-target big">${words(s).map(w => `<span>${esc(w)}</span>`).join(' ')}</div>
      <div class="speak-result" aria-live="polite"></div>
      <div class="row-center"><button class="btn btn-ghost" data-listen>🔊 듣기</button><button class="btn btn-ghost" data-slow>🐢 천천히</button>
      ${Speech.canListen ? '<button class="btn btn-primary mic" data-mic>🎤 말하기</button>' : ''}</div>
      ${Speech.canListen ? '' : '<p class="hint">이 브라우저는 음성 인식을 지원하지 않아요. Chrome·Edge에서 마이크를 허용하면 AI 점수를 받을 수 있어요.</p>'}`;
    $('[data-next]', box).onclick = () => { k = (k + 1) % sentences.length; draw(); };
    $('[data-listen]', box).onclick = () => Speech.speak(s);
    $('[data-slow]', box).onclick = () => Speech.speak(s, { slow: true });
    const mic = $('[data-mic]', box);
    if (mic) mic.onclick = async () => {
      mic.disabled = true; mic.classList.add('rec'); mic.textContent = '🎙️ 듣고 있어요…';
      const res = $('.speak-result', box);
      try {
        const r = Speech.score(s, await Speech.listen());
        $$('.speak-target span', box).forEach((sp, j) => { const w = r.words[j]; if (w) sp.className = w.ok === 1 ? 'ok' : w.ok ? 'mid' : 'no'; });
        const miss = r.words.filter(w => w.ok < 1).map(w => w.w);
        let got = 0;
        if (record && Store.profile()) got = Store.recordSpeaking(s, r.score);
        res.innerHTML = `<div class="score-pill ${scoreClass(r.score)}">${r.score}점</div><div class="heard">들은 말: "${esc(r.heard)}"</div>
          <div class="hint">${miss.length ? `<b>${miss.map(esc).join(', ')}</b>을(를) 다시 들어보고 말해봐요.` : '완벽해요! 🌟'}${got ? ' · ⭐ 별 1개 획득!' : ''}</div>`;
        if (r.score >= 80) Speech.sfx.correct();
      } catch (e) {
        res.innerHTML = `<div class="hint">${e.message === 'not-allowed' ? '마이크 권한을 허용해 주세요.' : '소리를 듣지 못했어요. 다시 말해볼까요?'}</div>`;
      }
      mic.disabled = false; mic.classList.remove('rec'); mic.textContent = '🎤 다시 말하기';
    };
  };
  draw();
};

/* ---------- 학습하기 (처음 오신 분 / 전체 학습 내용) ---------- */
Views.study = (el, params) => {
  const u = Store.user(), p = Store.profile(), a = Store.access();
  // 학습 중인 아이가 있으면 바로 모험 지도로
  if (u && p && a.ok && params.get('view') !== 'all') return Views.learn(el);
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">📚 학습하기</h1>
    ${u && !p ? `<div class="card status-card">👶 아이 프로필을 만들면 바로 학습을 시작할 수 있어요. <a href="#/profiles">프로필 만들기 →</a></div>` : ''}
    ${u && p && !a.ok ? `<div class="card status-card">⏳ 무료체험이 끝났어요. <a href="#/pricing">요금·할인 보기 →</a></div>` : ''}
    ${u && p && a.ok ? `<div class="card status-card">📍 ${esc(p.name)}의 학습은 <a href="#/study">모험 지도</a>에서 이어갈 수 있어요.</div>` : ''}
    <div class="start-3">
      <a class="start-card" href="#/sample/A" style="--c:#ffd23f"><span>▶</span><b>3분 체험 레슨</b><small>가입 없이 알파벳 레슨 5문제</small></a>
      <a class="start-card" href="#/leveltest" style="--c:#7fd3ff"><span>🧪</span><b>무료 레벨 진단</b><small>12문제로 시작 레벨 찾기</small></a>
      <a class="start-card" href="${u ? (p ? '#/study' : '#/profiles') : '#/signup'}" style="--c:#7ed957"><span>🌱</span><b>${u ? '내 학습 시작' : '7일 무료로 시작'}</b><small>${u ? '진도·별·리포트가 저장돼요' : '카드 등록 없이 바로'}</small></a>
    </div>

    <h2 class="sec-sub">하루 학습은 이렇게 해요</h2>
    <ol class="day-flow">
      ${[['1', '🗺️', '지도에서 오늘 레슨 누르기'], ['2', '🎧', '듣고 · 고르고 · 따라 쓰고 · 말하기 8문제'], ['3', '⭐', '별 받고 스티커 모으기'], ['4', '📊', '부모님께 학습 알림 도착']]
        .map(([n, e, t]) => `<li><span class="df-n">${n}</span><span class="df-e">${e}</span><b>${t}</b></li>`).join('')}
    </ol>

    <h2 class="sec-sub">전체 과정은 얼마나 걸리나요?</h2>
    <p class="sec-desc left">8단계 26레벨, 레벨마다 10일(9일 학습 + 1일 복습)이라 모두 <b>${TOTAL_LESSONS}레슨</b>이에요. 레슨 하나는 8문제, 10~15분이에요.</p>
    <div class="table-wrap"><table class="table duration-table">
      <thead><tr><th>학습 속도 (주 5일)</th><th>한 레벨</th><th>전체 과정</th></tr></thead>
      <tbody>${[[1, '추천 · 무리 없이 꾸준히'], [2, '빠르게']].map(([n, t]) => `<tr><th>하루 ${n}레슨 <small>${t}</small></th><td>${durationText(studyWeeks(LESSONS_PER_LEVEL, n))}</td><td><b>${durationText(studyWeeks(TOTAL_LESSONS, n))}</b></td></tr>`).join('')}
      <tr><th>주 3일 · 하루 1레슨</th><td>${durationText(studyWeeks(LESSONS_PER_LEVEL, 1, 3))}</td><td><b>${durationText(studyWeeks(TOTAL_LESSONS, 1, 3))}</b></td></tr></tbody></table></div>
    <p class="fine">레벨 진단으로 중간 단계에서 시작하면 그만큼 짧아져요. 스토리북·놀이터·말하기는 레슨과 별도로 자유롭게 해요.</p>

    <h2 class="sec-sub">단계별 학습 내용 <small>레벨을 누르면 배우는 내용과 체험 레슨이 나와요</small></h2>
    <div class="az-grid">${STAGES.map(s => s.levels.map(l => `<button class="az" data-lv="${l}" style="--c:${s.color}"><b>${l}</b><small>${s.id}단계</small></button>`).join('')).join('')}</div>
    <div class="card lv-detail" id="lvDetail"></div>

    <h2 class="sec-sub">8단계 한눈에 보기</h2>
    ${UI.stageCarousel('curCar')}

    <h2 class="sec-sub">학습 방법</h2>
    <div class="grid3">
      <div class="card feat"><span class="feat-ico">🎯</span><h4>딱 맞는 난이도</h4><p>정답률에 따라 보기 수와 힌트가 자동으로 바뀌어 너무 쉽지도 어렵지도 않아요.</p></div>
      <div class="card feat"><span class="feat-ico">📖</span><h4>단계마다 스토리북</h4><p>읽어주는 소리에 맞춰 단어가 반짝이고, 단어를 누르면 소리를 들어요.</p></div>
      <div class="card feat"><span class="feat-ico">🎈</span><h4>놀이터 & 별 상점</h4><p>풍선·카드 게임으로 복습하고, 모은 별로 스티커와 꾸미기 아이템을 사요.</p></div>
    </div>
  </div>`;
  UI.wireCarousel($('#curCar', el));
  const detail = $('#lvDetail', el);
  const show = lv => {
    $$('.az', el).forEach(b => b.classList.toggle('on', b.dataset.lv === lv));
    const s = stageOf(lv), items = Gen.levelItems(lv);
    const label = it => it.letter ? `${it.emoji} ${it.letter}${it.letter.toLowerCase()} · ${it.words.map(w => w[0]).join(', ')}` : it.q ? `${it.q} → ${it.a}` : `${it.emoji || ''} ${it.en}`;
    const sayOf = it => it.letter ? letterLine(it) : it.q ? `${it.q} ${it.a}` : it.en;
    detail.innerHTML = `<div class="lvd-head"><span class="level-box" style="--c:${s.color}">${lv}</span><div><b>${s.id}단계 · ${s.title}</b><p>${s.desc}</p></div>
      <button class="btn btn-primary" data-sample>▶ 이 레벨 체험하기</button></div>
      <div class="lvd-items">${items.map(it => `<button class="sample-chip" data-say="${esc(sayOf(it))}">${esc(label(it))} 🔊</button>`).join('')}</div>`;
    $$('[data-say]', detail).forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
    $('[data-sample]', detail).onclick = () => App.sampleLesson(lv);
  };
  $$('.az', el).forEach(b => b.onclick = () => show(b.dataset.lv));
  show('A');
};

/* ---------- 사용 후기 ---------- */
Views.reviews = el => {
  let filter = 0, shown = 6;
  const admin = Store.isAdmin();
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">💬 이용 후기</h1>
    <div class="two-col top"><div class="card"><div id="bars"></div></div>
    <form class="card review-form" id="rvForm">
      <h3>후기 남기기</h3>
      ${Store.user() ? `<div class="rate-pick">${[4, 3, 2, 1].map(r => `<label><input type="radio" name="rating" value="${r}" ${r === 4 ? 'checked' : ''}><span>${['', '😢', '😐', '🙂', '😍'][r]} ${RATING_LABELS[r]}</span></label>`).join('')}</div>
      <input name="name" maxlength="20" placeholder="표시 이름 (예: 7살 하린 보호자)" required>
      <textarea name="text" rows="3" maxlength="400" placeholder="좋았던 점, 아쉬운 점을 알려주세요. 개선에 반영할게요!" required></textarea>
      <button class="btn btn-primary">등록하기</button>` : `<p>후기를 쓰려면 로그인해 주세요.</p><a class="btn btn-primary" href="#/login?next=/reviews">로그인</a>`}
    </form></div>
    <div class="chips filter">${[0, 4, 3, 2, 1].map(r => `<button class="chip ${r === 0 ? 'on' : ''}" data-f="${r}">${r ? RATING_LABELS[r] : '전체'}</button>`).join('')}</div>
    <div class="review-grid" id="rvList"></div>
    <div class="center"><button class="btn btn-ghost" id="more">후기 더보기</button></div>
  </div>`;
  const draw = () => {
    const all = Store.reviews();
    $('#bars', el).innerHTML = UI.ratingBars(all);
    const list = all.filter(r => !filter || r.rating === filter);
    $('#rvList', el).innerHTML = list.slice(0, shown).map(r => UI.reviewCard(r, admin)).join('') || UI.empty('📝', '아직 후기가 없어요.');
    $('#more', el).hidden = list.length <= shown;
    $$('[data-delrev]', el).forEach(b => b.onclick = async () => { if (confirm('이 후기를 삭제할까요?')) { await Store.deleteReview(b.dataset.delrev).catch(x => App.toast(x.message)); draw(); } });
  };
  $$('[data-f]', el).forEach(b => b.onclick = () => { filter = +b.dataset.f; shown = 6; $$('[data-f]', el).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  $('#more', el).onclick = () => { shown += 6; draw(); };
  const f = $('#rvForm', el);
  f.onsubmit = async e => {
    e.preventDefault(); if (!Store.user()) return;
    const d = new FormData(f);
    try { await Store.addReview({ rating: +d.get('rating'), name: d.get('name').trim(), text: d.get('text').trim() }); }
    catch (x) { return App.toast(x.message); }
    f.reset(); App.toast('후기가 등록되었어요. 고마워요! 💚'); draw();
  };
  draw();
};

/* ---------- 요금·할인 ---------- */
Views.pricing = (el, params) => {
  const u = Store.user(), a = Store.access();
  const pct = r => Math.round(r * 100) + '%';
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">💰 요금·할인</h1>
    ${u ? `<div class="card status-card">${statusText(a, u)} ${a.kind === 'member' ? '<a href="#/parent/member">구독 관리 →</a>' : ''}</div>` : ''}
    ${params && params.get('error') ? `<div class="card notice error-card">⚠️ 결제를 완료하지 못했어요: ${esc(params.get('error'))}</div>` : ''}

    <div class="price-hero card">
      <div><span class="chip">처음이라면</span><h2>7일 무료체험</h2><p>모든 기능을 그대로 써보세요. <b>카드 등록 없음 · 자동결제 없음</b></p></div>
      <a class="btn btn-primary lg" href="${u ? '#/study' : '#/signup'}">${u ? '📚 학습하러 가기' : '🌱 무료로 시작하기'}</a>
    </div>

    <h2 class="sec-sub">요금제</h2>
    ${UI.plans()}

    <h2 class="sec-sub">🎟️ 웰컴쿠폰 할인율</h2>
    <p class="sec-desc left">가입하면 바로 받는 쿠폰이에요. 10일 안에 결제하면 정가에서 아래만큼 할인돼요.</p>
    <div class="table-wrap"><table class="table price-table">
      <thead><tr><th></th><th>1개월</th><th>6개월</th><th>12개월</th></tr></thead>
      <tbody>${['one', 'two'].map(k => `<tr><th>${k === 'one' ? '👧 한 자녀' : '👧👦 두 자녀'}</th>${[1, 6, 12].map(m => {
        const P = PLANS[k], monthly = Math.min(planMonthly(k, m), Math.round(P.list * (1 - P.coupon[m])));
        return `<td><b class="hot">${pct(P.coupon[m])}</b><br>월 ${won(monthly)}</td>`;
      }).join('')}</tr>`).join('')}</tbody></table></div>

    <h2 class="sec-sub">무료체험 vs 멤버십</h2>
    <div class="table-wrap"><table class="table compare">
      <thead><tr><th>기능</th><th>7일 무료체험</th><th>멤버십</th></tr></thead>
      <tbody>${[['26개 레벨 레슨', '✅', '✅'], ['AI 발음 코치', '✅', '✅'], ['스토리북 · 놀이터 · 별 상점', '✅', '✅'], ['부모 리포트 · 학습 알림', '✅', '✅'], ['워크시트 인쇄', '✅', '✅'], ['이용 기간', '7일', '1 · 6 · 12개월'], ['자동결제', '없음', '언제든 해지 가능']]
        .map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>

    <h2 class="sec-sub">결제 · 해지 · 환불 안내</h2>
    <div class="grid3">
      <div class="card feat"><span class="feat-ico">🔁</span><h4>자동갱신</h4><p>기간이 끝나는 날 같은 상품으로 갱신돼요. 부모페이지 › 멤버십에서 버튼 하나로 해지해요.</p></div>
      <div class="card feat"><span class="feat-ico">↩️</span><h4>7일 이내 환불</h4><p>결제 후 7일 이내라면 부모페이지에서 바로 환불하고, 사용한 쿠폰도 돌려받아요.</p></div>
      <div class="card feat"><span class="feat-ico">➕</span><h4>체험 기간 보존</h4><p>체험 중에 결제해도 남은 체험 일수는 멤버십 기간에 더해지고, 학습 기록은 그대로예요.</p></div>
    </div>
    ${UI.faq(FAQ.filter(f => f.cat === '멤버십' || f.q.includes('자동으로 결제')))}
    <p class="fine center">이 앱은 데모라 실제 결제는 일어나지 않아요.</p>
  </div>`;
  UI.wirePlans($('.plans', el));
};
function statusText(a, u) {
  if (a.kind === 'admin') return '🛠️ 관리자 계정 · 모든 기능을 제한 없이 이용 중';
  if (a.kind === 'member') return `💎 멤버십 이용 중 · <b>${a.daysLeft}일</b> 남음 · ${u.membership.autoRenew ? `다음 결제일 ${fmtDay(u.membership.until)}` : '자동갱신 해지됨'}`;
  return a.ok ? `🎁 무료체험 중 · <b>${a.daysLeft}일</b> 남음 (자동결제 없음)` : '⏳ 무료체험이 끝났어요. 멤버십으로 학습을 이어가세요.';
}

/* ---------- 도움말 ---------- */
Views.help = el => {
  let cat = '전체', q = '';
  const cats = ['전체', ...new Set(FAQ.map(f => f.cat))];
  el.innerHTML = `<div class="wrap sec narrow">
    <h1 class="page-title">🙋 도움말</h1>
    <input class="search" type="search" placeholder="궁금한 내용을 검색해 보세요 (예: 해지, 소리, 별)" aria-label="도움말 검색">
    <div class="chips filter">${cats.map(c => `<button class="chip ${c === '전체' ? 'on' : ''}" data-c="${c}">${c}</button>`).join('')}</div>
    <div id="faqList"></div>
    <div class="card notice"><b>🔧 이 기기 진단</b>
      <p>음성 합성 ${Speech.canSpeak ? '✅' : '❌'} · 음성 인식 ${Speech.canListen ? '✅' : '❌ (Chrome/Edge 권장)'} · 알림 ${'Notification' in window ? '✅' : '❌'}</p>
      <div class="row"><button class="btn btn-ghost sm" data-test-voice>🔊 목소리 테스트</button><button class="btn btn-ghost sm" data-test-sfx>🎵 효과음 테스트</button></div></div>
  </div>`;
  const draw = () => {
    const list = FAQ.filter(f => (cat === '전체' || f.cat === cat) && (!q || (f.q + f.a).includes(q)));
    $('#faqList', el).innerHTML = list.length ? UI.faq(list) : UI.empty('🔍', `"${esc(q)}"에 대한 결과가 없어요.`);
    if (q && list.length === 1) $('details', el).open = true;
  };
  $('.search', el).oninput = e => { q = e.target.value.trim(); draw(); };
  $$('[data-c]', el).forEach(b => b.onclick = () => { cat = b.dataset.c; $$('[data-c]', el).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  $('[data-test-voice]', el).onclick = () => Speech.speak('Hello! Can you hear me?');
  $('[data-test-sfx]', el).onclick = () => Speech.sfx.cheer();
  draw();
};

/* ---------- 로그인 / 회원가입 (SNS 또는 이메일 인증, 비밀번호 없음) ---------- */
Views.auth = (el, mode, params) => {
  const isUp = mode === 'signup';
  const next = params.get('next') || '/study';
  const LAST_KEY = 'sprout-last-login';
  let last = {}; try { last = JSON.parse(localStorage.getItem(LAST_KEY)) || {}; } catch (e) { /* ignore */ }
  const remember = (method, email) => { try { localStorage.setItem(LAST_KEY, JSON.stringify({ method, email })); } catch (e) { /* ignore */ } };
  let email = last.email || '', timer = null;
  const steps = isUp ? ['방법 선택', '본인 확인', '정보 입력'] : ['방법 선택', '본인 확인'];
  const NAMES = { kakao: '카카오', naver: '네이버', google: 'Google', apple: 'Apple', email: '이메일' };
  const providers = Object.entries(CONFIG.AUTH_PROVIDERS).filter(([k]) => Store.providerReady(k));
  const done = () => { App.refreshHeader(); location.hash = Store.profile() ? '#' + next : '#/profiles'; };
  const busy = (btn, on) => { if (!btn) return; btn.disabled = on; btn.classList.toggle('loading', on); };

  const shell = (step, inner) => {
    clearInterval(timer);
    const q = next !== '/study' ? '?next=' + encodeURIComponent(next) : '';
    el.innerHTML = `<div class="wrap sec auth"><div class="card auth-card">
      <div class="seg auth-tabs" role="tablist"><a href="#/login${q}" class="${isUp ? '' : 'on'}" role="tab">로그인</a><a href="#/signup${q}" class="${isUp ? 'on' : ''}" role="tab">회원가입</a></div>
      <ol class="steps">${steps.map((s, k) => `<li class="${k < step ? 'done' : k === step ? 'now' : ''}"><span>${k < step ? '✓' : k + 1}</span>${s}</li>`).join('')}</ol>
      ${inner}</div></div>`;
  };

  const choose = (error = '') => {
    shell(0, `
      <h1>${isUp ? '7일 무료로 시작해요 🌱' : '다시 오셨네요! 👋'}</h1>
      ${isUp ? '<ul class="perks"><li>🎁 7일간 모든 기능 무료</li><li>🎟️ 웰컴쿠폰 바로 지급</li><li>🔒 카드 등록·자동결제 없음</li></ul>' : '<p class="center sec-desc">가입할 때 쓴 방법을 눌러 주세요. 비밀번호는 필요 없어요.</p>'}
      ${error ? `<p class="form-err center">${esc(error)}</p>` : ''}
      ${providers.length ? `<div class="sns">${providers.map(([k, p]) => `<button class="sns-btn ${k}" data-sns="${k}"><span class="sns-ico">${p.icon}</span>${NAMES[k]}로 ${isUp ? '가입하기' : '로그인'}${last.method === k ? '<em class="last">최근 사용</em>' : ''}</button>`).join('')}</div>
      <div class="or"><span>또는 이메일로${last.method === 'email' ? ' <em class="last">최근 사용</em>' : ''}</span></div>` : ''}
      <form class="email-form" novalidate><label>이메일 주소<input name="email" type="email" autocomplete="email" inputmode="email" placeholder="parent@example.com" required></label>
      <p class="form-err" role="alert"></p><button class="btn btn-primary full lg">📮 인증코드 받기</button>
      <p class="fine center">입력한 메일로 6자리 숫자가 와요. 그 숫자만 넣으면 끝!</p></form>
      <p class="center switch">${isUp ? '이미 계정이 있나요? <a href="#/login">로그인</a>' : '처음이세요? <a href="#/signup">회원가입하고 7일 무료 받기</a>'}</p>`);
    $$('[data-sns]', el).forEach(b => b.onclick = () => snsFlow(b.dataset.sns));
    const f = $('form', el);
    f.email.value = email;
    if (!email) f.email.focus();
    f.onsubmit = async e => {
      e.preventDefault();
      const btn = $('button', f); busy(btn, true);
      try { email = f.email.value.trim(); await send(); } catch (x) { $('.form-err', el).textContent = x.message; busy(btn, false); }
    };
  };

  const send = async () => { const r = await Store.sendCode(email); if (r.code) App.demoMail(email, r.code); codeStep(r); };

  const codeStep = r => {
    shell(1, `<h1>메일함을 확인해 주세요 📬</h1>
      <p class="center"><b>${esc(email)}</b>(으)로 보낸<br>6자리 인증코드를 입력해 주세요.</p>
      <form class="code-form" novalidate>
        <input class="code-input" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="인증코드 6자리" placeholder="••••••">
        <p class="timer" aria-live="polite"></p><p class="form-err" role="alert"></p>
        <button class="btn btn-primary full lg">확인</button>
      </form>
      <div class="row-center"><button class="link-btn" data-back>← 이메일 바꾸기</button><button class="link-btn" data-resend>코드 다시 받기</button></div>
      <p class="fine center">메일이 안 보이면 스팸함을 확인해 주세요.${r.code ? ' (테스트 모드: 화면 오른쪽 아래에 코드가 보여요)' : ''}</p>`);
    const f = $('form', el), t = $('.timer', el), err = $('.form-err', el);
    f.code.focus();
    const tick = () => {
      const left = Math.max(0, Math.round((r.expires - Date.now()) / 1000));
      t.textContent = left ? `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} 남음` : '⌛ 코드가 만료되었어요. 다시 받아 주세요.';
      if (!left) clearInterval(timer);
    };
    tick(); timer = setInterval(tick, 1000);
    let sending = false;
    f.code.oninput = () => { f.code.value = f.code.value.replace(/\D/g, '').slice(0, 6); if (f.code.value.length === 6 && !sending) f.requestSubmit(); };
    f.onsubmit = async e => {
      e.preventDefault(); if (sending) return;
      err.textContent = ''; sending = true; busy($('button', f), true);
      try {
        const res = await Store.verifyCode(email, f.code.value);
        clearInterval(timer);
        if (!res.needSignup) { remember('email', email); App.toast(isUp ? '이미 가입된 이메일이라 바로 로그인했어요 👋' : '다시 만나서 반가워요! 👋'); return done(); }
        isUp ? signupStep('email', email) : notMember('email', email);
      } catch (x) { err.textContent = x.message; f.code.value = ''; f.code.focus(); }
      sending = false; busy($('button', f), false);
    };
    $('[data-back]', el).onclick = () => choose();
    $('[data-resend]', el).onclick = async () => { try { await send(); App.toast('새 코드를 보냈어요.'); } catch (x) { err.textContent = x.message; } };
  };

  // 로그인하려는데 가입 기록이 없을 때: 바로 가입으로 이어준다
  const notMember = (provider, em) => {
    shell(1, `<div class="auth-logo">🤔</div><h1>아직 가입하지 않은 계정이에요</h1>
      <p class="center"><b>${esc(em || NAMES[provider] + ' 계정')}</b><br>이 계정으로 바로 가입할까요? 7일 무료체험이 시작돼요.</p>
      <button class="btn btn-primary full lg" data-join>🌱 이 계정으로 가입하기</button>
      <button class="btn btn-ghost full" data-other>다른 방법으로 로그인</button>`);
    $('[data-join]', el).onclick = () => signupStep(provider, em);
    $('[data-other]', el).onclick = () => choose();
  };

  const signupStep = (provider, em, name = '') => {
    if (steps.length < 3) steps.push('정보 입력');
    shell(2, `<h1>마지막 단계예요! 🎉</h1><p class="center">${NAMES[provider] || provider}${em ? ' · ' + esc(em) : ''}</p>
      <form class="auth-form" novalidate>
        <label>보호자 이름 (닉네임)<input name="parentName" maxlength="20" autocomplete="nickname" placeholder="예: 하린맘" required></label>
        <label class="check all"><input type="checkbox" name="all"> <b>모두 동의해요</b></label>
        <label class="check"><input type="checkbox" name="terms" required> (필수) <a href="terms.html" target="_blank">이용약관</a> · <a href="privacy.html" target="_blank">개인정보 처리방침</a> 동의</label>
        <label class="check"><input type="checkbox" name="age" required> (필수) 만 14세 이상 보호자예요</label>
        <label class="check"><input type="checkbox" name="mkt"> (선택) 학습 소식·혜택 알림 받기</label>
        <p class="form-err" role="alert"></p>
        <button class="btn btn-primary full lg">가입 완료 →  아이 프로필 만들기</button></form>`);
    const f = $('form', el);
    f.parentName.value = name; f.parentName.focus();
    f.all.onchange = () => ['terms', 'age', 'mkt'].forEach(k => f[k].checked = f.all.checked);
    f.onsubmit = async e => {
      e.preventDefault();
      const nm = f.parentName.value.trim();
      if (!nm) return $('.form-err', el).textContent = '이름을 입력해 주세요.';
      if (!f.terms.checked || !f.age.checked) return $('.form-err', el).textContent = '필수 항목에 동의해 주세요.';
      busy($('button', f), true);
      try {
        await Store.completeSignup({ provider, email: em, parentName: nm, marketing: f.mkt.checked });
        remember(provider, em); App.toast('가입 완료! 웰컴쿠폰이 도착했어요 🎟️'); done();
      } catch (x) { $('.form-err', el).textContent = x.message; busy($('button', f), false); }
    };
  };

  const snsFlow = provider => {
    // 서버 모드: 실제 SNS 로그인 창으로 이동
    if (API.on) { remember(provider, ''); location.href = `api/auth/${provider}/start?mode=${mode}&next=${encodeURIComponent(next)}`; return; }
    // 로컬 데모: 동의 화면을 흉내 낸다
    const P = CONFIG.AUTH_PROVIDERS[provider], name = NAMES[provider];
    const m = App.modal(`<div class="sns-consent ${provider}"><div class="sns-head"><span class="sns-ico">${P.icon}</span>${name} 로그인</div>
      <p class="fine">⚠️ 서버 없이 실행 중인 데모예요. 서버에 ${name} 키를 설정하면 실제 ${name} 로그인 창이 열려요.</p>
      <form novalidate><label>${name} 계정 이메일<input name="email" type="email" required value="${last.method === provider ? esc(last.email || '') : ''}" placeholder="me@${{ kakao: 'kakao.com', naver: 'naver.com', apple: 'icloud.com', google: 'gmail.com' }[provider]}"></label>
      <p class="fine">새싹영어가 받는 정보: 이메일, 닉네임</p><p class="form-err" role="alert"></p>
      <div class="row-center"><button type="button" class="btn btn-ghost" data-close>취소</button><button class="btn btn-primary">동의하고 계속하기</button></div></form></div>`);
    const f = $('form', m.el); f.email.focus();
    f.onsubmit = e => {
      e.preventDefault();
      const em = f.email.value.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(em)) return $('.form-err', m.el).textContent = '이메일 형식을 확인해 주세요.';
      m.close();
      if (Store.exists(em)) { Store.snsLocalLogin(provider, em); remember(provider, em); App.toast(isUp ? '이미 가입된 계정이라 바로 로그인했어요 👋' : '다시 만나서 반가워요! 👋'); done(); }
      else isUp ? signupStep(provider, em) : notMember(provider, em);
    };
  };

  if (Store.user()) return done();
  // SNS에서 돌아왔는데 가입이 필요한 경우 (서버가 가입 대기 정보를 쿠키로 갖고 있다)
  if (API.on && params.get('step') === 'finish') {
    Store.pendingSignup().then(p => signupStep(p.provider, p.email, p.name)).catch(x => choose(x.message));
    return;
  }
  choose(params.get('error') || '');
};

/* ---------- 프로필 ---------- */
Views.profiles = el => {
  const u = Store.user();
  el.innerHTML = `<div class="wrap sec narrow">
    <h1 class="page-title center">누가 모험을 떠날까요?</h1>
    <div class="profile-grid">${u.profiles.map(p => `<button class="profile-pick" data-id="${p.id}">${avatarHtml(p)}<b>${esc(p.name)}</b><small>Level ${Store.currentLevel(p)} · ⭐${p.stars || 0}</small></button>`).join('')}
      <button class="profile-pick add" data-add><span class="avatar">＋</span><b>프로필 추가</b></button></div>
    <form class="card profile-form" hidden>
      <h3>아이 프로필 만들기</h3>
      <label>이름<input name="name" required maxlength="10"></label>
      <label>나이<select name="age">${[4, 5, 6, 7, 8, 9, 10].map(a => `<option ${a === 6 ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
      <div><b class="lbl">캐릭터를 골라요</b><div class="avatar-pick">${AVATARS.map((a, i) => `<label><input type="radio" name="avatar" value="${a}" ${i === 0 ? 'checked' : ''}><span>${a}</span></label>`).join('')}</div></div>
      <label class="check"><input type="checkbox" name="notify" checked> 학습알림 켜기 (레슨 완료·리마인더)</label>
      <button class="btn btn-primary full">만들기</button>
    </form></div>`;
  $$('[data-id]', el).forEach(b => b.onclick = () => { Store.selectProfile(b.dataset.id); App.refreshHeader(); location.hash = '#/study'; });
  const f = $('.profile-form', el);
  $('[data-add]', el).onclick = () => { f.hidden = false; f.name.focus(); };
  if (!u.profiles.length) f.hidden = false;
  f.onsubmit = async e => {
    e.preventDefault(); const d = new FormData(f);
    if (!d.get('name').trim()) return;
    Store.addProfile({ name: d.get('name').trim(), age: +d.get('age'), avatar: d.get('avatar') });
    u.settings.notify = !!d.get('notify'); Store.persist();
    if (u.settings.notify && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch (x) { /* ignore */ } }
    App.refreshHeader();
    App.toast('프로필이 만들어졌어요! 레벨 테스트로 출발할 섬을 정해볼까요?');
    location.hash = '#/leveltest';
  };
};

/* ---------- 학습 홈 (모험 지도) ---------- */
Views.learn = el => {
  const p = Store.profile(), a = Store.access(), cur = Store.currentLevel();
  const todayN = p.stamps[Store.today()] || 0;
  const curLessons = Store.levelProgress(cur).lessons;
  let curIdx = Array.from({ length: LESSONS_PER_LEVEL }, (_, d) => d).find(d => !curLessons[d]);
  if (curIdx === undefined) curIdx = LESSONS_PER_LEVEL - 1;
  // 전체 진도와 남은 기간 (출발 레벨 앞쪽은 건너뛴 것으로 본다)
  const startI = ALL_LEVELS.indexOf(p.startLevel);
  const course = (ALL_LEVELS.length - startI) * LESSONS_PER_LEVEL;
  const doneAll = ALL_LEVELS.slice(startI).reduce((n, lv) => n + Store.lessonsDone(lv), 0);
  const left = Math.max(0, course - doneAll);
  const diff = Store.difficulty();
  const greet = todayN >= p.dailyGoal ? `오늘 목표 달성! 놀이터에서 놀아도 좋아 🎈` : todayN ? `잘하고 있어! 레슨 ${p.dailyGoal - todayN}개만 더 하면 목표 달성!` : `안녕 ${esc(p.name)}! 오늘도 같이 모험하자!`;
  el.innerHTML = `<div class="wrap sec">
    <div class="learner-bar card">
      ${avatarHtml(p, 'big')}
      <div class="lb-info"><h1>${esc(p.name)}의 모험</h1><p>${a.kind === 'admin' ? '🛠️ 관리자 · 전체 열림' : a.kind === 'member' ? '💎 멤버십' : `🎁 무료체험 ${a.daysLeft}일 남음`} · <a href="#/profiles">프로필 변경</a></p></div>
      <div class="lb-stats">
        <div><b>🔥 ${Store.streak()}</b><small>연속 학습일</small></div>
        <a href="#/shop"><b>⭐ ${p.stars || 0}</b><small>별 (상점 가기)</small></a>
        <div class="goal"><b>${Math.min(todayN, p.dailyGoal)}/${p.dailyGoal}</b><small>오늘 목표</small><i style="--p:${Math.min(1, todayN / p.dailyGoal) * 100}%"></i></div>
      </div>
    </div>
    ${UI.mascot(greet, todayN >= p.dailyGoal ? '🌻' : '🌱')}
    <div class="continue card">
      <div><span class="chip">이어서 모험</span><h2>Level ${cur} · ${dayLabel(curIdx)}</h2><p>${stageOf(cur).title}섬 — ${stageOf(cur).desc}</p>
        <div class="course-prog"><div class="rb-bar"><i style="width:${doneAll / course * 100}%"></i></div>
          <small>전체 ${course}레슨 중 <b>${doneAll}개</b> 완료 · ${left ? `하루 ${p.dailyGoal}레슨(주 5일)이면 완주까지 <b>${durationText(studyWeeks(left, p.dailyGoal))}</b>` : '🎉 전체 과정 완주!'}</small></div>
        <p class="fine">난이도: ${{ easy: '🐣 쉬움 (보기 2개 + 힌트)', normal: '🐥 보통', hard: '🦅 도전 (보기 4개)' }[diff]}${p.difficulty === 'auto' ? ' · 정답률에 맞춰 자동 조절' : ''}</p></div>
      <a class="btn btn-primary lg" href="#/lesson/${cur}/${curIdx}">▶ 출발!</a>
    </div>
    <div class="quick">
      <a class="quick-card" href="#/play" style="--r:-2deg"><span>🎈</span><b>놀이터</b><small>풍선·카드 게임</small></a>
      <a class="quick-card" href="#/speak" style="--r:1.5deg"><span>🎤</span><b>AI 말하기</b><small>발음 점수 받기</small></a>
      <a class="quick-card" href="#/stories" style="--r:-1deg"><span>📖</span><b>스토리북</b><small>${Object.keys(p.stories).length}/${STORIES.length}권 읽음</small></a>
      <a class="quick-card" href="#/wrong" style="--r:2deg"><span>🔁</span><b>오답노트</b><small>${p.wrong.length}문제</small></a>
      <a class="quick-card" href="#/shop" style="--r:-1.5deg"><span>🛍️</span><b>별 상점</b><small>스티커·꾸미기</small></a>
      <a class="quick-card" href="#/leveltest" style="--r:1deg"><span>🧪</span><b>레벨 테스트</b><small>${p.placed ? '다시 보기' : '출발 섬 정하기'}</small></a>
    </div>
    <div class="sw-head"><h2 class="sec-sub">🗺️ 모험 지도</h2><a class="link-btn" href="#/study?view=all">📚 전체 학습 내용 보기 →</a></div>
    <div class="path">${STAGES.map(s => `
      <section class="path-island" style="--c:${s.color}">
        <header><em class="stage-tag">섬 ${s.id}</em><b>${s.title}</b><span class="island-stories">${STORIES.filter(x => x.stage === s.id).map(x => `<a class="link-btn" href="#/story/${x.id}">📖 ${esc(x.title)}</a>`).join('')}</span></header>
        <div class="nodes">${s.levels.map((lv, k) => {
          const open = Store.isUnlocked(lv), done = Store.lessonsDone(lv);
          const best = Store.levelProgress(lv).lessons.filter(Boolean).reduce((m, r) => Math.max(m, r.score), 0);
          return `<button class="node ${open ? '' : 'locked'} ${lv === cur ? 'current' : ''} ${done >= LESSONS_PER_LEVEL ? 'cleared' : ''}" data-lv="${lv}" style="--k:${k}" ${open ? '' : 'aria-disabled="true"'}>
            <span class="node-ball">${open ? lv : '🔒'}</span><span class="node-prog">${done}/${LESSONS_PER_LEVEL}${best ? ' · ' + best + '%' : ''}</span>${lv === cur ? `<span class="node-me">${p.avatar}</span>` : ''}</button>`;
        }).join('')}</div>
      </section>`).join('')}</div>
  </div>`;
  $$('.node', el).forEach(b => b.onclick = () => {
    const lv = b.dataset.lv;
    if (!Store.isUnlocked(lv)) return App.toast('앞 레벨을 마치면 열려요 🔒');
    const lp = Store.levelProgress(lv), s = stageOf(lv);
    const m = App.modal(`<h2><span class="level-box" style="--c:${s.color}">${lv}</span> Level ${lv}</h2><p>${s.desc}</p>
      <div class="day-list">${Array.from({ length: LESSONS_PER_LEVEL }, (_, d) => {
        const r = lp.lessons[d]; const st = r ? (r.score >= 90 ? 3 : r.score >= 70 ? 2 : 1) : 0;
        return `<a class="day-btn ${r ? 'done' : ''} ${Gen.isReviewDay(d) ? 'review' : ''}" href="#/lesson/${lv}/${d}" data-close><b>${dayLabel(d)}</b><span>${r ? '⭐'.repeat(st) + '☆'.repeat(3 - st) + ` ${r.score}%` : '—'}</span></a>`;
      }).join('')}</div>
      <div class="row-center"><a class="btn btn-ghost" href="#/worksheet/${lv}" data-close>🖨️ 워크시트</a><button class="btn btn-ghost" data-close>닫기</button></div>`);
  });
  const curEl = $('.node.current', el);
  if (curEl && stageOf(cur).id > 2) curEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
};

/* ---------- 레슨 ---------- */
Views.lesson = (el, lv, idx) => {
  if (!ALL_LEVELS.includes(lv) || !(idx >= 0 && idx < LESSONS_PER_LEVEL)) return (location.hash = '#/study');
  if (!Store.isUnlocked(lv)) { App.toast('이전 레벨을 먼저 마쳐야 열려요 🔒'); return (location.hash = '#/study'); }
  const qs = Gen.lesson(lv, idx);
  el.innerHTML = '<div class="wrap lesson-wrap"></div>';
  const root = $('.lesson-wrap', el);
  Lesson.run(root, qs, {
    title: `Level ${lv} · ${dayLabel(idx)}`, difficulty: Store.difficulty(),
    onExit: () => (location.hash = '#/study'),
    onDone: r => {
      const { score, stars } = Store.finishLesson({ level: lv, index: idx, correct: r.correct, total: r.total, seconds: r.seconds, wrongItems: r.wrong });
      const nl = ALL_LEVELS[ALL_LEVELS.indexOf(lv) + 1];
      const next = idx + 1 < LESSONS_PER_LEVEL ? [lv, idx + 1] : nl ? [nl, 0] : null;
      Views.result(root, { score, stars, ...r, again: `#/lesson/${lv}/${idx}`, next: next && Store.isUnlocked(next[0]) ? `#/lesson/${next[0]}/${next[1]}` : null, nextLabel: next ? `Level ${next[0]} ${dayLabel(next[1])}` : '' });
      App.refreshHeader();
    },
  });
};
Views.result = (root, { score, correct, total, again, next, nextLabel, sample, stars: earned }) => {
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;
  root.innerHTML = `<div class="result card anim-in">
    <div class="stamp">${score >= 70 ? '참<br>잘했어요' : '노력<br>했어요'}</div>
    <div class="stars">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}" style="animation-delay:${k * 0.2}s">★</span>`).join('')}</div>
    <h2>${correct} / ${total} 정답 · ${score}%</h2>
    <p>${sample ? '샘플 레슨은 기록되지 않아요. 시작하면 진도와 별이 저장돼요!' : `⭐ 별 ${earned || 0}개를 받았어요! ${score >= 90 ? '완벽해요 🌟' : '틀린 문제는 오답노트에 저장했어요.'}`}</p>
    <div class="row-center">
      <a class="btn btn-ghost" href="${again}" data-again>다시 하기</a>
      ${sample ? '<a class="btn btn-primary" href="#/signup">7일 무료로 계속하기</a>' : `<a class="btn btn-ghost" href="#/study">모험 지도</a>${next ? `<a class="btn btn-primary" href="${next}">다음: ${nextLabel} ▶</a>` : ''}`}
    </div></div>`;
  const a = $('[data-again]', root);
  if (location.hash === again) a.onclick = e => { e.preventDefault(); App.route(); };
  Speech.sfx.cheer(); if (score >= 70) Lesson.confetti();
};

/* ---------- AI 말하기 ---------- */
Views.speak = el => {
  const p = Store.profile(), cur = Store.isAdmin() ? 'Z' : Store.currentLevel();
  const pool = ALL_LEVELS.slice(0, ALL_LEVELS.indexOf(cur) + 1).flatMap(lv => Gen.levelItems(lv).flatMap(it => it.letter ? it.words.map(([w]) => letterLine(it, w)) : [it.a || it.en]));
  const recent = p.speaking.slice(0, 8);
  const avg = recent.length ? Math.round(recent.reduce((s, x) => s + x.score, 0) / recent.length) : null;
  el.innerHTML = `<div class="wrap sec narrow">
    <h1 class="page-title">🎤 AI 말하기</h1>
    ${UI.mascot('배운 문장 중에서 골랐어! 초록=정확, 노랑=비슷, 빨강=다시 들어보기야. 80점 넘으면 별을 줄게 ⭐')}
    <div class="card speak-demo" id="sw"></div>
    <h2 class="sec-sub">최근 기록 ${avg !== null ? `<small>평균 ${avg}점</small>` : ''}</h2>
    <div id="hist">${recent.length ? `<ul class="hist">${recent.map(r => `<li><span>${esc(r.text)}</span><b class="score-pill small ${scoreClass(r.score)}">${r.score}</b></li>`).join('')}</ul>` : UI.empty('🎙️', '아직 말하기 기록이 없어요.')}</div>
  </div>`;
  Views.speakWidget($('#sw', el), shuffle(pool));
};

/* ---------- 스토리북 ---------- */
Views.stories = el => {
  const p = Store.profile();
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">📖 스토리북</h1>
    <p class="sec-desc left">낭독을 들으며 단어를 따라 읽어요. 처음 읽은 책마다 도장과 ⭐2개!</p>
    <div class="book-grid">${STORIES.map(s => { const open = Store.isUnlocked(STAGES[s.stage - 1].levels[0]); return `
      <a class="book ${open ? '' : 'locked'}" href="${open ? `#/story/${s.id}` : '#/stories'}" style="--c:${STAGES[s.stage - 1].color}">
        <span class="cover">${open ? s.cover : '🔒'}</span><b>${esc(s.title)}</b><small>섬 ${s.stage} ${p.stories[s.id] ? `· ${p.stories[s.id]}번 읽음 ✅` : ''}</small></a>`; }).join('')}</div>
  </div>`;
  $$('.book.locked', el).forEach(b => b.onclick = e => { e.preventDefault(); App.toast('그 섬에 도착하면 열려요 🔒'); });
};
Views.story = (el, id) => {
  const s = STORIES.find(x => x.id === id); if (!s) return (location.hash = '#/stories');
  if (!Store.isUnlocked(STAGES[s.stage - 1].levels[0])) { App.toast('그 섬에 도착하면 열려요 🔒'); return (location.hash = '#/stories'); }
  let pg = 0, auto = false; const t0 = Date.now();
  el.innerHTML = `<div class="wrap sec narrow">
    <a class="link-btn" href="#/stories">← 스토리북 목록</a>
    <div class="reader card" style="--c:${STAGES[s.stage - 1].color}">
      <div class="reader-title">${esc(s.title)}</div>
      <div class="reader-page"></div>
      <div class="reader-ctrl">
        <button class="icon-btn big" data-prev aria-label="이전 쪽">◀</button>
        <button class="btn btn-ghost" data-read>🔊 읽어주기</button>
        <button class="btn btn-ghost" data-auto>▶ 자동 넘김</button>
        <button class="icon-btn big" data-nextp aria-label="다음 쪽">▶</button>
      </div>
      <div class="reader-dots"></div>
    </div></div>`;
  const page = $('.reader-page', el);
  const draw = () => {
    if (pg >= s.pages.length) {
      const first = Store.readStory(s.id); Store.addMinutes((Date.now() - t0) / 1000); auto = false;
      page.innerHTML = `<div class="the-end anim-in"><div class="pic">🎉</div><h2>The End</h2><p>${first ? '첫 완독! 도장과 ⭐2개를 받았어요!' : '또 읽었어요! 정말 잘했어요.'}</p>
        <div class="row-center"><button class="btn btn-ghost" data-restart>처음부터</button><a class="btn btn-primary" href="#/stories">다른 책</a></div></div>`;
      $('[data-restart]', page).onclick = () => { pg = 0; draw(); };
      Speech.sfx.cheer(); if (first) Lesson.confetti(); App.refreshHeader(); return;
    }
    const [text, pic] = s.pages[pg];
    page.innerHTML = `<div class="anim-in"><div class="pic">${pic}</div><p class="reader-text">${text.split(' ').map((w, k) => `<span data-k="${k}" data-say="${esc(w.replace(/[.,!?]/g, ''))}">${esc(w)}</span>`).join(' ')}</p></div>`;
    $$('.reader-text span', page).forEach(sp => sp.onclick = () => { sp.classList.add('hl'); Speech.speak(sp.dataset.say, { onEnd: () => sp.classList.remove('hl') }); });
    $('.reader-dots', el).innerHTML = s.pages.map((_, k) => `<i class="${k === pg ? 'on' : ''}"></i>`).join('');
    $('[data-prev]', el).disabled = pg === 0;
    if (auto) read();
  };
  const read = () => {
    const [text] = s.pages[pg]; const spans = $$('.reader-text span', page);
    let offset = 0; const starts = text.split(' ').map(w => { const o = offset; offset += w.length + 1; return o; });
    Speech.speak(text, {
      onBoundary: ci => { const k = starts.filter(x => x <= ci).length - 1; spans.forEach((sp, j) => sp.classList.toggle('hl', j === k)); },
      onEnd: () => { spans.forEach(sp => sp.classList.remove('hl')); if (auto && document.body.contains(page)) setTimeout(() => { if (auto) { pg++; draw(); } }, 700); },
    });
  };
  $('[data-read]', el).onclick = read;
  $('[data-auto]', el).onclick = e => { auto = !auto; e.target.textContent = auto ? '⏸ 멈추기' : '▶ 자동 넘김'; if (auto) read(); else Speech.stop(); };
  $('[data-prev]', el).onclick = () => { if (pg > 0) { Speech.stop(); pg--; draw(); } };
  $('[data-nextp]', el).onclick = () => { Speech.stop(); pg++; draw(); };
  draw();
};

/* ---------- 레벨 테스트 ---------- */
Views.leveltest = el => {
  const p = Store.profile();
  el.innerHTML = `<div class="wrap sec narrow"><div class="card intro center">
    <div class="auth-logo">🧪</div><h1>우리 아이 출발 섬 찾기</h1>
    <p>${LEVEL_TEST.length}문항 · 약 3분. 소리가 나오니 볼륨을 켜 주세요.</p>
    <button class="btn btn-primary lg" data-start>테스트 시작</button>
    ${p ? '' : '<p class="fine">로그인 없이도 볼 수 있어요. 결과를 학습에 반영하려면 프로필이 필요해요.</p>'}</div></div>`;
  $('[data-start]', el).onclick = () => {
    const qs = LEVEL_TEST.map((t, k) => ({ type: 'choice', key: 'lt' + k, title: t.q, answer: t.answer, options: shuffle(t.options), say: t.say, big: t.type === 'listen' ? '🔊' : null, stage: t.stage }));
    el.innerHTML = '<div class="wrap lesson-wrap"></div>';
    const root = $('.lesson-wrap', el);
    const answers = [];
    const orig = Lesson.renderers.choice;
    Lesson.renderers.choice = (box, q, done) => orig(box, q, (ok, qq, d) => { answers.push({ stage: qq.stage, ok }); done(ok, qq, d); });
    Lesson.run(root, qs, {
      title: '레벨 테스트',
      onExit: () => { Lesson.renderers.choice = orig; location.hash = p ? '#/study' : '#/'; },
      onDone: r => {
        Lesson.renderers.choice = orig;
        // 각 stage를 절반 이상 맞히면 통과, 처음 막힌 stage에서 시작
        let stage = 1;
        for (const s of STAGES) {
          const got = answers.filter(a => a.stage === s.id); if (!got.length) continue;
          if (got.filter(a => a.ok).length / got.length >= 0.5) stage = Math.min(8, s.id + 1); else break;
        }
        const start = STAGES[stage - 1].levels[0];
        root.innerHTML = `<div class="result card anim-in"><div class="stamp">추천<br>섬 ${stage}</div>
          <h2>${r.correct} / ${r.total} 정답</h2><p>추천 출발 레벨은 <b>Level ${start}</b> (${STAGES[stage - 1].title}섬)이에요.<br>${STAGES[stage - 1].desc}</p>
          <div class="row-center">${p ? `<button class="btn btn-ghost" data-keep>지금 레벨 유지</button><button class="btn btn-primary" data-apply>Level ${start}부터 시작</button>` : '<a class="btn btn-primary" href="#/signup">가입하고 이 레벨로 시작</a>'}</div></div>`;
        Speech.sfx.cheer(); Lesson.confetti();
        if (p) {
          $('[data-apply]', root).onclick = () => { Store.updateProfile({ startLevel: start, placed: true }); App.toast(`Level ${start}부터 출발!`); location.hash = '#/study'; };
          $('[data-keep]', root).onclick = () => { Store.updateProfile({ placed: true }); location.hash = '#/study'; };
        }
      },
    });
  };
};

/* ---------- 오답노트 ---------- */
Views.wrong = el => {
  const p = Store.profile();
  el.innerHTML = `<div class="wrap sec narrow">
    <h1 class="page-title">🔁 오답노트</h1>
    ${p.wrong.length ? `<p class="sec-desc left">틀린 문제 ${p.wrong.length}개. 다시 풀어 맞히면 졸업해요!</p>
      <button class="btn btn-primary lg" data-go>${Math.min(8, p.wrong.length)}문제 복습하기</button>
      <ul class="wrong-list">${p.wrong.map(w => `<li><span class="chip">${esc(w.q.title)}</span> <b>${esc(w.q.show || (w.q.say ? '🔊 ' + w.q.say : ''))}</b> → ${esc(w.q.type === 'tiles' ? w.q.answer.join(w.q.joiner) : w.q.answer)}</li>`).join('')}</ul>`
      : UI.empty('🎉', '오답노트가 비어 있어요. 모두 맞혔어요!', '<a class="btn btn-primary" href="#/study">모험하러 가기</a>')}
  </div>`;
  const go = $('[data-go]', el);
  if (go) go.onclick = () => {
    const qs = p.wrong.slice(0, 8).map(w => ({ ...w.q, options: w.q.options ? shuffle(w.q.options) : undefined, tiles: w.q.tiles ? shuffle(w.q.tiles) : undefined }));
    el.innerHTML = '<div class="wrap lesson-wrap"></div>';
    const root = $('.lesson-wrap', el);
    const results = [];
    const wrap = name => { const o = Lesson.renderers[name]; Lesson.renderers[name] = (b, q, d) => o(b, q, (ok, qq, x) => { results.push({ key: qq.key, ok }); d(ok, qq, x); }); return () => (Lesson.renderers[name] = o); };
    const undo = [wrap('choice'), wrap('tiles')];
    const restore = () => undo.forEach(f => f());
    Lesson.run(root, qs, {
      title: '오답 복습', onExit: () => { restore(); location.hash = '#/wrong'; },
      onDone: r => {
        restore();
        const solved = results.filter(x => x.ok); solved.forEach(x => Store.clearWrong(x.key));
        Store.addMinutes(r.seconds);
        const got = Store.addStars(solved.length ? 1 : 0, 'review', 3);
        Views.result(root, { score: Math.round(r.correct / r.total * 100), ...r, stars: got, again: '#/wrong', next: null });
        $('p', root).textContent = `${solved.length}문제가 오답노트에서 졸업했어요!${got ? ' ⭐ +1' : ''}`;
      },
    });
  };
};

/* ---------- 별 상점 / 스티커북 ---------- */
Views.shop = el => {
  const p = Store.profile();
  const draw = () => {
    el.innerHTML = `<div class="wrap sec">
      <h1 class="page-title">🛍️ 별 상점</h1>
      <div class="two-col top">
        <div class="card star-bank"><div class="avatar-show">${avatarHtml(p, 'huge')}</div><b class="star-count">⭐ ${p.stars || 0}</b><p>${esc(p.name)}가 모은 별</p></div>
        <div class="card"><h3>별은 이렇게 모아요</h3>${UI.starsInfo()}</div>
      </div>
      <h2 class="sec-sub">아바타 꾸미기</h2>
      <div class="shop-grid">${SHOP.filter(i => i.kind === 'acc').map(item).join('')}</div>
      <h2 class="sec-sub">스티커</h2>
      <div class="shop-grid">${SHOP.filter(i => i.kind === 'sticker').map(item).join('')}</div>
      <h2 class="sec-sub">📒 내 스티커북 <small>${p.owned.filter(id => id.startsWith('st-')).length}/${SHOP.filter(i => i.kind === 'sticker').length}</small></h2>
      <div class="sticker-book">${SHOP.filter(i => i.kind === 'sticker').map(i => `<span class="slot ${p.owned.includes(i.id) ? 'got' : ''}" title="${i.name}">${p.owned.includes(i.id) ? i.emoji : '?'}</span>`).join('')}</div>
    </div>`;
    $$('[data-buy]', el).forEach(b => b.onclick = () => {
      try { if (Store.buy(b.dataset.buy)) { Speech.sfx.cheer(); Lesson.confetti(); App.toast('새 아이템을 얻었어요! 🎉'); draw(); App.refreshHeader(); } }
      catch (x) { Speech.sfx.wrong(); App.toast(x.message); }
    });
    $$('[data-equip]', el).forEach(b => b.onclick = () => { Store.equip(b.dataset.equip); draw(); });
  };
  const item = i => {
    const own = p.owned.includes(i.id), on = p.acc === i.id;
    return `<div class="shop-item ${own ? 'own' : ''}"><span class="si-emoji">${i.emoji}</span><b>${i.name}</b>
      ${own ? (i.kind === 'acc' ? `<button class="btn btn-ghost sm" data-equip="${i.id}">${on ? '벗기' : '착용'}</button>` : '<span class="chip">모음 ✅</span>') : `<button class="btn btn-primary sm" data-buy="${i.id}" ${p.stars < i.cost ? 'aria-disabled="true"' : ''}>⭐ ${i.cost}</button>`}</div>`;
  };
  draw();
};

/* ---------- 놀이터 (미니게임) ---------- */
Views.play = (el, game) => {
  const p = Store.profile();
  // 아이가 이미 배운 범위의 그림 단어만 쓴다 (관리자는 전체)
  const reach = Store.isAdmin() ? 99 : ALL_LEVELS.indexOf(Store.currentLevel()) + 1;
  const pool = reach <= 2 ? PICTURE_WORDS.filter(w => LETTERS.some(l => l.word === w.en)) : PICTURE_WORDS;
  if (!game) {
    el.innerHTML = `<div class="wrap sec">
      <h1 class="page-title">🎈 놀이터</h1>
      ${UI.mascot('레슨이 지루할 땐 게임으로 단어를 익혀요! 게임마다 별을 줄게 (하루 6개까지)')}
      <div class="game-grid">
        <a class="game-card" href="#/play/balloon" style="--c:#ff7aa8"><span>🎈</span><b>풍선 팡팡</b><small>소리를 듣고 맞는 풍선을 터뜨려요</small><em>최고 ${(p.games || {}).balloon || 0}점</em></a>
        <a class="game-card" href="#/play/match" style="--c:#7c5cff"><span>🃏</span><b>짝꿍 카드</b><small>그림과 단어 짝을 찾아요</small><em>최고 ${(p.games || {}).match || 0}점</em></a>
      </div></div>`;
    return;
  }
  const finish = (name, score, max, extra = '') => {
    const r = Store.gameResult(name, score);
    el.querySelector('.game-area').innerHTML = `<div class="result card anim-in"><div class="stamp">${score}<br>점</div><h2>${r.newBest ? '🏆 최고 기록!' : '잘했어요!'}</h2>
      <p>${score} / ${max}점 ${extra} · ${r.got ? `⭐ ${r.got}개 획득!` : '오늘 게임 별은 다 받았어요'}</p>
      <div class="row-center"><a class="btn btn-ghost" href="#/play">놀이터</a><button class="btn btn-primary" data-again>한 번 더</button></div></div>`;
    el.querySelector('[data-again]').onclick = () => Views.play(el, name);
    Speech.sfx.cheer(); if (score >= max / 2) Lesson.confetti(); App.refreshHeader();
  };
  el.innerHTML = `<div class="wrap sec narrow"><a class="link-btn" href="#/play">← 놀이터</a><div class="game-area"></div></div>`;
  const area = $('.game-area', el);

  if (game === 'balloon') {
    let round = 0, score = 0; const ROUNDS = 10;
    const colors = ['#ff7aa8', '#ffd23f', '#5cc8ff', '#7ed957', '#b388ff'];
    const next = () => {
      if (round >= ROUNDS) return finish('balloon', score, ROUNDS);
      const answer = pool[Math.floor(Math.random() * pool.length)];
      const opts = shuffle([answer, ...pickOthers(pool, 3, answer)]);
      area.innerHTML = `<div class="game-head"><span>🎈 ${round + 1}/${ROUNDS}</span><span>⭐ ${score}</span><button class="btn btn-ghost sm" data-say>🔊 다시 듣기</button></div>
        <div class="sky">${opts.map((o, k) => `<button class="balloon" style="--c:${colors[k % 5]};--d:${k * 0.25}s;--x:${k * 25 + 4}%" data-en="${esc(o.en)}"><span>${o.emoji}</span><small>${esc(o.en)}</small></button>`).join('')}</div>`;
      Speech.speak(answer.en);
      $('[data-say]', area).onclick = () => Speech.speak(answer.en);
      let tried = false;
      $$('.balloon', area).forEach(b => b.onclick = () => {
        if (b.dataset.en === answer.en) {
          if (!tried) score++;
          b.classList.add('pop'); Speech.sfx.correct(); round++; setTimeout(next, 550);
        } else { tried = true; b.classList.add('nope'); Speech.sfx.wrong(); setTimeout(() => b.classList.remove('nope'), 400); }
      });
    };
    next();
  }

  if (game === 'match') {
    const picks = shuffle(pool).slice(0, 6);
    const cards = shuffle(picks.flatMap(w => [{ id: w.en, face: w.emoji, kind: 'pic' }, { id: w.en, face: w.en, kind: 'word' }]));
    let open = [], found = 0, moves = 0, lock = false;
    area.innerHTML = `<div class="game-head"><span>🃏 짝꿍 카드</span><span class="moves">시도 0</span></div>
      <div class="memory">${cards.map((c, k) => `<button class="mcard ${c.kind}" data-k="${k}" aria-label="카드 ${k + 1}"><span class="back">🌱</span><span class="front">${esc(c.face)}</span></button>`).join('')}</div>`;
    $$('.mcard', area).forEach(b => b.onclick = () => {
      const k = +b.dataset.k;
      if (lock || b.classList.contains('flip')) return;
      b.classList.add('flip'); open.push(k); Speech.sfx.tap();
      if (cards[k].kind === 'word') Speech.speak(cards[k].id);
      if (open.length < 2) return;
      moves++; $('.moves', area).textContent = `시도 ${moves}`;
      const [a, c] = open; open = [];
      if (cards[a].id === cards[c].id && a !== c) {
        found++; Speech.sfx.correct(); Speech.speak(cards[a].id);
        $$(`.mcard[data-k="${a}"], .mcard[data-k="${c}"]`, area).forEach(x => x.classList.add('matched'));
        if (found === picks.length) setTimeout(() => finish('match', Math.max(1, 10 - Math.max(0, moves - 6)), 10, `· ${moves}번 만에 성공`), 600);
      } else {
        lock = true;
        setTimeout(() => { $$(`.mcard[data-k="${a}"], .mcard[data-k="${c}"]`, area).forEach(x => x.classList.remove('flip')); lock = false; }, 900);
      }
    });
  }
};

/* ---------- 워크시트 (인쇄용) ---------- */
Views.worksheet = (el, lv) => {
  if (!ALL_LEVELS.includes(lv)) return (location.hash = '#/study');
  const s = stageOf(lv), items = Gen.levelItems(lv).slice(0, 6), p = Store.profile();
  const trace = items.map(it => it.letter ? `${it.letter} ${it.letter.toLowerCase()} ${it.word}` : it.en ? it.en.replace(/[.?!]/g, '') : it.a);
  const pics = items.filter(it => it.emoji).slice(0, 5);
  const sentences = items.map(it => it.en || it.a).filter(x => x && x.includes(' ')).slice(0, 3);
  el.innerHTML = `<div class="wrap sec narrow worksheet-wrap">
    <div class="no-print row"><a class="link-btn" href="#/study">← 모험 지도</a><button class="btn btn-primary" data-print>🖨️ 인쇄 / PDF 저장</button></div>
    <article class="worksheet">
      <header><b>🌱 새싹영어 워크시트</b><span>Level ${lv} · ${s.title}섬</span><span>이름: ${p ? esc(p.name) : '________'} &nbsp; 날짜: ________</span></header>
      <h3>1. 따라 써 보세요</h3>
      ${trace.map(t => `<div class="ws-trace"><span class="dotted">${esc(t)}</span><span class="line"></span></div>`).join('')}
      ${pics.length >= 3 ? `<h3>2. 그림과 단어를 선으로 이어요</h3><div class="ws-match"><div>${pics.map(it => `<span>${it.emoji} ●</span>`).join('')}</div><div>${shuffle(pics).map(it => `<span>● ${esc(it.word || it.en)}</span>`).join('')}</div></div>` : ''}
      ${sentences.length ? `<h3>${pics.length >= 3 ? 3 : 2}. 단어를 바르게 늘어놓아 문장을 써요</h3>${sentences.map(t => `<div class="ws-order"><span>${shuffle(words(t)).map(esc).join(' / ')}</span><span class="line"></span></div>`).join('')}` : ''}
      <footer>참 잘했어요! 스티커를 붙여요 → ☐</footer>
    </article></div>`;
  $('[data-print]', el).onclick = () => { if (Store.user()) Store.markWorksheet(lv); window.print(); };
};

/* ---------- 부모페이지 ---------- */
Views.parent = (el, tab) => {
  const u = Store.user();
  if (u.settings.pin && !App.pinOk && !Store.isAdmin()) {
    el.innerHTML = `<div class="wrap sec narrow"><form class="card auth-card center"><div class="auth-logo">🔐</div><h1>부모페이지</h1><p>보호자 PIN 4자리를 입력해 주세요.</p>
      <input class="pin" name="pin" inputmode="numeric" maxlength="4" autocomplete="off" aria-label="PIN"><p class="form-err" role="alert"></p><button class="btn btn-primary full">확인</button></form></div>`;
    const f = $('form', el); f.pin.focus();
    f.onsubmit = async e => { e.preventDefault(); if (await Store.hash(f.pin.value) === u.settings.pin) { App.pinOk = true; Views.parent(el, tab); } else { $('.form-err', el).textContent = 'PIN이 맞지 않아요.'; f.pin.value = ''; } };
    return;
  }
  const tabs = { report: '📊 리포트', alerts: '🔔 학습알림', member: '🧾 멤버십', coupons: '🎟️ 쿠폰함', worksheets: '🖨️ 워크시트', settings: '⚙️ 설정' };
  tab = tabs[tab] ? tab : 'report';
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">부모페이지 <small>${esc(u.parentName)}님 · ${u.providers.map(x => ({ email: '이메일', kakao: '카카오', naver: '네이버', google: 'Google', apple: 'Apple' }[x])).join(', ')} 로그인</small></h1>
    <nav class="tabs">${Object.entries(tabs).map(([k, v]) => `<a href="#/parent/${k}" class="${k === tab ? 'on' : ''}">${v}${k === 'alerts' && u.notifications.some(n => !n.read) ? ' <i class="dot"></i>' : ''}</a>`).join('')}</nav>
    <div class="tab-body"></div></div>`;
  ParentTabs[tab]($('.tab-body', el), u);
};

const ParentTabs = {
  report(el, u) {
    if (!u.profiles.length) { el.innerHTML = UI.empty('👶', '아직 아이 프로필이 없어요.', '<a class="btn btn-primary" href="#/profiles">프로필 만들기</a>'); return; }
    let p = Store.profile() || u.profiles[0];
    const draw = () => {
      const days = [...Array(7)].map((_, k) => { const d = new Date(); d.setDate(d.getDate() - 6 + k); return Store.today(d); });
      const mins = days.map(d => p.minutes[d] || 0), maxM = Math.max(10, ...mins);
      const lessons = ALL_LEVELS.reduce((s, lv) => s + Store.lessonsDone(lv, p), 0);
      const acc = p.stats.answered ? Math.round(p.stats.correct / p.stats.answered * 100) : 0;
      const sp = p.speaking.slice(0, 20); const spAvg = sp.length ? Math.round(sp.reduce((s, x) => s + x.score, 0) / sp.length) : '-';
      const now = new Date(), y = now.getFullYear(), m = now.getMonth(), first = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate();
      el.innerHTML = `
        ${u.profiles.length > 1 ? `<div class="chips">${u.profiles.map(x => `<button class="chip ${x.id === p.id ? 'on' : ''}" data-pid="${x.id}">${x.avatar} ${esc(x.name)}</button>`).join('')}</div>` : ''}
        <div class="kpis">
          <div class="kpi"><small>연속 학습일</small><b>${Store.streak(p)}일</b></div>
          <div class="kpi"><small>이번 주 학습</small><b>${mins.reduce((a, b) => a + b, 0)}분</b></div>
          <div class="kpi"><small>완료 레슨</small><b>${lessons}개</b></div>
          <div class="kpi"><small>정답률</small><b>${acc}%</b></div>
          <div class="kpi"><small>평균 발음</small><b>${spAvg}${sp.length ? '점' : ''}</b></div>
          <div class="kpi"><small>모은 별</small><b>⭐${p.stars || 0}</b></div>
        </div>
        <div class="two-col top">
          <div class="card"><h3>최근 7일 학습 시간</h3><div class="bars">${days.map((d, k) => `<div class="bar-col"><span class="bv">${mins[k] || ''}</span><i style="height:${mins[k] / maxM * 100}%"></i><small>${['일', '월', '화', '수', '목', '금', '토'][new Date(d).getDay()]}</small></div>`).join('')}</div></div>
          <div class="card"><h3>${m + 1}월 학습 도장</h3><div class="cal">${['일', '월', '화', '수', '목', '금', '토'].map(w => `<b>${w}</b>`).join('')}${'<span></span>'.repeat(first)}${[...Array(dim)].map((_, k) => { const d = Store.today(new Date(y, m, k + 1)); const n = p.stamps[d] || 0; return `<span class="${n ? 'stamped' : ''} ${d === Store.today() ? 'today' : ''}" title="${n}개">${n ? '🌱' : k + 1}</span>`; }).join('')}</div></div>
        </div>
        <div class="card"><h3>섬별 진도 <small>(출발 레벨 ${p.startLevel} · 난이도 ${{ auto: '자동', easy: '쉬움', normal: '보통', hard: '도전' }[p.difficulty || 'auto']})</small></h3>${STAGES.map(s => { const done = s.levels.reduce((a, lv) => a + Store.lessonsDone(lv, p), 0), tot = s.levels.length * LESSONS_PER_LEVEL; return `<div class="prog-row"><span>섬${s.id} ${s.title}</span><div class="rb-bar"><i style="width:${done / tot * 100}%;background:${s.color}"></i></div><small>${done}/${tot}</small></div>`; }).join('')}</div>
        <div class="two-col top">
          <div class="card"><h3>보충이 필요한 내용</h3>${p.wrong.length ? `<ul class="wrong-list small">${p.wrong.slice(0, 8).map(w => `<li>${esc(w.q.show || (w.q.say ? '🔊 ' + w.q.say : w.q.title))} → <b>${esc(w.q.type === 'tiles' ? w.q.answer.join(w.q.joiner) : w.q.answer)}</b></li>`).join('')}</ul>` : '<p>틀린 문제가 없어요 👏</p>'}</div>
          <div class="card"><h3>최근 말하기</h3>${sp.length ? `<ul class="hist">${sp.slice(0, 6).map(r => `<li><span>${esc(r.text)}</span><b class="score-pill small ${scoreClass(r.score)}">${r.score}</b></li>`).join('')}</ul>` : '<p>아직 기록이 없어요.</p>'}</div>
        </div>`;
      $$('[data-pid]', el).forEach(b => b.onclick = () => { p = u.profiles.find(x => x.id === b.dataset.pid); draw(); });
    };
    draw();
  },
  alerts(el, u) {
    el.innerHTML = `<div class="card"><div class="sw-head"><h3>학습알림 ${u.notifications.length}건</h3></div>
      <p class="fine">카톡 연동 없이 여기에서 모든 알림을 볼 수 있어요. 브라우저 알림은 설정 탭에서 켜요.</p>
      ${u.notifications.length ? `<ul class="noti-list">${u.notifications.map(n => `<li class="${n.read ? '' : 'unread'}"><p>${esc(n.text)}</p><small>${fmtDate(n.at)}</small></li>`).join('')}</ul>` : UI.empty('🔕', '아직 알림이 없어요.')}</div>`;
    Store.markAllRead(); App.refreshHeader();
  },
  member(el, u) {
    const a = Store.access(), m = u.membership;
    el.innerHTML = `<div class="card status-card">${statusText(a, u)}</div>
      ${m ? `<div class="card sub-card"><h3>내 구독</h3><dl class="summary">
        <dt>상품</dt><dd>${m.kids === 'two' ? '두 자녀' : '한 자녀'} ${m.months}개월${m.granted ? ' (관리자 지급)' : ''}</dd>
        <dt>이용 기간</dt><dd>${fmtDay(m.since)} ~ ${fmtDay(m.until)}</dd>
        <dt>자동갱신</dt><dd>${m.autoRenew ? `켜짐 · 다음 결제 ${fmtDay(m.until)} · ${won(m.monthly * m.months)}` : '해지됨 (추가 결제 없음)'}</dd>
        ${m.card ? '<dt>결제수단</dt><dd>등록된 카드 (토스페이먼츠)</dd>' : ''}</dl>
        <div class="row">${m.granted ? '' : m.autoRenew ? '<button class="btn btn-ghost" data-renew="0">🛑 자동갱신 해지</button>' : '<button class="btn btn-ghost" data-renew="1">🔁 자동갱신 다시 켜기</button>'}
        ${Store.canRefund() ? '<button class="btn btn-ghost danger" data-refund>↩️ 환불 신청 (결제 7일 이내)</button>' : ''}</div></div>` : ''}
      <div class="card"><h3>결제 내역</h3>${u.payments.length ? `<table class="table"><thead><tr><th>날짜</th><th>내용</th><th>쿠폰</th><th>금액</th><th>상태</th></tr></thead><tbody>${u.payments.map(p => `<tr><td>${fmtDay(p.at)}</td><td>${esc(p.desc)}</td><td>${esc(p.coupon || '-')}</td><td>${won(p.amount)}</td><td>${p.status}</td></tr>`).join('')}</tbody></table>` : '<p class="fine">결제 내역이 없어요.</p>'}</div>
      ${m && m.kids === 'one' && u.profiles.length > 1 ? '<div class="card notice">프로필이 2개 이상이에요. 두 자녀 요금제를 쓰면 모든 아이가 계속 학습할 수 있어요.</div>' : ''}
      ${a.kind === 'admin' ? '' : UI.plans()}`;
    if (a.kind !== 'admin') UI.wirePlans($('.plans', el));
    $$('[data-renew]', el).forEach(b => b.onclick = async () => {
      if (b.dataset.renew === '0' && !confirm('자동갱신을 해지할까요? 남은 기간은 그대로 이용할 수 있어요.')) return;
      try { await Store.setAutoRenew(b.dataset.renew === '1'); App.toast(b.dataset.renew === '1' ? '자동갱신을 켰어요.' : '자동갱신을 해지했어요.'); App.route(); } catch (x) { App.toast(x.message); }
    });
    const rf = $('[data-refund]', el);
    if (rf) rf.onclick = async () => { if (confirm('멤버십을 환불할까요? 이번 결제로 늘어난 기간이 바로 줄어들어요.')) { try { await Store.refund(); App.toast('환불이 완료되었어요.'); App.route(); } catch (x) { App.toast(x.message); } } };
  },
  coupons(el, u) {
    el.innerHTML = `<div class="coupon-list">${u.coupons.map(c => { const exp = c.expires < Date.now(); return `
      <div class="coupon ${c.used || exp ? 'off' : ''}"><div class="c-rate">${c.welcome ? '최대<br>' : ''}${Math.round(c.rate * 100)}%</div><div class="c-info"><b>${esc(c.name)}</b>
      <small>${c.welcome ? '정가 기준 1개월 15~20% · 6개월 20~30% · 12개월 30~40%' : '모든 상품'}</small><small>${c.used ? '사용 완료' : exp ? '기간 만료' : `${fmtDay(c.expires)}까지 · D-${Math.ceil((c.expires - Date.now()) / 86400000)}`}</small></div></div>`; }).join('')}</div>
      <p class="fine">구매 시 할인율이 가장 높은 쿠폰 1장이 자동 적용돼요.</p><a class="btn btn-primary" href="#/pricing">요금·할인 보기</a>`;
  },
  worksheets(el, u) {
    el.innerHTML = `<div class="card"><h3>레벨별 워크시트</h3><p class="fine">눌러서 미리 보고 인쇄하거나 PDF로 저장해요. 인쇄한 날짜가 기록돼요.</p>
      <div class="ws-grid">${ALL_LEVELS.map(lv => `<a class="ws-item" href="#/worksheet/${lv}" style="--c:${stageOf(lv).color}"><b>${lv}</b><small>${u.worksheets && u.worksheets[lv] ? '🖨️ ' + fmtDay(u.worksheets[lv]) : '미인쇄'}</small></a>`).join('')}</div></div>`;
  },
  settings(el, u) {
    const p = Store.profile(), v = Speech.volume;
    el.innerHTML = `<form class="card settings">
      <h3>🔊 소리</h3>
      <label>목소리(낭독·문제) 볼륨 <input type="range" name="vvol" min="0" max="1" step="0.1" value="${v.voice}"></label>
      <label>효과음 볼륨 <input type="range" name="sfx" min="0" max="1" step="0.1" value="${v.sfx}"></label>
      <label>읽어주는 목소리 <small class="fine">(이 기기에 저장돼요)</small>
        <div class="row voice-row"><select name="voice">${voiceOptions()}</select><button type="button" class="btn btn-ghost sm" data-preview>▶ 들어보기</button></div></label>
      <p class="fine voice-help">${Speech.neuralAvailable ? '🌟 AI 자연 음성을 쓸 수 있어요. 가장 사람 같은 목소리예요.' : '★ 표시가 이 기기에서 가장 자연스러운 목소리예요. Edge 브라우저의 "Natural" 목소리나, iPhone·Mac의 설정 › 손쉬운 사용 › 읽기 및 말하기에서 받은 "고품질" 목소리가 가장 좋아요.'}</p>
      <label>읽어주기 속도<select name="rate"><option value="0.7">천천히</option><option value="0.85">보통</option><option value="1">빠르게</option></select></label>
      <h3>📚 학습</h3>
      ${p ? `<label>${esc(p.name)}의 하루 목표 레슨 수<select name="goal">${[1, 2, 3, 4, 5].map(n => `<option ${n === p.dailyGoal ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label>난이도<select name="diff">${[['auto', '자동 (정답률에 맞춰)'], ['easy', '쉬움 (보기 2개 + 힌트)'], ['normal', '보통'], ['hard', '도전 (보기 4개)']].map(([k, t]) => `<option value="${k}" ${k === (p.difficulty || 'auto') ? 'selected' : ''}>${t}</option>`).join('')}</select></label>` : ''}
      <label class="check"><input type="checkbox" name="gentle" ${u.settings.gentle !== false ? 'checked' : ''}> 아이 목소리 너그럽게 채점 (통과 점수 45점)</label>
      <h3>🔔 알림</h3>
      <label class="check"><input type="checkbox" name="notify" ${u.settings.notify ? 'checked' : ''}> 학습알림 받기</label>
      <label>매일 리마인더 시간<input type="time" name="remind" value="${u.settings.remindTime}"></label>
      <p class="fine">브라우저 알림 권한: <b data-perm>${'Notification' in window ? Notification.permission : '미지원'}</b> <button type="button" class="link-btn" data-ask>권한 요청</button> <button type="button" class="link-btn" data-test>테스트 알림</button></p>
      <h3>🔐 보안</h3>
      <label>부모페이지 PIN (숫자 4자리, 비우면 그대로)<input name="pin" inputmode="numeric" maxlength="4" placeholder="${u.settings.pin ? '설정됨 · 새 PIN 입력' : '미설정'}"></label>
      ${u.settings.pin ? '<label class="check"><input type="checkbox" name="unpin"> PIN 잠금 해제</label>' : ''}
      <button class="btn btn-primary">저장</button>
    </form>
    <div class="card"><h3>프로필 관리</h3><ul class="plain">${u.profiles.map(x => `<li>${x.avatar} ${esc(x.name)} (${x.age}살) · 출발 Level ${x.startLevel} <button class="link-btn danger" data-del="${x.id}">삭제</button></li>`).join('')}</ul><a class="btn btn-ghost" href="#/profiles">프로필 추가</a></div>
    <div class="card"><h3>데이터 · 계정</h3><p class="fine">모든 기록은 이 브라우저에만 저장돼요. 다른 기기로 옮기려면 내보내기 파일을 쓰세요.</p>
      <div class="row"><button class="btn btn-ghost" data-export>학습 기록 내보내기</button><label class="btn btn-ghost">불러오기<input type="file" accept="application/json" hidden data-import></label>
      <button class="btn btn-ghost danger" data-leave>회원 탈퇴</button></div></div>`;
    const f = $('form', el);
    f.rate.value = String(App.rate || 0.85);
    f.vvol.oninput = () => Speech.setVolume('voice', +f.vvol.value);
    f.vvol.onchange = () => Speech.speak('Hello!');
    f.voice.value = Speech.voiceChoice;
    const preview = () => Speech.speak('Hello! A is for apple. I like to read books with you.');
    f.voice.onchange = () => { Speech.setVoice(f.voice.value); preview(); };
    $('[data-preview]', el).onclick = preview;
    f.sfx.oninput = () => { Speech.setVolume('sfx', +f.sfx.value); Speech.sfx.tap(); };
    f.onsubmit = async e => {
      e.preventDefault();
      if (p) { p.dailyGoal = +f.goal.value; p.difficulty = f.diff.value; }
      App.rate = +f.rate.value; Speech.setRate(App.rate); try { localStorage.setItem('sprout-rate', App.rate); } catch (x) { /* ignore */ }
      u.settings.notify = f.notify.checked; u.settings.remindTime = f.remind.value || '19:00'; u.settings.gentle = f.gentle.checked;
      if (f.pin.value) { if (!/^\d{4}$/.test(f.pin.value)) return App.toast('PIN은 숫자 4자리예요.'); u.settings.pin = await Store.hash(f.pin.value); App.pinOk = true; }
      else if (f.unpin && f.unpin.checked) u.settings.pin = '';
      Store.persist(); App.toast('저장했어요.'); App.route();
    };
    $('[data-ask]', el).onclick = async () => { if ('Notification' in window) { await Notification.requestPermission(); $('[data-perm]', el).textContent = Notification.permission; } };
    $('[data-test]', el).onclick = () => { Store.notify('🔔 테스트 알림이에요. 알림이 잘 오고 있어요!', 'test', true); App.toast('학습알림 탭에 기록했어요.'); };
    if (API.on) $('[data-export]', el).insertAdjacentHTML('afterend', '<span class="fine">학습 기록은 서버에 자동 저장돼요.</span>');
    $$('[data-del]', el).forEach(b => b.onclick = () => { const x = u.profiles.find(q => q.id === b.dataset.del); if (confirm(`${x.name} 프로필과 학습 기록을 삭제할까요? 되돌릴 수 없어요.`)) { Store.removeProfile(x.id); App.refreshHeader(); App.route(); } });
    $('[data-export]', el).onclick = () => App.download(`sprout-english-${Store.today()}.json`, Store.exportData());
    $('[data-import]', el).onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      try { Store.importData(await file.text()); App.toast('불러오기 완료!'); App.refreshHeader(); App.route(); } catch (x) { App.toast(x.message); }
    };
    $('[data-leave]', el).onclick = async () => { if (prompt('탈퇴하면 모든 학습 기록이 삭제돼요. 계속하려면 "탈퇴"를 입력하세요.') === '탈퇴') { try { await Store.deleteAccount(); } catch (x) { return App.toast(x.message); } App.refreshHeader(); location.hash = '#/'; App.toast('탈퇴했어요. 그동안 고마웠어요.'); } };
  },
};

/* ---------- 관리자 콘솔 ---------- */
Views.admin = async (el, tab) => {
  const tabs = { users: '👥 회원', reviews: '💬 후기', content: '📚 콘텐츠', system: '🖥️ 시스템' };
  tab = tabs[tab] ? tab : 'users';
  el.innerHTML = `<div class="wrap sec"><h1 class="page-title">🛠️ 관리자 콘솔</h1><p class="fine">불러오는 중…</p></div>`;
  let users, stats;
  try { [users, stats] = await Promise.all([Store.Admin.load(), Store.Admin.stats()]); }
  catch (x) { el.innerHTML = `<div class="wrap sec">${UI.empty('⚠️', esc(x.message))}</div>`; return; }
  const members = users.filter(u => Store.access(u).kind === 'member').length;
  const revenue = stats ? stats.revenue : users.flatMap(u => u.payments || []).filter(p => p.status === '결제완료').reduce((s, p) => s + p.amount, 0);
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">🛠️ 관리자 콘솔 <small>${API.on ? '서버 모드' : '로컬 데모 모드'}</small></h1>
    <div class="kpis">
      <div class="kpi"><small>전체 회원</small><b>${users.length}</b></div>
      <div class="kpi"><small>멤버십</small><b>${members}</b></div>
      <div class="kpi"><small>체험 중</small><b>${users.filter(u => Store.access(u).kind === 'trial').length}</b></div>
      <div class="kpi"><small>아이 프로필</small><b>${users.reduce((s, u) => s + u.profiles.length, 0)}</b></div>
      <div class="kpi"><small>결제 합계</small><b>${won(revenue)}</b></div>
      <div class="kpi"><small>후기</small><b>${Store.reviews().length}</b></div>
    </div>
    <nav class="tabs">${Object.entries(tabs).map(([k, v]) => `<a href="#/admin/${k}" class="${k === tab ? 'on' : ''}">${v}</a>`).join('')}</nav>
    <div class="tab-body"></div></div>`;
  AdminTabs[tab]($('.tab-body', el), users, stats);
};
const AdminTabs = {
  users(el, users) {
    const prov = { email: '📧', kakao: '💬', naver: 'N', google: 'G', apple: '🍎' };
    el.innerHTML = `<input class="search" type="search" placeholder="이메일·이름으로 검색" aria-label="회원 검색">
      <div class="table-wrap"><table class="table"><thead><tr><th>회원</th><th>로그인</th><th>권한</th><th>상태</th><th>아이</th><th>가입일</th><th></th></tr></thead><tbody></tbody></table></div>
      <div class="card" id="userDetail" hidden></div>`;
    const tbody = $('tbody', el);
    const draw = q => {
      const list = users.filter(u => !q || ((u.email || '') + u.parentName).toLowerCase().includes(q.toLowerCase()));
      tbody.innerHTML = list.map(u => { const a = Store.access(u); return `<tr><td><b>${esc(u.parentName)}</b><br><small>${esc(u.email || '(이메일 없음)')}</small></td><td>${u.providers.map(p => prov[p] || p).join(' ')}</td>
        <td>${u.role === 'admin' ? '<span class="chip on">관리자</span>' : '보호자'}</td><td>${a.kind === 'member' ? `💎 ${a.daysLeft}일` : a.kind === 'trial' ? `🎁 체험 ${a.daysLeft}일` : a.kind === 'admin' ? '전체 이용' : '⏳ 만료'}</td>
        <td>${u.profiles.map(p => p.avatar).join('') || '-'}</td><td>${fmtDay(u.createdAt)}</td><td><button class="btn btn-ghost sm" data-u="${esc(u.id)}">관리</button></td></tr>`; }).join('') || '<tr><td colspan="7">회원이 없어요.</td></tr>';
      $$('[data-u]', tbody).forEach(b => b.onclick = () => detail(b.dataset.u));
    };
    const detail = key => {
      const u = Store.Admin.get(key), box = $('#userDetail', el); if (!u) return;
      const self = key === Store.user().id;
      box.hidden = false;
      box.innerHTML = `<h3>${esc(u.parentName)} <small>${esc(u.email || '')}</small></h3>
        <p class="fine">최근 로그인 ${fmtDate(u.lastLogin)} · 결제 ${u.payments.length}건 · 쿠폰 ${u.coupons.filter(c => !c.used).length}장 · 아이: ${u.profiles.map(p => `${p.avatar}${esc(p.name)}(Lv ${Store.currentLevel(p)}, ⭐${p.stars || 0})`).join(', ') || '없음'}</p>
        ${u.payments.length ? `<div class="table-wrap"><table class="table"><tbody>${u.payments.slice(0, 5).map(p => `<tr><td>${fmtDay(p.at)}</td><td>${esc(p.desc)}</td><td>${won(p.amount)}</td><td>${p.status}</td></tr>`).join('')}</tbody></table></div>` : ''}
        <div class="admin-actions">
          <button class="btn btn-ghost sm" data-act="grant" data-months="1">💎 1개월 지급</button><button class="btn btn-ghost sm" data-act="grant" data-months="12">💎 12개월 지급</button>
          <button class="btn btn-ghost sm" data-act="revoke">멤버십 회수</button><button class="btn btn-ghost sm" data-act="trial">⏳ 체험 +7일</button>
          <button class="btn btn-ghost sm" data-act="coupon">🎟️ 50% 쿠폰 발급</button><button class="btn btn-ghost sm" data-act="stars">⭐ 별 +10</button>
          ${self ? '' : `<button class="btn btn-ghost sm" data-act="role">${u.role === 'admin' ? '관리자 해제' : '관리자로 지정'}</button><button class="btn btn-ghost sm danger" data-act="delete">회원 삭제</button>`}
        </div>`;
      $$('[data-act]', box).forEach(b => b.onclick = async () => {
        const act = b.dataset.act, A = Store.Admin;
        try {
          if (act === 'delete') { if (!confirm(`${u.email || u.parentName} 회원과 모든 기록을 삭제할까요? 되돌릴 수 없어요.`)) return; await A.deleteUser(key); }
          else await A.act(key, act, { months: +b.dataset.months || 1, days: 7, rate: 0.5, n: 10, role: u.role === 'admin' ? 'parent' : 'admin' });
          App.toast('처리했어요.'); App.route();
        } catch (x) { App.toast(x.message); }
      });
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    $('.search', el).oninput = e => draw(e.target.value.trim());
    draw('');
  },
  reviews(el) {
    const list = Store.reviews();
    el.innerHTML = `<div class="review-grid">${list.map(r => UI.reviewCard(r, true)).join('') || UI.empty('📝', '후기가 없어요.')}</div>`;
    $$('[data-delrev]', el).forEach(b => b.onclick = async () => { if (confirm('이 후기를 삭제할까요?')) { await Store.deleteReview(b.dataset.delrev).catch(x => App.toast(x.message)); App.route(); } });
  },
  content(el) {
    el.innerHTML = `<div class="card"><h3>레벨별 콘텐츠</h3><p class="fine">관리자는 모든 레벨·스토리·게임이 열려 있어요. 체험 레슨과 워크시트로 바로 검수하세요.</p>
      <div class="table-wrap"><table class="table"><thead><tr><th>레벨</th><th>단계</th><th>학습 항목</th><th>검수</th></tr></thead><tbody>
      ${ALL_LEVELS.map(lv => `<tr><td><span class="level-box sm" style="--c:${stageOf(lv).color}">${lv}</span></td><td>${stageOf(lv).id}. ${stageOf(lv).title}</td><td>${Gen.levelItems(lv).length}개</td>
        <td><a class="link-btn" href="#/sample/${lv}">체험</a> <a class="link-btn" href="#/worksheet/${lv}">워크시트</a></td></tr>`).join('')}</tbody></table></div></div>
      <div class="card"><h3>스토리북</h3><ul class="plain">${STORIES.map(s => `<li>${s.cover} ${esc(s.title)} (${s.stage}단계, ${s.pages.length}쪽)</li>`).join('')}</ul></div>`;
  },
  system(el, users, stats) {
    const ok = v => v ? '✅ 설정됨' : '⚠️ 미설정';
    el.innerHTML = API.on ? `
      <div class="card"><h3>서버 상태</h3><dl class="summary">
        <dt>공개 주소</dt><dd>${esc(stats.setup.publicUrl)}</dd>
        <dt>Node.js</dt><dd>${esc(stats.server.node)} · 가동 ${stats.server.uptimeMin}분 · 부하 ${stats.server.load}</dd>
        <dt>남은 메모리</dt><dd>${stats.server.freeMemMB}MB</dd><dt>DB 크기</dt><dd>${stats.server.dbSizeKB}KB</dd></dl></div>
      <div class="card"><h3>연동 설정 <small>서버의 .env에서 바꿔요</small></h3><dl class="summary">
        <dt>인증코드 메일(SMTP)</dt><dd>${ok(stats.setup.mail)}</dd>
        ${Object.entries(stats.setup.providers).map(([k, v]) => `<dt>${k} 로그인</dt><dd>${ok(v)}</dd>`).join('')}
        <dt>결제</dt><dd>${{ toss: '✅ 토스페이먼츠', demo: '🧪 데모 결제', off: '⚠️ 꺼짐' }[stats.setup.payments]}</dd>
        <dt>AI 음성</dt><dd>${stats.setup.tts.provider ? `✅ ${esc(stats.setup.tts.provider)} (${esc(stats.setup.tts.voice)}) · 저장된 음성 ${stats.setup.tts.files}개, ${stats.setup.tts.sizeKB}KB` : '⚠️ 미설정 (기기 목소리 사용)'}</dd></dl></div>
      <div class="card"><h3>데이터</h3><p class="fine">매일 새벽 자동 백업돼요 (서버 data/backups). 지금 바로 받을 수도 있어요.</p>
        <div class="row"><a class="btn btn-ghost" href="api/admin/backup">💾 DB 백업 받기</a><a class="btn btn-ghost" href="api/admin/export">📄 전체 데이터 JSON</a></div></div>`
    : `<div class="card"><h3>로컬 데모 모드</h3><p class="fine">서버 없이 실행 중이라 데이터가 이 브라우저(localStorage)에만 있어요. 서버로 실행하면 회원·결제가 서버 DB에 저장돼요. (deploy/DEPLOY.md 참고)</p>
      <div class="row"><button class="btn btn-ghost" data-export>전체 데이터 내보내기</button><button class="btn btn-ghost danger" data-reset>전체 초기화</button></div></div>`;
    if (API.on) return;
    $('[data-export]', el).onclick = () => App.download(`sprout-english-db-${Store.today()}.json`, Store.Admin.exportAll());
    $('[data-reset]', el).onclick = () => { if (prompt('모든 회원과 기록이 삭제돼요. "초기화"를 입력하세요.') === '초기화') { Store.Admin.resetAll(); App.refreshHeader(); location.hash = '#/'; App.toast('초기화했어요.'); } };
  },
};

/* ---------- 이용권 만료 ---------- */
Views.paywall = el => {
  el.innerHTML = `<div class="wrap sec narrow center"><div class="card intro">${UI.mascot('체험 기간이 끝났어! 그동안 모은 별과 기록은 그대로 있어. 다시 만나자!', '🥺')}
    <h1>무료체험이 끝났어요</h1><p>멤버십을 시작하면 바로 이어서 학습할 수 있어요. 1개월 상품도 할인돼요.</p>
    <a class="btn btn-primary lg" href="#/pricing">요금·할인 보기</a></div></div>`;
};
