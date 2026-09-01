import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useCallback, useEffect, useState } from 'react';

import { purgeAiData } from '@/features/ai/api/client';
import { purgeBackup } from '@/features/backup/api/run-backup';
import {
  forgetPurchaseIdentity,
  reattachSubscription,
} from '@/features/subscription/api/purchases';
import {
  DEV_LOGIN_ENABLED,
  DEV_SUBJECT,
  devSessionExists,
  devSignIn,
  devSignOut,
} from '@/features/support/dev-auth';
import { useInquiryStore } from '@/features/support/inquiry-store';
import { useEntitlementStore } from '@/features/entitlement/store';
import { bootGateDecision } from '@/features/auth/api/age-store';
import { requestAgeVerification } from '@/features/auth/gate-store';
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

/**
 * 로그인 시도 결과. `null`이면 성공, `'cancelled'`면 사용자가 창을 닫은 것(오류 아님).
 *
 * `'age-blocked'` — 연령 게이트 미달. **오류가 아니고, 화면에 아무 말도 하지 않는다** —
 * 게이트가 이미 그 자리에서 설명했다. `'cancelled'`와 합치지 않는 이유는 나중에
 * 이 둘을 다르게 다뤄야 할 때 구분할 근거가 남아 있어야 하기 때문이다.
 */
export type SignInOutcome = null | 'cancelled' | 'age-blocked' | FailReason;

/**
 * 마지막 구글 SDK 오류 코드 — **릴리스 빌드에서 원인을 보는 유일한 창.**
 *
 * 🔴 진단 로그가 `__DEV__` 안에만 있었는데, **SHA-1·패키지 문제는 릴리스에서만 난다**
 *   (dev build는 지문이 다르다). 그래서 정작 필요한 빌드에서 아무것도 안 남았다.
 *
 * 실제로 겪음(2026-08-17): stg AAB에서 계정 선택 직후 로그인이 끊겼는데 화면에 뜬 것은
 * *"로그인하지 못했어요"* 한 줄뿐이라, Google Cloud 콘솔의 OAuth 클라이언트 목록을 열어
 * 패키지명을 눈으로 대조하고서야 원인을 알았다 — `10`(DEVELOPER_ERROR) 하나만 보였으면
 * 스크린샷 한 장으로 끝났을 일이다.
 *
 * ⚠ 훅 상태가 아니라 모듈 변수다. 알림은 `await signIn()` 직후에 읽으므로 재렌더가 필요 없고,
 *   상태로 만들면 실패할 때마다 화면이 다시 그려진다.
 *
 * ⚠ **숫자만 담는다.** 오류 객체에는 계정 정보가 섞여 올 수 있어 그대로 두면 알림에 샌다.
 */
let lastSignInErrorCode: string | null = null;

