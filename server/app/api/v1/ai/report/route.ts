import { and, eq, sql } from 'drizzle-orm';

/*
 * 🔴 **프롬프트를 복사하지 않는다.** `@shared/*` → `../features/*`(tsconfig paths)로
 *   앱과 **같은 파일**을 쓴다. 프롬프트가 사실상 상품이라(§8) 두 벌이 되는 순간
 *   앱이 보는 규약과 서버가 실제로 쓰는 규약이 조용히 갈라진다.
 *
 * ⚠ 이게 가능한 이유는 `features/ai/{prompt,types}.ts`가 **순수 계층**(내부 임포트 0)이기
 *   때문이다. RN·Expo 것을 하나라도 들이면 이 임포트가 깨진다 — 그 규약을 지킨다.
 */
import { buildSystem, buildUser, isEmpty } from '@shared/ai/prompt';
import { PROMPT_VERSION, REPORT_SCHEMA } from '@shared/ai/types';
import type { BuildPromptArgs, ReportKind } from '@shared/ai/types';
import { db } from '@/db';
import { aiCooldowns, aiReports, aiUsage } from '@/db/schema';
import { generateReport } from '@/lib/ai';
import {
  DAILY_CALL_CAP,
  FAILURE_COOLDOWN_MS,
  IN_FLIGHT_TTL_MS,
  MAX_INPUT_CHARS,
  MONTHLY_PER_MONTH,
  WEEKLY_PER_WEEK,
  YEARLY_PER_YEAR,
} from '@/lib/ai-policy';
import { identify } from '@/lib/auth';
import { notifyAiFailure } from '@/lib/notify';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';
import { createHash } from 'node:crypto';

/**
 * subject 식별자의 해시 앞 8자.
 *
 * ⚠ 알림·진단에 **원본을 쓰지 않는다**(`ADMIN_SYSTEM` §3). 앞자리만으로
 *   *"같은 사람이 반복 실패하는가"* 는 알 수 있고 신원은 만들 수 없다.
 */
function subjectRef(subjectId: string): string {
  return createHash('sha256').update(subjectId).digest('hex').slice(0, 8);
}

/**
 * `POST /api/v1/ai/report` — AI 요약 리포트 프록시.
 *
 * 🔴 **무저장이다.** 일기 평문이 이 함수를 지나가지만 어디에도 쓰지 않는다.
 *   남는 것은 `ai_usage`의 카운터와 토큰 수뿐이고, 그건 메타데이터라 저장한다고 고지한다.
 *   → 그래서 고지가 백업과 **정반대**다: *"저장하지 않습니다"(O) / "볼 수 없습니다"(X)*.
 *
 * 🔴 **본문을 로그에 남기지 않는다.** `reportError`에 넘기는 것은 에러와 짧은 코드뿐이다.
 *   요청 body·프롬프트·응답 텍스트를 관측 경로에 넣지 않는다(CLAUDE.md §5.1-5).
 *
 * 설계 정본: `docs/AI_REPORT_SYSTEM.md` §7
 */

/**
 * LLM 왕복은 길다. Vercel 기본값(10~15초)이면 정상 응답도 끊긴다.
 *
 * ⚠ 여기서 끊기면 **서버는 성공해 캡을 쓰는데 앱은 실패로 본다** — 사용자가 그 주 리포트를
 *   잃는 가장 나쁜 조합이다. 앱 타임아웃(180초)보다 넉넉히 둔다.
 */
export const maxDuration = 300;

const KINDS: ReportKind[] = ['weekly', 'monthly', 'yearly'];

const PERIOD_CAP: Record<ReportKind, number> = {
  weekly: WEEKLY_PER_WEEK,
  monthly: MONTHLY_PER_MONTH,
  yearly: YEARLY_PER_YEAR,
};

/**
 * 진행 중인 멱등 키.
 *
 * ⚠ **결과를 담지 않는다** — 무저장 원칙이다. 키와 시각만 있다. 그래서 중복 과금은 막지만
 *   놓친 응답을 다시 줄 수는 없다. 그 한계를 알고 쓴다.
 *
 * ⚠ 모듈 스코프라 **람다 인스턴스마다 따로다.** 완벽한 멱등이 아니라 "같은 인스턴스에서의
 *   빠른 재시도"를 막는 수준이고, 이 규모에는 그걸로 충분하다. 진짜 멱등이 필요해지면
 *   DB로 옮긴다 — 그때 "무엇을 저장하는가"를 다시 판단해야 한다.
 */
