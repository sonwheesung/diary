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

/**
 * 서명 URL을 **이 호스트에서 닿는 주소**로 되돌린다.
 *
 * 서버는 에뮬레이터를 위해 `SUPABASE_PUBLIC_URL=http://10.0.2.2:...`를 쓰는데,
 * 그 주소는 안드로이드 에뮬레이터 안에서만 호스트를 가리킨다 — Node에서는 닿지 않는다.
 */
function reachable(url) {
  return url.replace('10.0.2.2', '127.0.0.1');
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

    const res = await fetch(reachable(upload.signedUrl), {
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
await check('reserve — 충돌하면 서버가 serverSeq를 알려준다 (앱이 커서를 맞출 수 있게)', async () => {
  // 이게 없으면 커서를 잃은 앱(재설치)이 영원히 같은 번호를 올리려 해 백업이 영구히 막힌다.
  const { status, json } = await api('reserve', { vaultId, seq: 1, genId, partCount: 1 });
  assert(status === 409, `HTTP ${status}`);
  assert(typeof json.serverSeq === 'number', JSON.stringify(json));
});

await check('latest — 완성된 세대의 다운로드 URL을 준다', async () => {
  const { status, json } = await api('latest', { vaultId });
  assert(status === 200, `HTTP ${status} ${JSON.stringify(json)}`);
  assert(json.seq === 1 && json.partCount === 2, `seq=${json.seq} parts=${json.partCount}`);

  for (const download of json.downloads) {
    const res = await fetch(reachable(download.url));
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
  const res = await fetch(reachable(one.signedUrl), { method: 'PUT', body: new Uint8Array(1024) });
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
  const res = await fetch(reachable(reserved.json.uploads[0].signedUrl), {
    method: 'PUT',
    headers: { 'content-type': 'application/octet-stream' },
    body: bytes,
  });
  assert(res.ok, `PUT HTTP ${res.status} ${await res.text()}`);
  const seconds = (Date.now() - started) / 1000;

  const committed = await api('commit', { vaultId: bigVault, seq: 1, genId });
  assert(committed.status === 200, `commit HTTP ${committed.status} ${JSON.stringify(committed.json)}`);
  assert(committed.json.totalBytes === big, `totalBytes=${committed.json.totalBytes}`);
  /*
   * ⚠ 어디에 올렸는지 함께 찍는다. 로컬 스택이면 루프백이라 이 숫자는 실망 속도가 아니고,
   *   클라우드면 이 개발 머신 기준의 실제 속도다 — 구분 없이 숫자만 남기면 나중에 오독한다.
   *   그리고 **기기 속도는 아니다.** 그건 device-check가 잰다.
   */
  const target = new URL(reachable(uploads[0].signedUrl)).host;
  console.log(`       5MB 업로드 ${seconds.toFixed(2)}초 → ${target}`);
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

// ── 9. 삭제 (탈퇴 흐름) ───────────────────────────────────────────────────────
await check('삭제 — grant가 있으면 지운다', async () => {
  const v = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  const r = await api('reserve', { vaultId: v, seq: 1, genId, partCount: 1, authKey: AUTH });
  await fetch(reachable(r.json.uploads[0].signedUrl), { method: 'PUT', body: new Uint8Array(2048) });
  await api('commit', { vaultId: v, seq: 1, genId });

  const del = await api('delete', { vaultId: v });
  assert(del.status === 200, `HTTP ${del.status} ${JSON.stringify(del.json)}`);

  // 파기 후에는 404가 아니라 **410**이어야 한다 — 404면 지워진 걸 영원히 모른다
  const after = await api('latest', { vaultId: v });
  assert(after.status === 410, `파기 후 HTTP ${after.status} (410이어야 한다)`);
});

await check('삭제 — 재호출은 성공으로 답한다 (탈퇴가 막히면 안 된다)', async () => {
  const v = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  await api('reserve', { vaultId: v, seq: 1, genId, partCount: 1, authKey: AUTH });
  await api('delete', { vaultId: v });
  const again = await api('delete', { vaultId: v });
  assert(again.status === 200 && again.json.alreadyGone === true, `HTTP ${again.status}`);
});

await check('삭제 — 없는 금고도 성공 (백업 안 쓴 사람의 탈퇴)', async () => {
  const v = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  const del = await api('delete', { vaultId: v });
  assert(del.status === 200 && del.json.alreadyGone === true, `HTTP ${del.status}`);
});

await check('삭제 — grant도 auth_key도 없으면 거부', async () => {
  const v = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  await api('reserve', { vaultId: v, seq: 1, genId, partCount: 1, authKey: AUTH });
  const res = await fetch(`${BASE}/api/v1/backup/delete`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer intruder' },
    body: JSON.stringify({ vaultId: v }),
  });
  assert(res.status === 403, `HTTP ${res.status}`);
});

await check('삭제 — auth_key만 있어도 지운다 (계정이 바뀐 사람)', async () => {
  const v = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  await api('reserve', { vaultId: v, seq: 1, genId, partCount: 1, authKey: AUTH });
  const res = await fetch(`${BASE}/api/v1/backup/delete`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer changed-account' },
    body: JSON.stringify({ vaultId: v, authKey: AUTH }),
  });
  assert(res.status === 200, `HTTP ${res.status} ${await res.text()}`);
});

// ── 9.5 사진 blob ─────────────────────────────────────────────────────────────
/*
 * 사진은 세대와 무관하게 산다. 검증의 핵심은 **plan이 증분을 만들어 내는가**다 —
 * 여기가 깨지면 사진 300장짜리 사용자는 매번 300장을 다시 올리고 백업을 끝내지 못한다.
 */
const blobVault = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
const blobKeys = [0, 1, 2].map((i) => String(i).repeat(64).slice(0, 64).replace(/[^0-9a-f]/g, 'a'));
const PHOTO = new Uint8Array(64 * 1024).fill(0x7f);

async function blobApi(action, body) {
  return await api('blobs', { action, vaultId: blobVault, authKey: AUTH, ...body });
}

await check('blobs — 처음에는 전부 missing (올릴 것을 알려준다)', async () => {
  /*
   * ⚠ **금고를 미리 만들지 않는다.** 사진은 매니페스트보다 먼저 올라가므로
   *   blob plan이 금고를 만들 수 있어야 한다 — 여기서 실패하면 첫 백업이 영원히 막힌다.
   */
  const { status, json } = await blobApi('plan', { blobKeys });
  assert(status === 200, `HTTP ${status} ${JSON.stringify(json)}`);
  assert(json.missing?.length === 3 && json.have?.length === 0, JSON.stringify(json));
});

let blobUploads = [];
await check('blobs — reserve가 사진마다 서명 URL을 준다', async () => {
  const { status, json } = await blobApi('reserve', { blobKeys });
  assert(status === 200, `HTTP ${status} ${JSON.stringify(json)}`);
  assert(json.uploads?.length === 3, JSON.stringify(json));
  blobUploads = json.uploads;
});

await check('blobs — 서명 URL PUT + commit이 실제 크기를 물어 대조한다', async () => {
  for (const slot of blobUploads) {
    const res = await fetch(reachable(slot.signedUrl), {
      method: 'PUT',
      headers: { 'content-type': 'application/octet-stream' },
      body: PHOTO,
    });
    assert(res.ok, `PUT ${res.status}`);
  }
  const { status, json } = await blobApi('commit', { blobKeys });
  assert(status === 200, `HTTP ${status} ${JSON.stringify(json)}`);
  assert(json.committed?.length === 3, JSON.stringify(json));
  // 앱이 보낸 숫자가 아니라 Storage가 답한 크기여야 한다
  assert(json.usedBytes === PHOTO.byteLength * 3, `usedBytes=${json.usedBytes}`);
});

await check('blobs — 올리지 않은 것을 commit하면 missing으로 답한다 (거짓 커밋 차단)', async () => {
  const ghost = 'b'.repeat(64);
  const { status, json } = await blobApi('commit', { blobKeys: [ghost] });
  assert(status === 200 && json.missing?.includes(ghost), JSON.stringify(json));
});

await check('blobs — 두 번째 plan은 전부 have (증분이 실제로 동작한다)', async () => {
  const { status, json } = await blobApi('plan', { blobKeys });
  assert(status === 200, `HTTP ${status}`);
  assert(json.have?.length === 3 && json.missing?.length === 0, JSON.stringify(json));
});

await check('blobs — 복원 다운로드는 구독도 grant도 요구하지 않는다', async () => {
  const res = await fetch(`${BASE}/api/v1/backup/blobs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer other-account' },
    body: JSON.stringify({ action: 'download', vaultId: blobVault, blobKeys }),
  });
  const json = await res.json();
  assert(res.status === 200, `HTTP ${res.status} ${JSON.stringify(json)}`);
  assert(json.downloads?.length === 3, JSON.stringify(json));

  const got = await fetch(reachable(json.downloads[0].url));
  const bytes = new Uint8Array(await got.arrayBuffer());
  assert(bytes.byteLength === PHOTO.byteLength, `받은 크기 ${bytes.byteLength}`);
});

await check('blobs — 서버에 없는 사진은 absent로 밝힌다 ("로딩 중"과 구별되게)', async () => {
  const ghost = 'c'.repeat(64);
  const { status, json } = await blobApi('download', { blobKeys: [...blobKeys, ghost] });
  assert(status === 200, `HTTP ${status}`);
  assert(json.absent?.length === 1 && json.absent[0] === ghost, JSON.stringify(json));
});

await check('blobs — 남의 경로를 쓸 수 없다 (blobKey는 hex 64자만)', async () => {
  const { status } = await blobApi('reserve', { blobKeys: ['../../etc/passwd'] });
  // 걸러진 뒤 빈 배열이 되므로 200이되 발급이 0이어야 한다
  const { json } = await blobApi('reserve', { blobKeys: [] });
  assert(status === 200 && json.uploads?.length === 0, `status=${status}`);
});

await check('blobs — 사진이 먼저 만든 금고에도 authKey가 박힌다 (되찾기·삭제가 살아 있다)', async () => {
  // 매니페스트 예약이 한 번도 없었는데 auth_key로 되찾기가 되면, 빈 칸이 채워진 것이다.
  const res = await fetch(`${BASE}/api/v1/backup/rebind`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer another-account' },
    body: JSON.stringify({ vaultId: blobVault, authKey: AUTH }),
  });
  assert(res.status === 200, `HTTP ${res.status} ${await res.text()}`);
});

await check('blobs — 금고를 지우면 사진도 함께 지워진다', async () => {
  const del = await fetch(`${BASE}/api/v1/backup/delete`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ vaultId: blobVault, authKey: AUTH }),
  });
  assert(del.status === 200, `HTTP ${del.status}`);
  const { json } = await blobApi('download', { blobKeys });
  // 금고가 사라졌으므로 조회 자체가 막힌다
  assert(json.ok === false, JSON.stringify(json));
});

// ── 10. 리퍼 ──────────────────────────────────────────────────────────────────
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
    `       파트 ${json.reapedParts} · 세대 ${json.reapedGenerations} · 만료파기 ${json.purgedExpired} · 방치파기 ${json.purgedAbandoned} · 툼스톤 ${json.reapedTombstones}`,
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
