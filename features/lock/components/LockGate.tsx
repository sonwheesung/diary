import * as ScreenCapture from 'expo-screen-capture';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import type { AppStateStatus } from 'react-native';

import { UnlockView } from '@/features/lock/components/UnlockView';
import { consumeExcursion } from '@/features/lock/excursion';
import { useLockStore } from '@/features/lock/store';

/**
 * 앱 잠금 게이트 (CLAUDE.md §7.1).
 *
 * 라우트가 아니라 **앱 전체를 덮는 층**이다. 잠금을 화면으로 만들면 뒤로가기·딥링크·탭 전환으로
 * 지나칠 구멍이 생긴다 — 여기서 막으면 통과할 길이 없다.
 *
 * 잠기는 시점: 앱을 켤 때 + **백그라운드로 나가면 즉시**(2026-08-10 결정, 설정 없음).
 * 설정은 `useLockStore`가 단일 출처다 — 설정 화면에서 켠 잠금이 여기 즉시 반영돼야 한다.
 */
export function LockGate({ children }: { children: ReactNode }) {
  const config = useLockStore((state) => state.config);
  const refresh = useLockStore((state) => state.refresh);

  const [locked, setLocked] = useState(false);
  /**
   * 초기화 후 아래 화면을 통째로 새로 그리기 위한 키.
   * 잠금 덮개 뒤의 화면들은 포커스를 잃은 적이 없어서 스스로 다시 읽지 않는다 —
   * 지웠는데 지운 조각이 그대로 보이면 지워진 게 맞나 싶어진다.
   */
  const [treeKey, setTreeKey] = useState(0);
  /** 백그라운드에 다녀왔는지. 시각은 필요 없다 — 지연이 없어졌다(§7.1). */
  const leftRef = useRef(false);

  // 앱을 켤 때 한 번. 잠금이 걸려 있으면 처음부터 잠근다.
  useEffect(() => {
    void refresh().then((next) => setLocked(next.enabled));
  }, [refresh]);

  /*
   * 앱 스위처 가림 (CLAUDE.md §7.1).
   *
   * 잠금을 걸어도 최근 앱 미리보기에 일기가 그대로 보이면 잠금의 절반이 무의미하다.
   * 안드로이드는 `FLAG_SECURE`로 미리보기를 빈 화면으로 만든다.
   *
   * **잠금을 켠 사람에게만 건다.** 이 플래그는 스크린샷도 함께 막는다 —
   * 잠그지도 않은 사람이 자기 일기를 캡처하지 못하게 되는 건 부당하다.
   * 잠금을 켠 것은 "남에게 안 보이게 해달라"는 뜻이므로 그 대가는 감수할 만하다.
   *
   * ⚠ iOS는 스크린샷·녹화만 막힌다. 앱 스위처 가림은 별도 오버레이가 필요하다(미구현).
   */
  useEffect(() => {
    const enabled = config?.enabled === true;
    void (async () => {
      try {
        if (enabled) {
          await ScreenCapture.preventScreenCaptureAsync();
        } else {
          await ScreenCapture.allowScreenCaptureAsync();
        }
      } catch {
        // 지원하지 않는 환경(웹 등)에서 앱이 죽으면 안 된다. 가림이 안 될 뿐이다.
      }
    })();
  }, [config?.enabled]);

  useEffect(() => {
    const handle = (state: AppStateStatus) => {
      /*
       * ⚠ `inactive`는 이탈로 세지 않는다. iOS는 알림창을 내리거나 제어센터를 열거나
       *   전화 배너가 떠도 `inactive`가 온다 — 그걸 이탈로 보면 알림 하나에 잠긴다.
       *   진짜로 앱을 떠난 것은 `background`다.
       */
      if (state === 'background') {
        leftRef.current = true;
        return;
      }
      if (state !== 'active') {
        return;
      }
      void (async () => {
        // 설정을 바꾸고 돌아왔을 수도 있다 — 돌아올 때마다 다시 읽는다.
        const next = await refresh();
        const left = leftRef.current;
        leftRef.current = false;
        if (!next.enabled || !left) {
          return;
        }
        /*
         * 사진 선택기·구글 로그인처럼 **우리가 띄운** 화면에서 돌아온 것이라면 잠그지 않는다.
         * 사용자는 앱을 떠난 적이 없다(§7.1). 한 번만 봐주고 바로 다시 무장한다.
         */
        if (consumeExcursion()) {
          return;
        }
        setLocked(true);
      })();
    };

    const subscription = AppState.addEventListener('change', handle);
    return () => subscription.remove();
  }, [refresh]);

  return (
    <>
      <View key={treeKey} style={styles.fill}>
        {children}
      </View>
      {locked && config !== null && config.method !== null && (
        <UnlockView
          method={config.method}
          onUnlocked={() => setLocked(false)}
          onWiped={() => {
            setLocked(false);
            setTreeKey((current) => current + 1);
            void refresh();
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
