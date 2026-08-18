/**
 * AI 리포트 라우트 검증 — `node scripts/e2e-ai.mjs`
 *
 * 🔴 **정상 경로는 여기서 보지 않는다.** 실제 생성은 LLM을 부르고 돈이 나간다 —
 *   그건 `measure:ai`가 할 일이다. 여기서 보는 것은 **모델을 부르기 전에 끝나는 판정들**이다:
 *   인가 · 구독 게이트 · 입력 검증 · 캡 · 멱등. 이것들이 실제 사고가 나는 자리다.
 *
 * 🔴 **어떤 검사도 모델을 부르지 않는다 — 키가 있어도.** 예전에는 *"키가 없으니 실호출은
 *   구조상 불가능하다"* 에 기대고 있었는데, 키가 생긴 순간 그 전제가 무너져 검사 하나가
 *   **매 실행마다 돈을 썼다**(2026-08-14 발견). 전제가 아니라 **입력으로** 보장한다:
 *   정상 입력이 필요한 캡·잠금 검사는 DB에 행을 심어 게이트에서 끝나게 만든다.
 *
 * 준비: `AUTH_STUB=1 npm run dev` (common_server 없이). `DATABASE_URL`이 필요하다 —
 *       npm 스크립트가 `--env-file=.env.local`로 넘긴다.
 */
import postgres from 'postgres';

const BASE = process.env.SERVER_URL ?? 'http://127.0.0.1:3200';
const TOKEN = process.env.TEST_TOKEN ?? 'stub-token';

let passed = 0;
const failures = [];

