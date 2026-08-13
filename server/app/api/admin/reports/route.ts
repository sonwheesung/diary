/**
 * GET /api/admin/reports — 생성된 리포트 열람 (`docs/AI_REPORT_SYSTEM.md` §5.2).
 *
 * 이 라우트가 존재하는 이유는 하나다: **리포트가 좋은지 나쁜지 볼 방법이 없으면
 * 프롬프트를 고칠 근거가 없다.** 그래서 §5.1의 무저장을 뒤집었고, 처리방침도 함께 고쳤다.
 *
 * 🔴 **`subject_id`를 내려주지 않는다**(`ADMIN_SYSTEM` §3). 요약문은 품질을 보려고 읽는 것이지
 *   누가 썼는지 알려고 읽는 것이 아니다. 정렬·필터에 필요한 것도 없다 —
 *   있으면 common_server의 이메일과 맞춰 *"이 사람은 이런 일기를 쓴다"* 가 만들어진다.
 *
 * ⚠ 신고(`flagged`)된 것을 먼저 본다. 정상 리포트 1,000건보다 *"이건 이상하다"* 5건이
 *   프롬프트를 고치는 데 훨씬 직접적이다.
 */
import { desc, eq, sql } from 'drizzle-orm';

import { db } from '@/db';
import { aiReports } from '@/db/schema';
import { isAdmin } from '@/lib/admin';
import { REPORT_RETENTION_MS } from '@/lib/ai-policy';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';

export const dynamic = 'force-dynamic';

/** 한 번에 가져올 개수. 페이지네이션을 만들지 않는다 — 읽고 고치는 화면이지 감사 도구가 아니다 */
const LIMIT = 50;

export async function GET(req: Request): Promise<Response> {
  if (!isAdmin(req)) {
    return fail('unauthorized');
  }
  try {
    const params = new URL(req.url).searchParams;
    const onlyFlagged = params.get('flagged') === '1';
    const onlyConcern = params.get('concern') === '1';

    const rows = await db
      .select({
        id: aiReports.id,
        kind: aiReports.kind,
        periodKey: aiReports.periodKey,
        lang: aiReports.lang,
        summary: aiReports.summary,
        concern: aiReports.concern,
        sourceCount: aiReports.sourceCount,
        model: aiReports.model,
        promptVer: aiReports.promptVer,
        flagged: aiReports.flagged,
        createdAt: aiReports.createdAt,
        // 🔴 subjectId를 여기 넣지 않는다 — 위 주석 참조
      })
      .from(aiReports)
      .where(
        onlyFlagged
          ? eq(aiReports.flagged, true)
          : onlyConcern
            ? eq(aiReports.concern, true)
            : undefined,
      )
      /* 신고된 것 → 최신순. 고칠 거리가 위로 온다 */
      .orderBy(desc(aiReports.flagged), desc(aiReports.createdAt))
      .limit(LIMIT);

    const [counts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        flagged: sql<number>`count(*) filter (where ${aiReports.flagged})::int`,
        concern: sql<number>`count(*) filter (where ${aiReports.concern})::int`,
      })
      .from(aiReports);

    return ok({
      reports: rows,
      counts: counts ?? { total: 0, flagged: 0, concern: 0 },
      /** 화면이 "왜 옛 것이 없는지"를 설명할 수 있게 함께 내린다 */
      retentionDays: REPORT_RETENTION_MS / 86_400_000,
      limit: LIMIT,
    });
  } catch (error) {
    reportError(error, 'admin/reports');
    return fail('error');
  }
}
