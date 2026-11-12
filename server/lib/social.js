// 회원번호·추천인·친구·응원 쪽지
// - 회원번호: 무작위 숫자 7자리. 친구 추가와 추천인 코드로 같이 쓴다 (이메일을 드러내지 않는다)
// - 추천: 가입할 때 추천인 회원번호를 넣으면 1명. 5명마다 추천한 사람이 유료 회원이면 이용 기간 1개월 연장
//   (유료가 아닐 때 쌓인 보상은 첫 결제 때 함께 준다)
// - 친구: 아이 프로필끼리 번호로 신청 → 받는 쪽(아이 또는 부모)이 수락. 검색은 없다
// - 쪽지: 정해진 응원 문구·스티커 번호만 오간다 (직접 쓴 글은 받지 않는다)
import { db, id, now, DAY, json } from './db.js';
import { notify, getUser, newMemberNo } from './users.js';

export const REFERRALS_PER_REWARD = 5;
export const MESSAGE_CODES = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

// ---------- 회원번호 ----------
// 번호가 없는 예전 회원에게 번호를 준다 (서버를 켤 때 한 번)
export function backfillMemberNos() {
  const rows = db.prepare('SELECT id FROM users WHERE member_no IS NULL').all();
  for (const r of rows) db.prepare('UPDATE users SET member_no = ? WHERE id = ?').run(newMemberNo(), r.id);
  return rows.length;
}
export const userByNo = no => (/^\d{7}$/.test(String(no || '')) ? db.prepare('SELECT * FROM users WHERE member_no = ?').get(String(no)) : undefined);

// ---------- 추천 ----------
const paidActive = uid => !!db.prepare('SELECT 1 FROM memberships WHERE user_id = ? AND granted = 0 AND until > ?').get(uid, now());
export function referralInfo(uid) {
  const u = getUser(uid);
  const count = db.prepare('SELECT COUNT(*) n FROM users WHERE referred_by = ?').get(uid).n;
  const earned = Math.floor(count / REFERRALS_PER_REWARD);
  return { count, rewards: u.referral_rewards || 0, pending: Math.max(0, earned - (u.referral_rewards || 0)), per: REFERRALS_PER_REWARD, paid: paidActive(uid) };
}
// 받을 보상이 있고 유료 회원이면 1개월씩 늘린다. 가입·결제가 끝날 때 부른다
export function applyReferralRewards(uid) {
  const info = referralInfo(uid);
  if (!info.pending || !info.paid) return 0;
  const n = info.pending;
  db.prepare('UPDATE memberships SET until = until + ? WHERE user_id = ?').run(n * 30 * DAY, uid);
  db.prepare('UPDATE users SET referral_rewards = referral_rewards + ? WHERE id = ?').run(n, uid);
  db.prepare(`INSERT INTO payments (id, user_id, at, amount, description, months, status) VALUES (?, ?, ?, 0, ?, ?, '지급')`).run(id(), uid, now(), `추천 보상 ${n}개월 연장`, n);
  notify(uid, `🎁 추천한 친구가 ${info.count}명이 되어 이용 기간이 ${n}개월 늘어났어요. 고마워요!`, 'member');
  return n;
}
// 새 회원 가입 직후: 추천인을 기록하고 추천인에게 알린다
export function addReferral(newUid, no) {
  const ref = userByNo(no);
  if (!ref || ref.id === newUid) return false;
  db.prepare('UPDATE users SET referred_by = ? WHERE id = ? AND referred_by IS NULL').run(ref.id, newUid);
  const info = referralInfo(ref.id);
  const left = REFERRALS_PER_REWARD - (info.count % REFERRALS_PER_REWARD);
  if (!applyReferralRewards(ref.id)) {
    notify(ref.id, info.pending && !info.paid
      ? `🙌 추천으로 새 회원이 가입했어요 (${info.count}명). 플러스를 결제하면 쌓인 보상 ${info.pending}개월이 더해져요.`
      : `🙌 추천으로 새 회원이 가입했어요 (${info.count}명). ${left}명 더 추천하면 이용 기간 1개월이 늘어나요.`, 'member');
  }
  return true;
}

