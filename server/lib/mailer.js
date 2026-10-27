// 인증코드 메일 발송 (SMTP). SMTP가 없으면 개발 모드에서만 콘솔에 코드를 남긴다.
import nodemailer from 'nodemailer';
import { config } from './env.js';

const m = config.mail;
export const mailReady = !!(m.host && m.user && m.pass);
const transport = mailReady ? nodemailer.createTransport({ host: m.host, port: m.port, secure: m.secure, auth: { user: m.user, pass: m.pass } }) : null;

export async function verifyMailer() {
  if (!transport) return console.warn('[메일] SMTP 설정이 없어요. DEV_SHOW_CODE=true면 인증코드를 화면과 로그에 보여줘요.');
  try { await transport.verify(); console.log('[메일] SMTP 연결 확인 완료'); }
  catch (err) { console.error('[메일] SMTP 연결 실패:', err.message); }
}

export async function sendCodeMail(to, code) {
  const minutes = Math.round(config.code.ttlSec / 60);
  if (!transport) { console.log(`[메일:개발] ${to} 인증코드 ${code}`); return; }
  await transport.sendMail({
    from: m.from, to,
    subject: `[새싹영어] 인증코드 ${code}`,
    text: `새싹영어 인증코드는 ${code} 입니다.\n${minutes}분 안에 입력해 주세요.\n본인이 요청하지 않았다면 이 메일을 무시하세요.`,
    html: `<div style="font-family:sans-serif;max-width:420px;margin:auto;padding:24px;border:3px solid #24305e;border-radius:18px">
      <h2 style="margin:0 0 12px">🌱 새싹영어 인증코드</h2>
      <p>아래 6자리 숫자를 입력해 주세요. ${minutes}분 동안 유효해요.</p>
      <p style="font-size:32px;letter-spacing:8px;font-weight:bold;background:#ffd23f;padding:12px;text-align:center;border-radius:12px">${code}</p>
      <p style="color:#666;font-size:13px">본인이 요청하지 않았다면 이 메일을 무시하세요.</p></div>`,
  });
}