export function getLastSignInErrorCode(): string | null {
  return lastSignInErrorCode;
}

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
      /*
       * 개발용 임의 로그인이 켜져 있으면 그것부터 본다 — 진짜 서버에 물어봐야
       * `not-configured`로 떨어질 뿐이고, 그 사이 화면이 '로그인 필요'로 깜빡인다.
       */
      if (DEV_LOGIN_ENABLED && (await devSessionExists())) {
        if (!alive) return;
        setSubject(DEV_SUBJECT);
        setSignedIn(true);
        setReady(true);
        void useEntitlementStore.getState().hydrate();
        return;
      }

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
    /*
     * 🔴 **연령 게이트가 맨 앞이다** (docs/AUTH_SYSTEM.md §1.2).
     *
     * 호출처(`app/support.tsx`·`app/subscribe.tsx`)가 아니라 여기 두는 이유는,
     * 세 번째 호출처가 생기는 날 그 사람은 게이트를 모르기 때문이다 —
     * `adsEnabled()` 한 곳을 거치게 한 것과 같은 규약(CLAUDE.md §7).
     *
     * ⚠ **dev 로그인 분기보다도 앞이다.** 뒤에 두면 분기 하나가 게이트를 빠져나가고,
     *   "어떤 경로로도 못 지나간다"를 더 이상 한 줄로 말할 수 없게 된다.
     */
    /*
     * ⚠ 게이트는 2026-09-01부터 **부팅에도** 선다(`docs/AUTH_SYSTEM.md` §1.2). 그래도 여기를
     *   지우지 않는다 — 부팅 게이트는 사용자가 닫을 수 있고, 그때 로그인이 열리면 안 된다.
     *   *"어떤 경로로도 못 지나간다"* 를 한 줄로 말할 수 있어야 한다.
     */
    const decision = await bootGateDecision();
    if (decision === 'blocked') {
      // 유예 안의 미달자다. 다시 묻지 않는다 — 물어도 답은 같고, 재입력은 우회 경로가 된다.
      return 'age-blocked';
    }
    if (decision === 'ask') {
      const verified = await requestAgeVerification();
      if (!verified) {
        return 'age-blocked';
      }
    }

    /*
     * ⚠ 구글 창을 띄우기 **전에** 가른다. 개발 빌드에서 구글 로그인을 붙이려면
     *   SHA-1 등록과 dev build가 필요한데, 화면을 눌러보려는 목적에는 과하다.
     */
    if (DEV_LOGIN_ENABLED) {
      const subject = await devSignIn();
      if (subject === null) {
        return 'not-configured';
      }
      setSubject(subject);
      setSignedIn(true);
      await useEntitlementStore.getState().hydrate();
      return null;
    }

    if (!WEB_CLIENT_ID) {
      return 'not-configured';
    }
    // 지난 시도의 코드를 지운다 — 안 지우면 다음 실패에 옛 코드가 붙어 진단이 거짓말을 한다
    lastSignInErrorCode = null;
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
      /*
       * 로그인 직후 권한을 다시 읽는다. 다른 기기에서 구독한 사람은 이 순간 pro가 되고,
       * 안 읽으면 다음 앱 실행까지 광고를 계속 본다 — 방금 돈을 낸 사람에게 최악이다.
       *
       * ⚠ 서버가 `pro`가 아니라고 답해도 **스토어에는 구독이 있을 수 있다**(계정이 바뀐 경우).
       *   그때 스토어에 한 번 더 물어보는 것까지가 이 한 줄이다 — 안 하면 돈만 나간다.
       */
      void reattachSubscription(result.subject.id);
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
       *
       * ⚠ ①을 **콘솔에서 확인하지 마라**(2026-08-19에 그러다 반나절 썼다). Play 앱 서명 키는
       *   이전 키·현재 키·양자 내성 키로 **여러 개**이고, Play Console은 이전 키의 지문을
       *   화면에 보여주지 않는다 — 콘솔에 등록된 값과 기기가 쓰는 값이 다를 수 있다.
       *   기기에서 직접 잰다: `adb pull` 후 `apksigner verify --print-certs`
       *   (`keytool -jarfile`은 v1 전용이라 요즘 APK에는 안 통한다).
       *   절차와 사연은 `docs/MONETIZATION_SYSTEM.md` §6.1.5.
       */
      const code = isErrorWithCode(error) ? String(error.code) : null;
      // 릴리스에서도 남긴다 — 화면이 이 값을 알림에 덧붙인다(`getLastSignInErrorCode`)
      lastSignInErrorCode = code;
      if (__DEV__) {
        console.warn('[auth] google sign-in failed:', code ?? String(error));
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
      await devSignOut();
      setSubject(null);
      setSignedIn(false);
      // 권한은 계정에 붙어 있다 — 계정을 끊었는데 pro가 남으면 광고가 안 뜬다.
      await useEntitlementStore.getState().clear();
      /*
       * ⚠ 문의 내역과 **읽음 기록**도 함께 버린다. 안 버리면 다음 사람이 로그인했을 때
       *   앞사람의 답변 배지가 남는다 — 내용이 새지는 않지만(서버가 subject로 거른다)
       *   있지도 않은 답변을 알리는 것은 고장이다(`docs/SUPPORT_SYSTEM.md` §5.5).
       */
      await useInquiryStore.getState().clear();
      /*
       * ⚠ RC 신원도 끊는다. 안 끊으면 **다음 사람이 남의 구독을 물려받는다** —
       *   같은 기기에서 다른 계정으로 로그인했을 때 RC는 여전히 앞 사람의 appUserID다.
       */
      await forgetPurchaseIdentity();
    } finally {
      setBusy(false);
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<FailReason | null> => {
    setBusy(true);
    try {
      /*
       * ⚠ **백업을 먼저 지운다.** `common_server`가 수정 금지라 `subject_events` 아웃박스를
       *   만들 수 없어서, 탈퇴 이벤트를 조각 서버가 받을 길이 없다. 앱이 직접 지운다.
       *
       * ⚠ **실패하면 탈퇴를 진행하지 않는다.** "탈퇴하면 백업도 삭제됩니다"가 처리방침과
       *   Play 데이터 보안 선언에 들어가므로, 계정만 지우고 백업이 남으면 그 진술이 거짓이 된다.
       *   새 실패 모드가 아니다 — `deleteAccount()` 자체가 네트워크 작업이라 오프라인이면
       *   어차피 탈퇴가 안 된다. 순서만 하나 늘어난다.
       *
       * ⚠ 순서가 이쪽인 이유: 백업만 사라지고 계정이 남으면 사용자는 다시 시도할 수 있지만,
       *   계정이 사라지고 백업이 남으면 **지울 권한이 있는 사람이 없어진다.**
       */
      const purged = await purgeBackup();
      if (!purged.ok) {
        return purged.reason === 'offline' ? 'offline' : 'error';
      }

      /*
       * ⚠ **AI 데이터도 지운다** — 백업과 **같은 이유·같은 순서**다(2026-08-24).
       *
       * `DELETE_ACCOUNT` §3이 *"탈퇴하면 AI 리포트 요약문과 이용 기록이 파기된다"* 고
       * 게시돼 있는데 그렇게 하는 코드가 없었다. 서버에 남는 것 중 **유일하게 사람이 읽을 수
       * 있는 일기 파생물**이 리포트 요약문이다 — 백업은 암호문이라 우리도 못 읽는다.
       *
       * ⚠ 여기서 실패하면 탈퇴를 진행하지 않는다. 계정이 사라지면 그 subject 토큰으로만
       *   인가되는 이 라우트를 **아무도 부를 수 없다.**
       */
      const aiPurged = await purgeAiData();
      if (!aiPurged.ok) {
        return aiPurged.reason === 'offline' ? 'offline' : 'error';
      }

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
      // 권한은 계정에 붙어 있다 — 계정을 끊었는데 pro가 남으면 광고가 안 뜬다.
      await useEntitlementStore.getState().clear();
      /*
       * 탈퇴는 로그아웃보다 분명하다 — 서버에서 문의 자체가 사라지는데
       * 로컬에 읽음 기록만 남을 이유가 없다.
       */
      await useInquiryStore.getState().clear();
      await forgetPurchaseIdentity();
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  return { signedIn, ready, busy, subject, signIn, signOut, deleteAccount };
}
