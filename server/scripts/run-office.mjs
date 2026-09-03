/**
 * 회사원 1년 코퍼스로 계층 리포트를 만든다 — `npm run run:office`
 *
 * `run-year.mjs` 와 하는 일은 같지만 **한 가지가 다르다**: 이 코퍼스는 한 달씩 도착한다.
 * 그래서 아직 안 받은 달에 걸쳐 있는 주를 **미리 만들어 굳히면 안 된다.**
 *
 * 🔴 **경계 주 문제.** 2026-W09 는 2/23~3/1 이다. 2월만 받은 상태에서 만들면 3월 1일이
 *   빠진 채로 캐시에 굳고, 3월이 도착해도 **다시 만들지 않는다**(캐시가 있으니까).
 *   실제 앱에서도 캡이 평생 1번이라 같은 성질이다 — 그래서 여기서도 같은 규율을 쓴다:
 *   **범위가 마지막 수집일을 넘는 주는 건너뛴다.**
 *
 * 🔴 **상위는 하위가 다 모인 뒤에**(`docs/AI_REPORT_SYSTEM.md` §6.5). 그 달에 속한 주가
 *   하나라도 안 만들어졌으면 월간을 만들지 않는다. 주간 2개짜리 달의 월간이 굳는 것이
 *   그 절이 막으려던 사고다.
 *
 * ```bash
 * AI_SPEND=1 node --experimental-strip-types server/scripts/run-office.mjs
 * AI_SPEND=1 node --experimental-strip-types server/scripts/run-office.mjs --dry   # 뭘 만들지만 본다
 * ```
 *
 * ⚠ **돈이 나간다.** `AI_SPEND=1` 없이는 돌지 않는다(`run-year.mjs` 와 같은 규약).
 * ⚠ 결과는 `.cache/office-2026.json` 에 쌓인다. **커밋한다** — 모델이 같은 답을 두 번 주지
 *   않으므로 지우면 비교의 근거가 사라진다(`.cache/README.md`).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
  weekKeyForYmd,
  weekKeyRange,
  weekKeysInMonth,
  monthKeysInYear,
} from '../../features/ai/period.ts';
import { buildSystem, buildUser } from '../../features/ai/prompt.ts';
import { PROMPT_VERSION, schemaFor, pickHeadlineFrom } from '../../features/ai/types.ts';
import { loadEntries } from './fixtures/office-2026/index.mjs';

const HERE = dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const CACHE = join(HERE, '.cache');
const OUT = join(CACHE, 'office-2026.json');
const DRY = process.argv.includes('--dry');
/*
 * 🔴 **"아직 안 끝난 주"와 "코퍼스가 끝난 것"은 다르다** (2026-09-03, 12월에서 잡았다).
 *
 * 2026-W53 은 12/28~2027-01-03 이다. 마지막 수집일이 2026-12-31 이므로 기본 규칙(범위가
 * 마지막 수집일을 넘으면 건너뛴다)에 걸리는데, **2027년은 영원히 오지 않는다.**
 * 그대로 두면 W53 → 2026-12 월간 → 2026 연간이 **줄줄이 영영 안 만들어진다.**
 *
 * `--final` 은 *"더 받을 달이 없다"* 는 선언이다. 그때는 넘치는 주도 가진 것으로 만든다 —
 * 실제 앱에서도 그 주는 해가 바뀐 뒤에 만들어지고, 그때 있는 조각으로 만들어진다.
 *
 * ⚠ 기본값이 아니다. 중간에 붙이면 경계 주가 반쪽으로 굳는다 — 그게 이 가드의 존재 이유다.
 */
const FINAL = process.argv.includes('--final');

if (!DRY && process.env.AI_SPEND !== '1') {
  console.error('\n이 스크립트는 실제로 모델을 부른다. 돌리려면 AI_SPEND=1 을 붙인다.');
  console.error('무엇을 만들지만 보려면 --dry.\n');
  process.exit(1);
}

const { files, entries } = loadEntries();
if (entries.length === 0) {
  console.error('\n받은 달이 없다. server/scripts/fixtures/office-2026/2026-MM.md 를 먼저 채운다.\n');
  process.exit(1);
}

/** 🔴 마지막 수집일. 이걸 넘는 주는 아직 완성되지 않았다 */
const lastDate = entries[entries.length - 1].date;
const year = '2026';
const lang = process.env.REPORT_LANG ?? 'ko';
const model = process.env.AI_MODEL ?? 'gpt-5.6-luna';
const effort = process.env.AI_EFFORT ?? 'medium';

mkdirSync(CACHE, { recursive: true });
/** `{ [periodKey]: { kind, headline, summary, concern, metrics, topics, ms, usage } }` */
const store = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};

console.log(`\n받은 달 ${files.length}개 · 일기 ${entries.length}개 · 마지막 ${lastDate}`);
console.log(`모델 ${model} · effort ${effort} · PROMPT_VERSION ${PROMPT_VERSION}\n`);

let OpenAI = null;
if (!DRY) {
  ({ default: OpenAI } = await import('openai'));
  if ((process.env.OPENAI_API_KEY ?? '').length === 0) {
    console.error('OPENAI_API_KEY 가 없다.\n');
    process.exit(1);
  }
}
const client = DRY ? null : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let spend = 0;

