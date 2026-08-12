import { router, useFocusEffect } from 'expo-router';
import Sparkles from 'lucide-react-native/icons/sparkles';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AdBanner } from '@/features/ads/components/AdBanner';
import { listReports, type Report } from '@/features/ai/api/report-repository';
import {
  canCreate,
  createReport,
  periodRange,
  targetPeriodKey,
  type CreateFail,
} from '@/features/ai/api/report-service';
import type { ReportKind } from '@/features/ai/types';
import { useEntitlementStore } from '@/features/entitlement/store';
import { formatDateRange, formatWeekNumber } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const KINDS: ReportKind[] = ['weekly', 'monthly', 'yearly'];

/**
 * AI 리포트 — 검색이 있던 탭 자리(2026-08-12 교체, `docs/AI_REPORT_SYSTEM.md` §11).
 *
 * 🔴 **게이팅은 [만들기] 버튼 하나에만 건다.** 이미 발행된 리포트는 구독이 끝나도 계속 열린다
 *   (2026-08-12 사용자 결정). 로컬에 있는 기록을 결제 상태로 잠그는 것은 백업이 켜지지 않은
 *   사람의 일기가 서버로 가지 않는다는 원칙과 같은 종류의 약속이다 — 만든 것은 그의 것이다.
 *   그래서 목록·상세·삭제는 `pro`를 보지 않고, 저장소도 구독을 모른다.
 */
