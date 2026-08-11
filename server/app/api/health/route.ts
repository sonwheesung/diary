import { sql } from 'drizzle-orm';

import { db, dbConfigured } from '@/db';
import { reportError } from '@/lib/observability';
import { storageConfigured } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * 상태 확인. **인증 없이** 열어둔다 — 배포가 살아 있는지 보는 용도라
 * 여기가 막혀 있으면 장애 때 제일 먼저 필요한 정보를 못 얻는다.
 *
 * 개인정보나 설정값을 돌려주지 않는다. "설정됨/안 됨"과 "붙음/안 붙음"만이다.
 */
export async function GET() {
  let dbState: 'up' | 'down' | 'unset' = dbConfigured() ? 'down' : 'unset';
  try {
    await db.execute(sql`select 1`);
    dbState = 'up';
  } catch (error) {
    reportError(error, 'health db');
  }

  return Response.json({
    ok: dbState === 'up',
    db: dbState,
    storage: storageConfigured() ? 'configured' : 'unset',
    at: new Date().toISOString(),
  });
}
