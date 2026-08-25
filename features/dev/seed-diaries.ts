/**
 * 개발용 일기 시드 — **`__DEV__`에서만 돈다.**
 *
 * 설계 정본: `docs/DIARY_SYSTEM.md` §8.3
 *
 * ## 왜 있나
 *
 * 리포트 시각화(요일 격자·주별 막대·월별 히트맵)와 계층 요약을 화면에서 보려면
 * **여러 달에 걸친 조각**이 필요한데, 손으로 넣으면 하루 한 건씩 수백 번을 눌러야 한다.
 *
 * ~~백업 복원으로 넣는다~~ → **안 한다**(2026-08-25 조사). 복원은 `diaries`·`tags`·
 * `ai_reports`를 **전부 지우고 다시 넣고**(`features/backup/api/restore.ts`), `adoptBackupSecret()`이
 * SecureStore 비밀까지 덮어쓴다 — 실기기에 가짜 코드를 넣으면 **그 사람의 진짜 백업이 안 열린다.**
 * 서버·로컬 Supabase·봉인 스크립트도 전부 필요하다. 여기 있는 직접 INSERT가 압도적으로 싸고 안전하다.
 *
 * ## 지키는 것
 *
 * - 🔴 **기존 조각을 건드리지 않는다.** `seed-` 접두사가 아닌 조각이 이미 있는 날짜는 **건너뛴다.**
 *   같은 날에 두 건을 넣으면 홈·캘린더가 상정하지 않은 상태가 된다(`createDiary`는 날짜당 1건을 막는다).
 * - **되돌릴 수 있다.** `clearSeededDiaries()`가 `id LIKE 'seed-%'`만 지운다.
 * - **결정적이다.** 같은 범위를 두 번 심으면 같은 내용이 나온다 — 화면을 비교할 때 흔들리면 안 된다.
 *   그래서 `Math.random()`을 쓰지 않고 날짜에서 값을 유도한다.
 * - **더미다.** 실제 사용자의 일기를 넣지 않는다.
 */
import { getDatabase } from '@/db/client';
import { EMOTION_CODES_ORDER } from '@/features/diary/emotions';
import type { DiaryBlock } from '@/features/diary/types';

const PREFIX = 'seed-';

/** 날짜 문자열에서 유도하는 결정적 난수(0~1). LCG 한 줄이면 충분하다 */
function rand(date: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < date.length; i += 1) h = (h * 31 + date.charCodeAt(i)) >>> 0;
  h = (h * 1664525 + 1013904223) >>> 0;
  return h / 4294967296;
}

const OPENERS = [
  '아침에 눈을 뜨자마자 창을 열었다.',
  '알람을 두 번 껐다.',
  '출근길 지하철이 유난히 붐볐다.',
  '오늘은 아무 일도 없었다.',
  '점심을 혼자 먹었다.',
  '비가 올 것 같아 우산을 챙겼다.',
  '어제 늦게 자서 하루 종일 멍했다.',
];
const MIDDLES = [
  '회의가 길어져 오후가 통째로 사라졌다.',
  '오랜만에 친구에게 연락이 왔다.',
  '점심에 회사 근처를 한 바퀴 걸었다.',
  '읽던 책을 절반쯤 넘겼다.',
  '저녁에 어머니한테 전화가 왔다. 별일 없냐고 물었다.',
  '퇴근하고 바로 누웠다. 아무것도 하기 싫었다.',
  '새로 생긴 카페에 들렀는데 자리가 없어서 그냥 나왔다.',
  '운동을 가려다 말았다. 내일은 가야지.',
  '오래된 사진을 정리하다가 한참 앉아 있었다.',
];
const CLOSERS = [
  '내일은 조금 일찍 자야겠다.',
  '별것 아닌데 기분이 오래 남았다.',
  '그냥 그런 하루였다.',
  '이런 날도 있는 거지.',
  '쓰고 나니 조금 정리됐다.',
];
const TITLES = [null, null, null, '보통날', '오랜만에', '정리', '비', '조용한 하루'];

export interface SeedRange {
  /** `YYYY-MM-DD` */
  from: string;
  /** `YYYY-MM-DD` */
  to: string;
}

export interface SeedResult {
  inserted: number;
  /** 이미 내 조각이 있어서 건너뛴 날 */
  skipped: number;
  /** 안 쓴 날로 남긴 날 — 빈 날이 있어야 그림이 진짜처럼 보인다 */
  blank: number;
}

/**
 * 범위 안의 날들에 더미 조각을 심는다.
 *
 * ⚠ **모든 날을 채우지 않는다.** 약 20%는 비운다 — 빈 날이 없으면 요일 격자도 히트맵도
 *   거짓말처럼 보이고, `missingDays`(§10.1)를 지나는 경로도 안 밟힌다.
 */
