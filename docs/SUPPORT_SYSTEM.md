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

⏭ **남은 것은 `signIn()` 한 줄.** 구글 `idToken`을 받아올 라이브러리가 미설치다.

#### OAuth 클라이언트 (2026-08-09 발급)

Google Cloud 프로젝트 **`google-oauth-test`** (volleyball 클라이언트와 같은 프로젝트).

| 유형 | 이름 | 클라이언트 ID |
|---|---|---|
| 웹 | `jogak-web` | `281316002652-v3959n7417plarerr1i1m7k9h71v5bgb.apps.googleusercontent.com` |
| Android | `jogak-android` | `281316002652-jndkfokpt09ogqgqgcu0579c29k97nbq.apps.googleusercontent.com` |

Android 클라이언트에 넣은 값: 패키지 `com.son0925.jogak` /
SHA-1 `7F:F6:08:2D:6A:E8:72:0F:10:70:A1:C5:20:53:17:E2:09:74:F7:1B` (**로컬 디버그 키스토어**).

⚠ **웹 클라이언트 ID가 audience다.** 안드로이드 네이티브 로그인이어도 `idToken`은 웹 클라이언트 ID로
발급된다. `GoogleSignin`의 `webClientId`와 서버 콘솔의 audience **둘 다** 웹 ID여야 한다 —
안드로이드 ID만 넣으면 전부 `unauthorized`로만 보여 진단이 어렵다.
앱 쪽 값은 `.env`의 `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

⚠ **출시 후 SHA-1을 하나 더 넣어야 한다.** Google Play 앱 서명이 업로드 키와 **다른 키로 재서명**하므로,
Play Console → 앱 무결성 → 앱 서명 인증서의 SHA-1을 `jogak-android` 클라이언트에 추가한다.
안 하면 "개발 중엔 됐는데 스토어 버전만 로그인 실패"가 난다.

⚠ **탈퇴(계정 삭제)는 Google Play 정책상 필수다.** 계정을 만드는 앱은 앱 안에 삭제 경로가 있어야 하고
스토어 등록 정보에 웹 삭제 URL도 적어야 한다. SDK에 `deleteAccount()`가 있으니 **로그인 화면을 만들 때
설정에 탈퇴도 같이 넣는다** — 나중에 붙이면 심사에서 막힌다.

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
