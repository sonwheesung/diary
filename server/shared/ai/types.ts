/* eslint-disable */
// ─────────────────────────────────────────────────────────────────────────
// 🔴 생성된 파일이다. 고치지 마라 — 원본은 `features/ai/types.ts`.
//
// `npm run sync:shared`가 만든다. 여기를 고치면 다음 sync가 말없이 덮는다.
// 왜 심볼릭 링크나 tsconfig paths가 아닌지는 `scripts/sync-shared.mjs` 참조
// (요약: Vercel CLI가 `server/`만 업로드해서 `../features`가 배포본에 없었다).
// ─────────────────────────────────────────────────────────────────────────
/**
 * AI 리포트 타입 — **순수 계층.** 프로젝트 내부 임포트 0.
 *
 * Node에서 그대로 임포트해 검사할 수 있어야 한다(`scripts/check-ai.mjs`).
 * SDK 타입을 여기로 끌어오면 그 순간 검사가 불가능해진다 — `features/subscription/trial.ts`와 같은 규약.
 *
 * 설계 정본: `docs/AI_REPORT_SYSTEM.md`
 */

/** 리포트 종류. 계층 요약의 단계이기도 하다 — weekly → monthly → yearly */
export type ReportKind = 'weekly' | 'monthly' | 'yearly';

/**
 * 모델에게 넘기는 조각 하나.
 *
 * ⚠ **식별자를 넣지 않는다.** id·subject·기기 정보는 요약에 쓸모가 없고, 넣는 순간
 *   "필요한 최소한만 보낸다"는 말이 거짓이 된다.
 */
export interface EntryInput {
  /** `YYYY-MM-DD`. 요일 흐름을 읽는 데 쓴다 */
  date: string;
  /** 감정 **코드**(`joy` 등). 문구가 아니다 — §9.1 규칙 2 */
  emotion: string | null;
  title: string | null;
  /** 평문 본문. 이미지는 넣지 않는다(§10) */
  text: string;
}

/** 하위 리포트를 입력으로 받을 때(월간·연간). 계층 요약 */
export interface SubReportInput {
  /** `2026-W33` · `2026-08` */
  periodKey: string;
  summary: string;
}

export interface BuildPromptArgs {
  kind: ReportKind;
  /** 리포트를 쓸 언어. `lib/i18n.ts`의 코드 (ko · en · ja …) */
  lang: string;
  /** `2026-W33` · `2026-08` · `2026` */
  periodKey: string;
  /** weekly일 때만 */
  entries?: EntryInput[];
  /** monthly·yearly일 때만. 원본을 통째로 재투입하지 않는다 */
  subReports?: SubReportInput[];
}

/**
 * 🔴 **지표 넷** (2026-08-25 사용자 결정, `docs/AI_REPORT_SYSTEM.md` §8.4).
 *
 * 고정 축이다 — 매 기간 넷이 다 나온다. 그래야 월간에서 평균을 내고 추이선을 그릴 수 있다.
 * 주제가 기간마다 달라지는 방식이면 그 칸이 아예 안 나온다.
 *
 * ⚠ **코드만 저장한다.** 라벨을 저장하면 언어를 바꾼 순간 옛 리포트만 옛 언어로 남는다(§9.1 규칙 2).
 * 🔴 **한 번 저장되면 옛 리포트에서 굳는다.** 캡이 평생 1번이라 재생성이 없다 — 목록을 늘리는 것은
 *   되지만 이름을 바꾸면 옛 리포트의 지표를 못 그린다.
 */
export const METRIC_CODES = ['stress', 'happiness', 'exercise', 'growth'] as const;
export type MetricCode = (typeof METRIC_CODES)[number];

/**
 * 지표 **말고** 그 기간에 나타난 주제. 점수를 매기지 않고 **날 수만** 센다.
 *
 * ⚠ 지표 넷과 겹치지 않는다 — 겹치면 `운동 25점`과 `운동 1일`이 따로 떠서
 *   *"뭐가 맞지"* 가 된다(2026-08-25 A/B에서 실제로 겪었다).
 */
