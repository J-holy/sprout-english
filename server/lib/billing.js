// 결제: 토스페이먼츠 자동결제(빌링) — 카드 등록 → 첫 결제 → 기간 만료 시 자동 갱신 결제 → 7일 내 환불
// 토스 키가 없고 ALLOW_DEMO_PAYMENT=true면 즉시 완료되는 데모 결제로 동작한다.
import crypto from 'node:crypto';
import { db, id, now, DAY, tx } from './db.js';
import { config } from './env.js';
import { quote } from './pricing.js';
import { notify, getUser } from './users.js';

export const tossReady = () => !!(config.toss.clientKey && config.toss.secretKey);
export const paymentMode = () => tossReady() ? 'toss' : config.allowDemoPayment ? 'demo' : 'off';
const won = n => n.toLocaleString('ko-KR') + '원';

async function toss(path, body) {
  const r = await fetch('https://api.tosspayments.com' + path, {
    method: 'POST', signal: AbortSignal.timeout(20000),
    headers: { Authorization: 'Basic ' + Buffer.from(config.toss.secretKey + ':').toString('base64'), 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.message || `토스페이먼츠 오류 (${r.status})`);
  return j;
}

// 결제 대기 주문 만들기 (금액은 서버가 계산해서 저장)
export function createOrder(u, kids, months) {
  const q = quote(u.id, kids, months);
  const orderId = 'ord_' + crypto.randomBytes(10).toString('hex');
  db.prepare(`INSERT INTO payments (id, user_id, order_id, at, amount, description, kids, months, coupon_id, coupon_label, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '대기')`).run(id(), u.id, orderId, now(), q.total, q.name, kids, Number(months), q.coupon?.id || null, q.couponLabel);
  return { orderId, q };
}

// 결제가 끝난 주문을 멤버십에 반영
function fulfill(order, { paymentKey, method, billingKey, raw }) {
  tx(() => {
    const u = getUser(order.user_id), t = now();
    const cur = db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(u.id);
    // 처음 결제할 때는 남은 체험 기간을 멤버십 기간에 더해준다
    const bonus = !cur && u.trial_start ? Math.max(0, u.trial_start + 7 * DAY + (u.trial_bonus || 0) - t) : 0;
    const base = cur && cur.until > t ? cur.until : t;
    const until = base + order.months * 30 * DAY + bonus;
    const monthly = Math.round(order.amount / order.months);
    db.prepare(`INSERT INTO memberships (user_id, kids, months, since, until, auto_renew, monthly, granted, billing_key, renew_fail)
      VALUES (?, ?, ?, ?, ?, 1, ?, 0, ?, 0) ON CONFLICT(user_id) DO UPDATE SET kids = excluded.kids, months = excluded.months,
      since = CASE WHEN memberships.until > ? THEN memberships.since ELSE excluded.since END, until = excluded.until, auto_renew = 1,
      monthly = excluded.monthly, granted = 0, billing_key = COALESCE(excluded.billing_key, memberships.billing_key), renew_fail = 0`)
      .run(u.id, order.kids, order.months, t, until, monthly, billingKey || null, t);
    db.prepare('UPDATE payments SET status = ?, payment_key = ?, method = ?, raw = ?, at = ? WHERE id = ?')
      .run('결제완료', paymentKey || null, method || '', raw ? JSON.stringify(raw).slice(0, 4000) : null, t, order.id);
    if (order.coupon_id) db.prepare('UPDATE coupons SET used = 1 WHERE id = ?').run(order.coupon_id);
    notify(u.id, `💳 ${order.description} 결제가 완료되었어요. 결제 금액 ${won(order.amount)}`, 'member');
  });
}

export function completeDemo(orderId) {
  const order = db.prepare("SELECT * FROM payments WHERE order_id = ? AND status = '대기'").get(orderId);
  if (!order) throw new Error('주문을 찾을 수 없어요.');
  fulfill(order, { method: '데모' });
}

// 카드 등록(빌링 인증) 성공 콜백 → 빌링키 발급 → 첫 결제
export async function completeBillingAuth({ orderId, customerKey, authKey }) {
  const order = db.prepare("SELECT * FROM payments WHERE order_id = ? AND status = '대기'").get(orderId);
  if (!order) throw new Error('주문을 찾을 수 없거나 이미 처리되었어요.');
  const u = getUser(order.user_id);
  if (u.customer_key !== customerKey) throw new Error('결제 고객 정보가 일치하지 않아요.');
  const issued = await toss('/v1/billing/authorizations/issue', { authKey, customerKey });
  const pay = await toss(`/v1/billing/${issued.billingKey}`, { customerKey, amount: order.amount, orderId: order.order_id, orderName: order.description, customerEmail: u.email || undefined });
  if (pay.status !== 'DONE') throw new Error('결제가 완료되지 않았어요.');
  fulfill(order, { paymentKey: pay.paymentKey, method: pay.card?.company ? `카드(${pay.card.company})` : '카드', billingKey: issued.billingKey, raw: { paymentKey: pay.paymentKey, approvedAt: pay.approvedAt } });
}

export function failOrder(orderId, reason) {
  db.prepare("UPDATE payments SET status = '실패', raw = ? WHERE order_id = ? AND status = '대기'").run(JSON.stringify({ reason }).slice(0, 500), orderId);
}

export function setAutoRenew(uid, on) {
  const m = db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(uid);
  if (!m) throw new Error('이용 중인 멤버십이 없어요.');
  db.prepare('UPDATE memberships SET auto_renew = ?, renew_fail = 0 WHERE user_id = ?').run(on ? 1 : 0, uid);
  notify(uid, on ? '🔁 자동갱신을 다시 켰어요.' : `🛑 자동갱신을 해지했어요. ${new Date(m.until).toLocaleDateString('ko-KR')}까지 이용할 수 있고 이후 결제되지 않아요.`, 'member');
}

export function refundable(uid) {
  const p = db.prepare("SELECT * FROM payments WHERE user_id = ? AND status = '결제완료' AND amount > 0 ORDER BY at DESC LIMIT 1").get(uid);
  return p && now() - p.at < 7 * DAY ? p : null;
}
export async function refund(uid) {
  const p = refundable(uid);
  if (!p) throw new Error('환불 가능 기간(결제 후 7일)이 지났거나 환불할 결제가 없어요.');
  if (p.payment_key) await toss(`/v1/payments/${p.payment_key}/cancel`, { cancelReason: '고객 요청 (7일 이내 환불)' });
  tx(() => {
    db.prepare("UPDATE payments SET status = '환불완료' WHERE id = ?").run(p.id);
    // 이번 결제로 늘어난 기간만큼 줄이고, 남은 기간이 없으면 멤버십을 끝낸다
    const m = db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(uid);
    const paidLeft = db.prepare("SELECT COUNT(*) n FROM payments WHERE user_id = ? AND status = '결제완료' AND amount > 0").get(uid).n;
    if (m) {
      const until = m.until - p.months * 30 * DAY;
      // 남은 유료 결제가 없으면 멤버십을 지운다 (체험 기간이 남았다면 체험으로 돌아간다)
      if (until <= now() || (!paidLeft && !m.granted)) db.prepare('DELETE FROM memberships WHERE user_id = ?').run(uid);
      else db.prepare('UPDATE memberships SET until = ? WHERE user_id = ?').run(until, uid);
    }
    if (p.coupon_id) db.prepare('UPDATE coupons SET used = 0 WHERE id = ?').run(p.coupon_id); // 쓴 쿠폰을 돌려준다
    notify(uid, `↩️ ${won(p.amount)} 환불이 완료되었어요.`, 'member');
  });
}

// 매시간: 만료 3일 전 안내, 만료된 자동갱신 결제
export async function renewalJob() {
  const t = now();
  for (const m of db.prepare('SELECT * FROM memberships WHERE auto_renew = 1 AND granted = 0 AND until BETWEEN ? AND ?').all(t + 3 * DAY - 3600000, t + 3 * DAY)) {
    notify(m.user_id, `🔔 ${new Date(m.until).toLocaleDateString('ko-KR')}에 멤버십이 자동갱신돼요. 원하지 않으면 부모페이지에서 해지할 수 있어요.`, 'member');
  }
  for (const m of db.prepare('SELECT * FROM memberships WHERE auto_renew = 1 AND granted = 0 AND until <= ? AND renew_fail < 3').all(t)) {
    const u = getUser(m.user_id);
    if (!m.billing_key) {
      if (paymentMode() === 'demo') {
        const { orderId } = createOrder(u, m.kids, m.months); completeDemo(orderId);
      } else db.prepare('UPDATE memberships SET auto_renew = 0 WHERE user_id = ?').run(u.id);
      continue;
    }
    const { orderId } = createOrder(u, m.kids, m.months);
    const order = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId);
    try {
      const pay = await toss(`/v1/billing/${m.billing_key}`, { customerKey: u.customer_key, amount: order.amount, orderId, orderName: order.description + ' (자동갱신)', customerEmail: u.email || undefined });
      fulfill(order, { paymentKey: pay.paymentKey, method: '카드(자동갱신)', raw: { paymentKey: pay.paymentKey } });
    } catch (err) {
      failOrder(orderId, err.message);
      db.prepare('UPDATE memberships SET renew_fail = renew_fail + 1 WHERE user_id = ?').run(u.id);
      notify(u.id, `⚠️ 자동갱신 결제에 실패했어요 (${err.message}). 부모페이지에서 다시 결제해 주세요.`, 'member');
    }
  }
}
