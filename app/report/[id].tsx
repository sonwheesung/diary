import { router, useLocalSearchParams } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import Flag from 'lucide-react-native/icons/flag';
import LifeBuoy from 'lucide-react-native/icons/life-buoy';
import Trash2 from 'lucide-react-native/icons/trash-2';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { deleteReport, getReport, type Report } from '@/features/ai/api/report-repository';
import { periodLabel } from '@/features/ai/labels';
import { formatDateTime, formatWeekNumber } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 리포트 상세.
 *
 * 🔴 **구독을 보지 않는다.** 발행된 리포트는 결제가 끝나도 계속 열린다
 *   (2026-08-12 사용자 결정, `docs/AI_REPORT_SYSTEM.md` §11.3).
 *
 * 🔴 **신고 버튼은 Play 생성형 AI 정책상 필수다.** 앱 안에서 생성물을 신고할 수 있어야 한다 —
 *   문서에 적어두는 것으로는 통과하지 않는다.
 */
export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void getReport(id)
      .then((row) => {
        if (alive) setReport(row);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const onDelete = () => {
    Alert.alert(t('report.delete'), t('report.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          void deleteReport(id).then(() => router.back());
        },
      },
    ]);
  };

  /*
   * 신고는 **기기 안에서 끝난다**(지금은). 보낼 곳이 없어서가 아니라, 보내려면 리포트 본문을
   * 서버로 다시 올려야 하는데 그것이 §5.1의 무저장 약속과 정면으로 충돌하기 때문이다.
   * ⏭ 문의(`/support`)에 사용자가 직접 붙여넣는 경로를 안내하는 편이 정직하다.
   */
  const onReport = () => {
    Alert.alert(t('report.reportIssue'), t('report.reported'), [
      { text: t('common.confirm') },
      { text: t('support.title'), onPress: () => router.push('/support') },
    ]);
  };

  const header = (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <ChevronLeft size={26} color={colors.text} />
      </Pressable>
      {/*
        ⚠ 목록 제목(`report.title`)을 재사용하지 않는다 — 영어에서 `Reports`가 되어
          **한 건짜리 화면에 복수형**이 뜬다. 한국어는 구분이 없어 눈에 안 띄는 종류의 오류다.
      */}
      <Text style={styles.headerTitle}>{t('report.detailTitle')}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('report.delete')}
        onPress={onDelete}
        hitSlop={12}
      >
        <Trash2 size={20} color={colors.textMuted} />
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} scroll={false} header={header}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentMuted} />
        </View>
      </Screen>
    );
  }

  if (report === null) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} scroll={false} header={header}>
        <View style={styles.center}>
          <Text style={styles.emptyBody}>{t('report.empty')}</Text>
        </View>
      </Screen>
    );
  }

  /*
   * ⚠ 주간은 조각을, 월간·연간은 **하위 리포트**를 센다. 한 문구로 뭉치면 연간 리포트가
   *   "조각 12개"로 뜨는데 그건 12개 조각을 읽었다는 뜻이 되어 사실과 다르다.
   */
  const countLabel =
    report.kind === 'weekly'
      ? t('report.sourceCount', { count: report.sourceCount })
      : t('report.subReportCount', { count: report.sourceCount });

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      {/*
        ⚠ 위기 배너가 **요약보다 위**에 온다. 아래에 두면 스크롤하지 않은 사람에게 안 보이고,
          그 사람이 정확히 이 배너가 필요한 사람이다(§3).
          🚫 진단하지 않는다 — "우울증" 같은 단정은 프롬프트가 금지하고 여기도 쓰지 않는다.
      */}
      {report.concern && (
        <View style={styles.concern}>
          <LifeBuoy size={20} color={colors.accent} />
          <View style={styles.concernBody}>
            <Text style={styles.concernTitle}>{t('report.concernTitle')}</Text>
            <Text style={styles.concernText}>{t('report.concernBody')}</Text>
            {/*
              ⚠ 상담 채널은 **언어별로 다르고, 확인한 언어에만 번호를 적는다**(§3).
                틀린 전화번호는 안 넣느니만 못하다 — 나머지 언어는 일반 문구가 들어 있다.
            */}
            <Text style={styles.concernChannel}>{t('report.concernChannel')}</Text>
          </View>
        </View>
      )}

      <View style={styles.meta}>
        <Text style={styles.period}>{periodLabel(report.kind, report.periodKey)}</Text>
        {report.kind === 'weekly' && (
          <Text style={styles.week}>{formatWeekNumber(report.periodKey)}</Text>
        )}
      </View>

      <Text style={styles.summary}>{report.summary}</Text>

      <View style={styles.footer}>
        <Text style={styles.disclaimer}>{t('report.disclaimer')}</Text>
        <Text style={styles.stamp}>
          {countLabel} · {formatDateTime(report.createdAt)}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onReport}
          style={styles.reportButton}
          hitSlop={8}
        >
          <Flag size={14} color={colors.textMuted} />
          <Text style={styles.reportLabel}>{t('report.reportIssue')}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    headerTitle: {
      ...typography.subtitle,
      color: colors.text,
      flexShrink: 1,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyBody: {
      ...typography.caption,
      color: colors.textMuted,
    },
    concern: {
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.accentSoft,
    },
    /*
     * `flex: 1`이 §10(행 안의 Text에 `flexShrink`)을 여기서 이미 지킨다 — 위기 배너의
     * 세 줄은 이 상자 안에 있어 폭이 확정된다. **`concernTitle`·`concernText`·`concernChannel`에
     * 따로 줄 필요가 없고, 이 `flex: 1`을 떼면 상담 채널 문구가 잘린다.**
     */
    concernBody: {
      flex: 1,
      gap: spacing.xs,
    },
    concernTitle: {
      ...typography.label,
      color: colors.text,
    },
    concernText: {
      ...typography.caption,
      /*
       * ⚠ `textMuted`가 아니라 `text`다. 배너 배경이 `accentSoft`(옅은 파랑)라 회색 글씨의
       *   대비가 눈에 띄게 떨어진다 — 흰 바탕을 전제한 색이기 때문이다.
       *   **이 배너는 가장 힘든 순간에 읽는 문장이라 흐리면 안 된다.**
       */
      color: colors.text,
    },
    concernChannel: {
      ...typography.caption,
      color: colors.accent,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    period: {
      ...typography.title,
      color: colors.text,
      flexShrink: 1,
    },
    week: {
      ...typography.caption,
      color: colors.textMuted,
      flexShrink: 1,
    },
    summary: {
      ...typography.body,
      color: colors.text,
      // 요약은 읽는 글이다. 목록보다 행간을 벌린다(기둥 2)
      lineHeight: 26,
    },
    footer: {
      gap: spacing.sm,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    disclaimer: {
      ...typography.caption,
      color: colors.textMuted,
    },
    stamp: {
      ...typography.caption,
      color: colors.textMuted,
    },
    reportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      alignSelf: 'flex-start',
      paddingVertical: spacing.sm,
    },
    reportLabel: {
      ...typography.caption,
      color: colors.textMuted,
      flexShrink: 1,
    },
  });
