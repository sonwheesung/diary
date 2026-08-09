import { useCallback, useEffect, useState } from 'react';

import { commonServer } from '@/lib/common-server/client';
import type { Subject } from '@/lib/common-server/types';

/**
 * 문의하기 로그인 게이트.
 *
 * 문의는 로그인 필수다(CLAUDE.md §4). **답변을 드리려면 누가 보냈는지 알아야** 하기 때문이고,
 * 이제 서버가 그걸 받는다 — `tickets.subject_id`로 귀속되고 `fetchMyInquiries()`로 답변을 읽는다.
 *
 * 세션 판정은 여기가 전부 갖는다. 화면(`app/support.tsx`)은 `signedIn`만 보고 갈라진다.
 *
 * ⏭ **아직 남은 것은 `signIn()` 한 줄뿐이다.** 서버·SDK는 준비됐고, 구글 `idToken`을 받아올
 *   `@react-native-google-signin/google-signin`이 미설치다. 붙으면:
 *
 *     const { data } = await GoogleSignin.signIn();
 *     await commonServer.login('google', data.idToken);
 *
 *   ⚠ 안드로이드 네이티브 로그인이어도 `idToken`의 audience는 **웹 클라이언트 ID**다.
 *     구글 콘솔의 webClientId를 GoogleSignin에 넘기고, 서버 관리자 콘솔의 audience에도
 *     같은 웹 클라이언트 ID를 넣어야 한다. 빠뜨리면 전부 'unauthorized'로만 보여 진단이 어렵다.
 */
export interface SupportAuth {
  /** 이 기기에 유효한 세션이 있는지. 확인이 끝나기 전에는 false */
  signedIn: boolean;
  /** 세션 확인이 끝났는지 — 확인 중에 '로그인 필요'를 깜빡이지 않으려면 필요하다 */
  ready: boolean;
  subject: Subject | null;
  signIn: () => void;
}

export function useSupportAuth(): SupportAuth {
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      /*
       * 저장된 세션을 서버에 물어 되살린다.
       *
       * 'offline'이면 로그아웃시키지 않는다 — SDK가 그렇게 설계돼 있고(지하철에서 앱을 켰다고
       * 로그아웃되면 안 된다), 세션 폐기는 서버가 401로 명시적으로 거절했을 때만 일어난다.
       * 그래서 오프라인일 때는 "기기에 토큰이 있는지"로 판단한다.
       */
      const result = await commonServer.restoreSession();
      if (!alive) {
        return;
      }
      if (result.ok) {
        setSubject(result.subject);
        setSignedIn(true);
      } else {
        setSignedIn(result.reason === 'offline' ? await commonServer.isSignedIn() : false);
      }
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(() => {
    // ⏭ 구글 로그인 라이브러리가 붙으면 여기서 idToken을 받아 commonServer.login()을 부른다.
  }, []);

  return { signedIn, ready, subject, signIn };
}
