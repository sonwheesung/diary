import { router } from 'expo-router';
import {
  Bug,
  ChevronLeft,
  HelpCircle,
  Lightbulb,
  LogIn,
  MoreHorizontal,
} from 'lucide-react-native';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useSupportAuth } from '@/features/support/auth-gate';
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
export default function SupportScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const { signedIn, ready, signIn } = useSupportAuth();

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
        Alert.alert(t('support.sentTitle'), t('support.sentBody'), [
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
          <View style={styles.gateAction}>
            <Button label={t('support.loginButton')} onPress={signIn} fullWidth />
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
    gateAction: {
      alignSelf: 'stretch',
      marginTop: spacing.lg,
    },
  });
