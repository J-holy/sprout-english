// 요금표와 결제 금액 계산 — 결제 금액은 항상 서버에서 계산한다
import { db, now, json } from './db.js';
import { config } from './env.js';

// 화면(public/js/data.js)과 같은 값. 1단계(알파벳, Level A~B)만 평생 무료, 2단계부터 플러스 (2026-11-26)
export const FREE_LEVELS = new Set(['A', 'B']);
export const freeLevelsOf = () => FREE_LEVELS;
// 2026-11-12 1개월 29,900원 → 19,900원. 6개월 10%, 12개월 20% 할인, 두 자녀는 한 자녀의 약 1.5배 (예전 비율 그대로)
// 2026-11-19 3개월 상품 추가(5% 할인). 카카오페이 정산 기준(서비스 기간 3개월 이하)에 맞는 상품
// 2026-11-26 과목별 요금: 새싹영어(en) · 새싹수학(ma) · 영어+수학(both). 영어는 그대로, 수학 9,900원, 함께는 두 과목 합에서 약 20% 할인
// 기간 할인은 과목마다 같다 (3개월 5%, 6개월 10%, 12개월 20%, 100원 단위), 형제·자매는 약 1.5배
export const SUBJECT_PLANS = {
  en: { one: { list: 19900, m1: 19900, m3: 18900, m6: 17900, m12: 15900 }, two: { list: 29900, m1: 29900, m3: 28400, m6: 26900, m12: 23900 } },
  ma: { one: { list: 9900, m1: 9900, m3: 9400, m6: 8900, m12: 7900 }, two: { list: 14900, m1: 14900, m3: 14200, m6: 13400, m12: 11900 } },
  both: { one: { list: 23900, m1: 23900, m3: 22700, m6: 21500, m12: 19100 }, two: { list: 35900, m1: 35900, m3: 34100, m6: 32300, m12: 28700 } },
};
export const SUBJECTS = { en: '새싹영어', ma: '새싹수학', both: '영어+수학' };
export const validSubject = s => Object.hasOwn(SUBJECT_PLANS, s);
// 예전 코드·화면 호환: PLANS는 영어 요금
export const PLANS = SUBJECT_PLANS.en;
// 기간 한정 1년 특가: 이 기간에 12개월을 결제하면 월 9,900원(두 자녀 14,900원). 쿠폰과 함께 쓰지 않는다.
// 화면(public/js/data.js의 PROMO)은 /api/config로 이 값을 받아 쓴다
// 2026-11-26 사용자 결정: 정식 오픈(12월 3일) 기념 1년 특가 — 오픈일부터 2주, 영어+수학 12개월에만 월 17,700원(형제·자매 26,500원)
const PROMO_ON = true;
export const PROMO = PROMO_ON ? {
  from: config.promoFrom || Date.parse('2026-12-03T00:00:00+09:00'), until: config.promoUntil || Date.parse('2026-12-16T23:59:59+09:00'),
  months: 12, subject: 'both', one: 17700, two: 26500,
} : { from: 0, until: 0, months: 12, subject: 'both', one: 17700, two: 26500 };
export const promoOn = (t = now()) => t >= PROMO.from && t <= PROMO.until;
export const WELCOME_RATE = 0.2; // 웰컴쿠폰: 첫 결제 20% 추가 할인
const round10 = n => Math.round(n / 10) * 10;
export const PLAN_MONTHS = [1, 3, 6, 12];
export const validPlan = (kids, months, subject = 'en') => validSubject(subject) && !!SUBJECT_PLANS[subject][kids] && PLAN_MONTHS.includes(Number(months));
// 요금은 고르는 것이 아니라 등록한 아이 수로 정해진다. 2명부터 형제·자매 요금
export const kidsOf = u => ((json(u.state, {}).profiles || []).length >= 2 ? 'two' : 'one');

export function bestCoupon(uid) {
  return db.prepare('SELECT * FROM coupons WHERE user_id = ? AND used = 0 AND expires_at > ? ORDER BY rate DESC LIMIT 1').get(uid, now()) || null;
}

// renew: 자동갱신 결제 (특가를 쓰지 않는다)
export function quote(uid, kids, months, { renew = false, subject = 'en' } = {}) {
  months = Number(months);
  if (!validSubject(subject)) subject = 'en';
  const P = SUBJECT_PLANS[subject][kids], member = P['m' + months];
  const name = `새싹스쿨 · ${SUBJECTS[subject]} 플러스${kids === 'two' ? ' 형제·자매' : ''} ${months}개월`;
  if (!renew && months === PROMO.months && subject === PROMO.subject && promoOn()) {
    const monthly = PROMO[kids];
    return { kids, months, subject, coupon: null, rate: 0, promo: true, monthly, total: monthly * months, list: P.list * months, name: name + ' (1년 특가)', couponLabel: '' };
  }
  const c = bestCoupon(uid);
  const rate = !c ? 0 : c.welcome ? WELCOME_RATE : c.rate;
  // 쿠폰은 멤버십 월 요금에서 할인하고 10원 단위로 맞춘다 (화면과 같은 계산)
  const monthly = rate ? round10(member * (1 - rate)) : member;
  return {
    kids, months, subject, coupon: c, rate, monthly, total: monthly * months, list: P.list * months,
    name,
    couponLabel: c ? `${c.name} ${Math.round(rate * 100)}%` : '',
  };
}
