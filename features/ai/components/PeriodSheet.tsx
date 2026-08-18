import Check from 'lucide-react-native/icons/check';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import type { PeriodOption } from '@/features/ai/api/report-service';
import { periodLabel } from '@/features/ai/labels';
import type { ReportKind } from '@/features/ai/types';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface PeriodSheetProps {
  visible: boolean;
  kind: ReportKind;
  options: PeriodOption[];
  value: string;
  onSelect: (next: string) => void;
  onClose: () => void;
}

/**
 * 리포트 기간 선택 시트 (`docs/AI_REPORT_SYSTEM.md` §6.4).
 *
 * 백필이 열리기 전에는 기간이 하나뿐이라 선택 UI가 없었다. 지금은 지평이 최대 2년이라
 * **목록**이어야 한다 — `LanguageSheet`와 같은 이유다(CLAUDE.md §10: 가로 스크롤로
 * 선택지를 숨기지 않는다. 옆으로 밀어야 보이는 항목은 사실상 안 고른다).
 *
 * 🔴 **고를 수 없는 기간도 지우지 않고 사유와 함께 남긴다.** 목록에서 사라지면
 *   *"그 주가 왜 없지"* 가 되고, 사람은 없는 것보다 **이유 있는 것**을 훨씬 잘 받아들인다.
 *   특히 `exists`(이미 만듦)는 실패가 아니라 성공의 흔적이라 보이는 편이 낫다.
 */
export function PeriodSheet({
  visible,
  kind,
  options,
  value,
  onSelect,
  onClose,
}: PeriodSheetProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('report.periodSheet')}>
      {/* 지평이 최대 105주다 — 시트 상한을 훌쩍 넘으므로 안에서 스크롤한다 */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {options.map((option) => {
          const selected = option.key === value;
          const disabled = option.blocked !== null;
          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => onSelect(option.key)}
              style={[styles.row, selected && styles.rowSelected]}
            >
              <View style={styles.rowBody}>
                <Text style={[styles.label, disabled && styles.labelDim]}>
                  {periodLabel(kind, option.key)}
                </Text>
                {/*
                  ⚠ 사유를 **한 줄로 같이** 보여준다. 회색으로만 흐려 놓으면 왜 못 고르는지
                    모르는 채로 계속 눌러본다 — 못 누르는 것과 이유 없는 것은 다르다.
                */}
                <Text style={styles.meta}>{metaText(option, kind, t)}</Text>
              </View>
              {/* 고른 것을 색으로만 알리지 않는다 — 색각 이상에서 구분되지 않는다 */}
              {selected && <Check size={18} color={colors.accent} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

/**
 * 한 줄의 부제 — 고를 수 있으면 **무엇이 들어가는지**, 없으면 **왜 못 고르는지**.
 *
 * ⚠ 개수 문구에 복수형을 쓰지 않는다(`조각 5개` / `Entries: 5`). 6개 언어가 수 일치를
 *   요구해 `1 entries`가 났던 적이 있고, `check:i18n`은 그 종류를 못 잡는다
 *   (`docs/I18N_SYSTEM.md` §4.5).
 */
function metaText(
  option: PeriodOption,
  kind: ReportKind,
  t: (key: string, opts?: Record<string, string | number>) => string,
): string {
  switch (option.blocked) {
    case null:
      return kind === 'weekly'
        ? t('report.sourceCount', { count: option.count })
        : t('report.periodSubs', { count: option.count, total: option.total });
    case 'exists':
      return t('report.periodMade');
    case 'empty':
      return t('report.periodNoEntries');
    case 'too-early':
      return t('report.periodTooEarly');
    default:
      // need-weekly · need-monthly — 하위가 하나도 없다. `0/5`가 그 자체로 설명이라
      // 키를 따로 만들지 않는다. 못 고르는 것은 흐린 글자와 `disabled`가 이미 말한다
      return t('report.periodSubs', { count: option.count, total: option.total });
  }
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    list: {
      // 부모(시트)가 maxHeight를 갖고 있어 이 값이 남는 공간을 먹는다
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
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
    },
    rowSelected: {
      // 배경만 바꾸는 스타일에도 radius를 다시 적는다 — 안드로이드에서 앞 스타일의
      // borderRadius가 먹지 않고 사각형으로 그려진다(CLAUDE.md §10)
      borderRadius: radius.md,
      backgroundColor: colors.accentSoft,
    },
    rowBody: {
      flex: 1,
      gap: 2,
    },
    label: {
      ...typography.body,
      color: colors.text,
    },
    labelDim: {
      color: colors.textMuted,
    },
    meta: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });
