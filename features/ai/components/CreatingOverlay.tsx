import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import type { Palette } from '@/theme/palettes';
import { radius, spacing } from '@/theme/spacing';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { typography } from '@/theme/typography';

/**
 * 리포트를 만드는 동안 덮는 층.
 *
 * 🔴 **버튼 라벨만 바뀌는 것으로는 부족했다.** 생성은 **5초 안팎**이 걸리는데
 *   (실측: 앱 5.3초 · 스크립트 4.0~6.6초) 그동안 화면이 그대로면 "눌린 건가?" 가 된다.
 *   그 자리에서 다시 누를 수는 없지만(버튼은 disabled) **눌렸는지 모르는 5초**가 남는다.
 *
 * 🔴 **이탈을 막는 이유가 따로 있다.** `createReport()`는 서버 왕복 **뒤에** 로컬에 저장한다.
 *   그 사이에 앱이 죽으면 **서버는 캡을 소모했는데 로컬에는 리포트가 없다** —
 *   재생성 버튼이 없고 회수 경로(`GET /api/v1/ai/report/:id`)도 아직 없어서
 *   그 기간을 통째로 잃는다(`docs/AI_REPORT_SYSTEM.md` §7).
 *   그래서 뒤로가기를 먹고, 바깥을 눌러도 닫히지 않는다.
 *
 * ⚠ **취소 버튼을 두지 않는다.** 이미 모델이 돌고 있어서 취소해도 돈은 나가고 캡은 준다 —
 *   누를 수 있게 해두면 "취소했는데 왜 캡이 줄었냐"가 된다.
 *
 * ⚠ 화려하게 만들지 않는다(기둥 2). 스피너 하나와 한 줄이면 충분하다.
 */
export function CreatingOverlay({ visible }: { visible: boolean }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      // 안드로이드 뒤로가기를 여기서 먹는다 — 아무것도 하지 않는 것이 의도다
      onRequestClose={() => undefined}
    >
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.title}>{t('report.creating')}</Text>
          <Text style={styles.note}>{t('report.creatingNote')}</Text>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    /*
     * 반투명 검정을 쓰지 않는다 — 라이트에서 뜬금없이 어둡고, 다크에서는 구분이 안 된다.
     * 팔레트의 배경색을 깔면 두 테마에서 같은 결로 읽힌다.
     */
    backdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      opacity: 0.98,
      paddingHorizontal: spacing.xl,
    },
    box: {
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.lg,
    },
    title: {
      ...typography.subtitle,
      color: colors.text,
      textAlign: 'center',
    },
    note: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
