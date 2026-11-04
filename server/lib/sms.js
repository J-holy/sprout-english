// 휴대폰 인증코드 발송: 카카오 알림톡(받지 못하면 문자로 대체) 또는 문자만. 발송 대행은 SOLAPI.
// 키가 없으면 개발 모드에서만 콘솔에 코드를 남긴다.
import crypto from 'node:crypto';
import { config } from './env.js';

const e = process.env;
export const smsMode = () => {
  if (!e.SOLAPI_API_KEY || !e.SOLAPI_API_SECRET || !e.SOLAPI_FROM) return null;
  return e.SOLAPI_PF_ID && e.SOLAPI_TEMPLATE_ID ? 'alimtalk' : 'sms';
};

const authHeader = () => {
  const date = new Date().toISOString(), salt = crypto.randomBytes(16).toString('hex');
  const signature = crypto.createHmac('sha256', e.SOLAPI_API_SECRET).update(date + salt).digest('hex');
  return `HMAC-SHA256 apiKey=${e.SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`;
};

export async function sendCodeMessage(phone, code) {
  const mode = smsMode();
  if (!mode) { console.log(`[문자:개발] 인증코드 ${code}`); return; }
  const message = { to: phone, from: e.SOLAPI_FROM };
  if (mode === 'alimtalk') message.kakaoOptions = { pfId: e.SOLAPI_PF_ID, templateId: e.SOLAPI_TEMPLATE_ID, variables: { [e.SOLAPI_CODE_VAR || '#{인증번호}']: code } };
  else message.text = `[새싹스쿨] 인증번호 ${code} (${Math.round(config.code.ttlSec / 60)}분 안에 입력)`;
  const r = await fetch(`${e.SOLAPI_URL || 'https://api.solapi.com'}/messages/v4/send-many/detail`, {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [message] }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`SOLAPI ${r.status}: ${j.errorMessage || ''}`.slice(0, 200));
  const failed = j.failedMessageList?.[0];
  if (failed) throw new Error(`SOLAPI 접수 실패: ${failed.statusCode} ${failed.statusMessage || ''}`.slice(0, 200));
}
