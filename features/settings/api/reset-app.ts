import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Directory, Paths } from 'expo-file-system';

import { getDatabase } from '@/db/client';
import { disableLock } from '@/features/lock/api/lock-store';
import { commonServer } from '@/lib/common-server/client';

/**
 * 앱 초기화 — 조각·사진·태그·설정·잠금을 **전부** 지운다.
 *
 * 잠금을 잊고 힌트도 못 맞혔을 때 남는 유일한 길이다. 기존 일기를 여는 방법은 없다 —
 * 그게 잠금의 정의다. 앱을 지웠다 다시 깔면 어차피 같은 일이 벌어지므로,
 * 앱 안에 길을 두는 게 정직하다(막다른 화면에 사용자를 세워두지 않는다).
 *
 * ⚠ 되돌릴 수 없다. 부르는 쪽이 **두 번** 확인받는다.
 */
export async function wipeAllData(): Promise<void> {
  const db = await getDatabase();

  // 소프트 삭제가 아니라 진짜 삭제다 — 되살릴 대상 자체를 없애는 동작이라 묘비가 의미 없다.
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM diary_tags;
      DELETE FROM diary_images;
      DELETE FROM tags;
      DELETE FROM diaries;
      DELETE FROM app_settings;
    `);
  });

  // 사진 파일은 DB 밖에 있다. 디렉터리째 지운다 — 남겨두면 아무도 참조하지 않는 용량이 된다.
  try {
    const directory = new Directory(Paths.document, 'diary-images');
    if (directory.exists) {
      directory.delete();
    }
  } catch {
    // 파일 정리에 실패해도 초기화 자체는 끝나야 한다. DB에서 이미 참조가 사라졌다.
  }

  /*
   * 로그인 흔적도 지운다. 안 지우면 "전부 지웠다"고 해놓고 **이전 사용자의 세션 토큰이 남아**,
   * 폰이 남의 손에 넘어간 뒤 초기화한 사람이 문의 화면에서 곧바로 그 사람 계정이 된다.
   * 구글 SDK 캐시까지 함께 끊어야 다음 로그인이 계정 선택부터 시작한다.
   * ⚠ 실패해도 초기화 자체는 끝내야 한다 — 여기서 던지면 일기는 지워졌는데 잠금이 남는다.
   */
  await commonServer.logout().catch(() => undefined);
  await GoogleSignin.signOut().catch(() => undefined);

  await disableLock();
}