async function check(name, fn) {
  try {
    await fn();
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

function eq(actual, expected, what) {
  assert(actual === expected, `${what}: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`);
}

async function ai(body, token = TOKEN) {
  const headers = { 'content-type': 'application/json' };
  if (token !== null) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api/v1/ai/report`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json() };
}

let n = 0;
const entry = (text) => ({ date: '2026-08-03', emotion: 'calm', title: null, text });
/**
 * 매번 다른 기간 키 — 캡에 걸리지 않게.
 *
 * ⚠ **지평 안이어야 한다**(`AI_REPORT_SYSTEM.md` §6.4). 라우트가 `isCreatablePeriod`로
 *   막으므로 지평(작년 1월 1일) 밖 키를 쓰면 검사하려던 것 대신 `out-of-range`가 나온다.
 *   `2026-W1x`는 2027년까지 안전하고, 그 뒤에는 여기가 먼저 깨진다 — 그게 신호다.
 */
const fresh = () => `2026-W${String(10 + n++).padStart(2, '0')}`;

console.log('\n인가');

await check('토큰이 없으면 401 unauthorized', async () => {
  const r = await ai({ reportId: 'a', kind: 'weekly', periodKey: fresh(), lang: 'ko' }, null);
  eq(r.status, 401, 'status');
  eq(r.json.reason, 'unauthorized', 'reason');
});

console.log('\n입력 검증 — 모델을 부르기 전에 끝난다');

await check('kind가 이상하면 거절', async () => {
  const r = await ai({ reportId: 'b', kind: 'daily', periodKey: fresh(), lang: 'ko' });
  assert(r.status >= 400, `통과했다: ${r.status}`);
});

await check('reportId가 없으면 거절 — 멱등 키가 없으면 중복 과금을 못 막는다', async () => {
  const r = await ai({ kind: 'weekly', periodKey: fresh(), lang: 'ko' });
  assert(r.status >= 400, `통과했다: ${r.status}`);
});

await check('🔴 빈 입력은 empty(422) — 조각 0개로 모델을 부르지 않는다', async () => {
  const r = await ai({ reportId: 'c', kind: 'weekly', periodKey: fresh(), lang: 'ko', entries: [] });
  eq(r.status, 422, 'status');
  eq(r.json.reason, 'empty', 'reason');
});

/*
 * 🔴 **백필 지평**(§6.4). 앱이 먼저 막지만 앱은 고칠 수 없는 버전이 남는다 —
 *   여기가 뚫리면 `uq_ai_usage_period`가 잘못 만든 기간을 **영구히 못 고치게** 굳힌다.
 */
await check('🔴 지평보다 오래된 기간은 out-of-range(422)', async () => {
  const r = await ai({
    reportId: 'oor-old',
    kind: 'weekly',
    periodKey: '2020-W10',
    lang: 'ko',
    entries: [entry('아주 오래된 주')],
  });
  eq(r.status, 422, 'status');
  eq(r.json.reason, 'out-of-range', 'reason');
});

await check('🔴 아직 안 끝난 기간도 out-of-range — 진행 중인 주를 요약하지 않는다', async () => {
  // 올해 연간은 정의상 아직 안 끝났다. 날짜에 안 물드는 유일한 케이스라 이걸 쓴다
  const thisYear = String(new Date().getFullYear());
  const r = await ai({
    reportId: 'oor-open',
    kind: 'yearly',
    periodKey: thisYear,
    lang: 'ko',
    subReports: [{ periodKey: `${thisYear}-01`, summary: '아무 요약' }],
  });
  eq(r.status, 422, 'status');
  eq(r.json.reason, 'out-of-range', 'reason');
});

await check('🔴 monthly는 entries가 있어도 비어 있다고 본다 — 계층 요약이다', async () => {
  const r = await ai({
    reportId: 'd',
    kind: 'monthly',
    periodKey: '2026-07',
    lang: 'ko',
    entries: [entry('조각이 있지만 월간의 입력은 주간 리포트다')],
    subReports: [],
  });
  eq(r.status, 422, 'status');
  eq(r.json.reason, 'empty', 'reason');
});

await check('🔴 과대 입력은 too-large — 상한 없이 프록시하면 청구서가 열린다', async () => {
  const r = await ai({
    reportId: 'e',
    kind: 'weekly',
    periodKey: fresh(),
    lang: 'ko',
    entries: [entry('가'.repeat(60_000))],
  });
  eq(r.status, 413, 'status');
  eq(r.json.reason, 'too-large', 'reason');
});

await check('🔴 본문이 빈 조각만 보내면 empty — 사진만·제목만 있는 주(§10.2)', async () => {
  const r = await ai({
    reportId: 'g',
    kind: 'weekly',
    periodKey: fresh(),
    lang: 'ko',
    entries: [
      { date: '2026-08-05', emotion: null, title: null, text: '' }, // 사진만
      { date: '2026-08-06', emotion: null, title: '피곤', text: '' }, // 제목만
    ],
  });
  eq(r.status, 422, 'status');
  eq(r.json.reason, 'empty', 'reason');
});

/*
 * ── 캡과 잠금 ────────────────────────────────────────────────────────────────
 *
 * 🔴 여기서부터는 **입력이 정상이다.** 예전에는 정상 입력을 한 번 보내고
 *   *"어떤 사유로든 실패해야 한다"* 로 확인했는데, 그건 `OPENAI_API_KEY`가 없다는
 *   전제 위에 서 있었다. 키가 생긴 뒤로 그 검사는 **매 실행마다 실호출을 냈다**
 *   (2026-08-14에 200을 받고 발견했다 — 검사가 통과하지 않고 실패해서 드러났다).
 *
 * 그래서 게이트를 **DB에 행을 심어서** 확인한다. 모델을 부르기 전에 끝나므로 공짜다.
 */
const SUBJECT = `stub:${TOKEN}`; // server/lib/auth.ts의 AUTH_STUB 분기와 같은 규칙
const sql = postgres(process.env.DATABASE_URL);
const seeded = { usage: [], cooldown: false };

try {
  console.log('\n캡과 잠금 — 모델을 부르기 전에 끝난다');

  await check('🔴 기간 몫을 다 썼으면 cap-exceeded — 모델을 부르지 않는다', async () => {
    const periodKey = fresh();
    const id = `seed-cap-${periodKey}`;
    await sql`
      insert into ai_usage (id, subject_id, kind, period_key, day, input_tokens, output_tokens, model)
      values (${id}, ${SUBJECT}, 'weekly', ${periodKey}, '1970-01-01', 0, 0, 'seed')`;
    seeded.usage.push(id);

    const r = await ai({
      reportId: `cap-${periodKey}`,
      kind: 'weekly',
      periodKey,
      lang: 'ko',
      entries: [entry('오늘은 평범한 하루였다. 별일 없이 지나갔다.')],
    });
    eq(r.status, 429, 'status');
    eq(r.json.reason, 'cap-exceeded', 'reason');
  });

  await check('🔴 실패 잠금 중이면 cooling-down — 다른 기간이어도 막힌다', async () => {
    const until = new Date(Date.now() + 60 * 60 * 1000);
    await sql`
      insert into ai_cooldowns (subject_id, until, reason) values (${SUBJECT}, ${until}, 'seed')
      on conflict (subject_id) do update set until = ${until}, reason = 'seed'`;
    seeded.cooldown = true;

    // ⚠ 캡이 비어 있는 **새 기간**을 쓴다 — 안 그러면 cap-exceeded와 구별되지 않는다
    const r = await ai({
      reportId: `cool-${Date.now()}`,
      kind: 'weekly',
      periodKey: fresh(),
      lang: 'ko',
      entries: [entry('오늘은 평범한 하루였다. 별일 없이 지나갔다.')],
    });
    eq(r.status, 429, 'status');
    eq(r.json.reason, 'cooling-down', 'reason');
    assert(typeof r.json.retryAt === 'string', 'retryAt이 없다 — 앱이 언제 열리는지 못 알린다');
  });
} finally {
  /*
   * ⚠ **반드시 치운다.** 잠금 행을 남기면 그 뒤 한 시간 동안 개발 중 생성이 전부 막히고,
   *   원인을 찾는 데 그 한 시간이 다 간다.
   */
  if (seeded.cooldown) await sql`delete from ai_cooldowns where subject_id = ${SUBJECT}`;
  if (seeded.usage.length > 0) await sql`delete from ai_usage where id in ${sql(seeded.usage)}`;
  await sql.end();
}

console.log('');
if (failures.length > 0) {
  console.error(`AI 라우트 — ${failures.length}개 실패\n`);
  for (const f of failures) console.error(`  · ${f}`);
  process.exit(1);
}
console.log(`AI 라우트 ok — ${passed}개 검사 통과`);
console.log('⚠ 정상 생성과 거부(refusal)만 실호출이 필요하다 — `npm run measure:ai`에서 본다\n');