/**
 * 🔴 **서버가 하는 검증을 여기서도 한다** (§8.2.1).
 *
 * 이 스크립트는 라우트를 안 거치므로 `pickHeadlineFrom` 이 안 걸린다. 그대로 두면
 * 참조 코퍼스가 **앱이 실제로 만들 것과 달라진다** — 실제로 4개짜리가 하나 나왔고
 * (상한은 3), 지어낸 키가 섞여도 몰랐을 것이다.
 * ⚠ 발견 경위: 생성 결과의 개수 분포를 세다가 `{"4":1}` 이 보였다.
 */
function allowedKeys(kind, payload) {
  return kind === 'weekly'
    ? (payload.entries ?? []).map((e) => e.date)
    : (payload.subReports ?? []).map((r) => r.periodKey);
}

async function make(kind, periodKey, payload) {
  if (store[periodKey] !== undefined) return store[periodKey];
  if (DRY) {
    console.log(`  + ${periodKey}  (만들 예정)`);
    return null;
  }
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
        format: { type: 'json_schema', name: 'jogak_report', schema: schemaFor(kind), strict: true },
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
    console.log(`  🔴 ${periodKey} 파싱 실패(거부 가능성)`);
    return null;
  }
  const u = res.usage ?? {};
  store[periodKey] = {
    kind,
    ...parsed,
    headlineFrom: pickHeadlineFrom(parsed.headlineFrom, allowedKeys(kind, payload)),
    ms: Date.now() - started,
    usage: { in: u.input_tokens ?? 0, out: u.output_tokens ?? 0 },
    promptVersion: PROMPT_VERSION,
    model,
  };
  spend += 1;
  writeFileSync(OUT, JSON.stringify(store, null, 1)); // 중간에 죽어도 지금까지 산 것은 남는다
  return store[periodKey];
}

/* ── ① 주간 — 마지막 수집일을 넘지 않는 주만 ─────────────────────────── */

const weeksWithEntries = [...new Set(entries.map((e) => weekKeyForYmd(e.date)))]
  .filter((k) => k !== null)
  .sort();

console.log('■ 주간');
const doneWeeks = new Set();
for (const wk of weeksWithEntries) {
  const range = weekKeyRange(wk);
  if (range === null) continue;
  if (range.to > lastDate && !FINAL) {
    console.log(`  · ${wk}  ${range.from}~${range.to} — 아직 안 끝났다(마지막 ${lastDate}). 건너뛴다`);
    continue;
  }
  const mine = entries.filter((e) => e.date >= range.from && e.date <= range.to);
  const had = store[wk] !== undefined;
  const r = await make('weekly', wk, { entries: mine });
  if (r !== null || (DRY && !had)) doneWeeks.add(wk);
  if (r !== null) console.log(`  ${had ? '=' : '+'} ${wk}  일기 ${mine.length}개${r.concern ? '  🔴 concern' : ''}`);
}

/* ── ② 월간 — 그 달의 주가 **다 모인** 달만 (§6.5) ──────────────────── */

console.log('\n■ 월간');
for (const mo of monthKeysInYear(year)) {
  const weeks = weekKeysInMonth(mo);
  /* 그 달에 걸친 주 중 **일기가 있는데 아직 안 만든 것**이 하나라도 있으면 미룬다 */
  const pending = weeks.filter((wk) => weeksWithEntries.includes(wk) && store[wk] === undefined);
  const ready = weeks.filter((wk) => store[wk] !== undefined);
  if (ready.length === 0) continue;
  if (pending.length > 0) {
    console.log(`  · ${mo}  주간 ${pending.length}개가 아직이다(${pending.join(' ')}) — 미룬다`);
    continue;
  }
  const had = store[mo] !== undefined;
  const subReports = ready.map((wk) => ({ periodKey: wk, summary: store[wk].summary }));
  const r = await make('monthly', mo, { subReports });
  if (r !== null) console.log(`  ${had ? '=' : '+'} ${mo}  주간 ${subReports.length}개`);
}

/* ── ③ 연간 — 열두 달이 다 있을 때만 ──────────────────────────────── */

const months = monthKeysInYear(year).filter((mo) => store[mo] !== undefined);
console.log(`\n■ 연간  (월간 ${months.length}/12)`);
if (months.length === 12) {
  const had = store[year] !== undefined;
  const r = await make('yearly', year, {
    subReports: months.map((mo) => ({ periodKey: mo, summary: store[mo].summary })),
  });
  if (r !== null) console.log(`  ${had ? '=' : '+'} ${year}  월간 12개`);
} else {
  console.log('  · 열두 달이 다 모이면 만든다');
}

/* ── 보고 ───────────────────────────────────────────────────────── */

const keys = Object.keys(store);
const tin = keys.reduce((a, k) => a + (store[k].usage?.in ?? 0), 0);
const tout = keys.reduce((a, k) => a + (store[k].usage?.out ?? 0), 0);
console.log(`\n누적 ${keys.length}건 (이번에 ${spend}건) · 입력 ${tin.toLocaleString()} · 출력 ${tout.toLocaleString()} 토큰`);
console.log(`저장: server/scripts/.cache/office-2026.json\n`);
