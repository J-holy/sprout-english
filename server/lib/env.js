// .env 파일을 읽어 설정 객체를 만든다 (외부 패키지 없이)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v.replace(/\\n/g, '\n');
  }
}
loadDotEnv(process.env.ENV_FILE || path.join(ROOT, '.env'));

const e = process.env;
const bool = (v, d = false) => v === undefined || v === '' ? d : /^(1|true|yes|on)$/i.test(v);
const list = v => (v || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
const production = e.NODE_ENV === 'production';

const secret = e.SESSION_SECRET || '';
if (production && secret.length < 32) {
  console.error('[설정 오류] 운영 모드에서는 .env에 32자 이상의 SESSION_SECRET이 필요해요. `openssl rand -hex 32`로 만들 수 있어요.');
  process.exit(1);
}

export const config = {
  root: ROOT,
  production,
  port: Number(e.PORT || 8080),
  host: e.HOST || '127.0.0.1',
  publicUrl: (e.PUBLIC_URL || `http://localhost:${e.PORT || 8080}`).replace(/\/$/, ''),
  publicDir: path.resolve(ROOT, e.PUBLIC_DIR || '../public'),
  dataDir: path.resolve(ROOT, e.DATA_DIR || './data'),
  sessionSecret: secret || crypto.randomBytes(32).toString('hex'), // 개발용: 재시작하면 로그인이 풀린다
  sessionDays: Number(e.SESSION_DAYS || 60),
  adminEmails: list(e.ADMIN_EMAILS),
  trustProxy: bool(e.TRUST_PROXY, production),
  mail: {
    host: e.SMTP_HOST, port: Number(e.SMTP_PORT || 465), secure: bool(e.SMTP_SECURE, Number(e.SMTP_PORT || 465) === 465),
    user: e.SMTP_USER, pass: e.SMTP_PASS, from: e.MAIL_FROM || (e.SMTP_USER ? `새싹영어 <${e.SMTP_USER}>` : ''),
  },
  // SMTP가 없을 때 인증코드를 화면에 보여줄지 (개발용. 운영에서는 꼭 false)
  devShowCode: bool(e.DEV_SHOW_CODE, !production),
  code: { ttlSec: Number(e.CODE_TTL_SEC || 180), maxTries: Number(e.CODE_MAX_TRIES || 5), resendSec: Number(e.CODE_RESEND_SEC || 30) },
  oauth: {
    kakao: { clientId: e.KAKAO_REST_API_KEY, clientSecret: e.KAKAO_CLIENT_SECRET },
    naver: { clientId: e.NAVER_CLIENT_ID, clientSecret: e.NAVER_CLIENT_SECRET },
    google: { clientId: e.GOOGLE_CLIENT_ID, clientSecret: e.GOOGLE_CLIENT_SECRET },
    apple: { clientId: e.APPLE_SERVICE_ID, teamId: e.APPLE_TEAM_ID, keyId: e.APPLE_KEY_ID, privateKeyPath: e.APPLE_PRIVATE_KEY_PATH },
  },
  toss: { clientKey: e.TOSS_CLIENT_KEY, secretKey: e.TOSS_SECRET_KEY },
  // 토스 키가 없을 때 데모 결제(즉시 완료)를 허용할지
  allowDemoPayment: bool(e.ALLOW_DEMO_PAYMENT, !production),
};
config.https = config.publicUrl.startsWith('https://');
