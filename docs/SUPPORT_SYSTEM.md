# 조각 — 공지 · 문의 (common_server 연동)

> 서버 경계와 이유는 [`ARCHITECTURE.md`](./ARCHITECTURE.md) §2·§4, 정책은 [`../CLAUDE.md`](../CLAUDE.md) §4·§5.
> 이 문서는 **조각 앱 쪽 구현**이 정본이다. 서버 계약의 정본은 `common_server/docs/PLAN.md` §5.
> 2026-08-09 구현.

---

## 1. 한 줄 요약

공지와 문의는 **common_server**가 맡는다. 조각은 SDK를 **복사해 와서** 쓰고, 서버가 죽어도
일기 기능은 그대로 돌아간다.

---

## 2. 구성

| 파일 | 역할 |
|---|---|
| `lib/common-server/index.ts` · `types.ts` | **common_server/client/에서 복사한 SDK. 손대지 않는다** |
| `lib/common-server/client.ts` | 조각 전용 인스턴스 — `appCode`·`baseUrl`·`platform` 주입 |
| `features/notice/store.ts` | 부팅 조회(zustand) · 읽음 관리 |
| `features/support/auth-gate.ts` | ⏭ 문의 로그인 게이트 **임시 자리** |
| `app/notice.tsx` · `app/support.tsx` | 화면 |
| `.env` (커밋 안 함) · `.env.example` | `EXPO_PUBLIC_SERVER_URL` |

### SDK를 복사하는 이유

common_server 규약이다 — 앱 4~5개 규모에서 monorepo·npm 패키지 오버헤드가 이득보다 크다.
**복사본에는 원본 경로와 복사 시점을 주석으로 남긴다.** 서버 계약이 바뀌면 원본을 갱신하고
다시 복사한다. 복사본을 손으로 고치면 다음 복사 때 조용히 되돌아간다 —
그래서 `eslint.config.js`에서 이 두 파일만 우리 린트 규칙을 면제한다.

---

## 3. 부팅 조회 (`GET /api/v1/bootstrap`)

앱 실행당 **1회**. 점검·버전·공지를 한 번에 받는다. `app/_layout.tsx`에서 부른다.

```
{ maintenance, version: { min, latest, androidUrl, iosUrl }, announcements: [...] }
```

### ⚠ 점검·버전 게이트를 쓰지 않는다 (조각의 결정)

응답에 `maintenance`와 `version`이 오지만 **조각은 둘 다 무시한다.**

일기는 기기에 있고 서버 없이 완전히 동작한다(기둥 3). 서버 점검을 이유로 사용자를 자기 일기에서
잠그는 것은 정당화되지 않는다 — 서버가 못 하는 일이 하나도 없는 화면까지 막게 된다.
버전 게이트도 같은 이유로 두지 않는다.

> my_word는 점검 게이트를 쓴다. 그쪽은 서버 없이는 성립하지 않는 기능이 있어서고,
> 조각과 판단이 갈리는 지점이다. 베껴오지 않는다.

### 실패는 조용히

`boot`은 null로 남고 공지 목록은 **빈 상태**로 보인다. 에러 화면을 띄우지 않는다 —
사용자가 할 수 있는 일이 없는 실패를 굳이 알릴 이유가 없다.

---

## 4. 공지 읽음 — 로컬 전용

읽은 공지 id는 `app_settings.notice_read_ids`(JSON 배열)에 쌓는다.
**서버에 읽음을 보내지 않는다** — 익명 접수라 서버가 "누가 읽었는지" 알 방법이 없고,
알 수 있게 만들면 익명성이 깨진다.

- 저장할 때 **서버가 내려준 id와 교집합만** 남긴다. 안 그러면 만료·삭제된 공지의 id가 영원히 쌓인다.
  공지 id는 서버에서 재사용하지 않으므로 지워도 안전하다.
