/* 새싹영어 — 라우터, 헤더, 공용 동작 */
const App = (() => {
  const main = () => document.getElementById('app');
  const NAV = [['/', '🏠 홈'], ['/english', '🔤 영어'], ['/math', '🧮 수학'], ['/pricing', '💰 요금·할인'], ['/reviews', '💬 후기'], ['/help', '🙋 도움말']];
  // 하위 화면도 해당 메뉴를 켜준다
  const navOf = path => /^\/(english|study|learn|lesson|sample|speak|stor|wrong|review(?!s)|certificate|words|free|shop|play|worksheet|leveltest|profiles)/.test(path) ? '/english' : /^\/math/.test(path) ? '/math' : path;
  const next = () => encodeURIComponent(location.hash.slice(1));

  // 로그인 + 프로필 + 이용권이 필요한 화면 (관리자는 이용권 검사 통과)
  function learner(fn) {
    return (el, ...args) => {
      if (!Store.user()) return go(`/login?next=${next()}`);
      if (!Store.profile()) return go('/profiles');
      if (!Store.access().ok) return Views.paywall(el);
      fn(el, ...args);
    };
  }
  const authed = fn => (el, ...args) => Store.user() ? fn(el, ...args) : go(`/login?next=${next()}`);
  const adminOnly = fn => authed((el, ...args) => Store.isAdmin() ? fn(el, ...args) : (toast('관리자만 들어갈 수 있어요.'), go('/')));

  const routes = [
    [/^\/$/, el => Views.home(el)],
    [/^\/english$/, el => Views.english(el)],
    [/^\/study$/, (el, m, q) => Views.study(el, q)],
    [/^\/curriculum$/, () => go('/study?view=all')],
    [/^\/reviews$/, el => Views.reviews(el)],
    [/^\/pricing$/, (el, m, q) => Views.pricing(el, q)],
    [/^\/membership$/, () => go('/pricing')],
    [/^\/help$/, el => Views.help(el)],
    [/^\/(login|signup)$/, (el, m, q) => Views.auth(el, m[1], q)],
    [/^\/start$/, () => go('/signup')],
    [/^\/profiles$/, authed(el => Views.profiles(el))],
    [/^\/leveltest$/, el => Views.leveltest(el)],
    [/^\/learn$/, () => go('/study')],
    [/^\/lesson\/([A-Z])\/(\d)$/, learner((el, m) => Views.lesson(el, m[1], +m[2]))],
    [/^\/sample\/([A-Z])$/, (el, m) => sampleLesson(m[1], el)],
    [/^\/speak$/, learner(el => Views.speak(el))],
    [/^\/stories$/, learner(el => Views.stories(el))],
    [/^\/story\/(\d+)$/, learner((el, m) => Views.story(el, +m[1]))],
    [/^\/wrong$/, learner(el => Views.wrong(el))],
    [/^\/review$/, learner(el => Views.review(el))],
    [/^\/words$/, learner(el => Views.words(el))],
    [/^\/free$/, learner(el => Views.free(el))],
    [/^\/math(?:\/(\w+))?$/, (el, m) => Views.math(el, m[1])],
    [/^\/certificate\/(\d)$/, learner((el, m) => Views.certificate(el, +m[1]))],
    [/^\/shop$/, learner(el => Views.shop(el))],
    [/^\/room$/, learner(el => Views.room(el))],
    [/^\/friends$/, learner(el => Views.friends(el))],
    [/^\/play(?:\/(balloon|match|frog|fish|ox|basket))?$/, learner((el, m) => Views.play(el, m[1]))],
    [/^\/worksheet\/([A-Z])$/, authed((el, m) => Views.worksheet(el, m[1]))],
    [/^\/parent(?:\/(\w+))?$/, authed((el, m) => Views.parent(el, m[1]))],
    [/^\/admin(?:\/(\w+))?$/, adminOnly((el, m) => Views.admin(el, m[1]))],
  ];

  function go(path) { location.hash = '#' + path; }

  function route() {
    Speech.stop();
    const raw = location.hash.slice(1) || '/';
    const [path, qs] = raw.split('?');
    const q = new URLSearchParams(qs || '');
    const el = main();
    const r = routes.find(([re]) => re.test(path));
    el.className = /^\/(lesson|sample)\//.test(path) ? 'focus' : '';
    document.body.classList.toggle('in-lesson', el.className === 'focus');
    window.scrollTo(0, 0);
    if (!r) { el.innerHTML = `<div class="wrap sec center">${UI.empty('🧭', '길을 잃었어요! 페이지를 찾을 수 없어요.', '<a class="btn btn-primary" href="#/">홈으로</a>')}</div>`; return; }
    r[1](el, path.match(r[0]), q);
    refreshHeader(path);
    el.focus({ preventScroll: true });
  }

  function refreshHeader(path = (location.hash.slice(1) || '/').split('?')[0]) {
    const u = Store.user(), p = Store.profile();
    const unread = u ? u.notifications.filter(n => !n.read).length : 0;
    // 휴대폰에서는 부모페이지·로그아웃을 메뉴 줄 끝으로 옮긴다 (윗줄이 넘치지 않게)
    document.getElementById('nav').innerHTML = NAV.map(([h, t]) => `<a href="#${h}" class="${navOf(path) === h ? 'on' : ''}">${t.replace(/^(\S+) /, (m, e) => ico(e) + ' ')}</a>`).join('')
      // 휴대폰(.sm-only): 윗줄에서 뺀 별 상점·관리자·부모페이지·낮밤·로그인/로그아웃을 메뉴 안에 둔다
      + (u ? `${p ? `<a href="#/shop" class="sm-only ${path.startsWith('/shop') ? 'on' : ''}">${ico('🛍️')} 별 상점 ⭐${p.stars || 0}</a>` : ''}${Store.isAdmin() ? `<a href="#/admin" class="sm-only ${path.startsWith('/admin') ? 'on' : ''}">${ico('🛠️')} 관리자</a>` : ''}<a href="#/parent" class="sm-only ${path.startsWith('/parent') ? 'on' : ''}">${ico('👪')} 부모페이지</a>`
        : `<a href="#/login" class="sm-only">${ico('🔑')} 로그인</a>`)
      + `<button class="sm-only js-theme" type="button">${document.documentElement.dataset.theme === 'dark' ? '🌞 낮 모드' : '🌙 밤 모드'}</button>`
      + (u ? '<button class="sm-only js-logout" type="button">↪ 로그아웃</button>' : '');
    // 지금 메뉴가 옆으로 밀려 안 보이면 보이게
    const nav = document.getElementById('nav'), on = nav.querySelector('.on');
    if (on && on.offsetWidth) nav.scrollLeft = Math.max(0, on.offsetLeft - nav.offsetLeft - (nav.clientWidth - on.offsetWidth) / 2);
    if (App.fitHeader) requestAnimationFrame(App.fitHeader);
    document.getElementById('userbar').innerHTML = `
      <button class="icon-btn" id="themeBtn" aria-label="낮/밤 모드 전환" title="낮/밤 모드">${document.documentElement.dataset.theme === 'dark' ? '🌞' : '🌙'}</button>
      ${u ? `${Store.isAdmin() ? `<a class="hb-link admin-link ${path.startsWith('/admin') ? 'on' : ''}" href="#/admin">${ico('🛠️')} 관리자</a>` : ''}
        <div class="bell-wrap"><button class="icon-btn" id="bell" aria-label="알림 ${unread}개">${ico('🔔')}${unread ? `<i class="badge">${unread > 9 ? '9+' : unread}</i>` : ''}</button><div class="bell-pop" hidden></div></div>
        <a class="hb-link lg-only" href="#/parent">부모페이지</a>
        ${p ? `<a class="hdr-ava ava-link" href="#/room" aria-label="${esc(p.name)}의 미니룸 가기" title="내 미니룸">${avaFace(p.avatar)}</a><a class="btn btn-primary sm" href="#/study" aria-label="영어 학습하기">📚 <span class="lg-only">영어 학습</span> <span class="star-pill">⭐${p.stars || 0}</span></a>` : `<a class="btn btn-primary sm" href="#/profiles">프로필 만들기</a>`}
        <button class="hb-link lg-only js-logout">로그아웃</button>`
      : `<a class="hb-link login-link" href="#/login">${ico('🔑')} 로그인</a><a class="btn btn-primary sm" href="#/signup">${ico('🌱')} 무료 체험</a>`}`;
    document.getElementById('themeBtn').onclick = toggleTheme;
    document.querySelectorAll('.js-theme').forEach(b => b.onclick = () => { toggleTheme(); refreshHeader(); });
    document.querySelectorAll('.js-logout').forEach(lo => lo.onclick = async () => { await Store.logout(); App.pinOk = false; document.getElementById('mailbox').hidden = true; refreshHeader(); go('/'); });
    const bell = document.getElementById('bell');
    if (bell) bell.onclick = e => {
      e.stopPropagation();
      const pop = bell.nextElementSibling;
      pop.hidden = !pop.hidden;
      if (!pop.hidden) {
        const list = u.notifications.slice(0, 6);
        pop.innerHTML = `<b>학습알림</b>${list.length ? list.map(n => `<div class="bp-item ${n.read ? '' : 'unread'}">${esc(n.text)}<small>${fmtDate(n.at)}</small></div>`).join('') : '<p class="fine">알림이 없어요.</p>'}<a href="#/parent/alerts">전체 보기 →</a>`;
      }
    };
  }
  document.addEventListener('click', e => { const pop = document.querySelector('.bell-pop'); if (pop && !pop.hidden && !pop.contains(e.target)) pop.hidden = true; });
  document.addEventListener('store:notify', () => refreshHeader());

  function toggleTheme() {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t; Store.setTheme(t); refreshHeader();
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600);
  }

  // 서버가 없는 데모: 실제 메일 대신 화면 구석의 "데모 메일함"에 인증코드를 보여준다
  function demoMail(email, code) {
    const box = document.getElementById('mailbox');
    box.innerHTML = `<div class="mail anim-in"><button class="icon-btn" aria-label="닫기" data-x>✕</button>
      <small>📬 ${API.on ? '테스트 메일함 (메일 서버 설정 전이라 화면에 보여요)' : '데모 메일함'} · ${esc(email)}</small><b>[새싹스쿨] 인증코드</b><p>인증코드 <strong class="mail-code">${code}</strong> 를 입력해 주세요. 3분 동안 유효해요.</p></div>`;
    box.hidden = false;
    box.querySelector('[data-x]').onclick = () => { box.hidden = true; };
    clearTimeout(demoMail.t); demoMail.t = setTimeout(() => { box.hidden = true; }, CONFIG.CODE_TTL_SEC * 1000);
  }

  function modal(html) {
    const m = document.getElementById('modal');
    m.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">${html}</div>`;
    m.hidden = false;
    const close = () => { m.hidden = true; m.innerHTML = ''; document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    m.onclick = e => { if (e.target === m || e.target.closest('[data-close]')) close(); };
    document.addEventListener('keydown', onKey);
    return { el: m, close };
  }

  function download(name, text) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // 카카오톡 등 앱 안의 브라우저: 마이크가 막혀 있으니 외부 브라우저로 열도록 안내
  function inAppBanner() {
    const bar = document.getElementById('inappBanner'), ext = Speech.externalUrl();
    const why = Speech.env.inApp ? '앱 안에서 열려서' : 'iPhone에서는 Safari에서만';
    bar.innerHTML = `<span>🎤 ${why} <b>말하기(마이크)</b>가 ${Speech.env.inApp ? '안 돼요' : '돼요'}. ${Speech.env.ios ? '버튼이 안 되면 공유(⋯) › <b>Safari로 열기</b>를 눌러 주세요.' : ''}</span>
      ${ext ? `<a class="btn btn-primary sm" href="${esc(ext)}">${Speech.env.ios ? 'Safari로' : 'Chrome으로'} 열기</a>` : ''}<button class="icon-btn" aria-label="닫기" data-x>✕</button>`;
    bar.hidden = false;
    bar.querySelector('[data-x]').onclick = () => { bar.hidden = true; };
  }

  // 새싹 나무 물 주기 (하루 한 번)
  function waterTree(btn) {
    const r = Store.water(); if (!r.ok) return;
    btn.disabled = true; btn.className = 'btn btn-ghost sm'; btn.textContent = '💧 오늘 물 줬어요';
    const pic = btn.closest('.tree-card').querySelector('.tree-pic'); pic.classList.add('happy', 'splash');
    Speech.sfx.correct();
    if (r.grow) { Lesson.confetti(); toast(`🌳 새싹 나무가 '${r.grow.name}'(으)로 자랐어요!`); setTimeout(route, 1200); } else toast('💧 쑥쑥! 새싹 나무가 좋아해요 (+5점)');
  }

  // 무료 사용자가 플러스 단계를 누르면: 아이가 무료 단계에서 해낸 것을 보여 주고, 체험을 아직 안 했으면 7일 체험을, 했으면 플러스를 권한다
  function upsell() {
    const f = FREE(), a = Store.access(), p = Store.profile(), name = p ? esc(p.name) + (GEN.hasBatchim(p.name) ? '이' : '') : '아이';
    const free = STAGES.slice(0, f.n), done = p ? free.flatMap(s => s.levels).reduce((n, lv) => n + Store.lessonsDone(lv), 0) : 0;
    const next = STAGES[f.n];
    const got = done ? `<div class="upsell-got"><b>🌱 ${name}가 지금까지 해낸 것</b><p>${f.name} <b>${done}레슨</b> 완료 · ${free.map(s => s.skills.join(' · ')).join(' · ')}</p></div>` : '';
    const nextBox = `<div class="upsell-next" style="--c:${next.color}"><b>➡️ 다음은 ${next.id}단계 '${next.title}'</b><p>${next.desc}</p></div>`;
    const perks = `<ul class="perks"><li>${ico('📚')} ${f.plus} ${f.plusWhat} <b>${f.plusLessons}레슨</b></li><li>${ico('📖')} 스토리북 ${STORIES.length - f.books}권 더 (모두 ${STORIES.length}권)</li><li>${ico('🔁')} 망각 곡선 복습 · ${ico('📊')} 영역별 분석 · ${ico('🎓')} 수료증</li></ul>`;
    if (a.kind === 'free' && a.trialReady) {
      const m = modal(`<div class="upsell"><div class="auth-logo">${ico('🎁')}</div><h2>${f.plusFrom}부터는 플러스예요</h2>${got}${nextBox}
        <p>지금 <b>7일 무료 체험</b>을 시작하면 8단계까지 모든 단계와 스토리북을 써 볼 수 있어요. 카드 등록도 자동결제도 없고, 체험은 한 번만 시작할 수 있어요.</p>${perks}
        <div class="row-center"><button class="btn btn-ghost" data-close>나중에</button><button class="btn btn-primary" data-trial>🎁 7일 무료 체험 시작</button></div></div>`);
      const b = m.el.querySelector('[data-trial]');
      b.onclick = async () => {
        b.disabled = true;
        try { await Store.startTrial(); m.close(); Speech.sfx.cheer(); Lesson.confetti(); toast('🎁 7일 무료 체험이 시작됐어요! 다음 단계로 가 볼까요?'); refreshHeader(); route(); }
        catch (e) { b.disabled = false; toast(e.message || '체험을 시작하지 못했어요. 잠시 후 다시 해 주세요.'); }
      };
      return m;
    }
    const m = modal(`<div class="upsell"><div class="auth-logo">💎</div><h2>${f.plusFrom}부터는 플러스예요</h2>${got}${nextBox}
      <p>${f.range}(${f.name})는 지금처럼 <b>평생 무료</b>로 계속할 수 있어요.</p>${perks}
      <div class="row-center"><button class="btn btn-ghost" data-close>나중에</button><a class="btn btn-primary" href="#/pricing" data-close>💎 플러스 보기</a></div></div>`);
    return m;
  }

  function buy(months, subject = 'en') {
    if (!Store.user()) { toast('로그인 후 구매할 수 있어요. 처음이면 회원가입부터!'); return go('/login?next=/pricing'); }
    if (Store.isAdmin()) return toast('관리자 계정은 결제 없이 모든 기능을 쓸 수 있어요.');
    const kids = Store.kidsPlan(), q = Store.quote(kids, months, subject);
    const payMode = API.on ? API.cfg.payments : 'demo';
    // 쓸 수 있는 결제수단 (card: 토스페이먼츠 카드, kakao: 카카오페이). 데모면 데모 버튼 하나
    // 결제사 키를 넣기 전(off)에도 결제수단 버튼까지는 보여 준다 (결제사 심사: '결제하기' 버튼까지 있어야 한다). 누르면 준비 중 안내
    const preparing = payMode === 'off';
    const methods = payMode === 'demo' ? [] : preparing ? ['card', 'kakao'] : API.cfg.payMethods || (payMode === 'toss' ? ['card'] : []);
    const PAY_BTN = { card: '<button class="btn btn-primary" data-ok="card">💳 카드로 결제</button>', kakao: '<button class="btn btn-kakaopay" data-ok="kakao">카카오페이로 결제</button>' };
    // 모든 상품은 한 번만 결제하는 이용권이다 (자동갱신·정기결제 없음)
    const PAY_NOTE = { card: '🔒 카드: 토스페이먼츠 결제 화면으로 이동해요. 지금 한 번만 결제되고, 자동으로 다시 결제되지 않아요.',
      kakao: '💛 카카오페이: 카카오톡에서 한 번만 결제해요. 자동으로 다시 결제되지 않아요.' };
    const m = modal(`<h2>🧾 구매 확인</h2>
      <dl class="summary"><dt>상품</dt><dd>${SUBJECTS[subject]} 플러스 ${months}개월${kids === 'two' ? ` · 형제·자매 요금 (아이 ${Store.user().profiles.length}명)` : ''}</dd>
      <dt>이용 기간</dt><dd>결제하면 바로 시작 · ${months * 30}일 (${fmtDay(Date.now())} ~ ${fmtDay(Date.now() + months * 30 * 86400000)})</dd>
      ${q.list > planMonthly(kids, months, subject) * months ? `<dt>1개월 요금 기준</dt><dd class="strike">${won(q.list)}</dd>` : ''}
      <dt>플러스 ${months}개월</dt><dd${q.promo ? ' class="strike"' : ''}>${won(planMonthly(kids, months, subject) * months)}</dd>
      ${q.promo ? `<dt>오픈 특가</dt><dd class="hot">월 ${won(q.monthly)} × 12개월 (${promoEndText()}까지)</dd>` : ''}
      <dt>쿠폰</dt><dd>${q.promo ? '오픈 특가에는 쿠폰을 함께 쓸 수 없어요 (쿠폰은 그대로 남아요)' : q.coupon ? `${esc(q.coupon.name)} −${Math.round(q.rate * 100)}%` : '없음'}</dd>
      <dt>총 결제 금액</dt><dd class="total">${won(q.total)}</dd>
      <dt>결제 방식</dt><dd>한 번만 결제 · 자동결제 없음 · 끝나기 3일 전 알림</dd></dl>
      ${methods.length ? methods.map(k => `<p class="fine">${PAY_NOTE[k]}</p>`).join('') : '<p class="fine">⚠️ 데모 결제예요. 실제 카드 결제는 일어나지 않아요.</p>'}
      <p class="fine">한 번만 결제하는 이용권이에요. 이용 기간이 끝나도 자동으로 다시 결제되지 않고, 계속 이용하려면 이용권을 다시 구매하면 돼요. 결제 후 7일 이내이고 플러스 학습(${FREE().plusFrom} 이상 레슨, 플러스 스토리북)을 시작하지 않았으면 부모페이지에서 바로 전액 환불돼요. 플러스 학습을 시작했거나 7일이 지났으면 고객센터로 신청해 주세요. 이용을 시작한 달(30일 단위)을 빼고 남은 달만큼 환불해 드려요(예: 12개월 이용권을 5일 썼다면 1개월치를 빼고 11개월치 환불). 1개월 이용권은 이용을 시작하면 환불되지 않아요. 결제 관련 문의·이의신청은 고객센터(010-5117-1247, support@saessakschool.co.kr)로 해 주세요. 자세한 내용은 <a href="terms.html" target="_blank" rel="noopener">이용약관</a> 제5·6조에 있어요.</p>
      <label class="check pay-agree"><input type="checkbox" data-agree> (필수) 위 상품·결제·환불 안내를 확인했고, 결제 후 플러스 학습을 시작하면 청약철회(전액 환불)가 제한되는 것에 동의해요</label>
      <div class="row-center pay-buttons"><button class="btn btn-ghost" data-close>취소</button>${methods.length ? methods.map(k => PAY_BTN[k]).join('') : '<button class="btn btn-primary" data-ok="card">데모 결제하기</button>'}</div>`);
    const btns = [...m.el.querySelectorAll('[data-ok]')];
    btns.forEach(ok => ok.onclick = async () => {
      if (!m.el.querySelector('[data-agree]').checked) return toast('결제 안내를 확인하고 동의에 체크해 주세요.');
      if (preparing) return toast('결제 연동을 준비하고 있어요. 곧 결제할 수 있어요.');
      const label = ok.textContent;
      btns.forEach(b => b.disabled = true); ok.textContent = '처리 중…';
      try {
        const r = await Store.purchase({ kids, months, method: ok.dataset.ok, subject });
        if (r === 'redirect') return; // 토스·카카오페이 결제 화면으로 이동
        m.close(); Lesson.confetti(); toast('멤버십이 시작되었어요! 💎'); route();
      } catch (x) { btns.forEach(b => b.disabled = false); ok.textContent = label; toast(x.message); }
    });
  }

  function sampleLesson(lv, el = main()) {
    if (!ALL_LEVELS.includes(lv)) return go('/study?view=all');
    if (location.hash !== `#/sample/${lv}`) return go(`/sample/${lv}`);
    el.innerHTML = '<div class="wrap lesson-wrap"></div>';
    const root = el.querySelector('.lesson-wrap');
    Lesson.run(root, Gen.lesson(lv, 0, 5), { challenge: Gen.challenge(lv),
      title: `샘플 레슨 · Level ${lv}`, recordSpeech: false,
      onExit: () => go('/study?view=all'),
      onDone: r => Views.result(root, { score: Math.round(r.correct / r.total * 100), ...r, again: `#/sample/${lv}`, sample: true }),
    });
  }

  // 가입 경로: 처음 들어온 링크의 utm_source(없으면 들어온 사이트)를 30일 동안 기억했다가 가입할 때 보낸다.
  // 로그인·결제 화면에서 돌아올 때의 주소는 경로가 아니므로 빼고, 이미 기억한 경로는 덮어쓰지 않는다.
  function noteSource() {
    try {
      const q = new URLSearchParams(location.search);
      // 추천 링크(?ref=회원번호 7자리): 가입할 때 추천인 칸에 넣는다
      const refNo = /^\d{7}$/.test(q.get('ref') || '') ? q.get('ref') : '';
      if (refNo) localStorage.setItem('sprout-ref', JSON.stringify({ no: refNo, at: Date.now() }));
      const tag = q.get('utm_source') || (refNo ? 'referral' : q.get('ref')) || '';
      let ref = '';
      if (!tag && document.referrer) {
        const h = new URL(document.referrer).host;
        if (h !== location.host && !/(^|\.)(kakao\.com|kakaopay\.com|nid\.naver\.com|accounts\.google\.com|appleid\.apple\.com|tosspayments\.com|toss\.im)$/.test(h)) ref = h.replace(/^(www|m|search|l|lm)\./, '');
      }
      const s = (tag || ref).toLowerCase().replace(/[^\w.-]/g, '').slice(0, 40);
      const old = JSON.parse(localStorage.getItem('sprout-src') || 'null');
      if (s && !(old && Date.now() - old.at < 30 * 864e5)) localStorage.setItem('sprout-src', JSON.stringify({ s, at: Date.now() }));
    } catch {}
  }
  async function init() {
    noteSource();
    // 회선이 느려 오래 걸리면 빈 화면 대신 안내를 보여준다
    const root = document.getElementById('app');
    const slowNote = setTimeout(() => { root.innerHTML = '<div class="empty"><div class="empty-ico">🌱</div><p>서버에 연결하는 중이에요…</p></div>'; }, 2500);
    // 그림·음성 목록은 로그인 확인과 함께 받기 시작한다 (하나씩 기다리면 휴대폰에서 첫 화면이 늦다).
    // 늘 새로 확인한다: 새로 올린 그림·음성 대신 브라우저에 남은 옛 목록을 쓰지 않게
    const getJson = u => fetch(u, { cache: 'no-cache' }).then(r => (r.ok ? r.json() : null)).catch(() => null);
    const picsP = getJson('img/manifest.json'), voiceP = getJson('audio/manifest.json');
    await Store.init();
    if (API.on && API.cfg && API.cfg.promo) Object.assign(PROMO, API.cfg.promo); // 1년 특가 기간·금액은 서버 값
    if (API.down) {
      clearTimeout(slowNote);
      root.innerHTML = '<div class="empty"><div class="empty-ico">🌱</div><p>지금 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.</p><button class="btn btn-primary" data-retry>다시 연결하기</button></div>';
      root.querySelector('[data-retry]').onclick = () => location.reload();
      return;
    }
    // AI 음성: 미리 만든 audio/manifest.json을 먼저 쓰고, 없는 문장은 서버에 TTS 키가 있을 때 /api/tts로 만든다
    // 음성 목록은 커서(400KB) 첫 화면을 기다리게 하지 않는다. 오기 전에는 서버 음성이나 기기 목소리로 읽는다
    const voice = m => Speech.configure({ server: API.on && !!API.cfg.tts, manifest: m && m.files, stt: API.on && !!API.cfg.stt, ulaw: API.on && !!API.cfg.sttUlaw });
    voice(null); voiceP.then(m => { if (m) voice(m); });
    // 같은 그림체로 그린 문제 그림·스토리북 삽화 (있을 때만). 첫 화면이 이모지로 그려지지 않게 받고 나서 시작한다
    const pics = await picsP; if (pics) setPics(pics); autoIco(document.body);
    // 서버 음성 인식이 켜져 있으면 아이패드·아이폰의 Chrome에서도 말하기가 되니 Safari로 보내지 않는다
    if (Speech.env.inApp || !Speech.canListen && Speech.env.iosNotSafari) inAppBanner();
    // 서버 없이(예: GitHub Pages) 열렸을 때는 데모라는 걸 알려준다
    const banner = document.getElementById('demoBanner');
    let closed = false; try { closed = sessionStorage.getItem('sprout-demo-closed') === '1'; } catch (e) { /* ignore */ }
    if (!API.on && !closed) {
      banner.hidden = false;
      banner.querySelector('[data-close-demo]').onclick = () => { banner.hidden = true; try { sessionStorage.setItem('sprout-demo-closed', '1'); } catch (e) { /* ignore */ } };
    }
    const saved = Store.db.theme;
    document.documentElement.dataset.theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const rate = +localStorage.getItem('sprout-rate'); if (rate) { App.rate = rate; Speech.setRate(rate); }
    window.addEventListener('hashchange', route);
    // 좁은 화면(창을 줄인 PC 포함): 메뉴를 ☰ 단추로 펼치고 접는다. 메뉴를 고르거나 바깥을 누르면 접힌다
    const head = document.querySelector('.site-header'), menuBtn = document.getElementById('menuBtn');
    const setMenu = open => { head.classList.toggle('menu-open', open); menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기'); menuBtn.firstElementChild.textContent = open ? '✕' : '☰'; };
    menuBtn.onclick = e => { e.stopPropagation(); setMenu(!head.classList.contains('menu-open')); };
    document.getElementById('nav').addEventListener('click', e => { if (e.target.closest('a, button')) setMenu(false); });
    document.addEventListener('click', e => { if (head.classList.contains('menu-open') && !head.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && head.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });
    window.addEventListener('hashchange', () => setMenu(false));
    // 메뉴가 한 줄에 다 들어가는지 재서, 넘치면 ☰ 메뉴로 바꾼다 (창 너비만으로 정하면 윈도우처럼 글꼴이 넓은 곳에서 잘린다)
    let fitT = 0;
    const fitHeader = () => {
      const inner = head.querySelector('.head-inner'), nav = document.getElementById('nav');
      if (innerWidth <= 900) { head.classList.add('compact'); return; }
      const open = head.classList.contains('menu-open');
      head.classList.remove('compact', 'menu-open');
      const over = nav.scrollWidth > nav.clientWidth + 1 || inner.scrollWidth > inner.clientWidth + 1 || inner.getBoundingClientRect().height > 90;
      head.classList.toggle('compact', over); if (over && open) head.classList.add('menu-open');
    };
    App.fitHeader = fitHeader;
    window.addEventListener('resize', () => { clearTimeout(fitT); fitT = setTimeout(fitHeader, 100); });
    if (document.fonts) document.fonts.ready.then(fitHeader);
    fitHeader();
    // 결제·SNS 로그인에서 돌아왔을 때 안내
    const qs = new URLSearchParams((location.hash.split('?')[1]) || '');
    if (qs.get('paid')) { toast('결제가 완료되었어요! 💎'); Lesson.confetti(); }
    if (qs.get('welcome')) toast(greeting()[0]);
    clearTimeout(slowNote);
    route();
    Install.footer();
    Install.auto();
    Push.sync();
    Store.checkReminder();
    setInterval(() => Store.checkReminder(), 60000);
  }

  return { init, route, go, toast, modal, upsell, waterTree, inAppBanner, demoMail, download, buy, sampleLesson, refreshHeader, pinOk: false, rate: 0.85 };
})();

document.addEventListener('DOMContentLoaded', App.init);
