/**
 * 문의하기 로그인 게이트 — ⏭ **임시 자리**.
 *
 * 문의는 로그인 필수다(CLAUDE.md §4). 로그인 자체가 아직 붙지 않았으므로 이 파일이
 * 그 자리를 대신 지킨다. **구글 로그인이 들어오면 이 파일 하나만 갈아끼우면 된다** —
 * 화면(`app/support.tsx`)은 `signedIn`만 보고 분기하므로 손댈 곳이 없다.
 *
 * 왜 굳이 로그인을 요구하나: **답변을 드리기 위해서**다. 익명 접수는 서버가 누구에게
 * 답할지 알 수 없어 단방향으로 끝난다.
 *
 * ⚠ 지금 common_server의 `POST /api/v1/tickets`는 **익명 단방향**이고 `subjectId` 컬럼이 없다.
 * 답변 경로는 common_server **Phase 7**(`subjects` + 토큰 발급 + `tickets.subjectId`)이
 * 들어와야 열린다. 즉 앱에 로그인이 붙어도 Phase 7 전까지는 답변을 저장할 곳이 없다 —
 * 로그인 연결 시점에 이 사실을 화면 문구에 반영할지 함께 정한다.
 */
export interface SupportAuth {
  signedIn: boolean;
  /** 로그인 화면으로 보낸다. 붙기 전까지는 아무 일도 하지 않는다. */
  signIn: () => void;
}

export function useSupportAuth(): SupportAuth {
  return {
    // ⏭ 로그인이 붙으면 실제 세션 상태로 바꾼다.
    signedIn: false,
    signIn: () => {
      // ⏭ router.push('/login')
    },
  };
}
