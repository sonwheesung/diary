import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { Bell, ChevronRight, Fingerprint, Globe, Lock, Moon, Sun } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { AdBanner } from '@/features/ads/components/AdBanner';
import {
  disableLock,
  isBiometricAvailable,
  setBiometricEnabled,
  setLockDelay,
} from '@/features/lock/api/lock-store';
import type { LockDelay } from '@/features/lock/api/lock-store';
import { useLockStore } from '@/features/lock/store';
import { useLanguageStore } from '@/features/settings/language-store';
import {
  SETTING_KEYS,
  getBoolSetting,
  setBoolSetting,
} from '@/features/settings/api/settings-store';
import { LANGUAGES, LANGUAGE_LABELS } from '@/lib/i18n';
import type { LanguageMode } from '@/lib/i18n';
import type { Palette, ThemeMode } from '@/theme/palettes';
import { useColors, useTheme } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 설정.
 *
 * 지금 있는 것만 둔다 — 눌러도 아무 일도 없는 줄을 미리 깔지 않는다.
 * 잠금·다크모드는 각 기능이 완성될 때 이 화면에 붙는다.
 */
const DELAY_ORDER: LockDelay[] = ['immediate', '1m', '5m'];
const DELAY_KEYS: Record<LockDelay, string> = {
  immediate: 'settings.delayImmediate',
  '1m': 'settings.delay1m',
  '5m': 'settings.delay5m',
};

const THEME_OPTIONS: ThemeMode[] = ['system', 'light', 'dark'];
const THEME_KEYS: Record<ThemeMode, string> = {
  system: 'settings.themeOptionSystem',
  light: 'settings.themeOptionLight',
  dark: 'settings.themeOptionDark',
};

/**
 * 고를 수 있는 언어.
 *
 * `system`만 번역하고 나머지는 **그 언어 이름을 그 언어로** 적는다 — 영어 화면에서
 * '한국어'가 'Korean'으로 보이면 한국어 사용자가 자기 언어를 못 찾는다.
 */
const LANGUAGE_OPTIONS: LanguageMode[] = ['system', ...(Object.keys(LANGUAGES) as (keyof typeof LANGUAGES)[])];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const { mode, paletteId, setMode } = useTheme();
  const languageMode = useLanguageStore((state) => state.mode);
  const setLanguageMode = useLanguageStore((state) => state.setMode);
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
    Alert.alert(t('settings.lockOffTitle'), t('settings.lockOffBody'), [
      { text: t('common.keep'), style: 'cancel' },
      {
        text: t('settings.lockOffConfirm'),
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
    <Screen footer={<AdBanner />}>
      <Text style={styles.screenTitle}>{t('settings.title')}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sectionLock')}</Text>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Lock size={18} color={colors.accent} />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{t('settings.lockUse')}</Text>
            {/*
              잠금을 켜면 스크린샷이 막힌다. 켜고 나서 "왜 캡처가 안 되지"를 겪게 두지 않는다 —
              켜기 전에 미리 알려준다(CLAUDE.md §7.1 앱 스위처 가림).
            */}
            <Text style={styles.rowNote}>
              {lock?.enabled === true
                ? t('settings.lockOnNote', {
                    method:
                      lock.method === 'pin' ? t('lock.methodPin') : t('lock.methodPattern'),
                  })
                : t('settings.lockOffNote')}
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
                <Text style={styles.rowTitle}>{t('settings.lockChange')}</Text>
                <Text style={styles.rowNote}>{t('settings.lockChangeNote')}</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>

            <Pressable accessibilityRole="button" onPress={cycleDelay} style={styles.row}>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{t('settings.lockDelay')}</Text>
                <Text style={styles.rowNote}>{t('settings.lockDelayNote')}</Text>
              </View>
              <Text style={styles.rowValue}>{t(DELAY_KEYS[lock.delay])}</Text>
            </Pressable>

            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Fingerprint size={18} color={colors.accent} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{t('settings.biometric')}</Text>
                {/* 생체는 단독 수단이 될 수 없다 — 항상 PIN/패턴이 뒤를 받친다(§7.1) */}
                <Text style={styles.rowNote}>
                  {biometricAvailable
                    ? t('settings.biometricAvailable')
                    : t('settings.biometricUnavailable')}
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
        <Text style={styles.sectionTitle}>{t('settings.sectionDisplay')}</Text>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            {paletteId === 'dark' ? (
              <Moon size={18} color={colors.accent} />
            ) : (
              <Sun size={18} color={colors.accent} />
            )}
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{t('settings.theme')}</Text>
            <Text style={styles.rowNote}>
              {mode === 'system' ? t('settings.themeSystem') : t('settings.themeManual')}
            </Text>
          </View>
        </View>

        {/* 세 갈래뿐이라 시트를 여는 것보다 늘어놓는 편이 빠르다 */}
        <View style={styles.segmented}>
          {THEME_OPTIONS.map((option) => {
            const selected = option === mode;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setMode(option)}
                style={[styles.segment, selected && styles.segmentOn]}
              >
                <Text style={[styles.segmentLabel, selected && styles.segmentLabelOn]}>
                  {t(THEME_KEYS[option])}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Globe size={18} color={colors.accent} />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{t('settings.language')}</Text>
            <Text style={styles.rowNote}>
              {languageMode === 'system'
                ? t('settings.languageSystem')
                : t('settings.languageManual')}
            </Text>
          </View>
        </View>

        {/* 테마와 같은 모양으로 둔다 — 같은 성질의 선택은 같게 생겨야 배울 게 없다 */}
        <View style={styles.segmented}>
          {LANGUAGE_OPTIONS.map((option) => {
            const selected = option === languageMode;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setLanguageMode(option)}
                style={[styles.segment, selected && styles.segmentOn]}
              >
                <Text style={[styles.segmentLabel, selected && styles.segmentLabelOn]}>
                  {option === 'system'
                    ? t('settings.languageOptionSystem')
                    : LANGUAGE_LABELS[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sectionNotifications')}</Text>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Bell size={18} color={colors.accent} />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{t('settings.reminder')}</Text>
            {/*
              화면만 만들고 기능은 하지 않기로 한 항목이다(CLAUDE.md §3).
              토글만 두고 아무 말도 안 하면 '켰는데 안 온다'는 오해가 생긴다 — 대놓고 적는다.
            */}
            <Text style={styles.rowNote}>{t('settings.reminderNote')}</Text>
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
        <Text style={styles.sectionTitle}>{t('settings.sectionAbout')}</Text>
        <View style={styles.row}>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{t('settings.version')}</Text>
          </View>
          <Text style={styles.rowValue}>{version}</Text>
        </View>
      </View>
    </Screen>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
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
    segmented: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    segmentOn: {
      borderRadius: radius.md,
      backgroundColor: colors.accent,
    },
    segmentLabel: {
      ...typography.label,
      color: colors.textMuted,
    },
    segmentLabelOn: {
      color: colors.textOnAccent,
    },
  });
