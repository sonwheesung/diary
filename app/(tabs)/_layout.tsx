import { Tabs } from 'expo-router';
import Calendar from 'lucide-react-native/icons/calendar';
import FileText from 'lucide-react-native/icons/file-text';
import House from 'lucide-react-native/icons/house';
import Plus from 'lucide-react-native/icons/plus';
import Settings from 'lucide-react-native/icons/settings';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { fonts } from '@/theme/typography';

const ICON_SIZE = 22;

/** 가운데 작성 버튼. 탭이 아니라 화면을 띄우는 동작이라 탭 자체는 비워두고 눌림만 가로챈다. */
function WriteTabIcon() {
  const colors = useColors();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.writeButton}>
      <Plus size={26} color={colors.textOnAccent} strokeWidth={2.2} />
    </View>
  );
}

const TAB_BAR_CONTENT_HEIGHT = 60;

/**
 * 탭 라벨.
 *
 * 기본 라벨은 폭이 모자라면 **잘라버린다**(`Einstellun…`). 독일어 720px 기기에서 실제로 겪었다 —
 * 탭 다섯 칸은 폭이 고정인데 언어마다 단어 길이가 다르므로, 자르는 대신 **줄여서** 넣는다.
 * 언어를 하나 더 얹을 때마다 라벨 길이를 재는 대신 여기서 한 번에 막는다(CLAUDE.md §9.1).
 */
function TabLabel({ label, color }: { label: string; color: string }) {
  const styles = useStyles(createStyles);
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      // 이보다 더 줄면 읽히지 않는다. 여기까지 줄여도 안 들어가면 그 라벨이 너무 긴 것이다.
      minimumFontScale={0.75}
      style={[styles.tabLabel, { color }]}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  // 제스처 내비게이션 기기에서 탭바가 시스템 바 아래로 깔리는 것을 막는다.
  // 고정 높이를 쓰면 기기마다 어긋난다 — 인셋을 더해서 계산한다.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          { height: TAB_BAR_CONTENT_HEIGHT + insets.bottom, paddingBottom: insets.bottom },
        ],
        tabBarLabelStyle: styles.tabLabel,
        sceneStyle: { backgroundColor: colors.background },
        // 키보드가 올라오면 탭바를 숨긴다 — 안 그러면 입력창 위에 탭바가 겹쳐 보인다.
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarLabel: ({ color }) => <TabLabel label={t('tabs.home')} color={color} />,
          tabBarIcon: ({ color }) => <House size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tabs.calendar'),
          tabBarLabel: ({ color }) => <TabLabel label={t('tabs.calendar')} color={color} />,
          tabBarIcon: ({ color }) => <Calendar size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="write-tab"
        options={{
          title: '',
          tabBarIcon: () => <WriteTabIcon />,
          tabBarAccessibilityLabel: t('tabs.write'),
        }}
      />
      {/*
        ⚠ 이 자리는 **검색이었다**(2026-08-12 교체). 검색은 조각을 찾을 때만 여는 화면이라
          홈·모든 조각의 돋보기로 충분한데, 리포트는 **여기 없으면 존재를 모른다** —
          설정 안에 넣으면 구독의 세 기둥 중 하나가 안 보이는 상품이 된다
          (`docs/AI_REPORT_SYSTEM.md` §11.1).
      */}
      <Tabs.Screen
        name="report"
        options={{
          title: t('tabs.report'),
          tabBarLabel: ({ color }) => <TabLabel label={t('tabs.report')} color={color} />,
          tabBarIcon: ({ color }) => <FileText size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarLabel: ({ color }) => <TabLabel label={t('tabs.settings')} color={color} />,
          tabBarIcon: ({ color }) => <Settings size={ICON_SIZE} color={color} />,
        }}
      />
    </Tabs>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
    },
    tabLabel: {
      fontFamily: fonts.medium,
      fontSize: 11,
    },
    writeButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      // 탭바 위로 떠 보이게. Shadow 대신 위치로 위계를 만든다.
      marginBottom: 14,
    },
  });
