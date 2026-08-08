import { router, useLocalSearchParams } from 'expo-router';
import { Grid3x3, KeyRound, X } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import {
  HINT_QUESTION_IDS,
  hintQuestionText,
  PATTERN_MIN_POINTS,
  PIN_LENGTH,
  setLockHint,
  setLockSecret,
} from '@/features/lock/api/lock-store';
import type { HintQuestionId, LockMethod } from '@/features/lock/api/lock-store';
import { PatternGrid } from '@/features/lock/components/PatternGrid';
import { PinPad } from '@/features/lock/components/PinPad';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type Step = 'choose' | 'enter' | 'confirm' | 'hint';

/**
 * 잠금 설정 — 방식 고르기 → 입력 → 한 번 더 확인.
 *
 * 확인 단계를 빼지 않는다. 잘못 정한 PIN·패턴은 **자기 일기를 자기가 못 여는** 결과가 된다.
 */
export default function LockSetupScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const params = useLocalSearchParams<{ method?: string }>();
  const preset: LockMethod | null =
    params.method === 'pin' || params.method === 'pattern' ? params.method : null;

  const [step, setStep] = useState<Step>(preset === null ? 'choose' : 'enter');
  const [method, setMethod] = useState<LockMethod>(preset ?? 'pin');
  const [first, setFirst] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<HintQuestionId | null>(null);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const restart = (message: string) => {
    setError(message);
    setFirst('');
    setPin('');
    setStep('enter');
  };

  const submit = (secret: string) => {
    if (step === 'enter') {
      setFirst(secret);
      setPin('');
      setError(null);
      setStep('confirm');
      return;
    }
    if (secret !== first) {
      restart(t('lock.setup.mismatch'));
      return;
    }
    // 비밀은 힌트까지 받은 뒤에 한 번에 저장한다 — 중간에 나가면 힌트 없는 잠금이 남는다.
    setError(null);
    setStep('hint');
  };

  const saveAll = () => {
    if (saving || question === null || answer.trim().length === 0) {
      return;
    }
    setSaving(true);
    void (async () => {
      try {
        await setLockSecret(method, first);
        await setLockHint(question, answer, first);
        // 설정 화면으로 돌아간다. 방금 켠 잠금이 바로 덮치지 않게 게이트는 잠그지 않는다.
        router.back();
      } catch {
        setSaving(false);
        setError(t('lock.setup.saveFailed'));
      }
    })();
  };

  const onPinChange = (next: string) => {
    setError(null);
    setPin(next);
    if (next.length === PIN_LENGTH) {
      submit(next);
    }
  };

  const onPattern = (pattern: string) => {
    if (pattern.split('-').length < PATTERN_MIN_POINTS) {
      setError(t('lock.patternTooShort', { dots: PATTERN_MIN_POINTS }));
      return;
    }
    setError(null);
    submit(pattern);
  };

  const header = (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <X size={24} color={colors.text} />
      </Pressable>
    </View>
  );

  if (step === 'choose') {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
        <Text style={styles.title}>{t('lock.setup.chooseTitle')}</Text>
        <Text style={styles.subtitle}>{t('lock.setup.chooseNote')}</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMethod('pin');
            setStep('enter');
          }}
          style={styles.option}
        >
          <View style={styles.optionIcon}>
            <KeyRound size={20} color={colors.accent} />
          </View>
          <View style={styles.optionBody}>
            <Text style={styles.optionTitle}>PIN</Text>
            <Text style={styles.optionNote}>{t('lock.setup.pinNote', { digits: PIN_LENGTH })}</Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMethod('pattern');
            setStep('enter');
          }}
          style={styles.option}
        >
          <View style={styles.optionIcon}>
            <Grid3x3 size={20} color={colors.accent} />
          </View>
          <View style={styles.optionBody}>
            <Text style={styles.optionTitle}>{t('lock.methodPattern')}</Text>
            <Text style={styles.optionNote}>
              {t('lock.setup.patternNote', { dots: PATTERN_MIN_POINTS })}
            </Text>
          </View>
        </Pressable>

        {/* 과장하지 않는다 — 잠금은 UI 게이트이지 암호화가 아니다(CLAUDE.md §7.1) */}
        <Text style={styles.disclaimer}>
          {t('lock.setup.disclaimer')}
        </Text>
      </Screen>
    );
  }

  if (step === 'hint') {
    const ready = question !== null && answer.trim().length > 0;
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
        <Text style={styles.title}>{t('lock.setup.hintTitle')}</Text>
        <Text style={styles.subtitle}>
          {t('lock.setup.hintNote', {
            method: method === 'pin' ? t('lock.methodPin') : t('lock.methodPattern'),
          })}
        </Text>

        {/* 질문은 고르게 한다 — 자유 입력은 답이 그대로 적힌 질문을 만든다 */}
        <View style={styles.questionList}>
          {HINT_QUESTION_IDS.map((item) => {
            const selected = item === question;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setQuestion(item)}
                style={[styles.questionItem, selected && styles.questionItemOn]}
              >
                <Text style={[styles.questionLabel, selected && styles.questionLabelOn]}>
                  {hintQuestionText(item)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <TextField
          value={answer}
          onChangeText={setAnswer}
          placeholder={t('lock.setup.answerPlaceholder')}
          variant="boxed"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/*
          이 문은 답의 강도만큼만 강하다. 과장하지 말고 그대로 알려준다 — 사용자가
          '생일'처럼 남이 아는 답을 넣으면 잠금이 그만큼 약해진다.
        */}
        <Text style={styles.disclaimer}>
          {t('lock.setup.hintDisclaimer')}
        </Text>

        {error !== null && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !ready || saving }}
          onPress={saveAll}
          disabled={!ready || saving}
          style={[styles.primary, (!ready || saving) && styles.primaryDisabled]}
        >
          <Text style={[styles.primaryLabel, (!ready || saving) && styles.primaryLabelDisabled]}>
            {t('lock.setup.turnOn')}
          </Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} scroll={false} header={header}>
      <View style={styles.center}>
        <Text style={styles.title}>
          {step === 'enter' ? t('lock.setup.enterTitle') : t('lock.setup.confirmTitle')}
        </Text>
        <Text style={styles.subtitle}>
          {error ??
            (method === 'pin'
            ? t('lock.setup.pinNote', { digits: PIN_LENGTH })
            : t('lock.setup.patternNote', { dots: PATTERN_MIN_POINTS }))}
        </Text>

        <View style={styles.input}>
          {method === 'pin' ? (
            <PinPad value={pin} onChange={onPinChange} />
          ) : (
            <PatternGrid onComplete={onPattern} />
          )}
        </View>
      </View>
    </Screen>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    title: {
      ...typography.title,
      color: colors.text,
    },
    subtitle: {
      ...typography.body,
      color: colors.textMuted,
      marginTop: -spacing.sm,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    optionIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
    },
    optionBody: {
      flex: 1,
      gap: 2,
    },
    optionTitle: {
      ...typography.subtitle,
      color: colors.text,
    },
    optionNote: {
      ...typography.caption,
      color: colors.textMuted,
    },
    disclaimer: {
      ...typography.caption,
      color: colors.textMuted,
    },
    errorText: {
      ...typography.caption,
      color: colors.danger,
    },
    questionList: {
      gap: spacing.sm,
    },
    questionItem: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    questionItemOn: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft,
    },
    questionLabel: {
      ...typography.body,
      color: colors.text,
    },
    questionLabelOn: {
      color: colors.accent,
    },
    primary: {
      alignItems: 'center',
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
    primaryLabelDisabled: {
      color: colors.textMuted,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    input: {
      marginTop: spacing.xl,
    },
  });
