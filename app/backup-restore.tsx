import { router } from 'expo-router';
import AlertTriangle from 'lucide-react-native/icons/triangle-alert';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { adoptBackupSecret, loadBackupKeys } from '@/features/backup/api/key-store';
import type { BackupKeys } from '@/features/backup/api/key-store';
import { diaryDatesFor } from '@/features/backup/api/manifest-builder';
import { applyRestore, diffAgainstLocal } from '@/features/backup/api/restore';
import type { RestoreDiff } from '@/features/backup/api/restore';
import { fetchRestorable } from '@/features/backup/api/run-backup';
import { decodeRecoveryCode } from '@/features/backup/recovery-code';
import type { Manifest } from '@/features/backup/manifest';
import { formatListDate } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { radius, spacing } from '@/theme/spacing';
import { useColors } from '@/theme/theme';
import { typography } from '@/theme/typography';
import { useStyles } from '@/theme/use-styles';

/**
 * 복원 — **전체 교체**라, 무엇을 잃는지 먼저 보여준다.
 *
 * ⚠ 진짜 다수 케이스는 "두 기기 병행 작성"이 아니라 **"로컬이 비어 있지 않은데 복원"** 이다.
 *   백업이 수동 버튼인 한 스테일은 기본값이고, 3주 전 백업 + 그 뒤 20개 작성 상태에서
 *   복원을 누르면 20개가 사라진다. 그래서 **개수와 날짜를 함께** 보여준다 —
 *   "497개가 대체됩니다"는 위험을 표현하지 못한다. 사라지는 건 20개다.
 */

type Step =
  | { kind: 'code' }
  | { kind: 'loading' }
  | { kind: 'confirm'; keys: BackupKeys; manifest: Manifest; seq: number; diff: RestoreDiff; dates: string[] }
  | { kind: 'applying' };

