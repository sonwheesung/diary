/**
 * GET /api/admin/reports — 생성된 리포트 열람 (`docs/AI_REPORT_SYSTEM.md` §5.2).
 *
 * 이 라우트가 존재하는 이유는 하나다: **리포트가 좋은지 나쁜지 볼 방법이 없으면
 * 프롬프트를 고칠 근거가 없다.** 그래서 §5.1의 무저장을 뒤집었고, 처리방침도 함께 고쳤다.
 *
 * 🔴 **`subject_id`는 입력으로만 쓰고 출력으로는 내보내지 않는다**(`ADMIN_SYSTEM` §3).
 *
 *   §3이 막으려던 것은 **훑어보기**다 — 콘솔이 subject 목록을 보여주면 common_server의
 *   이메일과 맞춰 *"이 사람은 이런 일기를 쓴다"* 가 만들어진다. 그런데 *"리포트가 별로예요"*
 *   라고 **문의를 보낸 사람의 리포트를 여는 것**은 그것이 아니다 — 문의가 입구이고,
 *   그 사람이 스스로 연 문이다. 그리고 처리방침이 이미 *"리포트를 만든 계정 식별자"* 를
 *   저장한다고 고지했고, *"90일 전에 삭제를 원하시면 문의하기로 요청"* 까지 약속해뒀다.
 *
 *   그래서 선은 여기다:
 *
 *   | | |
 *   |---|---|
 *   | ✅ `?subject=<id>` | **이미 아는 한 사람**을 조회한다(문의에서 얻는다) |
 *   | 🚫 응답의 `subjectId` | **끝까지 안 넣는다.** 없으면 화면이 목록을 못 만든다 |
 *   | 🚫 subject 목록·자동완성 | 만들지 않는다. 그게 훑어보기다 |
 *
 *   ⚠ 필터로 쓰면서 출력에서 빼는 것이 이상해 보이지만 **그게 핵심이다** —
 *     부르는 쪽은 이미 그 값을 알고 있고(직접 넣었다), 응답에 없으면
 *     *"모르는 subject를 알게 되는"* 경로가 원리적으로 안 생긴다.
 *
 * ⚠ 신고(`flagged`)된 것을 먼저 본다. 정상 리포트 1,000건보다 *"이건 이상하다"* 5건이
 *   프롬프트를 고치는 데 훨씬 직접적이다.
 */
import { and, desc, eq, sql } from 'drizzle-orm';

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
    /*
     * 문의를 보낸 사람의 리포트만 본다. 빈 문자열은 **안 준 것과 같게** 다룬다 —
     * `?subject=` 로 실수로 비면 전체가 열리는 것이 아니라 평소와 같이 익명 목록이다.
     */
    const subject = (params.get('subject') ?? '').trim();
    const bySubject = subject.length > 0 ? eq(aiReports.subjectId, subject) : undefined;

    const filters = [
      bySubject,
      onlyFlagged ? eq(aiReports.flagged, true) : onlyConcern ? eq(aiReports.concern, true) : undefined,
    ].filter((c) => c !== undefined);
    const where = filters.length === 0 ? undefined : and(...filters);

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
      .where(where)
      /* 신고된 것 → 최신순. 고칠 거리가 위로 온다 */
      .orderBy(desc(aiReports.flagged), desc(aiReports.createdAt))
      .limit(LIMIT);

    /*
     * ⚠ 집계도 **같은 subject 범위**로 좁힌다. 안 좁히면 화면이 *"이 사람 리포트 3건"* 옆에
     *   전체 개수를 나란히 띄워 두 숫자가 다른 것을 세게 된다.
     */
    const [counts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        flagged: sql<number>`count(*) filter (where ${aiReports.flagged})::int`,
        concern: sql<number>`count(*) filter (where ${aiReports.concern})::int`,
      })
      .from(aiReports)
      .where(bySubject);

    return ok({
      reports: rows,
      counts: counts ?? { total: 0, flagged: 0, concern: 0 },
      /** 화면이 "왜 옛 것이 없는지"를 설명할 수 있게 함께 내린다 */
      retentionDays: REPORT_RETENTION_MS / 86_400_000,
      limit: LIMIT,
      /*
       * 🔴 **한 사람으로 좁혀 보는 중인가**(불리언 하나). 그 사람의 id는 **안 돌려준다** —
       *   화면은 "좁혀져 있다"만 말하면 되고, 값은 부른 쪽이 이미 갖고 있다.
       */
      scoped: bySubject !== undefined,
    });
  } catch (error) {
    reportError(error, 'admin/reports');
    return fail('error');
  }
}
