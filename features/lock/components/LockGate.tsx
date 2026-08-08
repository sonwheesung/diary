import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';

import { LOCK_DELAY_MS, getLockConfig } from '@/features/lock/api/lock-store';
import type { LockConfig } from '@/features/lock/api/lock-store';
import { UnlockView } from '@/features/lock/components/UnlockView';

/**
 * 앱 잠금 게이트 (CLAUDE.md §7.1).
 *
 * 라우트가 아니라 **앱 전체를 덮는 층**이다. 잠금을 화면으로 만들면 뒤로가기·딥링크·탭 전환으로
 * 지나칠 구멍이 생긴다 — 여기서 막으면 통과할 길이 없다.
 *
 * 잠기는 시점: 앱을 켤 때 + 백그라운드로 나갔다가 설정한 시간이 지난 뒤 돌아올 때.
 */
export function LockGate({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LockConfig | null>(null);
  const [locked, setLocked] = useState(false);
  const backgroundedAtRef = useRef<number | null>(null);

  const reload = useCallback(async () => {
    const next = await getLockConfig();
    setConfig(next);
    // 잠금을 방금 켠 경우까지 즉시 잠그면 설정 화면에서 바로 튕긴다 — 켤 때는 잠그지 않는다.
    setLocked((current) => current && next.enabled);
    return next;
  }, []);

  // 앱을 켤 때 한 번. 잠금이 걸려 있으면 처음부터 잠근다.
  useEffect(() => {
    void (async () => {
      const next = await getLockConfig();
      setConfig(next);
      setLocked(next.enabled);
    })();
  }, []);

  useEffect(() => {
    const handle = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        backgroundedAtRef.current = Date.now();
        return;
      }
      if (state !== 'active') {
        return;
      }
      void (async () => {
        // 설정을 바꾸고 돌아왔을 수도 있다 — 돌아올 때마다 다시 읽는다.
        const next = await reload();
        const leftAt = backgroundedAtRef.current;
        backgroundedAtRef.current = null;
        if (!next.enabled || leftAt === null) {
          return;
        }
        if (Date.now() - leftAt >= LOCK_DELAY_MS[next.delay]) {
          setLocked(true);
        }
      })();
    };

    const subscription = AppState.addEventListener('change', handle);
    return () => subscription.remove();
  }, [reload]);

  return (
    <>
      {children}
      {locked && config !== null && config.method !== null && (
        <UnlockView
          method={config.method}
          biometric={config.biometric}
          onUnlocked={() => setLocked(false)}
        />
      )}
    </>
  );
}
