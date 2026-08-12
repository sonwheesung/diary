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
