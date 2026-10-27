/* 새싹영어 — 운영 설정
 * 서버(server/)로 실행하면 관리자·SNS 키·인증코드 정책은 server/.env 값을 따르고, 이 파일 값은 무시돼요.
 * 아래 값은 서버 없이 index.html만 열었을 때(로컬 데모 모드)만 쓰여요.
 * ADMIN_EMAILS: 로컬 데모에서 이 이메일로 로그인하면 관리자 권한이 생겨요.
 */
const CONFIG = {
  ADMIN_EMAILS: ['admin@sprout.test'],
  AUTH_PROVIDERS: {
    kakao: { label: '카카오로 시작하기', icon: '💬' },
    naver: { label: '네이버로 시작하기', icon: 'N' },
    google: { label: 'Google로 시작하기', icon: 'G' },
    apple: { label: 'Apple로 시작하기', icon: '🍎' },
  },
  CODE_TTL_SEC: 180,     // 이메일 인증코드 유효 시간
  CODE_MAX_TRIES: 5,     // 인증코드 입력 허용 횟수
  RESEND_WAIT_SEC: 30,   // 재전송 대기 시간
};
