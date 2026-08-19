import { router, useFocusEffect } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import CloudUpload from 'lucide-react-native/icons/cloud-upload';
import KeyRound from 'lucide-react-native/icons/key-round';
import RotateCcw from 'lucide-react-native/icons/rotate-ccw';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { isReleaseEnvelopeVersion } from '@/features/backup/api/package';
import { getBackupState, markCodeConfirmed } from '@/features/backup/api/backup-state';
import type { BackupState } from '@/features/backup/api/backup-state';
import {
  createBackupSecret,
  loadBackupKeys,
  readRecoveryCode,
} from '@/features/backup/api/key-store';
import { runBackup } from '@/features/backup/api/run-backup';
import type { BackupProgress } from '@/features/backup/api/run-backup';
import { RecoveryCodeView } from '@/features/backup/components/RecoveryCodeView';
import { isAwaitingEntitlementConfirm, useEntitlementStore } from '@/features/entitlement/store';
import { GRACE_DAYS, daysUntil, purgeAtFrom } from '@/features/backup/policy';
import { formatDateTime } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { radius, spacing } from '@/theme/spacing';
import { useColors } from '@/theme/theme';
import { typography } from '@/theme/typography';
import { useStyles } from '@/theme/use-styles';

/**
 * 백업 화면.
 *
 * ⚠ **고지 문구를 흐리지 않는다.** 백업은 *"저장하지 않습니다"* 가 아니라
 *   *"읽지 못합니다"* 다 — 암호문과 메타데이터는 저장한다. AI 리포트가 그 반대이고,
 *   둘을 섞어 쓰면 어느 한쪽이 거짓말이 된다(CLAUDE.md §5.1).
 */
