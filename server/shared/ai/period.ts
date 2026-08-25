/* eslint-disable */
// ─────────────────────────────────────────────────────────────────────────
// 🔴 생성된 파일이다. 고치지 마라 — 원본은 `features/ai/period.ts`.
//
// `npm run sync:shared`가 만든다. 여기를 고치면 다음 sync가 말없이 덮는다.
// 왜 심볼릭 링크나 tsconfig paths가 아닌지는 `scripts/sync-shared.mjs` 참조
// (요약: Vercel CLI가 `server/`만 업로드해서 `../features`가 배포본에 없었다).
// ─────────────────────────────────────────────────────────────────────────
/**
 * 기간 키 — **순수 계층.** 프로젝트 내부 임포트 0.
 *
 * ⚠ `dayjs`의 `isoWeek` 플러그인을 쓰지 않는다. 플러그인을 하나 더 붙이는 것보다
 *   10줄을 직접 쓰고 **Node에서 검사하는 편**이 낫다 — ISO 주차는 연말연시에 어긋나기 쉽고,
 *   그 어긋남은 화면을 눈으로 봐서는 안 보인다.
 *
 * 🔴 **월요일 고정이다. locale을 따르지 않는다**(2026-08-12 결정, `docs/AI_REPORT_SYSTEM.md` §6.1).
 *   locale을 따르면 사용자가 앱 언어를 바꾼 순간 주 경계가 재산출돼 기간 키가 어긋나고,
 *   어떤 조각은 두 리포트에 들어가거나 어느 쪽에도 안 들어간다.
 */

const DAY_MS = 86_400_000;

/*
 * 🔴 **두 규약이 섞이면 미주에서 전부 깨진다** (2026-08-25 발견 · `npm run check:timezone`).
 *
 * 공개 함수(`weekKey`·`monthKey`·`yearKey`)는 **로컬 달력일**을 받는다 — 앱이 넘기는 것이
 * `new Date()`이기 때문이다. 반면 이 파일의 내부 계산은 `Date.UTC(...)`로 **UTC 자정 Date**를
 * 만든다. 그 UTC 값을 공개 함수에 도로 넘기면 UTC보다 뒤인 시간대에서 **하루 전**으로 읽혀
 * `weekKeyRange()`가 전부 `null`이 되고 `weekKeysInMonth()`·`creatableWeekKeys()`가 한 주 밀렸다.
 * `createReport()`가 `keyRange(...) === null`에서 `reason: 'error'`를 돌려주므로
 * **미주 사용자는 주간 리포트를 한 건도 못 만들었다.**
 *
 * → **UTC 자정 Date를 그대로 읽는 내부 함수를 따로 둔다.** 내부 계산은 이것만 쓴다.
 *   공개 함수는 로컬 → UTC 정규화를 한 번 거친 뒤 같은 코드를 탄다.
 */

/** 로컬 달력일을 UTC 자정으로 정규화. 타임존이 섞이면 경계에서 하루가 밀린다 */
function utcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

/** **이미 UTC 자정인 Date**의 ISO 주차. 로컬 getter를 다시 타지 않는다 */
function weekKeyOfUtc(utc: Date): string {
  const date = new Date(utc.getTime());
  // getUTCDay(): 일=0 … 토=6 → ISO: 월=1 … 일=7
  const dayNum = date.getUTCDay() || 7;
  // 그 주의 목요일로 옮긴다. 목요일이 속한 해가 ISO 연도다
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const isoYear = date.getUTCFullYear();
  const jan1 = Date.UTC(isoYear, 0, 1);
  const week = Math.ceil(((date.getTime() - jan1) / DAY_MS + 1) / 7);
  return `${isoYear}-W${String(week).padStart(2, '0')}`;
}