export const TOPIC_CODES = ['sleep', 'work', 'relationship', 'rest', 'money', 'health'] as const;
export type TopicCode = (typeof TOPIC_CODES)[number];

export interface MetricValue {
  code: MetricCode;
  /** 0~100. **높을수록 좋다** — `stress`는 "스트레스가 많다"가 아니라 "잘 관리되고 있다"가 높은 쪽 */
  value: number;
  /**
   * 그 지표가 나타난 날 수. **셀 수 없으면 `null`.**
   *
   * 🔴 `stress`·`happiness`는 날로 셀 수 없다. 억지로 세게 하면 *"행복한 날 3일"* 같은 것이
   *   나오는데 그건 판단을 세는 척하는 것이다. 화면은 이 칸이 `null`이면 `—`로 비운다.
   */
  days: number | null;
  /** 근거 한 줄. 글에 실제로 있는 것만 */
  basis: string;
  /**
   * 🔴 **화면에 나가는 문장**(§8.5 결정 4 · v15). 숫자는 계속 만들고 저장하지만(§8.4.1 합산)
   *   화면은 이 문장만 보여준다 — 세 번의 외부 평가가 모두 *"왜 46인가"* 에 답하지 못했다.
   *
   * ⚠ **없을 수 있다** — v14 이전 리포트·상위 리포트(합산값)에는 없다. 화면은 `basis` 로 떨어진다.
   * ⚠ 위기 신호가 켜진 리포트에서는 서버가 빈 문자열로 비운다(§3.1).
   */
  verdict?: string;
}

export interface TopicValue {
  code: TopicCode;
  days: number;
  /** 무엇으로 나타났는지. **판단하지 않는다** */
  note: string;
}

/**
 * 모델이 돌려줘야 하는 형태. **구조화 출력으로 강제한다.**
 *
 * 🔴 `concern`을 본문에서 문자열로 찾지 않는 이유: 파싱이 문자열 매칭이 되면
 *   모델이 표현을 조금만 바꿔도 **배너가 조용히 안 뜬다.** 위기 안내가 조용히
 *   사라지는 실패는 눈에 보이지 않는다.
 */
export interface ReportOutput {
  /**
   * 이 기간에서 **가장 눈에 띈 것 한 문장**(§8.2).
   *
   * 🔴 **앱이 요약문의 첫 문장을 자르지 않는 이유가 이 칸이다.** v11 의 첫 문장이 하필
   *   가장 약한 연대기 문장이었다 — 구조가 판정할 것을 문장에서 캐내면 조용히 틀린다
   *   (`concern` 을 본문에서 문자열로 찾지 않는 것과 같은 규약).
   */
  headline: string;
  /**
   * 핵심 한 줄이 기댄 자료의 키 **1~3개**(§8.2.1). 주간이면 날짜(`2026-05-07`),
   * 월간이면 주 키(`2026-W19`), 연간이면 달 키(`2026-05`) — **한 층 아래를 가리킨다.**
   *
   * 🔴 **모델이 지어낸 키는 앱·서버가 버린다**(`pickHeadlineFrom`). 눌렀는데 아무것도 없으면
   *   그 순간 *"AI가 아무 말이나 한다"* 가 되고, 이 기능이 만들려던 신뢰가 정확히 반대로 무너진다.
   */
  headlineFrom: string[];
  summary: string;
  /** 위기 신호가 보이는가. `true`면 상담 채널 배너를 얹는다(§3) */
  concern: boolean;
  /** 지표 넷. **순서와 개수가 고정**이다 */
  metrics: MetricValue[];
  /** 그 기간에 실제로 나타난 주제만. 없으면 빈 배열 */
  topics: TopicValue[];
}

/* ── v15 — 발견·해낸 것·권유·셀 수 있는 사실 (`docs/AI_REPORT_SYSTEM.md` §8.5 · §3.1) ── */

