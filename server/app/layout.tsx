/**
 * API 전용 서버라 화면이 없다. Next가 루트 레이아웃을 요구해서 최소한만 둔다.
 * ⚠ 관리 화면을 붙일 계획이면 common_server의 admin 구조를 먼저 볼 것.
 */
export const metadata = { title: '조각 서버' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
