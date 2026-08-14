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
  targetPeriodKey,
  weeklyGaps,
  type CreateFail,
} from '@/features/ai/api/report-service';
import { hasAiConsent } from '@/features/ai/consent';
import { periodLabel } from '@/features/ai/labels';
import type { ReportKind } from '@/features/ai/types';
import { useEntitlementStore } from '@/features/entitlement/store';
import { formatWeekNumber, formatWeekdayList } from '@/lib/format';
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
    /*
     * 🔴 **동의를 서버가 아니라 여기서 막는다.** 서버가 막으려면 동의 사실을 서버가
     *   알아야 하고, 그러면 "누가 언제 무엇에 동의했는지"가 서버에 하나 더 쌓인다.
     *   동의는 기기에서 받고 기기에서 기록한다 — 전송을 시작하는 주체가 앱이기 때문이다.
     *
     * ⚠ 동의가 없으면 **아무것도 보내지 않고** 동의 화면으로 보낸다. 돌아오면 다시 누른다 —
     *   자동으로 이어서 만들지 않는다. 동의 직후의 자동 실행은 "동의를 눌렀더니 뭔가
     *   일어났다"가 되어, 무엇에 동의했는지 확인할 틈을 없앤다.
     */
    if (!(await hasAiConsent())) {
      router.push('/ai-consent');
      return;
    }
    /*
     * 🔴 **빠진 날이 있으면 한 번 묻는다**(§10.1). 주 1회 캡이고 재생성 버튼이 없어서,
     *   조각 1개짜리 주를 모르고 만들면 **그 주를 통째로 잃는다** — 나중에 캘린더에서
     *   과거 날짜를 채워도 리포트는 1개만 본 채로 굳는다.
     *
     * ⚠ 막지 않고 묻기만 한다. 6일을 비운 주도 그 사람의 한 주다.
     * ⚠ 주간에만. 월간·연간은 하위 리포트가 입력이라 "빠진 날"이 없다.
     */
    if (kind === 'weekly') {
      const gaps = await weeklyGaps().catch(() => [] as string[]);
      if (gaps.length > 0 && !(await confirmGaps(gaps, t))) {
        return;
      }
    }
    setCreating(true);
    try {
      const result = await createReport(kind);
      if (result.ok) {
        await load(kind);
        router.push(`/report/${result.reportId}`);
        return;
      }
      Alert.alert(t('report.title'), failMessage(result.reason, kind, t));
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
              {/*
                ⚠ 빈 화면 설명이 **종류마다 다르다.** 월간 탭에서 "한 주가 지나면…"을 보여주면
                  무엇을 기다려야 하는지 틀리게 알려주는 것이다 — 월간은 주간 리포트를 기다린다.
              */}
              <Text style={styles.emptyBody}>{t(`report.empty${capitalize(kind)}`)}</Text>
            </Card>
          ) : (
            reports.map((report) => <ReportRow key={report.id} report={report} />)
          )}

          <View style={styles.createBox}>
            {/*
              **무엇이 만들어지는지를 먼저 적는다.** 캡만 적으면 "몇 월 리포트가 나오는 건데?"에
              답하지 못한다. 재생성 버튼은 없다 — 주 1회 캡과 정면으로 충돌한다(§6.3).
            */}
            <Text style={styles.createNote}>
              {blocked === null
                ? t('report.willCreate', { period: periodLabel(kind, targetPeriodKey(kind)) })
                : failMessage(blocked, kind, t)}
            </Text>
            {/* 주 1회 캡은 **주간에만** 해당한다. 월간·연간에 붙이면 거짓말이다 */}
            {blocked === null && kind === 'weekly' && (
              <Text style={styles.createNote}>{t('report.onceAWeek')}</Text>
            )}
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

/**
 * *"이 날들엔 조각이 없어요. 그래도 만들까요?"* — 누른 사람이 답할 때까지 기다린다.
 *
 * ⚠ `Alert`는 콜백이라 Promise로 감싼다. `onDismiss`(안드로이드 바깥 탭·뒤로가기)도
 *   반드시 받는다 — 안 받으면 대화상자를 흘려보낸 사람에게서 `onCreate`가 영영 안 끝나고
 *   버튼이 죽은 채로 남는다.
 *
 * ⚠ 확인 버튼은 `report.create`("리포트 만들기")를 쓴다. *"확인"* 으로는
 *   무엇에 동의하는지가 안 보인다.
 */
function confirmGaps(gaps: string[], t: (key: string, opts?: Record<string, string>) => string) {
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      t('report.title'),
      t('report.gapConfirm', { days: formatWeekdayList(gaps) }),
      [
        { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
        { text: t('report.create'), onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/** `weekly` → `Weekly` — i18n 키(`report.emptyWeekly`)를 종류에서 만든다 */
function capitalize(kind: ReportKind): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function ReportRow({ report }: { report: Report }) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);

  return (
    <Card onPress={() => router.push(`/report/${report.id}`)}>
      <View style={styles.rowMeta}>
        <Text style={styles.rowPeriod}>{periodLabel(report.kind, report.periodKey)}</Text>
        {/* 주차는 사람이 회상하는 단위가 아니지만 **문의가 왔을 때의 식별자**다(§11.2) */}
        {report.kind === 'weekly' && (
          <Text style={styles.rowWeek}>{formatWeekNumber(report.periodKey)}</Text>
        )}
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
  const label = periodLabel('weekly', targetPeriodKey('weekly'));

  return (
    <>
      <Text style={styles.lockedTitle}>{t('report.lockedTitle')}</Text>
      <Text style={styles.lockedBody}>{t('report.lockedBody')}</Text>

      <Card>
        <View style={styles.rowMeta}>
          <View style={styles.sampleBadge}>
            <Text style={styles.sampleBadgeText}>{t('report.sampleBadge')}</Text>
          </View>
          <Text style={styles.rowPeriod}>{label}</Text>
        </View>
        <Text style={styles.rowSummary}>{t('report.sampleBody')}</Text>
      </Card>

      <Button
        label={t('report.seeSubscription')}
        fullWidth
        onPress={() => router.push('/subscribe')}
      />
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
function failMessage(
  reason: CreateFail,
  kind: ReportKind,
  t: (key: string, opts?: Record<string, string>) => string,
): string {
  const period = periodLabel(kind, targetPeriodKey(kind));
  switch (reason) {
    // ⚠ "주에 한 번"으로 뭉치지 않는다 — 월간 탭에서 그 문장은 거짓이다.
    //   무엇이 이미 있는지를 기간으로 말해야 다음에 할 일이 분명해진다
    case 'exists':
    case 'cap-exceeded':
      return t('report.alreadyExists', { period });
    case 'empty':
      return t('report.noEntries');
    /*
     * ⚠ **기간을 반드시 넣는다.** 처음엔 "이 달의 주간 리포트를 먼저"라고 썼는데,
     *   월간이 겨냥하는 것은 **지난달**이라 그 문장이 틀렸다. 연간은 작년이라 더 틀렸다.
     *   화면에서 눈으로 보고 잡았다 — 코드만 봐서는 맞는 것처럼 읽힌다.
     */
    case 'need-weekly':
      return t('report.needWeekly', { period });
    case 'need-monthly':
      return t('report.needMonthly', { period });
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
