import * as SQLite from 'expo-sqlite';

import { getDatabase } from '@/db/client';
import { newNonce } from '@/features/backup/api/key-store';
import { seal } from '@/features/backup/seal';

/**
 * 실기기 점검 — **버리는 코드가 아니라 남기는 진단**이다.
 *
 * 세 가지는 **기기에서만 답이 나온다.** 로컬 Node 왕복은 전부 통과했지만 그게 RN 통과를
 * 뜻하지 않는다(RN은 요청 바디 변환 계층이 따로 있고, SQLite는 네이티브 바인딩이다).
 *
 *   1. 순수 JS 암호 처리량 — 파트 크기 512KB가 지금은 **추정치**다
 *   2. RN fetch가 5MB 바이너리를 서명 URL에 PUT할 수 있는가
 *   3. `backupDatabaseAsync`가 **열린 커넥션을 목적지로** 받는가
 *      → 이게 되면 복원을 **스크래치 DB + 단일 스왑**으로 바꾼다. 지금은 라이브 DB에
 *        직접 써서 **복원 중 앱이 죽으면 반쯤 교체된 상태가 남는다.**
 *
 * ⚠ `__DEV__`에서만 부른다. 결과는 콘솔로 나가고 `adb logcat`으로 읽는다.
 */

export interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

const line = (result: CheckResult) =>
  `[jogak-check] ${result.ok ? 'OK  ' : 'FAIL'} ${result.name} — ${result.detail}`;

/** 1. 암호 처리량 — 파트 크기를 정할 근거 */
async function checkSealThroughput(): Promise<CheckResult[]> {
  const key = new Uint8Array(32).fill(9);
  const aad = new Uint8Array(48);
  const out: CheckResult[] = [];

  for (const kb of [300, 512, 5120]) {
    const bytes = new Uint8Array(kb * 1024);
    const nonce = await newNonce();
    const started = Date.now();
    const sealed = seal({ plaintext: bytes, key, nonce, aad });
    const ms = Date.now() - started;
    const mbps = kb / 1024 / (ms / 1000);
    out.push({
      name: `seal ${kb}KB`,
      // 판정문: 3.3MB/s 이상이면 순수 JS 확정, 1.5 미만이면 libsodium 검토.
      // 사이면 **순수 JS**다 — 무판정 시 안전한 쪽이어야 한다(libsodium은 Node KAT를 죽인다).
      ok: sealed.length === bytes.length + 16 && mbps >= 1.5,
      detail: `${ms}ms · ${mbps.toFixed(2)} MB/s`,
    });
  }
  return out;
}

/**
 * 2. RN fetch의 큰 바이너리 PUT.
 *
 * ⚠ 서버가 있어야 한다. `EXPO_PUBLIC_BACKUP_SERVER_URL`이 비어 있으면 건너뛴다.
 *   에뮬레이터에서 PC는 `10.0.2.2`다(localhost는 폰 자신을 가리킨다).
 */
