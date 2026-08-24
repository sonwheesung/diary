import Bold from 'lucide-react-native/icons/bold';
import TextAlignCenter from 'lucide-react-native/icons/text-align-center';
import TextAlignEnd from 'lucide-react-native/icons/text-align-end';
import TextAlignStart from 'lucide-react-native/icons/text-align-start';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DEFAULT_ALIGN, DEFAULT_SIZE, TEXT_SIZES } from '@/features/diary/format';
import { inkColor } from '@/features/diary/text-style';
import type { TextAlign, TextFormat } from '@/features/diary/types';
import { INK_COLORS } from '@/features/diary/types';
import type { Palette } from '@/theme/palettes';
import { radius, spacing } from '@/theme/spacing';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { typography } from '@/theme/typography';

interface TextFormatSheetProps {
  value: TextFormat;
  onChange: (patch: TextFormat) => void;
}

/**
 * 문단 서식 고르개 (DIARY_SYSTEM §1.1 텍스트 서식).
 *
 * **고르는 즉시 본문에 적용된다.** 확인 버튼을 두고 모아서 적용하면 고른 결과를 못 보고
 * 결정해야 한다 — 서식은 눈으로 보고 고치는 물건이라 미리보기가 곧 기능이다.
 * 시트는 열린 채로 둔다(감정 시트가 고르면 닫히는 것과 반대) — 정렬·크기·색을 잇달아
 * 만지는 것이 보통이라 매번 다시 여는 것이 마찰이다.
 *
 * ⚠ 크기 라벨의 `H1`~`H4`는 **번역하지 않는다.** 문서 편집기에서 사실상 국제 기호이고,
 *   15개 언어로 옮기면 오히려 길이가 제각각이라 칸이 깨진다(§9.1 규칙 5).
 *   기본값만 `본문`처럼 언어를 탄다.
 */
export function TextFormatSheet({ value, onChange }: TextFormatSheetProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);

  const align = value.align ?? DEFAULT_ALIGN;
  const size = value.size ?? DEFAULT_SIZE;
  const bold = value.bold === true;
  const color = value.color ?? 'default';

  const aligns: { key: TextAlign; label: string; Icon: typeof Bold }[] = [
    { key: 'left', label: t('write.alignLeft'), Icon: TextAlignStart },
    { key: 'center', label: t('write.alignCenter'), Icon: TextAlignCenter },
    { key: 'right', label: t('write.alignRight'), Icon: TextAlignEnd },
  ];

  return (
    <View style={styles.root}>
      {/* 정렬 + 굵기 — 둘 다 아이콘 토글이라 한 줄에 둔다 */}
      <View style={styles.row}>
        {aligns.map(({ key, label, Icon }) => {
          const selected = align === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              onPress={() => onChange({ align: key })}
              style={[styles.iconButton, selected && styles.iconButtonOn]}
            >
              <Icon size={20} color={selected ? colors.textOnAccent : colors.text} />
            </Pressable>
          );
        })}

        <View style={styles.spacer} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('write.bold')}
          accessibilityState={{ selected: bold }}
          onPress={() => onChange({ bold: !bold })}
          style={[styles.iconButton, bold && styles.iconButtonOn]}
        >
          <Bold size={20} color={bold ? colors.textOnAccent : colors.text} />
        </Pressable>
      </View>

      {/* 크기 */}
      <View style={styles.row}>
        {TEXT_SIZES.map((option) => {
          const selected = size === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange({ size: option })}
              style={[styles.chip, selected && styles.chipOn]}
            >
              <Text style={[styles.chipLabel, selected && styles.chipLabelOn]}>
                {option === DEFAULT_SIZE ? t('write.sizeBody') : option.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 글자색 — 코드로 저장되고 실제 색은 팔레트가 준다(다크·스킨에서 자동으로 바뀐다) */}
      <View style={styles.row}>
        {INK_COLORS.map((option) => {
          const selected = color === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={t(`write.ink.${option}`)}
              accessibilityState={{ selected }}
              onPress={() => onChange({ color: option })}
              style={[
                styles.swatch,
                { backgroundColor: inkColor(option, colors) },
                // 배경색을 뒤에서 덮으므로 반지름을 다시 적는다(CLAUDE.md §10)
                { borderRadius: radius.full },
                selected && styles.swatchOn,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    root: {
      gap: spacing.lg,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.sm,
    },
    /** 정렬·굵기를 갈라놓는 빈칸. 굵기는 정렬과 다른 종류라 붙여두면 4지선다로 읽힌다 */
    spacer: {
      flex: 1,
    },
    iconButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    iconButtonOn: {
      backgroundColor: colors.accent,
      borderRadius: radius.md,
    },
    chip: {
      minWidth: 52,
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceMuted,
    },
    chipOn: {
      backgroundColor: colors.accent,
      borderRadius: radius.full,
    },
    chipLabel: {
      ...typography.label,
      color: colors.textMuted,
      // 행 안의 Text는 마지막 단어가 안 그려질 수 있다(CLAUDE.md §10)
      flexShrink: 1,
    },
    chipLabelOn: {
      color: colors.textOnAccent,
    },
    swatch: {
      width: 34,
      height: 34,
      borderWidth: 1,
      borderColor: colors.border,
    },
    /**
     * 고른 색은 **테두리로** 표시한다. 체크 아이콘을 얹으면 밝은 색에서 안 보이고
     * 어두운 색에서는 아이콘 색을 또 뒤집어야 한다 — 테두리는 어느 색에서도 읽힌다.
     */
    swatchOn: {
      borderWidth: 3,
      borderColor: colors.accent,
    },
  });
