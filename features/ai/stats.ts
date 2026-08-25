/**
 * 리포트의 "그 기간의 모양" — **순수 계층.** 프로젝트 내부 임포트는 `./period.ts` 하나뿐이다.
 *
 * 설계 정본: `docs/AI_REPORT_SYSTEM.md` §8.3
 *
 * ## 왜 앱이 세나 — 모델에 맡기지 않는 이유
 *
 * 요일별 감정·글자 수·조각 수는 **이미 기기 로컬에 있다.** 모델을 부르면 돈이 나가고,
 * 세는 일에서는 모델이 오히려 부정확하다(2026-08-25 실측: `관계 3일`인데 근거는 2일이었다).
 *
 * 🔴 그리고 결정적인 것은 **소급이다.** 모델이 만든 지표는 기간 캡이 평생 1번이라
 *   이미 만든 리포트에 **영원히 못 붙는다.** 여기서 세는 것은 화면이 그릴 때 계산하므로
 *   **어제 만든 리포트에도 오늘 붙는다.** 그래서 이 층을 먼저 붙인다.
 *
 * ⚠ 여기 있는 값은 **리포트에 저장하지 않는다.** 조각을 나중에 고치면 저장해 둔 표가 낡는다.
 *   백업 용량도 는다. 화면이 그릴 때마다 로컬에서 다시 센다.
 */
import {
  eachDay,
  keyRange,
  monthKey,
  monthKeysInYear,
  weekKey,
  weekKeysInMonth,
} from './period.ts';
import type { ReportKind } from './types.ts';

const DAY_MS = 86_400_000;

/**
 * 화면이 로컬 DB에서 뽑아 넘기는 최소 정보.
 *
 * ⚠ **본문을 넘기지 않는다.** 길이만 있으면 된다 — 순수 계층에 일기 평문을 들이면
 *   검사 스크립트·로그에 본문이 섞여 들어갈 길이 열린다(`CLAUDE.md` §5.1-5와 같은 규율).
 */
export interface DayFact {
  /** `YYYY-MM-DD` */
  date: string;
  /** 감정 **코드**(`joy`). 문구가 아니다 */
  emotion: string | null;
  /** 본문 글자 수 */
  chars: number;
}

/** 주간 — 요일 한 칸 */
export interface DayCell {
  date: string;
  /** 월=0 … 일=6. 요일 라벨은 화면이 i18n으로 붙인다 */
  weekday: number;
  emotion: string | null;
  chars: number;
  /** 그날 조각을 썼는가. `chars === 0`과 같지 않다 — 사진만 있는 날이 있다 */
  written: boolean;
}

/** 월간·연간 — 하위 기간 한 칸 */
export interface BucketCell {
  /** `2026-W28` · `2026-07` */
  periodKey: string;
  count: number;
  chars: number;
  /** 그 칸에서 가장 많이 고른 감정. 없으면 `null` */
  topEmotion: string | null;
  /** 감정별 조각 수. 쌓은 막대를 그리는 데 쓴다 */
  byEmotion: Record<string, number>;
}

export interface Shape {
  /** 주간이면 7칸, 아니면 `null` */
  days: DayCell[] | null;
  /** 월간·연간이면 하위 기간, 아니면 `null` */
  buckets: BucketCell[] | null;
  count: number;
  chars: number;
  /** 그 기간에 하루라도 쓴 날 수 */
  writtenDays: number;
  /** 주간이면 7, 월간이면 그 달 날 수 … */
  totalDays: number;
}

/**
 * 그 기간의 모양을 센다.
 *
 * ⚠ `facts`에 **범위 밖 날짜가 섞여 있어도 무시한다.** 호출부가 범위로 질의하지만
 *   이 함수 혼자로도 옳아야 한다 — 순수 계층의 값어치가 거기에 있다.
 */
