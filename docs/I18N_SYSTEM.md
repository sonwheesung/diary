# 조각 — 다국어(i18n) 규약

> 정책 요약은 [`../CLAUDE.md`](../CLAUDE.md) §9.1. 이 문서는 **구현 규약과 언어 추가 절차**가 정본이다.
> 2026-08-09 도입 — 전 세계 출시를 목표로 함(사용자 결정).

---

## 1. 한 줄 규칙

**화면에 보일 문자열을 코드에 직접 쓰지 않는다.** 전부 `locales/<code>.json`에 두고 `t()`로 꺼낸다.

언어를 하나 더 얹는 일이 **"JSON 파일 하나 추가"** 로 끝나야 한다. 그렇지 않으면 두 번째 언어에서
이미 늦는다 — 문자열이 25개 파일에 흩어진 뒤에 걷어내는 비용을 이번에 이미 한 번 치렀다.

---

## 2. 구성

| 파일 | 역할 |
|---|---|
| `locales/*.json` (15개) | 문자열 카탈로그. **키 구조가 서로 같아야 한다** |
| `lib/i18n.ts` | i18next 초기화 · 기기 언어 판별 · `translate()` |
| `features/settings/language-store.ts` | 사용자 선택(zustand) · `app_settings.language`에 저장 |
| `features/settings/components/LanguageSheet.tsx` | 언어 선택 시트(목록) |
| `scripts/check-i18n.mjs` | 키 누락·언어 간 불일치 검사 (`npm run check:i18n`) |

- 기본 언어는 **기기 언어**다. 우리가 가진 언어가 없으면 **영어**로 떨어진다(`fallbackLng: 'en'`).
  한국어를 폴백으로 두지 않는다 — 전 세계 사용자 대부분이 못 읽는 화면이 된다.
- 사용자가 설정에서 고르면 그 선택이 이긴다. `system`을 고르면 다시 기기를 따른다.

---

## 3. 쓰는 법

### 컴포넌트 안

```tsx
const { t } = useTranslation();
<Text>{t('home.recent')}</Text>
<Text>{t('home.streak', { days: streak })}</Text>   {/* 변수명에 count 금지 — §7 */}
```

훅을 쓰는 이유는 문자열을 꺼내기 위해서만이 아니다 — **언어가 바뀐 순간 다시 그리기 위해서**다.
번역 문자열을 쓰지 않더라도 내부에서 `translate()`를 부르는 값(날짜·감정 라벨)을 계산하는
컴포넌트라면 `useTranslation()`을 구독해야 한다.

### 컴포넌트 밖(저장소·유틸)

```ts
import { translate } from '@/lib/i18n';
throw new Error(translate('errors.alreadyWritten'));
```

---

## 4. 반드시 지킬 것

### 4.1 DB·SecureStore에는 **코드/id만** 저장한다

문구를 저장하면 언어를 바꾼 순간 **옛 데이터만 옛 언어로** 남는다.

| 저장하는 것 | 보여줄 때 |
|---|---|
| 감정 `joy` (`diaries.emotion`) | `emotionLabel('joy')` → `emotion.joy` |
| 힌트 질문 `highschool` (SecureStore) | `hintQuestionText('highschool')` → `lock.questions.highschool` |

- 감정 코드는 **Expand-only** — 추가만 하고 의미를 바꾸거나 지우지 않는다(`features/diary/emotions.ts`).
- `hintQuestionText()`는 **모르는 값이면 그대로 돌려준다.** i18n 이전 버전이 질문 문구를 그대로
  저장했기 때문이다. 알아보지 못한다고 빈칸을 보여주면 그 사용자는 힌트를 영영 쓸 수 없다.

### 4.2 날짜는 조각을 갈아끼우지 말고 **문장 틀을 통째로** 번역한다

`"2026년 8월 8일"`과 `"August 8, 2026"`은 순서가 다르다. 그래서 `lib/format.ts`는 조각
(`year`·`month`·`monthName`·`day`·`weekday`)만 넘기고 **틀은 `date.*` 키가 갖는다.**

```json
"full": "{{year}}년 {{month}}월 {{day}}일 ({{weekday}})"   // ko
"full": "{{weekday}}, {{monthName}} {{day}}, {{year}}"     // en
```

숫자만 쓰는 언어는 `{{month}}`를, 달 이름을 쓰는 언어는 `{{monthName}}`를 쓰면 된다.

🔴 **그래서 `date.*`만은 자리표시자가 언어마다 달라도 된다.** `apply-translations.mjs`는
원문과 자리표시자가 다르면 거부하는데(§번역 현황), 그 규칙이 옳은 이유는 일반 문구에서
`{{count}}`가 빠지면 숫자가 사라지기 때문이다. 날짜 틀은 반대로 **다른 것이 정답**이다 —
`date.*`는 적용기를 태우지 말고 직접 넣는다.

