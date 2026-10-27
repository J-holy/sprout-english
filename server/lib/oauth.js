// SNS 로그인 (OAuth 2.0 / OpenID Connect): 카카오 · 네이버 · Google · Apple
import fs from 'node:fs';
import crypto from 'node:crypto';
import { config } from './env.js';

const O = config.oauth;
const redirectUri = p => `${config.publicUrl}/api/auth/${p}/callback`;
const form = obj => new URLSearchParams(Object.entries(obj).filter(([, v]) => v !== undefined && v !== ''));

async function getJson(url, opts = {}) {
  const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(10000) });
  const text = await r.text();
  let body; try { body = JSON.parse(text); } catch { body = { raw: text }; }
  if (!r.ok) throw new Error(`${new URL(url).host} 응답 ${r.status}: ${body.error_description || body.error || body.msg || text.slice(0, 120)}`);
  return body;
}

// ---------- Apple: client_secret(JWT, ES256) 만들기와 id_token 검증 ----------
const b64url = b => Buffer.from(b).toString('base64url');
function appleClientSecret() {
  const key = fs.readFileSync(O.apple.privateKeyPath, 'utf8');
  const t = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'ES256', kid: O.apple.keyId }));
  const body = b64url(JSON.stringify({ iss: O.apple.teamId, iat: t, exp: t + 3000, aud: 'https://appleid.apple.com', sub: O.apple.clientId }));
  const sig = crypto.sign('sha256', Buffer.from(`${head}.${body}`), { key, dsaEncoding: 'ieee-p1363' });
  return `${head}.${body}.${b64url(sig)}`;
}
let appleKeys = { at: 0, keys: [] };
async function verifyAppleIdToken(idToken) {
  const [h, p, s] = idToken.split('.');
  const header = JSON.parse(Buffer.from(h, 'base64url'));
  if (Date.now() - appleKeys.at > 3600000) appleKeys = { at: Date.now(), keys: (await getJson('https://appleid.apple.com/auth/keys')).keys };
  const jwk = appleKeys.keys.find(k => k.kid === header.kid);
  if (!jwk) throw new Error('Apple 공개키를 찾지 못했어요.');
  const ok = crypto.verify('RSA-SHA256', Buffer.from(`${h}.${p}`), crypto.createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(s, 'base64url'));
  const claims = JSON.parse(Buffer.from(p, 'base64url'));
  if (!ok || claims.iss !== 'https://appleid.apple.com' || claims.aud !== O.apple.clientId || claims.exp * 1000 < Date.now()) throw new Error('Apple 인증 토큰이 올바르지 않아요.');
  return claims;
}

export const PROVIDERS = {
  kakao: {
    ready: () => !!O.kakao.clientId,
    authUrl: state => 'https://kauth.kakao.com/oauth/authorize?' + form({ client_id: O.kakao.clientId, redirect_uri: redirectUri('kakao'), response_type: 'code', state, scope: 'account_email profile_nickname' }),
    async profile(code) {
      const tok = await getJson('https://kauth.kakao.com/oauth/token', { method: 'POST', body: form({ grant_type: 'authorization_code', client_id: O.kakao.clientId, client_secret: O.kakao.clientSecret, redirect_uri: redirectUri('kakao'), code }) });
      const me = await getJson('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: `Bearer ${tok.access_token}` } });
      const acc = me.kakao_account || {};
      return { uid: String(me.id), email: acc.is_email_verified !== false ? acc.email : null, name: acc.profile?.nickname || '' };
    },
  },
  naver: {
    ready: () => !!(O.naver.clientId && O.naver.clientSecret),
    authUrl: state => 'https://nid.naver.com/oauth2.0/authorize?' + form({ response_type: 'code', client_id: O.naver.clientId, redirect_uri: redirectUri('naver'), state }),
    async profile(code, state) {
      const tok = await getJson('https://nid.naver.com/oauth2.0/token?' + form({ grant_type: 'authorization_code', client_id: O.naver.clientId, client_secret: O.naver.clientSecret, code, state }));
      if (!tok.access_token) throw new Error(tok.error_description || '네이버 토큰 발급 실패');
      const me = (await getJson('https://openapi.naver.com/v1/nid/me', { headers: { Authorization: `Bearer ${tok.access_token}` } })).response || {};
      return { uid: me.id, email: me.email || null, name: me.nickname || me.name || '' };
    },
  },
  google: {
    ready: () => !!(O.google.clientId && O.google.clientSecret),
    authUrl: state => 'https://accounts.google.com/o/oauth2/v2/auth?' + form({ client_id: O.google.clientId, redirect_uri: redirectUri('google'), response_type: 'code', scope: 'openid email profile', state, prompt: 'select_account' }),
    async profile(code) {
      const tok = await getJson('https://oauth2.googleapis.com/token', { method: 'POST', body: form({ grant_type: 'authorization_code', client_id: O.google.clientId, client_secret: O.google.clientSecret, redirect_uri: redirectUri('google'), code }) });
      const me = await getJson('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tok.access_token}` } });
      return { uid: me.sub, email: me.email_verified ? me.email : null, name: me.name || '' };
    },
  },
  apple: {
    ready: () => !!(O.apple.clientId && O.apple.teamId && O.apple.keyId && O.apple.privateKeyPath && fs.existsSync(O.apple.privateKeyPath)),
    formPost: true,
    authUrl: state => 'https://appleid.apple.com/auth/authorize?' + form({ response_type: 'code', response_mode: 'form_post', client_id: O.apple.clientId, redirect_uri: redirectUri('apple'), scope: 'name email', state }),
    async profile(code, state, body) {
      const tok = await getJson('https://appleid.apple.com/auth/token', { method: 'POST', body: form({ grant_type: 'authorization_code', client_id: O.apple.clientId, client_secret: appleClientSecret(), redirect_uri: redirectUri('apple'), code }) });
      const c = await verifyAppleIdToken(tok.id_token);
      let name = '';
      try { const u = JSON.parse(body.user || '{}'); name = [u.name?.lastName, u.name?.firstName].filter(Boolean).join(''); } catch { /* 첫 로그인 때만 온다 */ }
      return { uid: c.sub, email: c.email || null, name };
    },
  },
};
export const enabledProviders = () => Object.fromEntries(Object.entries(PROVIDERS).map(([k, p]) => [k, p.ready()]));
