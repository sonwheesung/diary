/**
 * GET /api/admin/ai — AI 사용량·추정 원가 (`docs/ADMIN_SYSTEM.md` §2).
 *
 * 🔴 **`ai_calls`(원장)를 읽는다 — `ai_usage`가 아니다**(`AI_REPORT_SYSTEM` §6.6.1, 2026-09-07).
 *   `ai_usage`는 **기간당 1행**이고 재생성이 그 행을 덮어쓴다. 그 표로 세면 호출 2회가
 *   1회로 보이고, 토큰은 두 번째 것만 남고, `day`까지 갱신돼 **지난 30일 그래프가 조용히
 *   바뀐다.** 원가는 *호출당 1건*이라 자기 표를 갖는다.
 *
 * ⚠ 되돌리지 마라. `check:admin`이 소스를 읽어 막고, `verify:regenerate`가 이 라우트의
 *   합계를 **독립 SQL 합계와 대조**한다(경로 간 대조, `README.md` §3).
 *
 * `CLAUDE.md` §7.2가 *"AI는 원가 실측 전까지 월간·연간으로 확대하지 않는다"* 라고 해놨는데
 * **실측할 화면이 없었다.** 이 라우트가 그 화면의 재료다.
 *
 * 🔴 **`subject_id`를 select하지 않는다**(§3). 응답에 없으면 실수로 그릴 수도 없다.
 *   조각은 E2EE 제품이고, 콘솔이 개인을 특정할 수 있게 되면 common_server의 이메일과
 *   맞춰 *"누가 언제 AI를 몇 번 썼나"* 가 만들어진다 — 우리가 갖지 않기로 한 정보다.
 */
import { and, gte, sql } from 'drizzle-orm';

import { db } from '../../../../db';
import { aiCalls } from '../../../../db/schema';
import { isAdmin } from '../../../../lib/admin';
import { USD_TO_KRW, estimateUsd } from '../../../../lib/admin-pricing';
import { kstDayKeys, windowLabel, windowStart } from '../../../../lib/admin-window';
import type { Granularity } from '../../../../lib/admin-window';
import { reportError } from '../../../../lib/observability';
import { fail, ok } from '../../../../lib/respond';

export const dynamic = 'force-dynamic';

/** 일별 추이 길이. 30일이면 주 단위 패턴이 눈에 보이고 응답도 작다. */
const TREND_DAYS = 30;

function granularityOf(value: string | null): Granularity {
  return value === 'week' || value === 'month' || value === 'year' ? value : 'month';
}

export async function GET(req: Request): Promise<Response> {
  if (!isAdmin(req)) {
    return fail('unauthorized');
  }
  try {
    const granularity = granularityOf(new URL(req.url).searchParams.get('window'));
    const start = windowStart(granularity);

    /*
     * 창 안의 집계를 **모델별로** 쪼갠다. 원가는 모델마다 단가가 달라서
     * 합계 토큰에 단가 하나를 곱하면 모델을 바꾼 달에 조용히 틀린다.
     */
    const byModel = await db
      .select({
        model: aiCalls.model,
        calls: sql<number>`count(*)::int`,
        inputTokens: sql<number>`coalesce(sum(${aiCalls.inputTokens}), 0)::int`,
        outputTokens: sql<number>`coalesce(sum(${aiCalls.outputTokens}), 0)::int`,
      })
      .from(aiCalls)
      .where(gte(aiCalls.createdAt, start))
      .groupBy(aiCalls.model);

    /* 리포트 종류별 — 주간이 대부분이어야 정상이다(월간·연간은 기간당 1회다). */
    const byKind = await db
      .select({
        kind: aiCalls.kind,
        calls: sql<number>`count(*)::int`,
      })
      .from(aiCalls)
      .where(gte(aiCalls.createdAt, start))
      .groupBy(aiCalls.kind);

    /*
     * 창 안에서 **AI를 쓴 사람 수**. 개별 id가 아니라 distinct 개수만 센다 —
     * 1인당 평균 호출을 보려면 이 숫자 하나면 충분하다(§3).
     */
    const [reach] = await db
      .select({ users: sql<number>`count(distinct ${aiCalls.subjectId})::int` })
      .from(aiCalls)
      .where(gte(aiCalls.createdAt, start));

    /*
     * 30일 일별 추이. **KST 날짜로 묶는다** — UTC로 묶으면 한국 시간 오전 9시가 경계가 되어
     * 하루가 둘로 쪼개져 보인다(배구가 겪은 9시간 밀림과 같은 문제).
     */
    const trendFrom = new Date(Date.now() - TREND_DAYS * 86_400_000);
    const trendRows = await db
      .select({
        day: sql<string>`to_char((${aiCalls.createdAt} at time zone 'Asia/Seoul')::date, 'YYYY-MM-DD')`,
        calls: sql<number>`count(*)::int`,
        inputTokens: sql<number>`coalesce(sum(${aiCalls.inputTokens}), 0)::int`,
        outputTokens: sql<number>`coalesce(sum(${aiCalls.outputTokens}), 0)::int`,
      })
      .from(aiCalls)
      .where(and(gte(aiCalls.createdAt, trendFrom)))
      .groupBy(sql`(${aiCalls.createdAt} at time zone 'Asia/Seoul')::date`)
      .orderBy(sql`(${aiCalls.createdAt} at time zone 'Asia/Seoul')::date`);

    /*
     * 🔴 **빈 날을 0으로 채운다.** DB는 호출이 있는 날만 준다 — 그대로 그리면
     *   8/4·8/8·8/12가 연속된 날처럼 붙어 **사용량이 일정한 것처럼 보인다.**
     *   축을 서버가 만든다: 클라이언트가 KST 날짜를 다시 계산하면 두 곳이 어긋난다.
     */
    const counted = new Map(trendRows.map((row) => [row.day, row]));
    const trend = kstDayKeys(TREND_DAYS).map(
      (day) => counted.get(day) ?? { day, calls: 0, inputTokens: 0, outputTokens: 0 },
    );

    /*
     * 원가 합계. 단가를 모르는 모델은 **합계에서 빼고 표시로 알린다** —
     * 0으로 더하면 "공짜"로 읽혀서 원가를 과소 보고한다(`admin-pricing.ts`).
     */
    let usd = 0;
    let unpricedCalls = 0;
    const models = byModel.map((row) => {
      const cost = estimateUsd(row.model, row.inputTokens, row.outputTokens);
      if (cost === null) {
        unpricedCalls += row.calls;
      } else {
        usd += cost;
      }
      return { ...row, model: row.model ?? '(미기록)', usd: cost };
    });

    const calls = byModel.reduce((sum, row) => sum + row.calls, 0);

    return ok({
      window: { granularity, since: windowLabel(granularity), timezone: 'Asia/Seoul' },
      totals: {
        calls,
        users: reach?.users ?? 0,
        inputTokens: byModel.reduce((s, r) => s + r.inputTokens, 0),
        outputTokens: byModel.reduce((s, r) => s + r.outputTokens, 0),
        usd,
        krw: Math.round(usd * USD_TO_KRW),
        /** 단가 미등록 모델의 호출 수. 0이 아니면 위 원가는 **과소 집계**다 */
        unpricedCalls,
      },
      models,
      kinds: byKind,
      trend,
    });
  } catch (error) {
    reportError(error, 'admin/ai');
    return fail('error');
  }
}
