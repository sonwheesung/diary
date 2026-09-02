/**
 * 기간 계산이 **기기 시간대에 흔들리지 않는가** — `npm run check:timezone`
 *
 * ## 왜 있나 — 미주 사용자는 주간 리포트를 한 건도 못 만들었다 (2026-08-25 발견)
 *
 * `features/ai/period.ts`는 두 규약이 섞여 있었다:
 *   · `weekKey`·`monthKey`·`yearKey` — **로컬 getter**로 읽는다(`getFullYear()`)
 *   · 내부 계산 — `Date.UTC(...)`로 **UTC 자정 Date**를 만든다
 *
 * UTC보다 뒤인 시간대(미주)에서 UTC 자정을 로컬로 읽으면 **하루 전**이 된다. 그 결과:
 *
 * ```
 * TZ=America/New_York
 *   weekKeyRange('2026-W28')  →  null          ← 모든 주차가 null
 *   weekKeysInMonth('2026-07') →  W27~W30      ← 한 주 밀린다
 * ```
 *
 * `createReport()`가 `keyRange(...) === null`이면 `reason: 'error'`를 돌려주므로
 * **미주 사용자는 주간 리포트를 만들 수 없었다.** 화면에는 *"문제가 생겼어요"* 만 떴다.
 *
 * 🔴 **한국(UTC+9)에서는 절대 안 보인다.** 그래서 검사가 필요하다 —
 *   이 종류는 눈으로도, 단일 시간대 검사로도 안 잡힌다.
 *
 * ## 어떻게 잡나
 *
 * 같은 단언을 **여러 시간대에서 각각 자식 프로세스로** 돌린다. `TZ`는 프로세스 시작
 * 시점에만 읽히므로 한 프로세스 안에서 바꿔치기할 수 없다.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** UTC보다 앞선 곳·같은 곳·뒤인 곳을 모두 넣는다. 미주가 이 버그가 났던 자리다 */
const ZONES = [
  'Asia/Seoul', // UTC+9 — 우리가 개발하는 곳. 여기서는 버그가 안 보였다
  'UTC',
  'Europe/Lisbon', // UTC+0/+1
  'America/New_York', // UTC-4/-5 — 실제로 깨졌던 곳
  'America/Los_Angeles', // UTC-7/-8
  'Pacific/Honolulu', // UTC-10, 서머타임 없음
  'Pacific/Auckland', // UTC+12/+13 — 반대쪽 끝
];

const SELF = fileURLToPath(import.meta.url);

if (process.env.JOGAK_TZ_CHILD === '1') {
  await runAssertions();
} else {
  let failed = 0;
  /** 지역별로 자식이 보고한 단언 수. 서로 다르거나 0이면 그 자체가 실패다. */
  const ranPerZone = new Map();
  for (const tz of ZONES) {
    const res = spawnSync(
      process.execPath,
      ['--experimental-strip-types', '--no-warnings', SELF],
      { env: { ...process.env, TZ: tz, JOGAK_TZ_CHILD: '1' }, encoding: 'utf8' },
    );
    const out = `${res.stdout ?? ''}${res.stderr ?? ''}`.trim();
    if (res.status === 0) {
      console.log(`  ok   ${tz.padEnd(22)} ${out}`);
      const m = /\((\d+)개\)/.exec(out);
      ranPerZone.set(tz, m === null ? 0 : Number(m[1]));
    } else {
      failed += 1;
      console.log(`  FAIL ${tz.padEnd(22)}`);
      for (const line of out.split('\n')) console.log(`         ${line}`);
    }
  }
  if (failed > 0) {
    console.log(`\n시간대 검사 실패 — ${failed}개 지역\n`);
    process.exit(1);
  }

  /*
   * 🔴 **초록불이 "쟀다"는 뜻이 되게 한다.**
   * 종전에는 `ZONES.length` 를 그대로 개수로 찍어서, 자식의 단언이 전부 사라져도
   * "7개 검사 통과"가 똑같이 나왔다 — 세는 것이 지역 수이지 검사 수가 아니었다.
   * 이제 자식이 자기 단언 수를 보고하고, 여기서 ① 0이 아닌지 ② 지역마다 같은지 본다.
   *   ②가 필요한 이유: 시간대에 따라 분기하는 단언이 생기면 그건 이 가드가 잡으려는
   *   **바로 그 병**(기기 시간대에 흔들리는 계산)이므로, 조용히 넘기면 안 된다.
   */
  const counts = [...new Set(ranPerZone.values())];
  if (counts.length !== 1 || counts[0] === 0) {
    console.log(`\n시간대 검사 실패 — 지역별 단언 수가 다르거나 0이다: ${JSON.stringify([...ranPerZone])}\n`);
    process.exit(1);
  }
  const per = counts[0];
  console.log(`\n시간대 ok — ${ZONES.length * per}개 검사 통과 (지역 ${ZONES.length} × 단언 ${per})\n`);
}

