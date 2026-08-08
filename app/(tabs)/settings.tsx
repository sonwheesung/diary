import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { Bell, ChevronRight, Fingerprint, Lock } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import {
  disableLock,
  isBiometricAvailable,
  setBiometricEnabled,
  setLockDelay,
} from '@/features/lock/api/lock-store';
import type { LockDelay } from '@/features/lock/api/lock-store';
import { useLockStore } from '@/features/lock/store';
import {
  SETTING_KEYS,
  getBoolSetting,
  setBoolSetting,
} from '@/features/settings/api/settings-store';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 설정.
 *
 * 지금 있는 것만 둔다 — 눌러도 아무 일도 없는 줄을 미리 깔지 않는다.
 * 잠금·다크모드는 각 기능이 완성될 때 이 화면에 붙는다.
 */
const DELAY_LABELS: Record<LockDelay, string> = {
  immediate: '즉시',
  '1m': '1분 후',
  '5m': '5분 후',
};

const DELAY_ORDER: LockDelay[] = ['immediate', '1m', '5m'];

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(false);
  // 잠금 설정은 게이트와 **같은 출처**를 본다. 각자 읽으면 켠 걸 게이트가 모른다.
  const lock = useLockStore((state) => state.config);
  const refreshLock = useLockStore((state) => state.refresh);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // 잠금 설정 화면에 다녀오면 상태가 바뀌어 있다 — 돌아올 때마다 다시 읽는다.
  useFocusEffect(
    useCallback(() => {
      void refreshLock();
      void isBiometricAvailable().then(setBiometricAvailable);
    }, [refreshLock]),
  );

  const toggleLock = (next: boolean) => {
    if (next) {
      router.push('/lock-setup');
      return;
    }
    Alert.alert('잠금을 끌까요?', '앱을 열 때 아무도 막지 않게 돼요.', [
      { text: '그대로 두기', style: 'cancel' },
      {
        text: '끄기',
        style: 'destructive',
        onPress: () => {
          void disableLock().then(() => void refreshLock());
        },
      },
    ]);
  };

  const toggleBiometric = (next: boolean) => {
    void setBiometricEnabled(next).then(() => void refreshLock());
  };

  const cycleDelay = () => {
    if (lock === null) {
      return;
    }
    const index = DELAY_ORDER.indexOf(lock.delay);
    const next = DELAY_ORDER[(index + 1) % DELAY_ORDER.length] ?? 'immediate';
    void setLockDelay(next).then(() => void refreshLock());
  };

  useEffect(() => {
    let alive = true;
    void getBoolSetting(SETTING_KEYS.notificationsEnabled, false)
      .then((value) => {
        if (alive) {
          setNotifications(value);
        }
      })
      .catch(() => {
        // 설정 하나를 못 읽었다고 화면이 죽으면 안 된다. 기본값으로 둔다.
      });
    return () => {
      alive = false;
    };
  }, []);

  const toggleNotifications = (next: boolean) => {
    // 먼저 화면을 바꾸고 저장한다 — 스위치가 손가락을 따라오지 않으면 고장 난 것처럼 느껴진다.
    setNotifications(next);
    void setBoolSetting(SETTING_KEYS.notificationsEnabled, next).catch(() => {
      setNotifications(!next);
    });
  };

  const version = Constants.expoConfig?.version ?? '—';

  return (
    <Screen>
      <Text style={styles.screenTitle}>설정</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 잠금</Text>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Lock size={18} color={colors.accent} />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>잠금 사용</Text>
            {/*
              잠금을 켜면 스크린샷이 막힌다. 켜고 나서 "왜 캡처가 안 되지"를 겪게 두지 않는다 —
              켜기 전에 미리 알려준다(CLAUDE.md §7.1 앱 스위처 가림).
            */}
            <Text style={styles.rowNote}>
              {lock?.enabled === true
                ? `${lock.method === 'pin' ? 'PIN' : '패턴'}으로 잠겨 있어요 · 미리보기와 스크린샷이 가려져요`
                : '앱을 열 때 잠금 화면을 띄워요. 켜면 최근 앱 미리보기와 스크린샷도 가려져요'}
            </Text>
          </View>
          <Switch
            value={lock?.enabled === true}
            onValueChange={toggleLock}
            trackColor={{ false: colors.border, true: colors.accentMuted }}
            thumbColor={lock?.enabled === true ? colors.accent : colors.surface}
          />
        </View>

        {lock?.enabled === true && (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/lock-setup')}
              style={styles.row}
            >
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>잠금 방식 바꾸기</Text>
                <Text style={styles.rowNote}>PIN · 패턴</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>

            <Pressable accessibilityRole="button" onPress={cycleDelay} style={styles.row}>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>잠기는 시점</Text>
                <Text style={styles.rowNote}>앱을 나갔다가 돌아왔을 때</Text>
              </View>
              <Text style={styles.rowValue}>{DELAY_LABELS[lock.delay]}</Text>
            </Pressable>

            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Fingerprint size={18} color={colors.accent} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>생체인증</Text>
                {/* 생체는 단독 수단이 될 수 없다 — 항상 PIN/패턴이 뒤를 받친다(§7.1) */}
                <Text style={styles.rowNote}>
                  {biometricAvailable
                    ? '실패하면 PIN·패턴으로 열 수 있어요'
                    : '이 기기에 등록된 생체정보가 없어요'}
                </Text>
              </View>
              <Switch
                value={lock.biometric}
                onValueChange={toggleBiometric}
                disabled={!biometricAvailable}
                trackColor={{ false: colors.border, true: colors.accentMuted }}
                thumbColor={lock.biometric ? colors.accent : colors.surface}
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림</Text>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Bell size={18} color={colors.accent} />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>기록 리마인더</Text>
            {/*
              화면만 만들고 기능은 하지 않기로 한 항목이다(CLAUDE.md §3).
              토글만 두고 아무 말도 안 하면 '켰는데 안 온다'는 오해가 생긴다 — 대놓고 적는다.
            */}
            <Text style={styles.rowNote}>아직 실제 알림은 보내지 않아요. 준비 중이에요.</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={toggleNotifications}
            trackColor={{ false: colors.border, true: colors.accentMuted }}
            thumbColor={notifications ? colors.accent : colors.surface}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <View style={styles.row}>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>버전</Text>
          </View>
          <Text style={styles.rowValue}>{version}</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    ...typography.title,
    color: colors.text,
    paddingTop: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...typography.body,
    color: colors.text,
  },
  rowNote: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rowValue: {
    ...typography.label,
    color: colors.textMuted,
  },
});
