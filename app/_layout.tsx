import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initializeAds } from '@/features/ads/api/ads';
import { useEntitlementStore } from '@/features/entitlement/store';
import { AgeGateScreen } from '@/features/auth/components/AgeGateScreen';
import { LockGate } from '@/features/lock/components/LockGate';
import { useNoticeStore } from '@/features/notice/store';
import { syncReminders } from '@/features/notification/api/reminder';
import { useLanguageStore } from '@/features/settings/language-store';
import { initI18n } from '@/lib/i18n';
import { ThemeProvider, useTheme } from '@/theme/theme';
import { fontAssets } from '@/theme/typography';

// 폰트가 준비되기 전에 화면이 보이면 시스템 폰트로 한 번 그려졌다가 바뀌는 깜빡임이 생긴다.
// 스플래시를 붙잡아 두고, 폰트 로드가 끝난 뒤에 내린다.
SplashScreen.preventAutoHideAsync().catch(() => {
  // 이미 숨겨진 뒤 호출되면 reject된다 — 앱 동작에는 영향이 없으므로 삼킨다.
});

// 폰트 대기 상한. 이 시간을 넘기면 시스템 폰트로 먼저 그린다.
// 상한이 없으면 느린 경로(개발 중 터널 연결·저사양 기기 I/O)에서 앱이 영영 스플래시에 갇힌다.
// 실제로 겪음(2026-08-07): 폰트 4.5MB를 ngrok 터널로 받느라 무기한 로딩으로 보였다.
// 폰트는 뒤늦게 도착해도 리렌더로 적용되므로, 기다리지 않는 쪽이 항상 낫다.
const FONT_TIMEOUT_MS = 3000;

