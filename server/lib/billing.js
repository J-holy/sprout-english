// 결제: 모든 상품은 한 번만 결제하는 이용권(단건결제)이다. 자동갱신·정기결제는 없고, 기간이 끝나기 3일 전에 다시 구매하라고 알린다
//       (2026-11-19 카카오페이 입점 심사 회신에 따라 카드·카카오페이 모두 단건결제로 바꿈)
//   토스페이먼츠 카드 — 지금은 카드 인증(빌링) 화면으로 한 번 결제하고 빌링키는 저장하지 않는다 (토스 연동 때 일반 결제창으로 바꿀 예정) → 7일 내 환불
//   카카오페이 단건결제 — 결제 준비 → 카카오톡에서 결제 → 승인
//   예전 자동갱신 멤버십(빌링키·카카오페이 SID)을 처리하는 코드(renewalJob, retireKakao)는 남겨 둔다
// 결제사 키가 하나도 없고 ALLOW_DEMO_PAYMENT=true면 즉시 완료되는 데모 결제로 동작한다.
// 멤버십의 billing_key: 토스는 빌링키 그대로, 카카오페이는 'kakao:SID'
import crypto from 'node:crypto';
import { db, id, now, DAY, tx } from './db.js';
import { config } from './env.js';
import { quote, kidsOf } from './pricing.js';
import { notify, getUser } from './users.js';
import { applyReferralRewards } from './social.js';
import { refundQuote } from './refund.js';

export const tossReady = () => !!(config.toss.clientKey && config.toss.secretKey);
export const kakaoPayReady = () => !!config.kakaopay.secretKey;
// 쓸 수 있는 결제수단: card(토스페이먼츠), kakao(카카오페이)
export const payMethods = () => [tossReady() && 'card', kakaoPayReady() && 'kakao'].filter(Boolean);
export const paymentMode = () => tossReady() ? 'toss' : kakaoPayReady() ? 'kakao' : config.allowDemoPayment ? 'demo' : 'off';
const KAKAO_PREFIX = 'kakao:';
const isKakaoKey = k => typeof k === 'string' && k.startsWith(KAKAO_PREFIX);
const isKakaoPay = p => /^카카오페이/.test(p.method || '');
// 카카오페이는 모든 상품을 단건결제로 판다 (정기결제 없음)
const kakaoOneTime = () => true;
const kakaoCid = () => config.kakaopay.onetimeCid;
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

