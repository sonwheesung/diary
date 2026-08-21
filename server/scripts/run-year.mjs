/**
 * 1년 연쇄 생성 — `node --experimental-strip-types server/scripts/run-year.mjs [연도]`
 *
 * 주간 52개 → 월간 12개 → 연간 1개를 **실제로 이어서** 만든다.
 * 지금까지 시험한 것은 주간뿐이었고 월간·연간은 코드만 있고 한 번도 안 돌아봤다.
 *
 * ⚠ **실제 과금이 발생한다.** 65회 × 약 ₩1.
 * ⚠ 일기는 전부 더미다(`fixtures/year-2025/`). 실제 사용자의 일기를 넣지 않는다.
 * ⚠ 서버 라우트를 안 거친다 — 캡·기간 UNIQUE를 건드리지 않는다(`try-prompt.mjs`와 같은 규약).
 *
 * 🔴 **중간 결과를 파일에 남긴다.** 65회 중 60번째에서 깨졌을 때 처음부터 다시 돌리면
 *   돈도 시간도 두 배로 든다. 이미 만든 것은 건너뛴다 — 지우려면 `--fresh`.
 *
 * ```bash
 * export OPENAI_API_KEY=...
 * node --experimental-strip-types server/scripts/run-year.mjs
 * node --experimental-strip-types server/scripts/run-year.mjs 2025 --fresh
 * ```
 *
 * 설계 정본: `docs/AI_REPORT_SYSTEM.md` §8 · `fixtures/year-2025/README.md`
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { buildSystem, buildUser } from '../../features/ai/prompt.ts';
import { REPORT_SCHEMA, PROMPT_VERSION } from '../../features/ai/types.ts';
import {
  monthKeysInYear,
  weekKeyRange,
  weekKeysInMonth,
} from '../../features/ai/period.ts';
const year = process.argv.find((a) => /^\d{4}$/.test(a)) ?? '2025';
const fresh = process.argv.includes('--fresh');

/** 픽스처는 연도별 폴더다. 없으면 여기서 죽는다 — 조용히 빈 해를 만드는 것보다 낫다 */
const { ENTRIES } = await import(`./fixtures/year-${year}/index.mjs`);

const OUT = join(dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), `.cache/year-${year}.json`);

/* ── 저장소 — 재개의 근거 ──────────────────────────────────── */

mkdirSync(dirname(OUT), { recursive: true });
/** `{ [periodKey]: { kind, summary, concern, ms, usage } }` */
let store = {};
if (!fresh && existsSync(OUT)) {
  store = JSON.parse(readFileSync(OUT, 'utf8'));
  console.log(`이어서 한다 — 이미 ${Object.keys(store).length}개 있다  (${OUT})`);
}
const save = () => writeFileSync(OUT, `${JSON.stringify(store, null, 2)}\n`, 'utf8');

/* ── 모델 ─────────────────────────────────────────────────── */

