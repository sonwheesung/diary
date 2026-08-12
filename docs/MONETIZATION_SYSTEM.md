# 구독 시스템

> 정책(가격·상품 구성·원가)은 [`../CLAUDE.md`](../CLAUDE.md) §7.2.
> 광고 정책은 §7. 백업은 [`BACKUP_SYSTEM.md`](./BACKUP_SYSTEM.md).

---

## 1. 상품은 **하나**다

```
조각 Pro   월 ₩3,900 / 연 ₩29,000 / 7일 무료 체험
  ├─ 광고 제거      ✅ 구현
  ├─ 백업/복원      ✅ 구현 (텍스트 1차)
  └─ AI 요약 리포트  ❌
```

**엔타이틀먼트 키는 `pro` 하나다.** `remove_ads`로 쪼개지 않는다 — 제일 싼 상품이 제일 비싼
상품을 잡아먹는다(§7.2).

### 업그레이드·다운그레이드가 **없다**

월↔연 전환도 **하지 않는다**(2026-08-11 사용자 결정). 그래서 구현이 크게 단순해진다:

| 안 하는 것 | 왜 없어도 되나 |
|---|---|
| `purchasePackage(pkg, upgradeInfo, productChangeInfo)`의 2·3번째 인자 | 갈아탈 상품이 없다. **`purchasePackage(pkg)` 한 인자만 쓴다** |
| proration 모드 선택 | 전환이 없으니 비례 정산도 없다 |
| "현재 플랜" 표시·비교 UI | 살 수 있는 것이 하나뿐이다 |

⚠ 월/연은 **같은 엔타이틀먼트의 두 가격**일 뿐이다. 둘 다 `pro`를 준다.
사용자가 월에서 연으로 옮기고 싶으면 **Play 구독 관리에서 직접** 한다 — 앱은 그 링크만 준다.

---

## 2. 로그인이 **먼저**다

**로그인하지 않으면 결제 화면을 열지 않는다.**

```
로그인 → Purchases.logIn(subject_id) → 결제 화면 → purchasePackage
```

### ⚠ 이 순서를 어기면 되돌릴 수 없다

`Purchases.logIn()`을 부르기 전에 결제하면 RevenueCat이 **익명 appUserID**를 만들고,
그 구독은 **subject와 영영 매칭되지 않는다**(`CLAUDE.md` §7.2 함정 #1 —
"웹훅 이력에 `anonymous-app-user-id`"). 돈은 나갔는데 `pro`가 안 붙는다.

그래서 게이트를 **두 겹**으로 둔다:
1. 로그인하지 않았으면 구독 화면 자체를 열지 않는다(로그인 화면으로 보낸다)
2. `purchasePackage` 직전에 **RC의 현재 appUserID가 익명이 아닌지** 다시 확인한다

### 계정이 바뀌면 `restorePurchases()`

⚠ **탈퇴 후 재가입하면 `subject_id`가 바뀐다**(`softDeleteSubject()`가 `provider_id`를
가명화한다 — `CLAUDE.md` §7.2). 그러면 RC의 새 appUserID에는 아무것도 없어서
**돈은 나가는데 `pro`가 아니다.**

→ 로그인 후 서버가 `pro=false`인데 스토어에 구독이 있을 수 있으면 `restorePurchases()`를 부른다.
  서버 쪽 `TRANSFER` 웹훅 처리는 common_server Phase 9에 이미 있다.

### 1 구독 = 동시에 **1 계정**

RC의 이동은 *공유*가 아니라 *이동*이다. 같은 기기에서 다른 구글 계정으로 로그인하면
**구독이 그쪽으로 옮겨가고 원래 계정은 잃는다.** 조각은 혼자 쓰는 일기 앱이라 그대로 간다 —
다만 **구독 화면에 이 사실을 적는다.** 가족·기기 공유를 기대하고 결제한 사람에게 조용히
뺏기는 것이 가장 나쁘다.

---

## 3. SDK 사용 (실측 확인, 2026-08-11)

`react-native-purchases@10.7.0`. 타입 원문(`dist/purchases.d.ts`)에서 확인한 시그니처:

```ts
static configure(configuration: PurchasesConfiguration): void
static logIn(appUserID: string): Promise<LogInResult>
static logOut(): Promise<CustomerInfo>
static getOfferings(): Promise<PurchasesOfferings>
static purchasePackage(aPackage, upgradeInfo?, productChangeInfo?, googleIsPersonalizedPrice?): Promise<MakePurchaseResult>
static restorePurchases(): Promise<CustomerInfo>
static getCustomerInfo(): Promise<CustomerInfo>
```

