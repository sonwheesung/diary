/**
 * 계층 요약 실호출 검증 — `npm run verify:hierarchy`
 *
 * 🔴 **돈이 나간다.** 그래서 `AI_SPEND=1` 없이는 돌지 않는다.
 *   2026-08-14에 `e2e:ai`가 *"키가 없으니 안전하다"* 는 전제로 매 실행마다 실호출을 냈다.
 *   그 사고를 반복하지 않으려고, 돈 쓰는 스크립트는 **켜야 도는** 쪽에 둔다.
 *
 * ## 왜 만들었나
 *
 * `ai_usage`·`ai_reports`의 `kind`가 **전부 `weekly`** 였다(2026-08-25 stg 실측).
 * 월간·연간(계층 요약)은 코드·순수 계층 검사·화면까지만 있고 **한 번도 실행된 적이 없다.**
 * 월간은 `uq_ai_usage_period`로 **평생 1번**이라, 처음 만드는 자리가 곧 실전이다 —
 * 거기서 처음 돌려보는 것은 너무 늦다.
 *
 * ## 무엇을 보나
 *
 * ```
 * 주간 ×4 (더미 일기)  →  월간 2026-07 (그 4개의 실제 요약문)   ← 진짜 계층
 *                      →  연간 2025    (합성 월간 요약 12개)     ← 프롬프트·경로만
 * ```
 *
 * ⚠ **연간의 입력은 합성이다.** 진짜로 하려면 2025년 월간 12개가 필요하고 그건 주간 48개다.
 *   그래서 연간에서 확인하는 것은 *"12개를 받아 한 해로 압축하는가"* 까지다.
 *
 * ⚠ 일기는 **전부 더미다.** 실제 사용자의 일기를 측정 스크립트에 넣지 않는다.
 *
 * ## 끝나면 지운다
 *
 * `DATABASE_URL`이 stg 원격을 가리켜서(§12) 이 스크립트가 만든 행은 **테스터가 쓰는 DB**에
 * 남는다. 그래서 마지막에 `POST /api/v1/ai/purge`로 치우고 0행을 확인한다 —
 * 겸사겸사 파기 라우트가 한 번 더 돈다.
 *
 * 준비: `AUTH_STUB=1 npm run dev` (common_server 없이) · `OPENAI_API_KEY`
 */
import { readFileSync } from 'node:fs';
import postgres from 'postgres';

const BASE = process.env.SERVER_URL ?? 'http://127.0.0.1:3200';
/** e2e의 `stub-token`과 **다른 값**이어야 한다 — 섞이면 파기가 남의 행까지 지운다 */
const TOKEN = process.env.TEST_TOKEN ?? 'hierarchy-check';
const SUBJECT = `stub:${TOKEN}`;
const LANG = process.env.REPORT_LANG ?? 'ko';

if (process.env.AI_SPEND !== '1') {
  console.error('\n이 스크립트는 실제로 모델을 부른다(6회 · 대략 ₩6).');
  console.error('돌리려면 AI_SPEND=1 을 붙인다.\n');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);
const fail = [];

async function ai(body) {
  const res = await fetch(`${BASE}/api/v1/ai/report`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json() };
}

let seq = 0;
const nextId = () => `hier-${Date.now()}-${(seq += 1)}`;

/** 더미 일기. 실제 사용자 것이 아니다 */
const DIARY = {
  '2026-W28': [
    ['2026-07-06', 'calm', '장마 시작', '아침부터 비가 왔다. 우산을 놓고 나와서 편의점에서 하나 샀다. 사무실 창밖으로 비 오는 걸 한참 봤다.'],
    ['2026-07-08', 'tired', null, '회의가 세 개 연달아 있었다. 점심을 4시에 먹었다. 집에 와서 아무것도 안 하고 누워 있었다.'],
    ['2026-07-11', 'joy', '오랜만에', '고등학교 친구를 오랜만에 만났다. 예전 얘기를 두 시간 했는데 하나도 안 지루했다.'],
  ],
  '2026-W29': [
    ['2026-07-13', 'anxious', null, '다음 주 발표 자료를 만들다가 새벽 2시가 됐다. 잘 될지 모르겠다.'],
    ['2026-07-15', 'calm', '수영', '퇴근하고 수영장에 갔다. 물에 들어가면 머릿속이 조용해진다. 주 2회는 가고 싶다.'],
    ['2026-07-18', 'joy', '발표 끝', '발표가 생각보다 잘 끝났다. 걱정한 시간이 아까울 정도였다.'],
    ['2026-07-19', 'tired', null, '하루 종일 잤다. 몸이 무거웠지만 마음은 가벼웠다.'],
  ],
  '2026-W30': [
    ['2026-07-21', 'calm', null, '점심에 회사 근처 공원을 걸었다. 매미 소리가 컸다.'],
    ['2026-07-23', 'sad', '이사 준비', '살던 집을 정리하다가 오래된 사진을 봤다. 버릴까 하다가 다시 넣었다.'],
    ['2026-07-26', 'joy', '이사', '이사를 마쳤다. 짐이 생각보다 많았다. 새 집 창문이 크다.'],
  ],
  '2026-W31': [
    ['2026-07-28', 'calm', '정리', '박스를 반쯤 풀었다. 급하지 않게 하기로 했다.'],
    ['2026-07-30', 'joy', null, '새 동네 카페를 찾았다. 사장님이 강아지를 키운다.'],
    ['2026-08-01', 'tired', null, '더위가 심했다. 에어컨을 하루 종일 틀었다.'],
  ],
};

