import { fail, ok } from '@/lib/respond';

export const dynamic = 'force-dynamic';

/**
 * 받은 바이트 수를 돌려준다. **개발 전용 진단**이다.
 *
 * RN의 fetch가 큰 `ArrayBuffer` 바디를 그대로 보내는지 확인하는 유일한 방법이다 —
 * 앱이 보낸 크기와 서버가 받은 크기가 다르면 **바디 변환이 일어난 것**이고
 * (RN이 base64로 바꾸면 1.33배가 된다), 그러면 서명 URL 업로드가 조용히 깨진다.
 *
 * ⚠ 프로덕션 빌드에서는 404다. 인증이 없는 라우트를 배포에 남기지 않는다.
 */
export async function PUT(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return fail('no-vault');
  }
  const body = await req.arrayBuffer();
  return ok({ bytes: body.byteLength });
}