⚠ **`monthName`을 빈 문자열로 넘기지 않는다.** en·de의 틀이 `{{monthName}} {{year}}`라
`" 2026"`이 된다. 숫자를 쓰는 언어와 이름을 쓰는 언어가 섞여 있으므로 **항상 둘 다 넘긴다**
(2026-08-12에 `formatPeriodMonth`에서 실제로 겪음).

**주 범위(`date.range`)는 달 경계에서 틀이 갈린다.** `8월 10일 – 16일`과
`7월 27일 – 8월 2일`은 문장 구조가 달라서 `date.rangeCrossMonth`로 키를 나눴다 —
한 키에 조건을 넣으면 언어마다 그 조건이 다르다.

### 4.3 언어 이름은 **그 언어로** 적는다

`LANGUAGE_LABELS`의 `한국어`·`English`는 번역하지 않는다. 영어 화면에서 'Korean'으로 보이면
한국어 사용자가 목록에서 자기 언어를 못 찾는다.

### 4.4 문자열 길이를 전제한 레이아웃을 만들지 않는다

영어·독일어는 한국어보다 길다. 고정 폭 버튼과 한 줄 강제(`numberOfLines={1}`)는 잘린 라벨을 만든다.
새 UI를 만들 때 **영어로 한 번 보고** 넘어간다.

---

## 5. 언어 추가 절차

1. `locales/<code>.json` 추가 — `en.json`을 복사해 값만 번역한다. **키를 빼지 않는다.**
2. `lib/i18n.ts`에서 세 곳: `LANGUAGES`(import + 등록) · `LANGUAGE_LABELS`(그 언어로 된 이름) ·
   `LANGUAGE_ORDER`(목록에 보일 자리).
3. 스크립트·지역이 붙는 코드(`zh-Hant`, `pt-BR`)라면 `BASE_LANGUAGE_FALLBACK`도 본다 —
   기기가 스크립트 없이 `zh`로 보내올 때 어디로 갈지 정해두지 않으면 영어로 떨어진다.
4. `npm run check:i18n` — 키 누락·불일치가 없어야 한다.
5. **독일어 다음으로 긴 언어라면 좁은 화면(720px)에서 한 번 본다.** 탭 라벨은 줄어들지만
   버튼·세그먼트는 그렇지 않다.

**설정 화면은 손대지 않는다.** 선택지는 `LANGUAGE_ORDER`에서 자동으로 나온다.
`isLanguageMode()`도 `LANGUAGES`에서 파생된다 — 어느 하나가 하드코딩으로 남으면
저장된 선택이 조용히 무시된다.

### 지역·스크립트 매칭

기기 로케일은 좁은 것부터 넓은 순으로 본다 — `zh-Hant-TW` → `zh-Hant` → `zh`.
`languageCode`만 보면 대만·홍콩 사용자가 간체를 받는다. 읽히긴 해도 명백히 틀린 화면이다.

i18next 쪽도 함께 잠가야 한다: `load: 'currentOnly'` + `nonExplicitSupportedLngs: false`.
끄지 않으면 `zh-Hans` 리소스를 두고도 없는 `zh`를 찾다가 영어로 폴백한다.

---

## 6. 검사

```
npm run check:i18n
```

- 코드가 부르는 `t('...')` 키가 **모든** 로케일에 있는지
- 언어끼리 키가 어긋나지 않는지

리터럴 키만 본다 — 템플릿 문자열로 만드는 동적 키는 못 잡는다. 동적 키를 쓰는 곳은
`emotion.*` · `lock.questions.*` · `settings.delay*` · `settings.themeOption*` 네 갈래뿐이고,
각 목록이 코드의 상수 배열과 1:1이라 배열을 늘릴 때 JSON도 같이 늘리면 된다.

---

## 7. 아직 안 한 것

