// 환불 금액 계산 (2026-11-19 사용자 결정: 1개월 단위)
//  · 결제 후 7일 이내이고 결제한 뒤 플러스 학습을 하지 않았으면 → 전액 환불 (부모페이지에서 바로, 쿠폰도 돌려준다)
//  · 그 밖에는 고객센터로 신청 → 관리자가 처리. 이용을 시작한 달(30일 단위, 시작한 달은 한 달로 친다)을 빼고 남은 달만큼 환불
//    예: 6개월 이용권을 10일 쓰면 1개월치를 빼고 5개월치 환불. 1개월 이용권은 이용을 시작하면 환불할 금액이 없다
//  플러스 학습: 3단계 이상 레슨을 마쳤거나 플러스 스토리북을 읽은 기록 (화면이 아이 프로필의 plusUsed 날짜와 레슨 날짜로 남긴다)
import { db, now, DAY } from './db.js';

const FREE_LEVELS = new Set(['A', 'B', 'C', 'D', 'E']); // 1~2단계 (public/js/data.js STAGES와 같다)
const MONTH = 30 * DAY;
const kstDay = t => new Date(t + 9 * 3600000).toISOString().slice(0, 10);
const parse = s => { try { return JSON.parse(s || '{}') || {}; } catch { return {}; } };

// 결제한 날(한국 날짜) 이후에 플러스 학습 기록이 있는지
export function plusUsedSince(uid, at) {
  const day = kstDay(at);
  const state = parse(db.prepare('SELECT state FROM users WHERE id = ?').get(uid)?.state);
  return (state.profiles || []).some(p =>
    (p.plusUsed && p.plusUsed >= day) ||
    Object.entries(p.progress || {}).some(([lv, lp]) => !FREE_LEVELS.has(lv) && (lp.lessons || []).some(l => l && l.date >= day)));
}

// 지금 환불하면 돌려줄 금액. 환불할 수 없으면 null
export function refundQuote(uid) {
  const p = db.prepare("SELECT * FROM payments WHERE user_id = ? AND status = '결제완료' AND amount > 0 ORDER BY at DESC LIMIT 1").get(uid);
  const m = db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(uid);
  const t = now();
  if (!p || !m || m.granted || m.until <= t) return null;
  const months = Number(p.months) || 1;
  if (t - p.at < 7 * DAY && !plusUsedSince(uid, p.at)) return { payment: p, amount: p.amount, full: true, months, usedMonths: 0, leftMonths: months };
  // 이번 결제로 늘어난 기간의 시작 (첫 결제는 남은 체험 기간 뒤, 이어서 산 이용권은 앞 이용권이 끝난 뒤)
  const start = Math.max(p.at, m.until - months * MONTH);
  const usedMonths = t < start ? 0 : Math.min(months, Math.ceil((t - start) / MONTH));
  const leftMonths = months - usedMonths;
  if (leftMonths <= 0) return null;
  const amount = usedMonths ? Math.floor(p.amount * leftMonths / months / 10) * 10 : p.amount;
  return { payment: p, amount, full: amount === p.amount, months, usedMonths, leftMonths };
}