export default function ReportScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const pro = useEntitlementStore((state) => state.pro);

  const [kind, setKind] = useState<ReportKind>('weekly');
  const [reports, setReports] = useState<Report[]>([]);
  const [blocked, setBlocked] = useState<CreateFail | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (target: ReportKind) => {
    const rows = await listReports(target);
    setReports(rows);
    // 버튼을 누르기 전에 만들 수 있는지 답해둔다 — 서버를 부르지 않으므로 공짜다(§6.3)
    const verdict = await canCreate(target);
    setBlocked(verdict.ok ? null : verdict.reason);
    setLoading(false);
  }, []);

  // 돌아올 때마다 다시 읽는다. 상세에서 지우고 왔는데 목록에 남아 있으면 안 된다
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setLoading(true);
      void load(kind).catch(() => {
        if (alive) setLoading(false);
      });
      return () => {
        alive = false;
      };
    }, [kind, load]),
  );

  const onCreate = async () => {
    setCreating(true);
    try {
      const result = await createReport(kind);
      if (result.ok) {
        await load(kind);
        router.push(`/report/${result.reportId}`);
        return;
      }
      Alert.alert(t('report.title'), failMessage(result.reason, t));
      // 실패 사유가 바뀌었을 수 있다(누가 다른 기기에서 만들었다든지) — 다시 판정한다
      await load(kind);
    } finally {
      setCreating(false);
    }
  };

  const header = (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('report.title')}</Text>
      <View style={styles.segments}>
        {KINDS.map((option) => {
          const active = option === kind;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setKind(option)}
              // ⚠ 배경만 바꿀 때 radius를 다시 적는다 — 안드로이드에서 앞 스타일의 반지름이 먹지 않는다
              style={[styles.segment, active && styles.segmentActive]}
            >
              <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                {t(`report.${option}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <Screen header={header} footer={<AdBanner />}>
      {loading ? (
        <ActivityIndicator color={colors.accentMuted} style={styles.loading} />
      ) : reports.length === 0 && !pro ? (
        // 하나도 없는 무료 사용자에게만 예시를 보인다. 하나라도 있으면 그건 그의 목록이다
        <LockedPreview />
      ) : (
        <>
          {reports.length === 0 ? (
            <Card>
              <Text style={styles.emptyTitle}>{t('report.empty')}</Text>
              <Text style={styles.emptyBody}>{t('report.emptyBody')}</Text>
            </Card>
          ) : (
            reports.map((report) => <ReportRow key={report.id} report={report} />)
          )}

          <View style={styles.createBox}>
            {/*
              캡을 **누르기 전에** 적는다(§6.3). 재생성 버튼은 없다 — 주 1회 캡과 정면으로 충돌한다.
            */}
            <Text style={styles.createNote}>
              {blocked === null ? t('report.onceAWeek') : failMessage(blocked, t)}
            </Text>
            <Button
              label={creating ? t('report.creating') : t('report.create')}
              fullWidth
              disabled={creating || blocked !== null || !pro}
              icon={<Sparkles size={18} color={colors.textOnAccent} />}
              onPress={() => void onCreate()}
            />
            {!pro && (
              <Pressable accessibilityRole="button" onPress={() => router.push('/subscribe')}>
                <Text style={styles.subscribeLink}>{t('report.seeSubscription')}</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </Screen>
  );
}

/** 기간 표기 — **날짜 범위가 주인공이고 주차는 부제다**(2026-08-12 사용자 결정) */
function periodLabel(report: Report): { primary: string; secondary: string | null } {
  const range = periodRange(report.kind, report.periodKey);
  if (range === null) {
    // 키가 깨졌으면 키를 그대로 보여준다. 조용히 빈칸을 두면 고장 난 줄 모른다
    return { primary: report.periodKey, secondary: null };
  }
  return {
    primary: formatDateRange(range.from, range.to),
    // 주차는 사람이 회상하는 단위가 아니지만 **문의가 왔을 때의 식별자**다(§11.2)
    secondary: report.kind === 'weekly' ? formatWeekNumber(report.periodKey) : null,
  };
}

function ReportRow({ report }: { report: Report }) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);
  const { primary, secondary } = periodLabel(report);

  return (
    <Card onPress={() => router.push(`/report/${report.id}`)}>
      <View style={styles.rowMeta}>
        <Text style={styles.rowPeriod}>{primary}</Text>
        {secondary !== null && <Text style={styles.rowWeek}>{secondary}</Text>}
      </View>
      <Text style={styles.rowSummary} numberOfLines={3}>
        {report.summary}
      </Text>
      <Text style={styles.rowCount}>
        {report.kind === 'weekly'
          ? t('report.sourceCount', { count: report.sourceCount })
          : t('report.subReportCount', { count: report.sourceCount })}
      </Text>
    </Card>
  );
}

/**
 * 무료 사용자에게 보이는 예시.
 *
 * ⚠ **"예시" 배지를 뗄 수 없게 붙인다.** 생성된 것처럼 보이는 텍스트를 자기 일기의 요약으로
 *   오해하면, 그건 우리가 읽지도 않은 내용을 읽은 척한 것이 된다.
 */
function LockedPreview() {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);
  // 예시에도 실제 형식의 날짜를 쓴다 — 언어마다 다른 표기를 여기서 한 번 보여주는 값도 있다
  const range = periodRange('weekly', targetPeriodKey('weekly'));

  return (
    <>
      <Text style={styles.lockedTitle}>{t('report.lockedTitle')}</Text>
      <Text style={styles.lockedBody}>{t('report.lockedBody')}</Text>

      <Card>
        <View style={styles.rowMeta}>
          <View style={styles.sampleBadge}>
            <Text style={styles.sampleBadgeText}>{t('report.sampleBadge')}</Text>
          </View>
          {range !== null && (
            <Text style={styles.rowPeriod}>{formatDateRange(range.from, range.to)}</Text>
          )}
        </View>
        <Text style={styles.rowSummary}>{t('report.sampleBody')}</Text>
      </Card>

      <Button label={t('report.seeSubscription')} fullWidth onPress={() => router.push('/subscribe')} />
      <Text style={styles.disclaimer}>{t('report.disclaimer')}</Text>
    </>
  );
}

/**
 * 실패 사유 → 사람이 읽는 문장.
 *
 * 사유마다 **다음에 할 일**이 다르므로 뭉뚱그리지 않는다. 서버가 준 사유는
 * `report.fail.*`에 코드 그대로 들어 있고(백업의 `backup.fail.*`과 같은 규약),
 * 앱에서만 나는 네 가지는 이미 화면에 쓰는 안내 문구를 재사용한다.
 */
function failMessage(reason: CreateFail, t: (key: string) => string): string {
  switch (reason) {
    // 이미 있다 = 이번 기간 몫을 썼다. 캡 안내와 같은 말이 정확하다
    case 'exists':
    case 'cap-exceeded':
      return t('report.onceAWeek');
    case 'empty':
      return t('report.noEntries');
    case 'need-weekly':
      return t('report.needWeekly');
    case 'need-monthly':
      return t('report.needMonthly');
    default:
      return t(`report.fail.${reason}`);
  }
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.md,
    },
    headerTitle: {
      ...typography.title,
      color: colors.text,
    },
    segments: {
      flexDirection: 'row',
      gap: spacing.xs,
      padding: 3,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderRadius: radius.sm,
    },
    segmentActive: {
      backgroundColor: colors.surface,
      borderRadius: radius.sm,
    },
    segmentLabel: {
      ...typography.label,
      color: colors.textMuted,
    },
    segmentLabelActive: {
      color: colors.text,
    },
    loading: {
      marginTop: spacing.lg,
    },
    emptyTitle: {
      ...typography.subtitle,
      color: colors.text,
    },
    emptyBody: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    rowMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    rowPeriod: {
      ...typography.subtitle,
      color: colors.text,
    },
    rowWeek: {
      ...typography.caption,
      color: colors.textMuted,
    },
    rowSummary: {
      ...typography.body,
      color: colors.text,
      marginTop: spacing.sm,
    },
    rowCount: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.sm,
    },
    createBox: {
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    createNote: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
    },
    subscribeLink: {
      ...typography.caption,
      color: colors.accent,
      textAlign: 'center',
      paddingVertical: spacing.sm,
    },
    lockedTitle: {
      ...typography.title,
      color: colors.text,
    },
    lockedBody: {
      ...typography.body,
      color: colors.textMuted,
      marginTop: -spacing.sm,
    },
    sampleBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
      backgroundColor: colors.accentSoft,
    },
    sampleBadgeText: {
      ...typography.caption,
      color: colors.accent,
    },
    disclaimer: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
