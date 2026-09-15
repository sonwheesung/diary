import { router, useFocusEffect } from 'expo-router';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import Sparkles from 'lucide-react-native/icons/sparkles';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useOnce } from '@/hooks/use-once';
import { AdBanner } from '@/features/ads/components/AdBanner';
import { listReports, type Report } from '@/features/ai/api/report-repository';
import {
  canCreate,
  listPeriodOptions,
  subGaps,
  syncReportsFromServer,
  targetPeriodKey,
  weeklyGaps,
  type CreateFail,
  type PeriodOption,
} from '@/features/ai/api/report-service';
import { PeriodSheet } from '@/features/ai/components/PeriodSheet';
import { hasAiConsent } from '@/features/ai/consent';
import { failMessage } from '@/features/ai/fail-message';
import { useGenerationStore } from '@/features/ai/generation-store';
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
  /*
   * 🔴 생성은 **스토어가 든다**(§11.8, 2026-09-15). 화면을 떠나도 요청이 살고, 끝나면
   *   `GenerationNotice` 가 어느 화면에서든 알린다. 여기서는 보여주기만 한다.
   */
  const job = useGenerationStore((state) => state.job);
  /*
   * 오늘 몇 개 더 만들 수 있나. **서버가 진실**이라 못 받으면 `null` 이고, 그때는
   * 아무 말도 하지 않는다 — 짐작한 숫자를 보여주는 것이 안 보여주는 것보다 나쁘다.
   */
  const [dailyLeft, setDailyLeft] = useState<number | null>(null);
  /*
   * 고른 기간(§6.4). 종류를 바꾸면 그 종류의 **기본값**으로 되돌아간다 —
   * 주간에서 고른 `2026-W20`을 월간 탭이 들고 있으면 아무 뜻도 없는 키가 된다.
   */
  const [periodKey, setPeriodKey] = useState(() => targetPeriodKey('weekly'));
  // 지금 이 탭·기간을 만드는 중인가. 다른 기간이 돌고 있으면 false 이고 버튼만 막힌다
  const creating = job !== null && job.kind === kind && job.periodKey === periodKey;
  const [options, setOptions] = useState<PeriodOption[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  /**
   * 목록·기간 후보·판정을 함께 읽는다.
   *
   * ⚠ `keepPeriod`가 없으면 기본 기간으로 되돌린다. 종류를 바꿀 때와 화면에 돌아올 때는
   *   되돌리는 것이 맞고(다른 종류의 키를 들고 있으면 안 된다), 만들기 직후에는
   *   **고른 기간을 유지**해야 방금 만든 것의 결과가 그 자리에 보인다.
   */
  const load = useCallback(async (target: ReportKind, keepPeriod?: string) => {
    const rows = await listReports(target);
    setReports(rows);
    const nextPeriod = keepPeriod ?? targetPeriodKey(target);
    setPeriodKey(nextPeriod);
    /*
     * ⚠ **구독자에게만 후보를 읽는다.** 주간 지평이 최대 2년이라 이 호출이 그 기간의
     *   조각 본문을 통째로 훑는다 — 무료 사용자는 시트를 열 수조차 없는데(만들기 상자가
     *   `LockedPreview`로 대체된다) 탭에 들어올 때마다 그 비용을 내게 할 이유가 없다.
     * ⚠ 스토어를 직접 읽는다. `pro`를 `useCallback` 의존성에 넣으면 엔타이틀먼트가
     *   갱신될 때마다 `load`의 정체성이 바뀌어 포커스 효과가 다시 돈다.
     */
    setOptions(useEntitlementStore.getState().pro ? await listPeriodOptions(target) : []);
    // 버튼을 누르기 전에 만들 수 있는지 답해둔다 — 서버를 부르지 않으므로 공짜다(§6.3)
    const verdict = await canCreate(target, nextPeriod);
    setBlocked(verdict.ok ? null : verdict.reason);
    setLoading(false);
  }, []);

  /*
   * 생성이 끝나면(성공이든 실패든) 목록과 판정을 다시 읽는다. 상세로 가는 것은 `GenerationNotice` 가 한다.
   * ⚠ 기간은 유지한다. 방금 만든 것의 결과가 그 자리에 보여야 한다.
   */
  const wasRunning = useRef(false);
  useEffect(() => {
    if (job !== null) {
      wasRunning.current = true;
      return;
    }
    if (wasRunning.current) {
      wasRunning.current = false;
      void load(kind, periodKey);
    }
  }, [job, kind, periodKey, load]);

  /** 시트에서 고른 기간 — 판정만 다시 하고 목록은 그대로 둔다 */
  const onPickPeriod = useCallback(
    async (next: string) => {
      setSheetOpen(false);
      setPeriodKey(next);
      const verdict = await canCreate(kind, next);
      setBlocked(verdict.ok ? null : verdict.reason);
    },
    [kind],
  );

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

  /*
   * 🔴 **서버에 있는데 로컬에 없는 리포트를 되살린다**(§5.6). 로컬이 없어지는 경로가 셋이다 —
   *   생성 중 앱이 죽거나, 재설치하거나, 기기를 바꾸거나. 캡이 평생 1회라 다시 못 만드는데
   *   글은 서버에 탈퇴 시까지 남아 있다(2026-09-15). **묘비는 되살리지 않는다** — 지운 것은 지운 것이다(§11.9).
   *
   * ⚠ **구독자에게만 부른다.** 비구독자 화면은 잠금 미리보기라 되살릴 것도 한도도 없다.
   * ⚠ 실패는 조용하다. 못 받으면 로컬만 보여주고 한도 문구를 안 그린다.
   */
  useFocusEffect(
    useCallback(() => {
      if (!pro) {
        return;
      }
      let alive = true;
      void syncReportsFromServer()
        .then((result) => {
          if (!alive || result === null) {
            return;
          }
          setDailyLeft(Math.max(0, result.dailyCap - result.dailyUsed));
          // 되살린 게 있을 때만 다시 읽는다 — 없는데 읽으면 화면이 헛되이 깜빡인다
          if (result.restored > 0) {
            void load(kind);
          }
        })
        .catch(() => {
          /* 조용히 넘어간다 */
        });
      return () => {
        alive = false;
      };
    }, [pro, kind, load]),
  );

  /*
   * 🔴 **연타를 여기서 막는다**(`hooks/use-once.ts`). 아래 첫 줄이 `await hasAiConsent()` 라
   *   `setCreating(true)` 까지 **버튼이 살아 있다** — 그 창에 두 번 누르면 요청이 둘 나가고,
   *   서버는 캡을 *읽고 나서* 모델을 부르므로 **둘 다 통과해 돈이 두 번** 나간다
   *   (`docs/AI_REPORT_SYSTEM.md` §5.4). `disabled={creating}` 은 그 창을 못 덮는다.
   */
  const onCreate = useOnce(async () => {
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
      const gaps = await weeklyGaps(periodKey).catch(() => ({ missing: [] as string[], total: 0 }));
      /*
       * 🔴 **한 날도 안 썼으면 묻지 않고 막는다**(2026-09-09 사용자 지적).
       *   그전엔 7일이 다 비어도 *"그래도 만들까요?"* 를 물었고, [만들기]를 누르면 서버가
       *   `empty`로 실패해 *"그 기간에는 쓴 조각이 없어요"* 가 그때서야 떴다.
       *   **묻고 나서 실패하는 것**이라, 무엇을 해야 하는지도 안 알려준다.
       *   요약할 것이 없는데 만들지 묻는 것은 선택지를 주는 것이 아니다.
       */
      if (gaps.total > 0 && gaps.missing.length === gaps.total) {
        Alert.alert(t('report.title'), t('report.needEntry'));
        return;
      }
      if (gaps.missing.length > 0 && !(await confirmGaps(gaps.missing, t))) {
        return;
      }
    } else {
      /*
       * 🔴 **하위가 덜 모였으면 한 번 묻는다**(§6.5). 월간·연간도 재생성이 없어서,
       *   2개짜리로 만든 8월 월간은 나중에 나머지 주간을 만들어도 **영구히 2개짜리다.**
       *
       * ⚠ 아직 안 끝난 하위가 있는 경우는 여기 오지 않는다 — `canCreate`가 `too-early`로
       *   이미 버튼을 막았다. 여기서 묻는 것은 **지금 만들 수 있는데 안 만든** 것뿐이라,
       *   취소하고 그걸 먼저 만드는 길이 실제로 열려 있다(백필이 있어야 성립한다).
       */
      const gaps = await subGaps(kind, periodKey).catch(() => null);
      if (
        gaps !== null &&
        gaps.missing.length > 0 &&
        !(await confirmSubGaps(kind, periodKey, gaps.total - gaps.missing.length, gaps.total, t))
      ) {
        return;
      }
    }
    /*
     * 🔴 **기다리지 않는다.** 스토어에 맡기고 돌아간다(§11.8). 끝나면 리포트 탭이면 상세로,
     *   다른 화면이면 알림창으로 알린다. 이미 하나가 돌고 있으면 스토어가 거절한다(버튼도 막혀 있다).
     */
    useGenerationStore.getState().start(kind, periodKey);
  });

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
        <LockedPreview kind={kind} />
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
            {/*
              🔴 **기간을 고를 수 있다**(§6.4). 기본값은 지난주·지난달·작년이라
                안 건드리면 예전과 똑같이 1탭이다 — 고르는 것은 선택이지 절차가 아니다.
            */}
            {/*
              🔴 **구독이 없으면 누를 수 없다**(2026-09-15 · 시트 #4). 후보를 구독자에게만 읽으므로
                열면 빈 시트가 올라와 고장처럼 보였다. 무엇을 해야 하는지는 아래 [구독 보기] 가 말한다.
            */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('report.periodSheet')}
              accessibilityState={{ disabled: !pro }}
              disabled={!pro}
              onPress={() => setSheetOpen(true)}
              style={[styles.periodPicker, !pro && styles.periodPickerDisabled]}
            >
              <Text style={styles.periodValue}>{periodLabel(kind, periodKey)}</Text>
              <ChevronDown size={18} color={colors.textMuted} />
            </Pressable>
            <Text style={styles.createNote}>
              {blocked === null
                ? t('report.willCreate', { period: periodLabel(kind, periodKey) })
                : failMessage(blocked, kind, periodKey, t)}
            </Text>
            {/* 주 1회 캡은 **주간에만** 해당한다. 월간·연간에 붙이면 거짓말이다 */}
            {blocked === null && kind === 'weekly' && (
              <Text style={styles.createNote}>{t('report.onceAWeek')}</Text>
            )}
            {/*
              🔴 **누르기 전에 말한다**(§6.3). 하루 한도에 걸리고 나서야 알게 하지 않는다 —
                백필하는 사람은 연달아 누르고, 그때 처음 막히면 무엇이 막았는지 모른다.
              ⚠ 서버에서 못 받았으면(`null`) 아무 말도 안 한다. 짐작한 숫자는 안 보여준다.
            */}
            {dailyLeft !== null && (
              <Text style={styles.createNote}>
                {t('report.dailyLeft', { count: String(dailyLeft) })}
              </Text>
            )}
            <Button
              label={creating ? t('report.creating') : t('report.create')}
              fullWidth
              loading={creating}
              disabled={job !== null || blocked !== null || !pro}
              icon={<Sparkles size={18} color={colors.textOnAccent} />}
              onPress={() => void onCreate()}
            />
            {/*
              생성 중이면 **떠나도 된다고** 말한다. 다른 기간이 돌고 있으면 무엇이 막고 있는지 말한다.
            */}
            {job !== null && (
              <Text style={styles.createNote}>
                {creating
                  ? t('report.creatingElsewhere')
                  : t('report.busyOther', { period: periodLabel(job.kind, job.periodKey) })}
              </Text>
            )}
            {!pro && (
              <Pressable accessibilityRole="button" onPress={() => router.push('/subscribe')}>
                <Text style={styles.subscribeLink}>{t('report.seeSubscription')}</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
      <PeriodSheet
        visible={sheetOpen}
        kind={kind}
        options={options}
        value={periodKey}
        onSelect={(next) => void onPickPeriod(next)}
        onClose={() => setSheetOpen(false)}
      />
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

/**
 * *"하위 리포트가 {{count}}/{{total}}인데 그래도 만들까요?"* (§6.5).
 *
 * `confirmGaps`(빠진 **날**)와 짝이다. 저쪽은 주간이 조각을 보고, 이쪽은 월간·연간이
 * **하위 리포트**를 본다 — 둘 다 *"되돌릴 수 없는 것 앞에서만 묻는다"* 는 같은 규약이다.
 *
 * ⚠ 확인 버튼이 `report.create`인 것도 같은 이유다. *"확인"* 으로는 무엇에 동의하는지 안 보인다.
 */
function confirmSubGaps(
  kind: ReportKind,
  periodKey: string,
  have: number,
  total: number,
  t: (key: string, opts?: Record<string, string | number>) => string,
) {
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      t('report.title'),
      t('report.subGapConfirm', {
        period: periodLabel(kind, periodKey),
        count: have,
        total,
      }),
      [
        { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
        { text: t('report.create'), onPress: () => resolve(true) },
      ],
      // ⚠ `onDismiss`를 반드시 받는다 — 안 받으면 흘려보낸 사람에게서 `onCreate`가 안 끝난다
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
function LockedPreview({ kind }: { kind: ReportKind }) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);
  // 예시에도 실제 형식의 날짜를 쓴다 — 언어마다 다른 표기를 여기서 한 번 보여주는 값도 있다
  const label = periodLabel('weekly', targetPeriodKey('weekly'));

  return (
    <>
      {/*
        🔴 **고른 탭을 따라간다** (2026-09-04 실기기). 전에는 `'weekly'`가 박혀 있어
          **연간 탭에서 "매주 돌아보는 시간 / 8월 24일–30일"** 이 떴다 — 탭은 눌리는데
          내용이 안 따라오면 그건 고장이 아니라 **거짓말**이다.

        ⚠ 같은 규약이 **바로 아래 구독자 빈 화면에 이미 적혀 있었다**(`report.empty<종류>`).
          "월간 탭에서 '한 주가 지나면…'을 보여주면 틀리게 알려주는 것"이라고 써 놓고,
          정작 **무료 사용자에게는** 그러고 있었다. 새로 만든 규칙이 아니다.
      */}
      <Text style={styles.lockedTitle}>{t(`report.lockedTitle${capitalize(kind)}`)}</Text>
      <Text style={styles.lockedBody}>{t(`report.empty${capitalize(kind)}`)}</Text>

      {/*
        🚫 **예시 카드는 주간에만 둔다.** 문장이 요일을 말하는데("월요일에는…") 그걸
          연간 아래에 놓으면 다시 같은 거짓말이 된다. 종류마다 예시를 쓰는 것도 가능하지만,
          **보여줄 수 없는 것을 안 보여주는 쪽**이 정직하고 번역도 늘지 않는다.
      */}
      {kind === 'weekly' && (
        <Card>
          <View style={styles.rowMeta}>
            <View style={styles.sampleBadge}>
              <Text style={styles.sampleBadgeText}>{t('report.sampleBadge')}</Text>
            </View>
            <Text style={styles.rowPeriod}>{label}</Text>
          </View>
          <Text style={styles.rowSummary}>{t('report.sampleBody')}</Text>
        </Card>
      )}

      <Button
        label={t('report.seeSubscription')}
        fullWidth
        onPress={() => router.push('/subscribe')}
      />
      <Text style={styles.disclaimer}>{t('report.disclaimer')}</Text>
    </>
  );
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
      flexShrink: 1,
    },
    rowWeek: {
      ...typography.caption,
      color: colors.textMuted,
      flexShrink: 1,
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
    /*
     * 기간 선택 — 입력칸처럼 보이되 **누르는 것**임이 보여야 한다.
     * 그래서 테두리를 주고 오른쪽에 화살표를 둔다. `TextField`와 같은 높이·radius다.
     */
    periodPicker: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    // 누를 수 없음이 보여야 한다. 색을 새로 만들지 않고 흐리게만 한다(버튼의 disabled 와 같은 결)
    periodPickerDisabled: {
      opacity: 0.5,
    },
    periodValue: {
      ...typography.body,
      color: colors.text,
      flexShrink: 1,
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
