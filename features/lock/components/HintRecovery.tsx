import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components/TextField';
import {
  getFailureState,
  getLockHintQuestion,
  recordFailure,
  resetFailures,
  revealSecretWithHint,
} from '@/features/lock/api/lock-store';
import type { LockMethod } from '@/features/lock/api/lock-store';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface HintRecoveryProps {
  method: LockMethod;
  onClose: () => void;
}

/**
 * 힌트로 잠금 되찾기.
 *
 * 답이 맞으면 **원래 PIN·패턴을 그대로 보여준다**. 새로 정하게 하지 않는 이유는,
 * 잊은 사람이 원하는 건 "내가 뭘로 잠갔더라"이지 "또 하나 외우기"가 아니기 때문이다.
 *
 * 시도는 잠금 화면과 **같은 지연(backoff)** 을 공유한다 — 여기가 뚫리면 잠금이 뚫린 것이라,
 * 이쪽만 무제한으로 두면 문을 하나 열어두는 셈이다.
 */
export function HintRecovery({ method, onClose }: HintRecoveryProps) {
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
        setError('답이 맞지 않아요.');
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

  if (revealed !== null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{method === 'pin' ? '이 PIN이에요' : '이 패턴이에요'}</Text>
        {method === 'pin' ? (
          <Text style={styles.pin}>{revealed}</Text>
        ) : (
          <PatternPreview pattern={revealed} />
        )}
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.primary}>
          <Text style={styles.primaryLabel}>확인했어요</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>힌트로 찾기</Text>
      {question === null ? (
        <Text style={styles.note}>이 기기에는 힌트가 저장돼 있지 않아요.</Text>
      ) : (
        <>
          <Text style={styles.question}>{question}</Text>
          <TextField
            value={answer}
            onChangeText={(next) => {
              setError(null);
              setAnswer(next);
            }}
            placeholder="답"
            variant="boxed"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!blocked}
            style={styles.input}
          />
          {error !== null && <Text style={styles.error}>{error}</Text>}
          {blocked && (
            <Text style={styles.error}>여러 번 틀렸어요. 잠시 후 다시 시도해 주세요.</Text>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => void submit()}
            disabled={blocked || answer.trim().length === 0}
            style={[
              styles.primary,
              (blocked || answer.trim().length === 0) && styles.primaryDisabled,
            ]}
          >
            <Text style={styles.primaryLabel}>확인</Text>
          </Pressable>
        </>
      )}

      <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
        <Text style={styles.cancel}>돌아가기</Text>
      </Pressable>
    </View>
  );
}

/** 패턴은 숫자로 보여줘야 재현할 수 있다 — 지나온 순서를 점 위에 적는다. */
function PatternPreview({ pattern }: { pattern: string }) {
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

const styles = StyleSheet.create({
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