- 공지 화면에 들어오면 전부 읽음으로 기록하되, **화면에 뜬 새 글 표시는 그대로 둔다**(입장 시점 스냅샷).
  들어오자마자 표시가 사라지면 무엇이 새 글이었는지 알 수 없다.
- 설정의 배지는 **개수를 쓰지 않는다.** 몇 개인지보다 "새 게 있다"가 필요한 정보다.

---

## 5. 문의 (`POST /api/v1/tickets`)

| 보내는 것 | 안 보내는 것 |
|---|---|
| 분류(bug·suggestion·question·etc) · 본문 · 플랫폼 · 앱 버전 | **일기 본문 · 계정 · 기기 식별자** |

화면에 그대로 적는다: *"일기 내용은 보내지 않아요. 앱 버전과 기기 종류만 함께 전달돼요."*
일기 앱에서 이 한 줄이 가장 중요하다.

- 본문 하한 5자 / 상한 2000자 — **서버 상수와 같은 값**을 SDK가 export한다(`CONTENT_MIN`/`CONTENT_MAX`).
  입력창 `maxLength`를 상한보다 크게 두면 잘린 글을 보낸 줄 모른다.
- 실패 사유별로 다른 문구를 띄우되, `not-found`(앱 미등록)는 `not-configured`와 **같은 문구**로 묶는다.
  우리 쪽 사정을 설명해봐야 사용자가 할 수 있는 일이 없다.

### 로그인 (2026-08-09 서버·SDK 준비 완료)

문의는 로그인 필수다(CLAUDE.md §4) — **답변을 드리려면 누가 보냈는지 알아야** 하기 때문이다.
서버가 이제 그걸 받는다: `tickets.subject_id`로 귀속되고 `fetchMyInquiries()`로 답변을 읽는다.

| 서버·SDK | 상태 |
|---|---|
| `POST /api/v1/auth/login` (구글 토큰 검증) | ✅ |
| `GET`·`DELETE /api/v1/auth/me` (세션 확인·탈퇴) | ✅ |
| `GET /api/v1/tickets/mine` (내 문의·답변) | ✅ |
| SDK `login` · `restoreSession` · `logout` · `deleteAccount` · `fetchMyInquiries` | ✅ |

세션 판정은 `features/support/auth-gate.ts`가 전부 갖고, 화면은 `signedIn`만 보고 갈라진다.

**세션 토큰은 SecureStore에 둔다**(`lib/common-server/client.ts`). 토큰을 쥔 사람이 곧 그 계정이라
PIN 해시·암호화 키와 같은 급의 자격증명이다 — `app_settings`(평문 SQLite)에 두지 않는다(§7.1).

⚠ **오프라인에서 로그아웃시키지 않는다.** 세션 폐기는 서버가 401로 명시적으로 거절했을 때만이다.
지하철에서 앱을 켰다고 로그아웃되면 안 된다. 오프라인이면 "기기에 토큰이 있는지"로 판단한다.

#### 구글 로그인 (2026-08-09 구현)

`features/support/auth-gate.ts`가 `@react-native-google-signin/google-signin@16.1.4`를 부른다.

| 것 | 어디 |
|---|---|
| `configure({ webClientId })` | **모듈 로드 시 1회.** 훅 안에서 부르면 화면을 열 때마다 다시 불린다 |
| `signIn()` | `hasPlayServices()` → `GoogleSignin.signIn()` → `idToken` → `commonServer.login('google', …)` |
| `signOut()` · `deleteAccount()` | 구글 세션과 우리 세션을 **둘 다** 정리한다 |
| 화면 | `app/support.tsx` — 로그인 버튼 · 계정 줄(로그아웃 · 탈퇴) |

지키는 것:

- **취소는 오류가 아니다.** `signIn()`은 `'cancelled'`를 돌려주고 화면은 아무 말도 하지 않는다.
  창을 닫자마자 오류창이 뜨면 실패한 것처럼 보인다.
