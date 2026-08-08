import Constants from 'expo-constants';
import { Bell } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
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
export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(false);

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