// ---------- 친구 ----------
const kidsOf = u => (json(u.state, {}).profiles || []);
const kidOf = (u, kid) => kidsOf(u).find(p => p.id === kid);
const kidName = (u, kid) => (kidOf(u, kid) || {}).name || '친구';
// 친구에게 보여 주는 것: 이름·캐릭터·꾸미기·별·레벨 계산에 필요한 레슨 완료 여부·최근 학습일
function publicKid(u, kid) {
  const p = kidOf(u, kid); if (!p) return null;
  const progress = {};
  for (const [lv, v] of Object.entries(p.progress || {})) progress[lv] = { lessons: (v.lessons || []).map(x => (x ? 1 : 0)) };
  const since = new Date(now() - 14 * DAY).toISOString().slice(0, 10);
  const stamps = Object.fromEntries(Object.entries(p.stamps || {}).filter(([d]) => d >= since));
  return { id: p.id, name: p.name, avatar: p.avatar, wear: p.wear || {}, stars: p.stars || 0, startLevel: p.startLevel || 'A', progress, stamps, stories: Object.keys(p.stories || {}).length };
}
// 다른 집 번호로 찾았을 때 보여 주는 아이 목록 (이름·캐릭터만)
export function lookupKids(no, me) {
  const u = userByNo(no);
  if (!u || u.id === me) return null;
  return kidsOf(u).map(p => ({ id: p.id, name: p.name, avatar: p.avatar }));
}
const pairOf = (u1, k1, u2, k2) => db.prepare(`SELECT * FROM friends WHERE (a_user = ? AND a_kid = ? AND b_user = ? AND b_kid = ?)
  OR (a_user = ? AND a_kid = ? AND b_user = ? AND b_kid = ?)`).get(u1, k1, u2, k2, u2, k2, u1, k1);

export function requestFriend(me, myKid, no, toKid) {
  const meU = getUser(me), to = userByNo(no);
  if (!kidOf(meU, myKid)) throw new Error('내 아이 프로필을 골라 주세요.');
  if (!to || to.id === me || !kidOf(to, toKid)) throw new Error('친구를 찾을 수 없어요. 회원번호를 확인해 주세요.');
  const old = pairOf(me, myKid, to.id, toKid);
  if (old) {
    if (old.status === 'accepted') throw new Error('이미 친구예요.');
    if (old.status === 'blocked') throw new Error('친구 신청을 보낼 수 없어요.');
    // 상대가 먼저 신청해 둔 상태면 바로 친구가 된다
    if (old.b_user === me && old.b_kid === myKid) return respondFriend(me, old.id, 'accept');
    throw new Error('이미 친구 신청을 보냈어요. 수락을 기다려 주세요.');
  }
  if (db.prepare("SELECT COUNT(*) n FROM friends WHERE a_user = ? AND status = 'pending'").get(me).n >= 30) throw new Error('수락을 기다리는 신청이 너무 많아요.');
  db.prepare("INSERT INTO friends (id, a_user, a_kid, b_user, b_kid, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', ?)").run(id(), me, myKid, to.id, toKid, now());
  notify(to.id, `👫 ${kidName(meU, myKid)}(이)가 ${kidName(to, toKid)}에게 친구 신청을 보냈어요. 친구 화면이나 부모페이지 › 친구·추천에서 수락할 수 있어요.`, 'friend');
  return { status: 'pending' };
}

export function respondFriend(me, fid, action) {
  const f = db.prepare('SELECT * FROM friends WHERE id = ?').get(fid);
  if (!f || (f.a_user !== me && f.b_user !== me)) throw new Error('친구 정보를 찾을 수 없어요.');
  const t = now();
  if (action === 'accept') {
    if (f.b_user !== me || f.status !== 'pending') throw new Error('수락할 수 있는 신청이 아니에요.');
    db.prepare("UPDATE friends SET status = 'accepted', responded_at = ? WHERE id = ?").run(t, fid);
    const a = getUser(f.a_user), b = getUser(f.b_user);
    notify(f.a_user, `🎉 ${kidName(b, f.b_kid)}(이)가 ${kidName(a, f.a_kid)}의 친구 신청을 수락했어요.`, 'friend');
    notify(f.b_user, `👫 ${kidName(b, f.b_kid)}(이)가 ${kidName(a, f.a_kid)}와 친구가 되었어요.`, 'friend');
    return { status: 'accepted' };
  }
  if (action === 'block') {
    db.prepare("UPDATE friends SET status = 'blocked', blocked_by = ?, responded_at = ? WHERE id = ?").run(me, t, fid);
    db.prepare('DELETE FROM kid_messages WHERE friend_id = ?').run(fid);
    return { status: 'blocked' };
  }
  if (action === 'unblock') {
    if (f.status !== 'blocked' || f.blocked_by !== me) throw new Error('차단을 풀 수 없어요.');
    db.prepare('DELETE FROM friends WHERE id = ?').run(fid);
    return { status: 'removed' };
  }
  // 거절·삭제·신청 취소: 기록을 지운다 (차단은 그대로 둔다)
  if (f.status === 'blocked') throw new Error('차단한 친구예요.');
  db.prepare('DELETE FROM friends WHERE id = ?').run(fid);
  return { status: 'removed' };
}

