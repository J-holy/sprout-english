// 요금표와 결제 금액 계산 — 결제 금액은 항상 서버에서 계산한다
import { db, now } from './db.js';

// 화면(public/js/data.js)과 같은 값. 1~2단계는 평생 무료, 3단계부터 플러스.
export const PLANS = {
  one: { list: 9900, m1: 9900, m6: 8900, m12: 7900 },
  two: { list: 14900, m1: 14900, m6: 12900, m12: 11900 },
};
export const WELCOME_RATE = 0.2; // 웰컴쿠폰: 첫 결제 20% 추가 할인
const round10 = n => Math.round(n / 10) * 10;
export const validPlan = (kids, months) => !!PLANS[kids] && [1, 6, 12].includes(Number(months));

export function bestCoupon(uid) {
  return db.prepare('SELECT * FROM coupons WHERE user_id = ? AND used = 0 AND expires_at > ? ORDER BY rate DESC LIMIT 1').get(uid, now()) || null;
}

export function quote(uid, kids, months) {
  months = Number(months);
  const P = PLANS[kids], member = P['m' + months];
  const c = bestCoupon(uid);
  const rate = !c ? 0 : c.welcome ? WELCOME_RATE : c.rate;
  // 쿠폰은 멤버십 월 요금에서 할인하고 10원 단위로 맞춘다 (화면과 같은 계산)
  const monthly = rate ? round10(member * (1 - rate)) : member;
  return {
    kids, months, coupon: c, rate, monthly, total: monthly * months, list: P.list * months,
    name: `새싹영어 ${kids === 'two' ? '두 자녀' : '한 자녀'} ${months}개월`,
    couponLabel: c ? `${c.name} ${Math.round(rate * 100)}%` : '',
  };
}
