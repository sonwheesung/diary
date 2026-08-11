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

⚠ **가격은 Play에 상품을 등록하기 전까지만 자유롭다.** 등록 후 인상은 기존 구독자 동의가
필요하다 — 등록 직전에 한 번 더 확정한다.

---

## 6. 착수 순서

```
1. 앱 코드          SDK 연결 · logIn 게이트 · 구독 화면 · 복원        ← 지금 할 수 있다
2. RevenueCat       프로젝트 · 엔타이틀먼트 `pro` · **상품 attach**    ← 사용자
3. Play 콘솔        구독 상품 등록(월·연) · 라이선스 테스터            ← 사용자
4. 법무             §13⑥ 동의 플로우 · §17⑥ 표시 · 통신판매업 신고
5. 실결제 확인      첫 결제에서 `pro`가 실려 오는지 **눈으로**
```

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
| RevenueCat 계정·상품 | ❌ 사용자 |
| §13⑥ 전환 동의 플로우 | ❌ |