export async function seedDiaries(range: SeedRange): Promise<SeedResult> {
  if (!__DEV__) throw new Error('seedDiaries는 개발 빌드에서만 쓴다');

  const db = await getDatabase();
  const days = eachDay(range);

  // 🔴 내 조각이 있는 날은 건드리지 않는다. 시드가 남의 자리를 뺏으면 안 된다
  const taken = new Set(
    (
      await db.getAllAsync<{ entry_date: string }>(
        `SELECT entry_date FROM diaries WHERE deleted_at IS NULL AND id NOT LIKE '${PREFIX}%'`,
      )
    ).map((r) => r.entry_date),
  );

  let inserted = 0;
  let skipped = 0;
  let blank = 0;

  // 한 트랜잭션으로 묶는다 — 수백 건을 낱개로 커밋하면 눈에 띄게 느리다
  await db.withTransactionAsync(async () => {
    for (const date of days) {
      if (taken.has(date)) {
        skipped += 1;
        continue;
      }
      // 약 20%는 안 쓴 날
      if (rand(date, 7) < 0.2) {
        blank += 1;
        continue;
      }

      const emotion = EMOTION_CODES_ORDER[Math.floor(rand(date, 11) * EMOTION_CODES_ORDER.length)];
      const title = TITLES[Math.floor(rand(date, 13) * TITLES.length)] ?? null;

      /*
       * 길이를 크게 흔든다. **짧은 주와 긴 주가 섞여야** 글자 수 막대가 의미를 갖고,
       * 원가·품질 측정도 한쪽으로 치우치지 않는다(§10.3에서 코퍼스가 전부 짧아 겪은 일).
       */
      const bulk = rand(date, 17);
      const lines = bulk < 0.25 ? 1 : bulk < 0.75 ? 3 : 6;
      const parts: string[] = [OPENERS[Math.floor(rand(date, 19) * OPENERS.length)] ?? ''];
      for (let i = 1; i < lines - 1; i += 1) {
        parts.push(MIDDLES[Math.floor(rand(date, 23 + i * 7) * MIDDLES.length)] ?? '');
      }
      if (lines > 1) parts.push(CLOSERS[Math.floor(rand(date, 29) * CLOSERS.length)] ?? '');
      const text = parts.filter(Boolean).join(' ');

      /*
       * 10%쯤은 서식을 넣는다(§1.1). 서식이 붙은 조각이 목록·상세·백업 왕복에서
       * 어떻게 보이는지도 같이 봐야 한다.
       */
      const blocks: DiaryBlock[] =
        rand(date, 31) < 0.1
          ? [
              { type: 'text', value: parts[0] ?? '', size: 'h3', bold: true },
              { type: 'text', value: parts.slice(1).join(' '), color: 'blue' },
            ]
          : [{ type: 'text', value: text }];

      const at = Date.parse(`${date}T12:00:00Z`);
      await db.runAsync(
        `INSERT OR REPLACE INTO diaries
           (id, entry_date, title, content, content_blocks, emotion, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
        `${PREFIX}${date}`,
        date,
        title,
        text,
        JSON.stringify(blocks),
        emotion ?? 'neutral',
        at,
        at,
      );
      inserted += 1;
    }
  });

  return { inserted, skipped, blank };
}

/** 심은 것만 지운다. 내 조각은 `id`가 다르므로 안 지워진다 */
export async function clearSeededDiaries(): Promise<number> {
  if (!__DEV__) throw new Error('clearSeededDiaries는 개발 빌드에서만 쓴다');
  const db = await getDatabase();
  const before = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM diaries WHERE id LIKE '${PREFIX}%'`,
  );
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `DELETE FROM diary_tags WHERE diary_id LIKE '${PREFIX}%'`,
    );
    await db.runAsync(`DELETE FROM diary_images WHERE diary_id LIKE '${PREFIX}%'`);
    await db.runAsync(`DELETE FROM diaries WHERE id LIKE '${PREFIX}%'`);
  });
  return before?.n ?? 0;
}

/**
 * `YYYY-MM-DD` 범위를 하루씩 편다.
 *
 * ⚠ `features/ai/period.ts`의 `eachDay`를 쓰지 않는다 — 그 파일은 **순수 계층**이라
 *   서버로 생성 복사되고(`sync:shared`), 개발 전용 코드가 그쪽에 얽히면 안 된다.
 *   열 줄을 여기 두는 편이 그 경계를 지키는 값보다 싸다.
 */
function eachDay({ from, to }: SeedRange): string[] {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return [];
  const out: string[] = [];
  for (let t = start; t <= end; t += 86_400_000) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

/** 어제 (로컬 달력일). 오늘을 채우면 "오늘의 조각" 흐름을 못 본다 */
export function yesterday(now: Date = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