공식 예제(MagicWeather)가 쓰는 패턴:

```ts
const offerings = await Purchases.getOfferings();
if (offerings.current !== null && offerings.current.availablePackages.length !== 0) { … }

const { customerInfo } = await Purchases.purchasePackage(pkg);
if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined') { … }

// 취소는 오류가 아니다
if (e.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) { … }
```

⚠ **네이티브 모듈이라 Expo Go에서 못 돈다.** Expo Go에서는 "Preview API Mode"로 JS 목이
대신 응답하므로 **실제 결제는 dev build에서만** 확인된다. 조각은 이미 dev build다(§7).

---

## 4. 엔타이틀먼트의 진실은 **우리 서버**다

RC가 주는 `customerInfo`를 **최종 판정에 쓰지 않는다.**

```
결제 → RC → common_server 웹훅 → entitlements 테이블 → /api/v1/entitlements → 앱 캐시
                                                              ↑ 여기가 진실
```

- 앱은 결제 직후 `customerInfo`로 **화면만 즉시 갱신**하고(사용자를 기다리게 하지 않는다),
  곧바로 `useEntitlementStore.refresh()`로 서버 값을 받아 덮는다.
- 웹훅이 늦으면 잠깐 어긋날 수 있다 — 그래서 결제 직후 **몇 초 간격으로 재조회**한다.

⚠ RC의 판정만 믿으면 서버가 모르는 `pro`가 생기고, 백업 서버는 그걸 인정하지 않는다
(백업 쓰기는 `/entitlements`를 introspect한다). 둘이 갈리면 "구독했는데 백업이 안 된다"가 된다.

---

## 5. ⚠ 전자상거래법 — 착수 전에 매듭 (2026-08-11 원문 확인)

**한국에서는 Google이 아니라 우리가 판매자(merchant of record)다.** Google의 MOR 국가
목록에 한국이 없고, DDA §3.4·§11.3이 *"You are the merchant of record … as the principal
to the transaction"*이라 못박는다. 그래서 아래가 전부 우리 책임이다.

| | 상태 |
|---|---|
| 🔴 **§13⑥ 무료체험 → 유료 전환 별도 동의**(2024-02-13 신설) | **미구현.** 전환 전 정해진 기간 내에 **전환 일시·변동 전후 가격·결제방법에 대한 동의**를 받고, 해지 조건·방법·효과를 고지해야 한다. 7일 체험이 정확히 이 조항이다 |
| 🔴 **§17⑥ 단서 — 청약철회 제한** | 디지털콘텐츠는 *"표시 **와 함께** 시험 사용 상품 제공"* 을 **둘 다** 해야 한다. 안 하면 §17②5에 해당해도 **청약철회가 그대로 인정**된다. ✅ **7일 무료 체험이 시행령 §21조의2 2호를 충족한다** — 체험은 마케팅이 아니라 **법적 자산**이다 |
| 🔴 **통신판매업 신고** | 면제는 직전년도 거래 50회 미만 또는 간이과세자. **구독 5명 × 12개월 = 60회**로 첫해에 넘긴다. 미신고 3천만원 이하 벌금 |
| 🟡 **§13① 표시 6종** | 상호·대표자·주소·전화번호·전자우편·**신고번호+신고기관명**. 사업자등록번호는 §10과 Play 요구사항 |
| 🟡 VAT 10% · 환불 1차 책임 | 둘 다 우리가 진다(국외 개발자만 Google이 대납) |
| 🟡 **탈퇴해도 구글 구독은 계속 청구** | 탈퇴 다이얼로그에 경고 + Play 구독 관리 링크. 15개 언어 |

~~⚠ **가격은 Play에 상품을 등록하기 전까지만 자유롭다.** 등록 직전에 한 번 더 확정한다.~~
→ **확정 완료(2026-08-11, 사용자 재확인)**: 월 **₩3,900** / 연 **₩29,000** / 무료 체험 **7일**.
  이 값으로 Play에 등록한다. 이후 인상은 기존 구독자 동의가 필요하므로 **되돌리기 어려운 지점**이다.

⚠ 체험 7일은 마케팅이 아니라 **법적 자산**이다 — 전자상거래법 §17⑥ 단서의 *"시험 사용 상품 제공"*
  요건을 충족해 청약철회 제한의 근거가 된다(§5). **없애면 그 근거를 잃는다.**

### §13⑥ 전환 동의 — 어떻게 받는가 (2026-08-11 결정)

조문이 요구하는 것은 **고지가 아니라 동의**다. 화면 아래 작은 글씨로 적어두는 것으로는
성립하지 않는다. 그래서 **체험이 붙은 상품을 누르면 전용 확인 단계**를 세운다.

