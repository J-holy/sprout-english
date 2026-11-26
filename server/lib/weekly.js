// 주간 학습 리포트 메일 (2026-11-26): 부모는 앱에 잘 들어오지 않으니, 일요일 저녁에 아이별 한 주 기록을 메일로 보낸다
//   받는 사람: 이메일이 있는 보호자 중 부모페이지 설정에서 '주간 리포트 메일'을 끄지 않은 사람 (서비스 안내라 기본으로 켜 둔다)
//   보내는 때: 일요일 19~20시(한국 시각) 사이 한 번. 이번 주에 레슨을 하나도 안 한 아이만 있으면 '다시 시작해요' 안내를 보낸다
import { db, kv, json } from './db.js';
import { config } from './env.js';
import { sendMailTo, mailReady } from './mailer.js';

const kst = (t = Date.now()) => new Date(t + 9 * 3600000);
const day = t => kst(t).toISOString().slice(0, 10);
const LEVELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const STAGE_OF = lv => ([['AB', 1], ['CDE', 2], ['FGH', 3], ['IJKL', 4], ['MNOP', 5], ['QRST', 6], ['UVWX', 7], ['YZ', 8]].find(([ls]) => ls.includes(lv)) || [, 1])[1];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// 아이 한 명의 지난 7일 요약
export function weekOf(p, t = Date.now()) {
  const from = day(t - 6 * 86400000), to = day(t);
  let lessons = 0, scores = [];
  const levels = new Set();
  for (const lv of LEVELS) for (const l of (p.progress?.[lv]?.lessons || [])) if (l && l.date >= from && l.date <= to) { lessons++; scores.push(l.score); levels.add(lv); }
  const minutes = Object.entries(p.minutes || {}).filter(([d]) => d >= from && d <= to).reduce((n, [, m]) => n + m, 0);
  const days = Object.entries(p.minutes || {}).filter(([d, m]) => d >= from && d <= to && m > 0).length;
  const cur = [...LEVELS].reverse().find(lv => (p.progress?.[lv]?.lessons || []).some(Boolean)) || p.startLevel || 'A';
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  return { name: p.name || '아이', lessons, minutes, days, avg, levels: [...levels], cur, stage: STAGE_OF(cur) };
}

function mailHtml(parent, kids) {
  const site = config.publicUrl || 'https://saessakschool.co.kr';
  const rows = kids.map(k => k.lessons
    ? `<li style="margin:8px 0"><b>${esc(k.name)}</b>: 레슨 <b>${k.lessons}개</b> · ${k.days}일 · ${k.minutes}분${k.avg !== null ? ` · 평균 정답률 ${k.avg}%` : ''}<br><span style="color:#555">지금 ${k.stage}단계 Level ${k.cur}${k.levels.length ? ` · 이번 주에 한 레벨: ${k.levels.join(', ')}` : ''}</span></li>`
    : `<li style="margin:8px 0"><b>${esc(k.name)}</b>: 이번 주에는 레슨을 하지 않았어요. 하루 15분, 오늘 한 레슨부터 다시 시작해 볼까요?</li>`).join('');
  return `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:3px solid #24305e;border-radius:18px">
    <h2 style="margin:0 0 8px">🌱 이번 주 새싹스쿨 리포트</h2>
    <p>${esc(parent)}님, 아이의 한 주 영어 기록이에요.</p><ul style="padding-left:18px">${rows}</ul>
    <p><a href="${site}/#/parent/report" style="display:inline-block;background:#ffd23f;color:#24305e;padding:10px 16px;border-radius:12px;font-weight:bold;text-decoration:none">📊 자세한 리포트 보기 (할 수 있게 된 것 · 보충할 내용)</a></p>
    <p style="color:#666;font-size:12px">이 메일은 새싹스쿨 학습 서비스 안내예요. 부모페이지 › 설정에서 '주간 리포트 메일'을 끄면 더 보내지 않아요.</p></div>`;
}

export async function weeklyJob(t = Date.now()) {
  const k = kst(t);
  if (k.getUTCDay() !== 0 || k.getUTCHours() !== 19 || !mailReady) return;
  const week = day(t), sent = kv.get('weeklySent', {});
  const users = db.prepare("SELECT id, email, parent_name, settings, state FROM users WHERE email IS NOT NULL AND email != ''").all();
  for (const u of users) {
    if (sent[u.id] === week) continue;
    const s = json(u.settings, {}); if (s.weeklyMail === false) continue;
    const kids = (json(u.state, {}).profiles || []).map(p => weekOf(p, t));
    if (!kids.length) continue;
    sent[u.id] = week; kv.set('weeklySent', sent);
    try { await sendMailTo(u.email, `[새싹스쿨] ${kids.map(x => x.name).join('·')}의 이번 주 영어 리포트`, mailHtml(u.parent_name || '보호자', kids)); }
    catch (err) { console.error('[주간 리포트]', err.message); }
  }
}
