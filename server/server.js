// 새싹영어 서버 — 정적 파일 + REST API (라즈베리파이에서 systemd로 실행)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import express from 'express';
import { config } from './lib/env.js';
import { db, dbFile, now, DAY, json, kv, id } from './lib/db.js';
import { createUser, getUser, getUserByEmail, isAdmin, linkIdentity, notify, userDoc, access } from './lib/users.js';
import {
  parseCookies, setCookie, clearCookie, sign, unsign, startSession, endSession, loadSession, requireUser, requireAdmin,
  cleanupSessions, csrf, rateLimit, securityHeaders, clientIp, hashCode,
} from './lib/security.js';
import { sendCodeMail, mailReady, verifyMailer } from './lib/mailer.js';
import { PROVIDERS, enabledProviders } from './lib/oauth.js';
import { PLANS, validPlan, quote } from './lib/pricing.js';
import { ttsProvider, cleanText, validText, getSpeech, ttsStats, cacheFile } from './lib/tts.js';
import { paymentMode, createOrder, completeDemo, completeBillingAuth, failOrder, setAutoRenew, refund, refundable, renewalJob } from './lib/billing.js';

const app = express();
app.disable('x-powered-by');
if (config.trustProxy) app.set('trust proxy', 'loopback');
app.use(securityHeaders);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));
app.use(loadSession);
app.use('/api', csrf);

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const bad = (res, msg, code = 400) => res.status(code).json({ error: msg });
const validEmail = e => typeof e === 'string' && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const safeNext = n => (typeof n === 'string' && /^\/[\w\-/?=&.%]*$/.test(n) ? n : '/study');
const toHash = (route, params = {}) => `/#${route}${Object.keys(params).length ? '?' + new URLSearchParams(params) : ''}`;
const PENDING_TTL = 30 * 60000;

// ---------- 공통 ----------
app.get('/api/health', (req, res) => res.json({ ok: true, time: now() }));
app.get('/api/config', (req, res) => res.json({
  server: true, providers: enabledProviders(), payments: paymentMode(), tossClientKey: config.toss.clientKey || null,
  plans: PLANS, devShowCode: config.devShowCode && !mailReady, code: config.code, tts: ttsProvider(),
}));

// ---------- AI 음성 (TTS) ----------
app.get('/api/tts', wrap(async (req, res) => {
  if (!ttsProvider()) return bad(res, 'AI 음성이 설정되지 않았어요.', 404);
  const text = cleanText(req.query.text), slow = req.query.slow === '1';
  if (!validText(text)) return bad(res, '읽을 수 없는 문장이에요.');
  // 이미 만든 문장은 바로 보내고, 새로 만드는 요청만 IP별로 제한한다 (요금 보호)
  if (!fs.existsSync(cacheFile(text, slow)) && !rateLimit('tts:' + clientIp(req), 300, 3600000)) return bad(res, '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.', 429);
  let file;
  try { ({ file } = await getSpeech(text, slow)); }
  catch (err) { console.error('[TTS]', err.message); return bad(res, 'AI 음성을 만들지 못했어요.', 502); }
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.type(file.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg').sendFile(file);
}));

// ---------- 내 정보 / 학습 기록 동기화 ----------
app.get('/api/me', (req, res) => res.json(req.user ? userDoc(req.user) : { loggedIn: false }));

app.put('/api/me/state', requireUser, (req, res) => {
  const { profiles, activeProfile, worksheets, settings } = req.body || {};
  if (!Array.isArray(profiles) || profiles.length > 10) return bad(res, '프로필 정보가 올바르지 않아요.');
  const state = JSON.stringify({ profiles, activeProfile: activeProfile || null, worksheets: worksheets && typeof worksheets === 'object' ? worksheets : {} });
  if (state.length > 1_800_000) return bad(res, '저장할 학습 기록이 너무 커요.');
  const prevSettings = json(req.user.settings, {});
  const nextSettings = settings && typeof settings === 'object' ? { ...prevSettings, ...settings } : prevSettings;
  db.prepare('UPDATE users SET state = ?, settings = ?, marketing = ?, trial_start = COALESCE(trial_start, ?) WHERE id = ?')
    .run(state, JSON.stringify(nextSettings), nextSettings.marketing ? 1 : 0, profiles.length ? now() : null, req.user.id);
  res.json({ ok: true, trialStart: getUser(req.user.id).trial_start });
});
app.post('/api/me/notifications', requireUser, (req, res) => {
  const { text, kind } = req.body || {};
  if (!text || typeof text !== 'string') return bad(res, '알림 내용이 없어요.');
  if (!rateLimit('noti:' + req.user.id, 60, 3600000)) return bad(res, '알림이 너무 많아요.', 429);
  notify(req.user.id, text, String(kind || 'info').slice(0, 20));
  res.json({ ok: true });
});
app.post('/api/me/notifications/read', requireUser, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id); res.json({ ok: true });
});
app.delete('/api/me', requireUser, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
  clearCookie(res, 'sid'); res.json({ ok: true });
});

