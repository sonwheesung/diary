/**
 * 서버 왕복 검증 — reserve → 서명 URL PUT → commit → latest → 다운로드.
 *
 * `node scripts/e2e.mjs`  (서버가 :3200에, Supabase 스택이 떠 있어야 한다)
 *
 * ⚠ 이게 검증하는 것은 **서버 계약과 Storage 경로**다. 앱의 암호 계층은
 *   `npm run check:backup-crypto`(앱 쪽)가 이미 본다. 여기서는 봉투 대신 더미 바이트를 쓴다 —
 *   서버는 내용을 모르는 게 정상이고, 그 사실 자체가 확인 대상이다.
 *
 * ⚠ common_server 없이 돌리려면 `AUTH_STUB=1`로 서버를 띄운다.
 */
const BASE = process.env.SERVER_URL ?? 'http://127.0.0.1:3200';
// ⚠ 토큰은 **ASCII만** — HTTP 헤더는 ByteString이라 한글을 넣으면 fetch가 던진다.
const TOKEN = process.env.TEST_TOKEN ?? 'stub-token';

let passed = 0;
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures.push(`${name}\n       ${error.message}`);
    console.log(`  FAIL ${name}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function api(path, body) {
  const res = await fetch(`${BASE}/api/v1/backup/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json() };
}

/** 16바이트 hex — 실제로는 복구 코드에서 HKDF로 유도된다 */
const vaultId = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
const genId = 'a1b2c3d4e5f60718';
const PART_BYTES = 512 * 1024;

console.log(`\n금고 ${vaultId}\n`);

// ── 1. reserve ────────────────────────────────────────────────────────────────
let uploads = [];
await check('reserve — 첫 세대(seq=1)를 예약하고 서명 URL을 받는다', async () => {
  const { status, json } = await api('reserve', { vaultId, seq: 1, genId, partCount: 2 });
  assert(status === 200, `HTTP ${status} ${JSON.stringify(json)}`);
  assert(json.uploads?.length === 2, '업로드 URL 2개');
  uploads = json.uploads;
});

await check('reserve — seq를 건너뛰면 409 (구멍을 만들지 않는다)', async () => {
  const { status, json } = await api('reserve', { vaultId, seq: 5, genId, partCount: 1 });
  assert(status === 409, `HTTP ${status}`);
  assert(json.serverSeq === 0, `serverSeq=${json.serverSeq}`);
});

await check('reserve — 경로 순회를 막는다', async () => {
  const { status } = await api('reserve', { vaultId: '../../etc/passwd', seq: 1, genId, partCount: 1 });
  assert(status === 500 || status === 400, `HTTP ${status}`);
});

// ── 2. 서명 URL PUT ───────────────────────────────────────────────────────────
// **이게 이 스크립트의 핵심이다.** 검증에서 "가장 불확실하다"고 나온 경로다.
const payloads = [];
await check(`서명 URL PUT — 파트당 ${(PART_BYTES / 1024).toFixed(0)}KB 바이너리`, async () => {
  for (const upload of uploads) {
    const bytes = new Uint8Array(PART_BYTES);
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = (i * 31 + upload.part) & 0xff;
    payloads.push(bytes);

    const res = await fetch(upload.signedUrl, {
      method: 'PUT',
      headers: { 'content-type': 'application/octet-stream' },
      body: bytes,
    });
    assert(res.ok, `파트 ${upload.part}: HTTP ${res.status} ${await res.text()}`);
  }
});

// ── 3. commit ─────────────────────────────────────────────────────────────────
await check('commit — 서버가 Storage에 실제 크기를 물어 대조한다', async () => {
  const { status, json } = await api('commit', { vaultId, seq: 1, genId });
  assert(status === 200, `HTTP ${status} ${JSON.stringify(json)}`);
  assert(json.totalBytes === PART_BYTES * 2, `totalBytes=${json.totalBytes} (기대 ${PART_BYTES * 2})`);
});

await check('commit — 재호출은 성공으로 답한다 (응답 유실 재시도, 멱등)', async () => {
  const { status, json } = await api('commit', { vaultId, seq: 1, genId });
  assert(status === 200, `HTTP ${status}`);
  assert(json.alreadyCommitted === true, 'alreadyCommitted');
});

