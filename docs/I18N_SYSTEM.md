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
| `locales/ko.json` · `locales/en.json` | 문자열 카탈로그. **키 구조가 서로 같아야 한다** |
| `lib/i18n.ts` | i18next 초기화 · 기기 언어 판별 · `translate()` |
| `features/settings/language-store.ts` | 사용자 선택(zustand) · `app_settings.language`에 저장 |
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
<Text>{t('home.streak', { count: streak })}</Text>
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

### 4.3 언어 이름은 **그 언어로** 적는다

`LANGUAGE_LABELS`의 `한국어`·`English`는 번역하지 않는다. 영어 화면에서 'Korean'으로 보이면
한국어 사용자가 목록에서 자기 언어를 못 찾는다.

### 4.4 문자열 길이를 전제한 레이아웃을 만들지 않는다

영어·독일어는 한국어보다 길다. 고정 폭 버튼과 한 줄 강제(`numberOfLines={1}`)는 잘린 라벨을 만든다.
새 UI를 만들 때 **영어로 한 번 보고** 넘어간다.

---

## 5. 언어 추가 절차

1. `locales/<code>.json` 추가 — `en.json`을 복사해 값만 번역한다. **키를 빼지 않는다.**
2. `lib/i18n.ts`의 `LANGUAGES`에 `import` + 등록, `LANGUAGE_LABELS`에 그 언어로 된 이름 추가.
3. `npm run check:i18n` — 키 누락·불일치가 없어야 한다.
4. 설정 화면은 손대지 않아도 된다. 선택지는 `LANGUAGES`에서 자동으로 나온다.

`isLanguageMode()`도 `LANGUAGES`를 보도록 되어 있는지 확인한다 — 여기만 하드코딩으로 남으면
저장된 선택이 조용히 무시된다.

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
| 복수형(plural) | i18next는 `_one`/`_other`를 지원한다. 지금은 "{{count}}개의 조각"처럼 세지 않는 표현으로 피했다 — 영어 문구를 다듬을 때 도입한다 |
| RTL(아랍어·히브리어) | 언어 추가 시 `I18nManager` 처리 필요. 지금은 대상 언어가 없다 |
| 스토어 등록 정보·개인정보처리방침 번역 | 출시 준비 단계 |
| AI 리포트 언어 | 프록시에 사용자 언어를 함께 보내야 한다. 조각 서버 착수 시 |
