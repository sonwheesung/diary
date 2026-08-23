# Play 데이터 보안 선언 — 확정 명세

> Play Console **앱 콘텐츠 → 데이터 보안** 마법사에 그대로 옮겨 적을 값의 정본.
> 정책 근거는 [`../CLAUDE.md`](../CLAUDE.md) §5.1·§14, 경로별 상세는
> [`BACKUP_SYSTEM.md`](./BACKUP_SYSTEM.md) · [`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) · [`SUPPORT_SYSTEM.md`](./SUPPORT_SYSTEM.md).
>
> 🔴 **제출은 사용자 본인이 한다.** 이 문서는 클릭할 값을 확정할 뿐이고, 콘솔 제출은
> 법적 성격의 신고라 대행하지 않는다. Google 원문: *"You alone are responsible for
> making complete and accurate declarations in your app's store listing on Google Play."*

---

## 0. 왜 지금인가 — 이미 밀려 있다

Google 공식 문서(2026-08-23 실측, `support.google.com/googleplay/android-developer/answer/10787469`):

> All developers that have an app published on Google Play must complete the Data safety form,
> **including apps on closed, open, or production testing tracks.** … Apps that are active on
> internal testing tracks are exempt from inclusion in the data safety section.

조각은 **비공개 테스트(Alpha)** 에 versionCode 8/9가 올라가 있다(CLAUDE.md §14). 내부 테스트
면제에 해당하지 않는다 — 지금 선언이 정확해야 한다. 그리고 그 빌드에는 **백업과 AI 리포트가
들어 있는데** 선언에는 `User IDs`도 `구매 내역`도 `기타 사용자 제작 콘텐츠`도 없다.

⚠ **선언을 넓히는 것은 릴리스를 기다리지 않는다.** §5.1의 *"올리기 전에 고친다"* 규율은
**좁은 선언으로 넓은 빌드를 올리지 마라**는 뜻이다. 이미 넓은 빌드가 올라간 지금은 반대로,
선언을 미루는 하루가 그대로 불일치 기간이다. (좁히는 변경만 릴리스와 묶는다 — §5 참조.)

---

## 1. 일시처리(ephemeral) 예외 — 공식 원문과 판정

§5.1이 *"적용 조건을 기억으로 단정하지 않는다"* 로 남겨둔 항목이다. 원문을 실측했다.

### 1.1 원문 (verbatim, 2026-08-23 실측)

출처: `https://support.google.com/googleplay/android-developer/answer/10787469?hl=en`
→ *What developers need to declare across data types* → **Data collection**

> **Ephemeral processing:** User data transmitted off device that is processed ephemerally
> needs to be included in your form response, but if it meets the standard below, it will not
> be disclosed in your app's Data safety section on Google Play.
>
> Processing data "ephemerally" means accessing and using it while the data is only stored in
> memory and retained for no longer than necessary to service the specific request in real-time.
>
> For example, a weather app that transmits user location off the device to fetch the current
> weather at the user's location but only uses location data in memory and does not store that
> data once the request has been fulfilled, can treat its transient use of location as ephemeral.
> However, using data to build advertising profiles or other user profiles cannot be treated as
> ephemeral and must be declared as collection or sharing for the relevant purposes.

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

실제로 콘솔 폼에는 데이터 유형마다 전용 질문이 있다(같은 문서의 CSV 필드 명세):

| CSV 필드 | 콘솔 질문 |
|---|---|
| `PSL_DATA_USAGE_EPHEMERAL` | **"Is this data processed ephemerally?"** |

즉 일시처리는 **체크박스 하나**이지 "선택하지 않음"이 아니다.

### 1.3 ⚠ 발견 ② — 공식 문서 두 곳이 서로 어긋난다

본문은 *"needs to be included in your form response"*, FAQ는 *"you do not need to include it
in your form response"* 다. **같은 문서 안에서 정반대다.**

→ **보수적 독법을 쓴다**: 폼에 포함하고 일시처리 질문에 답한다. 넓게 답해서 제재받는 경로는
없지만(§14: *"과다 선언은 제재 대상이 아니다"*), 빠뜨려서 제재받는 경로는 있다.

### 1.4 판정 — 조각의 AI 경로에는 **적용되지 않는다**

세 가지가 각각 독립적으로 기준을 깬다. 하나만 걸려도 일시처리가 아니다.

| # | 사실 | 코드/문서 근거 | 왜 기준을 깨나 |
|---|---|---|---|
| ① | 서버가 **모델이 쓴 요약문을 90일 저장**한다 | `server/db/schema.ts` `aiReports.summary` · `REPORT_RETENTION_MS` · [`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) §5.2 | 일기에서 파생된 콘텐츠가 *"retained for no longer than necessary to service the specific request in real-time"* 을 명백히 넘는다 |
| ② | **AI 사업자가 남용 감시 목적으로 최대 30일 보관**한다 | `features/legal/legal-text.ts` AI 예고 — *"AI 사업자는 남용 감시 목적으로 최대 30일간 보관한 뒤 삭제하며"* | 우리가 전송한 데이터가 위탁사 손에서 30일 남는다. 위탁사 처리는 우리 처리다 |
| ③ | 서버가 `ai_usage`에 **subject·기간·토큰 수를 영구 저장**한다 | `server/db/schema.ts` `aiUsage` (삭제 코드 없음 — `delete(aiUsage)` 검색 결과 0건) | 본문은 아니지만 요청에서 파생된 기록이 남는다. FAQ가 말하는 *"any use of that user data beyond the ephemeral processing … that you log"* 에 해당 |

🔴 **결론: 일기 본문(제목·텍스트)은 `기타 사용자 제작 콘텐츠`로 수집 선언한다. 일시처리 = 아니요.**

⚠ ①과 ②를 섞지 않는다. 저장하는 것은 **모델이 쓴 요약문**이고 **일기 원문이 아니다**
(§5.2). 그 구분이 처리방침 문안의 전부이지만, **데이터 보안 폼에서는 결과가 같다** —
파생물이든 원문이든 `기타 사용자 제작 콘텐츠`가 real-time 요청 이후까지 남으면 일시처리가 아니다.

### 1.5 반대로 **E2EE 예외는 적용된다** (백업 경로)

같은 문서, *Not in scope for data collection*:

> **End-to-end encryption:** User data that is sent off device, but that is unreadable by you or
> anyone other than the sender and recipient as a result of end-to-end encryption does not need
> to be disclosed.
> The encrypted data must not be readable by any intermediary entity, including the developer,
> and only sender and recipient may have necessary keys.

조각의 백업이 이 문언을 만족한다:

| 요건 | 조각 | 근거 |
|---|---|---|
| 개발자가 못 읽는다 | 서버는 복호화 키를 **갖지 않는다** | `features/backup/seal.ts`(XChaCha20-Poly1305) · `key-derive.ts`(HKDF-SHA256, 복구 코드에서 유도) |
| 키는 sender/recipient만 | 기기 SecureStore + 사용자 복구 코드. 서버는 `sha256(auth_key)`만 | `server/db/schema.ts` `vaults.authHash` |
| 중간자도 못 읽는다 | Storage에 올라가는 것은 봉투(암호문)뿐 | `features/backup/api/client.ts` — 서명 URL PUT |

⚠ **그러나 메타데이터는 평문이다.** `vault_id`·세대 번호·파트 수·바이트 수·시각·`subject_id`가
서버 DB에 평문으로 있다(`generations`·`generationParts`·`vaultGrants`). 앱도 이걸 그대로
고지한다(`backup.noticeMetadata`: *"The backup time and size are stored on the server."*).
→ 그중 `subject_id`가 아래 **`User IDs`** 선언의 근거 하나가 된다.

---

## 2. 조각이 기기 밖으로 보내는 것 — 코드 실측

문서가 아니라 코드에서 확인한 것만 적는다.

| # | 경로 | 나가는 것 | 받는 곳 | 저장 | 코드 |
|---|---|---|---|---|---|
| 1 | 구글 로그인 | `idToken` → 서버가 **구글 sub · 이메일**을 저장 | common_server | 영구(탈퇴 시 이메일 즉시 파기, sub 가명화) | `features/support/auth-gate.ts:187` · `lib/common-server/index.ts:208` · `common_server/db/schema.ts:115,118` |
| 2 | 문의하기 | 문의 본문 · 카테고리 · `platform` · `appVersion` (+세션) | common_server | 3년(법정 보관) | `lib/common-server/index.ts:143` |
| 3 | 백업 — 내용 | **암호문 봉투만.** 일기 원문·사진·태그·AI 리포트가 전부 그 안에 | 조각 서버 Storage | 구독 중 + 유예 90일 | `features/backup/manifest.ts` · `seal.ts` · `api/client.ts` |
| 4 | 백업 — 메타 | `vault_id` · `subject_id` · 세대 · 파트 수 · 바이트 · 시각 | 조각 서버 DB | 위와 동일 | `server/db/schema.ts` |
| 5 | **AI 리포트 — 입력** | **일기 평문**: 날짜 · 감정 코드 · 제목 · 본문 (월간·연간은 하위 요약문) | 조각 서버 → OpenAI | 우리 서버 **무저장** / OpenAI **최대 30일** | `features/ai/api/client.ts` · `features/ai/types.ts` `EntryInput` |
| 6 | **AI 리포트 — 출력** | 모델이 쓴 **요약문** · `concern` · 언어 · 모델 · 프롬프트 판 | 조각 서버 DB | **90일** | `server/db/schema.ts` `aiReports` |
| 7 | AI 리포트 — 계량 | `subject_id` · 종류 · 기간 키 · 일자 · 토큰 수 · 모델 | 조각 서버 DB | **영구**(삭제 코드 없음) | `server/db/schema.ts` `aiUsage` |
| 8 | 구독 | 스토어 거래·상품 식별자, 계정 식별자, 기기·앱 정보 | RevenueCat → common_server 웹훅 | 영구 | `features/subscription/api/purchases.ts` · `common_server/db/schema.ts:204` `purchaseEvents` |
| 9 | 광고 | 광고 ID · 대략적 위치 · 기기/네트워크 · 상호작용 | Google AdMob | Google 정책 | `features/ads/api/ads.ts` |

**나가지 않는 것**(확인함):

- **사진은 AI로 가지 않는다.** `features/ai/types.ts`: *"평문 본문. 이미지는 넣지 않는다"* —
  `EntryInput`에 이미지 필드 자체가 없다. 사진이 기기를 떠나는 경로는 **암호화 백업뿐**이다.
- **푸시 토큰이 없다.** `features/notification/`에 `getExpoPushToken`·`getDevicePushToken`·FCM 호출이
  0건이다 — 로컬 알림 전용([`NOTIFICATION_SYSTEM.md`](./NOTIFICATION_SYSTEM.md)).
- **리포트 [신고]는 기기 안에서 끝난다.** `app/report/[id].tsx:69` — 서버로 아무것도 보내지 않는다
  (서버의 `ai_reports.flagged`는 운영 콘솔 전용이고 앱이 쓰지 않는다).
- `registerDevice`(익명 기기 등록)는 **조각이 부르지 않는다** — 호출부 검색 0건.
- 앱 전체 아웃바운드 `fetch`는 4곳뿐이다: AI 클라이언트 · 백업 클라이언트 · common_server SDK ·
  개발 전용 `device-check`.

---

## 3. 확정 선언표

콘솔 마법사 순서 그대로다. **변경(diff)은 2026-08-12 CSV 실측(CLAUDE.md §14) 기준.**

### 3.1 데이터 수집 및 보안 (1단계)

| 질문 | 답 | diff |
|---|---|---|
| 앱이 필수 사용자 데이터 유형을 수집하거나 공유하나요? | **예** | 유지 |
| 수집하는 모든 사용자 데이터가 **전송 중 암호화**되나요? | **예** | 유지 |
| 사용자가 **데이터 삭제를 요청**할 방법을 제공하나요? | 🔴 **예** | **변경** (현재 "아니요") — §4 |

### 3.2 데이터 유형 + 사용/처리 (2·3단계)

| # | 데이터 유형 (콘솔 경로) | 수집 | 공유 | 일시처리 | 필수/선택 | 목적 | diff | 근거 |
|---|---|---|---|---|---|---|---|---|
| 1 | 개인 정보 → **이메일 주소** | ✅ | ❌ | 아니요 | **선택** | 앱 기능 · 계정 관리 | 유지 | §2-1 |
| 2 | 개인 정보 → **사용자 ID** | ✅ | ❌ | 아니요 | **선택** | 앱 기능 · 계정 관리 | 🔴 **추가** | §2-1·2-4·2-7 |
| 3 | 금융 정보 → **구매 내역** | ✅ | ❌ | 아니요 | **선택** | 앱 기능 | 🔴 **추가** | §2-8 |
| 4 | 메시지 → **기타 인앱 메시지** | ✅ | ❌ | 아니요 | **선택** | 앱 기능 | 유지 | §2-2 |
| 5 | 앱 활동 → **기타 사용자 제작 콘텐츠** | ✅ | ❌ | **아니요** | **선택** | 앱 기능 · 분석 | 🔴 **추가** | §1.4 · §2-5·2-6 |
| 6 | 위치 → 대략적 위치 | ✅ | ✅ | 아니요 | 필수 | 광고 | 유지 (건드리지 않는다) | §2-9 |
| 7 | 앱 정보 및 성능 → 진단 | ✅ | ✅ | 아니요 | 필수 | 분석 | 유지 (건드리지 않는다) | §2-9 |
| 8 | 앱 활동 → 앱 상호작용 | ✅ | ✅ | 아니요 | 필수 | 분석 · 부정행위 방지 · 광고 | 유지 | §2-9 |
| 9 | 기기 또는 기타 ID | ✅ | ✅ | 아니요 | 필수 | 분석 · 부정행위 방지 · 광고 | 유지 | §2-8·2-9 |

**부가 선언**: `계정 생성 방법 = OAuth` ✅ 유지 · 독립 보안 검토 = 아니요 · Families 정책 = 해당 없음.

### 3.3 추가 3건 — 왜 필요한가

#### #2 `사용자 ID` (`PSL_USER_ACCOUNT`)

Play 정의: *"Identifiers that relate to an identifiable person. For example, an account ID,
account number, or account name."*

세 곳에서 저장한다. 하나만으로도 선언 사유가 된다.

| 저장처 | 값 |
|---|---|
| `common_server.subjects.provider_id` | **구글 sub** (`db/schema.ts:115`) |
| `조각서버.vault_grants.subject_id` · `generations` 계열 | 백업 소유자 |
| `조각서버.ai_usage.subject_id` · `ai_reports.subject_id` | AI 사용 기록 |

⚠ §14가 *"과소 선언"* 이라고 적어둔 그 항목이다. `DELETE_ACCOUNT` 안내가 구글 sub를 삭제
대상으로 명시하고 있어 **우리 문서가 이미 저장을 인정**한다.

#### #3 `구매 내역` — §14가 못 잡은 네 번째 구멍

🔴 **이 항목은 2026-08-12 실측 목록에도, §14의 "여전히 막고 있는 것"에도 없었다.**

`common_server/db/schema.ts:204` `purchaseEvents`가 `productId` · `storeTxnId` · `type`
(`INITIAL_PURCHASE` | `RENEWAL` | …) · `environment` · `subjectId`를 저장하고,
`entitlements`가 `expiresAt` · `graceUntil`을 저장한다. Play 정의(*"Information about purchases
or transactions a user has made"*)에 정확히 해당한다.

- **공유 아님**: RevenueCat은 위탁사다 — *"Service providers. Transferring user data to a
  'service provider' that processes it on behalf of the developer."* 처리방침도 위탁으로
  기재하고 있다(`legal-text.ts` — *"RevenueCat, Inc. … 이전 목적: 구독 결제 검증"*).
- **선택**: 구독하지 않으면 발생하지 않는다.

#### #5 `기타 사용자 제작 콘텐츠` — 일기 본문

Play 정의: *"Any other user-generated content not listed here… For example, user bios, **notes**,
or open-ended responses."* — 일기가 정확히 `notes`다.

- **일시처리 = 아니요**: §1.4의 3가지 근거.
- **공유 = 아니요**: OpenAI는 위탁사(§12 2026-08-19 — *"학습에 안 쓰므로 위탁으로 구성"*).
  **두 번째 예외도 동시에 성립한다** — *"User-initiated action or prominent disclosure and user
  consent"*: 리포트는 사용자가 [만들기]를 눌러야만 나가고, `app/ai-consent.tsx`가 §23·§28-8
  동의를 따로 받는다(`features/ai/consent-rules.ts`).
- **선택**: 구독 + 동의 2종 + 수동 버튼. 게이트가 [만들기] 하나에만 걸려 있어 거부해도 앱은 그대로 쓴다.
- **목적**: `앱 기능`(리포트 생성) + `분석`(요약문 90일 보관의 목적이 프롬프트 품질 개선 —
  Play의 분석 정의 *"to make future performance improvements"* 에 든다).

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

⚠ 그런데 **앱 자신은 「개인정보 보호법」 §23 민감정보 동의를 받는다** —
`features/ai/consent.ts`: *"일기에 건강·심리 상태가 담긴다."* PIPA와 Play의 정의가 다르다는
것이 답이지만, 판단이 갈릴 수 있는 자리라 적어둔다. 넣기로 하면
`건강 및 피트니스 → 건강 정보`를 #5와 같은 답(수집·비공유·비일시·선택·앱 기능)으로 추가한다.

---

## 4. `데이터 삭제 요청` 항목 — **예로 바꿔도 된다** (코드로 확인)

### 4.1 Play가 요구하는 것 (verbatim)

> **Is there a specific type of mechanism that I must provide…?**
> There is no prescribed mechanism, however as best practice the request mechanism should be
> easily discoverable and accessible by users. Common examples … may include but are not limited
> to: **in-app features**, contact forms, or a dedicated email alias.
>
> **How should I indicate … for data that is automatically deleted or anonymized?**
> You may select the deletion request mechanism badge in Data safety form if you:
> - provide users with a mechanism to request data deletion; **or**
> - automatically initiate deletion or anonymization of collected data within 90 days of collection.
>
> **You may select the deletion request mechanism badge even if you need to retain certain data
> for legitimate reasons such as legal compliance or abuse prevention.**

### 4.2 조각에 실제로 있는 경로 (코드 실측)

**앱 안 경로**: 설정 → 문의하기 → (로그인) → **탈퇴** — `features/support/auth-gate.ts` `deleteAccount()`.
**웹 경로**: `docs/delete-account.html`(15개 언어, 2026-08-17) — 데이터 보안 선언에 등록된 URL.

§5.1이 *"조각 서버에 백업이 쌓이면 그 백업을 지우는 경로가 따로 있어야 한다"* 고 적어둔 것,
**있다. 그리고 탈퇴에 묶여 있다:**

```
deleteAccount()
  ├─ ① purgeBackup()                      features/backup/api/run-backup.ts:165
  │     └─ POST /api/v1/backup/delete  →  purgeVault()   server/lib/vault.ts
  │           · Storage 객체 삭제(파트 + 사진 blob) — 행보다 먼저
  │           · generation_parts · generations · vault_blobs · vault_grants 행 삭제
  │           · vaults 는 툼스톤(purged_at)으로만 남고 subject_id 를 남기지 않는다
  │     🔴 실패하면 여기서 멈춘다 — 계정만 지우고 백업이 남으면 그 진술이 거짓이 되므로
  └─ ② DELETE /api/v1/auth/me         →  softDeleteSubject()  common_server/lib/auth/subject.ts:91
        · email = null (즉시 파기)
        · provider_id = 'deleted:<uuid>' (구글 sub 가명화)
```

순서까지 옳다 — 코드 주석: *"계정이 사라지고 백업이 남으면 지울 권한이 있는 사람이 없어진다."*
그리고 `delete` 라우트는 **구독을 요구하지 않고**, grant **또는** `auth_key` 둘 중 하나만
있으면 지운다(복구 코드를 잃어도, 재가입으로 `subject_id`가 바뀌었어도 지울 수 있다).

### 4.3 ⚠ 탈퇴가 지우지 **않는** 것 — 그래도 배지는 정당하다

| 남는 것 | 얼마나 | Play 판정 | 우리 판정 |
|---|---|---|---|
| `tickets` 문의 본문 | 3년 | ✅ *"legitimate reasons such as legal compliance"* — 소비자 분쟁 기록 | 의도된 설계 |
| `ai_reports.summary` (+`subject_id`) | **90일**, 리퍼가 지운다 | ✅ 두 번째 조건 *"automatically initiate deletion … within 90 days"* 를 **정확히** 충족 | ⏭ §4.4 |
| `ai_usage` (`subject_id`·기간 키·토큰 수) | **영구** — 지우는 코드가 없다 | ✅ 배지 조건은 **하나만** 충족하면 된다(`or`)이고 메커니즘 조건을 이미 충족 | ⏭ §4.4 |
| `purchase_events`·`entitlements` | 영구 | ✅ 거래 기록 | ⏭ §4.4 |

🔴 **판정: `데이터 삭제 요청 = 예`로 바꾸는 데 선행 작업이 없다.** §5.1이 걱정한 백업 삭제
경로는 이미 있고 탈퇴에 **차단형으로** 묶여 있다.

### 4.4 ⏭ 그래도 따로 볼 것 (Play 블로커는 아니다)

`ai_usage`가 탈퇴 후에도 `subject_id`를 영구 보유한다. **본문은 없고**(설계상 텍스트 컬럼 금지),
`uq_ai_usage_period`가 *"이 기간은 평생 한 번"* 캡의 유일한 근거라 지우면 캡이 리셋된다 —
의도된 설계다. 다만 「개인정보 보호법」 §21의 *"지체 없는 파기"* 관점에서는 별개 검토가 필요하다.
가명화(`subject_id` → 단방향 해시)로 캡을 유지하면서 식별성을 없애는 길이 있어 보이나
**확인하지 않았다** — 이 문서의 범위 밖이고 코드 변경이 필요하다.

---

## 5. 제출 순서

Play는 *"배포되는 버전과 선언이 일치해야 한다"* 를 요구한다. 지금은 **선언이 빌드보다 좁다.**

```
① [지금]  데이터 보안 폼 수정 → 제출          ← 새 AAB를 기다리지 않는다 (§0)
             §3.1 삭제 = 예 · §3.2 3건 추가
② [병행]  처리방침 본문 승격                   ← 🔴 §5.1 참조. 아래
③ [대기]  Google 검토 (보통 며칠, 최대 7일+)
④ [그 후] 프로덕션 출시
```

### 🔴 ② 처리방침이 폼보다 더 급하다 — 지금 **거짓**이다

`features/legal/legal-text.ts`를 읽었다. 백업·AI는 아직 **`pending`(개정 예고)** 이고 본문이 아니다.
그런데 본문 §1은 여전히 이렇게 말한다:

> **1. 수집하지 않는 정보 (먼저 밝힙니다)**
> 운영자는 다음 정보를 수집하지 않으며, 이용자의 기기 밖으로 전송하지 않습니다.
> • 일기의 제목·본문·목록·사진·태그·감정 — 이용자 기기 내부 저장소에만 보관됩니다.

**versionCode 8/9에는 백업과 AI가 들어 있다.** 코드 주석도 이미 알고 있다:
*"백업이 실제로 열리는 릴리스에서는 이 내용을 본문으로 옮기고 §1의 '기기 밖으로 전송하지
않습니다'를 함께 고쳐야 한다. 안 고치면 §1과 정면 충돌한다."*

데이터 보안 폼은 **처리방침 링크가 있어야 제출된다.** 폼에서 *"일기 본문 수집"* 을 선언하는데
링크된 처리방침이 *"수집하지 않습니다"* 라고 하면 **불일치가 그 자리에서 드러난다.**

⚠ 30일 시계는 **없다** — §12(2026-08-13)가 *"첫 출시에 들어가면 변경이 아니라 최초 처리방침"*
으로 무효화했다. 승격은 오늘 해도 된다.

작업: `legal-text.ts` `pending` → 본문 승격 + §1 수정 → 14개 언어 번역 →
`npm run legal:stamp` → `npm run check:legal` → `npm run legal:html` → push(게시 URL 유지).

### ⚠ 순서를 뒤집지 않는다

선언을 **넓히는** 것은 언제든 좋다. 반대로 **좁히는** 변경(예: 어떤 유형을 빼는 것)은 그 유형을
더는 수집하지 않는 빌드가 배포된 **뒤에** 한다 — §5.1의 규율이 보호하려는 방향이 그쪽이다.

---

## 6. 남은 미확인

숨기지 않고 적는다.

| # | 확인 못 한 것 | 왜 |
|---|---|---|
| 1 | **콘솔 폼의 한국어 라벨이 이 문서의 표기와 정확히 같은지** | 콘솔에 들어가지 않았다. 위 표기는 공식 영문 데이터 유형명(`User IDs` · `Purchase history` · `Other user-generated content`)과 2026-08-12 CSV의 한국어 표기를 맞춘 것이다. 클릭 시 영문명으로 대조할 것 |
| 2 | **AdMob이 실제로 수집하는 유형의 최신 목록** | Google은 *"refer to their SDK providers' published data safety information"* 이라고만 한다. 현재 4개(위치·진단·상호작용·기기 ID) 선언은 §14가 *"건드리지 않는다"* 고 결정한 대로 **그대로 뒀다** — 확인하지 않았고, 과다 쪽이라 위험하지 않다 |
| 3 | **RevenueCat SDK가 자체로 보내는 항목** | 공식 데이터 보안 안내를 조회하지 않았다. `구매 내역`·`기기 또는 기타 ID`는 이미 커버되지만, RC가 그 밖의 것을 보내는지는 미확인 |
| 4 | **`ai_usage` 가명화가 캡을 유지하면서 가능한지** | §4.4. 코드 변경이 필요해 이 문서 범위 밖 |
| 5 | **일시처리 문언의 자체 모순에 대한 Google의 유권 해석** | 본문과 FAQ가 정반대다(§1.3). 1차 자료를 더 찾지 못했다 — 보수적 독법을 쓴다. 어차피 조각은 예외에 해당하지 않아 **결론이 바뀌지 않는다** |
| 6 | **`데이터 삭제` 배지와 별개인 Play "계정 삭제" 요건** | `answer/13327111`(계정 삭제 요구사항)을 이번에 읽지 않았다. 조각은 앱 내 탈퇴 + 웹 URL을 이미 갖고 있어 충족할 가능성이 높지만 **확인하지 않았다** |

---

## 7. 콘솔에서 누를 것 (요약)

```
Play Console → 앱 콘텐츠 → 데이터 보안 → 관리

1단계 데이터 수집 및 보안
   □ 수집/공유함                                             → 예        (유지)
   □ 전송 중 암호화                                          → 예        (유지)
   □ 사용자가 데이터 삭제를 요청할 수 있음                    → 예        🔴 변경

2단계 데이터 유형 — 체크를 3개 추가
   ☑ 개인 정보 → 사용자 ID                                              🔴 추가
   ☑ 금융 정보 → 구매 내역                                              🔴 추가
   ☑ 앱 활동  → 기타 사용자 제작 콘텐츠                                 🔴 추가
   (기존 6개는 그대로 둔다)

3단계 데이터 사용 및 처리 — 새 3개에 대해
   수집/공유?        수집만
   일시처리?         아니요            ← 셋 다. 근거 §1.4
   필수/선택?        사용자가 선택할 수 있음
   목적?             사용자 ID          앱 기능 · 계정 관리
                     구매 내역          앱 기능
                     기타 UGC           앱 기능 · 분석

4단계 미리보기 → 제출
```

⚠ 제출 전에 **처리방침 §1을 먼저 고친다**(§5). 폼이 *"일기 본문 수집"* 이라고 하는데
링크된 처리방침이 *"수집하지 않습니다"* 라고 하면 그 자리에서 어긋난다.
