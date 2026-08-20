/**
 * 프롬프트 시연 — `node --experimental-strip-types server/scripts/try-prompt.mjs [id|--all]`
 *
 * **앱을 거치지 않고** 지금 프롬프트로 리포트를 뽑아본다. 프롬프트를 고칠 때
 * 일기를 써 넣고 앱에서 생성하는 왕복이 너무 느려서 만들었다.
 *
 * ⚠ 일기는 전부 **더미**다(`fixtures/`). 실제 사용자의 일기를 넣지 않는다.
 * ⚠ 주 1회 캡·기간 UNIQUE를 건드리지 않는다 — 서버 라우트를 안 거치고 모델을 직접 부른다.
 * ⚠ **실제 과금이 발생한다.** 1건 약 ₩1.
 *
 * ```bash
 * export OPENAI_API_KEY=...
 * node --experimental-strip-types server/scripts/try-prompt.mjs office
 * node --experimental-strip-types server/scripts/try-prompt.mjs --all
 * AI_EFFORT=high node --experimental-strip-types server/scripts/try-prompt.mjs office
 * ```
 *
 * 설계 정본: `docs/AI_REPORT_SYSTEM.md` §8
 */
import { buildSystem, buildUser } from '../../features/ai/prompt.ts';
import { REPORT_SCHEMA, PROMPT_VERSION } from '../../features/ai/types.ts';
import { PERSONAS, PERSONA_IDS, findPersona } from './fixtures/index.mjs';

const arg = process.argv[2] ?? '--all';
const targets = arg === '--all' ? PERSONAS : [findPersona(arg)].filter(Boolean);

if (targets.length === 0) {
  console.error(`\n모르는 id: ${arg}\n쓸 수 있는 것: ${PERSONA_IDS.join(' · ')} · --all\n`);
  process.exit(1);
}

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

console.log(`\n모델 ${model} · effort ${effort} · PROMPT_VERSION ${PROMPT_VERSION}`);
console.log(`대상 ${targets.length}개\n`);

let inTotal = 0;
let outTotal = 0;

for (const p of targets) {
  const args = { kind: p.kind, lang: p.lang, periodKey: p.periodKey };
  const started = Date.now();

  let res;
  try {
    res = await client.responses.create({
      model,
      instructions: buildSystem(args),
      input: buildUser({ ...args, entries: p.entries }),
      store: false,
      reasoning: { effort },
      max_output_tokens: 4000,
      text: {
        format: { type: 'json_schema', name: 'jogak_report', schema: REPORT_SCHEMA, strict: true },
      },
    });
  } catch (e) {
    console.log(`\n■ ${p.label} (${p.id})  — 🔴 호출 실패: ${e.message}\n`);
    continue;
  }

  const ms = Date.now() - started;
  let parsed;
  try {
    parsed = JSON.parse(res.output_text ?? '');
  } catch {
    // refusal이면 여기로 온다 — crisis에서 실제로 볼 수 있는 경로다(§2)
    console.log(`\n■ ${p.label} (${p.id})  — 🔴 파싱 실패(거부 가능성)\n${res.output_text}\n`);
    continue;
  }

  const u = res.usage ?? {};
  inTotal += u.input_tokens ?? 0;
  outTotal += u.output_tokens ?? 0;

  /* 🔴 crisis는 concern=true가 나와야 한다. 눈에 띄게 표시한다 */
  const flag = p.id === 'crisis' ? (parsed.concern ? '  ✅ concern' : '  🔴 concern=false — 되돌릴 것') : parsed.concern ? '  ⚠ concern=true' : '';

  console.log('\n' + '━'.repeat(74));
  console.log(`■ ${p.label} (${p.id}) · 조각 ${p.entries.length}개${flag}`);
  console.log('━'.repeat(74));
  console.log(parsed.summary);
  console.log(`\n[${(ms / 1000).toFixed(1)}초 · 입력 ${u.input_tokens ?? '?'} · 출력 ${u.output_tokens ?? '?'}]`);
}

if (targets.length > 1) {
  console.log(`\n합계: 입력 ${inTotal} · 출력 ${outTotal} 토큰\n`);
}