// 첫 렌더 전에 켠다. 렌더 중에 초기화하면 키 문자열('home.recent')이 한 프레임 보인다.
initI18n();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [fontWaitExpired, setFontWaitExpired] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFontWaitExpired(true), FONT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  // 광고 SDK 초기화. 실패해도 앱 사용을 막지 않는다(CLAUDE.md §7).
  useEffect(() => {
    void initializeAds();
  }, []);

  /*
   * 구독 권한 — **캐시를 먼저 읽고**(동기에 가깝다) 그 다음 서버를 조회한다.
   * 순서가 중요하다: 서버를 기다리면 비행기 모드의 구독자에게 광고가 먼저 뜬다.
   * 조회 실패는 캐시를 건드리지 않으므로 아무 일도 일어나지 않는다.
   */
  const hydrateEntitlement = useEntitlementStore((state) => state.hydrate);
  const refreshEntitlement = useEntitlementStore((state) => state.refresh);
  useEffect(() => {
    void hydrateEntitlement().then(() => refreshEntitlement());
  }, [hydrateEntitlement, refreshEntitlement]);

  /*
   * 🔴 **포그라운드로 돌아올 때 다시 묻는다**(§6.1.7 A2).
   *
   * 예전에는 마운트에서 딱 한 번만 조회해서, 웹훅이 앱을 백그라운드에 둔 사이 도착하면
   * **앱을 완전히 재시작해야** 반영됐다. 결제 → 홈 버튼 → 5분 뒤 복귀 = 여전히 `이용 안 함`.
   * 웹훅이 5~60초(취소는 약 2시간)라 이 창은 실제로 자주 열린다.
   *
   * ⚠ `background`만 보지 않고 **`active`로 돌아온 것**을 본다. 잠금(§7.1)과 반대다 —
   *   거기서는 iOS의 `inactive`를 이탈로 세면 알림만 내려도 잠기므로 `background`만 셌지만,
   *   여기서는 되묻는 것이 해가 없고 놓치는 쪽이 손해다.
   * ⚠ 30초 스로틀. 앱 전환이 잦은 사용자에게 매번 왕복시키지 않는다.
   */
  useEffect(() => {
    let lastAt = Date.now();
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') return;
      if (Date.now() - lastAt < 30_000) return;
      lastAt = Date.now();
      void refreshEntitlement();
      /*
       * 리마인더 창을 다시 채운다(`docs/NOTIFICATION_SYSTEM.md` §3).
       *
       * 7일치를 미리 걸어두지만 **한 번이라도 앱을 열면 창이 다시 7일이 되어야** 한다.
       * 지난 알림·지난 조각·바뀐 언어가 여기서 한꺼번에 정리된다.
       * ⚠ 위 30초 스로틀 **안쪽**이다 — 앱 전환이 잦아도 재예약이 쏟아지지 않는다.
       */
      void syncReminders();
    });
    return () => sub.remove();
  }, [refreshEntitlement]);

  // 앱 시작 시 한 번. 알림이 울린 뒤 그 알림을 눌러 들어온 경우가 여기로 온다.
  useEffect(() => {
    void syncReminders();
  }, []);

  /*
   * 실기기 점검 — **명시적으로 켰을 때만** 돈다(`EXPO_PUBLIC_DEVICE_CHECK=1`).
   *
   * ⚠ `__DEV__`로 게이트하면 **릴리스 번들에서 잴 수 없다.** 암호 처리량은 dev 번들이
   *   프로덕션보다 훨씬 느려서(Hermes가 dev에서는 런타임 lazy 컴파일) dev 수치로
   *   라이브러리를 판정하면 틀린 결론이 나온다. 그래서 환경변수로 연다.
   *
   * ⚠ 기본값이 꺼짐이어야 한다 — 켜진 채 출시하면 매 실행마다 5MB를 올리고 DB를 스왑한다.
   */
  useEffect(() => {
    if (process.env.EXPO_PUBLIC_DEVICE_CHECK !== '1') return;
    const timer = setTimeout(() => {
      void import('@/features/backup/api/device-check').then(({ runDeviceChecks }) =>
        runDeviceChecks(process.env.EXPO_PUBLIC_BACKUP_SERVER_URL ?? ''),
      );
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // 저장된 언어 선택을 읽어 적용한다. 읽기 전에는 기기 언어로 그려진다.
  const loadLanguage = useLanguageStore((state) => state.load);
  useEffect(() => {
    void loadLanguage();
  }, [loadLanguage]);

  // 공지 부팅 조회 — 실행당 1회. 실패해도 아무 일도 일어나지 않는다(공지가 안 보일 뿐).
  const loadNotices = useNoticeStore((state) => state.load);
  useEffect(() => {
    void loadNotices();
  }, [loadNotices]);

  // 폰트 로드에 실패해도 앱을 막지 않는다(시스템 폰트로 폴백). 잠금 화면조차 못 여는 게 더 나쁘다.
  const ready = fontsLoaded || fontError !== null || fontWaitExpired;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      {/* 테마는 잠금 화면까지 덮어야 한다 — 게이트보다 바깥에 둔다 */}
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/** 팔레트를 읽어야 해서 Provider 안쪽에 따로 둔다 */
function ThemedApp() {
  const { colors, paletteId } = useTheme();

  return (
    <>
      {/* 상태바 글자색은 배경 밝기를 따라간다 — 다크에서 검은 글자면 안 보인다 */}
      <StatusBar style={paletteId === 'dark' ? 'light' : 'dark'} />
      {/* 잠금은 라우트가 아니라 앱 전체를 덮는 층이다 — 뒤로가기·딥링크로 지나칠 수 없어야 한다 */}
      <LockGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" />
          {/* 작성은 탭 위에 덮이는 모달이다 — 쓰는 동안 하단 탭이 보이면 집중이 깨진다. */}
          <Stack.Screen
            name="write"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack>
      </LockGate>
      {/*
        연령 게이트는 `signIn()`이 여는 층이다 — 라우트가 아니다(docs/AUTH_SYSTEM.md §1.2).
        🔴 **`LockGate` 밖에 둔다.** 안에 두면 잠금이 걸린 동안 게이트가 안 그려지는데,
           게이트를 여는 것은 잠금을 통과한 뒤의 화면이라 그 조합은 안 나긴 해도,
           "덮개 뒤에서 약속이 안 풀린다"는 실패는 조용해서 진단이 어렵다.
      */}
      <AgeGateScreen />
    </>
  );
}
