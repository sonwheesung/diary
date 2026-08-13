/**
 * GET /api/admin/overview — 대시보드 + **로그인 검증용 탐침** (`docs/ADMIN_SYSTEM.md`).
 *
 * 콘솔이 부팅할 때 저장된 토큰으로 이걸 한 번 부른다 — 401이면 로그인 화면으로 되돌린다.
 * 그래서 **가벼워야 한다.** 무거운 집계는 각 탭 라우트가 따로 한다.
 *
 * 정책 상수를 함께 내린다(§5) — 콘솔은 **보여주기만** 하고 바꾸지 못한다.
 * 화면에서 바꿀 수 있게 하면 앱 문구("주에 한 번")와의 짝이 **배포 없이 깨진다.**
 */
import { gte, sql } from 'drizzle-orm';

import { db } from '../../../../db';
import { aiUsage, vaults } from '../../../../db/schema';
import { isAdmin } from '../../../../lib/admin';
import { USD_TO_KRW, estimateUsd } from '../../../../lib/admin-pricing';
import { windowStart } from '../../../../lib/admin-window';
import {
  DAILY_CALL_CAP,
  MAX_INPUT_CHARS,
  MONTHLY_PER_MONTH,
  WEEKLY_PER_WEEK,
  YEARLY_PER_YEAR,
} from '../../../../lib/ai-policy';
import { GRACE_MS, KEEP_GENERATIONS } from '../../../../lib/policy';
import { reportError } from '../../../../lib/observability';
import { fail, ok } from '../../../../lib/respond';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  if (!isAdmin(req)) {
    return fail('unauthorized');
  }
  try {
    const monthStart = windowStart('month');

    const [vaultRow] = await db
      .select({
        alive: sql<number>`count(*) filter (where ${vaults.purgedAt} is null)::int`,
        purged: sql<number>`count(*) filter (where ${vaults.purgedAt} is not null)::int`,
      })
      .from(vaults);

    /* 이번 달 AI — 모델별로 쪼개야 원가가 맞는다(모델마다 단가가 다르다) */
    const monthByModel = await db
      .select({
        model: aiUsage.model,
        calls: sql<number>`count(*)::int`,
        inputTokens: sql<number>`coalesce(sum(${aiUsage.inputTokens}), 0)::int`,
        outputTokens: sql<number>`coalesce(sum(${aiUsage.outputTokens}), 0)::int`,
      })
      .from(aiUsage)
      .where(gte(aiUsage.createdAt, monthStart))
      .groupBy(aiUsage.model);

    let usd = 0;
    let unpricedCalls = 0;
    for (const row of monthByModel) {
      const cost = estimateUsd(row.model, row.inputTokens, row.outputTokens);
      if (cost === null) {
        unpricedCalls += row.calls;
      } else {
        usd += cost;
      }
    }

    return ok({
      vaults: vaultRow ?? { alive: 0, purged: 0 },
      aiThisMonth: {
        calls: monthByModel.reduce((s, r) => s + r.calls, 0),
        usd,
        krw: Math.round(usd * USD_TO_KRW),
        unpricedCalls,
      },
      /** 배포된 정책. **읽기 전용**이다 — 바꾸려면 커밋해야 한다(§5) */
      policy: {
        weeklyPerWeek: WEEKLY_PER_WEEK,
        monthlyPerMonth: MONTHLY_PER_MONTH,
        yearlyPerYear: YEARLY_PER_YEAR,
        dailyCallCap: DAILY_CALL_CAP,
        maxInputChars: MAX_INPUT_CHARS,
        keepGenerations: KEEP_GENERATIONS,
        graceDays: GRACE_MS / 86_400_000,
        aiModel: process.env.AI_MODEL ?? 'gpt-5.6-luna',
        aiEffort: process.env.AI_EFFORT ?? 'low',
        /*
         * ⚠ 키 **값**이 아니라 설정 여부만 내린다. 콘솔이 토큰을 들고 있어도
         *   그게 API 키를 볼 권한은 아니다.
         */
        aiKeyConfigured: (process.env.OPENAI_API_KEY ?? '').length > 0,
      },
    });
  } catch (error) {
    reportError(error, 'admin/overview');
    return fail('error');
  }
}
