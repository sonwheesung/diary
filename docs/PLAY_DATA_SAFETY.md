# Play 데이터 보안 선언 — 확정 명세

> Play Console **앱 콘텐츠 → 데이터 보안** 마법사에 그대로 옮겨 적을 값의 정본.
> 정책 근거는 [`../CLAUDE.md`](../CLAUDE.md) §5.1·§14, 경로별 상세는
> [`BACKUP_SYSTEM.md`](./BACKUP_SYSTEM.md) · [`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) · [`SUPPORT_SYSTEM.md`](./SUPPORT_SYSTEM.md).
>
> 🔴 **제출은 사용자 본인이 한다.** 이 문서는 클릭할 값을 확정할 뿐이고, 콘솔 제출은
> 법적 성격의 신고라 대행하지 않는다. Google 원문: *"You alone are responsible for
> making complete and accurate declarations in your app's store listing on Google Play."*
>
> **작성 2026-08-23 · 전면 재검증 2026-08-24.** 재검증에서 바뀐 것은 §1·§4·§5·§6·§7이고,
> **선언값(§3)은 하나도 바뀌지 않았다.** 무엇이 바뀌었는지는 §8 개정 이력.

---

## 0. 왜 지금인가 — 이미 밀려 있다

Google 공식 문서(2026-08-23 실측 · **2026-08-24 재확인**,
`support.google.com/googleplay/android-developer/answer/10787469`):

> All developers that have an app published on Google Play must complete the Data safety form,
> **including apps on closed, open, or production testing tracks.** … Apps that are active on
> internal testing tracks are exempt from inclusion in the data safety section.

조각은 **비공개 테스트(Alpha)** 에 versionCode 8이 올라가 있고 로컬에는 이미 10이 있다
(CLAUDE.md §14 · `app.json`). 내부 테스트 면제에 해당하지 **않는다** — 지금 선언이 정확해야 한다.
그리고 그 빌드에는 **백업과 AI 리포트와 구독이 들어 있는데** 선언에는 `사용자 ID`도
`구매 내역`도 `기타 사용자 제작 콘텐츠`도 없다.

⚠ **선언을 넓히는 것은 릴리스를 기다리지 않는다.** §5.1의 *"올리기 전에 고친다"* 규율은
**좁은 선언으로 넓은 빌드를 올리지 마라**는 뜻이다. 이미 넓은 빌드가 올라간 지금은 반대로,
선언을 미루는 하루가 그대로 불일치 기간이다. (좁히는 변경만 릴리스와 묶는다 — §5 참조.)

---

## 1. 일시처리(ephemeral) 예외 — 공식 원문과 판정

§5.1이 *"적용 조건을 기억으로 단정하지 않는다"* 로 남겨둔 항목이다. 원문을 실측했다.

### 1.1 원문 (verbatim, 2026-08-23 실측 · **2026-08-24 재확인 — 문언 동일**)

출처: `https://support.google.com/googleplay/android-developer/answer/10787469?hl=en`
→ *What developers need to declare across data types* → **Data collection**

> **Ephemeral processing:** User data transmitted off device that is processed ephemerally
> needs to be included in your form response, but if it meets the standard below, it will
> **not** be disclosed in your app's Data safety section on Google Play.
>
> Processing data "ephemerally" means accessing and using it while the data is only stored in
> memory and retained for no longer than necessary to service the specific request in real-time.
>
> For example, a weather app that transmits user location off the device to fetch the current
> weather at the user's location but only uses location data in memory and does not store that
> data once the request has been fulfilled, can treat its transient use of location as ephemeral.

같은 문서의 **FAQ**(별도 위치):

> **How do I declare collection of data that is used in a transient way to load pages and service
> other client-side requests in real time before that data is logged on our servers and used for
> other purposes?**
> If this use is ephemeral, you do not need to include it in your form response. However, you must
> declare any use of that user data beyond the ephemeral processing, including any purposes for
> which you use the user data that you log.

### 1.2 🔴 발견 ① — 예외는 "선언 안 함"이 아니다

§5.1이 *"이 예외가 적용되면 일기 본문을 `Collected`로 선언하지 않아도 된다"* 로 이해하고
있었는데 **본문 규정은 그렇게 말하지 않는다.** 규정은 *"폼 응답에는 **포함해야 하고**,
기준을 만족하면 **공개 데이터 보안 섹션에 표시되지 않을 뿐**"* 이다.

콘솔 폼에는 데이터 유형마다 전용 질문이 있다:

| CSV 필드 | 콘솔 질문(영문) | 콘솔 질문(한국어 실측) |
|---|---|---|
| `PSL_DATA_USAGE_EPHEMERAL` | *"Is this data processed ephemerally?"* | **"이 데이터는 일시적으로 처리되나요?"** |

즉 일시처리는 **체크박스 하나**이지 "선택하지 않음"이 아니다.
(⚠ CSV 필드명은 2026-08-24에 같은 문서의 CSV 형식 표에서 재확인했다 — 실재한다.)

### 1.3 ⚠ 발견 ② — 공식 문서 두 곳이 서로 어긋난다

본문은 *"needs to be included in your form response"*, FAQ는 *"you do not need to include it
in your form response"* 다. **같은 문서 안에서 정반대다.** 2026-08-24에 두 곳을 각각 다시
읽어 **여전히 어긋난다**는 것을 확인했다 — 오독이 아니다.

→ **보수적 독법을 쓴다**: 폼에 포함하고 일시처리 질문에 답한다. 넓게 답해서 제재받는 경로는
없지만(§14: *"과다 선언은 제재 대상이 아니다"*), 빠뜨려서 제재받는 경로는 있다.

### 1.4 판정 — 조각의 AI 경로에는 **적용되지 않는다**

세 가지가 각각 독립적으로 기준을 깬다. 하나만 걸려도 일시처리가 아니다.

| # | 사실 | 코드 근거(2026-08-24 재실측) | 왜 기준을 깨나 |
|---|---|---|---|
| ① | 서버가 **모델이 쓴 요약문을 90일 저장**한다 | `server/db/schema.ts` `aiReports.summary` · `server/lib/ai-policy.ts:95` `REPORT_RETENTION_MS = 90 * 24 * 60 * 60 * 1000` · 리퍼가 실제로 지운다(`server/app/api/cron/reap/route.ts:213`) | 일기에서 파생된 콘텐츠가 *"retained for no longer than necessary to service the specific request in real-time"* 을 명백히 넘는다 |
| ② | **AI 사업자가 남용 감시 목적으로 최대 30일 보관**한다 | `features/legal/legal-text.ts` PRIVACY §6 — *"AI 사업자는 남용 감시 목적으로 최대 30일간 보관한 뒤 삭제하며"* · [`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) §9.2 | 우리가 전송한 데이터가 위탁사 손에서 30일 남는다. 위탁사 처리는 우리 처리다 |
| ③ | 서버가 `ai_usage`에 **subject·기간·토큰 수를 영구 저장**한다 | `server/db/schema.ts` `aiUsage` — 리퍼가 지우는 것은 `aiReports`·`aiCooldowns`뿐이고 `aiUsage`는 **어디서도 지우지 않는다**(2026-08-24 재확인) | 본문은 아니지만 요청에서 파생된 기록이 남는다. FAQ가 말하는 *"any use of that user data beyond the ephemeral processing … that you log"* 에 해당 |

🔴 **결론: 일기 본문(제목·텍스트)은 `기타 사용자 제작 콘텐츠`로 수집 선언한다. 일시처리 = 아니요.**

⚠ ①과 ②를 섞지 않는다. 저장하는 것은 **모델이 쓴 요약문**이고 **일기 원문이 아니다**
([`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) §5.2). 그 구분이 처리방침 문안의 전부이지만,
**데이터 보안 폼에서는 결과가 같다** — 파생물이든 원문이든 `기타 사용자 제작 콘텐츠`가
real-time 요청 이후까지 남으면 일시처리가 아니다.

