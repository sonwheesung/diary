import {
  bigint,
  boolean,
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
    /**
     * 마지막으로 이 금고에 접근한 시각(읽기·쓰기 모두).
     *
     * ⚠ **방치 금고를 정리하는 유일한 근거다.** 탈퇴 없이 앱만 지운 사용자의 금고는
     *   아무도 지워주지 않는다 — 3년 무접근이면 리퍼가 파기한다(처리방침에 명시).
     */
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    /**
     * 구독 만료 시각의 **스냅샷**. 유예 90일을 여기서부터 센다.
     *
     * ⚠ **만료는 이벤트로 오지 않는다.** common_server는 `active`를 저장하지 않고
     *   읽을 때 계산하므로, 만료되는 순간 DB를 쓰는 주체가 없다.
     *   그래서 introspect로 받은 값을 여기 저장해두고 **우리가 센다.**
     *   NULL = 만료 없음(구독 중이거나 아직 확인 전).
     */
    proExpiresAt: timestamp('pro_expires_at', { withTimezone: true }),
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

/**
 * 사진 blob — 이미지 하나 = 행 하나.
 *
 * **세대와 무관하게 산다.** 매니페스트는 세대마다 통째로 다시 올리지만, 사진은 한 번
 * 올리면 끝이다 — 조각 500개짜리 사용자가 한 줄 고쳤다고 사진 300장을 다시 올릴 수는 없다.
 *
 * ⚠ `blobKey`는 `HKDF(DEK, "jogak/blob/v1" ‖ image_id)`다. **콘텐츠 주소가 아니다** —
 *   `sha256(암호문)`은 nonce가 랜덤이라 성립하지 않고, `sha256(평문)`은 서버가
 *   "이 사용자가 이 사진을 갖고 있는가"를 확인할 수 있게 만든다.
 */
export const vaultBlobs = pgTable(
  'vault_blobs',
  {
    vaultId: text('vault_id').notNull(),
    /** 소문자 hex 64자 */
    blobKey: text('blob_key').notNull(),
    objectPath: text('object_path').notNull(),
    /** 'reserved' | 'committed' */
    state: text('state').notNull().default('reserved'),
    /** commit 때 **서버가 Storage에 물어** 채운다. 앱이 보낸 값을 믿지 않는다 */
    bytes: bigint('bytes', { mode: 'number' }),
    reservedAt: timestamp('reserved_at', { withTimezone: true }).notNull().defaultNow(),
    committedAt: timestamp('committed_at', { withTimezone: true }),
    /**
     * 마지막으로 어느 세대가 이걸 참조했는가.
     *
     * ⚠ **서버는 매니페스트를 읽을 수 없다**(암호문이다). 그래서 앱이 커밋할 때 참조 목록을
     *   함께 보내고, 서버는 그 시각을 여기 찍는다. 오래 참조되지 않은 blob이 고아다.
     */
    referencedAt: timestamp('referenced_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_blobs').on(table.vaultId, table.blobKey),
    index('idx_blobs_reaper').on(table.state, table.referencedAt),
  ],
);

/**
 * AI 리포트 사용량 — **캡의 근거이자 원가 관측의 유일한 창구다.**
 *
 * 🔴 **본문은 없다.** 여기 있는 것은 "누가 언제 몇 번 불렀고 토큰이 얼마였나"뿐이다.
 *   일기도, 프롬프트도, 생성된 리포트도 저장하지 않는다 — 그게 §5.1의 무저장 약속이고,
 *   이 테이블의 컬럼 목록이 그 약속의 증거다. **여기에 텍스트 컬럼을 더하지 않는다.**
 *
 * ⚠ 이건 메타데이터라 **저장한다고 고지한다.** "아무것도 저장하지 않는다"고 쓰면 거짓말이다.
 *
 * ⚠ 기간 캡(`periodKey`)과 일일 폭주 방어(`day`)는 **다른 문제**라 한 행에 둘 다 있다:
 *   전자는 "같은 주를 두 번 만들지 마라", 후자는 "버그로 하루에 수백 번 부르지 마라".
 */
export const aiUsage = pgTable(
  'ai_usage',
  {
    id: text('id').primaryKey(),
    /** common_server의 subject. **FK 없다** — 다른 DB다 */
    subjectId: text('subject_id').notNull(),
    /** 'weekly' | 'monthly' | 'yearly' */
    kind: text('kind').notNull(),
    /** `2026-W33` · `2026-08` · `2026`. 기간 캡의 기준 */
    periodKey: text('period_key').notNull(),
    /** `YYYY-MM-DD`(UTC). 일일 폭주 방어의 기준 */
    day: text('day').notNull(),
    inputTokens: integer('input_tokens').notNull().default(0),
    outputTokens: integer('output_tokens').notNull().default(0),
    /** 원가를 나중에 되짚으려면 어떤 모델이었는지가 필요하다 */
    model: text('model'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    /*
     * 🔴 **성공만 기록된다.** 거부·타임아웃은 행을 만들지 않는다 —
     *   우리 잘못으로 그 주 리포트를 영영 잃게 두지 않기 위해서다(`ai-policy.ts`).
     *   그래서 이 UNIQUE가 곧 "이 기간은 이미 만들었다"의 진실이다.
     */
    uniqueIndex('uq_ai_usage_period').on(table.subjectId, table.kind, table.periodKey),
    index('idx_ai_usage_day').on(table.subjectId, table.day),
  ],
);

/**
 * AI 실패 잠금 — **크레딧 방어** (`docs/AI_REPORT_SYSTEM.md` §5.1).
 *
 * 🔴 **`ai_usage`에 섞지 않는다.** 그쪽은 *"이 기간을 만들었다"* 의 진실이고 캡 계산의
 *   근거다. 실패를 같은 테이블에 넣으면 `count(*)`가 캡을 잘못 세고,
 *   `uq_ai_usage_period` UNIQUE도 의미를 잃는다.
 *
 * 🔴 **본문은 없다.** 실패 코드와 시각뿐이다 — `ai_usage`와 같은 규율이다.
 *
 * subject당 한 행이고 실패할 때마다 덮어쓴다. 이력이 필요하면 Discord 알림이 갖는다.
 */
export const aiCooldowns = pgTable('ai_cooldowns', {
  /** common_server의 subject. **FK 없다** — 다른 DB다 */
  subjectId: text('subject_id').primaryKey(),
  /** 이 시각까지 막는다 */
  until: timestamp('until', { withTimezone: true }).notNull(),
  /** 왜 잠갔나 — `refused` · `upstream` 등. 진단용이고 본문이 아니다 */
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * 생성된 리포트 본문 — **운영자 품질 피드백용** (2026-08-13 사용자 결정).
 *
 * 🔴 **§5.1의 "저장하지 않습니다"를 뒤집는 결정이다.** 처리방침 문구를 함께 고친다.
 *   이 테이블이 생긴 이유는 하나다: **리포트가 좋은지 나쁜지 볼 방법이 없으면
 *   프롬프트를 고칠 근거가 없다.** 원격 관측이 0인 앱이라 사용자 문의 외에는 신호가 없었다.
 *
 * ⚠ **일기 원문은 저장하지 않는다.** 여기 남는 것은 **모델이 쓴 요약문**이다 —
 *   입력(일기)은 여전히 지나가기만 한다. 그 구분이 처리방침 문안의 핵심이다.
 *
 * ⚠ **보관 90일.** 무기한은 처리방침에 쓸 수 없다. 리퍼가 지운다.
 */
export const aiReports = pgTable(
  'ai_reports',
  {
    /** 앱이 만든 UUID. 멱등 키와 같은 값이다 */
    id: text('id').primaryKey(),
    /** common_server의 subject. **FK 없다** — 다른 DB다 */
    subjectId: text('subject_id').notNull(),
    kind: text('kind').notNull(),
    periodKey: text('period_key').notNull(),
    /** 어떤 언어로 썼나 */
    lang: text('lang').notNull(),
    /** 🔴 모델이 쓴 요약문. **일기 원문이 아니다** */
    summary: text('summary').notNull(),
    concern: boolean('concern').notNull().default(false),
    /** 몇 개를 보고 썼나. 품질 판단의 맥락이 된다 */
    sourceCount: integer('source_count').notNull().default(0),
    model: text('model'),
    /** 어느 프롬프트 판이었나 — 프롬프트를 고친 뒤 품질이 나아졌는지 가르려면 필요하다 */
    promptVer: integer('prompt_ver'),
    /*
     * 지표·주제 (`docs/AI_REPORT_SYSTEM.md` §8.4). `{ metrics: [...], topics: [...] }`.
     *
     * ⚠ **여기서 집계하지 않는다.** 월간 평균은 앱이 로컬 리포트에서 낸다 — 서버는 90일만
     *   갖고 있고(§5.2) 사용자의 리포트 전부를 갖고 있지 않아서 애초에 낼 수가 없다.
     *   그래서 텍스트 한 칸이면 충분하고, 컬럼을 넷으로 쪼갤 이유가 없다.
     * ⚠ **NULL이 정상값이다** — 프롬프트 v8 이전 리포트.
     */
    metrics: text('metrics'),
    /** 사용자가 [신고]를 눌렀나 — 우선해서 볼 것을 고르는 기준 */
    flagged: boolean('flagged').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    /** 리퍼가 90일 지난 것을 지운다 */
    index('idx_ai_reports_created').on(table.createdAt),
    /** 신고된 것부터 본다 */
    index('idx_ai_reports_flagged').on(table.flagged, table.createdAt),
  ],
);
