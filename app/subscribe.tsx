import { router } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import Check from 'lucide-react-native/icons/check';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useEntitlementStore } from '@/features/entitlement/store';
import {
  fetchPlans,
  identifyForPurchase,
  purchase,
  purchasesConfigured,
  restore,
  trialTermsOf,
} from '@/features/subscription/api/purchases';
import type { Plans } from '@/features/subscription/api/purchases';
import type { TrialTerms } from '@/features/subscription/trial';
import { formatTimestampDate } from '@/lib/format';
import { useSupportAuth } from '@/features/support/auth-gate';
import { OPERATOR } from '@/features/legal/legal-text';
import type { Palette } from '@/theme/palettes';
import { radius, spacing } from '@/theme/spacing';
import { useColors } from '@/theme/theme';
import { typography } from '@/theme/typography';
import { useStyles } from '@/theme/use-styles';

/**
 * 구독 — **조각 Pro 하나뿐**이다.
 *
 * ⚠ **로그인하지 않으면 결제를 열지 않는다.** `Purchases.logIn(subject_id)` 전에 결제하면
 *   RC가 익명 appUserID를 만들고 그 구독은 subject와 **영영 매칭되지 않는다** —
 *   돈은 나갔는데 `pro`가 안 붙는다(`docs/MONETIZATION_SYSTEM.md` §2).
 *   게이트를 두 겹으로 둔다: ① 미로그인이면 화면 자체를 안 연다 ② 결제 직전 `logIn` 확인.
 *
 * ⚠ 업그레이드·다운그레이드가 없다. 월↔연 전환도 하지 않는다 — **Play 구독 관리 링크**만 준다.
 */

/** Play 구독 관리. 해지·플랜 변경은 여기서 한다 */
const PLAY_SUBSCRIPTIONS = 'https://play.google.com/store/account/subscriptions';

