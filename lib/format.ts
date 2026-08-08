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

/** 캘린더 헤더용 */
export function formatMonthLabel(entryDate: string): string {
  return translate('date.monthYear', parts(entryDate));
}

/** 목록 카드용 짧은 표기 */
export function formatShortDate(entryDate: string): string {
  const target = dayjs(entryDate);
  return translate('date.short', {
    month: target.month() + 1,
    day: String(target.date()).padStart(2, '0'),
  });
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
