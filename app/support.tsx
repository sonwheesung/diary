import { router } from 'expo-router';
import Bug from 'lucide-react-native/icons/bug';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import HelpCircle from 'lucide-react-native/icons/circle-question-mark';
import Lightbulb from 'lucide-react-native/icons/lightbulb';
import LogIn from 'lucide-react-native/icons/log-in';
import MoreHorizontal from 'lucide-react-native/icons/ellipsis';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useSupportAuth } from '@/features/support/auth-gate';
import type { SignInOutcome } from '@/features/support/auth-gate';
import { useInquiryStore } from '@/features/support/inquiry-store';
import { CONTENT_MAX, CONTENT_MIN } from '@/lib/common-server';
import { commonServer } from '@/lib/common-server/client';
import type { FailReason, SupportCategory } from '@/lib/common-server/types';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const CATEGORIES: { key: SupportCategory; labelKey: string; icon: (color: string) => ReactNode }[] =
  [
    { key: 'bug', labelKey: 'support.categoryBug', icon: (c) => <Bug size={18} color={c} /> },
    {
      key: 'suggestion',
      labelKey: 'support.categorySuggestion',
      icon: (c) => <Lightbulb size={18} color={c} />,
    },
    {
      key: 'question',
      labelKey: 'support.categoryQuestion',
      icon: (c) => <HelpCircle size={18} color={c} />,
    },
    {
      key: 'etc',
      labelKey: 'support.categoryEtc',
      icon: (c) => <MoreHorizontal size={18} color={c} />,
    },
  ];

/**
 * 실패 사유별 안내 — **사용자가 다음에 뭘 하면 되는지**가 드러나게 적는다.
 *
 * `not-found`(서버에 앱 미등록)는 사용자가 할 수 있는 일이 `not-configured`와 같으므로
 * 같은 문구로 묶는다 — 우리 쪽 사정을 사용자에게 설명해봐야 할 수 있는 게 없다.
 */
const FAIL_KEYS: Record<FailReason, string> = {
  'not-configured': 'support.failNotConfigured',
  'not-found': 'support.failNotConfigured',
  offline: 'support.failOffline',
  'rate-limited': 'support.failRateLimited',
  'too-short': 'support.tooShort',
  // 세션이 도중에 죽은 경우. SDK가 이 시점에 로컬 세션을 이미 버렸으므로 다시 로그인하면 된다.
  unauthorized: 'support.failSignInAgain',
  'not-signed-in': 'support.failSignInAgain',
  error: 'support.failError',
};

/**
 * 문의하기 (MVP §9).
 *
 * **로그인 필수**다(CLAUDE.md §4) — 답변을 드리려면 누가 보냈는지 알아야 하기 때문이다.
 * 로그인 판정은 `features/support/auth-gate`가 갖는다. 이 화면은 `signedIn`만 보고 갈라진다.
 */
/** Play 구독 관리. 탈퇴는 구독을 해지하지 않는다 — 해지는 여기서만 된다 */
const PLAY_SUBSCRIPTIONS = 'https://play.google.com/store/account/subscriptions';