export default function SubscribeScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const { signedIn, ready, subject, signIn, busy } = useSupportAuth();
  const pro = useEntitlementStore((s) => s.pro);

  const [plans, setPlans] = useState<Plans | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  /** RC에 신원을 알렸는가. **이게 false면 결제 버튼을 누를 수 없다** */
  const [identified, setIdentified] = useState(false);
  /**
   * 전자상거래법 §13⑥ 동의 단계. 무료 체험이 붙은 상품에만 선다.
   *
   * ⚠ **고지가 아니라 동의다.** 체크를 켜야 결제가 열리고, 뒤로가기는 동의가 아니다.
   */
  const [consent, setConsent] = useState<{ pkg: PurchasesPackage; terms: TrialTerms } | null>(null);
  const [agreed, setAgreed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    /*
     * ⚠ 순서가 전부다: 로그인 확인 → logIn(subject_id) → 상품 조회.
     *   상품을 먼저 띄우면 사용자가 그걸 누를 수 있고, 그 순간 익명 결제가 된다.
     */
    if (subject !== null) {
      const result = await identifyForPurchase(subject.id);
      setIdentified(result.ok);
    }
    setPlans(await fetchPlans());
    setLoading(false);
  }, [subject]);

  useEffect(() => {
    if (ready && signedIn) {
      void load();
    } else if (ready) {
      setLoading(false);
    }
  }, [ready, signedIn, load]);

  /**
   * 상품을 누르면 여기로 온다. **체험이 붙어 있으면 바로 결제하지 않는다** —
   * §13⑥이 전환 일시·전후 가격·결제방법에 대한 **별도 동의**를 요구한다.
   */
  const choose = (pkg: PurchasesPackage) => {
    const terms = trialTermsOf(pkg, Date.now());
    if (terms === null) {
      void buy(pkg);
      return;
    }
    setAgreed(false);
    setConsent({ pkg, terms });
  };

  const buy = async (pkg: PurchasesPackage) => {
    setConsent(null);
    if (!identified) {
      // 여기 오면 안 되지만, 오면 결제를 막는다 — 익명 결제는 되돌릴 수 없다.
      Alert.alert(t('subscribe.notReadyTitle'), t('subscribe.notReadyBody'));
      return;
    }
    setWorking(true);
    const result = await purchase(pkg);
    setWorking(false);

    if (result.kind === 'cancelled') {
      return; // 취소는 오류가 아니다 — 아무 말도 하지 않는다
    }
    if (result.kind === 'no-entitlement') {
      // 결제는 됐는데 권한이 없다 = RC에서 상품 attach를 빠뜨렸다(§7.2 함정 #2)
      Alert.alert(t('subscribe.failedTitle'), t('subscribe.noEntitlement'));
      return;
    }
    if (result.kind === 'error') {
      Alert.alert(t('subscribe.failedTitle'), t('subscribe.failedBody'));
      return;
    }
    Alert.alert(t('subscribe.doneTitle'), t('subscribe.doneBody'), [
      { text: t('common.confirm'), onPress: () => router.back() },
    ]);
  };

  const doRestore = async () => {
    setWorking(true);
    const result = await restore();
    setWorking(false);
    Alert.alert(
      result.kind === 'ok' ? t('subscribe.restoredTitle') : t('subscribe.restoreNoneTitle'),
      result.kind === 'ok' ? t('subscribe.restoredBody') : t('subscribe.restoreNoneBody'),
    );
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
      <Text style={styles.headerTitle}>{t('subscribe.title')}</Text>
    </View>
  );

  /*
   * ── §13⑥ 전환 동의 ────────────────────────────────────────────────────────
   * 전용 화면으로 세운다. 아래 작은 글씨로는 "동의를 받았다"가 성립하지 않는다.
   */
  if (consent !== null) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
        <Text style={styles.consentTitle}>{t('subscribe.consentTitle')}</Text>

        <View style={styles.consentBox}>
          {/* 전환 일시 — 날짜는 틀을 통째로 번역한다(§9.1) */}
          <ConsentRow
            label={t('subscribe.consentWhenLabel')}
            value={t('subscribe.consentWhen', {
              days: consent.terms.days,
              date: formatTimestampDate(consent.terms.chargesAt),
            })}
          />
          {/* 변동 전/후 가격을 **나란히** 적는다 */}
          <ConsentRow
            label={t('subscribe.consentPriceLabel')}
            value={t('subscribe.consentPrice', { after: consent.terms.priceAfter })}
          />
          <ConsentRow
            label={t('subscribe.consentMethodLabel')}
            value={t('subscribe.consentMethod')}
          />
          <ConsentRow
            label={t('subscribe.consentCancelLabel')}
            value={t('subscribe.consentCancel')}
          />
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          onPress={() => setAgreed((value) => !value)}
          style={styles.agreeRow}
          hitSlop={8}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
            {agreed && <Check size={16} color={colors.textOnAccent} />}
          </View>
          <Text style={styles.agreeText}>{t('subscribe.consentAgree')}</Text>
        </Pressable>

        {/*
          🔴 **전자상거래법 §13③ 미성년자 고지.** 통신판매업자는 미성년자와 계약을 체결할 때
            *"법정대리인이 동의하지 아니하면 취소할 수 있다"* 는 것을 **미성년자에게 고지**해야 한다.

          ⚠ 우리는 이용자의 나이를 모른다 — 연령 게이트도 생년월일 수집도 없고, 일기 앱에
            그것을 만드는 것은 기둥 1·3에 정면으로 어긋난다. 그래서 **결제 화면에서 모두에게
            보여주는 것**이 이 조를 이행하는 유일하게 성립하는 방법이다. 성인에게 한 줄 더 보이는
            비용이, 미성년자에게 고지하지 않는 위반보다 싸다.

          ⚠ 동의 체크박스에 묶지 않는다. §13③은 **고지**이지 동의가 아니고, 묶으면
            §13⑥ 동의의 대상이 흐려진다("무엇에 동의한 것인가"가 두 개가 된다).
        */}
        <Text style={styles.minorNotice}>{t('subscribe.consentMinor')}</Text>

        {/*
          §13②9호 — 약관은 "확인할 수 있는 방법"까지 갖춰야 한다. 결제 직전이 그 방법이
          가장 필요한 자리다. 청약철회·환불이 거기 있다.
        */}
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/terms')}
          hitSlop={8}
          style={styles.consentBack}
        >
          <Text style={styles.link}>{t('subscribe.consentTerms')}</Text>
        </Pressable>

        <Button
          label={t('subscribe.consentStart')}
          onPress={() => void buy(consent.pkg)}
          // ⚠ 기본값이 꺼짐이고, 켜야 열린다. 미리 켜두면 동의가 아니다.
          disabled={!agreed || working}
          loading={working}
          fullWidth
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => setConsent(null)}
          hitSlop={8}
          style={styles.consentBack}
        >
          <Text style={styles.link}>{t('common.cancel')}</Text>
        </Pressable>
      </Screen>
    );
  }

  // ── 로그인 게이트 ──────────────────────────────────────────────────────────
  if (ready && !signedIn) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
        <Text style={styles.lead}>{t('subscribe.lead')}</Text>
        <Benefits />
        <View style={styles.gate}>
          <Text style={styles.gateBody}>{t('subscribe.loginRequired')}</Text>
          {/* ⚠ 로그인이 결제의 전제인 이유를 그 자리에 적는다 */}
          <Text style={styles.fine}>{t('subscribe.loginWhy')}</Text>
          <Button
            label={t('support.loginButton')}
            onPress={() => void signIn()}
            loading={busy}
            disabled={busy}
            fullWidth
          />
        </View>
      </Screen>
    );
  }

  if (loading || !ready) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} header={header} scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  const unavailable =
    !purchasesConfigured() || plans === null || (plans.monthly === null && plans.annual === null);

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      <Text style={styles.lead}>{t('subscribe.lead')}</Text>
      <Benefits />

      {pro ? (
        <View style={styles.activeBox}>
          <Text style={styles.activeTitle}>{t('subscribe.alreadyActive')}</Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => void Linking.openURL(PLAY_SUBSCRIPTIONS)}
            hitSlop={8}
          >
            <Text style={styles.link}>{t('subscribe.managePlay')}</Text>
          </Pressable>
        </View>
      ) : unavailable ? (
        // ⚠ "일시적 오류"가 아니다. RC에 상품이 안 붙어 있으면 계속 이 상태다.
        <Text style={styles.subtle}>{t('subscribe.unavailable')}</Text>
      ) : (
        <View style={styles.plans}>
          {plans?.annual !== null && plans !== null && (
            <PlanButton
              pkg={plans.annual}
              label={t('subscribe.annual')}
              badge={t('subscribe.annualBadge')}
              onPress={choose}
              disabled={working}
            />
          )}
          {plans?.monthly !== null && plans !== null && (
            <PlanButton
              pkg={plans.monthly}
              label={t('subscribe.monthly')}
              onPress={choose}
              disabled={working}
            />
          )}
        </View>
      )}

      {/*
        전자상거래법 §13의 표시. **여기서 6종을 다 찍지 않는다** — 다른 곳이 이미 담고 있다.

          §13①(표시·광고)  → Play 스토어 등록정보. §10의 수범자는 사이버몰 운영자인 Google이고
                              우리는 입점 통신판매업자다(`MONETIZATION_SYSTEM.md` §5.1, 2026-08-14 원문 확인)
          §13②(거래조건)   → 이용약관 제2조가 상호·대표자·주소·전화번호를 담는다(같은 문서 §5.2)
          §13③(미성년자)   → 아래 동의 화면의 `subscribe.consentMinor`

        ⚠ ~~"주소·전화번호·신고번호는 사업자 정보가 확정되면 채운다"~~ 는 주석이 여기 오래 남아
          **이미 끝난 일을 남은 블로커로 보이게 했다.** 정보는 2026-07-14에 확정됐고(신고 완료),
          그보다 §13①의 수범 구조를 다시 읽은 것이 답이었다. 화면에는 상호·연락처만 둔다.
      */}
      <View style={styles.legal}>
        <Text style={styles.fine}>{t('subscribe.trialNotice')}</Text>
        {/* 1 구독 = 동시에 1 계정. 가족 공유를 기대하고 결제한 사람에게 조용히 뺏기면 안 된다 */}
        <Text style={styles.fine}>{t('subscribe.oneAccountNotice')}</Text>
        <Text style={styles.fine}>{t('subscribe.cancelNotice')}</Text>
        <Text style={styles.fine}>
          {t('subscribe.operator', { name: OPERATOR.name, email: OPERATOR.contactEmail })}
        </Text>
      </View>

      <Pressable accessibilityRole="button" onPress={() => void doRestore()} hitSlop={8}>
        <Text style={styles.link}>{t('subscribe.restore')}</Text>
      </Pressable>
    </Screen>
  );
}

