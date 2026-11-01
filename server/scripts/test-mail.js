// 메일 설정 시험: 실제 인증코드 메일 형식으로 한 통 보낸다 (코드는 시험용 123456)
// 사용법: node scripts/test-mail.js 받을주소
import { mailReady, sendCodeMail } from '../lib/mailer.js';

const to = process.argv[2];
if (!to) { console.error('받을 주소를 적어 주세요. 예: node scripts/test-mail.js 주소'); process.exit(1); }
if (!mailReady) { console.error('.env에 SMTP_HOST, SMTP_USER, SMTP_PASS가 없어요.'); process.exit(1); }
try {
  await sendCodeMail(to, '123456');
  console.log(`시험 메일을 보냈어요: ${to}`);
} catch (err) {
  console.error('메일을 보내지 못했어요:', err.message);
  process.exit(1);
}
