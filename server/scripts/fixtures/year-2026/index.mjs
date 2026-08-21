/**
 * 1년치 일기를 하나로 모은다.
 *
 * ⚠ **주 배정을 여기서 하지 않는다.** 일기는 날짜만 갖고, 어느 주에 속하는지는
 *   `weekKeyRange()`(앱과 같은 함수)가 정한다 — 주 경계 규칙이 두 곳에 생기면
 *   시험이 앱과 어긋난다. 월 경계를 넘는 주(예: W36 = 8/31~9/6)도 그래서 자동으로 맞는다.
 */
import m01 from './01.mjs';
import m02 from './02.mjs';
import m03 from './03.mjs';
import m04 from './04.mjs';
import m05 from './05.mjs';
import m06 from './06.mjs';
import m07 from './07.mjs';
import m08 from './08.mjs';
import m09 from './09.mjs';
import m10 from './10.mjs';
import m11 from './11.mjs';
import m12 from './12.mjs';

/** 날짜 오름차순. `date`가 `YYYY-MM-DD`라 문자열 정렬로 충분하다 */
export const ENTRIES = [m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12]
  .flat()
  .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

export const YEAR = '2026';