/** **이미 UTC 자정인 Date**의 달 키 */
function monthKeyOfUtc(utc: Date): string {
  return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * ISO 8601 주차 키 — `2026-W33`.
 *
 * 규칙: 주는 월요일에 시작하고, **1주차는 그 해 첫 목요일이 든 주**다.
 * 그래서 1월 1일이 금·토·일이면 전년도 마지막 주에 속한다 — `isoYear`가 달력 연도와 다를 수 있다.
 *
 * ⚠ **로컬 달력일**을 받는다. UTC로 만든 Date를 넘기지 마라 — 내부용은 `weekKeyOfUtc`다.
 */
export function weekKey(d: Date): string {
  return weekKeyOfUtc(utcMidnight(d));
}

/** `2026-08`. ⚠ **로컬 달력일**을 받는다 — 내부용은 `monthKeyOfUtc`다 */
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** `2026` */
export function yearKey(d: Date): string {
  return String(d.getFullYear());
}

/**
 * 그 주의 월요일과 일요일 (로컬 달력일, `YYYY-MM-DD`).
 *
 * 조각을 고르는 범위다. `diaries`의 날짜 컬럼과 **같은 형식**이어야 한다 —
 * 형식이 어긋나면 문자열 비교가 조용히 빗나가 리포트가 빈다.
 */
export function weekRange(d: Date): { from: string; to: string } {
  const base = utcMidnight(d);
  const dayNum = base.getUTCDay() || 7;
  const monday = new Date(base.getTime() - (dayNum - 1) * DAY_MS);
  const sunday = new Date(monday.getTime() + 6 * DAY_MS);
  return { from: ymd(monday), to: ymd(sunday) };
}

/** UTC 기준 `YYYY-MM-DD`. `utcMidnight`을 거친 값에만 쓴다 */
function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate(),
  ).padStart(2, '0')}`;
}

/**
 * "지난주"의 키. 홈 카드와 생성 버튼이 가리키는 기간이다.
 *
 * ⚠ **이번 주가 아니다.** 아직 안 끝난 주를 요약하면 목요일에 만든 리포트가
 *   그 주의 전부인 것처럼 남는다. 주가 닫힌 뒤에 돌아본다.
 */
export function lastWeekKey(now: Date): string {
  return weekKey(new Date(now.getTime() - 7 * DAY_MS));
}

/** 지난주의 날짜 범위 */
export function lastWeekRange(now: Date): { from: string; to: string } {
  return weekRange(new Date(now.getTime() - 7 * DAY_MS));
}

/**
 * 저장된 키(`2026-W33`)를 **다시 날짜 범위로** 편다.
 *
 * 화면이 주차가 아니라 `8월 10일 – 16일`을 보여주기로 했으므로(2026-08-12 사용자 결정)
 * 목록을 그릴 때마다 필요하다. `weekKey()`의 역함수이고, `check-ai.mjs`가 왕복을 검사한다.
 *
 * ⚠ 잘못된 키에는 **빈 범위 대신 null**을 준다. 빈 문자열을 주면 화면이 `– `만 그리는데,
 *   그건 고장 났다는 것보다 나쁘다(고장 난 줄 모른다).
 */
export function weekKeyRange(periodKey: string): { from: string; to: string } | null {
  const match = /^(\d{4})-W(\d{2})$/.exec(periodKey);
  if (match === null) return null;
  const isoYear = Number(match[1]);
  const week = Number(match[2]);
  if (week < 1 || week > 53) return null;

  // ISO 1주차는 1월 4일이 든 주다 — 정의상 항상 참이라 여기서 출발한다
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4.getTime() - (jan4Day - 1) * DAY_MS);
  const monday = new Date(week1Monday.getTime() + (week - 1) * 7 * DAY_MS);
  // 53주가 없는 해에 53을 물으면 다음 해로 넘어간다 — 그건 그 키가 존재하지 않는다는 뜻이다
  if (weekKeyOfUtc(monday) !== periodKey) return null;
  return { from: ymd(monday), to: ymd(new Date(monday.getTime() + 6 * DAY_MS)) };
}

/**
 * 범위 안의 날짜를 하루씩 편다 (`YYYY-MM-DD`, 오름차순).
 *
 * ⚠ 날짜 문자열을 더하지 않고 **UTC 밀리초로 걷는다.** 월말·윤년을 직접 세면 반드시 틀린다.
 */
export function eachDay(range: { from: string; to: string }): string[] {
  const start = Date.parse(`${range.from}T00:00:00Z`);
  const end = Date.parse(`${range.to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return [];
  const days: string[] = [];
  for (let t = start; t <= end; t += DAY_MS) {
    days.push(ymd(new Date(t)));
  }
  return days;
}

/**
 * 범위 안에서 **조각이 없는 날들** — 만들기 전 확인에 쓴다(`docs/AI_REPORT_SYSTEM.md` §10.1).
 *
 * ⚠ `present`에 범위 밖 날짜가 섞여 있어도 무시된다. 호출부가 이미 범위로 질의하지만
 *   이 함수 혼자로도 옳아야 한다 — 순수 계층의 값어치가 거기에 있다.
 */
export function missingDays(range: { from: string; to: string }, present: string[]): string[] {
  const have = new Set(present);
  return eachDay(range).filter((day) => !have.has(day));
}

/**
 * "지난달"의 키. 월간 리포트가 겨냥하는 기간이다.
 *
 * ⚠ 주간과 같은 이유로 **이번 달이 아니다.** 그리고 `setMonth(-1)`류로 하루를 빼지 않는다 —
 *   31일에 부르면 2월이 3월로 튄다. 그 달 1일을 잡고 하루 전으로 간다.
 */
export function lastMonthKey(now: Date): string {
  const firstOfThisMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  return monthKeyOfUtc(new Date(firstOfThisMonth.getTime() - DAY_MS));
}

