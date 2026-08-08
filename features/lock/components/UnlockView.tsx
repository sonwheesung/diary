import { Fingerprint, Lock } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  PATTERN_MIN_POINTS,
  PIN_LENGTH,
  authenticateWithBiometric,
  getFailureState,
  recordFailure,
  resetFailures,
  verifySecret,
} from '@/features/lock/api/lock-store';
import type { LockMethod } from '@/features/lock/api/lock-store';
import { HintRecovery } from '@/features/lock/components/HintRecovery';
import { PatternGrid } from '@/features/lock/components/PatternGrid';
import { PinPad } from '@/features/lock/components/PinPad';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface UnlockViewProps {
  method: LockMethod;
  biometric: boolean;
  onUnlocked: () => void;
}

/** 잠금 해제 화면. 라우트가 아니라 **덮개**다 — 뒤로가기나 딥링크로 지나칠 수 없어야 한다. */
export function UnlockView({ method, biometric, onUnlocked }: UnlockViewProps) {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [blockedUntil, setBlockedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [hintOpen, setHintOpen] = useState(false);
  const checkingRef = useRef(false);

  useEffect(() => {
    void getFailureState().then((state) => setBlockedUntil(state.blockedUntil));
  }, []);

  // 남은 시간을 보여주려면 초마다 다시 그려야 한다. 잠겨 있을 때만 돈다.
  useEffect(() => {
    if (blockedUntil <= Date.now()) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [blockedUntil]);

  const blocked = blockedUntil > now;
  const remainSeconds = blocked ? Math.ceil((blockedUntil - now) / 1000) : 0;

  const check = useCallback(
    async (secret: string) => {
      if (checkingRef.current || blocked) {
        return;
      }
      checkingRef.current = true;
      try {
        if (await verifySecret(secret)) {
          await resetFailures();
          onUnlocked();
          return;
        }
        const state = await recordFailure();
        setBlockedUntil(state.blockedUntil);
        setNow(Date.now());
        setPin('');
        setError(
          state.blockedUntil > Date.now()
            ? '여러 번 틀렸어요. 잠시 후 다시 시도해 주세요.'
            : '다시 시도해 주세요.',
        );
      } finally {
        checkingRef.current = false;
      }
    },
    [blocked, onUnlocked],
  );

  const tryBiometric = useCallback(async () => {
    if (blocked) {
      return;
    }
    if (await authenticateWithBiometric()) {
      await resetFailures();
      onUnlocked();
    }
  }, [blocked, onUnlocked]);

  // 생체를 켜뒀다면 들어오자마자 한 번 물어본다 — 매번 눌러서 부르게 하면 켠 의미가 없다.
  useEffect(() => {
    if (biometric) {
      void tryBiometric();
    }
  }, [biometric, tryBiometric]);

  const onPinChange = (next: string) => {
    setError(null);
    setPin(next);
    if (next.length === PIN_LENGTH) {
      void check(next);
    }
  };

  const onPattern = (pattern: string) => {
    setError(null);
    // 너무 짧은 패턴은 시도로 세지 않는다 — 손이 미끄러진 것까지 실패로 쌓으면 억울하다.
    if (pattern.split('-').length < PATTERN_MIN_POINTS) {
      setError(`점을 ${PATTERN_MIN_POINTS}개 이상 이어주세요.`);
      return;
    }
    void check(pattern);
  };

  if (hintOpen) {
    return (
      <View style={[styles.root, styles.rootCenter, { paddingTop: insets.top + spacing.xxl }]}>
        <HintRecovery
          method={method}
          onClose={() => {
            setHintOpen(false);
            // 되찾기에서 지연이 풀렸을 수 있다 — 돌아오면 다시 읽는다.
            void getFailureState().then((state) => {
              setBlockedUntil(state.blockedUntil);
              setNow(Date.now());
            });
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xxl }]}>
      <View style={styles.head}>
        <View style={styles.badge}>
          <Lock size={22} color={colors.accent} />
        </View>
        <Text style={styles.title}>조각이 잠겨 있어요</Text>
        <Text style={styles.subtitle}>
          {method === 'pin' ? 'PIN을 입력해 주세요' : '패턴을 그려주세요'}
        </Text>
      </View>

      <View style={styles.body}>
        {method === 'pin' ? (
          <PinPad value={pin} onChange={onPinChange} disabled={blocked} />
        ) : (
          <PatternGrid onComplete={onPattern} disabled={blocked} />
        )}
      </View>

      <View style={[styles.foot, { paddingBottom: insets.bottom + spacing.xl }]}>
        {blocked ? (
          <Text style={styles.blocked}>{remainSeconds}초 후에 다시 시도할 수 있어요</Text>
        ) : (
          error !== null && <Text style={styles.error}>{error}</Text>
        )}

        {biometric && !blocked && (
          <Pressable
            accessibilityRole="button"
            onPress={() => void tryBiometric()}
            style={styles.biometric}
          >
            <Fingerprint size={18} color={colors.accent} />
            <Text style={styles.biometricLabel}>생체인증으로 열기</Text>
          </Pressable>
        )}

        <Pressable accessibilityRole="button" onPress={() => setHintOpen(true)} hitSlop={8}>
          <Text style={styles.forgot}>잠금을 잊으셨나요?</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rootCenter: {
    justifyContent: 'center',
  },
  forgot: {
    ...typography.caption,
    color: colors.textMuted,
  },
  head: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  body: {
    alignItems: 'center',
  },
  foot: {
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 96,
  },
  error: {
    ...typography.label,
    color: colors.danger,
  },
  blocked: {
    ...typography.label,
    color: colors.danger,
  },
  biometric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  biometricLabel: {
    ...typography.label,
    color: colors.accent,
  },
});