async function kakao(path, body, cid = config.kakaopay.cid) {
  const r = await fetch(config.kakaopay.api + path, {
    method: 'POST', signal: AbortSignal.timeout(20000),
    headers: { Authorization: `SECRET_KEY ${config.kakaopay.secretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ cid, ...body }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.extras?.method_result_message || j.error_message || `카카오페이 오류 (${r.status})`);
  return j;
}
// 바뀐 결제수단의 옛 카카오페이 정기결제 번호는 해지한다 (다시 쓰지 않게)
async function retireKakao(oldKey, newKey) {
  if (!isKakaoKey(oldKey) || oldKey === newKey || !kakaoPayReady()) return;
  try { await kakao('/online/v1/payment/manage/subscription/inactive', { sid: oldKey.slice(KAKAO_PREFIX.length) }); }
  catch (err) { console.error('[카카오페이 해지]', err.message); }
}
export const retireBillingKey = key => retireKakao(key, null);

// 결제 대기 주문 만들기 (금액은 서버가 계산해서 저장)
export function createOrder(u, kids, months, opts) {
  const q = quote(u.id, kids, months, opts);
  const orderId = 'ord_' + crypto.randomBytes(10).toString('hex');
  db.prepare(`INSERT INTO payments (id, user_id, order_id, at, amount, description, kids, months, coupon_id, coupon_label, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '대기')`).run(id(), u.id, orderId, now(), q.total, q.name, kids, Number(months), q.coupon?.id || null, q.couponLabel);
  return { orderId, q };
}

// 결제가 끝난 주문을 멤버십에 반영
// oneTime: 자동갱신 없는 단건결제 (지금은 모든 결제) — 자동갱신을 끄고 예전 결제수단(빌링키)도 지운다
function fulfill(order, { paymentKey, method, billingKey, raw, oneTime = false }) {
  tx(() => {
    const u = getUser(order.user_id), t = now();
    const cur = db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(u.id);
    // 처음 결제할 때는 남은 체험 기간을 멤버십 기간에 더해준다
    const bonus = !cur && u.trial_start ? Math.max(0, u.trial_start + 7 * DAY + (u.trial_bonus || 0) - t) : 0;
    const base = cur && cur.until > t ? cur.until : t;
    const until = base + order.months * 30 * DAY + bonus;
    const monthly = Math.round(order.amount / order.months);
    db.prepare(`INSERT INTO memberships (user_id, kids, months, since, until, auto_renew, monthly, granted, billing_key, renew_fail)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 0) ON CONFLICT(user_id) DO UPDATE SET kids = excluded.kids, months = excluded.months,
      since = CASE WHEN memberships.until > ? THEN memberships.since ELSE excluded.since END, until = excluded.until, auto_renew = excluded.auto_renew,
      monthly = excluded.monthly, granted = 0, billing_key = CASE WHEN ? THEN NULL ELSE COALESCE(excluded.billing_key, memberships.billing_key) END, renew_fail = 0`)
      .run(u.id, order.kids, order.months, t, until, oneTime ? 0 : 1, monthly, oneTime ? null : billingKey || null, t, oneTime ? 1 : 0);
    db.prepare('UPDATE payments SET status = ?, payment_key = ?, method = ?, raw = ?, at = ? WHERE id = ?')
      .run('결제완료', paymentKey || null, method || '', raw ? JSON.stringify(raw).slice(0, 4000) : null, t, order.id);
    if (order.coupon_id) db.prepare('UPDATE coupons SET used = 1 WHERE id = ?').run(order.coupon_id);
    notify(u.id, `💳 ${order.description} 결제가 완료되었어요. 결제 금액 ${won(order.amount)}`, 'member');
  });
  // 무료일 때 쌓인 추천 보상을 첫 결제 때 더해 준다
  try { applyReferralRewards(order.user_id); } catch (err) { console.error('[추천 보상]', err.message); }
}

export function completeDemo(orderId) {
  const order = db.prepare("SELECT * FROM payments WHERE order_id = ? AND status = '대기'").get(orderId);
  if (!order) throw new Error('주문을 찾을 수 없어요.');
  fulfill(order, { method: '데모 · 단건', oneTime: true });
}

// 카드 인증(빌링 인증) 성공 콜백 → 빌링키 발급 → 한 번 결제 (빌링키는 저장하지 않는다)
export async function completeBillingAuth({ orderId, customerKey, authKey }) {
  const order = db.prepare("SELECT * FROM payments WHERE order_id = ? AND status = '대기'").get(orderId);
  if (!order) throw new Error('주문을 찾을 수 없거나 이미 처리되었어요.');
  const u = getUser(order.user_id);
  if (u.customer_key !== customerKey) throw new Error('결제 고객 정보가 일치하지 않아요.');
  const issued = await toss('/v1/billing/authorizations/issue', { authKey, customerKey });
  const pay = await toss(`/v1/billing/${issued.billingKey}`, { customerKey, amount: order.amount, orderId: order.order_id, orderName: order.description, customerEmail: u.email || undefined });
  if (pay.status !== 'DONE') throw new Error('결제가 완료되지 않았어요.');
  const old = db.prepare('SELECT billing_key FROM memberships WHERE user_id = ?').get(order.user_id)?.billing_key;
  // 단건결제: 빌링키를 저장하지 않아 다시 결제되지 않는다
  fulfill(order, { paymentKey: pay.paymentKey, method: `카드(${pay.card?.company ? pay.card.company + ' · ' : ''}단건)`, oneTime: true, raw: { paymentKey: pay.paymentKey, approvedAt: pay.approvedAt } });
  await retireKakao(old, null);
}

// 카카오페이 1회차: 결제 준비 → 화면은 카카오페이 결제 화면으로 이동 (tid는 승인 때 쓰려고 주문에 적어 둔다)
export async function startKakaoPay(u, orderId) {
  const order = db.prepare("SELECT * FROM payments WHERE order_id = ? AND status = '대기'").get(orderId);
  const back = path => `${config.publicUrl}/api/billing/kakao/${path}?orderId=${orderId}`;
  const r = await kakao('/online/v1/payment/ready', {
    partner_order_id: orderId, partner_user_id: u.customer_key, item_name: order.description, quantity: 1,
    total_amount: order.amount, tax_free_amount: 0, approval_url: back('approve'), cancel_url: back('cancel'), fail_url: back('fail'),
  }, kakaoCid(order.months));
  db.prepare('UPDATE payments SET payment_key = ? WHERE id = ?').run(r.tid, order.id);
  return { pcUrl: r.next_redirect_pc_url, mobileUrl: r.next_redirect_mobile_url };
}
// 카카오페이 결제 화면에서 인증을 마치면 approval_url로 pg_token과 함께 돌아온다 → 승인하고 SID를 저장 (단건결제는 SID 없음)
export async function completeKakaoPay(orderId, pgToken) {
  const order = db.prepare("SELECT * FROM payments WHERE order_id = ? AND status = '대기'").get(orderId);
  if (!order || !order.payment_key || !pgToken) throw new Error('주문을 찾을 수 없거나 이미 처리되었어요.');
  const u = getUser(order.user_id);
  const pay = await kakao('/online/v1/payment/approve', { tid: order.payment_key, partner_order_id: orderId, partner_user_id: u.customer_key, pg_token: pgToken }, kakaoCid(order.months));
  if (pay.amount && pay.amount.total !== order.amount) throw new Error('결제 금액이 주문과 달라요.');
  const old = db.prepare('SELECT billing_key FROM memberships WHERE user_id = ?').get(u.id)?.billing_key;
  const oneTime = kakaoOneTime(order.months), key = !oneTime && pay.sid ? KAKAO_PREFIX + pay.sid : null;
  fulfill(order, { paymentKey: pay.tid, method: kakaoMethod(pay, false, oneTime), billingKey: key, oneTime, raw: { tid: pay.tid, aid: pay.aid, approvedAt: pay.approved_at } });
  // 단건결제로 바꾸면 예전 카카오페이 정기결제 번호도 해지한다 (다시 자동 결제하지 않게)
  if (key || oneTime) await retireKakao(old, key);
}
const kakaoMethod = (pay, renew, oneTime) => `카카오페이(${pay.payment_method_type === 'MONEY' ? '머니' : pay.card_info?.kakaopay_issuer_corp || '카드'}${renew ? ' · 자동갱신' : oneTime ? ' · 단건' : ''})`;

export function failOrder(orderId, reason) {
  db.prepare("UPDATE payments SET status = '실패', raw = ? WHERE order_id = ? AND status = '대기'").run(JSON.stringify({ reason }).slice(0, 500), orderId);
}

export function setAutoRenew(uid, on) {
  const m = db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(uid);
  if (!m) throw new Error('이용 중인 멤버십이 없어요.');
  // 단건결제 이용권은 결제수단이 저장되어 있지 않아 자동갱신을 켤 수 없다
  if (on && !m.billing_key && paymentMode() !== 'demo') throw new Error('이 이용권은 한 번만 결제한 상품이라 자동갱신이 없어요. 기간이 끝나기 전에 요금제에서 다시 구매해 주세요.');
  db.prepare('UPDATE memberships SET auto_renew = ?, renew_fail = 0 WHERE user_id = ?').run(on ? 1 : 0, uid);
  notify(uid, on ? '🔁 자동갱신을 다시 켰어요.' : `🛑 자동갱신을 해지했어요. ${new Date(m.until).toLocaleDateString('ko-KR')}까지 이용할 수 있고 이후 결제되지 않아요.`, 'member');
}

// 환불 규칙은 refund.js (7일 이내·플러스 학습 전이면 전액, 아니면 1개월 단위로 남은 달만큼)
export const refundable = uid => refundQuote(uid);
// admin: 관리자 화면에서 처리하는 1개월 단위 환불. 회원이 직접 할 수 있는 것은 전액 환불뿐이다
export async function refund(uid, { admin = false } = {}) {
  const q = refundQuote(uid), p = q?.payment;
  if (!q) throw new Error('환불할 수 있는 결제가 없어요. 1개월 이용권은 이용을 시작하면 환불되지 않아요.');
  if (!admin && !q.self) throw new Error('결제 후 플러스 학습을 시작했거나 7일이 지나서 바로 환불할 수 없어요. 고객센터로 신청하면 이용한 달을 빼고 남은 달만큼 환불해 드려요.');
  if (p.payment_key && isKakaoPay(p)) await kakao('/online/v1/payment/cancel', { tid: p.payment_key, cancel_amount: q.amount, cancel_tax_free_amount: 0 }, /· 단건/.test(p.method) ? config.kakaopay.onetimeCid : config.kakaopay.cid);
  else if (p.payment_key) await toss(`/v1/payments/${p.payment_key}/cancel`, q.full ? { cancelReason: '고객 요청 (전액 환불)' } : { cancelReason: `고객 요청 (남은 ${q.leftMonths}개월 환불)`, cancelAmount: q.amount });
  const key = db.prepare('SELECT billing_key FROM memberships WHERE user_id = ?').get(uid)?.billing_key;
  tx(() => {
    const raw = (() => { try { return JSON.parse(p.raw || '{}') || {}; } catch { return {}; } })();
    db.prepare('UPDATE payments SET status = ?, raw = ? WHERE id = ?').run(q.full ? '환불완료' : `부분환불 ${won(q.amount)}`, JSON.stringify({ ...raw, refund: { amount: q.amount, usedMonths: q.usedMonths, at: now() } }).slice(0, 4000), p.id);
    // 환불한 달만큼 기간을 줄이고, 남은 기간이 없으면 멤버십을 끝낸다
    const m = db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(uid);
    const paidLeft = db.prepare("SELECT COUNT(*) n FROM payments WHERE user_id = ? AND status = '결제완료' AND amount > 0").get(uid).n;
    if (m) {
      const until = m.until - q.leftMonths * 30 * DAY;
      // 남은 유료 결제가 없으면 멤버십을 지운다 (체험 기간이 남았다면 체험으로 돌아간다)
      if (until <= now() || (q.full && !paidLeft && !m.granted)) db.prepare('DELETE FROM memberships WHERE user_id = ?').run(uid);
      else db.prepare('UPDATE memberships SET until = ? WHERE user_id = ?').run(until, uid);
    }
    if (q.full && p.coupon_id) db.prepare('UPDATE coupons SET used = 0 WHERE id = ?').run(p.coupon_id); // 전액 환불이면 쓴 쿠폰을 돌려준다
    notify(uid, q.full ? `↩️ ${won(q.amount)} 환불이 완료되었어요.` : `↩️ 이용한 ${q.usedMonths}개월을 빼고 남은 ${q.leftMonths}개월치 ${won(q.amount)} 환불이 완료되었어요.`, 'member');
  });
  // 환불로 멤버십이 끝났으면 카카오페이 정기결제 번호도 해지한다
  if (!db.prepare('SELECT 1 FROM memberships WHERE user_id = ?').get(uid)) await retireKakao(key, null);
}

// 매시간: 만료 3일 전 안내, 만료된 자동갱신 결제
export async function renewalJob() {
  const t = now();
  for (const m of db.prepare('SELECT * FROM memberships WHERE auto_renew = 1 AND granted = 0 AND until BETWEEN ? AND ?').all(t + 3 * DAY - 3600000, t + 3 * DAY)) {
    notify(m.user_id, `🔔 ${new Date(m.until).toLocaleDateString('ko-KR')}에 멤버십이 자동갱신돼요. 결제 금액은 ${quote(m.user_id, kidsOf(getUser(m.user_id)), m.months, { renew: true }).total.toLocaleString('ko-KR')}원이에요. 원하지 않으면 부모페이지에서 해지할 수 있어요.`, 'member');
  }
  // 단건결제 이용권(자동갱신 없음): 끝나기 3일 전에 다시 구매하라고 알린다
  for (const m of db.prepare('SELECT * FROM memberships WHERE auto_renew = 0 AND granted = 0 AND billing_key IS NULL AND until BETWEEN ? AND ?').all(t + 3 * DAY - 3600000, t + 3 * DAY)) {
    notify(m.user_id, `🔔 ${new Date(m.until).toLocaleDateString('ko-KR')}에 플러스 이용 기간이 끝나요. 이 이용권은 자동으로 다시 결제되지 않아요. 계속 이용하려면 요금제에서 이용권을 다시 구매해 주세요.`, 'member');
  }
  for (const m of db.prepare('SELECT * FROM memberships WHERE auto_renew = 1 AND granted = 0 AND until <= ? AND renew_fail < 3').all(t)) {
    const u = getUser(m.user_id);
    if (!m.billing_key) {
      if (paymentMode() === 'demo') {
        const { orderId } = createOrder(u, kidsOf(u), m.months, { renew: true }); completeDemo(orderId);
      } else db.prepare('UPDATE memberships SET auto_renew = 0 WHERE user_id = ?').run(u.id);
      continue;
    }
    const { orderId } = createOrder(u, kidsOf(u), m.months, { renew: true });
    const order = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId);
    try {
      if (isKakaoKey(m.billing_key)) {
        // partner_user_id는 SID를 받은 첫 결제와 같아야 한다
        const pay = await kakao('/online/v1/payment/subscription', { sid: m.billing_key.slice(KAKAO_PREFIX.length), partner_order_id: orderId, partner_user_id: u.customer_key,
          item_name: order.description + ' (자동갱신)', quantity: 1, total_amount: order.amount, tax_free_amount: 0 });
        fulfill(order, { paymentKey: pay.tid, method: kakaoMethod(pay, true), raw: { tid: pay.tid, aid: pay.aid } });
      } else {
        const pay = await toss(`/v1/billing/${m.billing_key}`, { customerKey: u.customer_key, amount: order.amount, orderId, orderName: order.description + ' (자동갱신)', customerEmail: u.email || undefined });
        fulfill(order, { paymentKey: pay.paymentKey, method: '카드(자동갱신)', raw: { paymentKey: pay.paymentKey } });
      }
    } catch (err) {
      failOrder(orderId, err.message);
      db.prepare('UPDATE memberships SET renew_fail = renew_fail + 1 WHERE user_id = ?').run(u.id);
      notify(u.id, `⚠️ 자동갱신 결제에 실패했어요 (${err.message}). 부모페이지에서 다시 결제해 주세요.`, 'member');
    }
  }
}
