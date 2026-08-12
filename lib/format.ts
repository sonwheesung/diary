import dayjs from 'dayjs';

import { DATE_FORMAT } from './date';
import { translate } from './i18n';

/**
 * 날짜 표기는 **언어마다 순서가 다르다.**
 * "2026년 8월 8일"과 "August 8, 2026"은 조각을 갈아끼우는 것으로 안 된다 —
 * 그래서 조각을 넘기고 **문장 틀은 로케일 파일이 갖는다**(`date.*`).
 */

function weekdayLabel(target: dayjs.Dayjs): string {
  const names = translate('date.weekdays') as unknown as string[];
  return names[target.day()] ?? '';
}

function monthName(target: dayjs.Dayjs): string {
  // 영어처럼 달 이름을 쓰는 언어를 위해. 숫자만 쓰는 언어는 틀에서 {{month}}를 쓰면 된다.
  return target.locale('en').format('MMMM');
}

function parts(entryDate: string) {
  const target = dayjs(entryDate);
  return {
    year: target.year(),
    month: target.month() + 1,
    monthName: monthName(target),
    day: target.date(),
    weekday: weekdayLabel(target),
  };
}

/** 상세·홈 상단용 */
export function formatFullDate(entryDate: string): string {
  return translate('date.full', parts(entryDate));
}

/** 작성 화면 날짜의 큰 숫자 */
export function formatDayNumber(entryDate: string): string {
  return String(dayjs(entryDate).date()).padStart(2, '0');
}

/** 큰 숫자 옆에 붙는 나머지 */
export function formatMonthYearWeekday(entryDate: string): string {
  return translate('date.monthYearWeekday', parts(entryDate));
}

/**
 * 목록용. 지난 해의 조각이면 연도를 붙인다.
 *
 * 목록에서 날짜를 '오늘'·'어제'로만 보여주면 **며칠에 쓴 글인지 알 수 없다**.
 * 시간 감각(오늘/어제)은 [`relativeDayLabel`]이 따로 얹는다.
 */
export function formatListDate(entryDate: string): string {
  const target = dayjs(entryDate);
  const key = target.year() === dayjs().year() ? 'date.list' : 'date.listWithYear';
  return translate(key, parts(entryDate));
}

/**
 * 시각(ms)을 **연도까지 넣어** 적는다.
 *
 * 법적 고지(결제 전환일 등)에 쓴다 — 목록용 `formatListDate`는 올해면 연도를 빼는데,
 * "언제 돈이 나가는가"에서 연도를 빼면 안 된다.
 */
export function formatTimestampDate(ms: number): string {
  return translate('date.listWithYear', parts(dayjs(ms).format(DATE_FORMAT)));
}

/** 캘린더 헤더용 */
export function formatMonthLabel(entryDate: string): string {
  return translate('date.monthYear', parts(entryDate));
}

/**
 * 날짜 + 시각. "마지막 백업" 같은 **시점**을 보여줄 때 쓴다.
 *
 * ⚠ 다른 포맷터와 달리 `entryDate`(YYYY-MM-DD)가 아니라 **epoch ms**를 받는다 —
 *   조각은 날짜 단위지만 백업은 시각 단위라서다.
 */
export function formatDateTime(epochMs: number): string {
  const target = dayjs(epochMs);
  return translate('date.dateTime', {
    year: target.year(),
    month: target.month() + 1,
    monthName: monthName(target),
    day: target.date(),
    hour: String(target.hour()).padStart(2, '0'),
    minute: String(target.minute()).padStart(2, '0'),
  });
}

/** 목록 카드용 짧은 표기 */
export function formatShortDate(entryDate: string): string {
  const target = dayjs(entryDate);
  return translate('date.short', {
    month: target.month() + 1,
    day: String(target.date()).padStart(2, '0'),
  });
}

/**
 * 리포트 기간 표기 — `8월 10일 – 16일` · `7월 27일 – 8월 2일`.
 *
 * ⚠ **달을 넘는 주가 실제로 있다.** 같은 달이면 뒤쪽 달 이름을 빼고, 넘으면 둘 다 쓴다 —
 *   두 경우의 문장 틀이 언어마다 다르므로 키를 나눈다(§9.1 규칙 3).
 *
 * ~~"8월 둘째 주"~~ → **날짜 범위**(2026-08-12 결정). 서수는 세는 규칙이 언어마다 다르고
 * 달 경계에서 어색해진다(`8월 31일`부터인 주가 "8월 다섯째 주"가 된다).
 */
export function formatDateRange(from: string, to: string): string {
  const a = dayjs(from);
  const b = dayjs(to);
  const same = a.month() === b.month() && a.year() === b.year();
  return translate(same ? 'date.range' : 'date.rangeCrossMonth', {
    fromMonth: a.month() + 1,
    fromMonthName: monthName(a),
    fromDay: a.date(),
    toMonth: b.month() + 1,
    toMonthName: monthName(b),
    toDay: b.date(),
  });
}

/**
 * `2026년 33주` — 목록의 부제.
 *
 * ⏭ 사람이 주차로 회상하지는 않지만 **진단용 식별자**다. 조각은 원격 관측이 0이라
 *   화면에 식별자를 띄우는 규약이 이미 있다(백업 오류 코드). 저장값 `2026-W33`과 1:1이라
 *   문의가 오면 "몇 주차인가요"로 바로 특정된다.
 */
export function formatWeekNumber(periodKey: string): string {
  const [year, week] = periodKey.split('-W');
  return translate('date.weekNumber', { year, week: Number(week) });
}

/**
 * `2026년 8월` / `August 2026` — periodKey(`2026-08`)에서.
 *
 * ⚠ `monthName`을 빈 문자열로 넘기면 안 된다 — en·de의 틀이 `{{monthName}} {{year}}`라
 *   " 2026"이 된다. 숫자만 쓰는 언어와 이름을 쓰는 언어가 섞여 있으므로 **둘 다 넘긴다.**
 */
export function formatPeriodMonth(periodKey: string): string {
  const target = dayjs(`${periodKey}-01`);
  return translate('date.monthYear', {
    year: target.year(),
    month: target.month() + 1,
    monthName: monthName(target),
  });
}

/** `2026년` */
export function formatPeriodYear(periodKey: string): string {
  return translate('date.yearOnly', { year: periodKey });
}

/** 오늘·어제만 말로 알려준다. 그 이전은 날짜만으로 충분하다 */
export function relativeDayLabel(entryDate: string): string | null {
  if (entryDate === dayjs().format(DATE_FORMAT)) {
    return translate('common.today');
  }
  if (entryDate === dayjs().subtract(1, 'day').format(DATE_FORMAT)) {
    return translate('common.yesterday');
  }
  return null;
}

/** 목록 미리보기용 한 줄 요약. 줄바꿈을 공백으로 눕히고 길이를 자른다. */
export function previewText(plainText: string, maxLength = 60): string {
  const flat = plainText.replace(/\s+/g, ' ').trim();
  return flat.length > maxLength ? `${flat.slice(0, maxLength)}…` : flat;
}
