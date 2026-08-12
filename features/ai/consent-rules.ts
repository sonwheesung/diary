/**
 * AI 동의 규칙 — **순수 계층.** 프로젝트 내부 임포트 0.
 *
 * Node에서 그대로 임포트해 검사할 수 있어야 한다(`scripts/check-ai.mjs`).
 * 저장소를 건드리는 부분은 `consent.ts`가 갖는다 — `types.ts`·`prompt.ts`와 같은 규약이다.
 *
 * 여기 있는 판정이 **법적 게이트**라 눈으로만 보고 넘길 수 없다.
 */

/**
 * 동의 버전.
 *
 * ⚠ 고지 내용이 **실질적으로** 바뀌면 올린다(사업자 변경·이전 국가 변경·보유 기간 변경).
 *   올리면 이미 동의한 사람에게 다시 묻는다 — 옛 문안에 대한 동의로 새 처리를 할 수 없다.
 *   ⚠ 오타 수정으로는 올리지 않는다. 무의미한 재동의는 사용자가 읽지 않고 누르게 만든다.
 */
export const AI_CONSENT_VERSION = 1;

export interface AiConsent {
  /** §23 민감정보 처리 동의 시각(epoch ms). `null`이면 미동의 */
  sensitiveAt: number | null;
  /** §28-8 국외 이전 동의 시각(epoch ms). `null`이면 미동의 */
  transferAt: number | null;
}

/**
 * 저장 형식 `"<version>|<epochMs>"`을 읽는다.
 *
 * 버전을 함께 저장하는 이유: **언제 무엇에 동의했는지 증명할 수 있어야 한다.**
 * 시각만 저장하면 나중에 고지를 고쳤을 때 어느 문안에 동의한 것인지 알 수 없다.
 *
 * ⚠ **옛 버전 동의는 무효로 본다**(`null`). 안전한 쪽으로 틀리는 선택이다 —
 *   잘못하면 한 번 더 묻게 될 뿐이지만, 반대로 틀리면 동의 없이 처리하게 된다.
 */
export function parseConsent(raw: string | null): number | null {
  if (raw === null || raw.length === 0) return null;
  const parts = raw.split('|');
  if (parts.length !== 2) return null;
  if (Number(parts[0]) !== AI_CONSENT_VERSION) return null;
  const ms = Number(parts[1]);
  return Number.isFinite(ms) && ms > 0 ? ms : null;
}

export function serializeConsent(at: number): string {
  return `${AI_CONSENT_VERSION}|${at}`;
}

/**
 * 둘 **다** 있어야 리포트를 만들 수 있다.
 *
 * 🔴 근거 법조문이 다른 별개의 동의라서 하나로 갈음할 수 없다(§23 / §28-8).
 */
export function bothGiven(consent: AiConsent): boolean {
  return consent.sensitiveAt !== null && consent.transferAt !== null;
}