// ── 4. latest + 다운로드 ──────────────────────────────────────────────────────
await check('latest — 완성된 세대의 다운로드 URL을 준다', async () => {
  const { status, json } = await api('latest', { vaultId });
  assert(status === 200, `HTTP ${status} ${JSON.stringify(json)}`);
  assert(json.seq === 1 && json.partCount === 2, `seq=${json.seq} parts=${json.partCount}`);

  for (const download of json.downloads) {
    const res = await fetch(download.url);
    assert(res.ok, `파트 ${download.part} 다운로드 HTTP ${res.status}`);
    const got = new Uint8Array(await res.arrayBuffer());
    const want = payloads[download.part];
    assert(got.length === want.length, `크기 ${got.length} != ${want.length}`);
    for (let i = 0; i < got.length; i += 1) {
      if (got[i] !== want[i]) throw new Error(`파트 ${download.part} 바이트 ${i}가 다르다`);
    }
  }
});

// ── 5. 미완성 세대는 복원에 쓰이지 않는다 ─────────────────────────────────────
await check('미완성 세대는 latest가 무시한다', async () => {
  const nextGen = 'ffffffffffffffff';
  const reserved = await api('reserve', { vaultId, seq: 2, genId: nextGen, partCount: 2 });
  assert(reserved.status === 200, `reserve HTTP ${reserved.status}`);
  // 파트를 하나만 올린다 → 세대 미완성
  const one = reserved.json.uploads[0];
  const res = await fetch(one.signedUrl, { method: 'PUT', body: new Uint8Array(1024) });
  assert(res.ok, `PUT HTTP ${res.status}`);

  const committed = await api('commit', { vaultId, seq: 2, genId: nextGen });
  assert(committed.status === 500, `반쪽 커밋은 거부돼야 한다 (HTTP ${committed.status})`);
  assert(committed.json.detail === 'objects-missing', `detail=${committed.json.detail}`);

  const { json } = await api('latest', { vaultId });
  assert(json.seq === 1, `여전히 seq=1이어야 한다 (받은 값 ${json.seq})`);
});

// ── 6. 큰 파트 ────────────────────────────────────────────────────────────────
/*
 * ⚠ **이게 증명하는 것과 증명하지 못하는 것을 구분한다.**
 *   증명: Storage와 서명 URL이 5MB를 받는다. Vercel 함수 본문 4.5MB 한도를 우회한다.
 *   증명 못 함: **React Native의 fetch가 5MB `Uint8Array` 바디를 보낼 수 있는가.**
 *     RN은 요청 바디 변환 계층이 따로 있어 Node fetch와 다르게 동작할 수 있다.
 *     그건 실기기에서만 답이 나온다 — 여기서 통과했다고 그쪽까지 통과한 것이 아니다.
 */
await check('큰 파트 — 5MB 서명 URL PUT (Vercel 4.5MB 한도 밖임을 확인)', async () => {
  const big = 5 * 1024 * 1024;
  const bigVault = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  const reserved = await api('reserve', { vaultId: bigVault, seq: 1, genId, partCount: 1 });
  assert(reserved.status === 200, `reserve HTTP ${reserved.status}`);

  const bytes = new Uint8Array(big);
  for (let i = 0; i < bytes.length; i += 4096) bytes[i] = i & 0xff;

  const started = Date.now();
  const res = await fetch(reserved.json.uploads[0].signedUrl, {
    method: 'PUT',
    headers: { 'content-type': 'application/octet-stream' },
    body: bytes,
  });
  assert(res.ok, `PUT HTTP ${res.status} ${await res.text()}`);
  const seconds = (Date.now() - started) / 1000;

  const committed = await api('commit', { vaultId: bigVault, seq: 1, genId });
  assert(committed.status === 200, `commit HTTP ${committed.status} ${JSON.stringify(committed.json)}`);
  assert(committed.json.totalBytes === big, `totalBytes=${committed.json.totalBytes}`);
  console.log(`       5MB 업로드 ${seconds.toFixed(2)}초 (로컬 루프백 — 실망 속도가 아니다)`);
});

// ── 7. 읽기는 grant를 요구하지 않는다 (순환 제거 확인) ────────────────────────
await check('다른 계정도 읽을 수 있다 — 읽기는 암호가 지킨다', async () => {
  const res = await fetch(`${BASE}/api/v1/backup/latest`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer other-account' },
    body: JSON.stringify({ vaultId }),
  });
  const json = await res.json();
  assert(res.status === 200, `HTTP ${res.status} ${JSON.stringify(json)}`);
  /*
   * 이게 안전한 이유: 받아가는 건 **못 여는 암호문**이다. 열려면 복구 코드가 필요하고,
   * 코드가 있으면 어차피 오프라인에서 열 수 있다. grant는 단일 라이터용이지 열람 차단용이 아니다.
   */
});

