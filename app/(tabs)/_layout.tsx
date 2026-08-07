import { Tabs } from 'expo-router';
import { Calendar, House, Plus, Search, Settings } from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

const ICON_SIZE = 22;

/** 가운데 작성 버튼. 탭이 아니라 화면을 띄우는 동작이라 탭 자체는 비워두고 눌림만 가로챈다. */
function WriteTabIcon() {
  return (
    <View style={styles.writeButton}>
      <Plus size={26} color={colors.textOnAccent} strokeWidth={2.2} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <House size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ color }) => <Calendar size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="write-tab"
        options={{
          title: '',
          tabBarIcon: () => <WriteTabIcon />,
          tabBarAccessibilityLabel: '조각 쓰기',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '검색',
          tabBarIcon: ({ color }) => <Search size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => <Settings size={ICON_SIZE} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 88 : 68,
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
