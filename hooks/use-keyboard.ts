import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export interface KeyboardMetrics {
  /** 키보드 높이(dp). 닫혀 있으면 0 */
  height: number;
  /** 키보드 윗변의 화면 좌표(dp). 닫혀 있으면 0 */
  screenY: number;
}

/**
 * 키보드의 실제 크기와 위치.
 *
 * 높이만으로는 부족하다 — 화면 높이에서 빼는 방식은 edge-to-edge에서 시스템 바를
 * 포함하느냐에 따라 어긋난다. 키보드 윗변의 절대 좌표(`screenY`)를 그대로 받아
 * `measureInWindow` 결과와 같은 좌표계에서 비교한다.
 */
export function useKeyboard(): KeyboardMetrics {
  const [metrics, setMetrics] = useState<KeyboardMetrics>({ height: 0, screenY: 0 });

  useEffect(() => {
    // iOS는 will* 이벤트가 애니메이션과 함께 와서 덜 튄다. 안드로이드는 did*만 온다.
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setMetrics({
        height: event.endCoordinates.height,
        screenY: event.endCoordinates.screenY,
      });
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setMetrics({ height: 0, screenY: 0 });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return metrics;
}
