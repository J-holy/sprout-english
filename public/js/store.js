/* 새싹영어 — 데이터 저장소
 * 서버 모드: /api 가 있으면 계정·결제·후기·관리자는 서버가 처리하고, 학습 기록은 서버에 동기화한다.
 * 로컬 모드: 서버 없이 index.html만 열면 브라우저 localStorage에 저장하는 데모로 동작한다.
 */
const API = {
  on: false, cfg: null,
  async req(method, path, body) {
    const r = await fetch(path, {
      method, credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json', 'X-Sprout': '1' } : { 'X-Sprout': '1' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(data.error || `요청 실패 (${r.status})`); e.status = r.status; throw e; }
    return data;
  },
};

const Store = (() => {
  const KEY = 'sprout-english.v2';
  const DAY = 86400000;
  let db = { users: {}, session: null, reviews: [], hiddenSamples: [], theme: null };
  const codes = {}; // 로컬 모드 인증코드 (메모리)
  let adminCache = [];

  const today = (d = new Date()) => {
    const z = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  };
  const uid = () => Math.random().toString(36).slice(2, 10);
  const normEmail = e => String(e || '').trim().toLowerCase();
  const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  async function hash(s) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('sprout:' + s));
      return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    let h = 0; for (const c of 'sprout:' + s) h = (h * 31 + c.charCodeAt(0)) | 0; return 'x' + h;
  }

  // ---------- 시작 / 저장 ----------
  function loadLocal() {
    try { const raw = JSON.parse(localStorage.getItem(KEY)); if (raw && raw.users) db = raw; } catch (e) { /* storage unavailable */ }
    Object.values(db.users).forEach(u => { u.id = u.id || u.email; u.profiles = (u.profiles || []).map(normalizeProfile); }); // 예전 데이터 보정
  }
  async function init() {
    try { db.theme = localStorage.getItem('sprout-theme'); } catch (e) { /* ignore */ }
    try {
      const ctl = new AbortController(); setTimeout(() => ctl.abort(), 2500);
      const r = await fetch('api/config', { signal: ctl.signal });
      if (r.ok && (r.headers.get('content-type') || '').includes('json')) {
        API.cfg = await r.json(); API.on = !!API.cfg.server;
      }
    } catch (e) { /* 서버 없음 → 로컬 모드 */ }
    if (!API.on) { loadLocal(); return; }
    Object.assign(PLANS, API.cfg.plans || {});
    await Promise.all([loadMe(), loadReviews()]);
  }
  function normalizeProfile(p) {
    // 예전 버전에서 100%를 넘게 저장된 점수를 바로잡는다
    for (const lv of Object.values(p.progress || {})) (lv.lessons || []).forEach(r => { if (r && r.score > 100) r.score = 100; });
    if (p.recentScores) p.recentScores = p.recentScores.map(x => Math.min(100, x));
    if (p.stats && p.stats.correct > p.stats.answered) p.stats.correct = p.stats.answered;
    return Object.assign({ progress: {}, stamps: {}, minutes: {}, stats: { answered: 0, correct: 0 }, wrong: [], speaking: [], stories: {}, dailyGoal: 2,
      stars: 0, owned: [], acc: null, difficulty: 'auto', recentScores: [], games: {}, starLog: {}, startLevel: 'A', placed: false }, p);
  }
  async function loadMe() {
    try {
      const doc = await API.req('GET', 'api/me');
      if (!doc.id) { db.users = {}; db.session = null; return; }
      doc.profiles = (doc.profiles || []).map(normalizeProfile);
      if (!doc.activeProfile && doc.profiles[0]) doc.activeProfile = doc.profiles[0].id;
      db.users = { [doc.id]: doc }; db.session = doc.id;
    } catch (e) { db.users = {}; db.session = null; }
  }
  async function loadReviews() {
    try { const r = await API.req('GET', 'api/reviews'); db.reviews = r.reviews; db.hiddenSamples = r.hiddenSamples; } catch (e) { /* ignore */ }
  }
  let saveTimer = null;
  function save() {
    if (!API.on) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* ignore */ } return; }
    clearTimeout(saveTimer); saveTimer = setTimeout(pushState, 800);
  }
  function statePayload() {
    const u = user(); if (!u) return null;
    return { profiles: u.profiles, activeProfile: u.activeProfile, worksheets: u.worksheets || {}, settings: u.settings };
  }
  async function pushState() {
    const body = statePayload(); if (!body) return;
    try { const r = await API.req('PUT', 'api/me/state', body); if (r.trialStart) user().trialStart = r.trialStart; }
    catch (e) { if (e.status === 401) { db.session = null; App.toast('로그인이 만료되었어요. 다시 로그인해 주세요.'); App.go('/login'); } else console.warn('학습 기록 저장 실패', e.message); }
  }
  // 창을 닫을 때 남은 변경을 보낸다
  window.addEventListener('pagehide', () => {
    if (!API.on || !saveTimer) return;
    clearTimeout(saveTimer); saveTimer = null;
    const body = statePayload(); if (!body) return;
    fetch('api/me/state', { method: 'PUT', keepalive: true, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Sprout': '1' }, body: JSON.stringify(body) });
  });

  // ---------- 계정 / 인증 ----------
  const user = () => (db.session && db.users[db.session]) || null;
  const isAdmin = (u = user()) => !!u && (u.role === 'admin' || (!API.on && CONFIG.ADMIN_EMAILS.map(normEmail).includes(u.email)));
  const exists = email => !!db.users[normEmail(email)];
  const providerReady = p => API.on ? !!(API.cfg.providers || {})[p] : true;

  // 인증코드 발급 → { expires, code? }  (code는 메일 대신 화면에 보여줄 때만 온다)
  async function sendCode(email) {
    email = normEmail(email);
    if (!validEmail(email)) throw new Error('이메일 주소를 다시 확인해 주세요.');
    if (API.on) { const r = await API.req('POST', 'api/auth/email/send', { email }); return { expires: r.expires, code: r.devCode }; }
    const prev = codes[email], now = Date.now();
    if (prev && now - prev.sentAt < CONFIG.RESEND_WAIT_SEC * 1000) throw new Error(`${Math.ceil((CONFIG.RESEND_WAIT_SEC * 1000 - (now - prev.sentAt)) / 1000)}초 후에 다시 보낼 수 있어요.`);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    codes[email] = { code, sentAt: now, expires: now + CONFIG.CODE_TTL_SEC * 1000, tries: 0, verified: false };
    return { code, expires: codes[email].expires };
  }
  // → { needSignup }
  async function verifyCode(email, code) {
    email = normEmail(email);
    if (API.on) {
      const r = await API.req('POST', 'api/auth/email/verify', { email, code: String(code).trim() });
      if (r.status === 'login') { await loadMe(); return { needSignup: false }; }
      return { needSignup: true };
    }
    const c = codes[email];
    if (!c) throw new Error('먼저 인증코드를 받아 주세요.');
    if (Date.now() > c.expires) throw new Error('인증코드가 만료되었어요. 다시 받아 주세요.');
    if (c.tries >= CONFIG.CODE_MAX_TRIES) throw new Error('입력 횟수를 넘었어요. 코드를 다시 받아 주세요.');
    if (String(code).trim() !== c.code) { c.tries++; throw new Error(`인증코드가 맞지 않아요. (${CONFIG.CODE_MAX_TRIES - c.tries}번 남음)`); }
    c.verified = true;
    if (db.users[email]) { startLocalSession(email); delete codes[email]; return { needSignup: false }; }
    return { needSignup: true };
  }
  // 가입 마무리 (이메일 인증 또는 SNS 이후)
  async function completeSignup({ provider, email, parentName, marketing }) {
    if (API.on) {
      await API.req('POST', 'api/auth/complete', { parentName, terms: true, age: true, marketing: !!marketing });
      await loadMe(); return user();
    }
    email = normEmail(email);
    if (provider === 'email') { if (!codes[email] || !codes[email].verified) throw new Error('이메일 인증을 먼저 완료해 주세요.'); delete codes[email]; }
    if (db.users[email]) { startLocalSession(email); return user(); }
    const u = createLocalUser({ email, parentName, provider }); u.settings.marketing = !!marketing; save(); return u;
  }
  const pendingSignup = () => API.req('GET', 'api/auth/pending');
  // 로컬 모드 SNS 데모: 이메일로 로그인/가입 판단
  function snsLocalLogin(provider, email) {
    email = normEmail(email); const u = db.users[email];
    if (!u.providers.includes(provider)) u.providers.push(provider);
    startLocalSession(email); return u;
  }
  function createLocalUser({ email, parentName, provider }) {
    const now = Date.now();
    db.users[email] = {
      id: email, email, parentName, providers: [provider], createdAt: now, lastLogin: now, trialStart: null, role: 'parent',
      profiles: [], activeProfile: null, membership: null, payments: [], worksheets: {},
      coupons: [{ id: uid(), name: '웰컴쿠폰', rate: WELCOME_RATE, expires: now + 10 * DAY, used: false, welcome: true }],
      notifications: [], settings: { notify: true, remindTime: '19:00', pin: '', lastRemind: null, gentle: true },
    };
    if (isAdmin(db.users[email])) db.users[email].role = 'admin';
    db.session = email; save();
    notify('🎉 가입을 환영해요! 쿠폰함에 웰컴쿠폰이 발급되었어요.', 'coupon');
    return db.users[email];
  }
  function startLocalSession(email) {
    const u = db.users[email]; u.lastLogin = Date.now();
    if (isAdmin(u)) u.role = 'admin';
    db.session = email; save();
  }
  async function logout() {
    if (API.on) { await pushState().catch(() => {}); await API.req('POST', 'api/auth/logout', {}).catch(() => {}); db.users = {}; }
    db.session = null; save();
  }
  async function deleteAccount() {
    if (API.on) { await API.req('DELETE', 'api/me'); db.users = {}; db.session = null; return; }
    delete db.users[db.session]; db.session = null; save();
  }

  // ---------- 프로필 ----------
  function profile() {
    const u = user(); if (!u) return null;
    return u.profiles.find(p => p.id === u.activeProfile) || null;
  }
  function addProfile({ name, age, avatar }) {
    const u = user();
    const p = normalizeProfile({ id: uid(), name, age, avatar, createdAt: Date.now() });
    u.profiles.push(p); u.activeProfile = p.id;
    if (!u.trialStart) u.trialStart = Date.now();
    save(); return p;
  }
  function selectProfile(id) { user().activeProfile = id; save(); }
  function removeProfile(id) {
    const u = user(); u.profiles = u.profiles.filter(p => p.id !== id);
    if (u.activeProfile === id) u.activeProfile = u.profiles[0] ? u.profiles[0].id : null;
    save();
  }
  function updateProfile(patch) { Object.assign(profile(), patch); save(); }

  // ---------- 이용권 / 멤버십 ----------
  function access(u = user()) {
    if (!u) return { ok: false, reason: 'login' };
    if (u.access && u !== user()) return u.access.kind === 'admin' ? { ok: true, kind: 'admin', daysLeft: Infinity } : u.access; // 관리자 목록(서버 계산값)
    if (isAdmin(u)) return { ok: true, kind: 'admin', daysLeft: Infinity };
    const now = Date.now(), m = u.membership;
    if (m && m.until > now) return { ok: true, kind: 'member', daysLeft: Math.ceil((m.until - now) / DAY) };
    if (u.trialStart) {
      const end = u.trialStart + 7 * DAY + (u.trialBonus || 0);
      if (end > now) return { ok: true, kind: 'trial', daysLeft: Math.ceil((end - now) / DAY) };
      return { ok: true, kind: 'free' }; // 체험이 끝나도 1~2단계는 평생 무료
    }
    return { ok: true, kind: 'trial', daysLeft: 7 };
  }
  function bestCoupon() {
    const u = user(); if (!u) return null;
    return u.coupons.filter(c => !c.used && c.expires > Date.now()).sort((a, b) => b.rate - a.rate)[0] || null;
  }
  const couponRate = c => !c ? 0 : c.welcome ? WELCOME_RATE : c.rate;
  function quote(kids, months) {
    const c = bestCoupon(), rate = couponRate(c);
    // 쿠폰은 멤버십 월 요금에서 할인하고 10원 단위로 맞춘다 (서버와 같은 계산)
    const monthly = rate ? round10(planMonthly(kids, months) * (1 - rate)) : planMonthly(kids, months);
    return { coupon: c, rate, monthly, total: monthly * months, list: PLANS[kids].list * months };
  }
  // → 'demo'(완료) | 'redirect'(토스 결제창으로 이동)
  async function purchase({ kids, months }) {
    if (API.on) {
      const r = await API.req('POST', 'api/billing/checkout', { kids, months });
      if (r.mode === 'demo') { await loadMe(); return 'demo'; }
      await loadScript('https://js.tosspayments.com/v1/payment');
      await TossPayments(r.clientKey).requestBillingAuth('카드', { customerKey: r.customerKey, successUrl: r.successUrl, failUrl: r.failUrl });
      return 'redirect';
    }
    const u = user(); const now = Date.now(); const q = quote(kids, months);
    let bonus = 0;
    if (u.trialStart && !u.membership) bonus = Math.max(0, u.trialStart + 7 * DAY - now);
    const base = u.membership && u.membership.until > now ? u.membership.until : now;
    u.membership = { kids, months, since: now, until: base + months * 30 * DAY + bonus, autoRenew: true, monthly: q.monthly };
    u.payments.unshift({ id: uid(), at: now, amount: q.total, desc: `${kids === 'two' ? '두 자녀' : '한 자녀'} ${months}개월`, coupon: q.coupon ? `${q.coupon.name} ${Math.round(q.rate * 100)}%` : '', couponId: q.coupon ? q.coupon.id : null, status: '결제완료' });
    if (q.coupon) q.coupon.used = true;
    save(); notify(`💳 멤버십(${kids === 'two' ? '두 자녀' : '한 자녀'} · ${months}개월)이 시작되었어요. 결제 금액 ${q.total.toLocaleString()}원`, 'member');
    return 'demo';
  }
  const loadScript = src => new Promise((ok, fail) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => fail(new Error('결제 모듈을 불러오지 못했어요.')); document.head.appendChild(s);
  });
  async function setAutoRenew(on) {
    if (API.on) { await API.req('POST', 'api/billing/auto-renew', { on }); return loadMe(); }
    const u = user(); if (!u.membership) return;
    u.membership.autoRenew = on; save();
    notify(on ? '🔁 자동갱신을 다시 켰어요.' : `🛑 자동갱신을 해지했어요. ${new Date(u.membership.until).toLocaleDateString('ko-KR')}까지 이용할 수 있고 이후 결제되지 않아요.`, 'member');
  }
  function canRefund(u = user()) {
    const pay = u && u.payments.find(p => p.status === '결제완료' && p.amount > 0);
    return !!(pay && u.membership && Date.now() - pay.at < 7 * DAY);
  }
  async function refund() {
    if (API.on) { await API.req('POST', 'api/billing/refund', {}); return loadMe(); }
    const u = user(); if (!canRefund(u)) throw new Error('환불 가능 기간(결제 후 7일)이 지났어요.');
    const pay = u.payments.find(p => p.status === '결제완료');
    pay.status = '환불완료'; u.membership = null;
    const c = u.coupons.find(x => x.id === pay.couponId); if (c) c.used = false; // 환불하면 쓴 쿠폰을 돌려준다
    save(); notify(`↩️ ${pay.amount.toLocaleString()}원 환불을 접수했어요.`, 'member');
  }

  // ---------- 진도 ----------
  function levelProgress(lv, p = profile()) { return (p && p.progress[lv]) || { lessons: [] }; }
  function lessonsDone(lv, p = profile()) { return levelProgress(lv, p).lessons.filter(Boolean).length; }
  // 플러스(체험·멤버십·관리자)가 아니면 3단계부터는 잠긴다
  const hasPlus = () => ['admin', 'member', 'trial'].includes(access().kind);
  const needsPlus = lv => !isFreeLevel(lv) && !hasPlus();
  function isUnlocked(lv, p = profile()) {
    if (isAdmin()) return true;
    if (needsPlus(lv)) return false;
    if (!p) return lv === 'A';
    const i = ALL_LEVELS.indexOf(lv), start = ALL_LEVELS.indexOf(p.startLevel);
    if (i <= start) return true;
    return lessonsDone(ALL_LEVELS[i - 1], p) >= LESSONS_PER_LEVEL;
  }
  function currentLevel(p = profile()) {
    const unlocked = lv => { const i = ALL_LEVELS.indexOf(lv), s = ALL_LEVELS.indexOf(p.startLevel); return i <= s || lessonsDone(ALL_LEVELS[i - 1], p) >= LESSONS_PER_LEVEL; };
    // 레벨 진단으로 정한 출발 레벨부터 찾는다 (앞쪽 레벨은 건너뛴 것으로 본다)
    return ALL_LEVELS.slice(ALL_LEVELS.indexOf(p.startLevel)).find(lv => unlocked(lv) && lessonsDone(lv, p) < LESSONS_PER_LEVEL) || 'Z';
  }
  function difficulty(p = profile()) {
    if (!p) return 'normal';
    if (p.difficulty && p.difficulty !== 'auto') return p.difficulty;
    const r = (p.recentScores || []).slice(0, 3); if (r.length < 2) return 'normal';
    const avg = r.reduce((a, b) => a + b, 0) / r.length;
    return avg < 55 ? 'easy' : avg >= 90 ? 'hard' : 'normal';
  }
  function finishLesson({ level, index, correct, total, seconds, wrongItems }) {
    const p = profile(); const d = today();
    const lp = p.progress[level] || (p.progress[level] = { lessons: [] });
    const score = Math.min(100, Math.round(correct / total * 100));
    const prev = lp.lessons[index];
    lp.lessons[index] = { score: Math.max(score, prev ? prev.score : 0), date: d };
    p.stats.answered += total; p.stats.correct += correct;
    p.stamps[d] = (p.stamps[d] || 0) + 1;
    p.minutes[d] = (p.minutes[d] || 0) + Math.max(1, Math.round(seconds / 60));
    p.recentScores = [score, ...(p.recentScores || [])].slice(0, 5);
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;
    addStars(stars, 'lesson');
    addWrong(wrongItems);
    save();
    notify(`📚 [학습알림] ${p.name}(이)가 Level ${level} Day ${index + 1}을 완료했어요! 정답률 ${score}%`, 'lesson', true);
    if (p.stamps[d] === p.dailyGoal) notify(`🏅 ${p.name}(이)가 오늘의 목표(${p.dailyGoal}개 레슨)를 달성했어요!`, 'goal', true);
    return { score, stars };
  }
  function addWrong(items = []) {
    const p = profile();
    for (const it of items) if (!p.wrong.some(w => w.key === it.key)) p.wrong.unshift({ ...it, added: Date.now() });
    p.wrong = p.wrong.slice(0, 80); save();
  }
  function clearWrong(key) { const p = profile(); p.wrong = p.wrong.filter(w => w.key !== key); save(); }
  function addMinutes(sec) { const p = profile(); if (!p) return; const d = today(); p.minutes[d] = (p.minutes[d] || 0) + Math.max(1, Math.round(sec / 60)); save(); }
  function recordSpeaking(text, score) {
    const p = profile(); p.speaking.unshift({ text, score, date: Date.now() }); p.speaking = p.speaking.slice(0, 100);
    let got = 0;
    if (score >= 80) got = addStars(1, 'speak', 5); // 말하기 별은 하루 5개까지
    save(); return got;
  }
  function readStory(id) {
    const p = profile(); const first = !p.stories[id];
    p.stories[id] = (p.stories[id] || 0) + 1;
    if (first) { const d = today(); p.stamps[d] = (p.stamps[d] || 0) + 1; addStars(2, 'story'); }
    save(); return first;
  }
  function streak(p = profile()) {
    if (!p) return 0;
    let n = 0; const d = new Date();
    if (!p.stamps[today(d)]) d.setDate(d.getDate() - 1); // 오늘 아직 안 했어도 어제까지 연속이면 유지
    while (p.stamps[today(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  // ---------- 별 / 상점 / 놀이터 ----------
  function addStars(n, kind, dailyCap) {
    const p = profile(); if (!p || n <= 0) return 0;
    p.starLog = p.starLog || {};
    const k = today() + ':' + kind;
    if (dailyCap) n = Math.max(0, Math.min(n, dailyCap - (p.starLog[k] || 0)));
    p.starLog[k] = (p.starLog[k] || 0) + n;
    p.stars = (p.stars || 0) + n; save(); return n;
  }
  function buy(itemId) {
    const p = profile(), it = SHOP.find(x => x.id === itemId);
    if (!it || p.owned.includes(itemId)) return false;
    if (p.stars < it.cost) throw new Error(`별이 ${it.cost - p.stars}개 더 필요해요.`);
    p.stars -= it.cost; p.owned.push(itemId);
    if (it.kind === 'acc' && !p.acc) p.acc = itemId;
    save(); return true;
  }
  function equip(itemId) { const p = profile(); p.acc = p.acc === itemId ? null : itemId; save(); }
  const accEmoji = (p = profile()) => { const it = p && p.acc && SHOP.find(x => x.id === p.acc); return it ? it.emoji : ''; };
  function gameResult(game, score) {
    const p = profile(); p.games = p.games || {};
    const best = p.games[game] || 0; p.games[game] = Math.max(best, score);
    const got = addStars(score >= 8 ? 3 : score >= 5 ? 2 : score >= 2 ? 1 : 0, 'game', 6);
    save(); return { best: p.games[game], newBest: score > best, got };
  }
  function markWorksheet(lv) { const u = user(); u.worksheets = u.worksheets || {}; u.worksheets[lv] = Date.now(); save(); }

  // ---------- 알림 ----------
  function notify(text, kind = 'info', push = false) {
    const u = user(); if (!u) return;
    u.notifications.unshift({ id: uid(), text, kind, at: Date.now(), read: false });
    u.notifications = u.notifications.slice(0, 100);
    if (API.on) API.req('POST', 'api/me/notifications', { text, kind }).catch(() => {}); else save();
    if (push && u.settings.notify && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification('새싹영어 학습알림', { body: text.replace(/^\S+\s/, '') }); } catch (e) { /* ignore */ }
    }
    document.dispatchEvent(new CustomEvent('store:notify'));
  }
  function markAllRead() {
    const u = user(); if (!u) return;
    u.notifications.forEach(n => n.read = true);
    if (API.on) API.req('POST', 'api/me/notifications/read', {}).catch(() => {}); else save();
  }
  function checkReminder() {
    const u = user(); const p = profile(); if (!u || !p || !u.settings.notify) return;
    const now = new Date(); const [h, m] = (u.settings.remindTime || '19:00').split(':').map(Number);
    if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
    if (u.settings.lastRemind === today() || (p.stamps[today()] || 0) >= p.dailyGoal) return;
    u.settings.lastRemind = today(); save();
    notify(`⏰ ${p.name}(이)의 오늘 학습이 아직 남았어요. 레슨 ${p.dailyGoal - (p.stamps[today()] || 0)}개만 더 해볼까요?`, 'remind', true);
  }

  // ---------- 후기 ----------
  async function addReview(r) {
    if (API.on) { await API.req('POST', 'api/reviews', r); return loadReviews(); }
    db.reviews.unshift({ ...r, id: uid(), date: today(), mine: db.session }); save();
  }
  const reviews = () => db.reviews.concat(SAMPLE_REVIEWS.map((r, i) => ({ ...r, id: 'sample-' + i, sample: true })).filter(r => !(db.hiddenSamples || []).includes(r.id)));
  async function deleteReview(id) {
    if (API.on) { await API.req('DELETE', 'api/reviews/' + encodeURIComponent(id)); return loadReviews(); }
    if (id.startsWith('sample-')) db.hiddenSamples = [...(db.hiddenSamples || []), id];
    else db.reviews = db.reviews.filter(r => r.id !== id);
    save();
  }

  // ---------- 관리자 (회원은 id로 구분) ----------
  const Admin = {
    async load() { adminCache = API.on ? await API.req('GET', 'api/admin/users') : Object.values(db.users); return adminCache; },
    users: () => adminCache,
    get: key => adminCache.find(u => u.id === key),
    async stats() { return API.on ? API.req('GET', 'api/admin/stats') : null; },
    async act(key, act, extra = {}) {
      if (API.on) { await API.req('POST', `api/admin/users/${encodeURIComponent(key)}/action`, { act, ...extra }); return; }
      const u = db.users[key], now = Date.now(), toUser = (text, kind) => { u.notifications.unshift({ id: uid(), text, kind, at: now, read: false }); };
      if (act === 'grant') {
        const base = u.membership && u.membership.until > now ? u.membership.until : now;
        u.membership = { kids: 'two', months: extra.months, since: now, until: base + extra.months * 30 * DAY, autoRenew: false, monthly: 0, granted: true };
        u.payments.unshift({ id: uid(), at: now, amount: 0, desc: `관리자 지급 ${extra.months}개월`, coupon: '', status: '지급' });
        toUser(`🎁 관리자가 멤버십 ${extra.months}개월을 지급했어요.`, 'member');
      }
      if (act === 'revoke') u.membership = null;
      if (act === 'trial') { u.trialStart = u.trialStart || now; u.trialBonus = (u.trialBonus || 0) + extra.days * DAY; toUser(`⏳ 무료체험이 ${extra.days}일 연장되었어요.`, 'member'); }
      if (act === 'coupon') { u.coupons.unshift({ id: uid(), name: `특별쿠폰 ${Math.round(extra.rate * 100)}%`, rate: extra.rate, expires: now + extra.days * DAY, used: false }); toUser(`🎟️ ${Math.round(extra.rate * 100)}% 특별쿠폰이 도착했어요!`, 'coupon'); }
      if (act === 'stars') u.profiles.forEach(p => { p.stars = (p.stars || 0) + extra.n; });
      if (act === 'role') u.role = extra.role;
      save();
    },
    async deleteUser(key) {
      if (API.on) return API.req('DELETE', 'api/admin/users/' + encodeURIComponent(key));
      delete db.users[key]; if (db.session === key) db.session = null; save();
    },
    exportAll: () => JSON.stringify(db, null, 2),
    resetAll() { localStorage.removeItem(KEY); db = { users: {}, session: null, reviews: [], hiddenSamples: [], theme: db.theme }; },
  };

  // ---------- 기타 ----------
  function setTheme(t) { db.theme = t; try { localStorage.setItem('sprout-theme', t); } catch (e) { /* ignore */ } }
  function exportData() { return JSON.stringify(user(), null, 2); }
  function importData(json) {
    const u = JSON.parse(json);
    if (!Array.isArray(u.profiles)) throw new Error('올바른 백업 파일이 아니에요.');
    const me = user();
    if (u.email !== me.email) throw new Error('현재 로그인한 계정의 백업 파일만 불러올 수 있어요.');
    // 학습 기록만 가져온다 (멤버십·결제·쿠폰은 서버 기록이 기준)
    me.profiles = u.profiles.map(normalizeProfile); me.activeProfile = u.activeProfile; me.worksheets = u.worksheets || {};
    save();
  }
  function persist() { save(); }

  return {
    get db() { return db; }, init, loadMe, today, user, isAdmin, exists, providerReady, sendCode, verifyCode, completeSignup, pendingSignup,
    snsLocalLogin, logout, deleteAccount, profile, addProfile, selectProfile, removeProfile, updateProfile,
    access, bestCoupon, quote, purchase, setAutoRenew, canRefund, refund,
    levelProgress, lessonsDone, isUnlocked, hasPlus, needsPlus, currentLevel, difficulty, finishLesson, addWrong, clearWrong,
    addMinutes, recordSpeaking, readStory, streak, addStars, buy, equip, accEmoji, gameResult, markWorksheet,
    notify, markAllRead, checkReminder, addReview, reviews, deleteReview, Admin, setTheme, exportData, importData, persist, hash,
  };
})();