export default function BackupRestoreScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);

  const [step, setStep] = useState<Step>({ kind: 'code' });
  const [input, setInput] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [ratio, setRatio] = useState(0);

  /** 이 기기에 이미 비밀이 있으면 코드를 다시 묻지 않는다 */
  const restoreFromThisDevice = async () => {
    const keys = await loadBackupKeys();
    if (keys === null) {
      setCodeError(t('backup.restoreNoLocalKey'));
      return;
    }
    await load(keys);
  };

  const submitCode = async () => {
    let keys: BackupKeys;
    try {
      keys = await adoptBackupSecret(decodeRecoveryCode(input));
    } catch {
      // 길이·문자·검사문자를 구분해 던지지만, 화면에서는 한 줄로 모은다 —
      // 사용자가 할 일은 어느 경우든 "다시 확인해서 입력"이다.
      setCodeError(t('backup.restoreBadCode'));
      return;
    }
    await load(keys);
  };

  const load = async (keys: BackupKeys) => {
    setStep({ kind: 'loading' });
    setRatio(0);
    const result = await fetchRestorable(keys, setRatio);
    if (!result.ok) {
      setStep({ kind: 'code' });
      setCodeError(t(`backup.fail.${result.reason}`));
      return;
    }
    const diff = await diffAgainstLocal(result.manifest);
    const dates = await diaryDatesFor(diff.losing.slice(0, 20));
    setStep({ kind: 'confirm', keys, manifest: result.manifest, seq: result.seq, diff, dates });
  };

  const apply = async (current: Extract<Step, { kind: 'confirm' }>) => {
    setStep({ kind: 'applying' });
    try {
      await applyRestore(current.manifest, current.keys.vaultId, current.seq);
    } catch (error) {
      setStep({ kind: 'code' });
      Alert.alert(
        t('backup.restoreFailedTitle'),
        error instanceof Error ? error.message : t('common.retry'),
      );
      return;
    }
    Alert.alert(t('backup.restoreDoneTitle'), t('backup.restoreDoneBody'), [
      // ⚠ 홈으로 되돌린다. 잠금은 백업 대상이 아니라 복원 후 꺼져 있고,
      //   화면들은 포커스를 잃은 적이 없어 스스로 다시 읽지 않는다.
      { text: t('common.confirm'), onPress: () => router.replace('/') },
    ]);
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
      <Text style={styles.headerTitle}>{t('backup.restoreTitle')}</Text>
    </View>
  );

  if (step.kind === 'loading' || step.kind === 'applying') {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} header={header} scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.progressText}>
            {step.kind === 'loading'
              ? `${t('backup.restoreDownloading')} ${Math.round(ratio * 100)}%`
              : t('backup.restoreApplying')}
          </Text>
          {/* 복원 중 이탈을 막을 수는 없지만, 나가면 안 된다는 것은 말해준다 */}
          {step.kind === 'applying' && (
            <Text style={styles.subtle}>{t('backup.restoreDoNotLeave')}</Text>
          )}
        </View>
      </Screen>
    );
  }

  if (step.kind === 'confirm') {
    const losing = step.diff.losing.length;
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
        <Text style={styles.lead}>
          {t('backup.restoreFound', { count: step.diff.incoming })}
        </Text>

        {losing > 0 ? (
          <View style={styles.dangerBox}>
            <View style={styles.dangerHead}>
              <AlertTriangle size={20} color={colors.danger} />
              <Text style={styles.dangerTitle}>{t('backup.restoreLosing', { count: losing })}</Text>
            </View>
            <Text style={styles.dangerBody}>{t('backup.restoreLosingBody')}</Text>
            {/* 숫자만으로는 와닿지 않는다 — 날짜를 보여준다 */}
            <View style={styles.dateList}>
              {step.dates.map((date, index) => (
                <Text key={`${date}-${index}`} style={styles.dateItem}>
                  {formatListDate(date)}
                </Text>
              ))}
              {losing > step.dates.length && (
                <Text style={styles.dateItem}>
                  {t('backup.restoreLosingMore', { count: losing - step.dates.length })}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <Text style={styles.subtle}>{t('backup.restoreNothingLost')}</Text>
        )}

        <Text style={styles.subtle}>{t('backup.restorePhotosNote')}</Text>

        <Button
          label={t('backup.restoreConfirm')}
          onPress={() => {
            if (losing === 0) {
              void apply(step);
              return;
            }
            // 잃는 것이 있으면 한 번 더 묻는다. 되돌릴 수 없는 동작이다.
            Alert.alert(
              t('backup.restoreConfirmTitle'),
              t('backup.restoreConfirmBody', { count: losing }),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('backup.restoreConfirmAction'),
                  style: 'destructive',
                  onPress: () => void apply(step),
                },
              ],
            );
          }}
          fullWidth
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      <Text style={styles.lead}>{t('backup.restoreCodeLead')}</Text>

      {/*
        ⚠ **입력칸 하나**다. 칸을 쪼개면 붙여넣기가 깨지고 스크린리더에서 포커스가 튄다 —
          WCAG 2.2 F109가 그걸 실패 사례로 명시한다. 대신 관대하게 정규화한다:
          공백·하이픈·대소문자·혼동 문자(O→0, I·L→1)를 전부 흡수한다.
      */}
      <TextInput
        value={input}
        onChangeText={(next) => {
          setCodeError(null);
          setInput(next);
        }}
        placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXX"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="characters"
        autoCorrect={false}
        spellCheck={false}
        multiline
        accessibilityLabel={t('backup.restoreCodeLead')}
        style={[styles.codeInput, codeError !== null && styles.codeInputError]}
      />
      {codeError !== null && <Text style={styles.error}>{codeError}</Text>}

      <Button label={t('backup.restoreLoad')} onPress={() => void submitCode()} fullWidth />

      <Pressable accessibilityRole="button" onPress={() => void restoreFromThisDevice()} hitSlop={8}>
        <Text style={styles.link}>{t('backup.restoreUseThisDevice')}</Text>
      </Pressable>
    </Screen>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerTitle: {
      ...typography.label,
      color: colors.text,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
    },
    lead: {
      ...typography.body,
      color: colors.text,
      lineHeight: 23,
    },
    codeInput: {
      ...typography.body,
      minHeight: 88,
      textAlignVertical: 'top',
      letterSpacing: 1.5,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    codeInputError: {
      borderColor: colors.danger,
    },
    error: {
      ...typography.caption,
      color: colors.danger,
    },
    link: {
      ...typography.caption,
      color: colors.accent,
      textAlign: 'center',
    },
    dangerBox: {
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.danger,
      backgroundColor: colors.surface,
    },
    dangerHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dangerTitle: {
      ...typography.label,
      flex: 1,
      color: colors.danger,
    },
    dangerBody: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 19,
    },
    dateList: {
      gap: spacing.xs,
      paddingTop: spacing.xs,
    },
    dateItem: {
      ...typography.caption,
      color: colors.text,
    },
    progressText: {
      ...typography.body,
      color: colors.textMuted,
    },
    subtle: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 19,
    },
  });
