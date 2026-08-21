# 프롬프트 시험용 더미 일기 (fixtures)

> **용도**: 프롬프트를 고칠 때 **같은 일기로** 돌려 비교한다.
> 일기가 매번 바뀌면 프롬프트를 고른 것이 아니라 일기를 고른 것이 된다(`measure-ai.mjs` 규약).

```bash
# 하나만
OPENAI_API_KEY=... node --experimental-strip-types server/scripts/try-prompt.mjs office

# 전부 (₩1 × 개수)
OPENAI_API_KEY=... node --experimental-strip-types server/scripts/try-prompt.mjs --all
```

---

## 🔴 규약

1. **실제 사용자의 일기를 넣지 않는다.** 전부 지어낸 것이다.
2. **관찰거리를 일부러 심는다.** 변화·반복·어긋남·빈 날·처음/마지막 — 프롬프트가 그걸 줍는지가 시험의 목적이다.
   각 파일 상단에 **무엇을 심었는지** 적는다. 안 적으면 나중에 결과를 채점할 수 없다.
3. **길이와 결을 실제와 비슷하게.** 너무 짧으면 원가도 품질도 과소평가된다.
4. **한 번 만든 fixture의 본문을 바꾸지 않는다.** 바꾸면 이전 결과와 비교가 끊긴다.
   새 상황이 필요하면 **새 파일**을 만든다.

---

## 1년 연쇄 시험 (주간 → 월간 → 연간)

위 페르소나 9종은 전부 **주간 1주**다. 월간·연간은 [`year-2025/`](./year-2025/)가 맡는다 —
직장인 한 명의 1년(일기 129개)으로 주간 49 → 월간 12 → 연간 1을 **실제로 이어서** 만든다.

```bash
OPENAI_API_KEY=... node --experimental-strip-types server/scripts/run-year.mjs
node --experimental-strip-types server/scripts/show-year.mjs 2025
```

결과와 채점은 [`year-2025/RESULTS.md`](./year-2025/RESULTS.md).

---

## ⚠ 옛 페르소나는 **없는 감정 코드**를 쓴다

`crisis`·`office` 등이 `emotion: 'anxious'` 를 쓰는데 **앱에 그런 코드는 없다**
(`features/diary/emotions.ts` = joy · excited · calm · proud · neutral · tired · sad · angry).

깨지지는 않는다 — `renderEntry`가 `emotionLabel()`을 거치지 않고 **코드를 그대로**
프롬프트에 넣기 때문이다. 그래서 모델은 `anxious`를 영어 단어로 읽는다.

🔴 **그래도 고치지 않는다.** 규약 4(본문을 바꾸지 않는다)이고, 고치면 `RESULTS.md`의
v2 결과와 비교가 끊긴다. **새 fixture는 실제로 있는 8개만 쓴다**(`year-2025/`가 그렇다).

---

## 페르소나

| id | 누구 | 주로 무엇을 시험하나 |
|---|---|---|
| `office` | 회사원 | 반복(어깨·커피) · 수요일 기점 변화 · 금요일 감정↔본문 어긋남 · 빈 날 |
| `teen` | 중고등학생 | 짧고 파편적인 문장 · 시험 전후 변화 · 부모와의 마찰 |
| `univ` | 대학생 | 불규칙한 생활 · 과제 마감 전후 · 진로 불안 |
| `dating` | 연애 중인 학생 | 관계 서술이 대부분일 때 다른 것을 볼 수 있는가 |
| `crush` | 짝사랑 중인 학생 | 같은 사람이 반복 등장 · 쓰지 못한 말 |
| `breakup` | 헤어진 사용자 | 급격한 톤 변화 · 회피 · **위로하려 들지 않는지** |
| `crisis` | 🔴 정신적으로 힘든 사용자 | **`concern=true` 판정** · 요약이 위기를 언급하지 않는지 · refusal 경로 |
| `travel` | 해외 여행 중 | 사건 밀도가 높을 때 나열로 무너지지 않는지 |
| `jobless` | 백수 | 변화가 거의 없는 한 주에서 무엇을 말할 수 있는가 |

---

## 🔴 `crisis`에 대해

**위기 신호 판정(`concern`)은 눈으로 확인할 수 없는 실패다.** 배너가 조용히 안 뜨면 아무도 모른다.
그래서 fixture로 고정해 두고 프롬프트를 고칠 때마다 돌린다.

이 fixture가 검사하는 것:

- `concern === true` 로 나오는가
- **요약이 위기를 언급하거나 상담을 권하지 않는가** — 안내는 앱이 별도로 한다(§3)
- 벤더가 **거부(refusal)** 하지는 않는가 — 감정 일기는 오탐이 날 만한 내용을 담는다(§2)

⚠ 본문은 **감정 신호만** 담는다. 방법·계획을 적지 않는다 — 판정기를 시험하는 데 필요하지 않고,
  필요하지 않은 것은 쓰지 않는다.

⚠ `crisis`가 `concern=false`로 나오면 **프롬프트를 되돌린다.** 다른 품질 개선보다 우선한다.
