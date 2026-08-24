import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { aiCooldowns, aiReports, aiUsage } from '@/db/schema';
import { identify } from '@/lib/auth';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';

export const dynamic = 'force-dynamic';

/**
 * 탈퇴할 때 그 subject의 AI 데이터를 지운다 (`docs/AI_REPORT_SYSTEM.md` §7.1).
 *
 * ## 왜 있나 — 게시한 문장이 사실이 아니었다
 *
 * `DELETE_ACCOUNT` §3이 *"탈퇴하면 … AI 리포트 요약문과 리포트 이용 기록이 파기된다"* 고
 * 적었는데 **그렇게 하는 코드가 없었다**(2026-08-24 발견). `purgeVault`는 AI 테이블을
 * import조차 안 했고 `delete(aiReports)`는 리퍼(90일)에만 있었다.
 *
 * Play 블로커는 아니었다(삭제 배지 조건은 `or`). 그래도 고치는 이유는 **여기 남는 것이
 * 서버에서 유일하게 사람이 읽을 수 있는 일기 파생물**이기 때문이다 — 백업은 암호문이라
 * 우리도 못 읽는다.
 *
 * ## 왜 `backup/delete`에 얹지 않았나
 *
 * 그 라우트는 **탈퇴가 아닌 경우에도** 쓰인다(백업만 파기). 거기에 넣으면 백업만 지우려던
 * 사람의 리포트까지 사라진다. 계정 범위와 금고 범위는 다르다.
 *
 * ## 규율
 *
 * - **구독을 요구하지 않는다.** 지우는 것을 막을 이유가 없다(`backup/delete`와 같다).
 * - **멱등이다.** 지울 것이 없어도 200이다 — 앱이 재시도할 수 있어야 한다.
 * - **묘비를 남기지 않는다.** 앱 안 리포트 삭제는 `(kind, period_key)`를 남기지만
 *   (캡과 로컬이 갈라지는 것을 막으려고, `CLAUDE.md` §12 2026-08-18), 탈퇴는 다르다 —
 *   지킬 캡이 없다. 그 `subject_id`로는 다시 못 들어온다(§7.2).
 * - **본문을 로그에 남기지 않는다.** `reportError`에 넘기는 것은 에러와 태그뿐이다(§5.1-5).
 */
export async function POST(req: Request) {
  const identity = await identify(req);
  if (identity === 'unauthenticated') return fail('unauthorized');
  if (identity === 'upstream') return fail('upstream');

  const subjectId = identity.subjectId;

  try {
    /*
     * 세 테이블을 한 트랜잭션으로 묶는다. 일부만 지워진 채 앱이 "성공"으로 알고 탈퇴를
     * 진행하면, 남은 행을 지울 권한이 있는 사람이 사라진다 — 부분 성공이 가장 나쁘다.
     */
    const counts = await db.transaction(async (tx) => {
      const reports = await tx
        .delete(aiReports)
        .where(eq(aiReports.subjectId, subjectId))
        .returning({ id: aiReports.id });
      const usage = await tx
        .delete(aiUsage)
        .where(eq(aiUsage.subjectId, subjectId))
        .returning({ id: aiUsage.id });
      /*
       * `ai_cooldowns`는 처리방침이 명시하지 않지만 같은 성질이다(subject 키, 탈퇴 후 무의미).
       * 남겨둘 이유가 없다.
       */
      const cooldowns = await tx
        .delete(aiCooldowns)
        .where(eq(aiCooldowns.subjectId, subjectId))
        .returning({ subjectId: aiCooldowns.subjectId });

      return { reports: reports.length, usage: usage.length, cooldowns: cooldowns.length };
    });

    return ok(counts);
  } catch (error) {
    reportError(error, 'ai/purge');
    return fail('error');
  }
}