### 1.5 반대로 **E2EE 예외는 적용된다** (백업 경로)

같은 문서, *Not in scope for data collection* (2026-08-24 재확인):

> **End-to-end encryption:** User data that is sent off device, but that is unreadable by you or
> anyone other than the sender and recipient as a result of end-to-end encryption does **not**
> need to be disclosed.

같은 절의 나머지 제외도 함께 확인했다:

> **On-device access/processing:** User data accessed by your app that is only processed locally
> on the user's device and not sent off device does not need to be disclosed.

조각의 백업이 E2EE 문언을 만족한다:

| 요건 | 조각 | 근거 |
|---|---|---|
| 개발자가 못 읽는다 | 서버는 복호화 키를 **갖지 않는다** | `features/backup/seal.ts`(XChaCha20-Poly1305) · `key-derive.ts`(HKDF-SHA256, 복구 코드에서 유도) |
| 키는 sender/recipient만 | 기기 SecureStore + 사용자 복구 코드. 서버는 `sha256(auth_key)`만 | `server/db/schema.ts` `vaults.authHash` |
| 중간자도 못 읽는다 | Storage에 올라가는 것은 봉투(암호문)뿐 | `features/backup/api/client.ts` — 서명 URL PUT |

⚠ **그러나 메타데이터는 평문이다.** `vault_id`·세대 번호·파트 수·바이트 수·시각·`subject_id`가
서버 DB에 평문으로 있다(`generations`·`generationParts`·`vaultGrants`). 앱도 이걸 그대로
고지하고(`backup.noticeMetadata`), 처리방침 §2 다목도 *"이 정보는 암호화되지 않습니다"* 라고 적는다.
→ 그중 `subject_id`가 아래 **`사용자 ID`** 선언의 근거 하나가 된다.

### 1.6 공유(sharing) 제외 4종 — 원문 (2026-08-24 신규 실측)

§3의 *"공유 = 아니요"* 판정이 이 문언 위에 서 있다. 여태 이 문서에 원문이 없었다.

> **Service providers:** An entity that processes user data on behalf of the developer and based
> on the developer's instructions.
>
> **Legal purposes:** Transferring user data for specific legal purposes, such as in response to
> a legal obligation or government requests.
>
> **User-initiated action or prominent disclosure and user consent:** Transferring user data to a
> third party based on a specific user-initiated action, where the user reasonably expects the
> data to be shared, or based on a prominent in-app disclosure and consent that meets the
> requirements described in our User Data policy.
>
> **Anonymous data:** Transferring user data that has been fully anonymized so that it can no
> longer be associated with an individual user.