| 조문이 요구하는 것 | 우리가 보여주는 것 |
|---|---|
| 전환 **일시** | *"2026년 8월 18일부터"* — 오늘 + 체험 기간(상품의 `introPrice`에서 읽는다) |
| 변동 **전/후 가격** | *"지금 ₩0 → 그 뒤 ₩3,900/월"* — 둘을 **나란히** 적는다 |
| **결제방법** | *"구글 플레이 결제수단으로 자동 결제"* |
| 해지 **조건·방법·효과** | *"종료 24시간 전까지 Play 구독 관리에서 해지. 해지해도 체험 기간 끝까지 쓸 수 있어요"* |

지킬 것:

- **명시적 동작이어야 한다.** 체크박스를 켜야 결제 버튼이 살아난다. **뒤로가기는 동의가 아니다**
  (자동 소멸 배너·기본 체크 금지 — PD&C와 같은 원칙).
- **체험이 없는 상품에는 띄우지 않는다.** §13⑥은 무료→유료 전환 조항이다. 없는 절차를
  만들면 구매 마찰만 는다. `introPrice`가 `null`이면 곧장 결제로 간다.
- **날짜는 문장 틀을 통째로 번역한다**(§9.1). 조각을 갈아끼우면 언어마다 순서가 다르다.
- ⚠ **전환 시각의 진실은 Play다.** 우리는 스토어가 알려준 체험 길이로 계산해 보여줄 뿐이고,
  실제 청구는 Play가 한다. 그래서 문구를 *"체험은 7일이에요"* 로 쓰고 분 단위를 약속하지 않는다.

⚠ 이 동의는 **§17⑥ 청약철회 제한의 짝**이기도 하다. 체험 제공(시행령 §21조의2 2호)과
  표시를 **둘 다** 해야 제한이 선다 — 체험을 없애면 청약철회 제한 근거를 잃는다.

### 팔지 않는 것을 혜택으로 적지 않는다 (2026-08-11)

AI 요약 리포트는 **아직 없다.** 구독 화면 혜택 목록에 그대로 두면 없는 것을 파는 것이고,
Play 정책으로도 위험하다. → **`benefitAi`를 "곧 제공"으로 명시**하고 목록에서 아래로 내린다.
AI가 붙는 릴리스에서 그 표시를 뗀다.

---

## 6. 착수 순서

```
1. 앱 코드          SDK 연결 · logIn 게이트 · 구독 화면 · 복원        ✅
2. AAB 업로드       빌링 권한이 든 빌드를 내부 테스트에              ✅ v7(2026-08-12)
3. Play 콘솔        구독 상품 등록(월·연) · 체험                     ✅ 아래 §6.2
4. RevenueCat       상품 import · 엔타이틀먼트 `pro` attach · 오퍼링  ❌ 남음
5. 법무             §13⑥ 동의 플로우 · §17⑥ 표시 · 통신판매업 신고
6. 실결제 확인      첫 결제에서 `pro`가 실려 오는지 **눈으로**
```

### 6.1 AAB 업로드는 `eas submit`으로 한다 (2026-08-12 결정)

브라우저 드래그가 아니라 **EAS 서버가 Play API로 직접 민다.** 파일이 로컬에 없어도 되고
기계가 바뀌어도 상관없다 — 실제로 회사/집 크롬이 갈리는 상황에서 이 경로만 살아남았다.

```
eas submit --platform android --profile internal --id <build-id>
```

⚠ **서비스 계정에 출시 권한이 없으면 실패한다.** 그런데 그 키는 **RevenueCat도 갖고 있다**
(배구명가에서 재사용한 `revenuecat-play@optimal-shard-426006-n3`). 상시로 켜두면
RC 침해 시 테스트 트랙 게시까지 열린다. → **켜고 → 올리고 → 끈다.**

| | |
|---|---|
| 켤 것 | 사용자 및 권한 → 계정 권한 → 출시 → **`앱을 테스트 트랙으로 출시`** |
| 켜지 않을 것 | `프로덕션으로 출시` · `테스트 트랙 관리 및 테스터 목록 수정` |
| 끝나면 | **즉시 해제하고 새로고침해서 실제로 꺼졌는지 확인한다** |

🔴 **해제가 조용히 실패한 적이 있다.** 저장 확인 다이얼로그까지 눌렀는데 다시 열어보니
켜져 있었다. 화면 전환만 보고 "껐다"고 판단하지 않는다 — **리로드 후 눈으로 확인**한다.

