# OPEN_SOURCE_NOTICE — 오픈소스 고지

> 조각이 번들에 넣는 남의 저작물(폰트·npm 패키지)의 **라이선스 고지**를 어디에 어떻게 두는가.
> 정책 근거는 [`../CLAUDE.md`](../CLAUDE.md) §12(2026-08-31) · 공용
> [`GAME_ASSET_SOURCING.md`](file:///C:/project/common/GAME_ASSET_SOURCING.md) §3 ·
> [`PRE_LAUNCH_CHECK.md`](file:///C:/project/common/PRE_LAUNCH_CHECK.md) §2.

---

## 0. 구현 현황

| 항목 | 상태 |
|---|---|
| 폰트(Pretendard) OFL 고지 | ✅ 2026-08-31 — `features/legal/licenses.ts` |
| npm 런타임 의존성 36개 | ✅ 생성 — `features/legal/oss-packages.ts` |
| 화면 | ✅ 설정 → 정보 → **오픈소스 라이선스** (`app/licenses.tsx`) |
| 생성기 | ✅ `npm run licenses:build` |
| 드리프트 가드 | ✅ `npm run check:licenses` |

---

## 1. 왜 필요한가 — 이름을 적는 것으로는 부족하다

**OFL 1.1 §2는 "저작권 고지와 라이선스를 동봉하라"를 요구한다.** *"폰트: Pretendard"* 한 줄은
그 요건을 만족하지 않는다. MIT도 같다 — *"The above copyright notice and this permission notice
shall be included in all copies"* 가 조건문이다.

조각은 `assets/fonts/`에 **Pretendard OTF 3종(약 4.6MB)** 을 직접 넣고, 런타임 의존성 36개를
번들에 싣는다. 그런데 2026-08-31까지 앱 어디에도 고지가 **한 줄도 없었다** —
설정 → 정보에는 `약관 · 처리방침 · 버전` 셋뿐이었다.

⚠ 공용 문서가 이미 이걸 잡아 놨다. `GAME_ASSET_SOURCING.md` §3.1이 배구명가에서 같은 결함을
찾아 닫으며 **"다른 프로젝트도 같은 검사를 한 번씩 돌릴 것 — 폰트는 거의 모든 앱에 있고,
거의 항상 이름만 적혀 있다"** 고 적었다. **조각은 그 검사를 안 돌렸다.**

---

## 2. 🔴 형제의 고지를 베끼면 틀린다 — 우리 파일을 읽는다

배구명가의 고지는 저작권자가 **넷**이다:

```
Kil Hyung-jin · Adobe (Source) · The Inter Project Authors · The M+ FONTS Project Authors
```

**그대로 베꼈으면 조각은 틀린 고지를 냈다.** 배구명가가 쓰는 것은 **Pretendard JP**(일본어 합본)이고
조각이 쓰는 것은 **plain Pretendard**라, 합본이 얹은 상류 저작권자가 조각에는 **없다.**

두 출처로 실측했다(2026-08-31):

| 출처 | 결과 |
|---|---|
| **번들된 OTF 3개의 `name` 테이블**(id 0·13·14 직접 파싱) | `Copyright © 2023 Kil Hyung-jin` · OFL 1.1 · `http://scripts.sil.org/OFL` · `Version 1.309` |
| **저장소 LICENSE**(`orioncactus/pretendard` 태그 `v1.3.9`) | `Copyright (c) 2021, Kil Hyung-jin (…), with Reserved Font Name Pretendard.` · **Adobe·Inter·M PLUS 언급 0** |

→ 조각의 고지는 **저작권자 1인 + Reserved Font Name + OFL 1.1**이다.

⚠ **폰트 파일을 갈아끼우면 이 절을 다시 잰다.** 특히 **JP·Variable 합본으로 바꾸면 저작권자가
늘어난다** — 파일만 바꾸고 고지를 그대로 두면 그 순간 누락이 생긴다.

### 왜 폰트만 손으로 드는가

폰트는 **npm 패키지가 아니라 `assets/` 의 파일**이라 `package.json`에서 셀 수가 없다.
그래서 `features/legal/licenses.ts`가 상수로 갖고, **이 절이 그 값의 근거**다.

---

## 3. npm 패키지 — 생성한다, 손으로 적지 않는다

```
scripts/make-licenses.mjs  →  features/legal/oss-packages.ts   (생성 파일)
```

🔴 **손으로 적은 목록은 의존성을 하나 추가한 날 조용히 거짓이 된다.** 그리고 고지의 거짓은
라이선스 위반이다. `DOC_SYSTEM.md` §2 *"손으로 적은 수 옆에 세는 법을 함께 적는다"* 의 코드판이다.

| 규칙 | 왜 |
|---|---|
| **`dependencies`만** 담는다 | `devDependencies`는 번들에 안 들어가 고지 의무가 없다. 넣으면 목록만 길어져 아무도 안 읽는다 |
| 라이선스를 **못 읽으면 실패**한다(exit 1) | 조용히 빠뜨리면 그게 정확히 위반이다. 사람이 그 패키지를 직접 봐야 한다 |
| 저작권 줄이 **없으면 빈 문자열** | 🚫 지어내지 않는다. Expo 계열은 패키지에 LICENSE 파일을 안 넣는다(모노레포 루트에 있다) — 그 경우 라이선스명만 보인다 |

현황(2026-08-31 실측): **36개** — MIT 34 · ISC 1(`lucide-react-native`) · Apache-2.0 1(`react-native-google-mobile-ads`).
저작권 줄을 찾은 것 16개, 못 찾은 것 20개(전부 LICENSE 파일 미동봉).

---

## 4. 화면

```
설정 → 정보 → 오픈소스 라이선스        app/licenses.tsx
```

🔴 **저작권자·라이선스명·Reserved Font Name은 번역하지 않는다.** 고유명사이고, **원문 그대로
두는 것이 고지의 요건**이다. `t()`로 꺼내는 것은 **화면 제목과 절 제목뿐**이다 —
§9.1 규칙 1(*"화면에 보일 문자열을 코드에 직접 쓰지 않는다"*)의 의도적 예외이고, 그 이유가 이것이다.

---

## 5. 가드

```bash
npm run licenses:build     # 생성 (의존성을 바꿨으면)
npm run check:licenses     # 생성 결과가 지금 설치본과 같은가
```

`check:licenses`는 생성기를 메모리에서 다시 돌려 **파일과 바이트로 대조**한다.
의존성을 더하고 `licenses:build`를 안 돌리면 실패한다.

⚠ **`node_modules`가 있어야 돈다.** 없는 환경(CI 캐시 미스)에서는 생성기가 exit 1로 죽으므로
*"통과"* 로 오해할 여지가 없다.
