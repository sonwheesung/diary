/**
 * AI 리포트 라우트 검증 — `node scripts/e2e-ai.mjs`
 *
 * 🔴 **정상 경로는 여기서 보지 않는다.** 실제 생성은 LLM을 부르고 돈이 나간다 —
 *   그건 `measure:ai`가 할 일이다. 여기서 보는 것은 **모델을 부르기 전에 끝나는 판정들**이다:
 *   인가 · 구독 게이트 · 입력 검증 · 캡 · 멱등. 이것들이 실제 사고가 나는 자리다.
 *
 * ⚠ 그래서 `OPENAI_API_KEY` 없이 돌아간다. 오히려 **키가 없는 편이 낫다** —
 *   게이트를 통과해버린 요청이 실수로 과금되는 일이 없다.
 *
 * 준비: `AUTH_STUB=1 npm run dev` (common_server 없이)
 */
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
/** 매번 다른 기간 키 — 캡에 걸리지 않게 */
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

console.log('\n캡을 못 읽거나 키가 없을 때 — **모델을 부르지 않는다**');

await check('🔴 여기서 200이 나오면 안 된다 — 캡 없이 모델을 부른 것이다', async () => {
  const r = await ai({
    reportId: `f-${Date.now()}`,
    kind: 'weekly',
    periodKey: fresh(),
    lang: 'ko',
    entries: [entry('오늘은 평범한 하루였다. 별일 없이 지나갔다.')],
  });

  /*
   * 이 검사의 핵심은 **어떤 사유든 실패해야 한다**는 것이다. 여기까지 왔다는 것은
   * 입력이 정상이라는 뜻이고, 그러면 남은 관문은 캡(DB)과 키뿐이다:
   *   · DB가 죽었다      → error(500).  🔴 **닫히는 쪽으로 실패한다** — 캡을 모르면 안 부른다
   *   · 키가 없다        → not-configured(503)
   *   · 캡을 다 썼다     → cap-exceeded(429)
   * 200이면 셋 다 아닌데 통과한 것이고, 그건 실호출이 일어났다는 뜻이다.
   */
  assert(
    r.status !== 200,
    `200이 돌아왔다 — 게이트를 통과해 실제로 모델을 불렀다. 과금이 발생했을 수 있다`,
  );
  const expected = ['error', 'not-configured', 'cap-exceeded'];
  assert(
    expected.includes(r.json.reason),
    `예상 밖 사유: ${r.status} ${r.json.reason}`,
  );
  console.log(`       (사유: ${r.status} ${r.json.reason})`);
});

console.log('');
if (failures.length > 0) {
  console.error(`AI 라우트 — ${failures.length}개 실패\n`);
  for (const f of failures) console.error(`  · ${f}`);
  process.exit(1);
}
console.log(`AI 라우트 ok — ${passed}개 검사 통과`);
console.log('⚠ 정상 생성·캡 소진·거부 경로는 실호출이 필요하다 — `npm run measure:ai`에서 본다\n');
