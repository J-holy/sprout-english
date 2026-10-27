// 이미 가입한 회원을 관리자로 지정하거나 해제한다
// 사용: npm run make-admin -- someone@example.com        (해제: --remove)
import { db } from '../lib/db.js';

const email = (process.argv[2] || '').toLowerCase();
const remove = process.argv.includes('--remove');
if (!email) { console.log('사용법: npm run make-admin -- 이메일 [--remove]'); process.exit(1); }
const r = db.prepare('UPDATE users SET role = ? WHERE email = ?').run(remove ? 'parent' : 'admin', email);
console.log(r.changes ? `${email} → ${remove ? '보호자' : '관리자'}로 변경했어요.` : `${email} 회원을 찾지 못했어요. 먼저 가입해 주세요.`);
db.close();