export default function SupportScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const { signedIn, ready, busy, subject, signIn, signOut, deleteAccount } = useSupportAuth();

  const unreadReplies = useInquiryStore((state) => state.unreadCount);
  const refreshInquiries = useInquiryStore((state) => state.refresh);

  const [category, setCategory] = useState<SupportCategory>('bug');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const trimmedLength = content.trim().length;
  const canSubmit = trimmedLength >= CONTENT_MIN && !sending;

  const submit = async () => {
    if (!canSubmit) {
      return;
    }
    setSending(true);
    // SDK는 throw하지 않지만, 예기치 못한 경우에도 로딩에 갇히지 않게 감싼다.
    try {
      const result = await commonServer.sendInquiry(category, content);
      if (result.ok) {
        setContent('');
        // 방금 보낸 것이 내역에 없으면 안 간 것처럼 보인다. 기다리지 않고 갱신만 걸어둔다.
        void refreshInquiries();
        Alert.alert(t('support.sentTitle'), t('support.sentBody'), [
          { text: t('inquiries.title'), onPress: () => router.replace('/inquiries') },
          { text: t('common.confirm'), onPress: () => router.back() },
        ]);
        return;
      }
      Alert.alert(t(FAIL_KEYS[result.reason], { min: CONTENT_MIN }));
    } catch {
      Alert.alert(t('support.failError'));
    } finally {
      setSending(false);
    }
  };

  /**
   * 로그인 결과 안내.
   *
   * 취소는 사용자가 스스로 한 일이라 아무 말도 하지 않는다 — 닫자마자 오류창이 뜨면
   * 실패한 것처럼 보인다.
   *
   * ⚠ `FAIL_KEYS`를 그대로 쓰지 않는다. 그건 **문의 전송** 실패 문구라서 로그인 실패에
   * "보내지 못했어요"가 뜬다 — 아무것도 보낸 적 없는 사용자에게는 무슨 말인지 알 수 없다.
   * 보낼 것이 없는 사유(error·unauthorized)는 로그인 문구로 바꿔 말한다.
   */
  const handleSignIn = async () => {
    const outcome: SignInOutcome = await signIn();
    if (outcome === null || outcome === 'cancelled') {
      return;
    }
    if (outcome === 'error' || outcome === 'unauthorized' || outcome === 'not-signed-in') {
      Alert.alert(t('support.loginFailed'));
      return;
    }
    Alert.alert(t(FAIL_KEYS[outcome], { min: CONTENT_MIN }));
  };

  const confirmSignOut = () => {
    Alert.alert(t('support.signOutTitle'), t('support.signOutBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('support.signOut'), onPress: () => void signOut() },
    ]);
  };

  /**
   * 탈퇴 — **Play 정책상 앱 안에 이 경로가 있어야 한다.** 로그인을 만든 순간 의무가 생긴다.
   * 되돌릴 수 없으므로 한 번 더 묻는다. 일기는 기기에 있어 지워지지 않는다는 것도 함께 밝힌다.
   */
  const confirmDelete = () => {
    Alert.alert(t('support.deleteTitle'), t('support.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      /*
       * ⚠ **탈퇴해도 구글 구독은 계속 청구된다.** 우리가 해지시킬 수 없다 —
       *   이 버튼이 없으면 "탈퇴했는데 돈이 나간다"는 문의와 환불 요청이 온다.
       *   `pro`가 false여도 띄운다: 계정을 바꾼 사람은 우리 쪽 권한이 없는데도 청구된다.
       */
      {
        text: t('support.deleteManageSubscription'),
        onPress: () => void Linking.openURL(PLAY_SUBSCRIPTIONS),
      },
      {
        text: t('support.deleteConfirm'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            const reason = await deleteAccount();
            Alert.alert(
              reason === null
                ? t('support.deleteDone')
                : t(FAIL_KEYS[reason], { min: CONTENT_MIN }),
            );
          })();
        },
      },
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
      <Text style={styles.headerTitle}>{t('support.title')}</Text>
      {/*
        내 문의 입구. **로그인했을 때만** 보인다 — 로그인 전에는 볼 내역이 없고,
        누르면 빈 화면이 나오는 링크는 고장으로 읽힌다.
        답변이 왔는데 안 읽은 게 있으면 점을 찍는다(설정 행과 같은 규약).
      */}
      {signedIn && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/inquiries')}
          hitSlop={8}
          style={styles.headerLinkWrap}
        >
          <Text style={styles.headerLink}>{t('inquiries.title')}</Text>
          {unreadReplies > 0 && <View style={styles.headerDot} />}
        </Pressable>
      )}
    </View>
  );

  if (!ready) {
    // 세션 확인 중. 여기서 바로 '로그인 필요'를 그리면 이미 로그인한 사람에게 한 번 깜빡인다.
    return (
      <Screen
        edges={['top', 'bottom', 'left', 'right']}
        header={header}
        contentStyle={styles.content}
      >
        <View style={styles.gate}>
          <ActivityIndicator color={colors.accentMuted} />
        </View>
      </Screen>
    );
  }

  if (!signedIn) {
    return (
      <Screen
        edges={['top', 'bottom', 'left', 'right']}
        header={header}
        // ScrollView 안에서는 자식의 flex:1이 늘어나지 않는다 — 컨테이너가 자라야 가운데가 된다
        contentStyle={styles.content}
      >
        <View style={styles.gate}>
          <View style={styles.gateIcon}>
            <LogIn size={22} color={colors.accent} />
          </View>
          <Text style={styles.gateTitle}>{t('support.loginRequiredTitle')}</Text>
          <Text style={styles.gateBody}>{t('support.loginRequiredBody')}</Text>
          {/* 일기를 쓰는 길에는 로그인이 없다는 것을 여기서 못 박는다(기둥 1) */}
          <Text style={styles.gateNote}>{t('support.loginNotRequiredForDiary')}</Text>
          {/*
            수집이 실제로 시작되는 지점이 여기다 — 버튼을 누르는 순간 이메일과 구글 sub를 받는다.
            그런데 지금까지 이 화면에는 고지가 한 줄도 없었고, 처리방침은 설정 탭에서만 닿았다.
            무엇을 받는지·왜 받는지·언제 지우는지를 **누르기 전에** 여기서 밝힌다.
          */}
          <Text style={styles.gateNote}>{t('support.loginPrivacyNote')}</Text>
          <Pressable accessibilityRole="link" onPress={() => router.push('/privacy')} hitSlop={8}>
            <Text style={styles.gateLink}>{t('settings.privacy')}</Text>
          </Pressable>
          <View style={styles.gateAction}>
            <Button
              label={t('support.loginButton')}
              onPress={() => void handleSignIn()}
              loading={busy}
              disabled={busy}
              fullWidth
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      <Text style={styles.sectionTitle}>{t('support.categoryLabel')}</Text>
      {/* 네 개뿐이라 시트를 여는 것보다 늘어놓는 편이 빠르다. 좁은 화면을 위해 줄바꿈한다 */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map((item) => {
          const selected = item.key === category;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setCategory(item.key)}
              style={[styles.categoryChip, selected && styles.categoryChipOn]}
            >
              {item.icon(selected ? colors.textOnAccent : colors.textMuted)}
              <Text style={[styles.categoryLabel, selected && styles.categoryLabelOn]}>
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>{t('support.contentLabel')}</Text>
      <TextField
        value={content}
        onChangeText={setContent}
        placeholder={t('support.contentPlaceholder')}
        variant="boxed"
        multiline
        // 서버가 2000자에서 자른다 — 그보다 크게 두면 잘린 글을 보낸 줄 모른다.
        maxLength={CONTENT_MAX}
        style={styles.contentInput}
      />
      <Text style={styles.counter}>
        {trimmedLength} / {CONTENT_MAX}
      </Text>

      {/* 무엇이 전송되는지 먼저 밝힌다. 일기 앱이라 "본문은 안 간다"가 가장 중요한 한 줄이다 */}
      <View style={styles.notice}>
        <Text style={styles.noticeText}>{t('support.privacyNote')}</Text>
      </View>

      <Button
        label={t('support.submit')}
        onPress={() => void submit()}
        disabled={!canSubmit}
        loading={sending}
        fullWidth
      />

      {/*
        계정 줄 — 로그인이 생긴 순간 나가는 문(로그아웃)과 지우는 문(탈퇴)이 함께 있어야 한다.
        탈퇴는 Play 정책상 앱 안에 경로가 있어야 하고, 계정을 쓰는 자리가 여기뿐이라 여기에 둔다.
        보내기 아래에 두는 이유: 이 화면에 온 목적은 문의이지 계정 관리가 아니다.
      */}
      <View style={styles.account}>
        <Text style={styles.accountLabel} numberOfLines={1}>
          {subject?.email ?? t('support.signedIn')}
        </Text>
        <View style={styles.accountActions}>
          <Pressable
            accessibilityRole="button"
            onPress={confirmSignOut}
            disabled={busy}
            hitSlop={8}
          >
            <Text style={styles.accountAction}>{t('support.signOut')}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={confirmDelete} disabled={busy} hitSlop={8}>
            <Text style={styles.accountDanger}>{t('support.deleteAccount')}</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerTitle: {
      ...typography.subtitle,
      color: colors.text,
    },
    headerLinkWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginLeft: 'auto',
    },
    headerLink: {
      ...typography.label,
      color: colors.accent,
    },
    headerDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.danger,
    },
    sectionTitle: {
      ...typography.label,
      color: colors.textMuted,
    },
    categoryRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceMuted,
    },
    categoryChipOn: {
      // 배경만 바꾸는 스타일에도 radius를 다시 적는다(CLAUDE.md §10 — 안드로이드에서 사각형이 된다)
      borderRadius: radius.full,
      backgroundColor: colors.accent,
    },
    categoryLabel: {
      ...typography.label,
      color: colors.textMuted,
    },
    categoryLabelOn: {
      color: colors.textOnAccent,
    },
    contentInput: {
      minHeight: 160,
      textAlignVertical: 'top',
    },
    counter: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'right',
      marginTop: -spacing.sm,
    },
    notice: {
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    noticeText: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 19,
    },
    gate: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    gateIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
      marginBottom: spacing.xs,
    },
    gateTitle: {
      ...typography.subtitle,
      color: colors.text,
    },
    gateBody: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 19,
    },
    gateNote: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 19,
    },
    gateLink: {
      ...typography.caption,
      color: colors.accent,
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
    gateAction: {
      alignSelf: 'stretch',
      marginTop: spacing.lg,
    },
    account: {
      gap: spacing.sm,
      paddingTop: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    accountLabel: {
      ...typography.caption,
      color: colors.textMuted,
    },
    accountActions: {
      flexDirection: 'row',
      // 독일어에서 두 라벨이 한 줄에 안 들어간다(CLAUDE.md §9.1) — 자르지 말고 줄바꿈한다
      flexWrap: 'wrap',
      gap: spacing.lg,
    },
    accountAction: {
      ...typography.label,
      color: colors.textMuted,
    },
    accountDanger: {
      ...typography.label,
      color: colors.danger,
    },
  });