// ---------- 이메일 인증코드 로그인/가입 ----------
app.post('/api/auth/email/send', wrap(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!validEmail(email)) return bad(res, '이메일 주소를 다시 확인해 주세요.');
  if (!rateLimit('send-ip:' + clientIp(req), 10, 600000) || !rateLimit('send-mail:' + email, 5, 3600000)) return bad(res, '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.', 429);
  const prev = db.prepare('SELECT * FROM login_codes WHERE email = ?').get(email);
  const wait = prev ? config.code.resendSec * 1000 - (now() - prev.sent_at) : 0;
  if (wait > 0) return bad(res, `${Math.ceil(wait / 1000)}초 후에 다시 보낼 수 있어요.`, 429);
  if (!mailReady && !config.devShowCode) return bad(res, '메일 발송 설정이 아직 안 되어 있어요. 관리자에게 문의해 주세요.', 503);
  const code = String(crypto.randomInt(100000, 1000000));
  const expires = now() + config.code.ttlSec * 1000;
  db.prepare(`INSERT INTO login_codes (email, code_hash, sent_at, expires_at, tries) VALUES (?, ?, ?, ?, 0)
    ON CONFLICT(email) DO UPDATE SET code_hash = excluded.code_hash, sent_at = excluded.sent_at, expires_at = excluded.expires_at, tries = 0`)
    .run(email, hashCode(email, code), now(), expires);
  try { await sendCodeMail(email, code); }
  catch (err) { console.error('[메일] 발송 실패:', err.message); return bad(res, '메일을 보내지 못했어요. 주소를 확인하고 다시 시도해 주세요.', 502); }
  res.json({ ok: true, expires, devCode: !mailReady && config.devShowCode ? code : undefined });
}));

app.post('/api/auth/email/verify', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase(), code = String(req.body?.code || '').trim();
  if (!rateLimit('verify-ip:' + clientIp(req), 30, 600000)) return bad(res, '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.', 429);
  const row = db.prepare('SELECT * FROM login_codes WHERE email = ?').get(email);
  if (!row) return bad(res, '먼저 인증코드를 받아 주세요.');
  if (now() > row.expires_at) return bad(res, '인증코드가 만료되었어요. 다시 받아 주세요.');
  if (row.tries >= config.code.maxTries) return bad(res, '입력 횟수를 넘었어요. 코드를 다시 받아 주세요.');
  const ok = crypto.timingSafeEqual(Buffer.from(hashCode(email, code)), Buffer.from(row.code_hash));
  if (!ok) {
    db.prepare('UPDATE login_codes SET tries = tries + 1 WHERE email = ?').run(email);
    return bad(res, `인증코드가 맞지 않아요. (${config.code.maxTries - row.tries - 1}번 남음)`);
  }
  db.prepare('DELETE FROM login_codes WHERE email = ?').run(email);
  const u = getUserByEmail(email);
  if (u) { linkIdentity(u.id, 'email', email); startSession(req, res, u.id); return res.json({ status: 'login' }); }
  setCookie(res, 'pending', sign({ provider: 'email', uid: email, email, name: '' }, PENDING_TTL), { maxAge: PENDING_TTL });
  res.json({ status: 'signup', email });
});

