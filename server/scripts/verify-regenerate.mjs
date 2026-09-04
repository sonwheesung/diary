/**
 * 재생성 왕복 — **실제 DB·실제 라우트로** 확인한다 (`docs/AI_REPORT_SYSTEM.md` §6.6).
 *
 * 🔴 모델을 부르지 않는다. `OPENAI_API_KEY` 를 뺀 서버를 향해 쏘면 `generateReport` 가
 *   `not-configured` 로 떨어지는데, 그 지점이 **소모 뒤·복구 앞**이라 우리가 확인하고
 *   싶은 구간(소모 → 실패 → 복구)이 정확히 돈다. 돈이 한 푼도 안 나간다.
 *
 * 실행: `node --env-file=.env.local scripts/verify-regenerate.mjs`
 *   ⚠ 서버가 `AUTH_STUB=1` 로 떠 있어야 하고, **키가 없어야** 마지막 검사가 성립한다.
 */
import postgres from 'postgres';

const BASE = process.env.E2E_BASE ?? 'http://127.0.0.1:3200';
const TOKEN = `regen-${Date.now()}`;
const SUBJECT = `stub:${TOKEN}`;
const KIND = 'weekly';
const PERIOD = '2026-W20';

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
let passed = 0;
const failures = [];

function check(name, cond, detail = '') {
  if (cond) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const post = (path, body, auth = true) =>
  fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(auth ? { authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: JSON.stringify(body),
  });

const admin = (path, body) =>
  fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

const flag = async () => {
  const [row] = await sql`
    select regenerate, regenerate_note from ai_usage
     where subject_id = ${SUBJECT} and kind = ${KIND} and period_key = ${PERIOD}`;
  return row;
};

/** 리포트 요청 한 건. 내용은 캡을 지나가기만 하면 되므로 최소로 둔다 */
const makeReport = () =>
  post('/api/v1/ai/report', {
    reportId: crypto.randomUUID(),
    kind: KIND,
    periodKey: PERIOD,
    lang: 'ko',
    entries: [{ date: '2026-05-11', text: '재생성 확인용 더미. 실제 일기가 아니다.' }],
  });

console.log('\n재생성 왕복 — 실제 DB\n');

try {
  // ── 준비: 이미 만든 기간을 흉내낸다 ────────────────────────────────────────
  await sql`
    insert into ai_usage (id, subject_id, kind, period_key, day, input_tokens, output_tokens, model)
    values (${crypto.randomUUID()}, ${SUBJECT}, ${KIND}, ${PERIOD}, ${'2026-05-17'}, 0, 0, ${'seed'})`;

  const r1 = await makeReport();
  const b1 = await r1.json();
  check('🔴 이미 쓴 기간은 cap-exceeded — 평생 1회가 살아 있다', b1.reason === 'cap-exceeded', b1.reason);

  const before = await flag();
  check('아직 열리지 않았다', before?.regenerate === false, String(before?.regenerate));

  // ── 운영자가 연다 ─────────────────────────────────────────────────────────
  const bad = await admin('/api/admin/regenerate', {
    subject: SUBJECT,
    kind: KIND,
    periodKey: '2026-W99',
    note: '없는 기간',
  });
  const badBody = await bad.json();
  check(
    '🔴 없는 기간은 changed 0 — 조용히 성공으로 보이면 답변만 보내고 아무 일도 안 일어난다',
    badBody.ok === true && badBody.changed === 0,
    JSON.stringify(badBody),
  );

  const open = await admin('/api/admin/regenerate', {
    subject: SUBJECT,
    kind: KIND,
    periodKey: PERIOD,
    note: '문의 #test · 확인용',
  });
  const openBody = await open.json();
  check('운영자가 연다', openBody.ok === true && openBody.changed === 1, JSON.stringify(openBody));

  const opened = await flag();
  check('플래그와 메모가 DB에 섰다', opened?.regenerate === true && opened?.regenerate_note === '문의 #test · 확인용');

  // ── 앱이 그 사실을 안다 ───────────────────────────────────────────────────
  const list = await fetch(`${BASE}/api/v1/ai/regenerable`, {
    headers: { authorization: `Bearer ${TOKEN}` },
  });
  const listBody = await list.json();
  check(
    '🔴 앱이 열린 기간을 조회한다 — 모르면 기간 시트가 못 연다',
    Array.isArray(listBody.periods) &&
      listBody.periods.some((p) => p.kind === KIND && p.periodKey === PERIOD),
    JSON.stringify(listBody).slice(0, 120),
  );
  check(
    '메모는 앱에 안 내려간다 — 우리끼리의 글이다',
    !JSON.stringify(listBody).includes('문의 #test'),
  );

  // ── 소모 → 실패 → 복구 ───────────────────────────────────────────────────
  const r2 = await makeReport();
  const b2 = await r2.json();
  check(
    '🔴 열려 있으면 캡을 지나 모델까지 간다 (키가 없어 not-configured)',
    b2.reason === 'not-configured',
    `${b2.reason} — 키가 설정돼 있으면 이 검사는 성립하지 않는다`,
  );

  const after = await flag();
  check(
    '🔴 실패했으니 재생성권을 돌려준다 — 우리 잘못으로 재시도권을 잃게 두지 않는다',
    after?.regenerate === true,
    String(after?.regenerate),
  );

  const [usage] = await sql`
    select count(*)::int n from ai_usage
     where subject_id = ${SUBJECT} and kind = ${KIND} and period_key = ${PERIOD}`;
  check('🔴 실패는 행을 더 만들지 않는다 — 기간당 1행이 유지된다', usage.n === 1, String(usage.n));
} finally {
  // ── 흔적을 지운다 ─────────────────────────────────────────────────────────
  await sql`delete from ai_usage where subject_id = ${SUBJECT}`;
  await sql`delete from ai_reports where subject_id = ${SUBJECT}`;
  await sql`delete from ai_cooldowns where subject_id = ${SUBJECT}`;
  const [left] = await sql`select count(*)::int n from ai_usage where subject_id = ${SUBJECT}`;
  check('치웠다 — 확인용 흔적을 남기지 않는다', left.n === 0, String(left.n));
  await sql.end();
}

console.log(
  failures.length === 0
    ? `\n재생성 왕복 ok — ${passed}개 검사 통과\n`
    : `\n${failures.length}개 실패:\n${failures.map((f) => `  · ${f}`).join('\n')}\n`,
);
process.exit(failures.length === 0 ? 0 : 1);
