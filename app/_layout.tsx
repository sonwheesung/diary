import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
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

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [fontWaitExpired, setFontWaitExpired] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFontWaitExpired(true), FONT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

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
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      />
    </SafeAreaProvider>
  );
}
