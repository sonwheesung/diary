/**
 * 리마인더 예약 계산 검사 — `node scripts/check-notification.mjs`
 *
 * 여기서 보는 것은 **"어느 날짜에 알림을 걸 것인가"** 하나다.
 * 화면으로는 알 수 없다 — 잘못 걸린 알림은 **내일 밤 9시에야** 드러나고,
 * 가장 흔한 오류(이미 쓴 날에 보내기·지난 시각으로 예약하기)는 그때 사용자만 겪는다.
 *
 * 설계는 [`docs/NOTIFICATION_SYSTEM.md`](../docs/NOTIFICATION_SYSTEM.md) §3.
 */
import {
  DEFAULT_REMINDER_TIME,
  REMINDER_WINDOW_DAYS,
  entryDateFromReminderId,
  formatReminderTime,
  parseReminderTime,
  planReminderDates,
  reminderIdFor,
} from '../features/notification/reminder-schedule.ts';

let passed = 0;
const failures = [];

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures.push(`${name}\n       ${error.message}`);
    console.log(`  FAIL ${name}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function eq(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  assert(a === e, `${label}: ${a} ≠ ${e}`);
}

const AT_21 = { hour: 21, minute: 0 };
/** 아침 8시 = 480분. 21:00은 아직 안 지났다 */
const MORNING = 8 * 60;
/** 밤 10시 = 1320분. 21:00은 지났다 */
const NIGHT = 22 * 60;

/* ── 시각 파싱 ─────────────────────────────────────────────── */

check('기본 시각이 파싱된다 — 상수와 파서가 어긋나면 앱이 기본값 없이 뜬다', () => {
  eq(parseReminderTime(DEFAULT_REMINDER_TIME), AT_21, 'DEFAULT_REMINDER_TIME');
});

check('왕복한다 — 저장한 값을 그대로 다시 읽는다', () => {
  for (const t of [
    { hour: 0, minute: 0 },
    { hour: 9, minute: 5 },
    { hour: 23, minute: 55 },
  ]) {
    eq(parseReminderTime(formatReminderTime(t)), t, `왕복 ${t.hour}:${t.minute}`);
  }
});

check('깨진 값은 null이다 — 부르는 쪽이 기본값으로 떨어져야 한다', () => {
  for (const bad of [null, undefined, '', '9', '9:5', '24:00', '21:60', '-1:00', 'abc', '21:00:00']) {
    assert(parseReminderTime(bad) === null, `${JSON.stringify(bad)}이 null이 아니다`);
  }
});

check('식별자가 왕복한다 — 날짜를 못 꺼내면 그날 것만 지울 수 없다', () => {
  eq(entryDateFromReminderId(reminderIdFor('2026-08-25')), '2026-08-25', '왕복');
  assert(entryDateFromReminderId('other-app-thing') === null, '남의 알림을 우리 것으로 봤다');
});

/* ── 예약 날짜 계산 ────────────────────────────────────────── */

check('아무것도 안 썼으면 창 전체를 건다', () => {
  const dates = planReminderDates({
    today: '2026-08-21',
    nowMinutes: MORNING,
    time: AT_21,
    writtenDates: [],
  });
  assert(dates.length === REMINDER_WINDOW_DAYS, `${dates.length}건 (창=${REMINDER_WINDOW_DAYS})`);
  eq(dates[0], '2026-08-21', '첫날');
  eq(dates.at(-1), '2026-08-27', '마지막날');
});

check('🔴 이미 쓴 날에는 걸지 않는다 — 이 기능의 유일한 요구다', () => {
  const dates = planReminderDates({
    today: '2026-08-21',
    nowMinutes: MORNING,
    time: AT_21,
    writtenDates: ['2026-08-21', '2026-08-24'],
  });
  assert(!dates.includes('2026-08-21'), '오늘 썼는데 오늘 알림이 걸렸다');
  assert(!dates.includes('2026-08-24'), '쓴 날에 알림이 걸렸다');
  assert(dates.length === REMINDER_WINDOW_DAYS - 2, `${dates.length}건`);
});

check('🔴 시각이 지났으면 오늘은 뺀다 — 지난 시각 예약은 즉시 쏘거나 조용히 버려진다', () => {
  const dates = planReminderDates({
    today: '2026-08-21',
    nowMinutes: NIGHT,
    time: AT_21,
    writtenDates: [],
  });
  assert(!dates.includes('2026-08-21'), '지난 시각인데 오늘이 들어갔다');
  eq(dates[0], '2026-08-22', '내일부터여야 한다');
  assert(dates.length === REMINDER_WINDOW_DAYS - 1, `${dates.length}건`);
});

check('정확히 그 시각이면 오늘은 뺀다 — 경계에서 중복 발사를 만들지 않는다', () => {
  const dates = planReminderDates({
    today: '2026-08-21',
    nowMinutes: 21 * 60,
    time: AT_21,
    writtenDates: [],
  });
  assert(!dates.includes('2026-08-21'), '같은 분인데 오늘이 들어갔다');
});

check('1분 전이면 오늘도 건다 — 과하게 잘라내지 않는다', () => {
  const dates = planReminderDates({
    today: '2026-08-21',
    nowMinutes: 21 * 60 - 1,
    time: AT_21,
    writtenDates: [],
  });
  eq(dates[0], '2026-08-21', '1분 남았는데 오늘이 빠졌다');
});

check('달·해 경계를 넘는다 — 8/31, 12/31에서 날짜가 깨지지 않는다', () => {
  eq(
    planReminderDates({
      today: '2026-08-29',
      nowMinutes: MORNING,
      time: AT_21,
      writtenDates: [],
    }),
    ['2026-08-29', '2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04'],
    '월 경계',
  );
  eq(
    planReminderDates({
      today: '2026-12-30',
      nowMinutes: MORNING,
      time: AT_21,
      writtenDates: [],
      days: 3,
    }),
    ['2026-12-30', '2026-12-31', '2027-01-01'],
    '해 경계',
  );
});

check('창 전체를 썼으면 아무것도 안 건다 — 빈 배열이지 예외가 아니다', () => {
  const written = [
    '2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24',
    '2026-08-25', '2026-08-26', '2026-08-27',
  ];
  eq(planReminderDates({ today: '2026-08-21', nowMinutes: MORNING, time: AT_21, writtenDates: written }), [], '전부 씀');
});

check('자정 알림도 오늘부터 건다 — 00:00이 "지난 시각"으로 잘리지 않는다', () => {
  const dates = planReminderDates({
    today: '2026-08-21',
    nowMinutes: 0,
    time: { hour: 0, minute: 0 },
    writtenDates: [],
  });
  eq(dates[0], '2026-08-22', '00:00 정각은 지난 것으로 본다');
});

/* ── 보고 ─────────────────────────────────────────────────── */

console.log('');
if (failures.length > 0) {
  for (const f of failures) console.log(`  🔴 ${f}`);
  console.log(`\n알림 검사 실패 — ${failures.length}건\n`);
  process.exit(1);
}
console.log(`알림 예약 ${passed}개 검사 통과\n`);