// ---------- 쪽지 ----------
export function sendMessage(me, fid, myKid, code) {
  if (!MESSAGE_CODES.includes(code)) throw new Error('보낼 수 없는 쪽지예요.');
  const f = db.prepare("SELECT * FROM friends WHERE id = ? AND status = 'accepted'").get(fid);
  if (!f) throw new Error('친구에게만 쪽지를 보낼 수 있어요.');
  const mine = f.a_user === me && f.a_kid === myKid ? 'a' : f.b_user === me && f.b_kid === myKid ? 'b' : null;
  if (!mine) throw new Error('친구 정보를 찾을 수 없어요.');
  const [toUser, toKid] = mine === 'a' ? [f.b_user, f.b_kid] : [f.a_user, f.a_kid];
  if (db.prepare('SELECT COUNT(*) n FROM kid_messages WHERE from_user = ? AND at > ?').get(me, now() - DAY).n >= 60) throw new Error('오늘은 쪽지를 많이 보냈어요. 내일 또 보내요!');
  db.prepare('INSERT INTO kid_messages (id, friend_id, from_user, from_kid, to_user, to_kid, code, at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id(), fid, me, myKid, toUser, toKid, code, now());
  // 받은 쪽지는 친구마다 최근 50개만 둔다
  db.prepare(`DELETE FROM kid_messages WHERE friend_id = ? AND to_user = ? AND to_kid = ? AND id NOT IN
    (SELECT id FROM kid_messages WHERE friend_id = ? AND to_user = ? AND to_kid = ? ORDER BY at DESC LIMIT 50)`).run(fid, toUser, toKid, fid, toUser, toKid);
  return { ok: true };
}
export function markRead(me, kid) {
  db.prepare('UPDATE kid_messages SET read = 1 WHERE to_user = ? AND to_kid = ?').run(me, kid);
}

// 화면에 줄 친구·쪽지·추천 정보 한 번에
export function socialDoc(me) {
  const u = getUser(me);
  const rows = db.prepare('SELECT * FROM friends WHERE a_user = ? OR b_user = ? ORDER BY created_at DESC').all(me, me);
  const users = new Map([[me, u]]);
  const userOf = x => { if (!users.has(x)) users.set(x, getUser(x)); return users.get(x); };
  const friends = [], incoming = [], outgoing = [], blocked = [];
  for (const f of rows) {
    const mineA = f.a_user === me;
    const [myKid, otherUser, otherKid] = mineA ? [f.a_kid, f.b_user, f.b_kid] : [f.b_kid, f.a_user, f.a_kid];
    const o = userOf(otherUser); if (!o) continue;
    const kid = f.status === 'accepted' ? publicKid(o, otherKid) : (p => p && { id: p.id, name: p.name, avatar: p.avatar })(kidOf(o, otherKid));
    if (!kid || !kidOf(u, myKid)) continue; // 지운 프로필
    const item = { id: f.id, myKid, kid, at: f.responded_at || f.created_at };
    if (f.status === 'accepted') friends.push(item);
    else if (f.status === 'blocked') { if (f.blocked_by === me) blocked.push(item); }
    else (mineA ? outgoing : incoming).push(item);
  }
  const messages = db.prepare('SELECT * FROM kid_messages WHERE to_user = ? ORDER BY at DESC LIMIT 100').all(me).map(m => {
    const from = userOf(m.from_user);
    return { id: m.id, friendId: m.friend_id, toKid: m.to_kid, from: from ? { name: kidName(from, m.from_kid), avatar: (kidOf(from, m.from_kid) || {}).avatar } : null, code: m.code, at: m.at, read: !!m.read };
  }).filter(m => m.from);
  return { memberNo: u.member_no, referral: referralInfo(me), friends, incoming, outgoing, blocked, messages };
}
