import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import Bell from 'lucide-react-native/icons/bell';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import CloudUpload from 'lucide-react-native/icons/cloud-upload';
import Globe from 'lucide-react-native/icons/globe';
import Lock from 'lucide-react-native/icons/lock';
import Megaphone from 'lucide-react-native/icons/megaphone';
import MessageSquare from 'lucide-react-native/icons/message-square';
import Moon from 'lucide-react-native/icons/moon';
import Sun from 'lucide-react-native/icons/sun';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { AdBanner } from '@/features/ads/components/AdBanner';
import { useLockStore } from '@/features/lock/store';
import { getBackupState } from '@/features/backup/api/backup-state';
import { useNoticeStore } from '@/features/notice/store';
import { LanguageSheet } from '@/features/settings/components/LanguageSheet';
import { useLanguageStore } from '@/features/settings/language-store';
import {
  SETTING_KEYS,
  getBoolSetting,
  setBoolSetting,
} from '@/features/settings/api/settings-store';
import { LANGUAGE_LABELS } from '@/lib/i18n';
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
const THEME_OPTIONS: ThemeMode[] = ['system', 'light', 'dark'];
const THEME_KEYS: Record<ThemeMode, string> = {
  system: 'settings.themeOptionSystem',
  light: 'settings.themeOptionLight',
  dark: 'settings.themeOptionDark',
};

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const { mode, paletteId, setMode } = useTheme();
  const languageMode = useLanguageStore((state) => state.mode);
  const setLanguageMode = useLanguageStore((state) => state.setMode);
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);
  const unreadNotices = useNoticeStore((state) => state.unreadCount);
  const [notifications, setNotifications] = useState(false);
  // 잠금 설정은 게이트와 **같은 출처**를 본다. 각자 읽으면 켠 걸 게이트가 모른다.
  const lock = useLockStore((state) => state.config);
  const refreshLock = useLockStore((state) => state.refresh);

  /**
   * 백업을 켰는데 **복구 코드를 확인하지 않은** 상태.
   *
   * 그 사람은 백업이 정상으로 돌아가는 동안 앱이 "안전합니다"를 보여주지만,
   * 기기를 잃으면 되찾을 방법이 없다. 여기서 계속 알리지 않으면 알 길이 없다.
   */
  const [backupNeedsAttention, setBackupNeedsAttention] = useState(false);

  // 잠금·백업 설정 화면에 다녀오면 상태가 바뀌어 있다 — 돌아올 때마다 다시 읽는다.
  useFocusEffect(
    useCallback(() => {
      void refreshLock();
      void getBackupState().then((state) =>
        setBackupNeedsAttention(state.enabled && state.codeConfirmedAt === null),
      );
    }, [refreshLock]),
  );

  /*
   * 끄기·바꾸기 모두 **현재 비밀을 먼저 확인**한다(CLAUDE.md §7.1).
   *
   * 확인이 막는 것은 열람이 아니다 — 폰이 열려 있는 사람은 이미 일기를 본다.
   * 막는 것은 **그 사람이 PIN을 바꿔 주인을 잠가버리는 것**이다. 힌트까지 새로 정해지면
   * 되찾기 경로도 사라지고 남는 건 초기화(전부 삭제)뿐이다.
   */
  const toggleLock = (next: boolean) => {
    router.push(next ? '/lock-setup' : '/lock-setup?intent=disable');
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

      {/*
        백업은 잠금보다 위다 — "내 기록을 지키는 것" 중 사용자가 먼저 떠올리는 것이
        기기 분실이고, 잠금은 그 다음이다.
      */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sectionBackup')}</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/backup')}
          style={styles.row}
        >
          <View style={styles.rowIcon}>
            <CloudUpload size={18} color={colors.accent} />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{t('settings.backup')}</Text>
          </View>
          {/* 복구 코드를 확인 안 한 사람은 백업이 돌아도 되찾을 수 없다 — 배지로 계속 알린다 */}
          {backupNeedsAttention && <View style={styles.badge} />}
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>
      </View>

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
                    method: lock.method === 'pin' ? t('lock.methodPin') : t('lock.methodPattern'),
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
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/lock-setup?intent=change')}
            style={styles.row}
          >
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{t('settings.lockChange')}</Text>
              <Text style={styles.rowNote}>{t('settings.lockChangeNote')}</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
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

        {/*
          테마는 세 갈래라 늘어놓지만 언어는 15개다 — 세그먼트로는 글자가 잘린다.
          눌러서 목록을 여는 형태로 간다.
        */}
        <Pressable
          accessibilityRole="button"
          onPress={() => setLanguageSheetOpen(true)}
          style={styles.row}
        >
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
          {/* 지금 무엇으로 되어 있는지가 열기 전에 보여야 한다 */}
          <Text style={styles.rowValue}>
            {languageMode === 'system'
              ? t('settings.languageOptionSystem')
              : LANGUAGE_LABELS[languageMode]}
          </Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sectionSupport')}</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/notice')}
          style={styles.row}
        >
          <View style={styles.rowIcon}>
            <Megaphone size={18} color={colors.accent} />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{t('settings.notice')}</Text>
          </View>
          {/* 숫자를 쓰지 않는다 — 몇 개인지보다 '새 게 있다'가 필요한 정보다 */}
          {unreadNotices > 0 && <View style={styles.badge} />}
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support')}
          style={styles.row}
        >
          <View style={styles.rowIcon}>
            <MessageSquare size={18} color={colors.accent} />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{t('settings.support')}</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>
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

      <LanguageSheet
        visible={languageSheetOpen}
        value={languageMode}
        onSelect={(next) => {
          setLanguageMode(next);
          // 고르면 닫는다 — 언어는 한 번 고르면 끝나는 선택이다
          setLanguageSheetOpen(false);
        }}
        onClose={() => setLanguageSheetOpen(false)}
      />

      {/*
        ⚠ **개발 빌드에서만 보인다.** 실기기에서만 답이 나오는 세 가지를 재는 진단이다 —
          암호 처리량 · RN의 큰 바이너리 PUT · backupDatabaseAsync가 열린 커넥션을 받는가.
          결과는 `adb logcat -s ReactNativeJS`로 읽는다(화면에 띄우면 i18n이 필요하고,
          이건 사용자에게 보일 것이 아니다).
      */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEV</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void import('@/features/backup/api/device-check').then(({ runDeviceChecks }) =>
                runDeviceChecks(process.env.EXPO_PUBLIC_BACKUP_SERVER_URL ?? ''),
              );
            }}
            style={styles.row}
          >
            <View style={styles.rowIcon}>
              <CloudUpload size={18} color={colors.accent} />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>백업 실기기 점검 (logcat)</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sectionAbout')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/privacy')}
          style={styles.row}
        >
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{t('settings.privacy')}</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>

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
    badge: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.danger,
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
