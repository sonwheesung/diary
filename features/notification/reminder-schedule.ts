/**
 * 리마인더 예약 계산 — **순수 계층**.
 *
 * expo-notifications도 DB도 부르지 않는다. "어느 날짜에 알림을 걸 것인가"만 정한다 —
 * 그래야 `scripts/check-notification.mjs`가 노드에서 그대로 돌릴 수 있다
 * (`server/shared/`·`features/subscription/trial.ts`와 같은 규약).
 *
 * ⚠ **프로젝트 내부 임포트 0** — `features/subscription/trial.ts`·`features/backup/policy.ts`와 같은 규약이다.
 *   그래서 날짜 덧셈도 여기서 직접 한다(`lib/date`를 부르지 않는다).
 *
 * 설계 근거는 [`docs/NOTIFICATION_SYSTEM.md`](../../docs/NOTIFICATION_SYSTEM.md) §3.
 */

/** 기본 알림 시각. 하루를 정리하는 시간대이면서, 자정을 넘겨 날짜가 바뀔 위험이 없다 */
export const DEFAULT_REMINDER_TIME = '21:00';

/**
 * 며칠치를 미리 잡아둘 것인가.
 *
 * 🔴 **1건만 잡으면 체인이 끊긴다.** 알림이 울린 뒤 앱을 안 열면 다음 것을 잡을 주체가 없는데,
 *   리마인더는 정확히 "앱을 안 여는 사람"을 위한 기능이라 그게 주 시나리오다.
 *   7일이면 일주일을 통째로 무시해도 살아남고, 그 이상 늘려도 얻는 것이 없다.
 */
export const REMINDER_WINDOW_DAYS = 7;

/** 알림 식별자 앞머리. 이 앞머리로 **우리 것만** 골라 지운다 */
export const REMINDER_ID_PREFIX = 'jogak-reminder-';

/**
 * `YYYY-MM-DD`에 날짜를 더한다.
 *
 * ⚠ **UTC로 계산한다.** 로컬 시각으로 더하면 서머타임 전환일에 하루가 사라지거나 겹친다 —
 *   여기서 다루는 것은 시각이 아니라 **달력 날짜**라 UTC 산술이 오히려 정확하다.
 *   (실제 발사 시각은 `syncReminders()`가 이 날짜에 로컬 시·분을 붙여 만든다.)
 */
export function shiftEntryDate(entryDate: string, days: number): string {
  const [y, m, d] = entryDate.split('-').map(Number);
  const at = new Date(Date.UTC(y, m - 1, d));
  at.setUTCDate(at.getUTCDate() + days);
  return at.toISOString().slice(0, 10);
}

export interface ReminderTime {
  hour: number;
  minute: number;
}

/** `"21:00"` → `{ hour: 21, minute: 0 }`. 못 읽으면 `null` — 부르는 쪽이 기본값으로 떨어진다 */
export function parseReminderTime(value: string | null | undefined): ReminderTime | null {
  if (typeof value !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (m === null) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function formatReminderTime({ hour, minute }: ReminderTime): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** 그 날짜의 알림 식별자. 날짜를 식별자에 담아야 **그날 것만** 지울 수 있다(§3) */
export function reminderIdFor(entryDate: string): string {
  return `${REMINDER_ID_PREFIX}${entryDate}`;
}

export function entryDateFromReminderId(identifier: string): string | null {
  if (!identifier.startsWith(REMINDER_ID_PREFIX)) return null;
  return identifier.slice(REMINDER_ID_PREFIX.length);
}

export interface PlanInput {
  /** 오늘(YYYY-MM-DD, 기기 로컬) */
  today: string;
  /** 지금이 오늘 몇 분째인가(`hour * 60 + minute`). 오늘 시각이 지났는지 판정에만 쓴다 */
  nowMinutes: number;
  time: ReminderTime;
  /** 이미 조각이 있는 날짜들. **여기 있는 날은 알림을 걸지 않는다**(§1) */
  writtenDates: readonly string[];
  days?: number;
}

/**
 * 알림을 걸 날짜 목록.
 *
 * ⚠ **오늘은 시각이 아직 안 지났을 때만** 넣는다. 지난 시각으로 예약하면 OS가 즉시 쏘거나
 *   조용히 버리는데, 둘 다 사용자가 이해할 수 없는 동작이다.
 */
export function planReminderDates({
  today,
  nowMinutes,
  time,
  writtenDates,
  days = REMINDER_WINDOW_DAYS,
}: PlanInput): string[] {
  const written = new Set(writtenDates);
  const atMinutes = time.hour * 60 + time.minute;
  const dates: string[] = [];

  for (let i = 0; i < days; i += 1) {
    const date = i === 0 ? today : shiftEntryDate(today, i);
    if (written.has(date)) continue;
    if (i === 0 && nowMinutes >= atMinutes) continue;
    dates.push(date);
  }
  return dates;
}
