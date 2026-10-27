/* 새싹영어 — 라우터, 헤더, 공용 동작 */
const App = (() => {
  const main = () => document.getElementById('app');
  const NAV = [['/', '🏠 홈'], ['/study', '📚 학습하기'], ['/pricing', '💰 요금·할인'], ['/reviews', '💬 후기'], ['/help', '🙋 도움말']];
  // 하위 화면도 해당 메뉴를 켜준다
  const navOf = path => /^\/(study|learn|lesson|sample|speak|stor|wrong|shop|play|worksheet|leveltest|profiles)/.test(path) ? '/study' : path;
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
    [/^\/shop$/, learner(el => Views.shop(el))],
    [/^\/play(?:\/(balloon|match))?$/, learner((el, m) => Views.play(el, m[1]))],
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
    document.getElementById('nav').innerHTML = NAV.map(([h, t]) => `<a href="#${h}" class="${navOf(path) === h ? 'on' : ''}">${t}</a>`).join('');
    document.getElementById('userbar').innerHTML = `
      <button class="icon-btn" id="themeBtn" aria-label="낮/밤 모드 전환" title="낮/밤 모드">${document.documentElement.dataset.theme === 'dark' ? '🌞' : '🌙'}</button>
      ${u ? `${Store.isAdmin() ? `<a class="hb-link admin-link ${path.startsWith('/admin') ? 'on' : ''}" href="#/admin">🛠️ 관리자</a>` : ''}
        <div class="bell-wrap"><button class="icon-btn" id="bell" aria-label="알림 ${unread}개">🔔${unread ? `<i class="badge">${unread > 9 ? '9+' : unread}</i>` : ''}</button><div class="bell-pop" hidden></div></div>
        <a class="hb-link" href="#/parent">부모페이지</a>
        ${p ? `<a class="btn btn-primary sm" href="#/study">${p.avatar} 학습하기 <span class="star-pill">⭐${p.stars || 0}</span></a>` : `<a class="btn btn-primary sm" href="#/profiles">프로필 만들기</a>`}
        <button class="hb-link" id="logout">로그아웃</button>`
      : `<a class="hb-link login-link" href="#/login">🔑 로그인</a><a class="btn btn-primary sm" href="#/signup">🌱 무료 체험</a>`}`;
    document.getElementById('themeBtn').onclick = toggleTheme;
    const lo = document.getElementById('logout');
    if (lo) lo.onclick = async () => { await Store.logout(); App.pinOk = false; document.getElementById('mailbox').hidden = true; refreshHeader(); go('/'); };
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
      <small>📬 ${API.on ? '테스트 메일함 (메일 서버 설정 전이라 화면에 보여요)' : '데모 메일함'} · ${esc(email)}</small><b>[새싹영어] 인증코드</b><p>인증코드 <strong class="mail-code">${code}</strong> 를 입력해 주세요. 3분 동안 유효해요.</p></div>`;
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

  // 무료 사용자가 3단계 이상을 누르면: 플러스 안내
  function upsell() {
    const m = modal(`<div class="upsell"><div class="auth-logo">💎</div><h2>3단계부터는 플러스예요</h2>
      <p>1~2단계(알파벳·파닉스)는 지금처럼 <b>평생 무료</b>로 계속할 수 있어요.</p>
      <ul class="perks"><li>📚 3~8단계 문장·대화·과거·미래 <b>210레슨</b></li><li>📖 스토리북 12권 더 (모두 16권)</li><li>💸 <b>월 ${won(PLANS.one.m12)}</b>부터 · 하루 약 ${won(Math.round(PLANS.one.m12 / 30 / 10) * 10)}</li><li>🎟️ 첫 결제 ${Math.round(WELCOME_RATE * 100)}% 쿠폰 · 언제든 해지</li></ul>
      <div class="row-center"><button class="btn btn-ghost" data-close>나중에</button><a class="btn btn-primary" href="#/pricing" data-close>💎 플러스 보기</a></div></div>`);
    return m;
  }

  function buy(kids, months) {
    if (!Store.user()) { toast('로그인 후 구매할 수 있어요. 처음이면 회원가입부터!'); return go('/login?next=/pricing'); }
    if (Store.isAdmin()) return toast('관리자 계정은 결제 없이 모든 기능을 쓸 수 있어요.');
    const q = Store.quote(kids, months);
    const payMode = API.on ? API.cfg.payments : 'demo';
    if (payMode === 'off') return toast('결제 기능을 준비 중이에요. 잠시 후 다시 시도해 주세요.');
    const m = modal(`<h2>🧾 구매 확인</h2>
      <dl class="summary"><dt>상품</dt><dd>${kids === 'two' ? '두 자녀' : '한 자녀'} ${months}개월</dd>
      ${q.list > planMonthly(kids, months) * months ? `<dt>1개월 요금 기준</dt><dd class="strike">${won(q.list)}</dd>` : ''}
      <dt>플러스 ${months}개월</dt><dd>${won(planMonthly(kids, months) * months)}</dd>
      <dt>쿠폰</dt><dd>${q.coupon ? `${esc(q.coupon.name)} −${Math.round(q.rate * 100)}%` : '없음'}</dd>
      <dt>총 결제 금액</dt><dd class="total">${won(q.total)}</dd>
      <dt>자동갱신</dt><dd>${fmtDay(Date.now() + months * 30 * 86400000)}부터 · 언제든 해지</dd></dl>
      <p class="fine">${payMode === 'toss' ? '🔒 토스페이먼츠 카드 등록 화면으로 이동해요. 등록한 카드로 지금 결제되고, 기간이 끝나면 자동갱신돼요.' : '⚠️ 데모 결제예요. 실제 카드 결제는 일어나지 않아요.'} 결제 후 7일 이내에는 부모페이지에서 바로 환불할 수 있어요.</p>
      <div class="row-center"><button class="btn btn-ghost" data-close>취소</button><button class="btn btn-primary" data-ok>${payMode === 'toss' ? '💳 카드 등록하고 결제' : '데모 결제하기'}</button></div>`);
    const ok = m.el.querySelector('[data-ok]');
    ok.onclick = async () => {
      ok.disabled = true; ok.textContent = '처리 중…';
      try {
        const r = await Store.purchase({ kids, months });
        if (r === 'redirect') return; // 토스 결제창으로 이동
        m.close(); Lesson.confetti(); toast('멤버십이 시작되었어요! 💎'); route();
      } catch (x) { ok.disabled = false; ok.textContent = '다시 시도'; toast(x.message); }
    };
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

  async function init() {
    await Store.init();
    // AI 음성: 서버에 TTS 키가 있으면 /api/tts, 없으면 미리 만든 audio/manifest.json (있을 때만)
    let manifest = null;
    if (!(API.on && API.cfg.tts)) {
      try { const r = await fetch('audio/manifest.json'); if (r.ok) manifest = (await r.json()).files; } catch (e) { /* 없음 */ }
    }
    Speech.configure({ server: API.on && !!API.cfg.tts, manifest });
    if (Speech.env.inApp || Speech.env.iosNotSafari) inAppBanner();
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
    // 결제·SNS 로그인에서 돌아왔을 때 안내
    const qs = new URLSearchParams((location.hash.split('?')[1]) || '');
    if (qs.get('paid')) { toast('결제가 완료되었어요! 💎'); Lesson.confetti(); }
    if (qs.get('welcome')) toast('다시 만나서 반가워요! 👋');
    route();
    Store.checkReminder();
    setInterval(() => Store.checkReminder(), 60000);
  }

  return { init, route, go, toast, modal, upsell, waterTree, inAppBanner, demoMail, download, buy, sampleLesson, refreshHeader, pinOk: false, rate: 0.85 };
})();

document.addEventListener('DOMContentLoaded', App.init);
