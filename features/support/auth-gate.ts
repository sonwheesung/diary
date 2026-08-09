import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useCallback, useEffect, useState } from 'react';

import { withExcursion } from '@/features/lock/excursion';
import { commonServer } from '@/lib/common-server/client';
import type { FailReason, Subject } from '@/lib/common-server/types';

/**
 * 문의하기 로그인 게이트.
 *
 * 문의는 로그인 필수다(CLAUDE.md §4). **답변을 드리려면 누가 보냈는지 알아야** 하기 때문이고,
 * 서버가 그걸 받는다 — `tickets.subject_id`로 귀속되고 `fetchMyInquiries()`로 답변을 읽는다.
 *
 * 세션 판정과 구글 SDK 호출은 여기가 전부 갖는다. 화면(`app/support.tsx`)은 상태만 보고 갈라진다.
 *
 * ⚠ **안드로이드 네이티브 로그인이어도 `idToken`의 audience는 웹 클라이언트 ID다.**
 *   그래서 `configure()`에 넘기는 값이 android가 아니라 web 클라이언트 ID다.
 *   서버(관리자 콘솔 → 소셜 로그인)의 audience에도 **같은 웹 ID**가 들어 있어야 한다.
 *   빠뜨리면 서버가 전부 'unauthorized'로만 답해서 원인을 앱에서 알아낼 수 없다.
 */

/** 웹 클라이언트 ID. 비밀이 아니다 — 번들에 어차피 박히는 공개 식별자다(`.env.example` 참고). */
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

/*
 * configure()는 동기이고 부작용이 없으므로 모듈 로드 시점에 한 번만 부른다.
 * 훅 안에서 부르면 화면을 열 때마다 다시 불리고, 여러 화면에서 쓰기 시작하면 호출 순서가 꼬인다.
 *
 * ID가 비어 있으면 부르지 않는다 — 빈 값으로 설정해두면 signIn()이 SDK 내부에서 죽어
 * 'not-configured'와 구분되지 않는 오류가 난다.
 */
if (WEB_CLIENT_ID) {
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
}

/** 로그인 시도 결과. `null`이면 성공, `'cancelled'`면 사용자가 창을 닫은 것(오류 아님) */
export type SignInOutcome = null | 'cancelled' | FailReason;

export interface SupportAuth {
  /** 이 기기에 유효한 세션이 있는지. 확인이 끝나기 전에는 false */
  signedIn: boolean;
  /** 세션 확인이 끝났는지 — 확인 중에 '로그인 필요'를 깜빡이지 않으려면 필요하다 */
  ready: boolean;
  /** 구글 창이 떠 있거나 서버에 토큰을 넘기는 중 */
  busy: boolean;
  subject: Subject | null;
  signIn: () => Promise<SignInOutcome>;
  signOut: () => Promise<void>;
  /** 탈퇴. **Google Play 정책상 앱 안에 이 경로가 있어야 한다** */
  deleteAccount: () => Promise<FailReason | null>;
}

export function useSupportAuth(): SupportAuth {
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
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

  const signIn = useCallback(async (): Promise<SignInOutcome> => {
    if (!WEB_CLIENT_ID) {
      return 'not-configured';
    }
    setBusy(true);
    try {
      /*
       * Play 서비스가 없거나 낡은 기기에서는 signIn()이 알아보기 어려운 네이티브 오류로 죽는다.
       * 먼저 물어보면 사용자가 업데이트할 수 있는 다이얼로그를 SDK가 대신 띄워준다.
       */
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      /*
       * 계정 선택 창은 앱을 백그라운드로 보낸다. 잠금은 나가면 즉시 걸리므로 감싸지 않으면
       * 로그인하고 돌아온 순간 잠금 화면을 만난다 — 사용자는 앱을 떠난 적이 없다(§7.1).
       */
      const response = await withExcursion(() => GoogleSignin.signIn());
      if (!isSuccessResponse(response)) {
        return 'cancelled'; // 사용자가 창을 닫음 — 오류 문구를 띄우지 않는다
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        /*
         * webClientId가 없거나 틀리면 로그인 자체는 성공하는데 idToken만 null로 온다.
         * 여기서 잡지 않으면 서버가 'unauthorized'로 답해서 설정 문제가 인증 문제로 보인다.
         */
        return 'not-configured';
      }

      const result = await commonServer.login('google', idToken);
      if (!result.ok) {
        /*
         * 우리 서버가 거절했으면 구글 세션도 정리한다. 남겨두면 다음 시도에서 계정 선택 창이
         * 뜨지 않고 조용히 같은 계정으로 재시도되어, 계정을 바꿔볼 길이 없어진다.
         */
        await GoogleSignin.signOut().catch(() => {});
        return result.reason;
      }
      setSubject(result.subject);
      setSignedIn(true);
      return null;
    } catch (error) {
      // 사용자가 뒤로가기로 닫으면 취소 코드가 온다 — 오류가 아니다
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return 'cancelled';
      }
      /*
       * 구글 SDK 오류는 화면에 그대로 못 쓴다(사용자가 할 수 있는 게 없다). 대신 코드를 남긴다.
       *
       * 실제로 겪음(2026-08-09): SHA-1이 등록된 값과 다른 APK에서 `DEVELOPER_ERROR`(code 10)가 났는데,
       * 로그가 없어서 "서버가 거절했나"를 먼저 뒤졌다. 이 한 줄이면 5초에 갈린다.
       * DEVELOPER_ERROR면 의심 순서는 ① APK 서명 SHA-1 ② 패키지명 ③ webClientId다.
       */
      if (__DEV__) {
        console.warn(
          '[auth] google sign-in failed:',
          isErrorWithCode(error) ? error.code : String(error),
        );
      }
      return 'error';
    } finally {
      setBusy(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setBusy(true);
    try {
      // 구글 쪽을 먼저 끊어도 우리 세션이 남으면 로그인된 것처럼 보인다 — 둘 다 지운다
      await GoogleSignin.signOut().catch(() => {});
      await commonServer.logout();
      setSubject(null);
      setSignedIn(false);
    } finally {
      setBusy(false);
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<FailReason | null> => {
    setBusy(true);
    try {
      const result = await commonServer.deleteAccount();
      if (!result.ok) {
        return result.reason;
      }
      /*
       * revokeAccess()는 우리 앱에 준 권한 자체를 회수한다. signOut()만 하면 다음 로그인에서
       * 동의 화면 없이 같은 계정으로 되돌아가, 방금 탈퇴한 사람에게 "지워지긴 한 건가" 싶어진다.
       */
      await GoogleSignin.revokeAccess().catch(() => {});
      await GoogleSignin.signOut().catch(() => {});
      setSubject(null);
      setSignedIn(false);
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  return { signedIn, ready, busy, subject, signIn, signOut, deleteAccount };
}