/**
 * 발견의 모양 넷(§8.5 결정 3). **코드만 저장한다** — 화면이 언어별 라벨을 붙인다(§9.1 규칙 2).
 *
 * ⚠ 이름을 바꾸면 옛 리포트의 카드 라벨을 못 그린다. 늘리는 것만 한다.
 */
export const DISCOVERY_SHAPES = ['decision', 'repeat', 'change', 'gap'] as const;
export type DiscoveryShape = (typeof DISCOVERY_SHAPES)[number];

/** 발견을 받치는 원문 한 조각. `quote` 는 **그날 일기에 실제로 있는 문장**이어야 한다 */
export interface Evidence {
  date: string;
  quote: string;
  /** 그날 그 문장이 무엇이었는지 — 결정·행동·결과·다짐 … (모델이 출력 언어로 쓴다) */
  role: string;
}

export interface Discovery {
  shape: DiscoveryShape;
  /** 발견 한 문장. 가능하면 *"~가 아니라 ~였다"* 모양 */
  title: string;
  evidence: Evidence[];
}

/** 실제로 해낸 것 한 문장 + 날짜 */
export interface Achievement {
  text: string;
  dates: string[];
}

/**
 * 권유 — *"~해보는 건 어떨까요"* (§8.5 결정 1). **두 날 이상 반복된 패턴**에서만 나온다.
 *
 * 🔴 `pattern`·`dates` 가 없으면 **뜬금없는 조언**이 된다 — 평가마다 *"왜 이런 말을 하는지"* 가
 *   보여야 조언으로 안 읽힌다고 했다. 그래서 서버가 날짜 둘 미만을 버린다.
 */
export interface Suggestion {
  /** 반복된 패턴 — 권유의 근거 */
  pattern: string;
  text: string;
  dates: string[];
}

/**
 * 셀 수 있는 사실(§8.5 결정 5). `label` 에 **무엇을 셌는지 기준**이 들어간다.
 *
 * 🔴 **다짐("가야지")은 세지 않는다.** 외부 평가자도 다짐을 운동한 날로 셌다 — 기준이 화면에
 *   안 보이면 사용자도 같은 의심을 한다.
 */
export interface CountFact {
  label: string;
  value: number;
  unit: string;
  dates: string[];
}

/** 요일 격자 아래 한 줄 — 그날 적은 것의 사실 요약(§8.5 결정 8) */
export interface DayNote {
  date: string;
  note: string;
}

/**
 * v15 가 더한 칸 전부. 로컬 DB 는 **컬럼 하나에 JSON** 으로 담는다(DB v10 · `metrics` 와 같은 판단).
 *
 * 🔴 **`null` 이 정상값이다** — v14 이전 리포트에는 없고 캡이 평생 1번이라 영원히 안 생긴다.
 *   화면은 그때 이 블록들을 안 그린다.
 * ⚠ 월간·연간은 `harmToOthers` 만 의미가 있고 배열은 전부 비어 있다 — 발견·근거 인용은
 *   **원문을 보는 주간에서만** 가능하다(상위는 하위 요약문만 받는다).
 */
export interface ReportInsights {
  /**
   * 🔴 **타인 위해 신호**(§3.1). `concern` 은 이제 **자해·자살만** 뜻한다 —
   *   남을 해치려는 계획에 자살예방 배너(109)가 뜨던 결함을 여기서 가른다.
   */
  harmToOthers: boolean;
  discoveries: Discovery[];
  achievements: Achievement[];
  suggestions: Suggestion[];
  counts: CountFact[];
  dayNotes: DayNote[];
}

/** 빈 칸 — 위기 리포트·상위 리포트가 쓴다 */
export function emptyInsights(harmToOthers: boolean): ReportInsights {
  return { harmToOthers, discoveries: [], achievements: [], suggestions: [], counts: [], dayNotes: [] };
}

const obj = (properties: Record<string, unknown>) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
const STR = { type: 'string' } as const;
const STR_ARR = { type: 'array', items: STR } as const;

