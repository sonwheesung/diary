/**
 * 무료 체험 조건 — **전자상거래법 §13⑥ 고지의 근거가 되는 계산.**
 *
 * 순수 함수만 둔다(프로젝트 내부 임포트 0). 결제 SDK를 임포트하면 Node에서 검사할 수 없고,
 * 이 계산이 틀리면 **잘못된 결제일을 법적 고지로 보여주게 된다** — 왕복 테스트로는 안 잡힌다.
 */

/** RC의 도입가에서 우리가 쓰는 것만. SDK 타입을 그대로 받으면 순수 계층이 아니게 된다 */
export interface IntroOffer {
  price: number;
  periodUnit: string;
  periodNumberOfUnits: number;
  cycles: number;
}

export interface TrialTerms {
  /** 체험 일수. 주·월 단위도 일로 환산한다 */
  days: number;
  /** 체험이 끝난 뒤 청구되는 금액. **표시 문자열 그대로** 쓴다(통화·자릿수가 나라마다 다르다) */
  priceAfter: string;
  /** 체험 종료 = 첫 청구일 */
  chargesAt: number;
}

const DAYS_PER_UNIT: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

/**
 * 무료 체험인가, 그렇다면 언제 얼마가 청구되는가.
 *
 * ⚠ **`price === 0`인 도입가만 체험이다.** 할인가(첫 달 반값 등)도 같은 자리로 오는데,
 *   그건 무료→유료 전환이 아니라 가격 변동이라 §13⑥의 대상이 아니다.
 *
 * ⚠ 전환 시각의 진실은 **스토어**다. 여기 계산은 화면에 보여줄 근사치이므로
 *   문구도 일 단위로만 약속한다(분 단위를 약속하지 않는다).
 */
export function trialTerms(
  intro: IntroOffer | null,
  priceAfter: string,
  now: number,
): TrialTerms | null {
  if (intro === null || intro.price !== 0) {
    return null;
  }
  const perUnit = DAYS_PER_UNIT[intro.periodUnit.toUpperCase()];
  if (perUnit === undefined) {
    // 모르는 단위는 **기간을 지어내지 않는다.** 잘못된 날짜를 고지하느니 동의를 안 받는 게 낫다
    // — 호출부가 null을 "체험 없음"으로 다루므로 곧장 결제로 가고, 그건 §13⑥ 대상이 아니다.
    return null;
  }
  const days = perUnit * intro.periodNumberOfUnits * Math.max(1, intro.cycles);
  return { days, priceAfter, chargesAt: now + days * 24 * 60 * 60 * 1000 };
}
