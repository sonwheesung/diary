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
import i18next from 'i18next';

import { getDatabase } from '@/db/client';
import { EMOTION_CODES_ORDER } from '@/features/diary/emotions';
import type { DiaryBlock } from '@/features/diary/types';

const PREFIX = 'seed-';

/**
 * 날짜 문자열에서 유도하는 결정적 난수(0~1).
 *
 * ⚠ **섞기가 약하면 인접한 날이 같은 문장을 뽑는다.** 2026-09-07 실측: 9/4·9/5·9/6 이
 *   제목·본문이 **전부 같게** 나왔다 — 스토어 스크린샷에서 카드 세 장이 복사본처럼 보였다.
 *   `h*31 + c` 한 번으로는 하루 차이가 하위 비트에만 남고, LCG 한 번은 그걸 못 흩는다.
 *   → 문자마다 xorshift 를 섞고 마지막에 한 번 더 흩어서 **상위 비트까지** 퍼지게 한다.
 */
function rand(date: string, salt: number): number {
  let h = (salt * 2654435761) >>> 0;
  for (let i = 0; i < date.length; i += 1) {
    h = (h ^ date.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
    h = (h ^ (h >>> 13)) >>> 0;
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/*
 * 🔴 **문구는 앱 언어를 따른다**(2026-09-07). 그전에는 한국어 하드코딩이라
 *   **영어 UI 로 스토어 스크린샷을 찍으면 본문만 한국어**로 나왔다 — 화면은 영어인데
 *   일기가 한국어면 그 스크린샷은 쓸 수 없다.
 * ⚠ 한국어 외에는 영어로 떨어진다. 15개 언어를 다 쓰지 않는 이유는 이게 **개발용 시드**이고,
 *   스크린샷에 필요한 것은 *"읽을 수 있는 문장"* 이지 번역 품질이 아니기 때문이다.
 */
const TEXT = {
  ko: {
    openers: [
      '아침에 눈을 뜨자마자 창을 열었다.',
      '알람을 두 번 껐다.',
      '출근길 지하철이 유난히 붐볐다.',
      '오늘은 아무 일도 없었다.',
      '점심을 혼자 먹었다.',
      '비가 올 것 같아 우산을 챙겼다.',
      '어제 늦게 자서 하루 종일 멍했다.',
    ],
    middles: [
      '회의가 길어져 오후가 통째로 사라졌다.',
      '오랜만에 친구에게 연락이 왔다.',
      '점심에 회사 근처를 한 바퀴 걸었다.',
      '읽던 책을 절반쯤 넘겼다.',
      '저녁에 어머니한테 전화가 왔다. 별일 없냐고 물었다.',
      '퇴근하고 바로 누웠다. 아무것도 하기 싫었다.',
      '새로 생긴 카페에 들렀는데 자리가 없어서 그냥 나왔다.',
      '운동을 가려다 말았다. 내일은 가야지.',
      '오래된 사진을 정리하다가 한참 앉아 있었다.',
    ],
    closers: [
      '내일은 조금 일찍 자야겠다.',
      '별것 아닌데 기분이 오래 남았다.',
      '그냥 그런 하루였다.',
      '이런 날도 있는 거지.',
      '쓰고 나니 조금 정리됐다.',
    ],
    titles: [null, null, null, '보통날', '오랜만에', '정리', '비', '조용한 하루'],
  },
  en: {
    openers: [
      'I opened the window the moment I woke up.',
      'I snoozed the alarm twice.',
      'The train was unusually crowded this morning.',
      'Nothing much happened today.',
      'I had lunch on my own.',
      'It looked like rain, so I packed an umbrella.',
      'I slept late last night and felt hazy all day.',
    ],
    middles: [
      'A meeting ran long and swallowed the whole afternoon.',
      'An old friend got in touch out of nowhere.',
      'I walked a loop around the office at lunch.',
      'I got about halfway through the book I am reading.',
      'Mom called in the evening, just to ask if I was doing okay.',
      'I lay down the second I got home. I did not want to do anything.',
      'I stopped by the new cafe, but there were no seats, so I left.',
      'I almost went to the gym and then did not. Tomorrow.',
      'I sat for a long while sorting through old photos.',
    ],
    closers: [
      'I should go to bed a little earlier tomorrow.',
      'It was a small thing, but the feeling stayed with me.',
      'It was just one of those days.',
      'Some days are like this.',
      'Writing it down sorted me out a little.',
    ],
    titles: [null, null, null, 'An ordinary day', 'After a while', 'Sorting things out', 'Rain', 'A quiet day'],
  },
} as const;

/**
 * 심은 리포트의 요약문. 문구도 **앱 언어를 따른다**(2026-09-07) — 화면은 영어인데
 * 요약만 한국어면 스토어 스크린샷에 쓸 수 없다.
 *
 * 🔴 **연간은 두 문단이다.** 2026-08-25 실호출에서 연간이 처음 두 문단을 냈는데 그때까지
 *   화면은 한 문단만 그려본 적이 있었다 — 빈 줄이 뭉개지는지는 눈으로만 안다.
 * ⚠ 이것이 **모델이 쓴 글이 아니라는 것**을 문구 자체에 남긴다. 지우면 개발용 시드가
 *   진짜 리포트처럼 보인다.
 */
function summaryText(key: string, twoParagraphs: boolean): string {
  const ko = (k: string) =>
    `${k} 더미 요약입니다. 이 글은 모델이 쓴 것이 아니라 개발용으로 심은 문장이라 내용에 뜻이 없습니다.`;
  const en = (k: string) =>
    `Placeholder summary for ${k}. This text was seeded for development - it was not written by the model, so the wording means nothing.`;
  const head = (i18next.language ?? '').startsWith('ko') ? ko(key) : en(key);
  if (!twoParagraphs) {
    return `${head} ${(i18next.language ?? '').startsWith('ko') ? '아래 그림이 이 기간의 실제 조각에서 계산된 것인지만 보면 됩니다.' : 'What matters is whether the charts below are computed from the real entries in this period.'}`;
  }
  const second = (i18next.language ?? '').startsWith('ko')
    ? '두 번째 문단입니다. 문단 사이가 벌어지는지, 빈 줄이 뭉개지지는 않는지를 봅니다. 실제 모델도 긴 기간에서는 이렇게 나눠 씁니다.'
    : 'This is the second paragraph. We check whether the gap between paragraphs holds and the blank line is not collapsed. The real model also splits long periods like this.';
  return `${head}

${second}`;
}

/** 지금 앱 언어의 문구 묶음. 한국어가 아니면 영어로 떨어진다 */
function texts() {
  return (i18next.language ?? '').startsWith('ko') ? TEXT.ko : TEXT.en;
}

/*
 * ⚠ **모듈 로드 시점이 아니라 심는 시점에 읽는다.** 상수로 굳히면 앱을 켠 뒤 언어를 바꿔도
 *   옛 언어로 심긴다 — 스크린샷을 찍으려고 언어를 바꾸는 것이 정확히 그 순서다.
 */

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
      const title = texts().titles[Math.floor(rand(date, 13) * texts().titles.length)] ?? null;

      /*
       * 길이를 크게 흔든다. **짧은 주와 긴 주가 섞여야** 글자 수 막대가 의미를 갖고,
       * 원가·품질 측정도 한쪽으로 치우치지 않는다(§10.3에서 코퍼스가 전부 짧아 겪은 일).
       */
      const bulk = rand(date, 17);
      const lines = bulk < 0.25 ? 1 : bulk < 0.75 ? 3 : 6;
      const parts: string[] = [texts().openers[Math.floor(rand(date, 19) * texts().openers.length)] ?? ''];
      for (let i = 1; i < lines - 1; i += 1) {
        parts.push(texts().middles[Math.floor(rand(date, 23 + i * 7) * texts().middles.length)] ?? '');
      }
      if (lines > 1) parts.push(texts().closers[Math.floor(rand(date, 29) * texts().closers.length)] ?? '');
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

/**
 * 더미 리포트를 심는다 — **시각화를 화면에서 보려고** 있는 것이다.
 *
 * 🔴 진짜 리포트는 구독 + 서버 + 모델 호출이 있어야 만들어지고 **기간 캡이 평생 1번**이라,
 *   화면을 손보는 동안 수십 번 만들어 볼 수가 없다. 그래서 로컬 행만 심는다.
 *
 * ⚠ **`ai_usage`(서버 캡)와는 무관하다.** 여기 심은 것은 기기 안에만 있으므로 진짜 리포트를
 *   만들 몫을 축내지 않는다. 반대로 말하면 **서버는 이 기간을 아직 안 쓴 것으로 안다** —
 *   같은 기간을 진짜로 만들려 하면 앱이 *"이미 있어요"* 로 막는다(로컬이 1차 방어).
 *
 * ⚠ 요약문은 더미다. 프롬프트 품질을 보려면 `verify:hierarchy`를 쓴다.
 */
export async function seedReports(range: SeedRange): Promise<number> {
  if (!__DEV__) throw new Error('seedReports는 개발 빌드에서만 쓴다');
  const db = await getDatabase();

  const facts = await db.getAllAsync<{ entry_date: string }>(
    `SELECT entry_date FROM diaries WHERE deleted_at IS NULL
      AND entry_date >= ? AND entry_date <= ? ORDER BY entry_date`,
    range.from,
    range.to,
  );
  if (facts.length === 0) return 0;

  /*
   * 기간 키를 조각 날짜에서 뽑는다. 여기서 `period.ts`를 쓰지 않는 이유는 시드 파일 머리말과
   * 같다 — 그 파일은 서버로 생성 복사되는 순수 계층이라 개발 전용 코드가 얽히면 안 된다.
   * ⚠ 그래서 주차는 안 만든다(ISO 주차를 여기 다시 구현하면 두 벌이 된다).
   *   **월간·연간만** 심고, 주간은 실제 생성 경로로 확인한다.
   */
  const months = [...new Set(facts.map((f) => f.entry_date.slice(0, 7)))];
  const years = [...new Set(months.map((m) => m.slice(0, 4)))];

  let n = 0;
  await db.withTransactionAsync(async () => {
    for (const [kind, keys] of [
      ['monthly', months],
      ['yearly', years],
    ] as const) {
      for (const key of keys) {
        const at = Date.parse(`${range.to}T12:00:00Z`);
        /*
         * 지표도 심는다(§8.4) — 안 심으면 그 블록을 화면에서 볼 수가 없다.
         * ⚠ `stress`·`happiness`는 `days`가 **`null`이어야 한다.** 실제 모델이 그렇게 낸다.
         */
        const metrics = JSON.stringify({
          metrics: [
            { code: 'stress', value: 30 + Math.floor(rand(key, 41) * 45), days: null, basis: '개발용으로 심은 값입니다.' },
            { code: 'happiness', value: 30 + Math.floor(rand(key, 43) * 45), days: null, basis: '개발용으로 심은 값입니다.' },
            { code: 'exercise', value: 15 + Math.floor(rand(key, 47) * 55), days: Math.floor(rand(key, 53) * 6), basis: '개발용으로 심은 값입니다.' },
            { code: 'growth', value: 25 + Math.floor(rand(key, 59) * 55), days: Math.floor(rand(key, 61) * 9), basis: '개발용으로 심은 값입니다.' },
          ],
          topics: (['sleep', 'work', 'relationship', 'rest', 'money', 'health'] as const)
            .filter((_, i) => rand(key, 67 + i * 3) < 0.7)
            .map((code, i) => ({ code, days: 1 + Math.floor(rand(key, 71 + i * 5) * 8), note: '개발용으로 심은 값입니다.' })),
          /*
           * ⚠ 상위 리포트의 지표는 **하위 평균**이라 `from`이 붙는다(§8.4.1). 시드도 그 모양을
           *   흉내 내야 화면의 *"하위 N개 평균"* 라벨을 볼 수 있다.
           */
          from: kind === 'monthly' ? 4 : 12,
        });
        await db.runAsync(
          `INSERT OR REPLACE INTO ai_reports
             (id, kind, period_key, lang, summary, concern, source_count, model, prompt_ver, metrics, created_at, deleted_at)
           VALUES (?, ?, ?, 'ko', ?, 0, ?, 'seed', 0, ?, ?, NULL)`,
          `${PREFIX}${kind}-${key}`,
          kind,
          key,
          /*
           * 🔴 **연간은 두 문단으로 심는다.** 2026-08-25 실호출에서 연간이 처음으로 두 문단을
           *   냈는데, 그때까지 화면은 **한 문단만 그려본 적이 있었다.** 빈 줄이 뭉개지는지
           *   문단 사이가 벌어지는지는 눈으로만 안다.
           */
          kind === 'yearly' ? summaryText(key, true) : summaryText(key, false),
          kind === 'monthly' ? 4 : 12,
          metrics,
          at,
        );
        n += 1;
      }
    }
  });
  return n;
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
    await db.runAsync(`DELETE FROM ai_reports WHERE id LIKE '${PREFIX}%'`);
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