/**
 * 구조화 출력 스키마. 서버가 `output_config.format`에 그대로 넘긴다.
 *
 * ⚠ `additionalProperties: false`와 `required`가 **둘 다** 있어야 강제된다.
 *
 * 🔴 **속성 순서가 생성 순서다**(구조화 출력은 스키마 순서대로 쓴다). 그래서 v15 는
 *   **위기 신호를 맨 앞에** 둔다 — 신호를 먼저 정해야 그 뒤의 한 줄·본문·칸들이
 *   그 신호의 규칙(§3.1)을 따를 수 있다. 줄기(`threads`)는 그다음, 글은 그 뒤다.
 */
export const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    concern: {
      type: 'boolean',
      description:
        '자해·자살에 대한 생각·계획·준비, 또는 즉각적인 도움이 필요해 보이는 신호가 글에 있으면 true. ' +
        '단순히 슬프거나 지치거나 힘든 것은 false — 그건 일기에 흔히 담기는 감정이다. ' +
        '남을 해치려는 생각은 여기가 아니라 harmToOthers 다.',
    },
    harmToOthers: {
      type: 'boolean',
      description:
        '특정 대상 + 실행 의도·계획 + 구체화 신호(준비·수단·시간·장소·접근·추적)가 함께 적혀 있을 때만 true. ' +
        '화풀이·과장("죽여버리고 싶다")만으로는 false.',
    },
    eating: {
      type: 'boolean',
      description: '식사·체중·체형에 대한 부담이 여러 날 적혀 있으면 true. 권유·해낸 것의 제한에 쓴다.',
    },
    threads: {
      type: 'array',
      description: '작업 칸 — 두 날 이상 이어진 줄기 전부. 화면에 나가지 않는다.',
      items: obj({ what: STR, dates: STR_ARR, quotes: STR_ARR }),
    },
    crossings: {
      type: 'array',
      description: '작업 칸 — 줄기끼리 붙어 나타난 자리, 하겠다고 적은 것과 기록이 다른 자리.',
      items: obj({ what: STR, dates: STR_ARR, quotes: STR_ARR }),
    },
    discoveries: {
      type: 'array',
      description: '발견 2~3개. 여러 날을 겹쳐야만 참이 되는 문장.',
      items: obj({
        shape: { type: 'string', enum: DISCOVERY_SHAPES },
        title: STR,
        evidence: { type: 'array', items: obj({ date: STR, quote: STR, role: STR }) },
        selfCheck: { type: 'string', enum: ['single', 'combined'] },
      }),
    },
    headline: {
      type: 'string',
      description:
        '이 기간에서 가장 눈에 띈 것 한 문장. **결론**이다 — summary 는 그 근거이므로 ' +
        '둘이 같은 말을 하면 안 된다. 요청된 언어로 작성한다.',
    },
    headlineFrom: {
      type: 'array',
      description:
        'headline 이 기댄 자료의 키 1~3개. 자료에 실제로 있던 키만 쓴다. ' +
        '주간이면 날짜(2026-05-07), 월간이면 주 키(2026-W19), 연간이면 달 키(2026-05).',
      items: { type: 'string' },
    },
    summary: {
      type: 'string',
      description: '이 기간을 돌아보는 요약. headline 의 **근거**다 — 같은 말을 되풀이하지 않는다.',
    },
    summaryQuotes: {
      type: 'array',
      description:
        '본문에 따옴표로 옮긴 원문 인용 전부. date 는 그 문장이 적힌 날, about 은 그날 무엇에 대한 말이었는지.',
      items: obj({ quote: STR, date: STR, about: STR }),
    },
    metrics: {
      type: 'array',
      description: '네 지표를 모두, 이 순서로.',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', enum: METRIC_CODES },
          value: { type: 'integer', description: '0~100. 높을수록 그 지표가 좋다' },
          days: {
            type: ['integer', 'null'],
            description:
              '그 지표가 글에 나타난 날 수. stress·happiness는 날로 셀 수 없으므로 null.',
          },
          basis: { type: 'string', description: '근거 한 줄. 글에 실제로 있는 것만' },
          verdict: {
            type: 'string',
            description: '화면에 숫자 대신 나가는 한 문장. 그 지표에 해당하는 기록을 적는다. 인과·판정 금지',
          },
        },
        required: ['code', 'value', 'days', 'basis', 'verdict'],
        additionalProperties: false,
      },
    },
    topics: {
      type: 'array',
      description: '위 네 지표 말고 그 기간에 실제로 나타난 주제. 안 나타난 것은 넣지 않는다.',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', enum: TOPIC_CODES },
          days: { type: 'integer', description: '나타난 날 수. 조각 수를 넘지 않는다' },
          note: { type: 'string', description: '무엇으로 나타났는지 짧게. 판단하지 않는다' },
        },
        required: ['code', 'days', 'note'],
        additionalProperties: false,
      },
    },
    counts: {
      type: 'array',
      description: '셀 수 있는 사실 2~4개. label 에 무엇을 셌는지 기준. 다짐은 세지 않는다.',
      items: obj({ label: STR, value: { type: 'integer' }, unit: STR, dates: STR_ARR }),
    },
    achievements: {
      type: 'array',
      description: '실제로 해낸 것 2~4개. 한 문장 + 날짜.',
      items: obj({ text: STR, dates: STR_ARR }),
    },
    suggestions: {
      type: 'array',
      description: '권유 2개. 두 날 이상 반복된 패턴에서만. pattern·dates 필수.',
      items: obj({ pattern: STR, text: STR, dates: STR_ARR }),
    },
    dayNotes: {
      type: 'array',
      description: '일기가 있는 날마다 그날 적은 것의 사실 한 줄(20자 안팎).',
      items: obj({ date: STR, note: STR }),
    },
  },
  required: [
    'concern',
    'harmToOthers',
    'eating',
    'threads',
    'crossings',
    'discoveries',
    'headline',
    'headlineFrom',
    'summary',
    'summaryQuotes',
    'metrics',
    'topics',
    'counts',
    'achievements',
    'suggestions',
    'dayNotes',
  ],
  additionalProperties: false,
} as const;

