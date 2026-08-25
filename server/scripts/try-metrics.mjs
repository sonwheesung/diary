/**
 * 지표 A/B 시험 — `AI_SPEND=1 node --experimental-strip-types scripts/try-metrics.mjs`
 *
 * 🔴 **돈이 나간다**(2회 · 대략 ₩4). `AI_SPEND=1` 없이는 돌지 않는다.
 *
 * ## 왜 있나
 *
 * 리포트에 눈에 보이는 것을 붙이기로 했는데(2026-08-25 요청), 두 안이 갈렸다:
 *
 * ```
 * A  점수형   스트레스 관리 42 / 100 · 행복 61 / 100 …
 * B  빈도형   운동을 적은 날 3일 · 늦게 잔 날 5일 …
 * ```
 *
 * **숫자를 지어내고 화면만 그리면 판단이 안 된다.** 모델이 실제로 뱉는 값이 쓸 만한지가
 * 판단의 절반이라, 같은 주·같은 일기로 두 스키마를 각각 돌려 **진짜 출력**을 받는다.
 *
 * ⚠ 이 스크립트는 **`features/ai/prompt.ts`를 건드리지 않는다.** 여기서 쓰는 지시문은
 *   시험용 덧붙임이고, 어느 쪽으로 갈지 정해진 뒤에 정본 프롬프트로 옮긴다.
 *   지금 정본을 고치면 `PROMPT_VERSION`이 올라가고 `check:shared`·DB·매니페스트가 따라 움직인다.
 *
 * ⚠ 라우트를 거치지 않는다(`try-prompt.mjs`와 같다). 캡·`ai_usage`와 무관하다.
 */
import { buildSystem, buildUser } from '../shared/ai/prompt.ts';
import heavy from './fixtures/heavy.mjs';

if (process.env.AI_SPEND !== '1') {
  console.error('\n실제로 모델을 부른다(2회 · 대략 ₩4). AI_SPEND=1 을 붙인다.\n');
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
  console.error('\nOPENAI_API_KEY가 없다.\n');
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.AI_MODEL ?? 'gpt-5.6-luna';
const effort = process.env.AI_EFFORT ?? 'medium';

/**
 * 고정 주제 목록. **모델이 자유롭게 만들게 두지 않는다** — 주마다 축이 달라지면
 * 월간·연간에서 합산이 불가능하고 기간 간 비교도 뜻을 잃는다.
 */
const TOPICS = ['sleep', 'exercise', 'work', 'relationship', 'growth', 'rest', 'money', 'health'];

/* ── A: 점수형 ───────────────────────────────────────────────── */

const SCORE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: '이 기간을 돌아보는 요약. 요청된 언어로.' },
    concern: { type: 'boolean', description: '자해·자살 신호가 있으면 true.' },
    scores: {
      type: 'array',
      description: '아래 네 지표를 모두, 이 순서로.',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', enum: ['stress', 'happiness', 'exercise', 'growth'] },
          value: { type: 'integer', description: '0~100. 높을수록 그 지표가 좋다' },
          basis: { type: 'string', description: '그 점수의 근거 한 줄. 글에 실제로 있는 것만' },
        },
        required: ['code', 'value', 'basis'],
        additionalProperties: false,
      },
    },
  },
  required: ['summary', 'concern', 'scores'],
  additionalProperties: false,
};

const SCORE_RULES = [
  '',
  '추가로 — 네 지표를 0~100으로 매깁니다.',
  '· stress(스트레스 관리) · happiness(행복) · exercise(운동) · growth(자기개발). 넷 다 채웁니다.',
  '· **높을수록 좋습니다.** stress는 "스트레스가 많다"가 아니라 "잘 관리되고 있다"가 높은 쪽입니다.',
  '· 50을 보통으로 봅니다. 글에 근거가 거의 없으면 50 근처에 둡니다.',
  '· `basis`에는 **글에 실제로 있는 것만** 적습니다. 없으면 "글에 단서가 적음"이라고 적습니다.',
].join('\n');

/* ── B: 빈도형 ───────────────────────────────────────────────── */

const TOPIC_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: '이 기간을 돌아보는 요약. 요청된 언어로.' },
    concern: { type: 'boolean', description: '자해·자살 신호가 있으면 true.' },
    topics: {
      type: 'array',
      description: '글에 실제로 나타난 주제만. 안 나타난 주제는 넣지 않는다.',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', enum: TOPICS },
          days: { type: 'integer', description: '그 주제가 나타난 날 수. 조각 수를 넘지 않는다' },
          note: { type: 'string', description: '무엇으로 나타났는지 짧게. 판단하지 않는다' },
        },
        required: ['code', 'days', 'note'],
        additionalProperties: false,
      },
    },
  },
  required: ['summary', 'concern', 'topics'],
  additionalProperties: false,
};

const TOPIC_RULES = [
  '',
  '추가로 — 그 기간에 **실제로 나타난 주제**를 셉니다.',
  `· 고를 수 있는 것: ${TOPICS.join(' · ')}. **안 나타난 것은 넣지 않습니다.**`,
  '· `days`는 그 주제가 적힌 **날 수**입니다. 조각 수보다 클 수 없습니다.',
  '· 🔴 **점수를 매기지 않습니다.** 좋다·나쁘다·잘한다를 쓰지 않습니다.',
  '  `note`는 *무엇으로 나타났는지*만 적습니다 — 뜻은 읽는 사람이 정합니다.',
  '    ✅ "하천 걷기 · 방 정리"      🚫 "활동량이 부족합니다"',
].join('\n');

