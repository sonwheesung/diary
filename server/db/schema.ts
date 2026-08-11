import {
  bigint,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * 조각 서버 스키마 — 백업 금고.
 *
 * **여기에 일기 본문은 없다.** 서버가 보관하는 것은 암호문 객체와 그것을 가리키는
 * 메타데이터뿐이고, 복호화 키는 사용자 기기와 복구 코드에만 있다.
 *
 * ⚠ 그래서 고지 문구가 **"저장하지 않습니다"가 아니라 "읽지 못합니다"** 다.
 *   메타데이터(`vaultId`·개수·크기·시각)는 **평문으로 저장한다** — 이걸 흐리면 거짓말이 된다.
 *
 * ⚠ common_server의 `subjects`를 **FK로 걸지 않는다.** 다른 DB다.
 *   신원의 단일 진실은 common_server이고 여기는 `subjectId`를 외래 식별자로만 들고 있다.
 */

/**
 * 금고 — 사용자 한 명의 백업 전체.
 *
 * `vaultId`는 복구 코드에서 유도된다(HKDF). **자격증명이 아니다** — 여기 평문으로 있고
 * 로그에도 남을 수 있다. 인가는 `vaultGrants`가 한다.
 */
export const vaults = pgTable(
  'vaults',
  {
    /** 소문자 hex 32자 = 128비트. 앱이 복구 코드에서 유도해 보낸다 */
    id: text('id').primaryKey(),
    /** 서버에 커밋된 마지막 세대. 다음 업로드는 seq+1만 받는다 */
    seq: integer('seq').notNull().default(0),
    /**
     * `sha256(auth_key)`. `auth_key`는 복구 코드에서 유도된다(HKDF).
     *
     * ⚠ **원본을 저장하지 않는다.** 그래서 이 DB가 통째로 새도 되찾기·삭제 권한은 안 샌다.
     * ⚠ `vault_id`와 **다른 값이어야** 한다 — vault_id는 여기 평문으로 있고 로그에도 남는다.
     *   같은 값을 인가에 쓰면 "이름을 아는 사람이 곧 주인"이 된다.
     */
    authHash: text('auth_hash'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    /**
     * 유예 만료 후 파기되면 여기에 시각이 찍히고 **행은 남는다**(툼스톤).
     *
     * ⚠ 행을 지우면 404밖에 못 준다. 404를 받은 사용자는 자기 일기가 지워졌다는 사실을
     *   **영원히 모른다** — "서버가 이상한가 보다"로 읽는다. 410을 주려면 이 행이 필요하다.
     *
     * ⚠ 툼스톤에 `subjectId`를 남기지 않는다. 탈퇴자의 식별자가 남으면
     *   "탈퇴 시 지체 없이 파기"와 충돌한다. 보관 기간은 리퍼가 강제한다.
     */
    purgedAt: timestamp('purged_at', { withTimezone: true }),
  },
  (table) => [index('idx_vaults_purged').on(table.purgedAt)],
);

/**
 * 소유권 — 어느 계정이 이 금고의 라이터인가.
 *
 * **활성 grant는 금고당 하나다.** 두 기기가 동시에 쓰면 세대가 섞인다.
 */
export const vaultGrants = pgTable(
  'vault_grants',
  {
    vaultId: text('vault_id').primaryKey(),
    /** common_server의 subject. **FK 없다** — 다른 DB다 */
    subjectId: text('subject_id').notNull(),
    /**
     * 되찾기(rebind)가 일어난 시각.
     *
     * 뺏긴 기기가 다음 접속 때 **왜 백업이 멈췄는지 알 수 있어야 한다.**
     * 이게 없으면 그 기기는 계속 403만 받으면서 이유를 모른다.
     */
    reboundAt: timestamp('rebound_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_grants_subject').on(table.subjectId)],
);

/**
 * 세대 — 백업 한 번.
 *
 * 파트가 **전부 커밋돼야** `committedAt`이 찍힌다. 그 전까지는 미완성이고 복원 대상이 아니다.
 */
export const generations = pgTable(
  'generations',
  {
    vaultId: text('vault_id').notNull(),
    seq: integer('seq').notNull(),
    /**
     * 이 세대를 묶는 8바이트(hex 16자).
     *
     * ⚠ 같은 `seq`로 재시도하면 서버에 **옛 파트와 새 파트가 함께 남을 수 있다.**
     *   `seq`와 `partCount`만으로는 구별이 안 되고 AEAD도 전부 통과한다.
     *   `genId`가 다른 파트는 같은 세대가 아니다.
     */
    genId: text('gen_id').notNull(),
    partCount: integer('part_count').notNull(),
    /** 전 파트가 도착한 시각. NULL이면 미완성 — 복원에 쓰지 않는다 */
    committedAt: timestamp('committed_at', { withTimezone: true }),
    totalBytes: bigint('total_bytes', { mode: 'number' }).notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_generations').on(table.vaultId, table.seq),
    index('idx_generations_vault').on(table.vaultId, table.committedAt),
  ],
);

/**
 * 파트 — 봉투 하나. 실제 바이트는 Storage에 있고 여기는 그 참조다.
 *
 * 3단(`reserve` → 서명 URL PUT → `commit`)의 상태를 들고 있다.
 * `reserved`인 채 만료된 행은 리퍼가 객체와 함께 지운다 — 안 그러면 실패한 업로드가
 * 쿼터를 영원히 먹는다.
 */
export const generationParts = pgTable(
  'generation_parts',
  {
    vaultId: text('vault_id').notNull(),
    seq: integer('seq').notNull(),
    part: integer('part').notNull(),
    /** Storage 객체 경로. **서버가 조립한다** — 앱이 보낸 문자열을 쓰면 경로 순회가 열린다 */
    objectPath: text('object_path').notNull(),
    /** 'reserved' | 'committed' */
    state: text('state').notNull().default('reserved'),
    /** commit 때 **서버가 Storage에 실제 크기를 물어** 채운다. 앱이 보낸 값을 믿지 않는다 */
    bytes: bigint('bytes', { mode: 'number' }),
    reservedAt: timestamp('reserved_at', { withTimezone: true }).notNull().defaultNow(),
    committedAt: timestamp('committed_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('uq_parts').on(table.vaultId, table.seq, table.part),
    index('idx_parts_reaper').on(table.state, table.reservedAt),
  ],
);