/**
 * 🔴 **상위(월간·연간)는 모델에게 지표를 요구하지 않는다** (§8.4.1).
 *
 * 계층 요약은 하위 **요약문만** 받고, 그 요약문에는 숫자가 없다(프롬프트가 옮겨 적지 말라고 시킨다).
 * 그래서 상위에서 모델이 매기는 지표는 **근거가 없다** — 실측으로 어긋나는 것을 확인했다
 * (주간 `exercise` 날 수 합이 2일인데 월간이 1일이었다).
 *
 * → 상위 지표는 **앱이 하위에서 합산한다**(`rollupMetrics`). 모델은 글만 쓴다.
 * ⚠ 덤으로 출력 토큰이 준다 — 상위 호출이 그만큼 싸진다.
 */
/*
 * ⚠ v15 에서 **빼는 목록이 아니라 남기는 목록**으로 바꿨다. 주간 스키마에 칸이 열 개 넘게 늘어서
 *   빼는 쪽으로 쓰면 새 칸을 하나 더할 때마다 상위에 **조용히 딸려간다**(발견·권유는 원문이 없는
 *   상위에서 만들 근거가 없다).
 * 🔴 **위기 신호 둘은 상위에도 있다** — 하위 요약문에도 신호가 남을 수 있고, 배너는 층을 안 가린다.
 */
const P = REPORT_SCHEMA.properties;
const SUMMARY_ONLY_PROPS = {
  concern: P.concern,
  harmToOthers: P.harmToOthers,
  headline: P.headline,
  headlineFrom: P.headlineFrom,
  summary: P.summary,
};

export const SUMMARY_ONLY_SCHEMA = {
  type: 'object',
  properties: SUMMARY_ONLY_PROPS,
  required: ['concern', 'harmToOthers', 'headline', 'headlineFrom', 'summary'],
  additionalProperties: false,
} as const;

