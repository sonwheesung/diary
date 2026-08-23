import Check from 'lucide-react-native/icons/check';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { LANGUAGE_LABELS, LANGUAGE_ORDER } from '@/lib/i18n';
import type { LanguageMode } from '@/lib/i18n';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface LanguageSheetProps {
  visible: boolean;
  value: LanguageMode;
  onSelect: (next: LanguageMode) => void;
  onClose: () => void;
  /**
   * `'system'` 항목의 라벨을 갈아끼운다.
   *
   * ⚠ 같은 시트를 앱 언어와 **리포트 언어** 둘 다에 쓴다. 앱 언어에서 `system`은
   *   *"기기 설정을 따름"* 이지만 리포트 언어에서는 *"앱 언어와 같음"* 이다 —
   *   같은 값이 두 화면에서 다른 것을 가리키므로 라벨을 밖에서 준다
   *   (`docs/AI_REPORT_SYSTEM.md` §6.2).
   */
  systemLabel?: string;
  title?: string;
}

/**
 * 언어 선택 시트.
 *
 * 테마(3개)는 세그먼트로 늘어놓지만 언어는 **목록**이다. 15개를 가로로 늘어놓으면
 * 글자가 잘리고, 옆으로 밀어야 보이는 항목은 사실상 안 고른다(CLAUDE.md §10).
 *
 * 언어 이름은 **그 언어로** 적혀 있다(`LANGUAGE_LABELS`) — 그래서 이 목록만은
 * 현재 앱 언어와 무관하게 읽힌다. 영어를 못 읽는 사람도 자기 언어를 찾을 수 있어야 한다.
 */
export function LanguageSheet({
  visible,
  value,
  onSelect,
  onClose,
  systemLabel,
  title,
}: LanguageSheetProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);

  const options: LanguageMode[] = ['system', ...LANGUAGE_ORDER];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title ?? t('settings.languageSheet')}>
      {/* 목록이 길어 시트 높이 상한을 넘는다 — 안에서 스크롤한다 */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {options.map((option) => {
          const selected = option === value;
          const label =
            option === 'system'
              ? (systemLabel ?? t('settings.languageOptionSystem'))
              : LANGUAGE_LABELS[option];
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelect(option)}
              style={[styles.row, selected && styles.rowSelected]}
            >
              <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
              {/* 고른 것을 색으로만 알리지 않는다 — 색만으로는 색각 이상에서 구분되지 않는다 */}
              {selected && <Check size={18} color={colors.accent} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    list: {
      // 부모(시트)가 maxHeight를 갖고 있어 이 값이 남는 공간을 먹는다.
      flexGrow: 0,
    },
    listContent: {
      gap: spacing.xs,
      paddingBottom: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
    },
    rowSelected: {
      // 배경만 바꾸는 스타일에도 radius를 다시 적는다 — 안드로이드에서 앞 스타일의
      // borderRadius가 먹지 않고 사각형으로 그려진다(CLAUDE.md §10).
      borderRadius: radius.md,
      backgroundColor: colors.accentSoft,
    },
    label: {
      ...typography.body,
      color: colors.text,
      flexShrink: 1,
    },
    labelSelected: {
      color: colors.accent,
    },
  });