/* ── 실행 ────────────────────────────────────────────────────── */

const args = { kind: heavy.kind, lang: heavy.lang, periodKey: heavy.periodKey };
const base = buildSystem(args);
const input = buildUser({ ...args, entries: heavy.entries });

async function run(label, extra, schema) {
  const t0 = Date.now();
  const res = await client.responses.create({
    model,
    instructions: base + '\n' + extra,
    input,
    store: false,
    reasoning: { effort },
    max_output_tokens: 4000,
    text: { format: { type: 'json_schema', name: 'jogak_metrics', schema, strict: true } },
  });
  const took = ((Date.now() - t0) / 1000).toFixed(1);
  const out = JSON.parse(res.output_text);
  console.log(`\n■ ${label}  ${took}초 · 입력 ${res.usage.input_tokens} · 출력 ${res.usage.output_tokens}`);
  console.log(JSON.stringify(out, null, 2));
  return out;
}

/* ── C: 합친 것 — 날 수가 점수를 받친다 ─────────────────────── */

/*
 * 🔴 **A와 B를 그냥 붙이면 같은 말을 두 번 한다.** `운동 28점`과 `운동 1일`이 나란히 뜨면
 *   독자는 *"뭐가 맞지"* 를 묻는다. 그래서 **한 줄에 넣는다** — 날 수는 근거, 점수는 판단이다.
 *
 * 그리고 셀 수 없는 지표(스트레스 관리·행복)는 `days`를 비운다. 억지로 세게 하면
 * *"행복한 날 3일"* 같은 것이 나오는데 그건 판단을 세는 척하는 것이다.
 */
const BOTH_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: '이 기간을 돌아보는 요약. 요청된 언어로.' },
    concern: { type: 'boolean', description: '자해·자살 신호가 있으면 true.' },
    metrics: {
      type: 'array',
      description: '네 지표를 모두, 이 순서로.',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', enum: ['stress', 'happiness', 'exercise', 'growth'] },
          value: { type: 'integer', description: '0~100. 높을수록 그 지표가 좋다' },
          days: {
            type: ['integer', 'null'],
            description: '그 지표가 글에 나타난 날 수. 셀 수 없는 지표(stress·happiness)는 null',
          },
          basis: { type: 'string', description: '근거 한 줄. 글에 실제로 있는 것만' },
        },
        required: ['code', 'value', 'days', 'basis'],
        additionalProperties: false,
      },
    },
    topics: {
      type: 'array',
      description: '위 네 지표 **말고** 그 기간에 나타난 주제. 안 나타난 것은 넣지 않는다.',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', enum: ['sleep', 'work', 'relationship', 'rest', 'money', 'health'] },
          days: { type: 'integer', description: '나타난 날 수. 조각 수를 넘지 않는다' },
          note: { type: 'string', description: '무엇으로 나타났는지 짧게. 판단하지 않는다' },
        },
        required: ['code', 'days', 'note'],
        additionalProperties: false,
      },
    },
  },
  required: ['summary', 'concern', 'metrics', 'topics'],
  additionalProperties: false,
};

const BOTH_RULES = [
  '',
  '추가로 — 지표 넷과, 그 밖에 나타난 주제를 함께 냅니다.',
  '',
  '지표 넷 (`metrics`) — stress(스트레스 관리) · happiness(행복) · exercise(운동) · growth(자기개발)',
  '· 넷 다 채웁니다. `value`는 0~100이고 **높을수록 좋습니다.**',
  '  stress는 "스트레스가 많다"가 아니라 "잘 관리되고 있다"가 높은 쪽입니다.',
  '· 50을 보통으로 봅니다. 글에 근거가 거의 없으면 50 근처에 둡니다.',
  '· 🔴 `days`는 **셀 수 있을 때만** 채웁니다. exercise·growth는 그 주제가 적힌 날 수를 셉니다.',
  '  stress·happiness는 **날로 셀 수 없으므로 null**입니다. 억지로 세지 않습니다.',
  '· `basis`에는 글에 실제로 있는 것만 적습니다.',
  '',
  '그 밖의 주제 (`topics`) — sleep · work · relationship · rest · money · health',
  '· **실제로 나타난 것만** 넣습니다. 위 네 지표와 겹치지 않습니다.',
  '· `note`는 *무엇으로 나타났는지*만 적습니다. 좋다·나쁘다를 쓰지 않습니다.',
].join(String.fromCharCode(10));

console.log(`모델 ${model} · effort ${effort} · fixture ${heavy.id}(${heavy.entries.length}조각)`);
const only = process.argv[2] ?? 'all';
if (only === 'all' || only === 'a') await run('A 점수형', SCORE_RULES, SCORE_SCHEMA);
if (only === 'all' || only === 'b') await run('B 빈도형', TOPIC_RULES, TOPIC_SCHEMA);
if (only === 'all' || only === 'c') await run('C 합친 것', BOTH_RULES, BOTH_SCHEMA);
console.log('');