/**
 * 종류에 맞는 구조화 출력 스키마. **주간만 지표를 낸다**.
 *
 * ⚠ 반환형이 `object`면 서버의 `generateReport`가 받는 `Record<string, unknown>`에 안 맞는다.
 *   스키마는 어차피 JSON이라 그 모양으로 좁혀 준다 — 호출부가 캐스팅하게 두지 않는다.
 */
export function schemaFor(kind: ReportKind): Record<string, unknown> {
  return kind === 'weekly' ? REPORT_SCHEMA : SUMMARY_ONLY_SCHEMA;
}

/**
 * 프롬프트 버전. 바꾸면 **결과가 바뀐다.**
 *
 * ⚠ 리포트와 함께 저장한다. 안 그러면 나중에 "왜 그때 리포트는 달랐지"에 답할 수 없다 —
 *   모델 버전과 프롬프트 버전 둘 다 움직이면 원인을 분리하지 못한다.
 */
export const PROMPT_VERSION = 15;

/**
 * 모델이 준 `headlineFrom` 중 **자료에 실제로 있던 키만** 남긴다 (§8.2.1).
 *
 * 🔴 **없는 날짜를 가리키면 이 기능이 반대로 작동한다** — 눌렀는데 아무것도 없으면
 *   그 순간 *"AI가 아무 말이나 한다"* 가 되고, 만들려던 신뢰가 무너진다.
 *   `pickMetrics` 가 모르는 코드를 버리는 것과 같은 규약이다.
 *
 * ⚠ 하나도 안 남으면 **빈 배열**이다. 실패로 만들지 않는다 — 칩 하나 때문에 그 기간을
 *   잃게 하지 않는다(캡이 평생 1번).
 * ⚠ 순서는 모델이 준 순서를 지키고, 중복은 지운다. 3개를 넘으면 자른다.
 */
export function pickHeadlineFrom(value: unknown, allowed: readonly string[]): string[] {
  if (!Array.isArray(value)) return [];
  const ok = new Set(allowed);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of value) {
    if (typeof v !== 'string') continue;
    const key = v.trim();
    if (!ok.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
    if (out.length === 3) break;
  }
  return out;
}

/* ── v15 검증 — 서버가 모델 출력을 **믿지 않고** 거른다 (§8.5 · §3.1) ─────────────── */

/**
 * 인용 대조용 정규화 — 공백·문장부호·따옴표를 지우고 소문자로.
 *
 * ⚠ 모델은 원문을 옮기며 마침표·띄어쓰기를 조금씩 바꾼다. 그 차이로 멀쩡한 근거를 버리면
 *   발견 카드가 조용히 사라진다. 대조의 목적은 **문장이 그날 거기 있었나**이지 바이트 일치가 아니다.
 */
export function normalizeQuote(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.,!?…~·:;'"“”‘’「」『』()\[\]\-—–]/g, '');
}

/**
 * 🔴 **체중·식단 행동을 권하거나 성취로 치는 문장**(§3.1 `eating`).
 *
 * 프롬프트가 1차로 막고 여기서 한 번 더 버린다 — 리포트는 나이를 모르고
 * 연령 게이트가 13·14·16세다. 모델 규칙 한 줄에만 기대기엔 틀렸을 때의 값이 크다.
 * ⚠ 넓게 잡는다. 식사 관찰 권유 하나를 잃는 것이 감량 권유 하나가 나가는 것보다 싸다.
 */
const DIET = /(칼로리|kcal|감량|체중|몸무게|다이어트|굶|단식|식단|살\s*(을|이)?\s*빼|calori|diet|weight|fasting|体重|ダイエット|減量|カロリー|节食|減肥|减肥|热量|熱量)/i;

/** 그 목록 안의 날짜만, 중복 없이 */
function datesIn(value: unknown, allowed: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const v of value) {
    if (typeof v !== 'string') continue;
    const d = v.trim();
    if (allowed.has(d) && !out.includes(d)) out.push(d);
  }
  return out;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function rows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((v): v is Record<string, unknown> => typeof v === 'object' && v !== null)
    : [];
}

