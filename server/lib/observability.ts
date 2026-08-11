/**
 * 서버 오류 리포트 단일 진입점.
 *
 * ⚠ **요청 본문을 절대 로그에 넣지 않는다.** 백업 요청의 본문은 암호문이지만,
 *   메타데이터(경로·크기·시각)만으로도 관측 도구에 개인정보가 쌓인다.
 *   지금은 콘솔뿐이다 — Sentry를 붙이는 날 이 함수만 바꾸면 되게 한 곳으로 모은다.
 */
export function reportError(error: unknown, where: string): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[jogak-server] ${where}: ${message}`);
}