app.get('/api/auth/pending', (req, res) => {
  const p = unsign(parseCookies(req).pending);
  p ? res.json({ provider: p.provider, email: p.email || '', name: p.name || '' }) : res.status(404).json({ error: '가입 정보가 만료되었어요. 처음부터 다시 해 주세요.' });
});

app.post('/api/auth/complete', (req, res) => {
  const p = unsign(parseCookies(req).pending);
  if (!p) return bad(res, '가입 정보가 만료되었어요. 처음부터 다시 해 주세요.');
  const { parentName, terms, age, marketing } = req.body || {};
  const name = String(parentName || '').trim().slice(0, 20);
  if (!name) return bad(res, '이름을 입력해 주세요.');
  if (!terms || !age) return bad(res, '필수 항목에 동의해 주세요.');
  let u = p.email ? getUserByEmail(p.email) : null;
  if (u) linkIdentity(u.id, p.provider, p.uid);
  else u = createUser({ email: p.email || null, parentName: name, provider: p.provider, providerUid: p.uid, marketing: !!marketing });
  clearCookie(res, 'pending');
  startSession(req, res, u.id);
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => { endSession(req, res); res.json({ ok: true }); });

// ---------- SNS 로그인 ----------
app.get('/api/auth/:provider/start', (req, res) => {
  const P = PROVIDERS[req.params.provider];
  if (!P || !P.ready()) return res.redirect(toHash('/login', { error: '이 로그인 방법은 아직 준비 중이에요.' }));
  const state = crypto.randomBytes(16).toString('hex');
  // Apple은 POST로 돌아오므로 SameSite=None 쿠키가 필요하다
  setCookie(res, 'oauth', sign({ state, provider: req.params.provider, mode: req.query.mode === 'signup' ? 'signup' : 'login', next: safeNext(req.query.next) }, 600000),
    { maxAge: 600000, sameSite: P.formPost && config.https ? 'None' : 'Lax' });
  res.redirect(P.authUrl(state));
});
const oauthCallback = wrap(async (req, res) => {
  const provider = req.params.provider, P = PROVIDERS[provider];
  const q = { ...req.query, ...req.body };
  const st = unsign(parseCookies(req).oauth);
  clearCookie(res, 'oauth', P?.formPost && config.https ? 'None' : 'Lax');
  try {
    if (!P || !st || st.provider !== provider || st.state !== q.state) throw new Error('로그인 요청이 만료되었어요. 다시 시도해 주세요.');
    if (q.error) throw new Error(q.error_description || '로그인을 취소했어요.');
    const prof = await P.profile(q.code, q.state, q);
    if (!prof.uid) throw new Error('계정 정보를 받지 못했어요.');
    const ident = db.prepare('SELECT user_id FROM identities WHERE provider = ? AND provider_uid = ?').get(provider, prof.uid);
    let u = ident ? getUser(ident.user_id) : prof.email ? getUserByEmail(prof.email) : null;
    if (u) {
      linkIdentity(u.id, provider, prof.uid);
      startSession(req, res, u.id);
      return res.redirect(toHash(st.next, { welcome: 'back' }));
    }
    setCookie(res, 'pending', sign({ provider, uid: prof.uid, email: prof.email ? prof.email.toLowerCase() : '', name: prof.name }, PENDING_TTL), { maxAge: PENDING_TTL });
    res.redirect(toHash('/signup', { step: 'finish' }));
  } catch (err) {
    console.error(`[OAuth:${provider}]`, err.message);
    res.redirect(toHash('/login', { error: err.message }));
  }
});
app.get('/api/auth/:provider/callback', oauthCallback);
app.post('/api/auth/:provider/callback', oauthCallback);

// ---------- 결제 ----------
app.get('/api/billing/quote', requireUser, (req, res) => {
  const { kids, months } = req.query;
  if (!validPlan(kids, months)) return bad(res, '상품을 다시 골라 주세요.');
  const q = quote(req.user.id, kids, months);
  res.json({ ...q, coupon: q.coupon ? { id: q.coupon.id, name: q.coupon.name } : null });
});
app.post('/api/billing/checkout', requireUser, wrap(async (req, res) => {
  const { kids, months } = req.body || {};
  if (!validPlan(kids, months)) return bad(res, '상품을 다시 골라 주세요.');
  if (isAdmin(req.user)) return bad(res, '관리자 계정은 결제 없이 모든 기능을 쓸 수 있어요.');
  const mode = paymentMode();
  if (mode === 'off') return bad(res, '결제 기능을 준비 중이에요. 잠시 후 다시 시도해 주세요.', 503);
  const { orderId, q } = createOrder(req.user, kids, Number(months));
  if (mode === 'demo') { completeDemo(orderId); return res.json({ mode, done: true }); }
  res.json({
    mode, clientKey: config.toss.clientKey, customerKey: req.user.customer_key, orderId, amount: q.total, orderName: q.name,
    successUrl: `${config.publicUrl}/api/billing/toss/success?orderId=${orderId}`, failUrl: `${config.publicUrl}/api/billing/toss/fail?orderId=${orderId}`,
  });
}));
app.get('/api/billing/toss/success', wrap(async (req, res) => {
  const { orderId, customerKey, authKey } = req.query;
  try { await completeBillingAuth({ orderId, customerKey, authKey }); res.redirect(toHash('/parent/member', { paid: '1' })); }
  catch (err) { failOrder(orderId, err.message); console.error('[결제]', err.message); res.redirect(toHash('/pricing', { error: err.message })); }
}));
app.get('/api/billing/toss/fail', (req, res) => {
  failOrder(req.query.orderId, req.query.message || '결제 실패');
  res.redirect(toHash('/pricing', { error: req.query.message || '결제를 완료하지 못했어요.' }));
});
app.post('/api/billing/auto-renew', requireUser, (req, res) => {
  try { setAutoRenew(req.user.id, !!req.body?.on); res.json({ ok: true }); } catch (err) { bad(res, err.message); }
});
app.post('/api/billing/refund', requireUser, wrap(async (req, res) => {
  try { await refund(req.user.id); res.json({ ok: true }); } catch (err) { bad(res, err.message); }
}));
app.get('/api/billing/refundable', requireUser, (req, res) => res.json({ refundable: !!refundable(req.user.id) }));

// ---------- 후기 ----------
app.get('/api/reviews', (req, res) => {
  const rows = db.prepare('SELECT id, user_id, rating, name, text, date FROM reviews ORDER BY created_at DESC LIMIT 500').all();
  res.json({ reviews: rows.map(r => ({ id: r.id, rating: r.rating, name: r.name, text: r.text, date: r.date, mine: req.user?.id === r.user_id })), hiddenSamples: kv.get('hiddenSamples', []) });
});
app.post('/api/reviews', requireUser, (req, res) => {
  const { rating, name, text } = req.body || {};
  if (![1, 2, 3, 4].includes(Number(rating)) || !String(name || '').trim() || !String(text || '').trim()) return bad(res, '후기 내용을 확인해 주세요.');
  if (!rateLimit('review:' + req.user.id, 5, DAY)) return bad(res, '오늘은 후기를 충분히 남겼어요. 내일 다시 써 주세요.', 429);
  const d = new Date();
  db.prepare('INSERT INTO reviews (id, user_id, rating, name, text, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id(), req.user.id, Number(rating), String(name).trim().slice(0, 20), String(text).trim().slice(0, 400), d.toISOString().slice(0, 10), now());
  res.json({ ok: true });
});
app.delete('/api/reviews/:id', requireUser, (req, res) => {
  if (req.params.id.startsWith('sample-')) {
    if (!isAdmin(req.user)) return bad(res, '관리자만 할 수 있어요.', 403);
    kv.set('hiddenSamples', [...new Set([...kv.get('hiddenSamples', []), req.params.id])]);
    return res.json({ ok: true });
  }
  const r = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!r) return bad(res, '후기를 찾을 수 없어요.', 404);
  if (r.user_id !== req.user.id && !isAdmin(req.user)) return bad(res, '내 후기만 지울 수 있어요.', 403);
  db.prepare('DELETE FROM reviews WHERE id = ?').run(r.id);
  res.json({ ok: true });
});

// ---------- 관리자 ----------
app.use('/api/admin', requireUser, requireAdmin);
app.get('/api/admin/users', (req, res) => {
  res.json(db.prepare('SELECT * FROM users ORDER BY created_at DESC').all().map(u => ({ ...userDoc(u), access: access(u), notifications: undefined })));
});
app.post('/api/admin/users/:id/action', (req, res) => {
  const u = getUser(req.params.id); if (!u) return bad(res, '회원을 찾을 수 없어요.', 404);
  const { act } = req.body || {};
  const t = now();
  switch (act) {
    case 'grant': {
      const months = [1, 6, 12].includes(Number(req.body.months)) ? Number(req.body.months) : 1;
      const cur = db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(u.id);
      const until = (cur && cur.until > t ? cur.until : t) + months * 30 * DAY;
      db.prepare(`INSERT INTO memberships (user_id, kids, months, since, until, auto_renew, monthly, granted) VALUES (?, 'two', ?, ?, ?, 0, 0, 1)
        ON CONFLICT(user_id) DO UPDATE SET until = excluded.until, months = excluded.months, granted = 1, auto_renew = 0`).run(u.id, months, t, until);
      db.prepare(`INSERT INTO payments (id, user_id, at, amount, description, months, status) VALUES (?, ?, ?, 0, ?, ?, '지급')`).run(id(), u.id, t, `관리자 지급 ${months}개월`, months);
      notify(u.id, `🎁 관리자가 멤버십 ${months}개월을 지급했어요.`, 'member'); break;
    }
    case 'revoke': db.prepare('DELETE FROM memberships WHERE user_id = ?').run(u.id); break;
    case 'trial': {
      const days = Math.min(90, Math.max(1, Number(req.body.days) || 7));
      db.prepare('UPDATE users SET trial_start = COALESCE(trial_start, ?), trial_bonus = trial_bonus + ? WHERE id = ?').run(t, days * DAY, u.id);
      notify(u.id, `⏳ 무료체험이 ${days}일 연장되었어요.`, 'member'); break;
    }
    case 'coupon': {
      const rate = Math.min(0.9, Math.max(0.05, Number(req.body.rate) || 0.5)), days = Math.min(365, Math.max(1, Number(req.body.days) || 14));
      db.prepare('INSERT INTO coupons (id, user_id, name, rate, welcome, expires_at) VALUES (?, ?, ?, ?, 0, ?)').run(id(), u.id, `특별쿠폰 ${Math.round(rate * 100)}%`, rate, t + days * DAY);
      notify(u.id, `🎟️ ${Math.round(rate * 100)}% 특별쿠폰이 도착했어요!`, 'coupon'); break;
    }
    case 'stars': {
      const n = Math.min(1000, Math.max(1, Number(req.body.n) || 10));
      const state = json(u.state, {});
      (state.profiles || []).forEach(p => { p.stars = (p.stars || 0) + n; });
      db.prepare('UPDATE users SET state = ? WHERE id = ?').run(JSON.stringify(state), u.id); break;
    }
    case 'role':
      if (u.id === req.user.id) return bad(res, '내 권한은 바꿀 수 없어요.');
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run(req.body.role === 'admin' ? 'admin' : 'parent', u.id); break;
    default: return bad(res, '알 수 없는 작업이에요.');
  }
  res.json({ ok: true });
});
app.delete('/api/admin/users/:id', (req, res) => {
  if (req.params.id === req.user.id) return bad(res, '내 계정은 여기서 지울 수 없어요.');
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id); res.json({ ok: true });
});
app.get('/api/admin/stats', (req, res) => {
  const t = now();
  res.json({
    users: db.prepare('SELECT COUNT(*) n FROM users').get().n,
    members: db.prepare('SELECT COUNT(*) n FROM memberships WHERE until > ?').get(t).n,
    revenue: db.prepare("SELECT COALESCE(SUM(amount),0) n FROM payments WHERE status = '결제완료'").get().n,
    reviews: db.prepare('SELECT COUNT(*) n FROM reviews').get().n,
    server: { node: process.version, uptimeMin: Math.round(process.uptime() / 60), load: os.loadavg()[0].toFixed(2), freeMemMB: Math.round(os.freemem() / 1048576), dbSizeKB: Math.round(fs.statSync(dbFile).size / 1024) },
    setup: { mail: mailReady, providers: enabledProviders(), payments: paymentMode(), publicUrl: config.publicUrl, tts: ttsStats() },
  });
});
app.get('/api/admin/export', (req, res) => {
  const dump = {};
  for (const t of ['users', 'identities', 'memberships', 'payments', 'coupons', 'notifications', 'reviews', 'kv']) dump[t] = db.prepare(`SELECT * FROM ${t}`).all();
  dump.memberships.forEach(m => { m.billing_key = m.billing_key ? '(숨김)' : null; });
  res.attachment(`sprout-english-export-${new Date().toISOString().slice(0, 10)}.json`).json(dump);
});
app.get('/api/admin/backup', (req, res) => {
  const file = path.join(os.tmpdir(), `sprout-backup-${Date.now()}.db`);
  db.exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
  res.download(file, `sprout-backup-${new Date().toISOString().slice(0, 10)}.db`, () => fs.rm(file, () => {}));
});

