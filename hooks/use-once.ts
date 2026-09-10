import { useCallback, useRef } from 'react';

/**
 * **끝날 때까지 다시 안 받는다** — 버튼 연타 방어 (`CLAUDE.md` §10).
 *
 * 🔴 **`useState` 로는 못 막는다.** 상태 갱신은 다음 렌더에 반영되는데, 손가락은 그 사이에
 *   한 번 더 닿는다. 그래서 잠금은 **ref** 여야 한다 — 핸들러가 도는 그 틱에 이미 잠겨 있어야
 *   두 번째 탭이 `return` 으로 떨어진다.
 *
 * 🔴 **`disabled={busy}` 도 반쪽이다.** 그건 상태가 반영된 *뒤* 부터 막는데, 실제 사고는
 *   그 전에 난다 — 핸들러 첫 줄이 `await`(SQLite 조회·권한 확인)이면 그 사이 버튼은
 *   **여전히 살아 있다.** 2026-09-10 실측: `report.tsx` 의 `onCreate` 가 `hasAiConsent()` 를
 *   기다린 뒤에야 `setCreating(true)` 를 불러, 그 창에 두 번 누르면 **리포트 생성이 두 번**
 *   나간다. 서버는 캡을 *읽고 나서* 모델을 부르므로 둘 다 통과하고 **돈이 두 번** 나간다.
 *
 * ⚠ 이 훅은 **중복 실행**을 막지 결과를 합쳐주지 않는다. 서버 쪽 멱등(같은 키로 온 재시도에
 *   같은 결과를 준다)은 별개 문제다 — 여기서 막는 것은 *앱이 스스로 두 번 보내는 것* 이다.
 *
 * ```tsx
 * const onCreate = useOnce(async () => { … });
 * <Button onPress={() => void onCreate()} />
 * ```
 */
export function useOnce<A extends unknown[]>(
  fn: (...args: A) => Promise<void> | void,
): (...args: A) => Promise<void> {
  const running = useRef(false);

  return useCallback(
    async (...args: A) => {
      if (running.current) {
        return;
      }
      running.current = true;
      try {
        await fn(...args);
      } finally {
        /*
         * 🔴 **`finally` 다.** 던져도 풀어야 한다 — 안 풀면 그 화면에서 그 버튼이
         *   **영영 안 눌린다.** 잠금을 거는 것보다 못 푸는 것이 더 나쁜 고장이다.
         */
        running.current = false;
      }
    },
    [fn],
  );
}
