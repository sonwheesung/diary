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
  summary: string;
  /** 위기 신호가 보이는가. `true`면 상담 채널 배너를 얹는다(§3) */
  concern: boolean;
  /** 지표 넷. **순서와 개수가 고정**이다 */
  metrics: MetricValue[];
  /** 그 기간에 실제로 나타난 주제만. 없으면 빈 배열 */
  topics: TopicValue[];
}

/**
 * 구조화 출력 스키마. 서버가 `output_config.format`에 그대로 넘긴다.
 *
 * ⚠ `additionalProperties: false`와 `required`가 **둘 다** 있어야 강제된다.
 */
export const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: '이 기간을 돌아보는 요약. 요청된 언어로 작성한다.',
    },
    concern: {
      type: 'boolean',
      description:
        '자해·자살에 대한 생각이나 계획, 또는 즉각적인 도움이 필요해 보이는 신호가 글에 있으면 true. ' +
        '단순히 슬프거나 지치거나 힘든 것은 false — 그건 일기에 흔히 담기는 감정이다.',
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
        },
        required: ['code', 'value', 'days', 'basis'],
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
  },
  required: ['summary', 'concern', 'metrics', 'topics'],
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
const { metrics: _m, topics: _t, ...SUMMARY_ONLY_PROPS } = REPORT_SCHEMA.properties;

export const SUMMARY_ONLY_SCHEMA = {
  type: 'object',
  properties: SUMMARY_ONLY_PROPS,
  required: ['summary', 'concern'],
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
export const PROMPT_VERSION = 8;