let OpenAI;
try {
  ({ default: OpenAI } = await import('openai'));
} catch {
  console.error('\nopenai SDK가 없다.  cd server && npm i openai\n');
  process.exit(1);
}
if ((process.env.OPENAI_API_KEY ?? '').length === 0) {
  console.error('\nOPENAI_API_KEY가 없다. 실제 과금이 발생하는 스크립트다.\n');
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.AI_MODEL ?? 'gpt-5.6-luna';
const effort = process.env.AI_EFFORT ?? 'medium';
const lang = 'ko';

let inTotal = 0;
let outTotal = 0;
let called = 0;

/**
 * 한 건 생성. 이미 있으면 **부르지 않는다** — 재개의 전부가 이 한 줄이다.
 *
 * ⚠ 실패를 store에 넣지 않는다. 넣으면 다음 실행이 실패를 성공으로 알고 건너뛴다.
 */
async function make(kind, periodKey, payload) {
  if (store[periodKey] !== undefined) return store[periodKey];

  const args = { kind, lang, periodKey };
  const started = Date.now();
  let res;
  try {
    res = await client.responses.create({
      model,
      instructions: buildSystem(args),
      input: buildUser({ ...args, ...payload }),
      store: false,
      reasoning: { effort },
      max_output_tokens: 4000,
      text: {
        format: { type: 'json_schema', name: 'jogak_report', schema: REPORT_SCHEMA, strict: true },
      },
    });
  } catch (e) {
    console.log(`  🔴 ${periodKey} 호출 실패: ${e.message}`);
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(res.output_text ?? '');
  } catch {
    // refusal이면 여기로 온다
    console.log(`  🔴 ${periodKey} 파싱 실패(거부 가능성)`);
    return null;
  }

  const u = res.usage ?? {};
  inTotal += u.input_tokens ?? 0;
  outTotal += u.output_tokens ?? 0;
  called += 1;

  store[periodKey] = {
    kind,
    summary: parsed.summary,
    concern: parsed.concern === true,
    ms: Date.now() - started,
    usage: { in: u.input_tokens ?? 0, out: u.output_tokens ?? 0 },
  };
  save();
  return store[periodKey];
}

/* ── ① 주간 ───────────────────────────────────────────────── */

const months = monthKeysInYear(year);
/** 그 해의 주. 달마다 겹치므로 Set으로 모은다 */
const weeks = [...new Set(months.flatMap((m) => weekKeysInMonth(m)))].sort();

console.log(`\n모델 ${model} · effort ${effort} · PROMPT_VERSION ${PROMPT_VERSION}`);
console.log(`${year} — 주 ${weeks.length} · 월 ${months.length} · 연 1\n`);

console.log('■ 주간');
for (const wk of weeks) {
  const range = weekKeyRange(wk);
  if (range === null) continue;
  const entries = ENTRIES.filter((e) => e.date >= range.from && e.date <= range.to);
  if (entries.length === 0) {
    console.log(`  · ${wk}  일기 0개 — 건너뛴다`);
    continue;
  }
  const had = store[wk] !== undefined;
  const r = await make('weekly', wk, { entries });
  if (r !== null) {
    console.log(`  ${had ? '=' : '+'} ${wk}  일기 ${entries.length}개${r.concern ? '  🔴 concern' : ''}`);
  }
}

/* ── ② 월간 — 그 달의 주간 리포트만 입력한다(원본 재투입 금지) ── */

console.log('\n■ 월간');
for (const mo of months) {
  const subReports = weekKeysInMonth(mo)
    .filter((wk) => store[wk] !== undefined)
    .map((wk) => ({ periodKey: wk, summary: store[wk].summary }));
  if (subReports.length === 0) {
    console.log(`  · ${mo}  하위 0개 — 건너뛴다`);
    continue;
  }
  const had = store[mo] !== undefined;
  const r = await make('monthly', mo, { subReports });
  if (r !== null) {
    console.log(`  ${had ? '=' : '+'} ${mo}  주간 ${subReports.length}개${r.concern ? '  🔴 concern' : ''}`);
  }
}

/* ── ③ 연간 ───────────────────────────────────────────────── */

console.log('\n■ 연간');
{
  const subReports = months
    .filter((mo) => store[mo] !== undefined)
    .map((mo) => ({ periodKey: mo, summary: store[mo].summary }));
  const had = store[year] !== undefined;
  const r = await make('yearly', year, { subReports });
  if (r !== null) {
    console.log(`  ${had ? '=' : '+'} ${year}  월간 ${subReports.length}개${r.concern ? '  🔴 concern' : ''}`);
  }
}

/* ── 보고 ─────────────────────────────────────────────────── */

console.log(`\n이번 실행 ${called}건 · 입력 ${inTotal.toLocaleString()} · 출력 ${outTotal.toLocaleString()} 토큰`);
console.log(`저장: ${OUT}`);
console.log(`\n읽기: node --experimental-strip-types server/scripts/show-year.mjs ${year}\n`);
