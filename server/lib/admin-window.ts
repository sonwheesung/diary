/**
 * 운영 콘솔의 집계 창 — **주 · 월 · 연** (`docs/ADMIN_SYSTEM.md`).
 *
 * 경계는 앱의 리포트 기간과 같은 규칙이다(2026-08-13 사용자 확인):
 *   주 = **월요일 00시** · 월 = **매월 1일** · 연 = **매년 1월 1일**
 *
 * 🔴 **KST 기준이다.** 배구가 UTC로 짰다가 실측 9시간 밀림을 겪고 KST로 고쳤다
 *   (`BACKEND_SYSTEM` §13.15 시간대 정정). 운영자가 한국에서 보는 화면이라 KST가 맞다.
 *
 * ⚠ 그래서 `ai_usage.day`(UTC 문자열)를 쓰지 않고 `created_at`(timestamptz)으로 센다.
 *   `day` 컬럼은 **일일 폭주 캡** 전용이고, 그건 기기 시간대 조작을 막으려고 일부러 UTC다.
 *   두 축은 목적이 달라 일치시키지 않는다 — 합치면 캡이 시간대에 흔들린다.
 */

export type Granularity = 'week' | 'month' | 'year';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** KST 벽시계로 본 연·월·일. UTC 순간을 9시간 밀어 UTC 게터로 읽는 관용구다. */
function kstParts(at: Date): { year: number; month: number; day: number; dow: number } {
  const shifted = new Date(at.getTime() + KST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    // getUTCDay(): 일=0 … 토=6 → ISO: 월=1 … 일=7
    dow: shifted.getUTCDay() || 7,
  };
}

/** KST 벽시계 자정에 해당하는 **UTC 순간**. DB의 timestamptz와 직접 비교할 수 있다. */
function kstMidnightUtc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day) - KST_OFFSET_MS);
}

/**
 * 집계 창의 시작 시각(UTC 순간).
 *
 * ⚠ 끝을 돌려주지 않는다 — 끝은 항상 "지금"이다. 진행 중인 창을 보는 화면이라
 *   닫힌 구간을 만들면 오늘 것이 안 보인다.
 */
export function windowStart(granularity: Granularity, now: Date = new Date()): Date {
  const { year, month, day, dow } = kstParts(now);
  if (granularity === 'week') {
    // 이번 주 월요일 00:00 KST
    return kstMidnightUtc(year, month, day - (dow - 1));
  }
  if (granularity === 'month') {
    return kstMidnightUtc(year, month, 1);
  }
  return kstMidnightUtc(year, 0, 1);
}

/**
 * 오늘로 끝나는 KST 날짜 키 `count`개 (`YYYY-MM-DD`, 오름차순).
 *
 * 🔴 **빈 날을 채우려고 있는 함수다.** DB는 호출이 있는 날만 돌려주는데, 그걸 그대로
 *   막대로 그리면 8/4·8/8·8/12가 **연속된 날처럼 붙어** 사용량이 일정해 보인다.
 *   "일별 추이"라는 제목이 거짓이 되는 자리다(2026-08-13 화면에서 발견).
 */
export function kstDayKeys(count: number, now: Date = new Date()): string[] {
  const { year, month, day } = kstParts(now);
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    // Date.UTC가 음수 day를 알아서 이전 달로 넘겨준다 — 달 길이를 직접 세지 않는다
    const at = new Date(Date.UTC(year, month, day - i));
    const mm = String(at.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(at.getUTCDate()).padStart(2, '0');
    keys.push(`${at.getUTCFullYear()}-${mm}-${dd}`);
  }
  return keys;
}

/** 화면에 적을 창 라벨 — `2026-08-10 ~` 처럼 시작일만 준다(끝은 '지금'이다). */
export function windowLabel(granularity: Granularity, now: Date = new Date()): string {
  const start = windowStart(granularity, now);
  const { year, month, day } = kstParts(start);
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}
