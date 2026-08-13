# 조각 — 문서 색인

> 이 파일이 **문서 색인이자 구현 현황 정본**이다. 새 `*_SYSTEM.md`를 추가하면 반드시 아래 목록과
> 구현 현황표에 함께 등록한다([`DOC_DISCIPLINE.md`](./DOC_DISCIPLINE.md) 부록 체크리스트).
> 설계 원칙·기둥·MVP 범위·결정 로그는 루트 [`CLAUDE.md`](../CLAUDE.md).

---

## 1. 문서 목록

| 문서 | 범위 | 상태 |
|---|---|---|
| [`../CLAUDE.md`](../CLAUDE.md) | 설계 정본 — 기둥·MVP 범위·로그인/광고 정책·스택·결정 로그 | ✅ |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | 서버 경계(common_server vs 조각 서버)·신원 흐름·연동 계약 | ✅ |
| [`DOC_DISCIPLINE.md`](./DOC_DISCIPLINE.md) | 문서 작업 규율 | ✅ |
| [`DIARY_SYSTEM.md`](./DIARY_SYSTEM.md) | 조각 도메인 — 하루 조각 수·날짜·감정·연속 작성일·검색·삭제 규칙 | ✅ |
| [`DATABASE.md`](./DATABASE.md) | 로컬(expo-sqlite) 스키마·마이그레이션 규약·백업 대비 | ✅ |
| [`SUPPORT_SYSTEM.md`](./SUPPORT_SYSTEM.md) | 공지·문의 — common_server 연동·SDK 복사 규약·읽음 관리 | ✅ |
| [`I18N_SYSTEM.md`](./I18N_SYSTEM.md) | 다국어 — 문자열 규약·날짜 현지화·언어 추가 절차 (정책은 CLAUDE.md §9.1) | ✅ |
| `AUTH_SYSTEM.md` | 구글 로그인·subject 토큰 | ❌ 미작성 |
| `LOCK_SYSTEM.md` | 앱 잠금 — PIN·패턴(3×3)·생체·자동잠금·실패 처리 (정책은 CLAUDE.md §7.1) | ❌ 미작성 |
| [`MONETIZATION_SYSTEM.md`](./MONETIZATION_SYSTEM.md) | 구독 — 단일 상품·로그인 게이트·RevenueCat 연결·전자상거래법 (정책은 CLAUDE.md §7.2) | ✅ |
| [`BACKUP_SYSTEM.md`](./BACKUP_SYSTEM.md) | 백업/복원 — 키 유도·봉투·매니페스트·서버 계약·전체 교체 (정책은 CLAUDE.md §5.1) | ✅ |
| [`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) | AI 리포트 — 처리 경로·위기 정책·모델/원가·캡·기간/언어·서버 계약 (정책은 CLAUDE.md §5.1) | ✅ |
| [`ADMIN_SYSTEM.md`](./ADMIN_SYSTEM.md) | 운영 콘솔 — 배구 승계 범위·인가(fail-closed)·**개인 비특정 규칙**·읽기 전용 | ✅ |
| `UI_GUIDE.md` | 컬러·타이포·여백·공통 컴포넌트 사용법 | ❌ 미작성 |
| `CHANGELOG.md` | 릴리스 변경 이력 | ❌ 미작성(첫 빌드 시점부터) |
| `PROJECT_STRUCTURE.md` | 폴더 구조 상세 | ⏸ 보류 — 현재는 CLAUDE.md §8이 정본 |

---

## 2. 구현 현황

### 앱

| 영역 | 상태 | 비고 |
|---|---|---|
| Expo 부트(SDK 54 · expo-router · TS strict) | ✅ | dev 서버 기동 + 실기기 접속 확인(2026-08-07) |
| 테마(팔레트 · spacing · radius · typography) | ✅ | 라이트 + 다크. `theme/palettes.ts`에 팔레트를 더하면 스킨이 된다 |
| 다크모드 | ✅ | 설정 → 화면 → 시스템·라이트·다크. 선택은 `app_settings`에 저장 |
| 다국어(i18n) | ✅ | **15개 언어**. 기기 언어 기본, 폴백은 영어. 설정 → 언어 시트에서 변경. `npm run check:i18n` · `npm run check:subscription`으로 키 검사. ⚠ 원어민 검수 전 |
| Pretendard 폰트 | ✅ | 정적 OTF 3종. 로드 완료까지 스플래시 유지, 실패해도 앱은 진행 |
| expo-sqlite 스키마·마이그레이션 | ✅ | `db/` — user_version 기반. 실기기 스모크 테스트 통과 |
| 일기 CRUD·검색·streak·캘린더 집계 | ✅ | `features/diary/api/` |
| 하단 탭 네비게이션(홈·캘린더·⊕·**리포트**·설정) | ✅ | ⊕는 탭이 아니라 작성 화면을 띄우는 동작. **검색은 2026-08-12에 탭에서 강등**(AI_REPORT_SYSTEM §11.1) |
| 화면 틀 `components/Screen` | ✅ | 세이프에어리어·키보드 여백 단일 처리. CLAUDE.md §10 |
| 공통 컴포넌트 Button · Card · TextField · MonthGrid · DatePickerSheet · **BottomSheet · ImageViewer** | ✅ | 2026-08-13 정정 — BottomSheet는 있다(언어·리포트 언어 시트가 쓴다). Modal · Header · Avatar · Loading은 **필요한 적이 없어 안 만들었다** — 미착수가 아니라 불필요 |
| Splash · 아이콘 | ✅ | `scripts/make-assets.py`로 코드 생성. 라이트/다크 스플래시 분리. 적응형 아이콘 안전영역 확인 |
| Home | ✅ | 오늘 날짜·인사·연속 기록·조각 쓰기·최근 조각(썸네일) |
| Write / Edit | ✅ | 한 화면이 둘을 겸한다(`/write?id=`). 커서 위치 사진 삽입·태그·감정·날짜 변경. 저장 후 광고는 AdMob 대기 |
| Detail | ✅ | `app/diary/[id].tsx` — 조회·수정·삭제. 돌아올 때마다 다시 읽는다 |
| Calendar | ✅ | 월 격자(쓴 날 점 표시)·날짜 선택·그날 조각 카드·빈 날엔 그 날짜로 쓰기 |
| Search | ✅ | `app/search.tsx` — **탭이 아니다.** 홈·모든 조각의 돋보기가 입구. 250ms 디바운스, 빈 검색어면 자주 쓴 태그 |
| 모든 조각 목록(홈의 더보기) | ✅ | `app/diaries.tsx` — 달 머리글 + 20개씩 '더 보기' |
| Settings(다크모드·잠금·언어·알림 UI) | ✅ | 2026-08-11 정정 — ❌로 남아 있었다 |
| 앱 잠금(PIN·패턴 3×3·생체) | ✅ | `features/lock/` · 힌트 되찾기 · 실패 backoff · 복귀 지연 · 앱 스위처 가림(Android). iOS 가림만 남음 |
| 공지사항 | ✅ | `app/notice.tsx` — bootstrap 1회 조회. **서버에 `jogak` 등록 대기** |
| 문의하기 | ✅ | 화면·서버 전송·로그인·탈퇴까지. 로그인 게이트 화면에 처리방침 고지 추가(2026-08-11) |
| **문의 내역·답변** | ✅ | 2026-08-13 — `app/inquiries.tsx`. 서버·SDK는 있었는데 **앱이 부르지 않아** 답변을 볼 길이 없었다. 답변 배지는 설정 행에 점 하나(푸시가 없어 이게 통지의 전부다). [`SUPPORT_SYSTEM.md`](./SUPPORT_SYSTEM.md) §5.5 |
| 구글 로그인(선택적) | ✅ | 2026-08-11 정정 — Phase 7이 끝났고 `bootstrap?app=jogak`도 200이다 |
| 광고(AdMob) | ✅ | 전면=저장 완료 후 하루 1회 · 배너=탭 화면 상시. 개발은 테스트 단위(`EXPO_PUBLIC_ADS_REAL=1`일 때만 실제 단위) |
| **광고 제거(구독자)** | ✅ | `features/entitlement/store.ts` — 캐시 먼저·서버 나중. 조회 실패에 캐시를 지우지 않는다 |
| **백업/복원 — 앱 쪽** | ✅ | 암호 계층·매니페스트·클라이언트·화면. [`BACKUP_SYSTEM.md`](./BACKUP_SYSTEM.md) |
| **백업/복원 — 기기 검증** | ✅ | 2026-08-11 에뮬레이터 15/18. 5MB PUT 바이트 일치 · `backupDatabaseAsync` 9ms. ⏭ 남은 3은 **암호 처리량**이고 "순수 JS 유지"로 결론냈다 — 실기기(ARM) 재측정만 남음([`BACKUP_SYSTEM.md`](./BACKUP_SYSTEM.md) §8) |
| 사진 백업(2차) | ✅ | 이미지 하나 = blob 하나. 증분(`plan`) · 복원 후 못 받은 사진만 `'missing'` |
| 월 구독(RevenueCat) | ⏸ | ~~Phase 9 대기~~ → 앱·RC·**Play 상품 등록까지 완료**(2026-08-12). 남은 것은 RC 상품 import·attach와 결제 프로필. [`MONETIZATION_SYSTEM.md`](./MONETIZATION_SYSTEM.md) |
| 백업/복원 — 서버 | ✅ | ~~조각 서버 대기~~ → `jogak-stg`(서울) + Vercel(`icn1`) 배포. 위 두 줄과 합쳐 읽는다 |
| **AI 리포트 — 앱 쪽** | ✅ | 리포트 탭·상세·홈 카드·설정(리포트 언어)·DB v5·백업 포함. [`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) §11 |
| **AI 리포트 — 서버** | ⏸ | 라우트·벤더 경계·캡·`ai_usage` 구현 완료(`e2e:ai` 7개). ✅ **모델 실호출 확인**(2026-08-13, `AI_EFFORT=medium` 확정 · 원가가 계획의 1/4). 🔴 **그런데 `/api/v1/ai/report`를 통과한 성공 경로는 0회** — 측정은 OpenAI를 직접 불렀다([`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) §4.2.1) |
| AI 리포트 — 동의 2종 | ✅ | §23 민감정보 · §28-8 국외이전. 체크박스 2개, 묶지 않는다 |
| 🔴 AI 사업자 **연락처** | ❌ | **출시 차단**(§28-8② 3호). `features/ai/vendor.ts` — `check:ai`가 매번 경고 |
| AI 리포트 — 처리방침 예고 | ✅ | 2026-08-12 게시. 30일 시계는 **2026-09-11** 만료 |
| ESLint · Prettier | ✅ | ESLint 9 flat config + eslint-config-expo@10. `any` 금지를 린트로 강제 |
| EAS 빌드 설정 | ✅ | 2026-08-13 정정 — `eas.json`(internal·production). v7 AAB를 `eas submit`으로 올렸다([`MONETIZATION_SYSTEM.md`](./MONETIZATION_SYSTEM.md) §6.1) |

### ⚠ 출시 전에 반드시 처리할 것

| 항목 | 내용 |
|---|---|
| Lucide 번들 비대 | `import { House } from 'lucide-react-native'`가 아이콘 세트 **전체**를 끌어온다(번들 6.5MB → 10.4MB, 3056 모듈). 개별 경로 import로 바꾸거나 트리셰이킹을 확인할 것 |
| 패키지 설치 후 Metro 재시작 | 서버를 켠 채 설치하면 캐시가 낡아 `Unable to resolve module`이 난다(2026-08-07에 두 번 겪음). 설치 후 `--clear` 재시작이 기본 |

### 서버 (조각 밖 선행 작업 포함)

| 영역 | 상태 | 비고 |
|---|---|---|
| Metro `server/` blockList | ✅ | 선반영 완료 |
| common_server `apps`에 `jogak` 등록 | ✅ | 2026-08-13 정정 — `bootstrap?app=jogak`이 **200**이다(2026-08-11 실측) |
| common_server SDK 복사 | ✅ | 2026-08-13 정정 — `lib/common-server/{client,index,types}.ts` |
| **common_server Phase 7**(subjects·토큰) | ✅ | 2026-08-13 정정 — 로그인·문의·탈퇴가 실제로 돈다 |
| **common_server Phase 9**(RevenueCat) | ✅ | 2026-08-13 정정 — 2026-08-10 완료(결제 가드 37/37). ⏭ 남은 것은 RC 대시보드 상품 import·attach |
| 조각 서버(Next.js) 생성 | ✅ | 2026-08-13 정정 — 배포됨. 백업 6 라우트 + `cron/reap` + `ai/report` |
| 조각 Supabase 프로젝트 | ✅ | 2026-08-13 정정 — `jogak-stg`(서울). ⏭ **운영 프로젝트는 미생성**(Pro 조직 추가 시 +$9.8/월) |
| 백업 라우트 — 되찾기(`rebind`)·파기(`delete`)·리퍼(`cron/reap`) | ✅ | 2026-08-13 정정 — 셋 다 구현돼 있다. 크론은 `vercel.json`에 등록돼 있다(`0 18 * * *`) |
| **운영 콘솔** `/ops-7c1d94` | ✅ | 2026-08-13 — 대시보드·AI 사용량·백업 금고·정리 4탭. **읽기 전용 · 개인 비특정**. `npm run check:admin` 23개. [`ADMIN_SYSTEM.md`](./ADMIN_SYSTEM.md) |
| ⚠ `ai_usage` 테이블 | ✅ | 2026-08-13 — **stg DB에 없었다**(`db:push` 누락). 콘솔을 붙이다 발견했고 push했다 — 그전까지 AI 라우트는 성공 경로에서 500이었을 것이다 |

🚫 = 안 하기로 결정 / ⏸ = 보류 / ❌ = 미착수 / ✅ = 완료

---

## 3. 검증 루틴

```bash
npm install                    # 의존성

# 커밋 전 필수 (CLAUDE.md §11 ④)
npm run typecheck              # tsc --noEmit
npm run lint                   # eslint
npm run check:i18n             # 키 누락·언어 간 불일치 + **다른 언어에 한글이 남았는가**
npm run check:legal            # 112개 — 절·줄 수 + **정본 지문**(문구만 바뀐 드리프트 방어)
npm run legal:stamp --check    # 지금 어긋난 언어만 본다. <lang>을 주면 다시 읽은 뒤 도장을 찍는다

# 백업을 건드렸으면
npm run check:backup-crypto    # 46개 — KAT(RFC 5869·XChaCha) + 봉투·매니페스트·전체 경로
npm run check:i18n-roundtrip   # 54개 — 25개 스크립트의 UTF-8·매니페스트 왕복

# 구독·AI를 건드렸으면
npm run check:subscription     # 14개 — 체험 기간 계산(전자상거래법 §13⑥ 고지의 근거)
npm run check:ai               # 47개 — ISO 주차·주차↔날짜범위 왕복·프롬프트·인젝션 방어·스키마·동의

# 운영 콘솔을 건드렸으면
npm run check:admin            # 23개 — **fail-closed** · 헤더 판정 · KST 집계 창 · 원가 추정

# API 키가 있을 때만 (실제 과금이 발생한다)
cd server && npm run measure:ai   # P1 — 한국어 토큰·모델 비교·effort 스윕·refusal

# 새 런타임 의존성이 들어가는 커밋 / AAB 굽기 직전에만 (콜드 수 분)
npm run check:bundle           # 번들 상한. 기준선 3.67MB

npm run format                 # prettier --write (문서 *.md는 제외)
```

### 조각 서버 (`server/`)

```bash
cd server
npx supabase start   # Postgres :54422 · Storage :54421 · Studio :54423 (전부 Docker)
npm run db:push
npm run dev          # :3200
npm run e2e          # 9개 — reserve→서명 URL PUT→commit→latest→다운로드
npm run e2e:ai       # 7개 — AI 게이트(인가·구독·빈입력·과대입력·캡). **모델을 부르지 않는다**
npm run measure:ai   # ⚠ 실제 과금. OPENAI_API_KEY 필요
```

⚠ 기본 포트(5432x)를 다른 프로젝트의 Supabase 스택이 쓰고 있어 **544xx로 옮겼다.**
자세한 것은 [`BACKUP_SYSTEM.md`](./BACKUP_SYSTEM.md) §7.

### ⚠ Expo Go를 떠났다 (2026-08-09)

광고 SDK가 네이티브 모듈이라 **Expo Go에서 돌지 않는다.** 이제 dev build로 개발한다.

```bash
npx expo run:android --port 8084   # 최초 1회: prebuild + gradle 빌드 + 설치 (수 분)
npm start                          # 이후에는 Metro만 (앱은 설치된 dev client)
```

- `android/`·`ios/`는 **CNG 산출물이라 커밋하지 않는다.** 새 클론에서는 위 명령이 알아서 만든다.
- 네이티브 의존성(`app.json` plugins, 네이티브 패키지)을 건드리면 **다시 빌드**해야 한다.
  JS만 고쳤으면 Metro 리로드로 충분하다.
- 빌드 환경: `JAVA_HOME`은 JDK 21, `ANDROID_HOME`은 `%LOCALAPPDATA%\Android\Sdk`.

> ⚠ **Kotlin 메타데이터 충돌**(2026-08-09 겪음): `react-native-google-mobile-ads` 16.4.0이 끌어오는
> `play-services-ads 25.4.0`은 Kotlin 2.3.0으로 컴파일돼 있고 Expo SDK 54는 2.1.20을 쓴다 →
> `compileDebugKotlin` 실패. **16.0.0으로 고정**(ads sdk 24.6.0)해서 해결했다.
> 이 라이브러리를 올릴 때는 pinned ads sdk의 Kotlin 버전을 먼저 확인한다.

> 실기기 접속이 안 되면 ① 폰이 Wi-Fi인지 ② Windows 방화벽 인바운드 ③ 포트를 잡고 있는 기존 expo
> 프로세스 순으로 확인한다(2026-08-07 실제로 셋 다 겪음).

---

## 4. 아키텍처 원칙

- 의존 방향: `app/`(라우트) → `features/` → `db/`·`lib/`·`store/`·`types/`. 역방향 import 금지.
- **일기의 진실은 기기 로컬**이다. 서버는 **읽을 수 없는** 백업 사본을 갖는다. 서버가 죽어도 앱은 동작해야 한다.
- **서버는 일기를 저장하지 않는다.** 백업은 암호문, AI 프록시는 무저장 — "저장하지 않습니다"(O) / "볼 수 없습니다"(X).
- **공통 기능은 common_server, 조각 도메인은 조각 서버.** 상세는 [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- **신원은 common_server가 단일 진실.** 조각은 자체 로그인을 만들지 않는다.
- 공통 UI는 `components/`에만. Atomic Design 쓰지 않는다.
- `any` 금지, `strict` 유지.
- `server/`는 Metro 번들 대상이 아니다(`metro.config.js` blockList).