export default function BackupScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const pro = useEntitlementStore((s) => s.pro);
  const proUntil = useEntitlementStore((s) => s.proUntil);
  /*
   * 구독이 끊긴 뒤 파기까지 남은 시간. **만료는 이벤트로 오지 않으므로**
   * 캐시된 만료 시각에서 앱이 직접 센다(`features/backup/policy.ts`).
   */
  const purgeAt = pro ? null : purgeAtFrom(proUntil);

  const [state, setState] = useState<BackupState | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [progress, setProgress] = useState<BackupProgress | null>(null);

  const load = useCallback(async () => {
    const keys = await loadBackupKeys();
    setState(await getBackupState(keys?.vaultId));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  /** 백업을 처음 켠다 — 비밀을 만들고 코드를 보여준다 */
  const enable = async () => {
    const keys = await createBackupSecret();
    setCode(await readRecoveryCode());
    await getBackupState(keys.vaultId);
  };

  const backupNow = async () => {
    setProgress({ ratio: 0, phase: 'building' });
    const result = await runBackup(setProgress);
    setProgress(null);
    if (!result.ok) {
      /*
       * 🔴 결제 직후 낙관 구간이면 서버만 아직 모르는 상태다(§6.1.7 B1).
       *   *"구독하면 이용할 수 있어요"* 는 방금 결제한 사람에게 하는 거짓말이 된다.
       */
      const body =
        result.reason === 'not-subscribed' && isAwaitingEntitlementConfirm()
          ? t('subscribe.confirming')
          : t(`backup.fail.${result.reason}`);
      Alert.alert(t('backup.failedTitle'), body);
      return;
    }
    await load();
    Alert.alert(t('backup.doneTitle'), t('backup.doneBody', { count: result.partCount }));
  };

  const header = (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <ChevronLeft size={26} color={colors.text} />
      </Pressable>
      <Text style={styles.headerTitle}>{t('backup.title')}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  // 코드를 막 발급한 직후 — 다른 것은 보여주지 않는다. 지금이 적어둘 유일한 순간이다.
  if (code !== null) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
        <RecoveryCodeView
          code={code}
          onConfirmed={async () => {
            await markCodeConfirmed(Date.now());
            setCode(null);
            await load();
          }}
          onSkip={() => {
            setCode(null);
            void load();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      <Text style={styles.lead}>{t('backup.lead')}</Text>

      {/*
        ⚠ 정확한 표현. "아무것도 저장하지 않습니다"가 아니다 —
          암호문과 메타데이터(백업 시각·용량)는 서버에 남는다.
      */}
      <View style={styles.noticeBox}>
        {/*
          🔴 **무엇이 올라가는지 먼저 적는다.** 여기 없으면 사용자는 "일기만"으로 읽는다 —
            리포트는 캡이 주 1회라 **다시 만들 수 없고**, 백업에 든다는 사실을 모른 채
            폰을 바꾸면 잃었다고 생각한다. 반대로 "리포트도 올라간다"는 것은
            AI 고지(무엇이 서버로 가는가)와도 이어지므로 밝히는 쪽이 맞다.
        */}
        <Text style={styles.notice}>{t('backup.noticeIncludes')}</Text>
        <Text style={styles.notice}>{t('backup.noticeUnreadable')}</Text>
        <Text style={styles.notice}>{t('backup.noticeMetadata')}</Text>
      </View>

      {/*
        ⚠ 유예 안내. `CLAUDE.md` §7.2의 "반드시 알린다"는 지킬 수 없어서 정정했고,
          그 자리를 이게 대신한다 — **못 하는 것도 같이 적는다.**
          폰을 잃은 사람은 앱을 안 열어서 이 배너가 닿지 않는다.
      */}
      {purgeAt !== null && state?.enabled === true && (
        <View style={styles.graceBox}>
          <Text style={styles.graceTitle}>
            {t('backup.graceTitle', { days: daysUntil(purgeAt) })}
          </Text>
          <Text style={styles.graceBody}>
            {t('backup.graceBody', { date: formatDateTime(purgeAt) })}
          </Text>
        </View>
      )}

      {/*
        ⚠ **실험 봉투 버전으로는 사용자에게 백업을 열지 않는다.** 그 버전으로 올라간
          데이터는 동결 시점에 못 읽는 데이터가 되고, 폰을 잃은 뒤라면 영구 손실이다.
          내부 테스트도 사용자 릴리스다 — 테스터는 자기 진짜 일기를 쓴다.
          개발 빌드는 통과시킨다(그래야 다음 형식을 만들 수 있다).
      */}
      {!__DEV__ && !isReleaseEnvelopeVersion() ? (
        <Text style={styles.subtle}>{t('backup.experimentalBuild')}</Text>
      ) : state === null ? (
        <ActivityIndicator color={colors.accentMuted} />
      ) : state.enabled ? (
        <View style={styles.block}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>{t('backup.lastBackup')}</Text>
            <Text style={styles.statusValue}>
              {state.lastBackupAt === null ? t('backup.never') : formatDateTime(state.lastBackupAt)}
            </Text>
          </View>

          {/* 복구 코드를 확인하지 않은 사람은 백업이 돌아도 되찾을 수 없다 — 계속 보여준다 */}
          {state.codeConfirmedAt === null && (
            <Pressable
              accessibilityRole="button"
              onPress={() => void openCode(setCode)}
              style={styles.warnRow}
            >
              <KeyRound size={18} color={colors.danger} />
              <Text style={styles.warnText}>{t('backup.codeUnconfirmed')}</Text>
            </Pressable>
          )}

          {progress !== null ? (
            <View style={styles.progressBox}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.progressText}>
                {t(`backup.phase.${progress.phase}`)} {Math.round(progress.ratio * 100)}%
              </Text>
            </View>
          ) : (
            <Button
              label={t('backup.backupNow')}
              onPress={() => void backupNow()}
              disabled={!pro}
              fullWidth
            />
          )}

          {!pro && (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/subscribe')}
              hitSlop={8}
            >
              <Text style={styles.linkCenter}>{t('backup.needsSubscription')}</Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/backup-restore')}
            style={styles.linkRow}
          >
            <RotateCcw size={18} color={colors.accent} />
            <Text style={styles.linkText}>{t('backup.restoreEntry')}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => void openCode(setCode)}
            style={styles.linkRow}
          >
            <KeyRound size={18} color={colors.accent} />
            <Text style={styles.linkText}>{t('backup.viewCode')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.block}>
          <View style={styles.emptyIcon}>
            <CloudUpload size={26} color={colors.accent} />
          </View>
          <Text style={styles.emptyBody}>{t('backup.offBody')}</Text>
          {/*
            ⚠ **켜기 전에** 말한다. 나중에 배너로만 알리면 폰을 잃은 사람에게는 닿지 않는다 —
              그래서 "앱을 열지 않으면 안내가 닿지 않는다"까지 여기서 같이 적는다.
          */}
          <Text style={styles.subtle}>{t('backup.offGraceNotice', { days: GRACE_DAYS })}</Text>
          <Button
            label={t('backup.turnOn')}
            onPress={() => void enable()}
            disabled={!pro}
            fullWidth
          />
          {!pro && (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/subscribe')}
              hitSlop={8}
            >
              <Text style={styles.linkCenter}>{t('backup.needsSubscription')}</Text>
            </Pressable>
          )}

          {/* 백업을 켠 적 없는 기기에서도 복원은 들어갈 수 있어야 한다 — 새 폰의 주 경로다 */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/backup-restore')}
            style={styles.linkRow}
          >
            <RotateCcw size={18} color={colors.accent} />
            <Text style={styles.linkText}>{t('backup.restoreWithCode')}</Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

async function openCode(setCode: (code: string | null) => void): Promise<void> {
  setCode(await readRecoveryCode());
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerTitle: {
      ...typography.label,
      color: colors.text,
      marginLeft: spacing.md,
    },
    headerSpacer: {
      flex: 1,
    },
    lead: {
      ...typography.body,
      color: colors.text,
      lineHeight: 23,
    },
    noticeBox: {
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    notice: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 19,
    },
    block: {
      gap: spacing.lg,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusLabel: {
      ...typography.caption,
      color: colors.textMuted,
    },
    statusValue: {
      ...typography.label,
      color: colors.text,
    },
    graceBox: {
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.danger,
      backgroundColor: colors.surface,
    },
    graceTitle: {
      ...typography.label,
      color: colors.danger,
    },
    graceBody: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 19,
    },
    warnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    warnText: {
      ...typography.caption,
      flex: 1,
      color: colors.danger,
      lineHeight: 19,
    },
    progressBox: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.lg,
    },
    progressText: {
      ...typography.caption,
      color: colors.textMuted,
    },
    emptyIcon: {
      alignSelf: 'center',
      width: 56,
      height: 56,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
    },
    emptyBody: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    linkText: {
      ...typography.body,
      color: colors.accent,
    },
    subtle: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
    },
    linkCenter: {
      ...typography.caption,
      color: colors.accent,
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
  });