export interface SanitizeInput {
  kind: ReportKind;
  /** **프롬프트에 실제로 넣은 조각**(본문 있는 것). 인용 대조의 유일한 근거다 */
  entries: readonly EntryInput[];
  /** 모델이 준 JSON 그대로 */
  raw: Record<string, unknown>;
  /** 이미 걸러진 지표·주제(`pickMetrics`·`pickTopics`) */
  metrics: MetricValue[];
  topics: TopicValue[];
  concern: boolean;
}

/**
 * 모델 출력의 v15 칸을 **검증해서 남길 것만 남긴다.** 서버가 저장·응답 전에 부른다.
 *
 * 🔴 **맥락 오류는 문자열 검사로 못 잡는다**(§8.5) — 인용은 원문 그대로인데 붙인 자리가 틀렸다.
 *   그래서 근거마다 날짜를 받아 **그날 일기에 그 문장이 있는지** 대조하고, 없으면 버린다.
 *
 * 🔴 **위기 리포트는 여기서 비운다**(§3.1 ④). 프롬프트가 1차로 비우게 하지만,
 *   저장되는 것이 *"안전화한 최종본"* 이라는 약속은 **코드가 지킨다** — 두 번째 모델 호출 없이.
 *   비우는 것: 발견·해낸 것·권유·셀 수 있는 사실·요일 한 줄 · 지표 문장과 근거 · 주제 설명.
 *   ⚠ 요일 한 줄까지 비우는 이유: 규칙표는 *"안전한 기록만"* 을 허용했지만 **안전한지 코드가 판정할 수 없다.**
 *
 * ⚠ 하나도 안 남아도 **실패로 만들지 않는다** — 칸 하나 때문에 그 기간을 잃게 하지 않는다(캡이 평생 1번).
 */
export function sanitizeInsights(input: SanitizeInput): {
  insights: ReportInsights;
  metrics: MetricValue[];
  topics: TopicValue[];
} {
  const harmToOthers = input.raw.harmToOthers === true;
  const crisis = input.concern || harmToOthers;

  if (crisis) {
    return {
      insights: emptyInsights(harmToOthers),
      metrics: input.metrics.map((m) => ({ ...m, basis: '', verdict: '' })),
      topics: input.topics.map((t) => ({ ...t, note: '' })),
    };
  }
  /* 상위는 원문이 없어 대조할 근거가 없다 — 신호만 남긴다 */
  if (input.kind !== 'weekly') {
    return { insights: emptyInsights(false), metrics: input.metrics, topics: input.topics };
  }

  const byDate = new Map<string, string>();
  for (const e of input.entries) {
    const prev = byDate.get(e.date) ?? '';
    byDate.set(e.date, prev + normalizeQuote(`${e.title ?? ''}\n${e.text}`));
  }
  const allowed = new Set(byDate.keys());

  const discoveries: Discovery[] = [];
  for (const row of rows(input.raw.discoveries)) {
    const shape = row.shape;
    const title = text(row.title);
    /* 🔴 `single` 은 버린다 — 한 날 일기에 이미 적힌 문장은 발견이 아니다(§8.5) */
    if (row.selfCheck !== 'combined') continue;
    if (typeof shape !== 'string' || !DISCOVERY_SHAPES.includes(shape as DiscoveryShape)) continue;
    if (title.length === 0) continue;
    const evidence: Evidence[] = [];
    for (const ev of rows(row.evidence)) {
      const date = text(ev.date);
      const quote = text(ev.quote);
      const q = normalizeQuote(quote);
      if (!allowed.has(date) || q.length === 0) continue;
      /* 🔴 그날 일기에 그 문장이 없으면 버린다 — 다른 날 이야기에 붙인 인용이다 */
      if (!(byDate.get(date) ?? '').includes(q)) continue;
      evidence.push({ date, quote, role: text(ev.role) });
      if (evidence.length === 4) break;
    }
    /* 근거가 둘 미만이면 "여러 날을 겹쳐야 보이는 것"이 아니다 */
    if (new Set(evidence.map((e) => e.date)).size < 2) continue;
    discoveries.push({ shape: shape as DiscoveryShape, title, evidence });
    if (discoveries.length === 3) break;
  }

  const achievements: Achievement[] = [];
  for (const row of rows(input.raw.achievements)) {
    const t = text(row.text);
    const dates = datesIn(row.dates, allowed);
    if (t.length === 0 || dates.length === 0 || DIET.test(t)) continue;
    achievements.push({ text: t, dates });
    if (achievements.length === 4) break;
  }

  const suggestions: Suggestion[] = [];
  for (const row of rows(input.raw.suggestions)) {
    const t = text(row.text);
    const pattern = text(row.pattern);
    const dates = datesIn(row.dates, allowed);
    /* 🔴 두 날 이상 반복된 것에서만 — 한 날짜짜리 권유는 뜬금없는 조언이다 */
    if (t.length === 0 || pattern.length === 0 || dates.length < 2) continue;
    if (DIET.test(t) || DIET.test(pattern)) continue;
    suggestions.push({ pattern, text: t, dates });
    if (suggestions.length === 2) break;
  }

  const counts: CountFact[] = [];
  for (const row of rows(input.raw.counts)) {
    const label = text(row.label);
    const value = row.value;
    if (label.length === 0 || typeof value !== 'number' || !Number.isFinite(value) || value < 0) continue;
    counts.push({
      label,
      value: Math.min(999, Math.round(value)),
      unit: text(row.unit),
      dates: datesIn(row.dates, allowed),
    });
    if (counts.length === 4) break;
  }

  const dayNotes: DayNote[] = [];
  const noted = new Set<string>();
  for (const row of rows(input.raw.dayNotes)) {
    const date = text(row.date);
    const note = text(row.note);
    if (!allowed.has(date) || noted.has(date) || note.length === 0) continue;
    noted.add(date);
    dayNotes.push({ date, note });
  }

  /* ⚠ 주제 날 수는 조각이 있는 날 수를 넘을 수 없다 — 넘으면 화면이 거짓 숫자를 그린다 */
  const topics = input.topics.map((t) => ({ ...t, days: Math.min(t.days, allowed.size) }));

  return {
    insights: { harmToOthers: false, discoveries, achievements, suggestions, counts, dayNotes },
    metrics: input.metrics,
    topics,
  };
}

