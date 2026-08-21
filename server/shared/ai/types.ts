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
  },
  required: ['summary', 'concern'],
  additionalProperties: false,
} as const;

/**
 * 프롬프트 버전. 바꾸면 **결과가 바뀐다.**
 *
 * ⚠ 리포트와 함께 저장한다. 안 그러면 나중에 "왜 그때 리포트는 달랐지"에 답할 수 없다 —
 *   모델 버전과 프롬프트 버전 둘 다 움직이면 원인을 분리하지 못한다.
 */
export const PROMPT_VERSION = 4;