const g = globalThis as unknown as { __aiInFlight?: Map<string, number> };
const inFlight = (g.__aiInFlight ??= new Map<string, number>());

function claim(reportId: string): boolean {
  const now = Date.now();
  // 지나간 키를 치운다. 안 치우면 인스턴스가 살아 있는 동안 계속 쌓인다
  for (const [key, at] of inFlight) {
    if (now - at > IN_FLIGHT_TTL_MS) inFlight.delete(key);
  }
  if (inFlight.has(reportId)) return false;
  inFlight.set(reportId, now);
  return true;
}

interface Body {
  reportId?: unknown;
  kind?: unknown;
  periodKey?: unknown;
  lang?: unknown;
  entries?: unknown;
  subReports?: unknown;
}

/** `YYYY-MM-DD`(UTC). 일일 캡의 기준 */
function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(req: Request): Promise<Response> {
  const id = await identify(req);
  if (id === 'unauthenticated') return fail('unauthorized');
  // ⚠ 상류 장애는 503이다. 401을 주면 앱 SDK가 세션을 폐기해 사용자가 로그아웃된다
  if (id === 'upstream') return fail('upstream');
  /*
   * ⚠ **생성만 구독을 요구한다.** 목록·상세는 앱 로컬이라 서버가 관여하지 않는다 —
   *   구독이 끝나도 이미 만든 리포트는 계속 보인다(§11.3).
   */
  if (!id.pro) return fail('not-subscribed');

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail('error');
  }

  const reportId = typeof body.reportId === 'string' ? body.reportId : null;
  const kind = KINDS.includes(body.kind as ReportKind) ? (body.kind as ReportKind) : null;
  const periodKey = typeof body.periodKey === 'string' ? body.periodKey : null;
  const lang = typeof body.lang === 'string' && body.lang.length > 0 ? body.lang : 'en';
  if (reportId === null || kind === null || periodKey === null) {
    return fail('error');
  }

  const args: BuildPromptArgs = {
    kind,
    lang,
    periodKey,
    entries: Array.isArray(body.entries) ? (body.entries as BuildPromptArgs['entries']) : [],
    subReports: Array.isArray(body.subReports)
      ? (body.subReports as BuildPromptArgs['subReports'])
      : [],
  };

  // 앱이 이미 막지만 서버도 본다 — 앱은 고칠 수 없는 버전이 남는다
  if (isEmpty(args)) return fail('empty');

  const system = buildSystem(args);
  const user = buildUser(args);
  if (system.length + user.length > MAX_INPUT_CHARS) {
    return fail('too-large');
  }

  /*
   * 캡을 **부르기 전에** 본다. 부른 뒤에 보면 이미 돈이 나갔다.
   *
   * ⚠ 기간 캡과 일일 캡은 다른 것을 막는다 — §ai-policy.ts 참조.
   */
  let periodUsed: number;
  let dayUsed: number;
  try {
    const [periodRow] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(aiUsage)
      .where(
        and(
          eq(aiUsage.subjectId, id.subjectId),
          eq(aiUsage.kind, kind),
          eq(aiUsage.periodKey, periodKey),
        ),
      );
    const [dayRow] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(aiUsage)
      .where(and(eq(aiUsage.subjectId, id.subjectId), eq(aiUsage.day, utcDay())));
    periodUsed = periodRow?.n ?? 0;
    dayUsed = dayRow?.n ?? 0;
  } catch (error) {
    reportError(error, 'ai.cap-read');
    return fail('error');
  }

  if (periodUsed >= PERIOD_CAP[kind]) return fail('cap-exceeded');
  if (dayUsed >= DAILY_CALL_CAP) return fail('rate-limited');

  /*
   * 🔴 **실패 잠금** (§5.1). 위의 일일 캡은 `ai_usage` 행을 세는데 그 행은 **성공에만** 쓰인다 —
   *   즉 실패는 일일 캡에 안 잡혀 **실패하는 루프가 무제한이었다.** 비싼 쪽이 실패인데도.
   *
   * ⚠ 캡이 아니다. 한 시간 뒤 같은 기간을 그대로 다시 만들 수 있다.
   */
  try {
    const [cooldown] = await db
      .select({ until: aiCooldowns.until })
      .from(aiCooldowns)
      .where(eq(aiCooldowns.subjectId, id.subjectId));
    if (cooldown !== undefined && cooldown.until.getTime() > Date.now()) {
      return fail('cooling-down', { retryAt: cooldown.until.toISOString() });
    }
  } catch (error) {
    /*
     * ⚠ 잠금을 못 읽었다고 요청을 막지 않는다. 이건 크레딧 방어이지 보안 게이트가 아니고,
     *   위에 일일 캡과 기간 캡이 이미 있다. 여기서 fail-closed로 가면 DB가 잠깐 흔들릴 때
     *   멀쩡한 사용자가 리포트를 못 만든다.
     */
    reportError(error, 'ai.cooldown-read');
  }

  // 멱등 키. 앱이 응답을 놓치고 재시도해도 두 번 부르지 않는다
  if (!claim(reportId)) return fail('in-progress');

  try {
    const result = await generateReport({ system, user, schema: REPORT_SCHEMA });

    if (!result.ok) {
      /*
       * 🔴 **실패는 캡을 소모하지 않는다.** `ai_usage`에 행을 쓰지 않고 나간다 —
       *   거부·타임아웃은 우리 사정이고, 그것 때문에 그 주 리포트를 영영 잃으면 안 된다(§5).
       *
       * 🔴 대신 **1시간 잠근다**(§5.1) — 모델이 실제로 돌고 실패한 것은 토큰이 이미 청구됐다.
       *   `not-configured`만 예외다: 아예 부르지 않았으므로 돈이 안 나갔고,
       *   그건 사용자 잘못이 아니라 **배포 사고**라 잠그면 애먼 사람을 막는다.
       */
      const calledModel = result.reason !== 'not-configured';
      if (calledModel) {
        try {
          const until = new Date(Date.now() + FAILURE_COOLDOWN_MS);
          await db
            .insert(aiCooldowns)
            .values({ subjectId: id.subjectId, until, reason: result.reason })
            .onConflictDoUpdate({
              target: aiCooldowns.subjectId,
              set: { until, reason: result.reason },
            });
        } catch (error) {
          reportError(error, 'ai.cooldown-write');
        }
      }
      /*
       * 실패는 대체로 우리 잘못이다(키 만료·벤더 장애·프롬프트 문제). 앱은 원격 관측이 0이라
       * 이게 없으면 **사용자가 문의를 보내야** 안다. fire-and-forget — await하지 않는다.
       */
      notifyAiFailure({
        reason: result.reason,
        kind,
        periodKey,
        subjectRef: subjectRef(id.subjectId),
        cooled: calledModel,
      });

      if (result.reason === 'not-configured') return fail('not-configured');
      if (result.reason === 'refused' || result.reason === 'malformed') return fail('refused');
      if (result.reason === 'truncated') return fail('error');
      return fail('upstream');
    }

    /*
     * 성공했을 때만 +1. 순서가 중요하다 — 먼저 쓰면 실패한 호출이 캡을 먹는다.
     *
     * ⚠ 여기서 실패해도 **리포트는 돌려준다.** 카운터를 못 쓴 것이 사용자가 결과를 잃을
     *   이유는 아니다. 최악이라도 그 기간을 한 번 더 만들 수 있게 되는 것뿐이다.
     */
    try {
      await db.insert(aiUsage).values({
        id: reportId,
        subjectId: id.subjectId,
        kind,
        periodKey,
        day: utcDay(),
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        model: result.model,
      });
    } catch (error) {
      reportError(error, 'ai.usage-write');
    }

    /*
     * 🔴 **리포트 본문을 저장한다** (2026-08-13 사용자 결정, §5.2).
     *
     * ⚠ 저장하는 것은 **모델이 쓴 요약문**이지 일기 원문이 아니다. 입력은 여전히
     *   지나가기만 한다 — 그 구분이 처리방침 문안의 핵심이다.
     *
     * ⚠ 실패해도 **리포트는 돌려준다.** 우리 품질 관측을 위해 저장하는 것이지
     *   사용자가 결과를 받는 조건이 아니다. `ai_usage` 쓰기와 같은 규율.
     */
    try {
      await db.insert(aiReports).values({
        id: reportId,
        subjectId: id.subjectId,
        kind,
        periodKey,
        lang,
        summary: result.summary,
        concern: result.concern,
        sourceCount: (args.entries?.length ?? 0) + (args.subReports?.length ?? 0),
        model: result.model,
        promptVer: PROMPT_VERSION,
      });
    } catch (error) {
      reportError(error, 'ai.report-write');
    }

    return ok({
      summary: result.summary,
      concern: result.concern,
      model: result.model,
      promptVer: PROMPT_VERSION,
    });
  } finally {
    // 성공이든 실패든 놓아준다. 안 놓으면 재시도가 TTL 동안 409를 받는다
    inFlight.delete(reportId);
  }
}