export function periodShape(kind: ReportKind, periodKey: string, facts: DayFact[]): Shape | null {
  const range = keyRange(periodKey);
  if (range === null) return null;

  const inRange = new Set(eachDay(range));
  const rows = facts.filter((f) => inRange.has(f.date));

  const count = rows.length;
  const chars = rows.reduce((a, f) => a + f.chars, 0);
  const writtenDays = new Set(rows.map((f) => f.date)).size;
  const totalDays = inRange.size;

  if (kind === 'weekly') {
    const byDate = new Map<string, DayFact[]>();
    for (const f of rows) {
      const list = byDate.get(f.date);
      if (list === undefined) byDate.set(f.date, [f]);
      else list.push(f);
    }
    const days = eachDay(range).map((date, i) => {
      const list = byDate.get(date) ?? [];
      return {
        date,
        weekday: i,
        // 하루에 여러 조각이면 첫 번째 감정을 쓴다 — 점은 하나이고 그 하루의 첫인상이 맞다
        emotion: list[0]?.emotion ?? null,
        chars: list.reduce((a, f) => a + f.chars, 0),
        written: list.length > 0,
      };
    });
    return { days, buckets: null, count, chars, writtenDays, totalDays };
  }

  const subKeys = kind === 'monthly' ? weekKeysInMonth(periodKey) : monthKeysInYear(periodKey);
  const keyOf = kind === 'monthly' ? weekKeyOfDate : monthKeyOfDate;

  const buckets = subKeys.map((key) => ({
    periodKey: key,
    count: 0,
    chars: 0,
    topEmotion: null as string | null,
    byEmotion: {} as Record<string, number>,
  }));
  const index = new Map(buckets.map((b, i) => [b.periodKey, i]));

  for (const f of rows) {
    const key = keyOf(f.date);
    const i = key === null ? undefined : index.get(key);
    /*
     * ⚠ 월간에서 **그 달 밖 주가 나올 수 있다.** `weekKeysInMonth('2026-07')`는 W28~W31인데
     *   7월 1일은 W27에 속한다 — 그 조각은 어느 칸에도 안 들어간다. 버리는 것이 맞다:
     *   리포트의 입력이 W28~W31 넷이므로 그림도 같은 넷이어야 한다.
     */
    if (i === undefined) continue;
    const b = buckets[i];
    if (b === undefined) continue;
    b.count += 1;
    b.chars += f.chars;
    if (f.emotion !== null) b.byEmotion[f.emotion] = (b.byEmotion[f.emotion] ?? 0) + 1;
  }

  for (const b of buckets) {
    let top: string | null = null;
    let best = 0;
    // 동점이면 먼저 나온 것 — 감정 순서는 `EMOTION_CODES_ORDER`가 아니라 등장 순서다.
    // 어느 쪽이든 자의적이라 **안정적인 쪽**을 고른다(같은 입력에 같은 답)
    for (const [code, n] of Object.entries(b.byEmotion)) {
      if (n > best) {
        best = n;
        top = code;
      }
    }
    b.topEmotion = top;
  }

  return { days: null, buckets, count, chars, writtenDays, totalDays };
}

/**
 * 바로 앞 기간의 키. 비교 막대를 그릴 때 쓴다(§8.4).
 *
 * ⚠ **지평(백필 하한)을 여기서 보지 않는다.** 이 함수는 *"앞 기간이 무엇인가"* 만 답하고,
 *   *"그 리포트가 있는가"* 는 호출부가 로컬에서 찾는다. 둘을 섞으면 지평을 바꿀 때
 *   비교 로직이 조용히 따라 움직인다.
 */
export function previousPeriodKey(kind: ReportKind, periodKey: string): string | null {
  /*
   * 월·연은 **정수 연산으로 끝난다.** Date를 거치면 시간대가 개입할 자리만 늘어난다.
   */
  if (kind === 'yearly') {
    const year = /^(\d{4})$/.exec(periodKey);
    return year === null ? null : String(Number(year[1]) - 1);
  }
  if (kind === 'monthly') {
    const m = /^(\d{4})-(\d{2})$/.exec(periodKey);
    if (m === null) return null;
    const month = Number(m[2]);
    if (month < 1 || month > 12) return null;
    return month === 1
      ? `${Number(m[1]) - 1}-12`
      : `${m[1]}-${String(month - 1).padStart(2, '0')}`;
  }

  const range = keyRange(periodKey);
  if (range === null) return null;
  const monday = atLocalNoon(range.from);
  if (monday === null) return null;
  return weekKey(new Date(monday.getTime() - 7 * DAY_MS));
}

/**
 * `YYYY-MM-DD` → 그 **로컬 달력일의 정오** Date.
 *
 * 🔴 `period.ts`의 `weekKey`·`monthKey`는 `getFullYear()` 같은 **로컬 getter**로 읽는다.
 *   그래서 `new Date('2026-07-01T00:00:00Z')`를 넘기면 UTC보다 뒤인 시간대(미주 등)에서
 *   **6월 30일로 읽혀** 기간 키가 하루 밀린다. 로컬 정오로 만들면 ±12시간이 남아
 *   서머타임 전환이 있는 날에도 날짜가 안 바뀐다.
 */
function atLocalNoon(date: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (m === null) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
}

function weekKeyOfDate(date: string): string | null {
  const d = atLocalNoon(date);
  return d === null ? null : weekKey(d);
}

function monthKeyOfDate(date: string): string | null {
  const d = atLocalNoon(date);
  return d === null ? null : monthKey(d);
}
