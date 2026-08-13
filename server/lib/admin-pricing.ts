/**
 * 모델 단가 — **운영 콘솔의 원가 추정에만 쓴다** (`docs/ADMIN_SYSTEM.md` §6).
 *
 * ⚠ `ai-policy.ts`에 두지 않는다. 정책(캡)은 우리가 정하는 것이고 가격은 **벤더가 바꾸는 것**이라
 *   성질이 다르다 — 가격이 개정됐다고 캡 파일을 건드리게 만들면 안 된다.
 *
 * 🔴 **여기서 나온 숫자는 청구서가 아니다.** 캐시·배치 할인, 단가 개정, 실패 호출(행이 없다)이
 *   반영되지 않는다. 벤더 대시보드가 정본이고 이 값은 **추세를 보는 용도**다.
 *   화면에도 "추정"이라고 적는다.
 */

/** 100만 토큰당 USD. 모르는 모델은 0으로 떨어뜨리고 화면이 "단가 미등록"을 표시한다. */
interface Price {
  inputPerM: number;
  outputPerM: number;
}

const PRICES: Record<string, Price> = {
  // 2026-08-12 실측(`docs/AI_REPORT_SYSTEM.md` §4). 2026-07-30 인하가 반영된 값이다.
  'gpt-5.6-luna': { inputPerM: 0.2, outputPerM: 1.2 },
};

/** 원화 환산. ⚠ 고정 환율이다 — 정확한 정산이 목적이 아니라 자릿수 감을 주는 것이 목적이다. */
export const USD_TO_KRW = 1380;

export function priceOf(model: string | null): Price | null {
  if (model === null) {
    return null;
  }
  return PRICES[model] ?? null;
}

/**
 * 추정 원가(USD). 단가를 모르는 모델은 `null`을 준다 —
 * **0을 주지 않는다.** 0은 "공짜"로 읽히고, 단가 미등록과 구별되지 않는다.
 */
export function estimateUsd(model: string | null, inputTokens: number, outputTokens: number): number | null {
  const price = priceOf(model);
  if (price === null) {
    return null;
  }
  return (inputTokens / 1_000_000) * price.inputPerM + (outputTokens / 1_000_000) * price.outputPerM;
}
