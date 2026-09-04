/**
 * POST /api/admin/regenerate — **이 기간을 한 번 더 열어준다** (`docs/ADMIN_SYSTEM.md` §3.6).
 *
 * *"리포트가 별로예요"* 문의가 오면 프롬프트를 고친 뒤 여기서 열고 답변에 *"다시 만들어
 * 보세요"* 라고 쓴다. 그전까지 문의 답변에 쓸 수 있는 말은 *"죄송합니다"* 뿐이었다.
 *
 * 🔴 **콘솔의 첫 쓰기다.** `ADMIN_SYSTEM` §4가 *"읽기 전용이다(v1)"* 였고 이것이 그 예외다 —
 *   그래서 **좁게** 만든다: 정수도 아니고 불리언 하나, 대상은 운영자가 직접 타이핑한
 *   `(subject, kind, periodKey)` 하나, 없는 행은 만들지 않는다.
 *
 * 🚫 **행을 새로 만들지 않는다.** 아직 만든 적 없는 기간은 열 이유가 없고(문의는 항상
 *   만든 뒤에 온다), 만들면 *"쓴 적 없는데 캡을 먹은 기간"* 이 생긴다.
 *
 * ⚠ 여는 것은 **1회용**이다. 사용자가 다시 만들면 라우트가 조건부 UPDATE로 소모한다.
 */
import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { aiUsage } from '@/db/schema';
import { isAdmin } from '@/lib/admin';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';

export const dynamic = 'force-dynamic';

const KINDS = new Set(['weekly', 'monthly', 'yearly']);

/** 메모 길이. 길게 쓸 곳이 아니다 — 문의 번호와 무엇을 고쳤는지면 충분하다 */
const MAX_NOTE = 200;

interface Body {
  subject?: unknown;
  kind?: unknown;
  periodKey?: unknown;
  note?: unknown;
  /** `false`를 주면 되돌린다(실수로 열었을 때) */
  open?: unknown;
}

export async function POST(req: Request): Promise<Response> {
  if (!isAdmin(req)) {
    return fail('unauthorized');
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail('error');
  }

  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const kind = typeof body.kind === 'string' ? body.kind : '';
  const periodKey = typeof body.periodKey === 'string' ? body.periodKey.trim() : '';
  const open = body.open !== false;
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, MAX_NOTE) : '';

  if (subject.length === 0 || !KINDS.has(kind) || periodKey.length === 0) {
    return fail('error');
  }

  try {
    /*
     * ⚠ **`returning`으로 실제로 바뀐 행을 센다.** 0이면 *"그런 기간이 없다"* 이고,
     *   그건 오류가 아니라 **운영자가 알아야 할 사실**이다 — subject나 기간 키를
     *   잘못 옮겨 적었을 때 조용히 성공으로 보이면 답변만 보내고 아무 일도 안 일어난다.
     */
    const changed = await db
      .update(aiUsage)
      .set({
        regenerate: open,
        // 되돌릴 때는 메모도 지운다 — 남아 있으면 "왜 열려 있지"의 반대로 헷갈린다
        regenerateNote: open ? (note.length === 0 ? null : note) : null,
      })
      .where(
        and(
          eq(aiUsage.subjectId, subject),
          eq(aiUsage.kind, kind),
          eq(aiUsage.periodKey, periodKey),
        ),
      )
      .returning({ id: aiUsage.id });

    /*
     * ⚠ **0건도 성공으로 돌려주되 개수를 실어 보낸다.** `FailCode` 는 앱까지 쓰는 공용
     *   union 이라 관리자 전용 사정으로 넓히지 않는다 — 대신 화면이 `changed` 를 보고
     *   *"그런 기간이 없습니다"* 라고 말한다.
     */
    return ok({ open, periodKey, kind, changed: changed.length });
  } catch (error) {
    reportError(error, 'admin/regenerate');
    return fail('error');
  }
}
