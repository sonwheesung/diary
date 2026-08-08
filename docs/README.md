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
| `AUTH_SYSTEM.md` | 구글 로그인·subject 토큰 | ❌ 미작성 |
| `LOCK_SYSTEM.md` | 앱 잠금 — PIN·패턴(3×3)·생체·자동잠금·실패 처리 (정책은 CLAUDE.md §7.1) | ❌ 미작성 |
| `MONETIZATION_SYSTEM.md` | 구독 상품·RevenueCat·엔타이틀먼트·광고 정책 상세 | ❌ 미작성 |
| `BACKUP_SYSTEM.md` | 백업/복원 단위·충돌 규칙·키 관리 (정책은 ARCHITECTURE §6) | ❌ 미작성 |
| `AI_REPORT_SYSTEM.md` | 주간/월간/연간 리포트 생성·비용·계층 요약 (정책은 ARCHITECTURE §6) | ❌ 미작성 |
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
| Pretendard 폰트 | ✅ | 정적 OTF 3종. 로드 완료까지 스플래시 유지, 실패해도 앱은 진행 |
| expo-sqlite 스키마·마이그레이션 | ✅ | `db/` — user_version 기반. 실기기 스모크 테스트 통과 |
| 일기 CRUD·검색·streak·캘린더 집계 | ✅ | `features/diary/api/` |
| 하단 탭 네비게이션(홈·캘린더·⊕·검색·설정) | ✅ | ⊕는 탭이 아니라 작성 화면을 띄우는 동작 |
| 화면 틀 `components/Screen` | ✅ | 세이프에어리어·키보드 여백 단일 처리. CLAUDE.md §10 |
| 공통 컴포넌트 Button · Card · TextField · MonthGrid · DatePickerSheet | ✅ | Modal · Header · BottomSheet · Avatar · Loading 미착수 |
| Splash | ❌ | |
| Home | ✅ | 오늘 날짜·인사·연속 기록·조각 쓰기·최근 조각(썸네일) |
| Write / Edit | ✅ | 한 화면이 둘을 겸한다(`/write?id=`). 커서 위치 사진 삽입·태그·감정·날짜 변경. 저장 후 광고는 AdMob 대기 |
| Detail | ✅ | `app/diary/[id].tsx` — 조회·수정·삭제. 돌아올 때마다 다시 읽는다 |
| Calendar | ✅ | 월 격자(쓴 날 점 표시)·날짜 선택·그날 조각 카드·빈 날엔 그 날짜로 쓰기 |
| Search | ✅ | 제목·본문·태그 부분 문자열. 250ms 디바운스. 빈 검색어면 자주 쓴 태그를 보여준다 |
| 모든 조각 목록(홈의 더보기) | ✅ | `app/diaries.tsx` — 달 머리글 + 20개씩 '더 보기' |
| Settings(다크모드·잠금 설정·알림 UI) | ❌ | |
| 앱 잠금(PIN·패턴 3×3·생체) | ✅ | `features/lock/` · 힌트 되찾기 · 실패 backoff · 복귀 지연 · 앱 스위처 가림(Android). iOS 가림만 남음 |
| 공지사항 | ❌ | common_server bootstrap |
| 문의하기 | ❌ | **로그인 필수** — Phase 7 대기 |
| 구글 로그인(선택적) | ❌ | Phase 7 대기 |
| 광고(AdMob) | ❌ | 저장 완료 후 + 빈도 캡 |
| 월 구독(RevenueCat) | ❌ | Phase 9 대기 |
| 백업/복원(클라이언트 암호화) | ❌ | 조각 서버 대기 |
| AI 리포트(주간 우선·서버 프록시) | ❌ | 조각 서버 대기 |
| 공통 컴포넌트 8종 | ❌ | |
| ESLint · Prettier | ✅ | ESLint 9 flat config + eslint-config-expo@10. `any` 금지를 린트로 강제 |
| EAS 빌드 설정 | ❌ | |

### ⚠ 출시 전에 반드시 처리할 것

| 항목 | 내용 |
|---|---|
| Lucide 번들 비대 | `import { House } from 'lucide-react-native'`가 아이콘 세트 **전체**를 끌어온다(번들 6.5MB → 10.4MB, 3056 모듈). 개별 경로 import로 바꾸거나 트리셰이킹을 확인할 것 |
| 패키지 설치 후 Metro 재시작 | 서버를 켠 채 설치하면 캐시가 낡아 `Unable to resolve module`이 난다(2026-08-07에 두 번 겪음). 설치 후 `--clear` 재시작이 기본 |

### 서버 (조각 밖 선행 작업 포함)

| 영역 | 상태 | 비고 |
|---|---|---|
| Metro `server/` blockList | ✅ | 선반영 완료 |
| common_server `apps`에 `jogak` 등록 | ❌ | `node tools/seed.ts jogak "조각"` |
| common_server SDK 복사 | ❌ | `client/` → `lib/common-server/` |
| **common_server Phase 7**(subjects·토큰) | ❌ | 로그인·문의·구독·백업 전부 여기 막힘 |
| **common_server Phase 9**(RevenueCat) | ❌ | 구독·광고제거 |
| 조각 서버(Next.js) 생성 | ❌ | **월 결제 착수 시** — 그전엔 만들지 않는다 |
| 조각 Supabase 프로젝트 | ❌ | **월 결제 착수 시**(2026-08-07 결정). Pro 조직 추가 시 $10/월 |

🚫 = 안 하기로 결정 / ⏸ = 보류 / ❌ = 미착수 / ✅ = 완료

---

## 3. 검증 루틴

```bash
npm install         # 의존성
npm run typecheck   # tsc --noEmit — 커밋 전 필수 통과
npm run lint        # eslint — 커밋 전 필수 통과
npm run format      # prettier --write (문서 *.md는 제외)
npm start           # Expo dev 서버 (같은 Wi-Fi + LAN)
npx expo start --tunnel   # LTE·방화벽 막힘 시 (느림)
npm run web         # 웹으로 빠르게 화면 확인
```

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
