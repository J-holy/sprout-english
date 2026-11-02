// 휴대폰 인증 설정 시험: 실제 인증 메시지 형식으로 한 통 보낸다 (코드는 시험용 123456)
// 사용법: node scripts/test-sms.js 받을번호
import { smsMode, sendCodeMessage } from '../lib/sms.js';

const to = String(process.argv[2] || '').replace(/\D/g, '');
if (!to) { console.error('받을 번호를 적어 주세요. 예: node scripts/test-sms.js 01012345678'); process.exit(1); }
if (!smsMode()) { console.error('.env에 SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_FROM이 없어요.'); process.exit(1); }
try {
  await sendCodeMessage(to, '123456');
  console.log(`시험 발송을 접수했어요 (${smsMode() === 'alimtalk' ? '카카오 알림톡' : '문자'}).`);
} catch (err) {
  console.error('보내지 못했어요:', err.message);
  process.exit(1);
}
