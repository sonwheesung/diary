import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKeyboard } from '@/hooks/use-keyboard';
import type { Palette } from '@/theme/palettes';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * 아래에서 올라오는 시트. 날짜·감정·태그처럼 **잠깐 열고 닫는 선택**에 쓴다.
 *
 * 작성 화면을 스크롤 없이 한 화면에 담으려면 이런 선택지를 본문 아래에 늘어놓을 수 없다 —
 * 필요할 때만 덮어 띄운다(2026-08-08).
 */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboard();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* 바깥을 눌러 닫는 길을 항상 열어둔다 — 안드로이드 뒤로가기는 onRequestClose가 받는다 */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        style={styles.backdrop}
        onPress={onClose}
      />
      <View
        style={[
          styles.sheet,
          // 시트 안에 입력창이 있으면 키보드가 시트를 덮는다. 키보드 높이만큼 통째로 올린다.
          { paddingBottom: insets.bottom + spacing.lg, marginBottom: keyboard.height },
        ]}
      >
        <View style={styles.grabber} />
        {title !== undefined && <Text style={styles.title}>{title}</Text>}
        {children}
      </View>
    </Modal>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(31,42,68,0.35)',
    },
    sheet: {
      marginTop: 'auto',
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      gap: spacing.md,
    },
    grabber: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: spacing.xs,
    },
    title: {
      ...typography.subtitle,
      color: colors.text,
    },
  });
