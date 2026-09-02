/**
 * 리포트 현황 조회 — `docs/ADMIN_SYSTEM.md` §2·§3
 *
 * 운영 콘솔의 `리포트 품질` 탭과 **같은 것을 본다.** 콘솔은 배포본 `ADMIN_TOKEN`(Vercel env)이
 * 필요한데 로컬 토큰과 달라 401 이 난다 — 그래서 DB 를 직접 읽는다.
 *
 * 🔴 **`subject_id` 를 select 하지 않는다.** 콘솔 라우트와 같은 규칙이다(§3) — 요약문은 품질을
 *   보려고 읽는 것이지 누가 썼는지 알려고 읽는 것이 아니다. 있으면 common_server 의 이메일과
 *   맞춰 *"이 사람은 이런 일기를 쓴다"* 가 만들어진다. 집계에는 `count(distinct subject_id)` 만 쓴다.
 *
 * ⚠ 읽기 전용이다. INSERT·UPDATE·DELETE 를 여기 추가하지 않는다.
 */
import { readFileSync } from 'node:fs';
import postgres from 'postgres';

const env = Object.fromEntries(
  readFileSync(new URL(process.env.PEEK_ENV ?? '../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    }),
);

const sql = postgres(env.DATABASE_URL, {
  ssl: env.DATABASE_URL.includes('127.0.0.1') ? false : 'require',
  max: 1,
  idle_timeout: 5,
});
const out = [];
const p = (s) => out.push(s);

try {
  const usage = await sql`
    select kind, count(*)::int as n,
           count(distinct subject_id)::int as subjects,
           min(created_at) as first, max(created_at) as last,
           sum(coalesce(input_tokens,0))::int as tin,
           sum(coalesce(output_tokens,0))::int as tout
    from ai_usage group by kind order by kind`;
  p('== ai_usage (호출 기록 · 성공만) ==');
  if (usage.length === 0) p('  (없음)');
  for (const r of usage) {
    p(`  ${r.kind.padEnd(8)} ${r.n}건 · 사용자 ${r.subjects}명 · 토큰 in ${r.tin} / out ${r.tout}`);
    p(`           ${new Date(r.first).toISOString().slice(0, 16)} ~ ${new Date(r.last).toISOString().slice(0, 16)}`);
  }

  const rep = await sql`
    select id, kind, period_key, prompt_ver, model, concern, flagged, created_at,
           length(summary)::int as len, summary
    from ai_reports order by created_at desc limit 50`;
  p('');
  p(`== ai_reports (보관 중인 요약문) — ${rep.length}건 ==`);
  for (const r of rep) {
    p('');
    p(`  [${r.kind} ${r.period_key}] ${new Date(r.created_at).toISOString().slice(0, 16)}` +
      ` · v${r.prompt_ver} · ${r.model} · ${r.len}자` +
      `${r.concern ? ' · 🔴concern' : ''}${r.flagged ? ' · 🚩신고됨' : ''}`);
    p('  ' + String(r.summary ?? '').replace(/\n/g, '\n  '));
  }

  const cool = await sql`select count(*)::int as n from ai_cooldowns`;
  p('');
  p(`== ai_cooldowns (실패 잠금) == ${cool[0].n}건`);
} finally {
  await sql.end({ timeout: 5 });
}

process.stdout.write(out.join('\n') + '\n');