/** 연간 입력 — **합성이다.** 진짜 계층이 아니라는 것을 이름으로 남긴다 */
const SYNTHETIC_2025 = [
  ['2025-01', '새해에 운동을 시작했다. 작심삼일이 아니길 바라며 주 2회 헬스장에 갔다.'],
  ['2025-02', '감기로 일주일을 앓았다. 아프고 나서야 잠을 줄이고 있었다는 걸 알았다.'],
  ['2025-03', '부서가 바뀌었다. 새 사람들과 익숙해지는 데 시간이 걸렸다.'],
  ['2025-04', '벚꽃을 보러 갔다. 사람이 많았지만 좋았다. 오랜만에 카메라를 들었다.'],
  ['2025-05', '가족 여행을 다녀왔다. 부모님이 나이 드신 게 눈에 보였다.'],
  ['2025-06', '일이 많았다. 야근이 잦았고 주말에도 노트북을 열었다.'],
  ['2025-07', '휴가를 냈지만 집에만 있었다. 그래도 쉬었다는 느낌은 있었다.'],
  ['2025-08', '더위에 지쳤다. 저녁에 산책하는 습관이 생겼다.'],
  ['2025-09', '자격증 공부를 시작했다. 퇴근 후 두 시간씩.'],
  ['2025-10', '시험에 떨어졌다. 생각보다 덜 속상했다. 다시 하면 된다고 생각했다.'],
  ['2025-11', '친구 결혼식이 두 번 있었다. 축하하면서도 조금 복잡했다.'],
  ['2025-12', '한 해를 정리했다. 크게 이룬 건 없지만 무너지지도 않았다.'],
];

const results = [];

async function step(label, body) {
  process.stdout.write(`  ${label} … `);
  const started = Date.now();
  const r = await ai(body);
  const took = ((Date.now() - started) / 1000).toFixed(1);
  if (r.status !== 200) {
    console.log(`FAIL ${r.status} ${JSON.stringify(r.json)}`);
    fail.push(`${label}: ${r.status} ${r.json?.reason ?? ''}`);
    return null;
  }
  const summary = r.json.summary ?? '';
  /*
   * 🔴 **지표는 스키마가 강제하지만 규약까지 강제하지는 못한다**(§8.4).
   *   `stress`·`happiness`는 날로 셀 수 없으므로 `days`가 `null`이어야 하고,
   *   `topics`는 지표와 겹치면 안 되며, `days`는 조각 수를 넘으면 안 된다.
   *   여기서 안 보면 화면에서 *"운동 25점 · 3일"* 같은 것이 조용히 나온다.
   */
  const metrics = r.json.metrics ?? [];
  const topics = r.json.topics ?? [];
  const codes = metrics.map((m) => m.code).join(',');
  if (codes !== 'stress,happiness,exercise,growth') {
    fail.push(`${label}: 지표 축이 어긋났다 — ${codes || '(없음)'}`);
  }
  for (const m of metrics) {
    if ((m.code === 'stress' || m.code === 'happiness') && m.days !== null) {
      fail.push(`${label}: ${m.code} 는 날로 셀 수 없는데 days=${m.days}`);
    }
    if (m.value < 0 || m.value > 100) fail.push(`${label}: ${m.code} value=${m.value}`);
  }
  const sources = (body.entries ?? body.subReports ?? []).length;
  for (const tp of topics) {
    if (['stress', 'happiness', 'exercise', 'growth'].includes(tp.code)) {
      fail.push(`${label}: topics 가 지표와 겹친다 — ${tp.code}`);
    }
    if (tp.days > sources) fail.push(`${label}: ${tp.code} days=${tp.days} > 자료 ${sources}`);
  }
  const shown = metrics.map((m) => `${m.code} ${m.value}${m.days === null ? '' : `/${m.days}일`}`);
  console.log(`ok ${took}초 · ${summary.length}자 · concern=${r.json.concern}`);
  console.log(`     ${shown.join(' · ')}`);
  console.log(`     그 밖에: ${topics.map((tp) => `${tp.code} ${tp.days}일`).join(' · ') || '(없음)'}`);
  results.push({ label, periodKey: body.periodKey, kind: body.kind, summary, concern: r.json.concern, took });
  return summary;
}

/* ── 0. 시작 전 상태 ──────────────────────────────────────────── */

const before = await sql`select count(*)::int as n from ai_usage where subject_id = ${SUBJECT}`;
if (before[0].n > 0) {
  console.error(`\n이 토큰(${SUBJECT})에 이미 ${before[0].n}행이 있다. 캡에 걸린다 — 먼저 파기하거나 TEST_TOKEN을 바꾼다.\n`);
  await sql.end();
  process.exit(1);
}

