// 웹 푸시 알림 (무료) — 외부 패키지 없이 표준(RFC 8291 암호화 + RFC 8292 VAPID)대로 보낸다
// 홈 화면에 설치한 앱(아이폰·아이패드는 설치해야만)이나 브라우저로 매일 학습 시간 알림을 보낸다.
import crypto from 'node:crypto';
import { db, now, json, kv, id } from './db.js';
import { config } from './env.js';

const b64u = buf => Buffer.from(buf).toString('base64url');
const unb64u = s => Buffer.from(String(s || ''), 'base64url');

// 서버 열쇠(VAPID)는 처음 한 번 만들어 DB에 보관한다. 바꾸면 기존 구독이 모두 끊기니 그대로 둔다
function vapid() {
  let v = kv.get('vapid', null);
  if (!v) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    v = { pub: b64u(publicKey.export({ format: 'der', type: 'spki' }).subarray(-65)), jwk: privateKey.export({ format: 'jwk' }) };
    kv.set('vapid', v);
  }
  return v;
}
export const publicKey = () => vapid().pub;

function vapidHeader(endpoint) {
  const v = vapid();
  const head = b64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const body = b64u(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(now() / 1000) + 12 * 3600, sub: config.publicUrl.startsWith('https:') ? config.publicUrl : 'mailto:admin@example.com' }));
  const key = crypto.createPrivateKey({ key: v.jwk, format: 'jwk' });
  const sig = crypto.sign('sha256', Buffer.from(`${head}.${body}`), { key, dsaEncoding: 'ieee-p1363' });
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${v.pub}`;
}

// RFC 8291 (aes128gcm). 시험용으로 salt·임시 열쇠를 넣을 수 있다
export function encrypt(payload, p256dh, auth, test = {}) {
  const uaPublic = unb64u(p256dh), authSecret = unb64u(auth);
  const ecdh = crypto.createECDH('prime256v1');
  if (test.asPrivate) ecdh.setPrivateKey(unb64u(test.asPrivate)); else ecdh.generateKeys();
  const asPublic = ecdh.getPublicKey();
  const shared = ecdh.computeSecret(uaPublic);
  const ikm = Buffer.from(crypto.hkdfSync('sha256', shared, authSecret, Buffer.concat([Buffer.from('WebPush: info\0'), uaPublic, asPublic]), 32));
  const salt = test.salt ? unb64u(test.salt) : crypto.randomBytes(16);
  const cek = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16));
  const nonce = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12));
  const c = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const body = Buffer.concat([c.update(Buffer.concat([Buffer.from(payload), Buffer.from([2])])), c.final(), c.getAuthTag()]);
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
  return Buffer.concat([salt, rs, Buffer.from([asPublic.length]), asPublic, body]);
}

// 한 기기로 보낸다. 사라진 구독(404·410)은 지운다
export async function sendTo(sub, message) {
  const r = await fetch(sub.endpoint, {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { Authorization: vapidHeader(sub.endpoint), 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: '7200', Urgency: 'normal' },
    body: encrypt(JSON.stringify(message), sub.p256dh, sub.auth),
  });
  if (r.status === 404 || r.status === 410) { db.prepare('DELETE FROM push_subs WHERE endpoint = ?').run(sub.endpoint); return false; }
  if (!r.ok) throw new Error(`푸시 ${r.status} ${(await r.text()).slice(0, 120)}`);
  return true;
}

export async function sendToUser(uid, message) {
  let n = 0;
  for (const s of db.prepare('SELECT * FROM push_subs WHERE user_id = ?').all(uid)) {
    try { if (await sendTo(s, message)) n++; } catch (err) { console.error('[푸시]', err.message); }
  }
  return n;
}

export function saveSub(uid, sub) {
  const endpoint = String(sub?.endpoint || ''), p256dh = String(sub?.keys?.p256dh || ''), auth = String(sub?.keys?.auth || '');
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 1000 || unb64u(p256dh).length !== 65 || unb64u(auth).length !== 16) return false;
  db.prepare(`INSERT INTO push_subs (id, user_id, endpoint, p256dh, auth, created_at) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`).run(id(), uid, endpoint, p256dh, auth, now());
  // 한 계정에 기기 10대까지
  db.prepare('DELETE FROM push_subs WHERE user_id = ? AND id NOT IN (SELECT id FROM push_subs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10)').run(uid, uid);
  return true;
}
export const removeSub = (uid, endpoint) => db.prepare('DELETE FROM push_subs WHERE user_id = ? AND endpoint = ?').run(uid, String(endpoint || ''));

// ---------- 매일 학습 시간 알림 ----------
// 부모가 정한 시간(설정 › 매일 리마인더 시간, 한국 시간)부터 2시간 안에 한 번.
// 오늘 목표를 이미 채운 아이만 있으면 보내지 않는다.
const kst = (t = now()) => { const d = new Date(t + 9 * 3600000); return { day: d.toISOString().slice(0, 10), min: d.getUTCHours() * 60 + d.getUTCMinutes() }; };

export function reminderFor(u, t = now()) {
  const s = json(u.settings, {});
  if (s.notify === false) return null;
  const [h, m] = String(s.remindTime || '19:00').split(':').map(Number);
  const at = (h || 0) * 60 + (m || 0), k = kst(t);
  if (!(k.min >= at && k.min < at + 120)) return null;
  const left = (json(u.state, {}).profiles || []).filter(p => ((p.stamps || {})[k.day] || 0) < (p.dailyGoal || 1));
  if (!left.length) return null;
  const names = left.map(p => p.name).slice(0, 3).join(', ');
  return { day: k.day, msg: { title: '새싹스쿨 학습 시간이에요', body: `${names}의 오늘 레슨이 기다리고 있어요. 한 판만 해 볼까요?`, url: '/#/study', tag: 'remind' } };
}

export async function reminderJob() {
  const sent = kv.get('pushSent', {});
  const users = db.prepare('SELECT u.* FROM users u WHERE EXISTS (SELECT 1 FROM push_subs s WHERE s.user_id = u.id)').all();
  for (const u of users) {
    const r = reminderFor(u);
    if (!r || sent[u.id] === r.day) continue;
    sent[u.id] = r.day; kv.set('pushSent', sent);
    await sendToUser(u.id, r.msg);
  }
}