- **`idToken`이 `null`이면 `'not-configured'`로 돌린다.** `webClientId`가 없거나 틀리면 로그인
  자체는 성공하는데 토큰만 비어 온다 — 그대로 서버에 보내면 설정 문제가 `unauthorized`(인증 문제)로 보인다.
- **서버가 거절하면 구글 세션도 끊는다.** 남겨두면 다음 시도에서 계정 선택 창이 안 뜨고 같은 계정으로
  조용히 재시도되어, 계정을 바꿔볼 길이 없어진다.
- **탈퇴는 `revokeAccess()`까지 한다.** `signOut()`만 하면 다음 로그인에서 동의 화면 없이 같은 계정으로
  되돌아가, 방금 탈퇴한 사람에게 "지워지긴 한 건가" 싶어진다.
- **`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`가 비면 `configure()`를 아예 부르지 않는다.** 빈 값으로
  설정해두면 SDK 내부에서 죽어 `'not-configured'`와 구분되지 않는 오류가 난다.

⚠ **서버가 `jogak`을 등록하기 전에는 로그인이 성공할 수 없다**(§6). 앱 쪽은 끝났고 서버 쪽이 남았다.

#### OAuth 클라이언트 (2026-08-09 발급)

Google Cloud 프로젝트 **`google-oauth-test`** (volleyball 클라이언트와 같은 프로젝트).

| 유형 | 이름 | 클라이언트 ID |
|---|---|---|
| 웹 | `jogak-web` | `281316002652-v3959n7417plarerr1i1m7k9h71v5bgb.apps.googleusercontent.com` |
| Android | `jogak-android` | `281316002652-jndkfokpt09ogqgqgcu0579c29k97nbq.apps.googleusercontent.com` |
| Android | `jogak-android-play` | `281316002652-vi7mgog3h2p803q8ihrrp3rj0hklpon6.apps.googleusercontent.com` |

