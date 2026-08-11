/**
 * Storage 초기 설정 — `npm run setup:storage`
 *
 * 버킷 생성을 **클릭이 아니라 코드로** 둔다. stg와 운영을 같은 절차로 세워야
 * "stg에서는 되는데 운영에서는 안 된다"가 생기지 않는다.
 *
 * ⚠ **비공개 버킷이다.** 공개로 만들면 경로만 알면 누구나 암호문을 받아갈 수 있다.
 *   암호는 여전히 못 풀지만, 누가 언제 얼마나 백업했는지가 그대로 드러난다.
 *
 * ⚠ 멱등하다. 이미 있으면 설정만 확인하고 끝낸다.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const BUCKET = 'backups'; // ⚠ lib/storage.ts의 BUCKET 상수와 같아야 한다

if (url.length === 0 || key.length === 0) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 없다. .env.local을 확인한다.');
  process.exit(1);
}
// ⚠ 키는 절대 찍지 않는다. 어디에 붙는지만 알린다.
console.log(`대상: ${url}`);

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: existing } = await supabase.storage.getBucket(BUCKET);
if (existing !== null) {
  console.log(`버킷 '${BUCKET}' 이미 있음 — public=${existing.public}`);
  if (existing.public) {
    console.error('🔴 공개 버킷이다. 비공개로 바꿔야 한다.');
    process.exit(1);
  }
} else {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
  if (error !== null) {
    console.error(`버킷 생성 실패: ${error.message}`);
    process.exit(1);
  }
  console.log(`버킷 '${BUCKET}' 생성 — 비공개`);
}

/*
 * 왕복 한 번. 서명 URL 발급과 PUT이 실제로 도는지 여기서 확인한다 —
 * e2e를 돌리기 전에 "설정이 됐는가"와 "코드가 맞는가"를 분리해서 본다.
 */
const probe = `__setup-probe/${Date.now()}`;
const signed = await supabase.storage.from(BUCKET).createSignedUploadUrl(probe);
if (signed.error !== null) {
  console.error(`서명 URL 발급 실패: ${signed.error.message}`);
  process.exit(1);
}
const put = await fetch(signed.data.signedUrl, {
  method: 'PUT',
  headers: { 'content-type': 'application/octet-stream' },
  body: new Uint8Array(64).fill(7),
});
if (!put.ok) {
  console.error(`서명 URL PUT 실패: HTTP ${put.status}`);
  process.exit(1);
}
await supabase.storage.from(BUCKET).remove([probe]);
console.log('서명 URL 발급 → PUT → 삭제 왕복 ok');
console.log('\n다음: npm run db:push  →  npm run e2e');