/** `2026-08` → 그 달의 1일과 말일 */
export function monthKeyRange(periodKey: string): { from: string; to: string } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(periodKey);
  if (match === null) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  const first = new Date(Date.UTC(year, month - 1, 1));
  // 다음 달 1일에서 하루 전 = 말일. 윤년·30/31일을 직접 세지 않는다
  const last = new Date(Date.UTC(year, month, 1) - DAY_MS);
  return { from: ymd(first), to: ymd(last) };
}

/** "작년"의 키 */
export function lastYearKey(now: Date): string {
  return String(now.getFullYear() - 1);
}

/** `2026` → 1월 1일과 12월 31일 */
export function yearKeyRange(periodKey: string): { from: string; to: string } | null {
  if (!/^\d{4}$/.test(periodKey)) return null;
  const year = Number(periodKey);
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

/** 종류를 묻지 않고 키에서 범위를 편다 — 목록이 세 종류를 한 함수로 그린다 */
export function keyRange(periodKey: string): { from: string; to: string } | null {
  if (periodKey.includes('-W')) return weekKeyRange(periodKey);
  if (periodKey.includes('-')) return monthKeyRange(periodKey);
  return yearKeyRange(periodKey);
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * 백필 — 지난 기간도 만든다 (`docs/AI_REPORT_SYSTEM.md` §6.4)
 *
 * 여기까지의 `lastWeekKey`·`lastMonthKey`·`lastYearKey`는 **기본 선택값**으로 남는다.
 * 1탭 경로는 그대로다(기둥 1) — 아래 함수들이 여는 것은 *"다른 기간도 고를 수 있다"* 뿐이다.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** 오늘 (로컬 달력일, `YYYY-MM-DD`). 기간이 끝났는지 판정하는 기준선 */
function todayKey(now: Date): string {
  return ymd(utcMidnight(now));
}

/**
 * 백필의 **바닥** — `작년 1월 1일`.
 *
 * 🔴 **오늘로부터 1년(rolling 365일)이 아니다.** rolling이면 2027-03에 2026-01·02 월간이
 *   지평 밖으로 밀려나 **1·2월이 빠진 2026 연간**이 만들어진다 — 백필이 고치려던 바로 그 병이
 *   그대로 재발한다. 작년 1월 1일로 잡으면 **그 다음 해 아무 때나** 연간을 만들어도
 *   12개월이 전부 살아 있다.
 *
 * ⚠ 연말에는 지평이 거의 2년이 된다(2026-12-31 기준 2025-01-01). 의도한 것이다 —
 *   원가는 최악 ₩117이고 그건 한 달 실수령의 4%다(§6.4).
 */
export function backfillFloor(now: Date): string {
  return `${now.getFullYear() - 1}-01-01`;
}

/**
 * 이 기간이 **끝났는가.** 진행 중인 주·달·해는 만들지 않는다(§6.1과 같은 이유) —
 * 안 끝난 주를 요약하면 목요일에 만든 리포트가 그 주의 전부인 것처럼 남는다.
 */
export function isClosed(periodKey: string, now: Date): boolean {
  const range = keyRange(periodKey);
  return range !== null && range.to < todayKey(now);
}

/**
 * 이 기간을 만들 수 있게 되는 날 (`YYYY-MM-DD`) — 끝난 **다음 날**.
 *
 * 하위가 아직 안 끝나 상위를 막을 때, *"언제부터 되는지"* 를 말해주는 데 쓴다(§6.5).
 * 날짜 없이 *"나중에 다시 오세요"* 라고만 하면 사람은 매일 눌러본다.
 */
export function opensOn(periodKey: string): string | null {
  const range = keyRange(periodKey);
  if (range === null) return null;
  const end = Date.parse(`${range.to}T00:00:00Z`);
  return Number.isNaN(end) ? null : ymd(new Date(end + DAY_MS));
}

/** 안전판 — 지평이 어떤 이유로 깨져도 무한히 돌지 않는다. 2년치 주가 105개다 */
const MAX_PERIODS = 200;

/** 만들 수 있는 주 키들 — **최신 순**. 지난주부터 지평 바닥까지 */
export function creatableWeekKeys(now: Date): string[] {
  const floor = backfillFloor(now);
  const keys: string[] = [];
  let monday = Date.parse(`${lastWeekRange(now).from}T00:00:00Z`);
  if (Number.isNaN(monday)) return keys;
  while (keys.length < MAX_PERIODS) {
    const sunday = ymd(new Date(monday + 6 * DAY_MS));
    if (sunday < floor) break;
    keys.push(weekKeyOfUtc(new Date(monday)));
    monday -= 7 * DAY_MS;
  }
  return keys;
}

/** 만들 수 있는 달 키들 — **최신 순**. 지난달부터 지평 바닥까지 */
export function creatableMonthKeys(now: Date): string[] {
  const floor = backfillFloor(now);
  const keys: string[] = [];
  // 이번 달 1일에서 한 달씩 뒤로. 날짜를 빼지 않는다 — 31일에 빼면 2월이 3월로 튄다
  let year = now.getFullYear();
  let month = now.getMonth() - 1; // 0-based에서 한 달 뒤로 = 지난달
  while (keys.length < MAX_PERIODS) {
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const range = monthKeyRange(key);
    if (range === null || range.to < floor) break;
    keys.push(key);
    month -= 1;
  }
  return keys;
}

/**
 * 만들 수 있는 해 키들 — **최신 순**.
 *
 * ⚠ 지평이 `작년 1월 1일`이라 실제로는 **작년 하나**다. 그래도 목록으로 돌려준다 —
 *   화면이 세 종류를 같은 코드로 그리고, 지평을 넓히면 여기만 따라 넓어진다.
 */
export function creatableYearKeys(now: Date): string[] {
  const floor = backfillFloor(now);
  const keys: string[] = [];
  for (let year = now.getFullYear() - 1; keys.length < MAX_PERIODS; year -= 1) {
    if (`${year}-12-31` < floor) break;
    keys.push(String(year));
  }
  return keys;
}

/**
 * 그 달에 속하는 **주 키들** — 월간 리포트의 입력 집합.
 *
 * 🔴 **월요일이 든 달**로 센다. `weeksInMonth()`(report-service)가 `range.from`으로 거르는
 *   것과 **같은 규칙이어야 한다** — 어긋나면 "5개 중 2개"라고 경고해 놓고 실제로는 3개를
 *   넣는 식이 된다. 규칙이 두 곳에 있으면 반드시 갈라진다.
 *
 * ⚠ 그래서 8/31(월)에 시작하는 주는 대부분이 9월인데도 **8월 주**다.
 *   그 주가 9/7에야 만들어질 수 있다는 것이 §6.5의 차단이 필요한 이유다.
 */
export function weekKeysInMonth(monthKeyValue: string): string[] {
  const range = monthKeyRange(monthKeyValue);
  if (range === null) return [];
  const first = Date.parse(`${range.from}T00:00:00Z`);
  const last = Date.parse(`${range.to}T00:00:00Z`);
  // 그 달의 첫 월요일로 옮긴다
  const firstDay = new Date(first).getUTCDay() || 7;
  let monday = first + ((8 - firstDay) % 7) * DAY_MS;
  const keys: string[] = [];
  while (monday <= last && keys.length < MAX_PERIODS) {
    keys.push(weekKeyOfUtc(new Date(monday)));
    monday += 7 * DAY_MS;
  }
  return keys;
}

/** 그 해의 열두 달 키 — 연간 리포트의 입력 집합 */
export function monthKeysInYear(yearKeyValue: string): string[] {
  if (!/^\d{4}$/.test(yearKeyValue)) return [];
  return Array.from({ length: 12 }, (_, i) => `${yearKeyValue}-${String(i + 1).padStart(2, '0')}`);
}

/**
 * 🔴 **이 기간을 지금 만들 수 있는가** — 앱과 서버가 **같이 쓰는 단 하나의 판정**(§6.4).
 *
 * 서버도 이걸 본다(`server/app/api/v1/ai/report/route.ts`). 앱만 막으면 낡은 버전과 직접
 * 호출이 남고, 조건을 서버에 다시 쓰면 지평을 바꿀 때 한쪽만 고치게 된다.
 *
 * ⚠ 종류를 `ReportKind`로 받지 않고 **인라인 유니온**으로 받는다. `types.ts`를 임포트하면
 *   이 파일의 *"프로젝트 내부 임포트 0"* 이 깨지고, 그게 깨지면 서버가 이 파일을 못 쓴다.
 */
export function isCreatablePeriod(
  kind: 'weekly' | 'monthly' | 'yearly',
  periodKey: string,
  now: Date,
): boolean {
  const keys =
    kind === 'weekly'
      ? creatableWeekKeys(now)
      : kind === 'monthly'
        ? creatableMonthKeys(now)
        : creatableYearKeys(now);
  return keys.includes(periodKey);
}

/**
 * `YYYY-MM-DD` 하루가 어느 주에 속하는가 — 기간 시트가 조각을 주별로 담을 때 쓴다.
 *
 * ⚠ `new Date('2026-08-18')`로 파싱하지 않는다. 그건 **UTC 자정**으로 읽혀서
 *   UTC보다 뒤인 지역(미주)에서는 하루 전날이 되고, 그러면 월요일 조각이 지난 주로 샌다.
 */
export function weekKeyForYmd(day: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (match === null) return null;
  return weekKey(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}
