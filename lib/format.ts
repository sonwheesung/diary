import dayjs from 'dayjs';

import { DATE_FORMAT } from './date';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** '2026년 8월 7일 (금)' — 상세·홈 상단용 */
export function formatFullDate(entryDate: string): string {
  const target = dayjs(entryDate);
  return `${target.year()}년 ${target.month() + 1}월 ${target.date()}일 (${WEEKDAYS[target.day()]})`;
}

/** '08' — 작성 화면 날짜의 큰 숫자 */
export function formatDayNumber(entryDate: string): string {
  return String(dayjs(entryDate).date()).padStart(2, '0');
}

/** '8월 2026 (금)' — 큰 숫자 옆에 붙는 나머지 */
export function formatMonthYearWeekday(entryDate: string): string {
  const target = dayjs(entryDate);
  return `${target.month() + 1}월 ${target.year()} (${WEEKDAYS[target.day()]})`;
}

/** '2026년 8월' — 캘린더 헤더용 */
export function formatMonthLabel(entryDate: string): string {
  const target = dayjs(entryDate);
  return `${target.year()}년 ${target.month() + 1}월`;
}

/** '8.07' — 목록 카드용 */
export function formatShortDate(entryDate: string): string {
  const target = dayjs(entryDate);
  return `${target.month() + 1}.${String(target.date()).padStart(2, '0')}`;
}

/**
 * '8월 8일 (토)' — 목록용. 지난 해의 조각이면 연도를 붙인다.
 *
 * 목록에서 날짜를 '오늘'·'어제'로만 보여주면 **며칠에 쓴 글인지 알 수 없다**.
 * 시간 감각(오늘/어제)은 [`relativeDayLabel`]이 따로 얹는다.
 */
export function formatListDate(entryDate: string): string {
  const target = dayjs(entryDate);
  const base = `${target.month() + 1}월 ${target.date()}일 (${WEEKDAYS[target.day()]})`;
  return target.year() === dayjs().year() ? base : `${target.year()}년 ${base}`;
}

/** 오늘·어제만 말로 알려준다. 그 이전은 날짜만으로 충분하다 */
export function relativeDayLabel(entryDate: string): string | null {
  if (entryDate === dayjs().format(DATE_FORMAT)) {
    return '오늘';
  }
  if (entryDate === dayjs().subtract(1, 'day').format(DATE_FORMAT)) {
    return '어제';
  }
  return null;
}

/** 목록 미리보기용 한 줄 요약. 줄바꿈을 공백으로 눕히고 길이를 자른다. */
export function previewText(plainText: string, maxLength = 60): string {
  const flat = plainText.replace(/\s+/g, ' ').trim();
  return flat.length > maxLength ? `${flat.slice(0, maxLength)}…` : flat;
}
