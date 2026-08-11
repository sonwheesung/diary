import type { Config } from 'drizzle-kit';

// 마이그레이션은 Session/Direct(:5432) 문자열로 돌린다 — Transaction 풀러(:6543)는 DDL에 부적합.
// 로컬은 Supabase 스택의 :54322 가 곧 Direct다.
export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  },
} satisfies Config;
