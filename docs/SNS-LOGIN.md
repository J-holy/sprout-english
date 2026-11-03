# 카카오·네이버·구글 로그인 켜기

로그인 코드는 이미 사이트에 들어 있어요. 각 서비스에서 받은 키를 파이의 `/opt/sprout-english/server/.env`에 넣고 서버를 다시 시작하면, 그 서비스의 로그인 버튼이 저절로 나타나요. 키를 넣지 않은 서비스의 버튼은 보이지 않아요.

- 세 서비스 모두 무료예요. 애플 로그인은 애플 개발자 등록(연 99달러)이 필요해서 지금은 빼 두었어요.
- 키(비밀값)는 채팅이나 메신저에 붙이지 말고, 파이 터미널에서 `.env`에 직접 넣어 주세요.
- 개발자 사이트의 메뉴 이름은 조금씩 바뀌기도 해요. 비슷한 이름을 찾으면 돼요.

모든 서비스에 공통으로 쓰는 주소:

| 항목 | 값 |
|---|---|
| 사이트 주소 | `https://saessakschool.co.kr` |
| 카카오 Redirect URI | `https://saessakschool.co.kr/api/auth/kakao/callback` |
| 네이버 Callback URL | `https://saessakschool.co.kr/api/auth/naver/callback` |
| 구글 승인된 리디렉션 URI | `https://saessakschool.co.kr/api/auth/google/callback` |
| 개인정보 처리방침 | `https://saessakschool.co.kr/privacy.html` |
| 이용약관 | `https://saessakschool.co.kr/terms.html` |

추천 순서: 카카오 → 네이버 → 구글. 학부모가 가장 많이 쓰는 카카오부터 켜요.

## 1. 카카오

1. [developers.kakao.com](https://developers.kakao.com)에 카카오 계정으로 로그인하고 **내 애플리케이션 → 애플리케이션 추가하기**를 눌러요.
   - 앱 이름: 새싹영어(또는 새싹스쿨), 회사명: 사업자 이름 또는 본인 이름, 카테고리: 교육
2. **앱 키**에서 **REST API 키**를 확인해요. 이것이 `KAKAO_REST_API_KEY`예요.
3. **플랫폼 → Web**에 사이트 도메인 `https://saessakschool.co.kr`을 등록해요.
4. **카카오 로그인**을 **활성화(ON)**하고, **Redirect URI**에 위 표의 카카오 주소를 등록해요.
5. **동의항목**에서 다음을 설정해요.
   - 닉네임: 필수 동의
   - 카카오계정(이메일): 필수 또는 선택 동의. 이 항목은 **비즈 앱**이어야 켤 수 있어요.
     - **앱 설정 → 비즈니스**에서 사업자등록번호로 전환하거나, 사업자가 없으면 개인 개발자 비즈 앱으로 본인인증을 해서 전환해요.
6. (권장) **보안 → Client Secret**에서 코드를 만들고 **사용함**으로 바꿔요. 이것이 `KAKAO_CLIENT_SECRET`이에요.

**비즈 앱 전환이 아직이면:** `.env`에 `KAKAO_EMAIL=false`를 넣어요. 그러면 카카오에서 닉네임만 받고 이메일 없이 가입해요. 이렇게 가입하면 같은 이메일로 만든 다른 계정과 자동으로 묶이지는 않아요. 나중에 비즈 앱으로 바꾸면 `true`로 돌려 주세요.

## 2. 네이버

1. [developers.naver.com](https://developers.naver.com)에서 **Application → 애플리케이션 등록**을 눌러요.
2. 다음을 입력해요.
   - 애플리케이션 이름: 새싹영어. 네이버 로그인 화면에 이 이름이 보여요.
   - 사용 API: **네이버 로그인**
   - 제공 정보: **이메일 주소**(필수), **별명**(추가)
   - 로그인 오픈 API 서비스 환경: **PC웹**과 **모바일웹**에 서비스 URL `https://saessakschool.co.kr`, Callback URL은 위 표의 네이버 주소
3. 등록하면 **Client ID**와 **Client Secret**이 나와요. 각각 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`이에요.
4. 처음에는 **개발 중** 상태라서 **멤버관리**에 등록한 네이버 아이디만 로그인할 수 있어요. 본인 아이디를 테스트 ID로 넣고 먼저 확인해요.
5. 모두가 쓰게 하려면 **검수 요청**을 해요. 서비스 소개, 로그인 화면 캡처, 개인정보 처리방침 주소가 필요하고 며칠 걸려요.

## 3. 구글

1. [console.cloud.google.com](https://console.cloud.google.com)에서 프로젝트를 골라요. AI 음성용으로 만든 프로젝트가 있으면 그대로 써도 돼요.
2. **Google 인증 플랫폼(OAuth 동의 화면)**에서 시작하기를 눌러요.
   - 앱 이름: 새싹영어, 사용자 지원 이메일: 본인 메일, 대상: **외부**
   - 브랜딩에서 앱 홈페이지, 개인정보 처리방침, 이용약관 주소(위 표)를 넣고, 승인된 도메인에 `saessakschool.co.kr`을 넣어요.
3. **클라이언트 → 클라이언트 만들기**를 눌러요.
   - 애플리케이션 유형: **웹 애플리케이션**
   - 승인된 리디렉션 URI: 위 표의 구글 주소
   - 만들면 나오는 **클라이언트 ID**와 **클라이언트 보안 비밀번호**가 각각 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`이에요.
4. **대상**에서 게시 상태를 **프로덕션으로 푸시**해요. 테스트 상태로 두면 등록한 테스트 사용자만 로그인할 수 있어요. 이메일·이름만 받기 때문에 따로 심사받지 않아도 돼요.

## 4. 파이에 키 넣기

파이 터미널에서(비밀번호는 직접 입력):

```bash
sudo nano /opt/sprout-english/server/.env
```

받은 서비스의 줄만 채워요. 비어 있는 줄은 그대로 두면 돼요.

```
KAKAO_REST_API_KEY=여기에_REST_API_키
KAKAO_CLIENT_SECRET=여기에_Client_Secret
KAKAO_EMAIL=true
NAVER_CLIENT_ID=여기에_Client_ID
NAVER_CLIENT_SECRET=여기에_Client_Secret
GOOGLE_CLIENT_ID=여기에_클라이언트_ID
GOOGLE_CLIENT_SECRET=여기에_보안_비밀번호
```

`PUBLIC_URL=https://saessakschool.co.kr`인지도 확인해요. 로그인 뒤 돌아오는 주소가 이 값으로 만들어져요.

저장(Ctrl+O, Enter)하고 나와서(Ctrl+X) 서버를 다시 시작해요.

```bash
sudo systemctl restart sprout-english
```

## 5. 확인

- 사이트의 로그인 화면에 키를 넣은 서비스의 버튼이 보이면 성공이에요.
- 버튼을 눌렀을 때 오류가 나면 대부분 Redirect URI가 한 글자라도 다른 경우예요. `https`, 끝의 `/callback`까지 똑같은지 확인해요.
- 카카오에서 `KOE205` 오류가 나면 이메일 동의항목이 꺼져 있는 거예요. 비즈 앱으로 바꾸고 이메일 동의항목을 켜거나, `KAKAO_EMAIL=false`로 바꾸고 다시 시작해요.
