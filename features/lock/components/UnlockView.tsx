import { Lock } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  PATTERN_MIN_POINTS,
  PIN_LENGTH,
  getFailureState,
  recordFailure,
  resetFailures,
  verifySecret,
} from '@/features/lock/api/lock-store';
import type { LockMethod } from '@/features/lock/api/lock-store';
import { HintRecovery } from '@/features/lock/components/HintRecovery';
import { PatternGrid } from '@/features/lock/components/PatternGrid';
import { PinPad } from '@/features/lock/components/PinPad';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface UnlockViewProps {
  method: LockMethod;
  onUnlocked: () => void;
  /** 초기화까지 갔을 때. 잠금이 사라지고 데이터도 비었으니 화면을 새로 그려야 한다 */
  onWiped: () => void;
}

/** 잠금 해제 화면. 라우트가 아니라 **덮개**다 — 뒤로가기나 딥링크로 지나칠 수 없어야 한다. */
export function UnlockView({ method, onUnlocked, onWiped }: UnlockViewProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
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
          /*
           * ⚠ 실패 횟수 초기화가 실패해도 **문은 열어준다.** 비밀은 이미 맞았다.
           * 여기서 던지면 올바른 PIN을 넣고도 앱이 안 열리고, 사용자에게 남는 유일한
           * 출구가 초기화(전부 삭제)다 — 부기 하나 때문에 일기를 잃게 할 수는 없다.
           * 못 지운 실패 횟수는 다음 성공에서 지워지고, 최악이라도 backoff가 한 번 더 걸릴 뿐이다.
           */
          await resetFailures().catch(() => undefined);
          onUnlocked();
          return;
        }
        const state = await recordFailure();
        setBlockedUntil(state.blockedUntil);
        setNow(Date.now());
        setPin('');
        setError(
          state.blockedUntil > Date.now()
            ? t('lock.blockedMessage')
            : t('lock.wrong'),
        );
      } finally {
        checkingRef.current = false;
      }
    },
    [blocked, onUnlocked, t],
  );

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
      setError(t('lock.patternTooShort', { dots: PATTERN_MIN_POINTS }));
      return;
    }
    void check(pattern);
  };

  if (hintOpen) {
    return (
      <View style={[styles.root, styles.rootCenter, { paddingTop: insets.top + spacing.xxl }]}>
        <HintRecovery
          method={method}
          onWiped={onWiped}
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
        <Text style={styles.title}>{t('lock.lockedTitle')}</Text>
        <Text style={styles.subtitle}>
          {method === 'pin' ? t('lock.enterPin') : t('lock.drawPattern')}
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
          <Text style={styles.blocked}>{t('lock.blockedCountdown', { seconds: remainSeconds })}</Text>
        ) : (
          error !== null && <Text style={styles.error}>{error}</Text>
        )}

        <Pressable accessibilityRole="button" onPress={() => setHintOpen(true)} hitSlop={8}>
          <Text style={styles.forgot}>{t('lock.forgot')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
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
  });
