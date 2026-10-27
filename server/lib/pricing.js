// 요금표와 결제 금액 계산 — 결제 금액은 항상 서버에서 계산한다
import { db, now } from './db.js';

export const PLANS = {
  one: { list: 58750, m1: 52900, m6: 49833, m12: 44000, coupon: { 1: 0.15, 6: 0.20, 12: 0.30 } },
  two: { list: 117500, m1: 99000, m6: 88000, m12: 76333, coupon: { 1: 0.20, 6: 0.30, 12: 0.40 } },
};
export const validPlan = (kids, months) => !!PLANS[kids] && [1, 6, 12].includes(Number(months));

export function bestCoupon(uid) {
  return db.prepare('SELECT * FROM coupons WHERE user_id = ? AND used = 0 AND expires_at > ? ORDER BY rate DESC LIMIT 1').get(uid, now()) || null;
}

export function quote(uid, kids, months) {
  months = Number(months);
  const P = PLANS[kids], member = P['m' + months];
  const c = bestCoupon(uid);
  const rate = !c ? 0 : c.welcome ? P.coupon[months] : c.rate;
  // 쿠폰은 정가에서 할인하고, 멤버십가보다 비싸지면 멤버십가를 쓴다
  const monthly = rate ? Math.min(member, Math.round(P.list * (1 - rate))) : member;
  return {
    kids, months, coupon: c, rate, monthly, total: monthly * months, list: P.list * months,
    name: `새싹영어 ${kids === 'two' ? '두 자녀' : '한 자녀'} ${months}개월`,
    couponLabel: c ? `${c.name} ${Math.round(rate * 100)}%` : '',
  };
}