🔴 **이 제외는 공짜가 아니다** — [`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) §9.4가
지켜야 유지되는 조건 3개(학습 미사용 · 눈에 띄는 고지와 동의 · 자동 생성 금지)를 적어놨다.
동의 화면을 간소화하자는 제안이 오면 그 절을 먼저 읽는다.

---

## 2. 조각이 기기 밖으로 보내는 것 — 코드 실측

문서가 아니라 코드에서 확인한 것만 적는다. **2026-08-24 전수 재조사.**

### 2.0 출구는 몇 개인가

앱 런타임 `fetch` 호출부는 **정확히 4곳**이다(`scripts/`의 빌드 도구 2곳 제외):

| | 어디 | 무엇 |
|---|---|---|
| 1 | `lib/common-server/index.ts:58` | bootstrap · 문의 · 로그인 · 엔타이틀먼트 (SDK 전체가 이 하나를 쓴다) |
| 2 | `features/ai/api/client.ts:127` | `POST /api/v1/ai/report` |
| 3 | `features/backup/api/client.ts:80` | 백업 라우트 + Storage 서명 URL PUT/GET |
| 4 | `features/backup/api/device-check.ts:70` | **개발 전용** — `EXPO_PUBLIC_DEVICE_CHECK=1`일 때만 |

⚠ **그런데 `fetch`가 출구의 전부가 아니다.** 네이티브 SDK 셋이 각자 통신한다 —
`@react-native-google-signin`(Google) · `react-native-purchases`(RevenueCat) ·
`react-native-google-mobile-ads`(AdMob). grep으로는 안 보인다.
🔴 **서버 쪽 출구도 하나 더 있다**: AI 실패 시 Discord 웹훅(§2-10).

**제3자 분석·크래시 SDK는 0개다** — Sentry·Firebase·Crashlytics·Amplitude·Mixpanel·PostHog·
AppsFlyer 모두 `package.json`에 없다.

### 2.1 마스터 표

| # | 경로 | 나가는 것 | 받는 곳 | 평문/암호문 | 보관 | 코드 |
|---|---|---|---|---|---|---|
| 1 | 구글 로그인 | `idToken`(구글 sub·이메일이 든 JWT) | common_server | 평문(서명 JWT) | 영구(탈퇴 시 이메일 즉시 파기, sub 가명화) | `features/support/auth-gate.ts:178` · `lib/common-server/index.ts:208` |
| 2 | 문의하기 | 분류 · 본문 · `platform` · `appVersion` (+ Bearer) | common_server | 평문 | 3년(법정) | `lib/common-server/index.ts:147` |
| 3 | 백업 — 내용 | 일기 행 · 사진 행 · 태그 · **AI 리포트 행** · `dbVersion` | 조각 서버 Storage | **암호문** (XChaCha20-Poly1305) | 최근 3세대(`KEEP_GENERATIONS`) · 구독 만료 +90일(`GRACE_MS`) · 3년 방치(`ABANDONED_MS`) | `features/backup/api/manifest-builder.ts:38-68` · `seal.ts:42` |
| 4 | 백업 — 사진 원본 | 원본 파일 바이트 | 조각 서버 Storage | **암호문** | 미참조 7일(`BLOB_ORPHAN_MS`) | `features/backup/api/photos.ts:184` |
| 5 | 백업 — **봉투 헤더** | `JGKB` 매직 · 버전 · `kid` · `seq` · `genId` · `part` · nonce · (blob은 `blobKey`) | Storage 객체 앞에 붙는다 | **평문** | 객체와 함께 | `features/backup/envelope.ts:127-171` |
| 6 | 백업 — **요청 메타** | `vault_id` · `authKey`(hex 64) · `blobKey` 목록 · `seq` · `genId` · 파트 수 | 조각 서버 DB/로그 | **평문**(TLS만) — `authKey`는 `sha256`으로 저장 | 세대와 함께 / 툼스톤 1년 | `features/backup/api/client.ts:178,294` · `server/db/schema.ts:36,45,173` |
| 7 | 백업 — 서버 파생 | 객체 바이트 수(서버가 직접 잰다) · 각종 시각 · **`subject_id`** | 조각 서버 DB | **평문** | `subject_id`는 파기 시 삭제 | `server/app/api/v1/backup/commit/route.ts:100` · `server/db/schema.ts:82` |
| 8 | **AI — 입력** | `{date, emotion(코드), title, text}` 배열. 월간·연간은 하위 **요약문** | 조각 서버 메모리 → OpenAI | **평문** | 우리 서버 **무저장**(라우트에 쓰는 코드 없음) · OpenAI `store:false` + 남용감시 최대 30일 | `features/ai/api/client.ts:96-132` · `server/lib/ai.ts:138` |
| 9 | **AI — 출력** | 모델이 쓴 **요약문** · `concern` · `source_count` · 언어 · 모델 · 프롬프트 판 · `subject_id` | 조각 서버 DB | 평문 | **90일** (`REPORT_RETENTION_MS`, 리퍼가 지운다) | `server/db/schema.ts` `aiReports` · `cron/reap/route.ts:213` |
| 10 | AI — 계량 | `subject_id` · 종류 · 기간 키 · 일자 · 토큰 수 · 모델 | 조각 서버 DB | 평문 | 🔴 **영구 — 지우는 코드가 0건** | `server/db/schema.ts` `aiUsage` |
| 11 | 🆕 AI — 실패 알림 | 실패 사유 · 종류 · 기간 키 · **`sha256(subject_id)` 앞 8자** · 잠금 여부 | **Discord 웹훅** | 평문(가명) | Discord 정책 | `server/lib/notify.ts:39-63` |
| 12 | 구독 | **`Purchases.logIn(subject_id)`** — RC `appUserID`가 곧 우리 `subject_id`다. + 스토어 영수증·상품·기기 | RevenueCat → common_server 웹훅 | 평문 | 영구 | `features/subscription/api/purchases.ts:74` · `auth-gate.ts:205` |
| 13 | 광고 | 광고 ID · 대략적 위치 · 기기/네트워크 · 상호작용 (전부 SDK 기본값) | Google AdMob | 평문 | Google 정책 | `features/ads/api/ads.ts:72-78` |

### 2.2 나가지 않는 것 (확인함)

- **사진은 AI로 가지 않는다.** `EntryInput`의 필드는 `date`·`emotion`·`title`·`text` **넷뿐**이고
  이미지 필드가 어디에도 없다. 사진이 기기를 떠나는 유일한 경로는 **암호화 백업**이다.
- **빈 본문은 아예 안 나간다.** `hasBody()`로 걸러 요청을 만든다(`report-service.ts:305`).
  입력 상한 `MAX_INPUT_CHARS = 40,000`자.
- **감정은 코드다**(`joy`), 현지화된 문구가 아니다.
- **지운 일기의 본문은 백업에도 안 들어간다.** `emptyBodyIfDeleted`가 `deleted_at`이 있는 행의
  `title`·`content`·`content_blocks`를 비운다(`manifest-builder.ts:81`).
- **`app_settings`(테마·언어·PIN 해시)는 매니페스트에 없다.**
- **푸시 토큰이 없다.** `getExpoPushToken`·`getDevicePushToken`·FCM 호출 0건 — 로컬 알림 전용
  ([`NOTIFICATION_SYSTEM.md`](./NOTIFICATION_SYSTEM.md)).
- **리포트 [신고]는 기기 안에서 끝난다.** `app/report/[id].tsx:64-72`는 `Alert` 하나다.
  ⚠ 그래서 서버의 `ai_reports.flagged`는 **아무도 `true`로 만들지 않는 죽은 컬럼**이고 운영
  콘솔의 그 필터는 영구히 빈다 — 데이터 보안과 무관하지만 §2의 사실로 적어둔다.
- `registerDevice`(익명 기기 등록)는 **조각이 부르지 않는다** — 호출부 0건.
- **암호문은 조각 서버 함수를 지나가지 않는다.** 서버는 서명 URL만 발급하고 앱이 Supabase에
  직접 PUT/GET 한다 — E2EE 판정(§1.5)이 이 사실 위에 선다.

### 2.3 ⏭ 이번 조사에서 새로 드러난 것 (선언에는 영향 없음)

| # | 것 | 왜 적어두나 |
|---|---|---|
| ㉮ | `purgeVault()`가 **`vaults.auth_hash`를 지우지 않는다** — 툼스톤에 1년 남는다(`server/lib/vault.ts:209-232`) | 스키마 주석은 툼스톤이 *"사용자와 연결되는 식별자를 남기지 않는다"* 고 적었는데 `auth_hash`는 **복구 코드에서 결정적으로 유도된 값**이다. Play 정의의 `사용자 ID`(계정 ID·번호·이름)에는 안 들어가 선언은 안 바뀐다 |
| ㉯ | `EXPO_PUBLIC_DEVICE_CHECK=1`이면 릴리스 번들에도 개발용 토큰 경로가 박힌다(`features/backup/api/client.ts:107`) | 막는 것이 코드가 아니라 **`check:release-env` 스크립트**다. 데이터 보안 선언과 무관하나 유출 경로라 기록한다 |
| ㉰ | AI 클라이언트·라우트 주석이 *"무저장"* 이라고만 적는다(`features/ai/api/client.ts:10` · `server/app/api/v1/ai/report/route.ts:51`) | 2026-08-13에 요약문 90일 저장을 정했는데 **그 두 주석만 안 따라왔다.** 스키마와 이 문서는 맞다. 코드 주석이라 법적 고지는 아니지만 다음 사람이 그 주석을 믿는다 |

---

## 3. 확정 선언표 (diff)

콘솔 마법사 순서 그대로다. **변경(diff)은 2026-08-12 CSV 실측(CLAUDE.md §14) 기준.**
한국어 라벨은 2026-08-24에 공식 문서 한국어판에서 실측한 것이다(§6-1 참조).

### 3.1 2단계 `데이터 수집 및 보안`

| 질문 | 현재 선언 | → 바꿀 값 | 근거 |
|---|---|---|---|
| 앱이 필수 사용자 데이터 유형을 수집하거나 공유하나요? | 예 | **예** (유지) | §2 전체 |
| 수집하는 모든 사용자 데이터가 **전송 중 암호화**되나요? | 예 | **예** (유지) | 전 경로 HTTPS. 처리방침 §10 |
| 사용자가 **데이터 삭제를 요청**할 방법을 제공하나요? | 아니요 | 🔴 **예** | §4 — 앱 내 탈퇴 + 웹 URL. 코드로 확인함 |

### 3.2 3단계 `데이터 유형` + 4단계 `데이터 사용 및 처리`

| # | 콘솔 경로 (한국어) | 수집 | 공유 | 일시처리 | 필수/선택 | 목적 | diff | 근거 |
|---|---|---|---|---|---|---|---|---|
| 1 | 개인 정보 → **이메일 주소** | ✅ | ❌ | 아니요 | **선택** | 앱 기능 · 계정 관리 | 유지 | §2-1 · 처리방침 §2 가목 |
| 2 | 개인 정보 → **사용자 ID** | ✅ | ❌ | 아니요 | **선택** | 앱 기능 · 계정 관리 | 🔴 **추가** | §2-1·2-4·2-7 · `DELETE_ACCOUNT` §3 |
| 3 | 금융 정보 → **구매 내역** | ✅ | ❌ | 아니요 | **선택** | 앱 기능 | 🔴 **추가** | §2-8 · 처리방침 §2 라목 |
| 4 | 메시지 → **기타 인앱 메시지** | ✅ | ❌ | 아니요 | **선택** | 앱 기능 | 유지 | §2-2 |
| 5 | 앱 활동 → **기타 사용자 제작 콘텐츠** | ✅ | ❌ | **아니요** | **선택** | 앱 기능 · 분석 | 🔴 **추가** | §1.4 · §2-5·2-6 · 처리방침 §2 마목 |
| 6 | 위치 → **대략적인 위치** | ✅ | ✅ | 아니요 | 필수 | 광고 | 유지 — **건드리지 않는다** | §2-9(AdMob) |
| 7 | 앱 정보 및 성능 → **진단** | ✅ | ✅ | 아니요 | 필수 | 분석 | 유지 — **건드리지 않는다** | §2-9 |
| 8 | 앱 활동 → **앱 상호작용** | ✅ | ✅ | 아니요 | 필수 | 분석 · 사기 예방, 보안, 규정 준수 · 광고 | 유지 — **건드리지 않는다** | §2-9 |
| 9 | 기기 또는 기타 ID → **기기 또는 기타 ID** | ✅ | ✅ | 아니요 | 필수 | 분석 · 사기 예방, 보안, 규정 준수 · 광고 | 유지 — **건드리지 않는다** | §2-8·2-9 |

🔴 **6~9는 손대지 않는다.** AdMob·RevenueCat SDK가 무엇을 보내는지 우리가 전수 확인하지 않았고
(§6-2·§6-3), 지금 선언은 **넓은 쪽**이다. §14: *"과다 선언은 제재 대상이 아니다."*
좁히려면 SDK 공식 문서로 확정한 뒤 그 빌드가 나간 다음에 한다(§5 순서 규칙).

**부가 선언**: `계정 생성 방법 = OAuth` ✅ 유지 · 독립 보안 검토 = 아니요 · Families 정책 = 해당 없음 ·
**계정 삭제 URL** = `https://sonwheesung.github.io/diary/delete-account.html` ✅ 이미 등록됨.

### 3.3 추가 3건 — 한 줄 근거

#### #2 `사용자 ID` (`PSL_USER_ACCOUNT`)

Play 정의(2026-08-24 재확인): *"Identifiers that relate to an identifiable person. For example,
an account ID, account number, or account name."*

세 곳에서 저장한다. 하나만으로도 선언 사유가 된다.

| 저장처 | 값 |
|---|---|
| `common_server.subjects.provider_id` | **구글 sub** |
| `조각서버.vault_grants.subject_id` · `generations` 계열 | 백업 소유자 |
| `조각서버.ai_usage.subject_id` · `ai_reports.subject_id` | AI 사용 기록 |

⚠ §14가 *"과소 선언"* 이라고 적어둔 그 항목이다. `DELETE_ACCOUNT §3`이 구글 sub를 삭제
대상으로 명시하고 있어 **우리 문서가 이미 저장을 인정**한다.

#### #3 `구매 내역` — §14가 못 잡은 네 번째 구멍

🔴 **이 항목은 2026-08-12 실측 목록에도, §14의 "여전히 막고 있는 것"에도 없었다.**

`common_server/db/schema.ts` `purchaseEvents`가 `productId` · `storeTxnId` · `type`
(`INITIAL_PURCHASE` | `RENEWAL` | …) · `environment` · `subjectId`를 저장하고,
`entitlements`가 `expiresAt` · `graceUntil`을 저장한다. Play 정의(*"Information about purchases
or transactions a user has made"*)에 정확히 해당한다.

- **공유 아님**: RevenueCat은 위탁사다 — §1.6 *Service providers* 문언. 처리방침 §6도
  위탁으로 기재한다(*"RevenueCat, Inc. … 이전 목적: 구독 결제 검증"*).
- **선택**: 구독하지 않으면 발생하지 않는다.

#### #5 `기타 사용자 제작 콘텐츠` — 일기 본문

Play 정의: *"Any other user-generated content not listed here… For example, user bios, **notes**,
or open-ended responses."* — 일기가 정확히 `notes`다.

- **일시처리 = 아니요**: §1.4의 3가지 근거.
- **공유 = 아니요**: §1.6의 제외 **둘에 동시에** 걸린다. ① OpenAI는 위탁사(학습 미사용 —
  [`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) §9.2) ② *user-initiated action …
  or prominent in-app disclosure and consent*: 리포트는 사용자가 [만들기]를 눌러야만 나가고
  `app/ai-consent.tsx`가 §23·§28-8 동의를 따로 받는다.
- **선택**: 구독 + 동의 2종 + 수동 버튼. 게이트가 [만들기] 하나에만 걸려 있어 거부해도 앱은 그대로 쓴다.
- **목적**: `앱 기능`(리포트 생성) + `분석`(요약문 90일 보관의 목적이 프롬프트 품질 개선 —
  처리방침 §3이 *"그 결과를 확인해 품질을 개선하기 위함"* 이라고 이미 적었다).

### 3.4 ⚠ 판단이 갈리는 두 항목 — 사용자가 정한다

#### (가) `사진` — **선언하지 않기를 권한다**

사진이 기기를 떠나는 경로는 **암호화 백업뿐**이고(AI에는 안 간다 — §2), §1.5의 E2EE 예외가
그대로 적용된다: *"does not need to be disclosed."*

| | 선언 안 함 (권장) | 선언함 |
|---|---|---|
| 근거 | 공식 문언 그대로. E2EE 요건 3개를 코드가 만족 | 과다 선언은 제재 대상이 아니다(§14) |
| 대가 | 심사자에게 E2EE를 설명해야 할 수 있다 | 스토어 카드에 *"사진 — 수집됨"* 이 뜬다. **E2EE 약속과 어긋나 보인다** |

⚠ **§5.1의 옛 지시(*"일기 본문·사진을 수집 항목에 추가"*)를 이 문서가 좁힌다.** 그 줄은
E2EE 예외 원문을 읽기 전에 쓴 것이다. **일기 본문은 여전히 선언해야 하지만**(AI 경로 때문에,
백업 때문이 아니다) **사진은 AI를 지나가지 않아 백업의 E2EE 예외만 남는다.**

#### (나) `건강 정보` — **선언하지 않기를 권한다**

Play 정의는 좁다: *"Information about a user's health, such as medical records or symptoms."*
조각이 보내는 것은 자유 서술 일기와 감정 **코드**(`joy` 등)이고, 의료 기록도 증상 기록도 아니다.

⚠ 그런데 **앱 자신은 「개인정보 보호법」 §23 민감정보 동의를 받는다** — 처리방침 §2 마목:
*"일기에는 건강·심리 상태 등 「개인정보 보호법」 제23조의 민감정보가 담길 수 있습니다."*
PIPA와 Play의 정의가 다르다는 것이 답이지만, 판단이 갈릴 수 있는 자리라 적어둔다. 넣기로 하면
`건강 및 피트니스 → 건강 정보`를 #5와 같은 답(수집·비공유·비일시·선택·앱 기능)으로 추가한다.

---

## 4. `데이터 삭제 요청` 항목 — **예로 바꿔도 된다** (코드로 확인)

### 4.1 Play가 요구하는 것 (verbatim, 2026-08-24 재확인)

> **Is there a specific type of mechanism that I must provide…?**
> There is no prescribed mechanism, however as best practice the request mechanism should be
> easily discoverable and accessible by users. Common examples … may include but are not limited
> to: **in-app features**, contact forms, or a dedicated email alias.
>
> You may select the deletion request mechanism badge if you:
> - provide users with a mechanism to request data deletion; **or**
> - automatically initiate deletion or anonymization of collected data within 90 days of collection.
>
> **You may select the deletion request mechanism badge even if you need to retain certain data
> for legitimate reasons such as legal compliance or abuse prevention.**

### 4.1.1 🆕 별개 정책 — **계정 삭제 요구사항** (2026-08-24 신규 실측)

이 문서 §6의 미확인 #6이었다. 읽었다.
출처: `https://support.google.com/googleplay/android-developer/answer/13327111`

> If your app enables account creation, you must … **provide users with an in-app path to delete
> their app accounts and associated data; and provide a web link resource where users can request
> app account deletion.**
>
> [When deleting accounts] you must also delete the user data associated with that app account.
> [Apps may retain data] for legitimate reasons such as security, fraud prevention or regulatory
> compliance [if users are clearly informed].

**조각은 둘 다 갖췄다** — 앱 내 탈퇴(§4.2)와 웹 URL(`docs/delete-account.html`, 15개 언어,
Play에 이미 등록됨). ✅ **미확인 #6 해소. 새 블로커 없음.**

### 4.2 조각에 실제로 있는 경로 (코드 실측)

**앱 안 경로**: 설정 → 문의하기 → (로그인) → **탈퇴** — `features/support/auth-gate.ts` `deleteAccount()`.
**웹 경로**: `https://sonwheesung.github.io/diary/delete-account.html`(15개 언어, 2026-08-17).

§5.1이 *"조각 서버에 백업이 쌓이면 그 백업을 지우는 경로가 따로 있어야 한다"* 고 적어둔 것,
**있다. 그리고 탈퇴에 묶여 있다:**

```
deleteAccount()
  ├─ ① purgeBackup()                      features/backup/api/run-backup.ts
  │     └─ POST /api/v1/backup/delete  →  purgeVault()   server/lib/vault.ts
  │           · Storage 객체 삭제(파트 + 사진 blob) — 행보다 먼저
  │           · generation_parts · generations · vault_blobs · vault_grants 행 삭제
  │           · vaults 는 툼스톤(purged_at)으로만 남고 subject_id 를 남기지 않는다
  │     🔴 실패하면 여기서 멈춘다 — 계정만 지우고 백업이 남으면 그 진술이 거짓이 되므로
  └─ ② DELETE /api/v1/auth/me         →  softDeleteSubject()  common_server/lib/auth/subject.ts
        · email = null (즉시 파기)
        · provider_id = 'deleted:<uuid>' (구글 sub 가명화)
```

순서까지 옳다 — 코드 주석: *"계정이 사라지고 백업이 남으면 지울 권한이 있는 사람이 없어진다."*
그리고 `delete` 라우트는 **구독을 요구하지 않고**, grant **또는** `auth_key` 둘 중 하나만
있으면 지운다(복구 코드를 잃어도, 재가입으로 `subject_id`가 바뀌었어도 지울 수 있다).

### 4.3 ⚠ 탈퇴가 지우지 **않는** 것 — 그래도 배지는 정당하다

| 남는 것 | 얼마나 | Play 판정 | 우리 판정 |
|---|---|---|---|
| `tickets` 문의 본문 | 3년 | ✅ *"legitimate reasons such as legal compliance"* — 소비자 분쟁 기록 | 의도된 설계. 처리방침 §4가 고지 |
| `ai_reports.summary` (+`subject_id`) | **90일** — 탈퇴로는 안 지워지고 리퍼가 시간으로 지운다 | ✅ 두 번째 조건 *"automatically initiate deletion … within 90 days"* 를 **정확히** 충족 | 🔴 §4.4 — **법적 문안과 어긋난다** |
| `ai_usage` (`subject_id`·기간 키·토큰 수) | **영구** — 지우는 코드가 없다 | ✅ 배지 조건은 **하나만** 충족하면 된다(`or`)이고 메커니즘 조건을 이미 충족 | 🔴 §4.4 — **법적 문안과 어긋난다** |
| `purchase_events`·`entitlements` | 영구 | ✅ 거래 기록 | 처리방침 §4가 5년 법정 보관으로 고지 |

🔴 **판정: `데이터 삭제 요청 = 예`로 바꾸는 데 선행 작업이 없다.** §5.1이 걱정한 백업 삭제
경로는 이미 있고 탈퇴에 **차단형으로** 묶여 있다.

### 4.4 🔴 2026-08-24 신규 발견 — **탈퇴가 AI 테이블을 건드리지 않는다**

Play 블로커는 아니다(배지 조건은 `or`이고 우리는 메커니즘 조건을 충족한다).
그러나 **우리가 어제 게시한 문서가 사실과 다르다.**

2026-08-23 처리방침 승격으로 두 문장이 새로 **본문**이 됐다:

| 문서 | 문장 | 코드 |
|---|---|---|
| `PRIVACY` §4 | *"리포트 이용 기록(계정 식별자, 기간, 횟수, 토큰 수): 이용 목적 달성 시 또는 **탈퇴 시까지**"* | ❌ |
| `DELETE_ACCOUNT` §3 | *"**탈퇴하면** 다음 정보가 즉시 파기되거나 되짚을 수 없는 형태로 처리됩니다. … 서버에 보관 중인 **AI 리포트 요약문(최대 90일)** 과 **리포트 이용 기록(기간·횟수·토큰 수)**"* | ❌ |

**둘 다 거짓이다.** 실측(2026-08-24):

- `deleteAccount()`(`features/support/auth-gate.ts:265-309`)는 ① 백업 파기 ② `DELETE /auth/me`
  ③ 구글 revoke ④ 로컬 스토어 정리 — **네 단계 어디에도 AI가 없다.**
- `purgeVault()`(`server/lib/vault.ts:209-232`)는 `generationParts`·`generations`·`vaultBlobs`·
  `vaultGrants`·`vaults`만 건드린다. `aiUsage`·`aiReports`를 **import조차 하지 않는다.**
- 리퍼(`cron/reap`)는 `aiReports`(90일)와 `aiCooldowns`만 지운다. `aiUsage`는 없다.
- 레포 전체에서 `delete(aiUsage)` **0건**.

→ 결과: 탈퇴한 사람의 **요약문이 `subject_id`에 묶인 채 최대 90일 남고**, `ai_usage` 행은
**영원히 남는다**. 후자는 *"이 사람이 어느 주에 일기를 썼다"* 의 영구 기록이다.

⚠ 승격 전에는 예고문(미래형)이라 거짓이 아니었다. **본문으로 올리는 순간 현재형 진술이
됐고 그때 코드가 따라오지 않았다.** CLAUDE.md §5.1이 잡으려던 것과 같은 종류인데
**방향이 반대다** — 그때는 코드가 앞서고 고지가 뒤졌고, 지금은 고지가 앞서고 코드가 뒤졌다.
⚠ 이 비대칭이 특히 아픈 이유: 백업 쪽은 *"계정보다 백업을 먼저 지운다"* 를 차단형으로까지
설계해놨는데(`auth-gate.ts:270-278`), **AI 쪽에는 그 대칭이 아예 없다.**

**세 갈래가 있고 전부 코드 변경이라 이 문서 밖이다:**

| 안 | 내용 | 대가 |
|---|---|---|
| ㉠ 코드를 문안에 맞춘다 | 탈퇴 시 `ai_reports`를 `subject_id`로 삭제하고, `ai_usage.subject_id`를 **단방향 해시로 가명처리** | 🔴 `uq_ai_usage_period`(subject_id·kind·period_key UNIQUE)가 *"이 기간은 평생 1번"* 캡의 유일한 근거다. 결정적 해시면 UNIQUE가 유지될 것으로 보이나 **확인하지 않았다**(§6-4) |
| ㉡ 절반만 | `ai_reports`만 탈퇴 시 삭제(쉽다·안전하다). `ai_usage`는 문안을 고친다 | 두 문서 중 하나만 참이 된다 — 결국 ㉢을 같이 해야 한다 |
| ㉢ 문안을 코드에 맞춘다 | *"리포트 이용 기록은 부정 이용 방지를 위해 탈퇴 후에도 보관합니다"* 로 고치고 15개 언어 재번역 + `legal:stamp` | 정직하지만 배지 근거를 *"legitimate reasons such as … abuse prevention"* 에 의존하게 된다(Play는 §4.1에서 명시적으로 허용) |

권장: **㉠ + (㉠이 캡을 깨면) ㉡+㉢.** 프로덕션 출시 전까지 닫는다 — 비공개 테스트 단계에서는
탈퇴한 실사용자가 사실상 없어 급하지 않다.

---

## 5. 제출 순서 — 지금 시점의 정답

### 5.1 ~~처리방침이 폼보다 급하다 — 지금 거짓이다~~ → ✅ **해소됨** (2026-08-23)

~~`features/legal/legal-text.ts`의 백업·AI는 아직 `pending`(개정 예고)이고 본문이 아니다.
본문 §1은 여전히 "운영자는 다음 정보를 수집하지 않으며 … 일기의 제목·본문 …"이라고 말한다.
데이터 보안 폼은 처리방침 링크가 있어야 제출되는데, 폼이 "일기 본문 수집"이라고 하고
링크된 처리방침이 "수집하지 않습니다"라고 하면 불일치가 그 자리에서 드러난다.
작업: `pending` → 본문 승격 + §1 수정 → 14개 언어 → `legal:stamp` → `check:legal` → `legal:html`.~~

→ **끝났다(2026-08-23, 커밋 `5ce30ea`).** 이 문서가 작성된 날 같은 커밋에서 승격됐는데
이 절만 옛 상태로 남아 있었다(2026-08-24 정정).

실측으로 확인한 현재 상태:

| | |
|---|---|
| `PRIVACY.effective` / `.updated` | **2026-08-23** |
| §1 제목 | ~~`1. 수집하지 않는 정보 (먼저 밝힙니다)`~~ → **`1. 일기가 어디에 저장되는지 먼저 밝힙니다`** |
| §1 본문 | 백업(*"암호화된 사본이 서버에 보관 · 운영자는 읽지 못합니다"*)과 AI(*"암호화되지 않은 상태로 서버를 거쳐 AI 사업자에게 · 저장하지 않습니다"*)를 **둘 다 현재형으로** 적는다 |
| 백업 ↔ AI 대비 | §1에 *"백업은 저장하지만 읽지 못하고, AI는 읽지만 저장하지 않습니다"* 를 **명시** |
| `DELETE_ACCOUNT` | 5절 → **6절**. §5 제목 `삭제 대상이 아닌 것` → `기기에 남는 것` |
| 15개 언어 · HTML | ✅ 게시됨 (`docs/privacy.html` · `docs/delete-account.html`) |

🔴 **따라서 폼 제출을 막는 선행 작업이 없다.** 폼이 *"일기 본문 수집"* 이라고 선언해도
링크된 처리방침이 같은 말을 한다.

⚠ 단 §4.4의 어긋남은 남아 있다 — **폼 블로커는 아니지만** 승격된 문안 두 줄이 거짓인 상태다.

### 5.2 지금 시점의 올바른 순서

```
① [지금 · 사용자]  데이터 보안 폼 수정 → 제출        새 AAB를 기다리지 않는다 (§0)
                     2단계 삭제 = 예 · 3단계 3건 추가
② [대기]           Google 검토                       비공개 테스트는 계속 돈다 — 폼 수정이 트랙을 멈추지 않는다
③ [병행 · 개발]    §4.4 탈퇴 ↔ AI 테이블 정합       코드 변경. 프로덕션 전까지
④ [그 후]          프로덕션 출시 + 국가 145개 손선택  CLAUDE.md §9.1
```

**왜 ①이 새 빌드를 기다리지 않나** — §5.1의 규율은 *"좁은 선언으로 넓은 빌드를 올리지 마라"* 는
**방향이 있는** 규칙이다. 우리는 이미 그 순서를 어겼고(v8·v9가 백업·AI를 담고 올라갔다),
남은 선택은 *"오늘 맞추기"* 와 *"내일 맞추기"* 뿐이다. 미루는 하루가 그대로 불일치 기간이다.

### 5.3 ⚠ 순서를 뒤집지 않는다

| 방향 | 언제 |
|---|---|
| 선언을 **넓힌다**(유형 추가 · 삭제 배지 켜기) | **언제든.** 빌드를 기다리지 않는다 |
| 선언을 **좁힌다**(유형 제거 · 목적 축소) | 그 유형을 더는 수집하지 않는 빌드가 **배포된 뒤에** |

§3.2의 6~9(AdMob 계열)를 손대지 않는 이유가 이것이다 — 지금 좁히면 규칙을 반대 방향으로 어긴다.

---

## 6. 남은 미확인

숨기지 않고 적는다. **2026-08-24 갱신** — #6은 해소됐고 #7이 새로 생겼다.

| # | 확인 못 한 것 | 왜 · 상태 |
|---|---|---|
| 1 | 콘솔 폼의 한국어 라벨이 이 문서 표기와 **글자까지** 같은지 | 🟡 **부분 해소(2026-08-24).** 공식 문서 한국어판에서 데이터 유형명·질문·목적 7종을 실측해 §3·§7에 반영했다(`대략적 위치` → **`대략적인 위치`** 등을 이때 고쳤다). 다만 **콘솔 실물은 보지 않았다** — 클릭 시 영문명으로 대조할 것 |
| 2 | AdMob이 실제로 수집하는 유형의 최신 목록 | ❌ 미확인. Google은 *"refer to their SDK providers' published data safety information"* 이라고만 한다. 현재 4개 선언은 **그대로 둔다**(§3.2 6~9) — 과다 쪽이라 위험하지 않다 |
| 3 | RevenueCat SDK가 자체로 보내는 항목 | ❌ 미확인. `구매 내역`·`기기 또는 기타 ID`는 이미 커버되지만 그 밖은 모른다 |
| 4 | `ai_usage` 가명화가 **`uq_ai_usage_period` 캡을 유지하면서** 가능한지 | ❌ 미확인. §4.4 ㉠의 전제다. 결정적 해시면 UNIQUE가 유지될 것으로 **보이나 실측하지 않았다** |
| 8 | 툼스톤에 남는 `vaults.auth_hash`가 Play 기준 어떤 유형인지 | ❌ 미확인(§2.3 ㉮). 복구 코드에서 유도된 값이라 `사용자 ID`(계정 ID·번호·이름) 정의에는 안 들어간다고 **판단**했으나 1차 자료로 확인하지 않았다. 선언을 바꿀 근거로는 약하고, 바꾼다면 넓히는 방향이라 언제든 가능하다 |
| 5 | 일시처리 문언의 자체 모순에 대한 Google의 유권 해석 | ❌ 미확인. 본문과 FAQ가 정반대다(§1.3). 2026-08-24에 두 곳을 각각 다시 읽어 **모순이 실재함만 확인**했다. 어차피 조각은 예외에 해당하지 않아 **결론이 안 바뀐다** |
| ~~6~~ | ~~`데이터 삭제` 배지와 별개인 Play "계정 삭제" 요건(`answer/13327111`)~~ | ✅ **해소(2026-08-24).** 원문 실측 — 앱 내 경로 **와** 웹 링크 둘 다 필요하고 조각은 둘 다 갖췄다(§4.1.1) |
| **7** | **Play 심사가 E2EE 예외를 우리 설명 없이 인정하는지** | ❌ 미확인. §3.4 (가) `사진` 미선언의 유일한 리스크다. 문언상으로는 명백하나 **심사 실무를 확인할 1차 자료가 없다.** 지적받으면 그때 `사진`을 추가하면 되고, 넓히는 방향이라 언제든 가능하다(§5.3) |

---

## 7. 콘솔에서 누를 것 — 클릭 단위

> 이 절만 보고 그대로 따라갈 수 있어야 한다. 라벨은 공식 한국어 문서 실측값이다(§6-1).
> ⚠ **저장은 각 단계마다 [다음]으로 넘어가며 되고, 마지막 [제출]까지 눌러야 반영된다.**

### 0단계 — 들어가기

```
Play Console → 앱 선택: 조각 (com.son0925.jogak, 앱 ID 4973120282466573971)
  → 왼쪽 메뉴 [정책 및 프로그램] → [앱 콘텐츠]
  → 목록에서 '데이터 보안' 행 → [관리] (처음이면 [시작])
```

⚠ **운영 앱이다.** stg 앱(별도 패키지)이 아니다 — 섞으면 엉뚱한 앱의 선언을 고친다.

### 1단계 — `개요`

읽고 [다음]. 입력할 것 없다.

### 2단계 — `데이터 수집 및 보안`

```
□ 앱에서 필수 사용자 데이터 유형을 수집하거나 공유하나요?
      → ● 예                                          (유지 — 이미 예)

□ 수집하는 모든 사용자 데이터가 전송 중에 암호화되나요?
      → ● 예                                          (유지 — 이미 예)

□ 사용자가 데이터 삭제를 요청할 수 있는 방법을 제공하나요?
      → ● 예                                          🔴 변경 (현재 '아니요')
         근거 §4 — 앱 내 탈퇴 + 웹 URL 둘 다 있다

□ 계정 삭제 URL (이미 입력돼 있으면 그대로 둔다)
      → https://sonwheesung.github.io/diary/delete-account.html
```

[다음]

### 3단계 — `데이터 유형`

**체크를 3개 추가한다. 기존 6개는 절대 건드리지 않는다.**

```
[개인 정보]
   ☑ 이메일 주소                       (이미 체크됨 — 그대로)
   ☑ 사용자 ID                         🔴 새로 체크

[금융 정보]
   ☑ 구매 내역                         🔴 새로 체크

[위치]
   ☑ 대략적인 위치                     (이미 체크됨 — 그대로)

[메시지]
   ☑ 기타 인앱 메시지                  (이미 체크됨 — 그대로)

[사진 및 동영상]
   ☐ 사진                              🚫 체크하지 않는다 (§3.4 가 — E2EE 예외)

[건강 및 피트니스]
   ☐ 건강 정보                         🚫 체크하지 않는다 (§3.4 나)

[앱 활동]
   ☑ 앱 상호작용                       (이미 체크됨 — 그대로)
   ☑ 기타 사용자 제작 콘텐츠           🔴 새로 체크

[앱 정보 및 성능]
   ☑ 진단                              (이미 체크됨 — 그대로)

[기기 또는 기타 ID]
   ☑ 기기 또는 기타 ID                 (이미 체크됨 — 그대로)
```

[다음]

### 4단계 — `데이터 사용 및 처리`

체크한 유형마다 카드가 하나씩 뜬다. **새로 추가한 3개만** 채운다.

#### ① 개인 정보 → 사용자 ID

```
이 데이터는 수집되나요, 공유되나요, 아니면 수집되고 공유되나요?
   ☑ 수집됨              ☐ 공유됨
이 데이터는 일시적으로 처리되나요?
   ● 아니요
이 데이터는 앱에 필요한가요? 아니면 사용자가 수집 여부를 선택할 수 있나요?
   ● 사용자가 이 데이터의 수집 여부를 선택할 수 있습니다
이 사용자 데이터는 왜 수집되나요?  (복수 선택)
   ☑ 앱 기능      ☑ 계정 관리
```

#### ② 금융 정보 → 구매 내역

```
수집/공유           ☑ 수집됨   ☐ 공유됨
일시적으로 처리?     ● 아니요
필수/선택           ● 사용자가 선택할 수 있습니다
목적                ☑ 앱 기능
```

#### ③ 앱 활동 → 기타 사용자 제작 콘텐츠

```
수집/공유           ☑ 수집됨   ☐ 공유됨      ← 🔴 '공유됨'을 체크하지 않는다 (§1.6 · §3.3)
일시적으로 처리?     ● 아니요                 ← 🔴 근거 §1.4. '예'로 하면 사실과 다르다
필수/선택           ● 사용자가 선택할 수 있습니다
목적                ☑ 앱 기능      ☑ 분석
```

**기존 6개 카드는 열어보기만 하고 값을 바꾸지 않는다**(§3.2 · §5.3).

[다음]

### 5단계 — `스토어 등록정보 미리보기`

```
확인할 것
   · '데이터가 공유되지 않음' 또는 공유 목록에 위치·진단·상호작용·기기 ID만 있는지
   · 수집 목록에 이메일·사용자 ID·구매 내역·인앱 메시지·기타 UGC가 보이는지
   · '사진'이 어디에도 없는지                      ← 있으면 3단계로 돌아가 체크 해제
   · '데이터 삭제를 요청할 수 있음' 배지가 보이는지  ← 없으면 2단계 세 번째 질문 확인

→ [저장] → [제출]
```

### 제출 후

- 검토에 며칠 걸릴 수 있다. **비공개 테스트 트랙은 멈추지 않는다** — 폼 수정은 트랙 배포와 별개다.
- 프로덕션 출시 전에 §4.4(`ai_usage`)를 닫는다.

---

## 8. 개정 이력

| 날짜 | 무엇 |
|---|---|
| 2026-08-23 | 최초 작성. 일시처리·E2EE 원문 실측, 선언표 확정, 추가 3건 도출 |
| **2026-08-24** | **전면 재검증.** ① 공식 원문 5종 재실측(일시처리 본문·FAQ, E2EE, 공유 제외 4종, 삭제 배지, 트랙 요건) — **문언 동일, 판정 불변** ② 한국어 콘솔 라벨 실측 → §3·§7 반영(`대략적 위치`→`대략적인 위치`) ③ 미확인 #6 해소(`answer/13327111` 계정 삭제 요건 — 조각은 충족) ④ 🔴 §5 전면 교체 — 처리방침 승격은 **2026-08-23에 이미 끝났는데** 이 문서만 "아직 거짓"으로 남아 **없는 블로커를 세워놨다** ⑤ 🔴 §4.4 신규 — 승격된 문안이 AI 요약문·이용기록 삭제를 약속하는데 **탈퇴가 그 테이블을 건드리지 않는다** ⑥ §2를 코드 전수조사로 재작성 — 출구 목록·평문 메타데이터·Discord 웹훅(신규)·`purchases.logIn(subject_id)` 확인 ⑦ §7을 클릭 단위로 재작성 |
| | ⚠ **선언값(§3)은 재검증에서 한 칸도 바뀌지 않았다.** 새로 안 사실이 전부 "이미 옳던 판정의 근거를 굳히거나, 폼 밖의 코드 문제를 드러내는" 쪽이었다 |
