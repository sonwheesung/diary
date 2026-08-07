import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { fontAssets } from '@/theme/typography';

// 폰트가 준비되기 전에 화면이 보이면 시스템 폰트로 한 번 그려졌다가 바뀌는 깜빡임이 생긴다.
// 스플래시를 붙잡아 두고, 폰트 로드가 끝난 뒤에 내린다.
SplashScreen.preventAutoHideAsync().catch(() => {
  // 이미 숨겨진 뒤 호출되면 reject된다 — 앱 동작에는 영향이 없으므로 삼킨다.
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  // 폰트 로드에 실패해도 앱을 막지 않는다(시스템 폰트로 폴백). 잠금 화면조차 못 여는 게 더 나쁘다.
  const ready = fontsLoaded || fontError !== null;

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
