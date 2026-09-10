/**
 * `GET /api/v1/ai/reports` — **서버가 갖고 있는 내 리포트 목록**
 * (`docs/AI_REPORT_SYSTEM.md` §5.6).
 *
 * 🔴 **왜 필요한가**: 리포트의 진실은 로컬인데(`CLAUDE.md` §5.1), 로컬이 없어지는 경로가 셋 있다.
 *   ① 생성 도중 앱이 죽는다 ② **재설치** ③ **기기 2대**. 캡은 `uq_ai_usage_period` 라 평생 1회여서
 *   그 기간은 다시 만들지 못하는데, 글은 서버에 90일 남아 있었고 **가져올 길만 없었다.**
 *   `docs/AI_REPORT_SYSTEM.md` 가 오래 ⏭ 로 적어둔 *"서버가 쓴 기간 목록을 알려주는 경로"* 다.
 *
 * 🟢 **모델을 부르지 않는다.** 캡·일일 호출 수·잠금을 건드리지 않는다. 원가 0이다.
 *
 * 🔴 **되살릴지는 앱이 정한다.** 서버는 갖고 있는 것을 말할 뿐이고, 앱은 **묘비**(§11.9)를 보고
 *   *"사용자가 지운 것"* 은 되살리지 않는다. 그 판단을 서버로 올리면 삭제 의도가 서버까지
 *   올라가야 하고, 그건 이 앱이 하지 않기로 한 일이다.
 *
 * ⚠ **일일 한도를 같이 싣는다.** 리포트 화면이 *"오늘 몇 개 더 만들 수 있나"* 를 누르기 **전에**
 *   말해야 하는데(§6.3), 그 값의 진실은 서버다. 같은 화면이 같은 순간에 쓰는 두 값이라
 *   왕복을 둘로 나누지 않는다.
 */
import { and, eq, gte, sql } from 'drizzle-orm';

import { db } from '@/db';
import { aiReports, aiUsage } from '@/db/schema';
import { DAILY_CALL_CAP } from '@/lib/ai-policy';
import { identify } from '@/lib/auth';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';

export const dynamic = 'force-dynamic';

/**
 * 한 번에 돌려주는 최대 행. 기간 캡이 평생 1회라 서로 다른 `(kind, period_key)` 는
 * 백필 지평(약 1.7년) 안에서 **109개 남짓**이 상한이다. 넉넉히 잡되 무제한은 아니다.
 */
const MAX_ROWS = 400;

/** `YYYY-MM-DD`(UTC). 일일 캡의 기준 — `report/route.ts` 와 **같은 정의여야 한다** */
function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: Request): Promise<Response> {
  const id = await identify(req);
  if (id === 'unauthenticated') return fail('unauthorized');
  if (id === 'upstream') return fail('upstream');

  try {
    /*
     * 🔴 **기간마다 최신 리비전 하나만.** 서버는 재생성 이력을 전부 쌓지만(§6.6)
     *   사용자는 최종본만 본다. `DISTINCT ON` 대신 정렬 뒤 앱단에서 고르면 400행을
     *   전부 실어 보내게 되므로 SQL 에서 좁힌다.
     */
    const rows = await db
      .select({
        kind: aiReports.kind,
        periodKey: aiReports.periodKey,
        lang: aiReports.lang,
        headline: aiReports.headline,
        headlineFrom: aiReports.headlineFrom,
        summary: aiReports.summary,
        concern: aiReports.concern,
        sourceCount: aiReports.sourceCount,
        metrics: aiReports.metrics,
        model: aiReports.model,
        promptVer: aiReports.promptVer,
        revision: aiReports.revision,
        createdAt: aiReports.createdAt,
      })
      .from(aiReports)
      .where(eq(aiReports.subjectId, id.subjectId))
      .orderBy(
        aiReports.kind,
        aiReports.periodKey,
        sql`${aiReports.revision} desc`,
        sql`${aiReports.createdAt} desc`,
      )
      .limit(MAX_ROWS);

    const latest = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      const key = `${row.kind}:${row.periodKey}`;
      if (!latest.has(key)) latest.set(key, row);
    }

    const [dayRow] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(aiUsage)
      .where(and(eq(aiUsage.subjectId, id.subjectId), eq(aiUsage.day, utcDay())));

    const reports = [...latest.values()].map((row) => {
      /*
       * ⚠ 저장은 JSON **문자열**이다(스키마 주석). 깨져 있으면 그 조각만 버리고 본문은 준다 —
       *   목적은 글이지 지표가 아니다.
       */
      let metrics: unknown;
      let topics: unknown;
      if (row.metrics !== null) {
        try {
          const parsed = JSON.parse(row.metrics) as { metrics?: unknown; topics?: unknown };
          metrics = parsed.metrics;
          topics = parsed.topics;
        } catch {
          /* 지표 없이 간다 */
        }
      }
      let headlineFrom: unknown;
      if (row.headlineFrom !== null) {
        try {
          headlineFrom = JSON.parse(row.headlineFrom);
        } catch {
          /* 근거 키가 없으면 화면이 그 블록을 안 그린다 */
        }
      }
      return {
        kind: row.kind,
        periodKey: row.periodKey,
        lang: row.lang,
        headline: row.headline ?? undefined,
        headlineFrom,
        summary: row.summary,
        concern: row.concern,
        sourceCount: row.sourceCount,
        metrics,
        topics,
        model: row.model ?? '',
        promptVer: row.promptVer ?? 0,
        createdAt: row.createdAt.toISOString(),
      };
    });

    return ok({
      reports,
      /* 오늘 몇 개 썼고 몇 개까지인가. 화면이 **누르기 전에** 말한다 */
      dailyUsed: dayRow?.n ?? 0,
      dailyCap: DAILY_CALL_CAP,
    });
  } catch (error) {
    reportError(error, 'ai.reports-list');
    return fail('error');
  }
}