⚠ **웹 클라이언트 ID가 audience다.** 안드로이드 네이티브 로그인이어도 `idToken`은 웹 클라이언트 ID로
발급된다. `GoogleSignin`의 `webClientId`와 서버 콘솔의 audience **둘 다** 웹 ID여야 한다 —
안드로이드 ID만 넣으면 전부 `unauthorized`로만 보여 진단이 어렵다.
앱 쪽 값은 `.env`의 `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

#### OAuth 동의 화면은 '테스트 중'이면 등록된 계정만 로그인된다 (2026-08-09에 걸림)

Google Cloud → 인증 플랫폼 → **대상**의 게시 상태가 `테스트 중`이면, **테스트 사용자 목록에 있는
계정만** 로그인할 수 있다. 앱이 아니라 **구글이** 막으므로 우리 서버 로그에는 아무것도 남지 않는다.

2026-08-09에 `프로덕션 단계`로 올렸다. 조각은 `email`·`profile`·`openid`(비민감 범위)만 쓰므로
**구글 검증 심사가 필요 없다** — 심사는 민감/제한 범위, 로고 등록, 도메인 10개 초과일 때만이다.

⚠ 이 프로젝트(`google-oauth-test`)에는 **배구명가 클라이언트도 함께 있다.** 동의 화면은
프로젝트 단위라 이 변경은 배구명가에도 적용된다(막던 것이 풀리는 방향이라 해를 주지는 않는다).

#### SHA-1은 빌드마다 다르다 — 클라이언트를 하나씩 만든다 (2026-08-09에 걸림)

**Android OAuth 클라이언트 하나는 `패키지 + SHA-1` 한 쌍만 갖는다.** 지문이 늘면 클라이언트를 늘린다
(volleyball도 `volleyball-android` / `volleyball-android-play` 둘이다).

| 어떤 빌드 | SHA-1 | 클라이언트 |
|---|---|---|
| 로컬 `npx expo run:android` | `7F:F6:08:2D:6A:E8:72:0F:10:70:A1:C5:20:53:17:E2:09:74:F7:1B` | `jogak-android` ✅ |
| EAS `development` APK | `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` | ❌ 없음 — 필요하면 만든다 |
| **Play 배포(내부 테스트 포함)** | `CD:86:BB:DB:BB:78:A0:CA:6D:38:1C:8A:DD:B6:2F:E8:37:9E:AC:CB` | `jogak-android-play` ✅ |

Play 앱 서명 SHA-1은 **Play Console → Google Play로 보호됨 → Play 스토어 보호 → Play 앱 서명 관리**
→ 기존 키의 *SHA-1 인증서 지문*(클릭하면 클립보드로 복사된다). 화면에 글자로 렌더링되지 않는다.

⚠ **실제로 겪음(2026-08-09).** 에뮬레이터에 EAS `development` APK를 깔고 로그인했더니 실패했다.
`unauthorized`가 아니라 포괄 오류였는데 — 구글이 `DEVELOPER_ERROR`로 **서버에 닿기도 전에** 끊은 것이다.
로컬 debug 키만 등록돼 있었고 EAS의 debug 키(`5E:8F:…`)는 등록돼 있지 않았다.

**판별법**: `unauthorized`면 서버/audience, 그 외 오류면 **지문/패키지**를 먼저 본다.
설치된 APK의 실제 지문은 이렇게 확인한다 — 어느 키로 서명됐는지 짐작하지 않는다:

```
adb shell pm path <package>          # base.apk 경로
adb pull <경로> installed.apk
apksigner verify --print-certs installed.apk
```

⚠ **탈퇴(계정 삭제)는 Google Play 정책상 필수다.** 계정을 만드는 앱은 앱 안에 삭제 경로가 있어야 한다.
✅ 문의 화면 하단 계정 줄에 넣었다(2026-08-09) — 계정을 쓰는 자리가 여기뿐이라 여기에 둔다.
⏭ **웹 삭제 URL은 아직 없다.** 스토어 등록 정보에 적어야 하므로 게시 전에 만든다
(처리방침과 같은 GitHub Pages에 페이지를 하나 더 두면 된다).

---

## 6. 선행 조건

| 것 | 상태 | 어떻게 |
|---|---|---|
| `jogak` 앱 등록 | ❌ **미등록** (`bootstrap?app=jogak` → 404) | common_server에서 `node --env-file=.env.local tools/seed.ts jogak "조각"` |
| `EXPO_PUBLIC_SERVER_URL` | ✅ `.env` | 값을 바꾸면 **dev 서버 재시작**(빌드 시점 인라인) |
| common_server 인증(Phase 7) | ✅ 2026-08-09 완료·배포 | `auth/login`·`auth/me`·`tickets/mine` |
| SDK auth | ✅ 복사 완료 | |
| `app_auth_providers`에 구글 클라이언트 ID | ❌ 0건 | 관리자 콘솔 → 앱 설정 → 소셜 로그인 |
| Google Cloud OAuth 클라이언트 ID | ✅ 2026-08-09 발급 | 위 표 |
| `@react-native-google-signin/google-signin` | ❌ 미설치 | |

등록 전에는 모든 호출이 404로 떨어지고, 앱은 "공지 없음 / 문의 받을 수 없음"으로 조용히 동작한다.

---

## 7. 아직 안 한 것

| 항목 | 비고 |
|---|---|
| 공지 상세 화면 | 목록에 본문을 다 펼쳐 보여준다. 길어지면 접기/상세가 필요 |
| 문의 내역·답변 확인 | Phase 7 대기 |
| 홈 화면 공지 배지 | 지금은 설정에만 있다. 필요해지면 추가 |
| 새로고침(pull to refresh) | 부팅 1회라 앱을 다시 켜야 갱신된다. 공지가 잦아지면 붙인다 |