function ConsentRow({ label, value }: { label: string; value: string }) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.consentRow}>
      <Text style={styles.consentLabel}>{label}</Text>
      <Text style={styles.consentValue}>{value}</Text>
    </View>
  );
}

/** 무엇을 사는가. 상품이 하나뿐이라 비교표가 필요 없다 */
function Benefits() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const items = [t('subscribe.benefitAds'), t('subscribe.benefitBackup'), t('subscribe.benefitAi')];
  return (
    <View style={styles.benefits}>
      {items.map((item) => (
        <View key={item} style={styles.benefitRow}>
          <Check size={18} color={colors.accent} />
          <Text style={styles.benefitText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function PlanButton({
  pkg,
  label,
  badge,
  onPress,
  disabled,
}: {
  pkg: PurchasesPackage;
  label: string;
  badge?: string;
  onPress: (pkg: PurchasesPackage) => void;
  disabled: boolean;
}) {
  const styles = useStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(pkg)}
      disabled={disabled}
      style={[styles.plan, disabled && styles.planDisabled]}
    >
      <View style={styles.planBody}>
        <Text style={styles.planLabel}>{label}</Text>
        {badge !== undefined && <Text style={styles.planBadge}>{badge}</Text>}
      </View>
      {/* ⚠ 가격은 **스토어가 준 문자열**을 그대로 쓴다 — 통화·표기가 나라마다 다르다 */}
      <Text style={styles.planPrice}>{pkg.product.priceString}</Text>
    </Pressable>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerTitle: { ...typography.label, color: colors.text },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    lead: { ...typography.body, color: colors.text, lineHeight: 23 },
    benefits: { gap: spacing.sm },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    benefitText: { ...typography.body, color: colors.text },
    gate: { gap: spacing.md, marginTop: spacing.lg },
    gateBody: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
    plans: { gap: spacing.md },
    plan: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.surface,
    },
    planDisabled: { opacity: 0.5 },
    planBody: { gap: spacing.xs },
    planLabel: { ...typography.label, color: colors.text },
    planBadge: { ...typography.caption, color: colors.accent },
    planPrice: { ...typography.title, color: colors.accent },
    activeBox: {
      gap: spacing.sm,
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.accentSoft,
    },
    activeTitle: { ...typography.label, color: colors.accent },
    consentTitle: { ...typography.title, color: colors.text, marginBottom: spacing.lg },
    consentBox: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.md,
    },
    consentRow: { gap: 2 },
    consentLabel: { ...typography.caption, color: colors.textMuted },
    consentValue: { ...typography.body, color: colors.text },
    agreeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginVertical: spacing.lg,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // ⚠ 배경만 바꿀 때 반지름을 다시 적는다 — 안드로이드에서 네모로 그려지는 경우를 겪었다(§10)
    checkboxOn: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      borderRadius: radius.sm,
    },
    agreeText: { ...typography.body, color: colors.text, flex: 1 },
    // 동의 체크박스와 눈으로 구분한다 — 고지이지 동의가 아니다(§13③)
    minorNotice: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 19,
      marginTop: spacing.sm,
    },
    consentBack: { alignSelf: 'center', marginTop: spacing.lg },
    legal: { gap: spacing.xs, marginTop: spacing.md },
    fine: { ...typography.caption, color: colors.textMuted, lineHeight: 18 },
    subtle: { ...typography.caption, color: colors.textMuted, lineHeight: 19 },
    link: { ...typography.caption, color: colors.accent, textAlign: 'center' },
  });