⚠ 키 파일은 저장소 **밖**(`C:\project\secrets\play-service-account.json`)에 두고
`eas.json`은 경로만 갖는다. 저장소에 비밀이 들어가지 않는다.

### 6.2 등록한 상품 (2026-08-12)

```
조각 Pro  (jogak_pro)                     세금: 디지털 앱 판매 · 규정 준수: 서비스
├─ jogak-pro-monthly   매월 · ₩3,900   유예 7일 · 활성 · 174개국
│  └─ freetrial-7d     7일 무료        활성
└─ jogak-pro-yearly    매년 · ₩29,000  유예 14일 · 활성 · 174개국
   └─ freetrial-7d     7일 무료        활성
```

- **혜택은 2개만 적었다** — `광고 없이 조용하게` · `암호화 클라우드 백업·복원`.
  AI 리포트는 미구현이라 넣지 않았다(§5 "팔지 않는 것을 혜택으로 적지 않는다").
- **체험 자격은 `구독한 적 없음`(앱 전체)** 으로 잡았다. Play 기본값은 `이 구독을 이용한 적 없음`인데,
  나중에 상품을 늘려도 체험을 두 번 받지 못하게 하는 쪽이 낫다. 상품이 하나인 지금은 둘이 같다.
- 🔴 **대한민국 세금이 `VAT 없음`으로 표시된다.** 콘솔이 직접 확인해준 셈이다 —
  국내 개발자에게는 Google이 VAT를 대납하지 않는다(§5). **부가세는 우리가 낸다.**
- ⚠ **상품 ID는 재사용 불가다.** 지우고 같은 이름으로 다시 만들 수 없다.

### ⚠ 출시 체크리스트에 넣을 것 (§7.2 함정 3개)

- [ ] 웹훅 이력에 `anonymous-app-user-id`가 없는가 → `logIn()`을 안 불렀다는 뜻
- [ ] `entitlement_ids`가 빈 배열이 아닌가 → RC에서 **상품 attach를 빠뜨렸다**
- [ ] **`RC_SANDBOX_GRANT`를 껐는가** → 켜둔 채 출시하면 테스트 결제가 실권한이 된다

---

## 7. 구현 현황

| 항목 | 상태 |
|---|---|
| `react-native-purchases` 설치 | ✅ 10.7.0 — ⚠ **번들 +1.21MB**(3.67 → 4.88MB). 단일 진입점 패키지라 서브패스로 줄일 수 없다 |
| SDK 연결 · `logIn` 게이트 | ✅ `features/subscription/api/purchases.ts` |
| 구독 화면 | ✅ `app/subscribe.tsx` — 로그인 게이트 2겹 |
| `restorePurchases` | ✅ |
| 엔타이틀먼트 조회·캐시 | ✅ `features/entitlement/store.ts` |
| 광고 제거 연결 | ✅ `adsEnabled()` |
| RevenueCat 프로젝트 | ✅ **조각** (`006d92c9`) · Lifestyle · React Native |
| 엔타이틀먼트 | ✅ **`pro`** — 프리셋("조각 Pro")을 쓰지 않고 직접 입력했다. 코드가 이 문자열을 그대로 본다 |
| 오퍼링 | ✅ Monthly · Yearly. **Lifetime은 뺐다**(단일 구독 2종) |
| Play 앱 설정 | ✅ `com.son0925.jogak` · 서비스 계정 **Valid credentials** |
| SDK 공개 키 | ✅ `goog_…` → `eas.json`(internal·production) + 개발 `.env.local` |
| **Play 상품 등록** | ✅ **완료(2026-08-12)** — `jogak_pro` + 요금제 2개 + 체험 2개, 전부 활성(§6.2) |
| AAB 내부 테스트 업로드 | ✅ v7(versionCode 7) — `eas submit`, 권한은 켰다 끄는 방식(§6.1) |
| RC 상품 import·attach | ❌ **남은 마지막 배선.** Play 상품은 준비됐다 |
| §13⑥ 전환 동의 플로우 | ✅ 체험이 붙은 상품에만. 체크박스 없이는 결제 버튼이 죽어 있다 |
| 체험 기간 계산(순수) | ✅ `features/subscription/trial.ts` · `npm run check:subscription` 8개 — **법적 고지의 근거라 Node에서 검사한다** |
| 탈퇴 다이얼로그 — 구독 경고 + Play 링크 | ✅ 15개 언어 |
| 로그인 후 자동 `restorePurchases` | ✅ `pro=false`일 때 **1회**. 계정이 바뀐 사람이 돈만 내는 것을 막는다 |
| AI 혜택 표기 | ✅ "곧 제공" — 없는 것을 팔지 않는다 |
