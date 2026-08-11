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

/** 전부 돌리고 콘솔에 찍는다. `adb logcat -s ReactNativeJS | grep jogak-check` */
export async function runDeviceChecks(baseUrl: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  console.log('[jogak-check] ===== 실기기 점검 시작 =====');

  results.push(...(await checkSealThroughput()));
  if (baseUrl.length > 0) {
    results.push(...(await checkLargePut(baseUrl)));
  } else {
    results.push({ name: 'RN PUT', ok: false, detail: 'EXPO_PUBLIC_BACKUP_SERVER_URL 없음 — 건너뜀' });
  }
  results.push(...(await checkDatabaseSwap()));

  for (const result of results) {
    console.log(line(result));
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`[jogak-check] ===== 끝 — ${results.length - failed}/${results.length} 통과 =====`);
  return results;
}
