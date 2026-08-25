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
| [`NOTIFICATION_SYSTEM.md`](./NOTIFICATION_SYSTEM.md) | 기록 리마인더 — 로컬 알림·7일 롤링 창·권한·예약 언어 고착 | ✅ |
| [`PLAY_DATA_SAFETY.md`](./PLAY_DATA_SAFETY.md) | Play 데이터 보안 선언 — 일시처리·E2EE·공유 제외 원문 · 아웃바운드 전수표 · 확정 선언표(diff) · 삭제 경로 · **콘솔 클릭 체크리스트** | ✅ 2026-08-24 재검증 |
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
| **본문 텍스트 서식** | ✅ | 2026-08-24 — 문단마다 **정렬·크기(H1~H4/본문)·굵기·글자색**. 🔴 **색은 hex가 아니라 코드**(`rose`)로 저장하고 `theme/palettes.ts`의 `ink`가 테마별 실제 값을 준다 — hex로 저장하면 라이트에서 고른 색이 **다크에서 안 읽히고** 스킨을 갈아끼워도 옛 조각만 옛 색으로 남는다. 🚫 **글꼴 종류는 뺐다**(한글 폰트 굵기당 ~1.5MB · 나머지 14개 언어에서 조용히 폴백). `npm run check:diary-format` 21개. **에뮬레이터 실동작 확인**(2026-08-24, ⏭ 실기기는 v10부터 — dev 빌드가 스토어 서명과 충돌한다): 가운데 문단만 분할·저장 후 재열람·다크모드 색 반전·베트남어/독일어 시트. 🔴 그 과정에서 **서식보다 오래된 커서 버그**를 잡았다 — 프로그램이 블록을 쪼갤 때 RN이 쏘는 `onSelectionChange`가 커서를 앞 블록으로 끌어가 **사진을 연달아 넣으면 두 번째가 엉뚱한 자리**에 들어갔다([`DIARY_SYSTEM.md`](./DIARY_SYSTEM.md) §1.1) |
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
| 월 구독(RevenueCat) | ✅ | ~~Phase 9 대기~~ → ~~RC 상품 import·attach 남음~~ → **배선 완료**(2026-08-17). 운영·stg 두 앱 · Products → `pro` attach → 오퍼링 연결. 🔴 그 과정에서 **운영 앱도 Test Store 상품만 물고 있던 것**을 발견해 함께 고쳤다 — 결제해도 `pro`가 안 붙는 상태였다. 남은 것은 **실결제 확인**뿐([`MONETIZATION_SYSTEM.md`](./MONETIZATION_SYSTEM.md) §6.1.3) |
| **Play 서비스 계정 권한** | ✅ | 새 계정(`sonwheesung925`)에 서비스 계정 초대 + 앱/계정 권한. `npm run check:play-access`가 진단한다. ⚠ **앱 권한과 계정 권한이 여는 것이 다르다** — 카탈로그는 앱 권한, **구매 검증은 계정 권한** |
| 백업/복원 — 서버 | ✅ | ~~조각 서버 대기~~ → `jogak-stg`(서울) + Vercel(`icn1`) 배포. 위 두 줄과 합쳐 읽는다 |
| **AI 리포트 — 앱 쪽** | ✅ | 리포트 탭·상세·홈 카드·설정(리포트 언어)·DB v5·백업 포함. [`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) §11 |
| **AI 리포트 — 기간 선택(백필)** | ✅ | 2026-08-18 — 지평 **작년 1월 1일**까지 지난 기간을 고른다. 없을 땐 결제 직후 사용자가 첫 주들을 영영 잃었고, 1년 회고가 반쪽으로 굳었다([`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) §6.4) |
| **AI 리포트 — 삭제는 묘비** | ✅ | 2026-08-18 — DB v6 · `MANIFEST_FORMAT` 3. 하드 삭제가 **로컬과 서버 캡(`uq_ai_usage_period`)을 갈라놔** 지운 기간이 되살아난 것처럼 보이고 서버가 막았다([`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) §11.9). ⏭ 재설치·기기 2대는 서버 경로가 있어야 고쳐진다 |
| **AI 리포트 — 하위 완비 확인** | ✅ | 2026-08-18 — 안 끝난 하위는 차단, 안 만든 하위는 확인. `canCreate`가 하위 **0개인지만** 봐서 2개짜리 월간이 영구히 굳던 버그(§6.5) |
| 🔴 **AI 리포트 — 서버 배포** | ✅ | **2026-08-18에야 실제로 배포됐다.** 그전까지 `POST /api/v1/ai/report`가 배포본에서 **404** — `@shared/*`가 `../features/*`를 가리켰는데 Vercel CLI는 `server/`만 올린다. 순수 계층을 `server/shared/`로 생성 복사(`npm run sync:shared` · `check:shared`)해서 풀었다. ⚠ 그전의 "성공" 기록은 전부 **localhost** 기준이다 |
| **AI 리포트 — 서버** | ⏸ | 라우트·벤더 경계·캡·`ai_usage` 구현 완료(`e2e:ai` 15개). ✅ **모델 실호출 확인**(2026-08-13, `AI_EFFORT=medium` 확정 · 원가가 계획의 1/4). ~~🔴 그런데 `/api/v1/ai/report`를 통과한 성공 경로는 0회~~ → **3회 있다**(2026-08-25 stg DB 실측): 로컬 2회(8/14 `prompt_ver=1` · 8/21 `v4`) + **배포본 1회**(8/19 · `real` subject · W33 · ko · src=4 · 1355/277). 🔴 **셋 다 지금 프롬프트가 아니다** — 현재 `PROMPT_VERSION = 6`이고 v6으로 만든 리포트는 **0건**. 그리고 `kind`가 전부 `weekly`다 — **월간·연간은 한 번도 실행된 적이 없다**([`AI_REPORT_SYSTEM.md`](./AI_REPORT_SYSTEM.md) §12) |
| **AI — 탈퇴 시 파기** | ✅ | 2026-08-24 — `POST /api/v1/ai/purge`. `DELETE_ACCOUNT` §3이 *"탈퇴하면 요약문·이용기록이 파기된다"* 고 **게시돼 있었는데 그 코드가 없었다**(`purgeVault`가 AI 테이블을 import조차 안 했다). 서버에 남는 것 중 **유일하게 사람이 읽을 수 있는 일기 파생물**이라 문장이 아니라 코드를 고쳤다. 탈퇴 흐름에 백업 파기와 같은 **차단형**으로 — 계정이 사라지면 지울 권한이 있는 사람이 없어진다. `e2e:ai` 15개(파기 4개 신규) |
| AI 리포트 — 동의 2종 | ✅ | §23 민감정보 · §28-8 국외이전. 체크박스 2개, 묶지 않는다 |
| AI 사업자 **연락처** | ✅ | 2026-08-19 — `OpenAI OpCo, LLC` · `US` · `dpo@openai.com`(`features/ai/vendor.ts`). 처리방침 15개 언어 반영 · `check:ai` 통과. ~~출시 차단~~ 해제 |
| AI 리포트 — 처리방침 | ✅ | 2026-08-13 — 리포트 90일 저장을 반영해 **15개 언어 재작성**(`check:legal` 378개). ⚠ 30일 시계는 **애초에 해당 없었다**(공개 사용자 0명, CLAUDE.md §12) |
| **계정 삭제 안내 — 다국어** | ✅ | 2026-08-17 — 영어 하나였던 것을 **15개 언어**로. Play 데이터 보안 선언에 등록된 URL이라 심사자가 직접 연다 |
| **Play 데이터 보안 선언** | 🔄 | 2026-08-24 — 값은 **확정**했다([`PLAY_DATA_SAFETY.md`](./PLAY_DATA_SAFETY.md) §3·§7): 2단계 `삭제 요청 = 예`로 변경 + 3단계 `사용자 ID`·`구매 내역`·`기타 사용자 제작 콘텐츠` **추가**. 기존 6개는 건드리지 않는다(과다 선언은 제재 대상이 아니다). 🚫 **사진은 선언하지 않는다** — Play의 E2EE 예외 원문(*"does not need to be disclosed"*)을 백업이 만족한다. ⏭ 남은 것은 **사용자가 콘솔에서 누르는 것뿐**이고, 처리방침이 먼저 맞아야 한다던 선행 조건은 아래 줄로 이미 해소됐다 |
| **탈퇴 ↔ AI 테이블 정합** | ✅ | 2026-08-24 발견 — 승격된 `PRIVACY §4`·`DELETE_ACCOUNT §3`이 *"탈퇴하면 AI 요약문과 이용 기록을 파기한다"* 고 적는데 **`deleteAccount()`가 `ai_reports`·`ai_usage`를 건드리지 않는다**(`purgeVault`는 import조차 안 한다). 요약문은 `subject_id`에 묶인 채 90일, `ai_usage`는 **영구**로 남는다. 백업 쪽은 *"계정보다 백업을 먼저"* 를 차단형으로까지 설계했는데 **AI 쪽에 그 대칭이 없다.** Play 배지 조건은 `or`이라 폼 블로커는 아니지만 **문안이 거짓**이었다. → **닫았다**(같은 날) — 위 `AI — 탈퇴 시 파기` 줄과 합쳐 읽는다([`PLAY_DATA_SAFETY.md`](./PLAY_DATA_SAFETY.md) §4.4) |
| **처리방침 승격** | ✅ | 2026-08-23 — `pending`(개정 예고) 둘을 **본문으로** 옮겼다. v8·v9에 백업·AI가 들어 있는데 본문이 여전히 *"일기를 서버로 보내지 않으며"* 라 **배포본과 고지가 어긋나 있었다.** `PRIVACY` 13개 절에 엮고 `DELETE_ACCOUNT`는 5→**6개 절**(§5 제목까지 교체) · 15개 언어. ⚠ **Play 데이터 보안 폼보다 먼저**다 — 폼이 "수집함"인데 링크된 방침이 "수집 안 함"이면 그 자리에서 어긋난다 |
| **이용약관** | ✅ | 2026-08-17 신규 — 한국어 정본 22조(`TERMS`) · 앱 화면 · `docs/terms.html` · 설정/구독 링크. ~~번역 14개 진행 중~~ → **완료**(2026-08-21 정정 — `check:legal` 378개가 *이용약관 14개 언어*를 세고 있었다. 이 줄만 🔄로 남아 **끝난 일이 남은 일로 보였다**). 근거는 전자상거래법 §13②([`MONETIZATION_SYSTEM.md`](./MONETIZATION_SYSTEM.md) §5.2) |
| **§13③ 미성년자 고지** | ✅ | 구독 동의 화면에 상시 표시. 나이를 모르므로 모두에게 보여주는 것이 유일한 이행 방법 |
| **§13⑥ 전환 동의** | ✅ | ~~미구현~~ → **이미 있었다**(2026-08-17 실측 정정). 시행령 §20조의2의 **전환 전 30일** 창도 충족(체험 7일) |
| **기록 리마인더(로컬 알림)** | ✅ | 2026-08-21 — `features/notification/`. **에뮬레이터 실동작 확인**: 예약 7건 → 오늘 저장 시 **오늘 것만 취소**(6건) → 시각 변경 시 전체 재예약 → 토글 OFF 시 0건. `npm run check:notification` 12개. 🔴 `expo-notifications`가 권한을 **13→37**로 늘려 21개를 걷어냈고, **걷어낸 뒤에도 앱이 뜬다**([`NOTIFICATION_SYSTEM.md`](./NOTIFICATION_SYSTEM.md) §5·§8) |
| **업로드 서명 config plugin** | ✅ | 2026-08-21 — `plugins/with-upload-signing.js`. v8은 `android/`를 **손으로 고쳐** 구웠는데 `prebuild`가 그걸 날린다. 알림이 정확히 그 경우였다 |
| ESLint · Prettier | ✅ | ESLint 9 flat config + eslint-config-expo@10. `any` 금지를 린트로 강제 |
| EAS 빌드 설정 | ✅ | 2026-08-13 정정 — `eas.json`(internal·production). v7 AAB를 `eas submit`으로 올렸다([`MONETIZATION_SYSTEM.md`](./MONETIZATION_SYSTEM.md) §6.1) |

### 비공개 테스트 (2026-08-20 제출 · 검토 중)

**데이터 보안 선언 저장 완료(2026-08-24)** — `사용자 ID`·`구매 내역`·`기타 사용자 제작 콘텐츠` 3개 추가. `사진`은 E2EE 예외로 선언하지 않았다. 🔴 §7 체크리스트의 *"삭제 요청 → 예"* 는 **콘솔 질문을 잘못 짚은 것**이었다 — 실제 질문은 *"계정을 삭제하지 않고도"* 부분 삭제(선택사항)이고 전용 URL을 요구한다([`PLAY_DATA_SAFETY.md`](./PLAY_DATA_SAFETY.md) §7). ✅ **검토 전송도 끝났다** — 기다릴 필요가 없었다. 저장하자 **혼자 제출·출시**됐다(제출 3 · 8/24 21:57 → 22:07). 관리형 게시가 꺼져 있으면 폼 저장이 곧 게시다.

~~v10 업로드 완료(2026-08-24)~~ → **v11로 대체** — 본문 텍스트 서식 · 필수 env 3개 복구(v9는 백업·AI·결제가 전부 죽어 있었다). alpha 트랙에 `draft`로 들어갔고 테스터가 받던 v9는 그대로다. v10 은 파기 코드 이전 빌드라(14:02 빌드 · 18:58 커밋) **v11 로 다시 구워 올렸다** — AI 파기가 들어갔고 조각 서버에도 배포·검증(401)이 끝났다. ✅ **2026-08-25 검토 전송 완료** — 출시 노트(ko-KR 1개) 기입 → 게시 개요 제출 → 트랙이 `검토 중`. 테스터가 받던 v9 는 `제공됨` 그대로다. 업로드 권한은 켰다 껐다([`MONETIZATION_SYSTEM.md`](./MONETIZATION_SYSTEM.md) §6.1.4).

운영 앱에서 **12명 · 14일** 요건을 채우는 중이다. versionCode 8 · 테스터 43명 · 대한민국.
상세는 [`MONETIZATION_SYSTEM.md`](./MONETIZATION_SYSTEM.md) §6.1.9, 트랙별 국가는 `CLAUDE.md` §9.1.

| 오늘 배운 것 | |
|---|---|
| 🔴 스토어 등록정보 | **비공개 테스트에도 필수**다. 프로덕션 전용이 아니다 |
| 🔴 트랙 국가 기본값 | *프로덕션과 동기화* = **활성 0개** — 그대로 두면 아무도 설치 못 한다 |
| 🔴 청구 통화 | 우리 가격이 아니라 **구매자 계정**을 따른다(§6.1.10). 요금제를 건드리면 안 된다 |
| 🟡 콘솔 이미지 업로드 | OS 창 없이 된다(`common/PLAY_RELEASE_AUTOMATION.md` §5.10) |

### ⚠ 출시 전에 반드시 처리할 것

| 항목 | 내용 |
|---|---|
| ~~Lucide 번들 비대~~ | ✅ **해소.** 2026-08-21 실측 — `from 'lucide-react-native'` 형태의 import가 **0건**이고 전부 `lucide-react-native/icons/<name>` 개별 경로다. 이 줄이 남아 **끝난 일이 출시 블로커로 보였다** |
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
| **운영 콘솔** `/ops-7c1d94` | ✅ | 2026-08-13 — 대시보드·AI 사용량·**리포트 품질**·백업 금고·정리 5탭. **읽기 전용 · 개인 비특정**. `npm run check:admin` 23개. [`ADMIN_SYSTEM.md`](./ADMIN_SYSTEM.md) |
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
npm run check:legal            # 378개 — 절·줄 수 + **정본 지문**(문구만 바뀐 드리프트 방어).
                               #   처리방침·계정 삭제 안내·이용약관 × 14개 언어
npm run legal:stamp --check    # 지금 어긋난 언어만 본다. <lang>을 주면 다시 읽은 뒤 도장을 찍는다

# 백업을 건드렸으면
npm run check:backup-crypto    # 46개 — KAT(RFC 5869·XChaCha) + 봉투·매니페스트·전체 경로
npm run check:i18n-roundtrip   # 54개 — 25개 스크립트의 UTF-8·매니페스트 왕복

# 구독·AI를 건드렸으면
npm run check:subscription     # 31개 — 체험 기간 계산(§13⑥ 고지의 근거) + **스토어 상태 전이**
                               #   ⚠ 전이 검사는 2026-08-19에 생겼다. 그전엔 0개였다(MONETIZATION §6.1.7 #2)
npm run check:timezone         # 🔴 7개 지역 — 기간 계산이 기기 시간대에 흔들리지 않는가
                               #   같은 단언을 TZ별 자식 프로세스로 돌린다(TZ는 시작 시점에만 읽힌다)
                               #   ⚠ 한국(UTC+9)에서는 이 버그가 절대 안 보인다 — 미주에서만 깨졌다
npm run check:ai               # 79개 — ISO 주차·주차↔날짜범위 왕복·프롬프트·인젝션 방어·스키마·동의
                               #   + 백필 지평·하위 완비(15개)
                               #   ⚠ 순수 계층이다. 프롬프트가 **실제로 어떤 글을 쓰는지**는 못 본다
                               #      → 그건 verify:hierarchy (아래, 돈이 나간다)

# 알림을 건드렸으면
npm run check:notification     # 12개 — 예약 날짜 계산(이미 쓴 날 제외·지난 시각 제외·달/해 경계)
                               #   ⚠ 순수 계층만이다. 실제 발사·권한·재부팅 생존은 실기기에서만 안다

# 본문 서식·블록을 건드렸으면
npm run check:diary-format     # 21개 — 저장 형태(기본값 미저장)·**서식이 다르면 병합 금지**·
                               #   문단 분할·커서 이동·읽기 시 모르는 값 세척
                               #   ⚠ 병합 검사가 핵심이다. 이게 없으면 화면에서는 멀쩡히 보이다가
                               #     저장하고 다시 열었을 때 서식이 사라진다

# 릴리스 AAB를 굽기 전 (로컬·EAS 둘 다)
eval "$(node scripts/release-env.mjs production)"   # 프로필 env를 셸로. 손으로 적지 않는다
npm run check:release-env      # 금지 플래그 + **필수 값 4개** + eas.json store 프로필
                               #   ⚠ v8·v9가 필수 값 3개를 빠뜨린 채 나갔다(MONETIZATION §6.1.4)
                               #   광고는 막지 않고 어느 단위로 나가는지만 찍는다

# 운영 콘솔을 건드렸으면
npm run check:admin            # 23개 — **fail-closed** · 헤더 판정 · KST 집계 창 · 원가 추정

# API 키가 있을 때만 (실제 과금이 발생한다)
cd server && npm run measure:ai   # P1 — 한국어 토큰·모델 비교·effort 스윕·refusal

# 프롬프트를 고쳤으면 — 계층 요약 실호출 (6회 · 약 ₩6)
#   AUTH_STUB=1 npm run dev 를 먼저 띄운다. AI_SPEND=1 없이는 돌지 않는다
cd server && AI_SPEND=1 npm run verify:hierarchy
#   주간 4(더미 일기) → 월간(그 4개의 진짜 요약문) → 연간(합성 월간 12).
#   prompt_ver 기대값을 **소스에서 읽어** 대조하고, 끝나면 ai/purge 로 stg 를 치운다
#   🔴 순수 계층 검사가 못 보는 것을 본다 — v6 이 "이번 주"·"올해"라고 쓰던 것을 여기서 잡았다

# 검사를 늘렸으면 / 릴리스 전 (검사 6개를 실제로 돌려 2~3분)
npm run check:doc-counts       # 문서에 박힌 "N개"가 실제와 같은가
                               #   ⚠ 개수가 스크립트와 문서 두 곳에 산다. 2026-08-20에 8군데가 낡아 있었다
                               #   🔴 e2e·e2e:ai 는 DB·dev 서버가 필요해 못 돌린다 → **선언된 검사 수를 센다**
                               #      (2026-08-24 추가). 안 보던 사이 e2e 9→32 · e2e:ai 7→15 로 낡아 있었다

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
npm run e2e          # 32개 — reserve→서명 URL PUT→commit→latest→다운로드
npm run e2e:ai       # 15개 — AI 게이트(인가·구독·빈입력·과대입력·캡·지평) + **탈퇴 파기 4개**.
                     #   모델을 부르지 않는다
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
