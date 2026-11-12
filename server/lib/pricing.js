// 요금표와 결제 금액 계산 — 결제 금액은 항상 서버에서 계산한다
import { db, now, json } from './db.js';
import { config } from './env.js';

// 화면(public/js/data.js)과 같은 값. 1~2단계는 평생 무료, 3단계부터 플러스.
// 2026-11-12 1개월 29,900원 → 19,900원. 6개월 10%, 12개월 20% 할인, 두 자녀는 한 자녀의 약 1.5배 (예전 비율 그대로)
export const PLANS = {
  one: { list: 19900, m1: 19900, m6: 17900, m12: 15900 },
  two: { list: 29900, m1: 29900, m6: 26900, m12: 23900 },
};
// 기간 한정 1년 특가: 이 기간에 12개월을 결제하면 월 9,900원(두 자녀 14,900원). 쿠폰과 함께 쓰지 않고, 1년 뒤 자동갱신은 정가.
// 화면(public/js/data.js의 PROMO)은 /api/config로 이 값을 받아 쓴다
export const PROMO = {
  from: config.promoFrom || Date.parse('2026-11-20T00:00:00+09:00'), until: config.promoUntil || Date.parse('2026-12-03T23:59:59+09:00'),
  months: 12, one: 9900, two: 14900,
};
export const promoOn = (t = now()) => t >= PROMO.from && t <= PROMO.until;
export const WELCOME_RATE = 0.2; // 웰컴쿠폰: 첫 결제 20% 추가 할인
const round10 = n => Math.round(n / 10) * 10;
export const validPlan = (kids, months) => !!PLANS[kids] && [1, 6, 12].includes(Number(months));
// 요금은 고르는 것이 아니라 등록한 아이 수로 정해진다. 2명부터 형제·자매 요금
export const kidsOf = u => ((json(u.state, {}).profiles || []).length >= 2 ? 'two' : 'one');

export function bestCoupon(uid) {
  return db.prepare('SELECT * FROM coupons WHERE user_id = ? AND used = 0 AND expires_at > ? ORDER BY rate DESC LIMIT 1').get(uid, now()) || null;
}

// renew: 자동갱신 결제 (특가를 쓰지 않는다)
export function quote(uid, kids, months, { renew = false } = {}) {
  months = Number(months);
  const P = PLANS[kids], member = P['m' + months];
  const name = `새싹스쿨 · 새싹영어 플러스${kids === 'two' ? ' 형제·자매' : ''} ${months}개월`;
  if (!renew && months === PROMO.months && promoOn()) {
    const monthly = PROMO[kids];
    return { kids, months, coupon: null, rate: 0, promo: true, monthly, total: monthly * months, list: P.list * months, name: name + ' (1년 특가)', couponLabel: '' };
  }
  const c = bestCoupon(uid);
  const rate = !c ? 0 : c.welcome ? WELCOME_RATE : c.rate;
  // 쿠폰은 멤버십 월 요금에서 할인하고 10원 단위로 맞춘다 (화면과 같은 계산)
  const monthly = rate ? round10(member * (1 - rate)) : member;
  return {
    kids, months, coupon: c, rate, monthly, total: monthly * months, list: P.list * months,
    name,
    couponLabel: c ? `${c.name} ${Math.round(rate * 100)}%` : '',
  };
}