async function runAssertions() {
  const P = await import('../features/ai/period.ts');
  const fail = [];
  let ran = 0;
  const eq = (actual, expected, what) => {
    ran += 1;
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) fail.push(`${what}: 기대 ${e}, 실제 ${a}`);
  };

  /*
   * 이 값들은 **달력이 정하는 것이라 시간대와 무관하다.**
   * 2026-W28 = 7월 6일(월) ~ 12일(일). 어느 나라에서 보든 같다.
   */
  eq(P.weekKeyRange('2026-W28'), { from: '2026-07-06', to: '2026-07-12' }, 'weekKeyRange(2026-W28)');
  eq(P.weekKeyRange('2026-W01'), { from: '2025-12-29', to: '2026-01-04' }, 'weekKeyRange(2026-W01)');
  eq(P.weekKeyRange('2026-W53'), { from: '2026-12-28', to: '2027-01-03' }, 'weekKeyRange(2026-W53)');
  eq(P.keyRange('2026-W28'), { from: '2026-07-06', to: '2026-07-12' }, 'keyRange(주차)');
  eq(P.keyRange('2026-07'), { from: '2026-07-01', to: '2026-07-31' }, 'keyRange(월)');
  eq(P.keyRange('2026'), { from: '2026-01-01', to: '2026-12-31' }, 'keyRange(연)');

  // 🔴 한 주 밀렸던 자리. 7/1은 W27이라 7월의 주는 W28부터다
  eq(P.weekKeysInMonth('2026-07'), ['2026-W28', '2026-W29', '2026-W30', '2026-W31'], 'weekKeysInMonth(2026-07)');
  eq(P.weekKeysInMonth('2026-02'), ['2026-W06', '2026-W07', '2026-W08', '2026-W09'], 'weekKeysInMonth(2026-02)');

  /*
   * `now`를 받는 함수들. **로컬 정오**로 만든다 — 앱이 넘기는 `new Date()`와 같은 성질이고,
   * ±12시간이 남아 서머타임 전환일에도 날짜가 안 밀린다.
   */
  const noon = (y, m, d) => new Date(y, m - 1, d, 12);

  eq(P.weekKey(noon(2026, 8, 25)), '2026-W35', 'weekKey(2026-08-25)');
  eq(P.lastWeekKey(noon(2026, 8, 25)), '2026-W34', 'lastWeekKey');
  eq(P.lastWeekRange(noon(2026, 8, 25)), { from: '2026-08-17', to: '2026-08-23' }, 'lastWeekRange');
  eq(P.monthKey(noon(2026, 7, 1)), '2026-07', 'monthKey(그 달 1일)');
  eq(P.lastMonthKey(noon(2026, 3, 1)), '2026-02', 'lastMonthKey(3월 1일)');
  eq(P.lastMonthKey(noon(2026, 1, 15)), '2025-12', 'lastMonthKey(해 넘김)');
  eq(P.yearKey(noon(2026, 1, 1)), '2026', 'yearKey(1월 1일)');
  eq(P.lastYearKey(noon(2026, 1, 1)), '2025', 'lastYearKey');

  // 백필 지평 — 여기가 흔들리면 만들 수 있는 기간 목록이 통째로 달라진다
  eq(P.backfillFloor(noon(2026, 8, 25)), '2025-01-01', 'backfillFloor');
  eq(P.creatableWeekKeys(noon(2026, 8, 25)).length, 86, 'creatableWeekKeys 개수');
  eq(P.creatableMonthKeys(noon(2026, 8, 25)).length, 19, 'creatableMonthKeys 개수');
  eq(P.creatableYearKeys(noon(2026, 8, 25)), ['2025'], 'creatableYearKeys');
  eq(P.isCreatablePeriod('weekly', '2026-W33', noon(2026, 8, 25)), true, 'isCreatablePeriod(끝난 주)');
  eq(P.isCreatablePeriod('weekly', '2026-W35', noon(2026, 8, 25)), false, 'isCreatablePeriod(진행 중인 주)');

  // 그 기간의 모양 — 요일 배치가 밀리면 감정 점이 엉뚱한 요일에 찍힌다
  const S = await import('../features/ai/stats.ts');
  const shape = S.periodShape('weekly', '2026-W28', [
    { date: '2026-07-06', emotion: 'tired', chars: 100 },
    { date: '2026-07-12', emotion: 'joy', chars: 50 },
  ]);
  eq(shape?.days?.[0]?.date, '2026-07-06', 'periodShape 첫 칸이 월요일');
  eq(shape?.days?.[0]?.emotion, 'tired', 'periodShape 월요일 감정');
  eq(shape?.days?.[6]?.date, '2026-07-12', 'periodShape 마지막 칸이 일요일');
  eq(shape?.writtenDays, 2, 'periodShape 쓴 날');

  const month = S.periodShape('monthly', '2026-07', [
    { date: '2026-07-06', emotion: 'joy', chars: 10 }, // W28
    { date: '2026-07-01', emotion: 'sad', chars: 10 }, // W27 — 7월의 주가 아니다. 버려진다
  ]);
  eq(month?.buckets?.[0]?.periodKey, '2026-W28', 'periodShape 월간 첫 칸');
  eq(month?.buckets?.[0]?.count, 1, 'periodShape 월간 첫 칸 개수');

  eq(S.previousPeriodKey('weekly', '2026-W01'), '2025-W52', 'previousPeriodKey(해 넘김 주)');
  eq(S.previousPeriodKey('monthly', '2026-01'), '2025-12', 'previousPeriodKey(해 넘김 달)');
  eq(S.previousPeriodKey('yearly', '2026'), '2025', 'previousPeriodKey(연)');

  /*
   * 알림 — 날짜 산술이 시간대에 흔들리면 **하루 어긋난 날 알림이 간다**(또는 안 간다).
   * `shiftEntryDate`는 UTC로 만들고 UTC로 읽어 자기 일관적이지만(주석이 그 이유를 적어놨다),
   * 그 전제가 깨지는 것을 여기서 잡는다 — `period.ts`가 정확히 그렇게 깨졌다.
   */
  const R = await import('../features/notification/reminder-schedule.ts');
  eq(R.shiftEntryDate('2026-02-28', 1), '2026-03-01', 'shiftEntryDate(평년 2월 말)');
  eq(R.shiftEntryDate('2028-02-28', 1), '2028-02-29', 'shiftEntryDate(윤년)');
  eq(R.shiftEntryDate('2026-12-31', 1), '2027-01-01', 'shiftEntryDate(해 넘김)');
  eq(R.shiftEntryDate('2026-03-08', 1), '2026-03-09', 'shiftEntryDate(미국 서머타임 시작일)');
  eq(
    R.planReminderDates({
      today: '2026-03-07',
      nowMinutes: 10 * 60,
      time: { hour: 21, minute: 0 },
      writtenDates: [],
      days: 3,
    }),
    ['2026-03-07', '2026-03-08', '2026-03-09'],
    'planReminderDates(서머타임 경계를 넘는 창)',
  );

  if (fail.length > 0) {
    for (const f of fail) console.error(f);
    process.exit(1);
  }
  // 🔴 **몇 개를 쟀는지 함께 찍는다.** 부모가 이 수를 대조한다 — 없으면 이 함수를 통째로
  //    비워도 부모는 지역 수만 세어 "7개 검사 통과"를 그대로 찍는다(2026-09-02에 그 상태였다).
  process.stdout.write(
    `오프셋 ${-new Date(2026, 6, 1, 12).getTimezoneOffset() / 60}시간  (${ran}개)`,
  );
}