/**
 * 저장된(또는 서버가 준) `insights` 를 **모양만 보고** 읽는다 — 앱의 저장소·클라이언트가 쓴다.
 *
 * ⚠ 인용 대조는 여기서 하지 않는다. 그건 원문을 가진 서버가 **만들 때 한 번** 했다.
 * ⚠ 깨져 있으면 `null` — 화면은 그 블록들을 안 그린다(`metrics` 와 같은 규약).
 */
export function readInsights(value: unknown): ReportInsights | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const box = value as Record<string, unknown>;
  const strs = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  return {
    harmToOthers: box.harmToOthers === true,
    discoveries: rows(box.discoveries)
      .filter((r) => DISCOVERY_SHAPES.includes(r.shape as DiscoveryShape) && text(r.title).length > 0)
      .map((r) => ({
        shape: r.shape as DiscoveryShape,
        title: text(r.title),
        evidence: rows(r.evidence).map((e) => ({ date: text(e.date), quote: text(e.quote), role: text(e.role) })),
      })),
    achievements: rows(box.achievements)
      .filter((r) => text(r.text).length > 0)
      .map((r) => ({ text: text(r.text), dates: strs(r.dates) })),
    suggestions: rows(box.suggestions)
      .filter((r) => text(r.text).length > 0)
      .map((r) => ({ pattern: text(r.pattern), text: text(r.text), dates: strs(r.dates) })),
    counts: rows(box.counts)
      .filter((r) => text(r.label).length > 0 && typeof r.value === 'number')
      .map((r) => ({ label: text(r.label), value: r.value as number, unit: text(r.unit), dates: strs(r.dates) })),
    dayNotes: rows(box.dayNotes)
      .filter((r) => text(r.note).length > 0)
      .map((r) => ({ date: text(r.date), note: text(r.note) })),
  };
}
