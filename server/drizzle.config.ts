import { existsSync } from 'node:fs';

import type { Config } from 'drizzle-kit';

/**
 * ⚠ **drizzle-kit은 `.env.local`을 스스로 읽지 않는다.**
 *
 * 예전에는 안 읽힌 자리를 `127.0.0.1:54422` 폴백이 메웠다. 그래서 stg를 향해 `db:push`를
 * 했는데 **로컬 도커 DB를 보고 "No changes detected"** 를 출력했다 — 엉뚱한 DB에 대고
 * 성공했다고 말하는 것이라 가장 나쁜 실패다. 폴백을 없애고 **없으면 소리 내어 죽는다.**
 */
if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

const url = process.env.DATABASE_URL ?? '';
if (url.length === 0) {
  throw new Error('DATABASE_URL이 없다 — server/.env.local을 확인한다.');
}
if (url.includes('[YOUR-PASSWORD]')) {
  throw new Error('DATABASE_URL에 자리표시자가 남아 있다 — 비밀번호를 채운다.');
}

// 마이그레이션은 Session/Direct(:5432) 문자열로 돌린다 — Transaction 풀러(:6543)는 DDL에 부적합.
if (url.includes(':6543')) {
  throw new Error('Transaction 풀러(:6543)로는 DDL을 돌리지 않는다. Session/Direct(:5432)를 쓴다.');
}

// ⚠ **어디에 붙는지 반드시 보인다.** 비밀번호는 찍지 않는다 — 호스트만.
console.log(`[drizzle] 대상: ${new URL(url).host}`);

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
} satisfies Config;
