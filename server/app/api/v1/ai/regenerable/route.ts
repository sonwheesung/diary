/**
 * GET /api/v1/ai/regenerable — **운영자가 다시 열어준 기간들** (`docs/AI_REPORT_SYSTEM.md` §6.6).
 *
 * 앱의 기간 시트는 이미 만든 기간을 `blocked: 'exists'`로 잠근다. 서버가 열어줘도 앱이
 * 그 사실을 모르면 **고를 수가 없다** — 그래서 이 라우트가 있다.
 *
 * 🔴 **구독 게이트를 걸지 않는다.** 여기서 나가는 것은 *"어느 기간이 열려 있나"* 뿐이고,
 *   실제 생성은 `POST /ai/report`가 다시 판정한다. 구독이 끊긴 사람에게도 화면이
 *   *"다시 만들 수 있어요"* 를 못 보여줄 이유가 없다 — 누르면 그때 정직하게 막힌다.
 *
 * ⚠ 목록이 길 수 없다. 운영자가 문의에 답하며 하나씩 여는 것이라 보통 0~1개다.
 */
import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { aiUsage } from '@/db/schema';
import { identify } from '@/lib/auth';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const id = await identify(req);
  if (id === 'unauthenticated') return fail('unauthorized');
  if (id === 'upstream') return fail('upstream');

  try {
    const rows = await db
      .select({ kind: aiUsage.kind, periodKey: aiUsage.periodKey })
      .from(aiUsage)
      .where(and(eq(aiUsage.subjectId, id.subjectId), eq(aiUsage.regenerate, true)));

    /*
     * ⚠ `regenerateNote`는 **안 내려준다.** 그건 우리끼리의 메모("문의 #123")이지
     *   사용자에게 보여줄 글이 아니다. 화면은 *"다시 만들 수 있어요"* 만 말하면 된다.
     */
    return ok({ periods: rows });
  } catch (error) {
    reportError(error, 'ai.regenerable');
    return fail('error');
  }
}
