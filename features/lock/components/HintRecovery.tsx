import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components/TextField';
import {
  getFailureState,
  getLockHintQuestion,
  hintQuestionText,
  recordFailure,
  resetFailures,
  revealSecretWithHint,
} from '@/features/lock/api/lock-store';
import type { LockMethod } from '@/features/lock/api/lock-store';
import { wipeAllData } from '@/features/settings/api/reset-app';
import type { Palette } from '@/theme/palettes';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface HintRecoveryProps {
  method: LockMethod;
  onClose: () => void;
  /** 초기화까지 간 경우. 잠금이 사라졌으니 게이트를 열어야 한다 */
  onWiped: () => void;
}

/*
 * 힌트도 못 맞히면?
 *
 * **기존 조각을 여는 방법은 없다.** 그게 잠금의 정의다. 남는 길은 전부 지우고 새로 시작하는 것뿐이고,
 * 그건 앱을 지웠다 다시 깔면 어차피 벌어지는 일이다 — 그래서 앱 안에 길을 둔다.
 * 막다른 화면에 사용자를 세워두고 "재설치하세요"라고 알아서 깨닫게 하지 않는다.
 *
 * 훔친 폰으로 초기화해도 **읽을 수 있게 되는 건 없다**. 잃는 건 가용성뿐이고
 * 그건 앱 삭제로도 똑같이 잃는다.
 */

/**
 * 힌트로 잠금 되찾기.
 *
 * 답이 맞으면 **원래 PIN·패턴을 그대로 보여준다**. 새로 정하게 하지 않는 이유는,
 * 잊은 사람이 원하는 건 "내가 뭘로 잠갔더라"이지 "또 하나 외우기"가 아니기 때문이다.
 *
 * 시도는 잠금 화면과 **같은 지연(backoff)** 을 공유한다 — 여기가 뚫리면 잠금이 뚫린 것이라,
 * 이쪽만 무제한으로 두면 문을 하나 열어두는 셈이다.
 */
export function HintRecovery({ method, onClose, onWiped }: HintRecoveryProps) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    void getLockHintQuestion().then(setQuestion);
    void getFailureState().then((state) => setBlocked(state.blockedUntil > Date.now()));
  }, []);

  const submit = async () => {
    if (checking || blocked || answer.trim().length === 0) {
      return;
    }
    setChecking(true);
    try {
      const secret = await revealSecretWithHint(answer);
      if (secret === null) {
        const state = await recordFailure();
        setBlocked(state.blockedUntil > Date.now());
        setError(t('lock.hint.wrongAnswer'));
        return;
      }
      // 답을 맞혔으면 지금까지의 실패는 털어준다 — 본인이라는 게 확인됐다.
      await resetFailures();
      setError(null);
      setRevealed(secret);
    } finally {
      setChecking(false);
    }
  };

  // 되돌릴 수 없는 동작이라 **두 번** 묻는다. 한 번은 실수로 누를 수 있다.
  const confirmWipe = () => {
    Alert.alert(t('lock.hint.wipeTitle'), t('lock.hint.wipeBody'), [
      { text: t('lock.hint.wipeNo'), style: 'cancel' },
      {
        text: t('lock.hint.wipeContinue'),
        style: 'destructive',
        onPress: () => {
          Alert.alert(t('lock.hint.wipeFinalTitle'), t('lock.hint.wipeFinalBody'), [
            { text: t('lock.hint.wipeNo'), style: 'cancel' },
            {
              text: t('lock.hint.wipeFinalConfirm'),
              style: 'destructive',
              onPress: () => {
                void wipeAllData()
                  .then(onWiped)
                  .catch(() => setError(t('lock.hint.wipeFailed')));
              },
            },
          ]);
        },
      },
    ]);
  };

  if (revealed !== null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {method === 'pin' ? t('lock.hint.revealPin') : t('lock.hint.revealPattern')}
        </Text>
        {method === 'pin' ? (
          <Text style={styles.pin}>{revealed}</Text>
        ) : (
          <PatternPreview pattern={revealed} />
        )}
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.primary}>
          <Text style={styles.primaryLabel}>{t('lock.hint.acknowledged')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('lock.hint.title')}</Text>
      {question === null ? (
        <Text style={styles.note}>{t('lock.hint.none')}</Text>
      ) : (
        <>
          <Text style={styles.question}>{hintQuestionText(question)}</Text>
          <TextField
            value={answer}
            onChangeText={(next) => {
              setError(null);
              setAnswer(next);
            }}
            placeholder={t('lock.setup.answerPlaceholder')}
            variant="boxed"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!blocked}
            style={styles.input}
          />
          {error !== null && <Text style={styles.error}>{error}</Text>}
          {blocked && <Text style={styles.error}>{t('lock.blockedMessage')}</Text>}
          <Pressable
            accessibilityRole="button"
            onPress={() => void submit()}
            disabled={blocked || answer.trim().length === 0}
            style={[
              styles.primary,
              (blocked || answer.trim().length === 0) && styles.primaryDisabled,
            ]}
          >
            <Text style={styles.primaryLabel}>{t('common.confirm')}</Text>
          </Pressable>
        </>
      )}

      <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
        <Text style={styles.cancel}>{t('lock.hint.goBack')}</Text>
      </Pressable>

      {/* 마지막 길. 눈에 띄지 않게 두되, 숨기지도 않는다 */}
      <Pressable accessibilityRole="button" onPress={confirmWipe} hitSlop={8}>
        <Text style={styles.wipe}>{t('lock.hint.forgotAnswer')}</Text>
      </Pressable>
    </View>
  );
}

/** 패턴은 숫자로 보여줘야 재현할 수 있다 — 지나온 순서를 점 위에 적는다. */
function PatternPreview({ pattern }: { pattern: string }) {
  const styles = useStyles(createStyles);
  const order = pattern.split('-').map((value) => Number(value));

  return (
    <View style={styles.grid}>
      {Array.from({ length: 9 }, (_, index) => {
        const step = order.indexOf(index);
        return (
          <View key={index} style={styles.gridCell}>
            <View style={[styles.gridDot, step >= 0 && styles.gridDotOn]}>
              {step >= 0 && <Text style={styles.gridStep}>{step + 1}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    container: {
      width: 300,
      alignItems: 'center',
      gap: spacing.md,
    },
    title: {
      ...typography.title,
      color: colors.text,
    },
    question: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: 'center',
    },
    note: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: 'center',
    },
    input: {
      width: '100%',
    },
    error: {
      ...typography.caption,
      color: colors.danger,
    },
    primary: {
      minWidth: 140,
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.accent,
    },
    primaryDisabled: {
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    primaryLabel: {
      ...typography.label,
      color: colors.textOnAccent,
    },
    cancel: {
      ...typography.label,
      color: colors.textMuted,
    },
    wipe: {
      ...typography.caption,
      color: colors.danger,
    },
    pin: {
      ...typography.display,
      color: colors.accent,
      letterSpacing: 8,
    },
    grid: {
      width: 180,
      height: 180,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    gridCell: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gridDot: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gridDotOn: {
      borderRadius: 17,
      borderWidth: 2,
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    gridStep: {
      ...typography.caption,
      color: colors.textOnAccent,
    },
  });
