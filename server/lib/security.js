// 쿠키·세션·서명 토큰·요청 제한·보안 헤더
import crypto from 'node:crypto';
import { db, now, DAY } from './db.js';
import { config } from './env.js';
import { getUser, isAdmin } from './users.js';

const sha = s => crypto.createHash('sha256').update(s).digest('hex');
export const hashCode = (email, code) => sha(`${config.sessionSecret}:${email}:${code}`);

export function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('='); if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
export function setCookie(res, name, value, { maxAge, sameSite = 'Lax', httpOnly = true } = {}) {
  const secure = config.https || sameSite === 'None';
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', `SameSite=${sameSite}`];
  if (httpOnly) parts.push('HttpOnly');
  if (secure) parts.push('Secure');
  if (maxAge !== undefined) parts.push(`Max-Age=${Math.floor(maxAge / 1000)}`);
  res.append('Set-Cookie', parts.join('; '));
}
export const clearCookie = (res, name, sameSite) => setCookie(res, name, '', { maxAge: 0, sameSite });

// HMAC 서명 토큰 (OAuth state, 가입 대기 정보 등 짧게 쓰는 값)
export function sign(obj, ttlMs) {
  const body = Buffer.from(JSON.stringify({ ...obj, exp: now() + ttlMs })).toString('base64url');
  return body + '.' + crypto.createHmac('sha256', config.sessionSecret).update(body).digest('base64url');
}
export function unsign(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const want = crypto.createHmac('sha256', config.sessionSecret).update(body).digest('base64url');
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  try { const o = JSON.parse(Buffer.from(body, 'base64url').toString()); return o.exp > now() ? o : null; } catch { return null; }
}

// ---------- 세션 ----------
export function startSession(req, res, uid) {
  const token = crypto.randomBytes(32).toString('base64url');
  const ttl = config.sessionDays * DAY;
  db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at, user_agent) VALUES (?, ?, ?, ?, ?)')
    .run(sha(token), uid, now(), now() + ttl, String(req.headers['user-agent'] || '').slice(0, 200));
  db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now(), uid);
  setCookie(res, 'sid', token, { maxAge: ttl });
}
export function endSession(req, res) {
  const t = parseCookies(req).sid;
  if (t) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(t));
  clearCookie(res, 'sid');
}
export function loadSession(req, res, next) {
  const t = parseCookies(req).sid;
  if (t) {
    const s = db.prepare('SELECT * FROM sessions WHERE token_hash = ? AND expires_at > ?').get(sha(t), now());
    if (s) req.user = getUser(s.user_id);
  }
  next();
}
export const requireUser = (req, res, next) => req.user ? next() : res.status(401).json({ error: '로그인이 필요해요.' });
export const requireAdmin = (req, res, next) => isAdmin(req.user) ? next() : res.status(403).json({ error: '관리자만 할 수 있어요.' });
export function cleanupSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now());
  db.prepare('DELETE FROM login_codes WHERE expires_at < ?').run(now() - DAY);
  db.prepare('DELETE FROM payment_records WHERE at < ?').run(now() - 1830 * DAY); // 탈퇴 회원의 결제 기록은 5년 보관 후 지운다
}

// ---------- CSRF: 상태를 바꾸는 API는 사용자 정의 헤더가 있어야 한다 (다른 사이트 폼/스크립트 차단) ----------
export function csrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('x-sprout') !== '1') return res.status(403).json({ error: '잘못된 요청이에요.' });
  next();
}

// ---------- 요청 제한 (메모리) ----------
const buckets = new Map();
export function rateLimit(key, limit, windowMs) {
  const t = now(), b = buckets.get(key) || [];
  const recent = b.filter(x => t - x < windowMs);
  if (recent.length >= limit) { buckets.set(key, recent); return false; }
  recent.push(t); buckets.set(key, recent); return true;
}
setInterval(() => { const t = now(); for (const [k, v] of buckets) if (!v.some(x => t - x < 3600000)) buckets.delete(k); }, 600000).unref();

export function securityHeaders(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), geolocation=(), microphone=(self)',
    'Content-Security-Policy': [
      "default-src 'self'", "script-src 'self' https://js.tosspayments.com", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com", "img-src 'self' data:", "media-src 'self' data: blob:", "connect-src 'self' https://*.tosspayments.com",
      "frame-src https://*.tosspayments.com", "form-action 'self' https://*.tosspayments.com", "base-uri 'self'", "object-src 'none'",
    ].join('; '),
  });
  if (config.https) res.set('Strict-Transport-Security', 'max-age=31536000');
  next();
}
export const clientIp = req => req.ip || req.socket.remoteAddress || 'unknown';
