// 사용자 생성·조회, 알림, 프론트엔드로 보내는 사용자 문서(doc) 조립
import crypto from 'node:crypto';
import { db, id, now, json, DAY, tx } from './db.js';
import { config } from './env.js';

export const getUser = uid => db.prepare('SELECT * FROM users WHERE id = ?').get(uid);
export const getUserByEmail = email => email ? db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase()) : undefined;
export const isAdmin = u => !!u && (u.role === 'admin' || (u.email && config.adminEmails.includes(u.email)));

export function createUser({ email, parentName, provider, providerUid, marketing }) {
  return tx(() => {
    const uid = id(), t = now();
    const role = email && config.adminEmails.includes(email) ? 'admin' : 'parent';
    db.prepare(`INSERT INTO users (id, email, parent_name, role, created_at, last_login, marketing, customer_key, settings)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(uid, email || null, parentName, role, t, t, marketing ? 1 : 0, 'cus_' + crypto.randomBytes(12).toString('hex'),
      JSON.stringify({ notify: true, remindTime: '19:00', pin: '', lastRemind: null, gentle: true, marketing: !!marketing }));
    db.prepare('INSERT INTO identities (provider, provider_uid, user_id, created_at) VALUES (?, ?, ?, ?)').run(provider, providerUid || email, uid, t);
    db.prepare('INSERT INTO coupons (id, user_id, name, rate, welcome, expires_at) VALUES (?, ?, ?, ?, 1, ?)').run(id(), uid, '웰컴쿠폰', 0.2, t + 10 * DAY);
    notify(uid, '🎉 가입을 환영해요! 쿠폰함에 웰컴쿠폰이 발급되었어요.', 'coupon');
    return getUser(uid);
  });
}

export function linkIdentity(uid, provider, providerUid) {
  db.prepare('INSERT OR IGNORE INTO identities (provider, provider_uid, user_id, created_at) VALUES (?, ?, ?, ?)').run(provider, providerUid, uid, now());
}

export function notify(uid, text, kind = 'info') {
  db.prepare('INSERT INTO notifications (id, user_id, text, kind, at) VALUES (?, ?, ?, ?, ?)').run(id(), uid, String(text).slice(0, 300), kind, now());
  // 사용자당 최근 100개만 보관
  db.prepare(`DELETE FROM notifications WHERE user_id = ? AND id NOT IN (SELECT id FROM notifications WHERE user_id = ? ORDER BY at DESC LIMIT 100)`).run(uid, uid);
}

export function membershipOf(uid) {
  const m = db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(uid);
  if (!m) return null;
  return { kids: m.kids, months: m.months, since: m.since, until: m.until, autoRenew: !!m.auto_renew, monthly: m.monthly, granted: !!m.granted, card: !!m.billing_key };
}

// 프론트엔드 Store가 쓰는 모양 그대로 돌려준다
export function userDoc(u) {
  const state = json(u.state, {});
  return {
    id: u.id, email: u.email || '', parentName: u.parent_name, role: isAdmin(u) ? 'admin' : u.role,
    providers: db.prepare('SELECT provider FROM identities WHERE user_id = ?').all(u.id).map(r => r.provider),
    createdAt: u.created_at, lastLogin: u.last_login, trialStart: u.trial_start, trialBonus: u.trial_bonus,
    profiles: state.profiles || [], activeProfile: state.activeProfile || null, worksheets: state.worksheets || {},
    settings: json(u.settings, {}),
    membership: membershipOf(u.id),
    payments: db.prepare('SELECT * FROM payments WHERE user_id = ? AND status != ? ORDER BY at DESC').all(u.id, '대기').map(p => ({
      id: p.id, at: p.at, amount: p.amount, desc: p.description, coupon: p.coupon_label || '', status: p.status, method: p.method || '',
    })),
    coupons: db.prepare('SELECT * FROM coupons WHERE user_id = ? ORDER BY expires_at DESC').all(u.id).map(c => ({
      id: c.id, name: c.name, rate: c.rate, welcome: !!c.welcome, expires: c.expires_at, used: !!c.used,
    })),
    notifications: db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY at DESC LIMIT 100').all(u.id).map(n => ({
      id: n.id, text: n.text, kind: n.kind, at: n.at, read: !!n.read,
    })),
  };
}

export function access(u) {
  if (isAdmin(u)) return { ok: true, kind: 'admin' };
  const m = membershipOf(u.id), t = now();
  if (m && m.until > t) return { ok: true, kind: 'member', daysLeft: Math.ceil((m.until - t) / DAY) };
  if (u.trial_start) {
    const end = u.trial_start + 7 * DAY + (u.trial_bonus || 0);
    // 체험이 끝나도 1~2단계는 평생 무료로 계속 쓴다
    return end > t ? { ok: true, kind: 'trial', daysLeft: Math.ceil((end - t) / DAY) } : { ok: true, kind: 'free' };
  }
  return { ok: true, kind: 'trial', daysLeft: 7 };
}
