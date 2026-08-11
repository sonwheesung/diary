import { router, useFocusEffect } from 'expo-router';
import AlertTriangle from 'lucide-react-native/icons/triangle-alert';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getBackupState } from '@/features/backup/api/backup-state';
import { GRACE_DAYS, daysUntil, purgeAtFrom } from '@/features/backup/policy';
import { useEntitlementStore } from '@/features/entitlement/store';
import type { Palette } from '@/theme/palettes';
import { radius, spacing } from '@/theme/spacing';
import { useColors } from '@/theme/theme';
import { typography } from '@/theme/typography';
import { useStyles } from '@/theme/use-styles';

/**
 * 유예 배너 — **구독이 끝난 뒤 백업이 지워지기까지의 카운트다운.**
 *
 * ⚠ 우리가 할 수 있는 통지가 이것뿐이다. 푸시도 이메일도 없어서 **앱을 열지 않는 사람에게는
 *   닿지 않는다**(`docs/BACKUP_SYSTEM.md` §5). 그래서 백업 화면에만 두지 않고 **홈에** 세운다 —
 *   백업 화면에 들어가는 사람은 이미 아는 사람이다.
 *
 * ⚠ **닫을 수 없다.** 기둥 2("화면이 조용해야 글이 보인다")를 여기서만 굽힌다.
 *   한 번 닫으면 다시 볼 이유가 사라지는데, 걸린 것이 되돌릴 수 없는 일기 삭제다.
 *
 * ⚠ **파기 뒤에는 사라진다.** 막을 손실이 이미 일어났고, 남아 있는 알림은 잔소리다.
 *   사실 자체는 백업 화면에 남는다.
 */
export function GraceBanner() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const pro = useEntitlementStore((s) => s.pro);
  const hydrated = useEntitlementStore((s) => s.hydrated);
  const proUntil = useEntitlementStore((s) => s.proUntil);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  /*
   * 포커스마다 다시 읽는다. 백업을 켜거나 끄고 돌아오면 배너도 따라와야 하는데,
   * 홈은 포커스를 잃은 적이 없어 스스로 다시 읽지 않는다(복원 후 리마운트와 같은 이유).
   */
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void getBackupState().then((state) => {
        if (alive) setEnabled(state.enabled);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  // 캐시를 읽기 전에는 아무 말도 하지 않는다 — 구독자에게 삭제 경고가 깜빡이면 안 된다.
  if (!hydrated || pro || enabled !== true) {
    return null;
  }
  const purgeAt = purgeAtFrom(proUntil);
  if (purgeAt === null) {
    return null;
  }
  const days = daysUntil(purgeAt);
  if (days === 0) {
    // 이미 지났다. 여기서 할 일은 없다.
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('backup.graceTitle', { days })}
      onPress={() => router.push('/backup')}
      style={styles.banner}
    >
      <AlertTriangle size={18} color={colors.danger} />
      <View style={styles.text}>
        <Text style={styles.title}>{t('backup.graceTitle', { days })}</Text>
        {/* 남은 날이 얼마 없으면 무엇을 하면 되는지도 같이 적는다 */}
        {days <= GRACE_DAYS / 3 && <Text style={styles.hint}>{t('backup.graceAction')}</Text>}
      </View>
    </Pressable>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.danger,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    // 문자열 길이를 전제하지 않는다 — 독일어는 두 배까지 길어진다(§9.1)
    text: { flex: 1, gap: 2 },
    title: { ...typography.label, color: colors.danger },
    hint: { ...typography.caption, color: colors.textMuted },
  });
