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

/** 로컬 달력일을 UTC 자정으로 정규화. 타임존이 섞이면 경계에서 하루가 밀린다 */
function utcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

/**
 * ISO 8601 주차 키 — `2026-W33`.
 *
 * 규칙: 주는 월요일에 시작하고, **1주차는 그 해 첫 목요일이 든 주**다.
 * 그래서 1월 1일이 금·토·일이면 전년도 마지막 주에 속한다 — `isoYear`가 달력 연도와 다를 수 있다.
 */
export function weekKey(d: Date): string {
  const date = utcMidnight(d);
  // getUTCDay(): 일=0 … 토=6 → ISO: 월=1 … 일=7
  const dayNum = date.getUTCDay() || 7;
  // 그 주의 목요일로 옮긴다. 목요일이 속한 해가 ISO 연도다
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const isoYear = date.getUTCFullYear();
  const jan1 = Date.UTC(isoYear, 0, 1);
  const week = Math.ceil(((date.getTime() - jan1) / DAY_MS + 1) / 7);
  return `${isoYear}-W${String(week).padStart(2, '0')}`;
}

/** `2026-08` */
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
  if (weekKey(monday) !== periodKey) return null;
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
  return monthKey(new Date(firstOfThisMonth.getTime() - DAY_MS));
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
