import { create } from 'zustand';

import { getLockConfig } from '@/features/lock/api/lock-store';
import type { LockConfig } from '@/features/lock/api/lock-store';

interface LockState {
  /** 아직 한 번도 안 읽었으면 null */
  config: LockConfig | null;
  refresh: () => Promise<LockConfig>;
}

/**
 * 잠금 설정을 **한 곳에서** 들고 있는다.
 *
 * 설정 화면과 게이트가 각자 읽으면, 설정에서 잠금을 켠 순간 게이트는 그걸 모른다.
 * 실제로 그 때문에 잠금을 켜도 **앱 스위처 가림이 걸리지 않았다**(2026-08-08) —
 * 게이트는 앱이 백그라운드에 다녀와야 다시 읽었기 때문이다.
 */
export const useLockStore = create<LockState>((set) => ({
  config: null,
  refresh: async () => {
    const next = await getLockConfig();
    set({ config: next });
    return next;
  },
}));