// ── 8. 되찾기 — auth_key가 없으면 못 뺏는다 ───────────────────────────────────
const AUTH = 'a'.repeat(64);
await check('되찾기 — auth_key 없이는 거부', async () => {
  const v = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  const r = await api('reserve', { vaultId: v, seq: 1, genId, partCount: 1, authKey: AUTH });
  assert(r.status === 200, `reserve HTTP ${r.status}`);

  const res = await fetch(`${BASE}/api/v1/backup/rebind`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer intruder' },
    body: JSON.stringify({ vaultId: v }), // authKey 없음
  });
  assert(res.status === 403, `HTTP ${res.status}`);
});

await check('되찾기 — 틀린 auth_key도 거부', async () => {
  const v = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  await api('reserve', { vaultId: v, seq: 1, genId, partCount: 1, authKey: AUTH });
  const res = await fetch(`${BASE}/api/v1/backup/rebind`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer intruder' },
    body: JSON.stringify({ vaultId: v, authKey: 'b'.repeat(64) }),
  });
  assert(res.status === 403, `HTTP ${res.status}`);
});

await check('되찾기 — 맞는 auth_key면 라이터가 바뀐다', async () => {
  const v = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  await api('reserve', { vaultId: v, seq: 1, genId, partCount: 1, authKey: AUTH });

  // 다른 계정은 아직 쓸 수 없다
  const before = await fetch(`${BASE}/api/v1/backup/reserve`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer new-phone' },
    body: JSON.stringify({ vaultId: v, seq: 1, genId, partCount: 1 }),
  });
  assert(before.status === 403, `되찾기 전 HTTP ${before.status}`);

  const rebound = await fetch(`${BASE}/api/v1/backup/rebind`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer new-phone' },
    body: JSON.stringify({ vaultId: v, authKey: AUTH }),
  });
  assert(rebound.status === 200, `rebind HTTP ${rebound.status} ${await rebound.text()}`);

  const after = await fetch(`${BASE}/api/v1/backup/reserve`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer new-phone' },
    body: JSON.stringify({ vaultId: v, seq: 1, genId, partCount: 1 }),
  });
  assert(after.status === 200, `되찾기 후 HTTP ${after.status}`);
});

await check('되찾기 — 금고 생성 후에는 auth_key를 덮어쓸 수 없다', async () => {
  const v = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  await api('reserve', { vaultId: v, seq: 1, genId, partCount: 1, authKey: AUTH });
  // 침입자가 자기 키로 덮어쓰려 시도
  await api('reserve', { vaultId: v, seq: 1, genId, partCount: 1, authKey: 'c'.repeat(64) });
  const res = await fetch(`${BASE}/api/v1/backup/rebind`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer intruder' },
    body: JSON.stringify({ vaultId: v, authKey: 'c'.repeat(64) }),
  });
  assert(res.status === 403, `덮어쓰기가 통했다 (HTTP ${res.status})`);
});

// ── 9. 리퍼 ───────────────────────────────────────────────────────────────────
await check('리퍼 — CRON_SECRET 없이는 거부', async () => {
  const res = await fetch(`${BASE}/api/cron/reap`, { method: 'POST' });
  assert(res.status === 401, `HTTP ${res.status}`);
});

await check('리퍼 — 시크릿이 맞으면 돌고 건수를 돌려준다', async () => {
  const secret = process.env.CRON_SECRET ?? 'dev-cron-secret';
  const res = await fetch(`${BASE}/api/cron/reap`, {
    method: 'POST',
    headers: { authorization: `Bearer ${secret}` },
  });
  const json = await res.json();
  assert(res.status === 200, `HTTP ${res.status} ${JSON.stringify(json)}`);
  assert(typeof json.reapedParts === 'number', '건수가 없다 — 조용히 죽으면 아무도 모른다');
  console.log(
    `       파트 ${json.reapedParts} · 세대 ${json.reapedGenerations} · 툼스톤 ${json.reapedTombstones}`,
  );
});

// ── 결과 ──────────────────────────────────────────────────────────────────────
console.log('');
if (failures.length > 0) {
  console.error(`서버 왕복 실패 ${failures.length}건\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}\n`);
  process.exit(1);
}
console.log(`서버 왕복 ok — ${passed}개 검사 통과\n`);
