import { router, useLocalSearchParams } from 'expo-router';
import Grid3x3 from 'lucide-react-native/icons/grid-3x3';
import KeyRound from 'lucide-react-native/icons/key-round';
import X from 'lucide-react-native/icons/x';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import {
  HINT_QUESTION_IDS,
  disableLock,
  hintQuestionText,
  PATTERN_MIN_POINTS,
  PIN_LENGTH,
  setLockHint,
  setLockSecret,
} from '@/features/lock/api/lock-store';
import type { HintQuestionId, LockMethod } from '@/features/lock/api/lock-store';
import { PatternGrid } from '@/features/lock/components/PatternGrid';
import { PinPad } from '@/features/lock/components/PinPad';
import { UnlockView } from '@/features/lock/components/UnlockView';
import { useLockStore } from '@/features/lock/store';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type Step = 'verify' | 'choose' | 'enter' | 'confirm' | 'hint';

/**
 * 잠금 설정 — (현재 비밀 확인 →) 방식 고르기 → 입력 → 한 번 더 확인 → 힌트.
 *
 * 확인 단계를 빼지 않는다. 잘못 정한 PIN·패턴은 **자기 일기를 자기가 못 여는** 결과가 된다.
 *
 * `intent`로 세 갈래다(CLAUDE.md §7.1):
 * - 없음      신규 설정 — 바로 방식 고르기
 * - `change`  비밀 바꾸기 — **현재 비밀을 먼저 통과**해야 한다
 * - `disable` 잠금 끄기  — 마찬가지. 통과하면 끄고 나간다
 *
 * 확인이 막는 것은 열람이 아니다(폰이 열려 있으면 이미 다 본다). 막는 것은 **남이 비밀을 바꿔
 * 주인을 잠가버리는 것**이다 — 힌트까지 새로 정해지면 되찾기 경로도 사라지고 초기화만 남는다.
 */
export default function LockSetupScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const params = useLocalSearchParams<{ method?: string; intent?: string }>();
  const preset: LockMethod | null =
    params.method === 'pin' || params.method === 'pattern' ? params.method : null;
  const intent = params.intent === 'change' || params.intent === 'disable' ? params.intent : null;

  const lock = useLockStore((state) => state.config);
  const refreshLock = useLockStore((state) => state.refresh);
  // 잠금이 없는데 확인을 요구하면 열 방법이 없다 — 켜져 있을 때만 verify로 시작한다
  const needsVerify = intent !== null && lock?.enabled === true && lock.method !== null;

  const [step, setStep] = useState<Step>(
    needsVerify ? 'verify' : preset === null ? 'choose' : 'enter',
  );
  const [method, setMethod] = useState<LockMethod>(preset ?? 'pin');
  /* 뒤로가기 콜백은 등록 시점의 step에 묶인다 — ref로 지금 값을 본다 */
  const stepRef = useRef(step);
  stepRef.current = step;
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
        /*
         * ⚠ **힌트를 먼저, 비밀을 나중에** 저장한다(§7.1).
         *
         * 반대로 하면 힌트 저장이 실패했을 때 *되찾을 수 없는 잠금*이 남는다 — 잊으면 초기화뿐이다.
         * 이 순서면 실패해도 잠금이 안 켜질 뿐이라 무해하다(`getLockConfig`는 해시 유무로 판정한다).
         *
         * 비밀을 **바꿀 때도** 힌트를 반드시 다시 봉인한다. 힌트는 옛 비밀을 XOR해 보관하므로
         * 새 비밀만 저장하면 되찾기가 **옛 PIN을 보여준다.**
         */
        await setLockHint(question, answer, first);
        await setLockSecret(method, first);
        await refreshLock();
        // 설정 화면으로 돌아간다. 방금 켠 잠금이 바로 덮치지 않게 게이트는 잠그지 않는다.
        router.back();
      } catch {
        setSaving(false);
        setError(t('lock.setup.saveFailed'));
      }
    })();
  };

  /** 현재 비밀을 통과했다. 끄기면 여기서 끝, 바꾸기면 새 비밀을 받으러 간다. */
  const onVerified = () => {
    if (intent === 'disable') {
      void disableLock()
        .then(() => refreshLock())
        .then(() => router.back());
      return;
    }
    setStep('choose');
  };

  /**
   * 나가기. `enter` 이후에 나가면 **아무것도 저장되지 않는다** — 조용히 실패하면
   * 사용자는 잠금을 켠 줄 안다. 한 번 물어보고 나간다.
   */
  const leave = useCallback(() => {
    if (stepRef.current === 'verify' || stepRef.current === 'choose') {
      router.back();
      return;
    }
    Alert.alert(t('lock.setup.abandonTitle'), t('lock.setup.abandonBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('lock.setup.abandonConfirm'), style: 'destructive', onPress: () => router.back() },
    ]);
  }, [t]);

  /*
   * 안드로이드 하드웨어 뒤로가기도 같은 문을 지나야 한다.
   * X만 막으면 뒤로가기로 그냥 빠져나가고, 그러면 물어보는 의미가 없다.
   */
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      leave();
      return true; // 기본 동작(그냥 나가기)을 막는다
    });
    return () => subscription.remove();
  }, [leave]);

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
        onPress={leave}
        hitSlop={12}
      >
        <X size={24} color={colors.text} />
      </Pressable>
    </View>
  );

  if (step === 'verify' && lock?.method != null) {
    /*
     * 잠금 화면을 그대로 쓴다. 같은 화면이어야 "지금 뭘 넣으라는 거지"를 겪지 않고,
     * **backoff도 자동으로 공유**된다 — 설정이 잠금 화면보다 약한 문이 되면 안 된다(§7.1).
     */
    return (
      <UnlockView
        method={lock.method}
        onUnlocked={onVerified}
        onWiped={() => {
          // 여기서 초기화까지 갔으면 잠금도 데이터도 없다. 더 물을 것이 없다.
          void refreshLock().then(() => router.back());
        }}
      />
    );
  }

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
        <Text style={styles.disclaimer}>{t('lock.setup.disclaimer')}</Text>
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
        <Text style={styles.disclaimer}>{t('lock.setup.hintDisclaimer')}</Text>

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