async function checkLargePut(baseUrl: string): Promise<CheckResult[]> {
  const out: CheckResult[] = [];
  for (const mb of [0.5, 5]) {
    const size = Math.round(mb * 1024 * 1024);
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i += 1024) bytes[i] = i & 0xff;

    try {
      const started = Date.now();
      const res = await fetch(`${baseUrl}/api/dev/echo-size`, {
        method: 'PUT',
        headers: { 'content-type': 'application/octet-stream' },
        // ⚠ ArrayBuffer로 넘긴다 — Uint8Array를 그대로 주면 RN이 base64로 바꿔
        //   1.33배로 부풀고 서버가 받은 바이트가 달라진다. **이게 확인 대상이다.**
        body: bytes.buffer.slice(0, size) as ArrayBuffer,
      });
      const ms = Date.now() - started;
      const json = (await res.json()) as { bytes?: number };
      const got = json.bytes ?? -1;
      out.push({
        name: `RN PUT ${mb}MB`,
        ok: res.ok && got === size,
        detail:
          got === size
            ? `${ms}ms · 서버가 받은 바이트 ${got} (일치)`
            : `서버가 받은 바이트 ${got} ≠ 보낸 ${size} — **바디 변환이 일어났다**`,
      });
    } catch (error) {
      out.push({
        name: `RN PUT ${mb}MB`,
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return out;
}

/**
 * 3. `backupDatabaseAsync`가 열린 커넥션 위에서 도는가.
 *
 * **복원 설계 전체가 이 한 호출에 걸려 있다.** 되면 스크래치 DB에 전부 만들고
 * 한 번에 스왑할 수 있어, 반쯤 교체된 라이브 DB가 원리적으로 존재하지 않게 된다.
 */
async function checkDatabaseSwap(): Promise<CheckResult[]> {
  const out: CheckResult[] = [];
  const SCRATCH = 'jogak-check-scratch.db';

  try {
    // 라이브는 앱이 이미 열어둔 싱글턴이다 — 닫지 않는다(호출부 0인 게 정상이다).
    const live = await getDatabase();

    await SQLite.deleteDatabaseAsync(SCRATCH).catch(() => undefined);
    const scratch = await SQLite.openDatabaseAsync(SCRATCH);
    await scratch.execAsync('PRAGMA journal_mode = WAL');
    await scratch.execAsync('CREATE TABLE IF NOT EXISTS probe (id INTEGER PRIMARY KEY, v TEXT)');
    await scratch.runAsync("INSERT INTO probe (id, v) VALUES (1, '조각')");

    // (a) 라이브 → 파일: 스냅샷을 뜰 수 있는가
    const SNAP = 'jogak-check-snapshot.db';
    await SQLite.deleteDatabaseAsync(SNAP).catch(() => undefined);
    const snapshot = await SQLite.openDatabaseAsync(SNAP);
    const started = Date.now();
    await SQLite.backupDatabaseAsync({ sourceDatabase: live, destDatabase: snapshot });
    const snapMs = Date.now() - started;

    const snapCheck = await snapshot.getFirstAsync<{ n: number }>(
      "SELECT count(*) as n FROM sqlite_master WHERE type='table'",
    );
    out.push({
      name: 'backupDatabaseAsync(live → 파일)',
      ok: (snapCheck?.n ?? 0) > 0,
      detail: `${snapMs}ms · 스냅샷에 테이블 ${snapCheck?.n ?? 0}개`,
    });

    // (b) 스크래치 → **열려 있는 라이브**: 이게 핵심이다
    let swapOk = false;
    let swapDetail = '';
    try {
      const swapStarted = Date.now();
      await SQLite.backupDatabaseAsync({ sourceDatabase: scratch, destDatabase: live });
      const swapMs = Date.now() - swapStarted;
      const probe = await live.getFirstAsync<{ v: string }>('SELECT v FROM probe WHERE id = 1');
      const mode = await live.getFirstAsync<{ journal_mode: string }>('PRAGMA journal_mode');
      swapOk = probe?.v === '조각';
      swapDetail = `${swapMs}ms · 스왑 후 읽기 "${probe?.v ?? '없음'}" · journal_mode=${mode?.journal_mode ?? '?'}`;
    } catch (error) {
      swapDetail = error instanceof Error ? error.message : String(error);
    }
    out.push({
      name: 'backupDatabaseAsync(스크래치 → 열린 라이브) ★복원 설계가 걸린 항목',
      ok: swapOk,
      detail: swapDetail,
    });

    // ⚠ 라이브를 스크래치로 덮었으니 **원래대로 되돌린다.** 안 되돌리면 개발 DB가 날아간다.
    await SQLite.backupDatabaseAsync({ sourceDatabase: snapshot, destDatabase: live });
    const restored = await live.getFirstAsync<{ n: number }>(
      "SELECT count(*) as n FROM sqlite_master WHERE type='table'",
    );
    out.push({
      name: '점검 후 원복',
      ok: (restored?.n ?? 0) > 0,
      detail: `테이블 ${restored?.n ?? 0}개로 되돌림`,
    });

    await scratch.closeAsync();
    await snapshot.closeAsync();
    await SQLite.deleteDatabaseAsync(SCRATCH).catch(() => undefined);
    await SQLite.deleteDatabaseAsync(SNAP).catch(() => undefined);
  } catch (error) {
    out.push({
      name: 'backupDatabaseAsync 점검',
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  return out;
}

/**
 * 4. 복원 전 경로 — 매니페스트를 만들어 **스크래치 스왑으로 실제 복원**한다.
 *
 * ⚠ 자기 데이터를 자기 데이터로 덮는 것이라 **내용은 그대로여야 한다.**
 *   달라지면 보존 복사(3단계)나 스왑에 문제가 있는 것이다.
 */
async function checkRestoreRoundTrip(): Promise<CheckResult[]> {
  const out: CheckResult[] = [];
  try {
    const { buildManifest } = await import('@/features/backup/api/manifest-builder');
    const { applyRestore, diffAgainstLocal } = await import('@/features/backup/api/restore');
    const { SETTING_KEYS, getSetting, setSetting } =
      await import('@/features/settings/api/settings-store');

    // 보존이 실제로 되는지 보려면 표식이 필요하다.
    const MARK = `check-${Date.now()}`;
    await setSetting(SETTING_KEYS.themeMode, MARK);

    /*
     * ⚠ **빈 DB로 왕복하면 아무것도 증명하지 못한다**("조각 0/0"). 실제 데이터를 심는다.
     *   다국어·묘비·태그·이미지 행까지 넣어야 복원이 정말 온전한지 알 수 있다.
     */
    const db0 = await getDatabase();
    const SEED = [
      { id: 'chk-ko', text: '오늘은 비가 왔다. 우산을 안 가져왔지만 기분은 좋았어.' },
      { id: 'chk-ja', text: '今日は雨が降った。傘を持ってこなかった。' },
      { id: 'chk-zh', text: '今天下雨了。没带伞，淋得浑身湿透。' },
      { id: 'chk-th', text: 'วันนี้ฝนตก ฉันไม่ได้เอาร่มมา' },
      { id: 'chk-emoji', text: '가족 👨‍👩‍👧‍👦 그리고 🇰🇷 오늘 ✅' },
    ];
    await db0.withTransactionAsync(async () => {
      for (let i = 0; i < SEED.length; i += 1) {
        const row = SEED[i];
        await db0.runAsync(
          `INSERT OR REPLACE INTO diaries
             (id, entry_date, title, content, content_blocks, emotion, created_at, updated_at, deleted_at)
           VALUES (?, ?, ?, ?, ?, 'joy', ?, ?, NULL)`,
          row.id,
          `2026-08-${String(i + 1).padStart(2, '0')}`,
          `점검 ${row.id}`,
          row.text,
          JSON.stringify([{ type: 'text', value: row.text }]),
          1000 + i,
          2000 + i,
        );
      }
      // 묘비도 하나 — 매니페스트에 실리되 차집합에는 안 잡혀야 한다
      await db0.runAsync(
        `INSERT OR REPLACE INTO diaries
           (id, entry_date, title, content, content_blocks, emotion, created_at, updated_at, deleted_at)
         VALUES ('chk-dead', '2026-07-01', NULL, '', NULL, NULL, 1, 2, 999)`,
      );
      await db0.runAsync(
        "INSERT OR REPLACE INTO tags (id, name, created_at) VALUES ('chk-tag', '점검태그', 5)",
      );
      await db0.runAsync(
        "INSERT OR REPLACE INTO diary_tags (diary_id, tag_id) VALUES ('chk-ko', 'chk-tag')",
      );
    });

    const manifest = await buildManifest();
    const diff = await diffAgainstLocal(manifest);
    out.push({
      name: '차집합 — 자기 백업으로 복원하면 잃는 것이 없다',
      ok: diff.losing.length === 0,
      detail: `잃음 ${diff.losing.length} · 들어옴 ${diff.incoming}`,
    });

    /*
     * ⚠ **커서를 먼저 적어둔다.** `applyRestore`는 마지막에 백업 커서를 복원한 세대로
     *   갈아끼우는데, 여기서 쓰는 금고 id는 가짜다 — 그대로 두면 **다음 점검(그리고 실제
     *   백업)이 seq-conflict로 막힌다.** 점검이 서로를 오염시키지 않게 원복한다.
     */
    const savedState = await (await import('@/features/backup/api/backup-state')).getBackupState();

    const started = Date.now();
    await applyRestore(manifest, '0'.repeat(32), 1);
    const ms = Date.now() - started;

    const db = await getDatabase();
    const after = await db.getFirstAsync<{ n: number }>('SELECT count(*) as n FROM diaries');
    out.push({
      name: '★ 스크래치 스왑 복원',
      ok: (after?.n ?? -1) === manifest.diaries.length && manifest.diaries.length > 0,
      detail: `${ms}ms · 조각 ${after?.n ?? -1}/${manifest.diaries.length}`,
    });

    // 다국어 본문이 **바이트 그대로** 살아남았는가 — 여기가 깨지면 조용한 손실이다
    let intact = 0;
    for (const row of SEED) {
      const got = await db.getFirstAsync<{ content: string }>(
        'SELECT content FROM diaries WHERE id = ?',
        row.id,
      );
      if (got?.content === row.text) intact += 1;
    }
    out.push({
      name: '★ 복원 후 다국어 본문 일치',
      ok: intact === SEED.length,
      detail: `${intact}/${SEED.length} (한국어·日本語·中文·ไทย·이모지)`,
    });

    // 태그 연결과 묘비도 살아남아야 한다
    const tagLink = await db.getFirstAsync<{ n: number }>(
      "SELECT count(*) as n FROM diary_tags WHERE diary_id = 'chk-ko'",
    );
    const dead = await db.getFirstAsync<{ n: number }>(
      "SELECT count(*) as n FROM diaries WHERE id = 'chk-dead' AND deleted_at IS NOT NULL",
    );
    out.push({
      name: '복원 후 태그 연결·묘비',
      ok: (tagLink?.n ?? 0) === 1 && (dead?.n ?? 0) === 1,
      detail: `태그연결 ${tagLink?.n ?? 0} · 묘비 ${dead?.n ?? 0}`,
    });

    // ⚠ 이게 실패하면 테마·언어가 날아간다는 뜻이다.
    const preserved = await getSetting(SETTING_KEYS.themeMode);
    out.push({
      name: '★ 보존 복사 — app_settings가 살아남는가',
      ok: preserved === MARK,
      detail: preserved === MARK ? '표식 유지됨' : `표식이 사라졌다 (${preserved ?? '없음'})`,
    });

    await setSetting(SETTING_KEYS.themeMode, 'system');
    // 점검이 심은 것은 점검이 치운다 — 개발 DB에 쓰레기를 남기지 않는다.
    await db.execAsync("DELETE FROM diary_tags WHERE tag_id = 'chk-tag'");
    await db.execAsync("DELETE FROM tags WHERE id = 'chk-tag'");
    await db.execAsync("DELETE FROM diaries WHERE id LIKE 'chk-%'");

    // 커서 원복 — 위 주석 참조. 켜져 있던 금고와 seq를 그대로 돌려놓는다.
    const state = await import('@/features/backup/api/backup-state');
    if (savedState.vaultId !== null) {
      await state.enableBackup(savedState.vaultId);
      if (savedState.seq > 0) {
        await state.markBackupCommitted(savedState.seq, savedState.lastBackupAt ?? Date.now());
      }
    } else {
      await state.disableBackup();
    }
  } catch (error) {
    out.push({
      name: '스크래치 스왑 복원',
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  return out;
}

/**
 * 5. 사진 왕복 — **봉인 → 서명 URL PUT → 다운로드 → 개봉 → 바이트 비교.**
 *
 * ⚠ 서버 e2e는 더미 바이트로 계약만 본다. 여기서만 확인되는 것은
 *   **실제 파일 I/O와 봉투가 기기에서 맞물리는가**다 — `File.bytes()`가 비동기이고
 *   `write()`가 동기라 그 짝이 어긋나면 조용히 빈 파일이 올라간다.
 */
async function checkPhotoRoundTrip(): Promise<CheckResult[]> {
  const out: CheckResult[] = [];
  try {
    const { File } = await import('expo-file-system');
    // ⚠ 디렉터리를 직접 조립하지 않는다 — 이름이 어긋나면 파일을 만들어놓고 못 찾는다(겪음).
    const { resolveImageUri } = await import('@/features/diary/api/image-store');
    const { loadBackupKeys, createBackupSecret } = await import('@/features/backup/api/key-store');
    const { downloadPhotos, uploadPhotos } = await import('@/features/backup/api/photos');
    const { runBackup } = await import('@/features/backup/api/run-backup');

    const keys = (await loadBackupKeys()) ?? (await createBackupSecret());

    // 진짜 파일을 만든다 — 300KB면 1600px로 줄인 사진의 실제 크기대다.
    const fileName = 'chk-photo.bin';
    const bytes = new Uint8Array(300 * 1024);
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = (i * 31) & 0xff;
    const file = new File(resolveImageUri(fileName));
    if (file.exists) file.delete();
    file.create();
    file.write(bytes);

    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO diary_images
         (id, diary_id, file_name, width, height, created_at, deleted_at, blob_state)
       VALUES ('chk-img', 'chk-ko', ?, 1600, 1200, 1, NULL, NULL)`,
      fileName,
    );

    /*
     * ⚠ `uploadPhotos`를 직접 부르지 않고 **`runBackup()` 전체**를 태운다.
     *   금고는 매니페스트 예약이 만들고(사진 라우트는 금고를 만들지 않는다),
     *   무엇보다 **사진이 매니페스트보다 먼저 올라가는 순서**가 여기서만 검증된다.
     */
    const started = Date.now();
    const run = await runBackup();
    out.push({
      name: '★ 백업 전체 — 사진 → 매니페스트 순서',
      ok: run.ok,
      detail: run.ok
        ? `seq ${run.seq} · 파트 ${run.partCount} · ${Date.now() - started}ms`
        : `실패 ${run.reason}`,
    });

    const uploadedRow = await db.getFirstAsync<{ blob_state: string | null }>(
      "SELECT blob_state FROM diary_images WHERE id = 'chk-img'",
    );
    out.push({
      name: '★ 사진 업로드 — 커밋 성공 후에만 backed_up이 된다',
      ok: uploadedRow?.blob_state === 'backed_up',
      detail: `blob_state=${uploadedRow?.blob_state}`,
    });

    // 두 번째 호출은 plan이 have로 답해 **아무것도 올리지 않아야** 한다 — 증분의 증거다.
    const again = await uploadPhotos(keys);
    out.push({
      name: '★ 증분 — 두 번째 백업은 사진을 다시 올리지 않는다',
      ok: again.ok && again.uploaded === 0,
      detail: again.ok ? `${again.uploaded}장` : `실패 ${again.reason}`,
    });

    /*
     * 복원 상황을 만든다: 파일을 지우고 행을 'missing'으로 되돌린다.
     * 이게 새 폰의 상태다 — 행은 매니페스트로 들어왔고 파일은 없다.
     */
    file.delete();
    await db.runAsync("UPDATE diary_images SET blob_state = 'missing' WHERE id = 'chk-img'");

    const down = await downloadPhotos(keys);
    const back = new File(resolveImageUri(fileName));
    let identical = false;
    if (back.exists) {
      const got = await back.bytes();
      identical =
        got.byteLength === bytes.byteLength &&
        got[0] === bytes[0] &&
        got[12345] === bytes[12345] &&
        got[got.byteLength - 1] === bytes[bytes.length - 1];
    }
    out.push({
      name: '★ 사진 복원 — 받아서 개봉한 바이트가 원본과 같다',
      ok: down.ok && identical,
      detail: down.ok
        ? `${down.restored}장 복원 · 없음 ${down.absent} · 일치 ${identical}`
        : `실패 ${down.reason}`,
    });

    const row = await db.getFirstAsync<{ blob_state: string | null }>(
      "SELECT blob_state FROM diary_images WHERE id = 'chk-img'",
    );
    out.push({
      name: '복원된 사진은 backed_up으로 바뀐다 (다시 안 올린다)',
      ok: row?.blob_state === 'backed_up',
      detail: `blob_state=${row?.blob_state}`,
    });

    if (back.exists) back.delete();
    await db.execAsync("DELETE FROM diary_images WHERE id = 'chk-img'");
  } catch (error) {
    out.push({
      name: '사진 왕복',
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  return out;
}

/** 전부 돌리고 콘솔에 찍는다. `adb logcat -s ReactNativeJS | grep jogak-check` */
export async function runDeviceChecks(baseUrl: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  console.log('[jogak-check] ===== 실기기 점검 시작 =====');

  results.push(...(await checkSealThroughput()));
  if (baseUrl.length > 0) {
    results.push(...(await checkLargePut(baseUrl)));
  } else {
    results.push({
      name: 'RN PUT',
      ok: false,
      detail: 'EXPO_PUBLIC_BACKUP_SERVER_URL 없음 — 건너뜀',
    });
  }
  results.push(...(await checkDatabaseSwap()));
  results.push(...(await checkRestoreRoundTrip()));
  // ⚠ 복원 왕복 **뒤에** 둔다 — 'chk-ko' 조각이 있어야 이미지 행의 FK가 선다.
  if (baseUrl.length > 0) {
    results.push(...(await checkPhotoRoundTrip()));
  }

  for (const result of results) {
    console.log(line(result));
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`[jogak-check] ===== 끝 — ${results.length - failed}/${results.length} 통과 =====`);
  return results;
}
