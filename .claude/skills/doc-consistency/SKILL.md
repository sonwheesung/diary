---
name: doc-consistency
description: 조각(일기 앱) 문서 정합 검사 — ① 상호참조(문서→파일·심볼·§절이 실재하나) ② 문서↔문서 모순(같은 상태·수치가 두 곳에서 다름) ③ 문서↔코드 존재 정합 ④ 폐기 결정 정리(뒤집힌 옛 서술이 현역으로 살아 있나) ⑤ **검증 주장 과장**(문서가 "✅ 확인"인데 실측 범위가 더 좁다) ⑥ **끝난 일이 남은 일로 남아 있나**(조각의 지배적 결함 — 없는 블로커가 크리티컬 패스를 오염시킨다). 큰 변경·여러 문서 갱신 후, 릴리스 전, "문서 최신화 잘 됐나"·"남은 작업이 뭐냐" 물을 때 호출. 범용 골격은 C:\project\common\.claude\skills\doc-consistency.
---

# doc-consistency (조각) — 문서 정합 검사

> 범용 방법론은 [`C:\project\common\.claude\skills\doc-consistency`](file:///C:/project/common/.claude/skills/doc-consistency/SKILL.md).
> 여기엔 **이 레포의 교차축·검사 명령·기지(旣知) 오탐**과, 조각에서 실제로 반복된 **⑥번 결함**만 둔다.
>
> 경계: 코드가 명세대로 *도는가*는 `npm run check:*` 19종이 본다. 이건 **정적 문서 정합**이다.

## 이 레포의 정본 순서

**코드·실측 > 문서.** 그리고 조각에는 정본이 명시돼 있다:

| 무엇 | 정본 |
|---|---|
| 구현 현황 | [`docs/README.md`](../../../docs/README.md) **§2 현황표** — 각 `*_SYSTEM.md`의 "구현 현황" 절이 아니다 |
| 설계 원칙·기둥·결정 로그 | [`CLAUDE.md`](../../../CLAUDE.md) |
| 검사 개수 "N개" | 스크립트 실측 — **`npm run check:doc-counts`가 이미 대조한다.** 손으로 세지 않는다 |
| 정책 상수(90일 유예 등) | 코드 상수. 앱↔서버 두 벌이면 `check:subscription`이 같은지 본다 |
| 계정·결제·사업자 정보 | [`C:\project\common\BUSINESS_INFO.md`](file:///C:/project/common/BUSINESS_INFO.md) — **여기에 다시 적지 않는다**(두 곳에 적어서 이틀 낡은 전례가 있다) |

뒤집힌 결정은 **삭제가 아니라 취소선 정정**으로 보존한다([`DOC_DISCIPLINE.md`](../../../docs/DOC_DISCIPLINE.md) §1).
🔴 **결정을 기록하되 사실을 지우지 않는다** — 어떤 것을 "안 하기로" 정해도 그것이 만드는
피해는 그대로 적는다(2026-09-03 운영 DB 보류가 그 모양이다).

---

## ⑥ 끝난 일이 남은 일로 남아 있나 — **조각의 지배적 결함**

다른 레포는 ⑤(과장)가 제일 많은데, **조각은 반대 방향이 더 많다.** 끝난 일이 🔴·`- [ ]`·`❌`로
남아 **없는 블로커가 크리티컬 패스에 오른다.** 이건 문서를 못 믿게 만들 뿐 아니라
**실제로 일정을 늦춘다** — 조각에서 최소 **일곱 번** 일어났다:

| 언제 | 무엇이 낡아 있었나 | 대가 |
|---|---|---|
| 2026-08-13 | 30일 자기구속 시계(백업 9/10 · AI 9/11) | **애초에 해당 없었다.** 없는 블로커를 **두 번** 세웠다 |
| 2026-08-17 | *"§13⑥ 전환 동의 플로우가 없다"* | **이미 있었다.** 실측하고서야 정정 |
| 2026-08-19 | *"AI 사업자 연락처 미기재 — 출시 차단"* | 해소된 뒤 며칠 더 🔴로 남았다 |
| 2026-08-21 | 이용약관 번역 *"14개 진행 중"* | **끝나 있었다.** `check:legal`이 이미 세고 있었다 |
| 2026-08-21 | *"Lucide 번들 비대"* 출시 블로커 | 실측 0건 — 해소된 지 오래였다 |
| 2026-09-04 | 데이터 보안 선언 🔄 · 릴리스 체크리스트 **미완료 6줄** | 6줄 **전부** 끝난 일이었다 |
| 2026-09-04 | 🔴 **연령 게이트가 없다** — `docs/README.md` 출시 블로커 표 | 근거로 든 사실 **둘 다 거짓**이었다(코드 0줄 · 문자열 0개 → 실제로는 `features/auth/` 전체 + `ageGate` 10키 × 15언어 + 가드 148개). 8/27 에 구현하고 **그 표만 안 고쳤다** |

**검사법** — 🔴·⚠·`- [ ]`·`❌`·`🔄`·*"미구현"*·*"대기"*·*"진행 중"* 을 전수로 뽑아
**하나씩 실측한다.** 문서가 근거가 아니다:

```bash
# 미완료로 보이는 것 전수
grep -rn "^\s*- \[ \]" docs/*.md CLAUDE.md
grep -rn "🔴\|🔄\|❌" docs/README.md CLAUDE.md | grep -v "~~"
grep -rn "미구현\|미착수\|진행 중\|대기\|예정\|아직" docs/*.md | grep -v "~~" | grep -v "⏭"
```

⚠ **`~~취소선~~`은 제외한다** — 그건 이미 정리된 것이다.
⚠ **양이 겁나지 않는다** — 2026-09-04 실측으로 `- [ ]` **0건** · 🔴🔄❌ **19건** ·
  *미구현/대기/진행 중* **19건**이다. 전수로 하나씩 실측할 만한 크기다.
⚠ 그리고 **메모리도 같이 본다.** `~/.claude/projects/C--project-diary/memory/`의 project 메모가
낡으면 다음 세션이 그걸 근거로 판단한다(2026-09-04에 `jogak-prelaunch-blockers`가 그랬다).

---

## ⑤ 검증 주장 과장 — 조각에서 나오는 모양은 **"숫자는 맞는데 해석이 사실을 넘었다"**

조각은 *"확인했다"* 를 거짓으로 적기보다, **잰 것과 결론 사이가 벌어진다.** 실제 사례:

| | 잰 것 | 적으려던 결론 | 무엇이 틀렸나 |
|---|---|---|---|
| 2026-09-02 | 번들에서 한국어·일본어·중국어 **0건** | *"번역이 안 실렸다"* | Hermes는 비ASCII를 **UTF-16LE**로 넣는다. **대조군(`조각`)을 세고서야** 방법이 틀린 걸 알았다 |
| 2026-09-02 | `check:timezone` 초록불 | *"기간 계산이 시간대에 안 흔들린다"* | 가드가 **지역 수**를 개수로 찍고 있었다 — **단언을 전부 지워도 초록불**이었다 |
| 2026-09-03 | 리포트에 요일 언급 **0회** | *"겹침 방지 성공"* | 0회는 목표가 아니었다. 대조의 근거가 되는 날은 **이름을 불러야** 한다 |

🔴 **규칙: 0이 나오면 대상이 아니라 세는 방법을 의심한다.** 대조군을 먼저 세운다.
🔴 **규칙: 가드가 초록이면 "무엇을 세는지" 확인한다.** 일부러 망가뜨려 빨개지는 것까지 본다.

교정은 지우는 게 아니라 **근거 수준을 낮춘다** — `✅ 확인` → `✅ 에뮬레이터 확인 · ⏭ 실기기 미측정`.

---

## 교차축 — 조각에서 두 곳 이상에 적히는 것

| 축 | 정본 | 흔한 stale 자리 |
|---|---|---|
| **구현 현황 ✅/🔄/❌** | 실제 코드·커밋 | `docs/README.md` §2 ↔ 각 `*_SYSTEM.md`의 구현 현황 절 ↔ `CLAUDE.md` §14 |
| **출시 블로커** | 실제 상태 | `CLAUDE.md` §14 ↔ `docs/README.md` §2 *"출시 전 반드시"* ↔ **메모리** — 셋이 갈린다 |
| **릴리스 전 체크리스트** | 실제 완료 | `BACKUP_SYSTEM` §8 · `MONETIZATION_SYSTEM` §6.1.2 |
| **서버가 살아 있는가** | `GET /api/health` | 문서의 *"정지돼 있다"*·*"배포됐다"* 서술. **눌러본다**(아래 명령) |
| 정책 상수(90일·캡) | `features/backup/policy.ts` ↔ `server/lib/policy.ts` | `check:subscription`이 이미 대조 |
| 순수 계층 복사본 | `features/ai/{types,prompt,period}.ts` → `server/shared/` | `check:shared`가 잡는다. ⚠ CRLF로 한 번 데였다 |
| 프롬프트 버전 | `features/ai/types.ts`의 `PROMPT_VERSION` | 여러 문서의 *"v N"* 서술 |
| 검사 개수 "N개" | 스크립트 | `check:doc-counts`가 잡는다 — **여기서 손으로 세지 않는다** |
| 법무 문안 | `features/legal/legal-text.ts` 한국어 | `check:legal` 378개 + `legal:stamp` 지문 |
| **공개 웹 법무본** | `main` 브랜치의 `docs/*.html` | 🔴 **어떤 검사도 안 본다.** `develop`이 앞서면 공개본이 조용히 낡는다(2026-08-27에 4일·66커밋) |

---

## 검사 명령

```bash
# ① 문서→파일 참조 무결성 — 아래 "기지 오탐"을 먼저 읽는다(27건은 정상이다)
npm run scan:doc-refs
#    ⚠ `../CLAUDE.md` 같은 상대경로는 스캐너가 못 푼다 — 오탐이다.
#    ⚠ **깨짐 0이 목표가 아니다.** 기준선과 대조해 **늘어난 것만** 본다.
#    기준선: 2026-09-04 **27건** → 09-08 **32건** → 09-09 **36건**.
#    ⚠ 늘어난 것은 전부 **유형 ②(레포 밖 `C:\project\common` 공용 문서)** 다 —
#    09-09 에 커밋 규약 정본을 `common/COMMIT_CONVENTION.md` 로 가리키며 참조가 늘었다.
#    🔴 **개수가 늘었다고 드리프트가 아니다.** 판정은 개수가 아니라 **유형**으로 한다 —
#    아래 8유형에 안 들어가는 것만 진짜다. 실재 여부는 `ls` 한 번이면 갈린다.

# ③ 문서가 적은 심볼이 코드에 실재하나
npm run scan:doc-symbols                 # 전체
npm run scan:doc-symbols docs/DATABASE.md   # 한 문서만
#    기준선(2026-09-04): 문서 17개 · **미존재 94건** — 아래 표의 5유형이면 정상이다

# ⑥ 미완료로 보이는 것 전수 (위 §⑥ 참조)
grep -rn "^\s*- \[ \]" docs/*.md CLAUDE.md

# 서버 상태는 문서가 아니라 서버에게 묻는다
curl -s https://jogak-stg.vercel.app/api/health
#   → {"ok":true,"db":"up",...}  이어야 백업·AI가 실제로 산다

# 가드는 통째로 한 번 (문서가 인용하는 개수의 근거)
npm run check:doc-counts && npm run check:legal
```

---

## 기지(旣知) 오탐 — 다시 트리아지하지 말 것 (2026-09-04 전체 스캔)

문서 36개 · 파일 인용 516건(고유 193) 스캔 시 **깨짐 27건**이 나오고 **전부 정당**하다.
**진짜 드리프트는 0건이었다.**

| 유형 | 예 |
|---|---|
| **상대경로(스캐너 한계)** | `../CLAUDE.md` ×11 · `../README.md` ×3 · `../fixtures/README.md` — 실재한다 |
| **`C:\project\common` 공용 문서** | `BUSINESS_INFO.md` · `GLOBAL_DATA_COMPLIANCE.md` · `PRE_LAUNCH_CHECK.md` · `DOC_SYSTEM.md` · `GAME_ASSET_SOURCING.md` · `common/CLOSED_TESTING.md` · `common/PLAY_RELEASE_AUTOMATION.md` — 레포 밖이라 인덱싱이 안 된다 |
| **타 프로젝트 인용** | `common_server/db/schema.ts` · `common_server/docs/PLAN.md`(= ARCHITECTURE §4가 인용하는 그 PLAN) · `ratelimit.ts`(common_server) · `my_word/docs/RELEASE_NOTES_1.2.0.md` |
| **문서가 부재를 명시(❌ 미작성)** | `LOCK_SYSTEM.md` · `UI_GUIDE.md` · `CHANGELOG.md` · `PROJECT_STRUCTURE.md` — `README.md` §1이 ❌로 등재 |
| **CNG·런타임 산출물** | `android/app/build.gradle`(prebuild가 만든다) · `restore-pending.json`(복원 중 생기는 센티넬) · `google-services.json`(**안 쓴다**고 문서가 적는다) |
| **레포 밖 비밀** | `secrets/jogak-prod-upload.jks` — `C:\project\secrets` |
| **이전(移轉) 이력 인용** | `app/(tabs)/search.tsx` → `app/search.tsx`(2026-08-12 탭 강등). **화살표 왼쪽**이라 정당 |
| **node_modules 경로** | `dist/purchases.d.ts`(react-native-purchases) |

### ③ 심볼 인용 — 미존재 94건의 유형 (2026-09-04 실측)

| 유형 | 예 | 정당한가 |
|---|---|---|
| **타 프로젝트·외부 심볼** | `purchase_events`·`entitlement_ids`·`graceUntil`·`revokedAt`·`PRODUCT_CHANGE`·`EXPIRATION`(common_server·RevenueCat) · `service_role`(Supabase) · `ageConfirmed`(배구명가) · `doply`·`delvewarden` | ✅ |
| **안드로이드 매니페스트·Play 코드** | `POST_NOTIFICATIONS`·`RECORD_AUDIO`·`CAMERA`·`BIND_GET_INSTALL_REFERRER_SERVICE` · `PSL_USER_ACCOUNT`·`PSL_DATA_USAGE_EPHEMERAL` | ✅ |
| 🔴 **문서가 부재를 명시한 것** | `generation_blobs`(*"만들지 않았다"*) · `onKeyPress`(안드로이드가 안 준다 → 되돌렸다) · `KeyboardAvoidingView`(*"쓰지 않는다"*) | ✅ **이게 정상 신호다** |
| ⚠ **스캐너 한계 — 접두사** | `DEV_LOGIN` 은 코드에 `DEV_LOGIN_ENABLED` 로 있다. 토크나이저가 **온전한 식별자만** 잡는다 | 오탐 |
| ⚠ **스캐너 한계 — 예시 문자열** | `Travel`·`cafe`(태그 대소문자 예시) · `c61fbc03`(Hermes 매직) · `_few`/`_many`(ICU 복수형) | 오탐 |

🔴 **여기 5유형에 안 들어가면 진짜 드리프트다.** 첫 실행(2026-09-04)에서 `HINT_QUESTIONS` 가
그렇게 잡혔다 — 실제 이름은 `HINT_QUESTION_IDS` 였고, **그 옆 문장까지 틀려 있었다**
(*"저장은 문구 그대로"* ↔ §9.1 규칙 2 `highschool` ↔ 코드는 id 저장). 심볼 하나가
**문서↔문서 모순 하나를 끌고 나왔다.**

> 🔴 **새로 깨진 참조는 이 목록에 넣지 말고 고친다.** 이 목록은 *"의도적으로 실재하지 않는 대상"* 만이다.
> 위 8유형에 안 들어가면 진짜 드리프트다.

---

## 산출물

① 깨진 참조(위 8유형 제외) ② 문서↔문서 모순(정본 후보 명시) ③ 문서↔코드 드리프트
④ 폐기 미정리 ⑤ **과장된 ✅** ⑥ **끝난 일이 남은 일로 남은 것**.

정본이 갈리는 것만 사용자 평결로 올리고, 나머지는 **문서를 실측에 맞춰** 고친 뒤 커밋한다
(커밋 규약은 `CLAUDE.md` §11 이 가리키는 [`common/COMMIT_CONVENTION.md`](file:///C:/project/common/COMMIT_CONVENTION.md) — 여기 값을 베끼지 않는다).
