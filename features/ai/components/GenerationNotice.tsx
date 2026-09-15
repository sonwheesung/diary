import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AppState } from 'react-native';

import { failMessage } from '@/features/ai/fail-message';
import { useGenerationStore } from '@/features/ai/generation-store';
import { periodLabel } from '@/features/ai/labels';

/**
 * 리포트 생성이 끝나면 **어느 화면에 있든** 알린다(`docs/AI_REPORT_SYSTEM.md` §11.8, 2026-09-15).
 *
 * - 리포트 탭에 있으면 예전처럼 곧장 상세로 간다. 누른 자리에서 기다린 사람에게 한 번 더 묻지 않는다
 * - 다른 화면이면 알림창으로 묻는다. 쓰던 글을 두고 끌려가면 안 된다
 * - 실패는 리포트 탭과 같은 문장이다(`failMessage`)
 *
 * 🔴 **앱이 앞에 있을 때만 띄운다.** 안드로이드는 뒤에서 띄운 `Alert` 를 조용히 버린다.
 *   그래서 결과를 스토어에 두고, 돌아와 `active` 가 되면 그때 꺼낸다.
 */
export function GenerationNotice() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const done = useGenerationStore((state) => state.done);
  const [active, setActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => setActive(next === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (done === null || !active) {
      return;
    }
    const taken = useGenerationStore.getState().take();
    if (taken === null) {
      return;
    }
    const { result } = taken;
    if (result.ok) {
      const href = `/report/${result.reportId}` as const;
      if (pathname === '/report') {
        router.push(href);
        return;
      }
      Alert.alert(t('report.title'), t('report.ready', { period: periodLabel(taken.kind, taken.periodKey) }), [
        { text: t('common.close'), style: 'cancel' },
        { text: t('report.viewReport'), onPress: () => router.push(href) },
      ]);
      return;
    }
    Alert.alert(
      t('report.title'),
      failMessage(result.reason, taken.kind, taken.periodKey, t, result.retryAt),
    );
  }, [done, active, pathname, t]);

  return null;
}