console.log(`\n계층 요약 실호출 — lang=${LANG} · subject=${SUBJECT}\n`);

/* ── 1. 주간 4개 (더미 일기 → 실제 요약문) ────────────────────── */

console.log('주간 — 더미 일기에서');
const weekly = [];
for (const [periodKey, rows] of Object.entries(DIARY)) {
  const summary = await step(periodKey, {
    reportId: nextId(),
    kind: 'weekly',
    periodKey,
    lang: LANG,
    entries: rows.map(([date, emotion, title, text]) => ({ date, emotion, title, text })),
  });
  if (summary !== null) weekly.push({ periodKey, summary });
}

/* ── 2. 월간 — **위에서 나온 진짜 요약문**을 입력으로 ─────────── */

console.log(`\n월간 — 주간 ${weekly.length}개를 입력으로 (진짜 계층)`);
if (weekly.length !== 4) {
  fail.push(`월간 입력이 4개가 아니다(${weekly.length}) — 주간이 먼저 실패했다`);
}
const monthly = weekly.length > 0
  ? await step('2026-07', {
      reportId: nextId(),
      kind: 'monthly',
      periodKey: '2026-07',
      lang: LANG,
      subReports: weekly,
    })
  : null;

/* ── 3. 연간 — 합성 월간 12개 ─────────────────────────────────── */

console.log('\n연간 — 합성 월간 12개를 입력으로 (⚠ 진짜 계층이 아니다)');
await step('2025', {
  reportId: nextId(),
  kind: 'yearly',
  periodKey: '2025',
  lang: LANG,
  subReports: SYNTHETIC_2025.map(([periodKey, summary]) => ({ periodKey, summary })),
});

/* ── 4. 서버에 남은 것 ────────────────────────────────────────── */

console.log('\n서버 기록');
const rows = await sql`
  select u.kind, u.period_key, u.model, u.input_tokens, u.output_tokens,
         r.prompt_ver, r.source_count, r.concern, length(r.summary) as len
    from ai_usage u
    left join ai_reports r on r.subject_id = u.subject_id
                          and r.kind = u.kind and r.period_key = u.period_key
   where u.subject_id = ${SUBJECT}
   order by u.kind, u.period_key`;
for (const r of rows) {
  console.log(
    `  ${r.kind.padEnd(7)} ${String(r.period_key).padEnd(9)} v${r.prompt_ver} src=${r.source_count} ` +
      `${r.input_tokens}/${r.output_tokens} concern=${r.concern} ${r.len}자`,
  );
}
if (rows.length !== 6) fail.push(`ai_usage 6행이어야 하는데 ${rows.length}행이다`);

/*
 * 🔴 기대값을 **소스에서 읽는다.** 숫자를 여기 박으면 프롬프트를 올릴 때마다 낡고,
 *   낡은 기대값은 *"돌던 서버가 옛 코드였다"* 를 못 잡는다 — 이 검사의 존재 이유가 그것이다.
 */
const want = Number(
  /PROMPT_VERSION\s*=\s*(\d+)/.exec(
    readFileSync(new URL('../shared/ai/types.ts', import.meta.url), 'utf8'),
  )?.[1],
);
const vers = new Set(rows.map((r) => r.prompt_ver));
if (!(vers.size === 1 && vers.has(want))) {
  fail.push(`prompt_ver가 ${want} 하나여야 한다(소스 기준): ${[...vers].join('·')}`);
}
const kinds = new Set(rows.map((r) => r.kind));
for (const k of ['weekly', 'monthly', 'yearly']) {
  if (!kinds.has(k)) fail.push(`${k} 행이 없다`);
}

/* ── 5. 요약문 (더미에서 나온 것이라 찍어도 된다) ─────────────── */

console.log('\n요약문');
for (const r of results) {
  console.log(`\n  [${r.kind} ${r.periodKey}]`);
  for (const line of r.summary.split('\n')) console.log(`    ${line}`);
}

/* ── 6. 치운다 ────────────────────────────────────────────────── */

console.log('\n파기 — stg DB에 남기지 않는다');
const purge = await fetch(`${BASE}/api/v1/ai/purge`, {
  method: 'POST',
  headers: { authorization: `Bearer ${TOKEN}` },
});
const purged = await purge.json();
console.log(`  ${purge.status} ${JSON.stringify(purged)}`);
const left = await sql`select count(*)::int as n from ai_usage where subject_id = ${SUBJECT}`;
const leftR = await sql`select count(*)::int as n from ai_reports where subject_id = ${SUBJECT}`;
console.log(`  남은 행 — ai_usage ${left[0].n} · ai_reports ${leftR[0].n}`);
if (left[0].n !== 0 || leftR[0].n !== 0) fail.push('파기 후에도 행이 남았다');

await sql.end();

if (fail.length > 0) {
  console.log('');
  for (const f of fail) console.log(`  🔴 ${f}`);
  console.log(`\n계층 요약 검증 실패 — ${fail.length}건\n`);
  process.exit(1);
}
console.log(`\n계층 요약 ok — ${rows.length}개 검사 통과\n`);