| 항목 | 비고 |
|---|---|
| 복수형(plural) | ⚠ **보간 변수 이름에 `count`를 쓰지 않는다.** i18next는 `count`를 보면 `_one`/`_other` 키를 먼저 찾는다 — 그 키가 없는 지금은 조용히 폴백에 기대게 된다. 세는 값은 `days`·`total`·`dots`처럼 이름을 달리 준다. 복수형을 제대로 도입할 때 `count`로 되돌리고 두 형태를 함께 넣는다 |
| RTL(아랍어·히브리어) | 언어 추가 시 `I18nManager` 처리 필요. 지금은 대상 언어가 없다 |
| **AdMob UMP** | 🔴 미연동 → **EEA·영국·스위스 배포 제외**(CLAUDE.md §9.1). 독일어·이탈리아어가 사실상 놀고 있다. 유럽을 열려면 이것부터 |
| **처리방침 다국어** | 🔴 한국어 단일. EU를 열 때 GDPR 제12조("명확하고 알기 쉬운 언어") 때문에 최소 영문이 필요하다. `privacy-eu`·`privacy-global` 스킬 있음 |
| 스토어 등록정보 다국어 | 앱 UI는 15개인데 등록정보가 못 따라간다. my_word는 ko·en·ja 3개만 했다 |
| **원어민 검수** | ⚠ 15개 언어 모두 기계 번역 수준이다. 뜻은 맞아도 원어민에게 "번역체"로 읽힐 수 있다. 감성 일기라 문장의 결이 상품의 일부이므로, 최소한 주요 언어는 출시 전 검수를 받는다 |
| 스토어 등록 정보·개인정보처리방침 번역 | 출시 준비 단계. **앱 안이 번역돼도 스토어 설명이 한국어면 그 나라 사용자에게 걸리지 않는다** |
| AI 리포트 언어 | 프록시에 사용자 언어를 함께 보내야 한다. 조각 서버 착수 시 |

---

## 번역 현황 — `report.*` · `date.*` 추가 (2026-08-12)

AI 리포트 화면의 **32키 + `report.fail.*` 9키 + `date.*` 4키**를 15개 언어에 넣었다.

| | |
|---|---|
| `report.fail.*` | **코드를 그대로 키로 쓴다** — `backup.fail.*`과 같은 규약. 사유마다 다음에 할 일이 달라서 뭉뚱그린 "오류가 발생했습니다"를 쓰지 않는다 |
| 재사용 금지 | 🔴 `backup.notice.*`와 **절대 섞지 않는다.** 고지가 정반대다(백업 = 저장하되 못 읽음 / AI = 읽되 저장 안 함, `CLAUDE.md` §5.1) |
| `date.*` 4키 | `range` · `rangeCrossMonth` · `weekNumber` · `yearOnly`. 위 §4.2대로 **자리표시자가 언어마다 다르다** |

⚠ 여기도 원어민 검수 전이다. 위험 목록에 세 줄이 늘었다(아래).

---

## 번역 현황 — `backup.*` · `subscribe.*` (2026-08-11)

15개 언어 **전부 번역됐다**(각 120키). 전에는 ko·en만 실제 번역이고 13개 언어가
영어 자리 채우기였다 — 백업·구독 문구는 **오역이 곧 데이터 영구 손실**이라
기계 번역을 넣지 않고 비워뒀던 부분이다.

| | |
|---|---|
| 적용 방식 | `node scripts/apply-translations.mjs <표.json>` |
| 자리표시자 검증 | **적용기가 원문과 대조해 다르면 거부한다** — 번역이 `{{count}}`를 빠뜨리면 화면에서 숫자가 사라지는데 눈으로는 잘 안 보인다 |
| 남은 영어 | `subscribe.operator`뿐. **자리표시자만 있는 틀**이라 번역할 내용이 없다 |

### ⚠ 이건 원어민 검수가 아니다

여기 있는 번역은 **내가 만든 것**이고, 원어민이 읽은 적이 없다. 문법과 어투는 맞췄지만
그 언어를 쓰는 사람에게 자연스러운지는 다른 문제다. 특히 아래는 **틀리면 되돌릴 수 없는**
문구라, 실사용자가 생기기 전에 한 번은 원어민이 읽어야 한다:

| 키 | 왜 위험한가 |
|---|---|
| `backup.codeWarnLost` · `codeWarnShared` | "잃으면 아무도 못 연다"가 약하게 번역되면 사용자가 코드를 안 적는다 |
| `backup.restoreLosing*` · `restoreConfirmBody` | **"지워진다"가 "저장된다"로 읽히면 일기가 사라진다** |
| `backup.graceTitle` · `graceBody` | 삭제 예정일 안내. 오독하면 백업을 잃는다 |
| `subscribe.consent*` | 전자상거래법 §13⑥ 동의 문구 — **법적 효력이 걸린다** |
| `report.concernTitle` · `concernBody` · `concernChannel` | **위기 배너**. 가장 힘든 순간에 읽는 문장이고, 어색하거나 훈계조로 번역되면 안 하느니만 못하다 |
| `report.disclaimer` | *"AI가 썼고 진단이 아니다"* — **Play 생성형 AI 정책 필수 고지**다 |
| `report.sampleBadge` | **"예시"**. 약하게 번역되면 무료 사용자가 남의 문장을 자기 일기의 요약으로 읽는다 |

⏭ 우선순위는 **한국어 다음으로 사용자가 많을 언어**(en → ja → zh)부터다.
   독일어·이탈리아어는 EEA 배포 제외로 당장 사용처가 없다(§배포 지역 제약).