// ---------- 정적 파일 ----------
app.use('/api', (req, res) => bad(res, '없는 API예요.', 404));
// index.html의 ?v=dev 를 서버 시작 시각으로 바꿔, 업데이트 후 예전 JS/CSS 캐시와 섞이지 않게 한다
const BUILD = Date.now().toString(36);
const indexHtml = () => fs.readFileSync(path.join(config.publicDir, 'index.html'), 'utf8').replaceAll('?v=dev', '?v=' + BUILD);
app.get(['/', '/index.html'], (req, res) => res.set('Cache-Control', 'no-cache').type('html').send(indexHtml()));
app.use(express.static(config.publicDir, {
  index: 'index.html', extensions: ['html'],
  setHeaders: (res, file) => res.setHeader('Cache-Control', file.endsWith('.html') ? 'no-cache' : 'public, max-age=300'),
}));
app.use((req, res) => res.status(404).sendFile(path.join(config.publicDir, 'index.html')));
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') return bad(res, '요청 형식이 올바르지 않아요.', err.status || 400);
  console.error('[오류]', err);
  res.status(500).json({ error: '서버 오류가 났어요. 잠시 후 다시 시도해 주세요.' });
});

// ---------- 주기 작업 ----------
setInterval(cleanupSessions, 3600000).unref();
setInterval(() => renewalJob().catch(err => console.error('[자동갱신]', err.message)), 3600000).unref();
setTimeout(() => renewalJob().catch(err => console.error('[자동갱신]', err.message)), 15000).unref();

const server = app.listen(config.port, config.host, () => {
  console.log(`🌱 새싹영어 서버 시작: http://${config.host}:${config.port}  (공개 주소 ${config.publicUrl})`);
  console.log(`   DB ${dbFile} · AI 음성 ${ttsProvider() || '없음'} · 결제 ${paymentMode()} · SNS ${Object.entries(enabledProviders()).filter(([, v]) => v).map(([k]) => k).join(', ') || '없음'} · 관리자 ${config.adminEmails.join(', ') || '없음'}`);
  verifyMailer();
});
const stop = () => { server.close(() => { db.close(); process.exit(0); }); setTimeout(() => process.exit(0), 5000).unref(); };
process.on('SIGTERM', stop); process.on('SIGINT', stop);
