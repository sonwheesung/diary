/**
 * "앱이 부른 외출" 표시 (CLAUDE.md §7.1).
 *
 * 잠금은 **백그라운드로 나가면 즉시** 걸린다. 그런데 사진 선택기·구글 로그인처럼
 * **우리가 띄운** 화면도 앱을 백그라운드로 보낸다 — 그대로 두면 사진을 넣을 때마다,
 * 로그인할 때마다 잠금 화면을 만난다. 사용자는 앱을 떠난 적이 없는데도.
 *
 * 그래서 우리가 띄우는 동안만 표시를 세워두고, `LockGate`가 그 표시를 보면
 * 돌아온 **한 번**을 무시한다.
 *
 * ⚠ 이건 잠금을 끄는 스위치가 아니다. 열어둔 채 새면 그 뒤로 잠금이 영영 안 걸린다 —
 *   그래서 직접 세우고 내리는 API는 두지 않고 `withExcursion()`만 내보낸다.
 *   `finally`로 반드시 닫히고, 게이트도 한 번 쓰면 지운다.
 */

/** 중첩될 수 있다(권한 다이얼로그 → 선택기). 카운터로 세지 않으면 안쪽이 끝날 때 바깥이 풀린다. */
let depth = 0;

/** 게이트가 아직 소비하지 않은 외출이 있는지. 카운터가 0이어도 돌아오는 이벤트가 늦게 올 수 있다. */
let pending = false;

/**
 * 앱 밖으로 나갔다 오는 작업을 감싼다. 사진 선택기·소셜 로그인처럼
 * **우리가 띄운** 화면에만 쓴다.
 */
export async function withExcursion<T>(run: () => Promise<T>): Promise<T> {
  depth += 1;
  pending = true;
  try {
    return await run();
  } finally {
    depth -= 1;
    if (depth < 0) {
      depth = 0;
    }
  }
}

/**
 * 지금 돌아온 것이 우리가 부른 외출에서 돌아온 것인지. **게이트 전용.**
 *
 * 한 번 물으면 표시를 지운다 — 다음 이탈부터는 다시 잠근다.
 * 아직 작업이 진행 중이면(depth > 0) 표시를 남겨둔다. 선택기가 여러 화면을 거치는 동안
 * `active`가 여러 번 올 수 있기 때문이다.
 */
export function consumeExcursion(): boolean {
  if (depth > 0) {
    return true;
  }
  const was = pending;
  pending = false;
  return was;
}
