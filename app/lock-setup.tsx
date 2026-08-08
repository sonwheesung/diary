import { router, useLocalSearchParams } from 'expo-router';
import { Grid3x3, KeyRound, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import {
  PATTERN_MIN_POINTS,
  PIN_LENGTH,
  setLockHint,
  setLockSecret,
} from '@/features/lock/api/lock-store';
import type { LockMethod } from '@/features/lock/api/lock-store';
import { PatternGrid } from '@/features/lock/components/PatternGrid';
import { PinPad } from '@/features/lock/components/PinPad';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type Step = 'choose' | 'enter' | 'confirm' | 'hint';

/**
 * 잠금 설정 — 방식 고르기 → 입력 → 한 번 더 확인.
 *
 * 확인 단계를 빼지 않는다. 잘못 정한 PIN·패턴은 **자기 일기를 자기가 못 여는** 결과가 된다.
 */
export default function LockSetupScreen() {
  const params = useLocalSearchParams<{ method?: string }>();
  const preset: LockMethod | null =
    params.method === 'pin' || params.method === 'pattern' ? params.method : null;

  const [step, setStep] = useState<Step>(preset === null ? 'choose' : 'enter');
  const [method, setMethod] = useState<LockMethod>(preset ?? 'pin');
  const [first, setFirst] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
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
      restart('처음 입력한 것과 달라요. 다시 정해 주세요.');
      return;
    }
    // 비밀은 힌트까지 받은 뒤에 한 번에 저장한다 — 중간에 나가면 힌트 없는 잠금이 남는다.
    setError(null);
    setStep('hint');
  };

  const saveAll = () => {
    if (saving || question.trim().length === 0 || answer.trim().length === 0) {
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
        setError('저장하지 못했어요. 다시 시도해 주세요.');
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
      setError(`점을 ${PATTERN_MIN_POINTS}개 이상 이어주세요.`);
      return;
    }
    setError(null);
    submit(pattern);
  };

  const header = (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="닫기"
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
        <Text style={styles.title}>어떻게 잠글까요?</Text>
        <Text style={styles.subtitle}>나중에 설정에서 바꿀 수 있어요.</Text>

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
            <Text style={styles.optionNote}>숫자 {PIN_LENGTH}자리</Text>
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
            <Text style={styles.optionTitle}>패턴</Text>
            <Text style={styles.optionNote}>3×3, 점 {PATTERN_MIN_POINTS}개 이상</Text>
          </View>
        </Pressable>

        {/* 과장하지 않는다 — 잠금은 UI 게이트이지 암호화가 아니다(CLAUDE.md §7.1) */}
        <Text style={styles.disclaimer}>
          잠금은 화면을 가리는 기능이에요. 일기 파일 자체를 암호화하지는 않아요.
        </Text>
      </Screen>
    );
  }

  if (step === 'hint') {
    const ready = question.trim().length > 0 && answer.trim().length > 0;
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
        <Text style={styles.title}>잊었을 때를 위한 힌트</Text>
        <Text style={styles.subtitle}>
          답을 맞히면 {method === 'pin' ? 'PIN' : '패턴'}을 다시 보여드려요.
        </Text>

        <TextField
          value={question}
          onChangeText={setQuestion}
          placeholder="질문 (예: 처음 키운 강아지 이름은?)"
          variant="boxed"
        />
        <TextField
          value={answer}
          onChangeText={setAnswer}
          placeholder="답"
          variant="boxed"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/*
          이 문은 답의 강도만큼만 강하다. 과장하지 말고 그대로 알려준다 — 사용자가
          '생일'처럼 남이 아는 답을 넣으면 잠금이 그만큼 약해진다.
        */}
        <Text style={styles.disclaimer}>
          남이 못 맞힐 답으로 정해 주세요. 이 답을 아는 사람은 잠금을 열 수 있어요. 띄어쓰기와
          대소문자는 구분하지 않아요.
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
            잠금 켜기
          </Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} scroll={false} header={header}>
      <View style={styles.center}>
        <Text style={styles.title}>
          {step === 'enter' ? '새 잠금을 정해 주세요' : '한 번 더 입력해 주세요'}
        </Text>
        <Text style={styles.subtitle}>
          {error ??
            (method === 'pin' ? `숫자 ${PIN_LENGTH}자리` : `점 ${PATTERN_MIN_POINTS}개 이상`)}
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

const styles = StyleSheet.create({
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
