import dayjs from 'dayjs';

/**
 * 조각의 날짜는 항상 'YYYY-MM-DD' 문자열이고 **기기 로컬 타임존 기준**이다(DIARY_SYSTEM §3).
 * Date 객체를 그대로 들고 다니면 타임존·시각이 섞여 캘린더가 하루씩 어긋난다 —
 * 날짜는 이 모듈을 통해서만 만든다.
 *
 * ⚠ dayjs에 파싱 포맷을 넘기려면 customParseFormat 플러그인이 필요하다. 플러그인 없이 넘기면
 * 인자가 조용히 무시된다. 'YYYY-MM-DD'는 dayjs가 기본으로 로컬 자정으로 파싱하므로
 * 포맷 인자를 아예 넘기지 않는다 — 플러그인 하나를 아끼고 오해의 소지를 없앤다.
 */
export const DATE_FORMAT = 'YYYY-MM-DD';

const ENTRY_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function today(): string {
  return dayjs().format(DATE_FORMAT);
}

export function toEntryDate(value: Date | string | number): string {
  return dayjs(value).format(DATE_FORMAT);
}

export function addDays(entryDate: string, days: number): string {
  return dayjs(entryDate).add(days, 'day').format(DATE_FORMAT);
}

export function addMonths(entryDate: string, months: number): string {
  return dayjs(entryDate).add(months, 'month').format(DATE_FORMAT);
}

export function startOfMonth(entryDate: string): string {
  return dayjs(entryDate).startOf('month').format(DATE_FORMAT);
}

export function daysInMonth(entryDate: string): number {
  return dayjs(entryDate).daysInMonth();
}

/** 요일 번호. 0 = 일요일 — 캘린더 격자의 빈 칸 수를 여기서 얻는다. */
export function weekdayIndex(entryDate: string): number {
  return dayjs(entryDate).day();
}

/**
 * 'YYYY-MM-DD'는 사전순 비교가 곧 시간순 비교라 문자열로 비교한다.
 * Date로 바꿔 비교하면 타임존·시각이 끼어들어 같은 날이 미래로 판정되는 사고가 난다.
 */
export function isAfterToday(entryDate: string): boolean {
  return entryDate > today();
}

/** 해당 월의 첫날·마지막날. 캘린더 범위 질의에 쓴다. */
export function monthRange(entryDate: string): { from: string; to: string } {
  const target = dayjs(entryDate);
  return {
    from: target.startOf('month').format(DATE_FORMAT),
    to: target.endOf('month').format(DATE_FORMAT),
  };
}

/** 'YYYY-MM-DD' 모양이면서 실재하는 날짜인지. (2026-02-30 같은 값을 걸러낸다) */
export function isValidEntryDate(value: string): boolean {
  if (!ENTRY_DATE_PATTERN.test(value)) {
    return false;
  }
  const parsed = dayjs(value);
  return parsed.isValid() && parsed.format(DATE_FORMAT) === value;
}
