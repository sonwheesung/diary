import { router, useFocusEffect } from 'expo-router';
import Bug from 'lucide-react-native/icons/bug';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import CornerDownRight from 'lucide-react-native/icons/corner-down-right';
import HelpCircle from 'lucide-react-native/icons/circle-question-mark';
import Inbox from 'lucide-react-native/icons/inbox';
import Lightbulb from 'lucide-react-native/icons/lightbulb';
import MoreHorizontal from 'lucide-react-native/icons/ellipsis';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { replyKey, useInquiryStore } from '@/features/support/inquiry-store';
import type { MyInquiry, SupportCategory } from '@/lib/common-server/types';
import { formatListDate } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** 문의 화면과 **같은 라벨을 쓴다** — 보낼 때 고른 것과 다른 이름이 보이면 다른 문의로 읽힌다. */
const CATEGORY_KEYS: Record<SupportCategory, string> = {
  bug: 'support.categoryBug',
  suggestion: 'support.categorySuggestion',
  question: 'support.categoryQuestion',
  etc: 'support.categoryEtc',
};

const CATEGORY_ICONS: Record<SupportCategory, (color: string) => React.ReactNode> = {
  bug: (c) => <Bug size={14} color={c} />,
  suggestion: (c) => <Lightbulb size={14} color={c} />,
  question: (c) => <HelpCircle size={14} color={c} />,
  etc: (c) => <MoreHorizontal size={14} color={c} />,
};

const STATUS_KEYS: Record<MyInquiry['status'], string> = {
  open: 'inquiries.statusOpen',
  replied: 'inquiries.statusReplied',
  resolved: 'inquiries.statusResolved',
};

/**
 * 내 문의와 답변 (`docs/SUPPORT_SYSTEM.md` §5.5).
 *
 * **이 화면이 로그인의 존재 이유다.** 문의 화면은 "답변을 드리려면 누가 보냈는지 알아야
 * 한다"며 로그인을 요구하는데, 답변을 볼 자리가 없으면 그 말이 지켜지지 않는다.
 *
 * 로그인 게이트를 여기 두지 않는다 — 입구가 둘 다(문의 화면 헤더 · 설정 행) **로그인
 * 상태에서만 보이고**, 토큰이 없으면 SDK가 네트워크 없이 `not-signed-in`을 돌려줘
 * 빈 목록이 된다. 게이트를 한 겹 더 그리면 같은 판정이 두 곳에 생긴다.
 */
export default function InquiriesScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);

  const loaded = useInquiryStore((state) => state.loaded);
  const loading = useInquiryStore((state) => state.loading);
  const inquiries = useInquiryStore((state) => state.inquiries);
  const readKeys = useInquiryStore((state) => state.readKeys);
  const lastError = useInquiryStore((state) => state.lastError);
  const refresh = useInquiryStore((state) => state.refresh);
  const markAllRead = useInquiryStore((state) => state.markAllRead);

  const loadFailed = lastError !== null;

  /*
   * 입장 시점의 안읽음을 **스냅샷으로 뜬다**(공지 화면과 같은 이유).
   * readKeys를 그대로 구독하면 바로 아래 markAllRead가 반영되는 순간 표시가 눈앞에서
   * 사라져, 어느 것이 새 답변이었는지 알 수 없게 된다.
   */
  const [unreadAtEntry, setUnreadAtEntry] = useState<ReadonlySet<string>>(new Set());
  const snapshotTaken = useRef(false);

  // 답변을 보러 온 사람에게 낡은 목록을 보이지 않는다 — 돌아올 때마다 다시 읽는다.
  useFocusEffect(
    useCallback(() => {
      /*
       * ⚠ 스냅샷도 함께 되돌린다. 이 화면은 스택에 남아 있어서, 리셋하지 않으면
       *   다녀온 사이에 도착한 답변이 **읽음 처리도 새 표시도 안 된 채** 남는다
       *   (설정의 점만 계속 켜져 있게 된다).
       */
      snapshotTaken.current = false;
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    if (!loaded || loading || snapshotTaken.current) {
      return;
    }
    snapshotTaken.current = true;
    const read = new Set(readKeys);
    // 키 만드는 규칙은 스토어가 갖는다 — 두 곳에서 만들면 반드시 어긋난다.
    const fresh = inquiries.filter((item) => {
      const key = replyKey(item);
      return key !== null && !read.has(key);
    });
    setUnreadAtEntry(new Set(fresh.map((item) => item.id)));
    markAllRead();
  }, [loaded, loading, readKeys, inquiries, markAllRead]);

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
      <Text style={styles.headerTitle}>{t('inquiries.title')}</Text>
    </View>
  );

  // 첫 조회 중. 이미 받아둔 목록이 있으면 그걸 계속 보여준다(깜빡임 방지).
  if (!loaded && inquiries.length === 0) {
    return (
      <Screen
        edges={['top', 'bottom', 'left', 'right']}
        header={header}
        contentStyle={styles.content}
      >
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentMuted} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      edges={['top', 'bottom', 'left', 'right']}
      header={header}
      // ScrollView 안에서는 자식의 flex:1이 늘어나지 않는다 — 컨테이너가 자라야 가운데가 된다
      contentStyle={styles.content}
    >
      {inquiries.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Inbox size={22} color={colors.accent} />
          </View>
          {/*
            🔴 **못 불러온 것과 진짜로 없는 것을 갈라 말한다.** 오프라인에서
               "보낸 문의가 없어요"가 뜨면 방금 보낸 문의가 사라진 것처럼 보인다.
          */}
          <Text style={styles.emptyTitle}>
            {loadFailed ? t('inquiries.loadFailed') : t('inquiries.empty')}
          </Text>
          {!loadFailed && <Text style={styles.emptyBody}>{t('inquiries.emptyBody')}</Text>}
          {loadFailed && (
            <View style={styles.emptyAction}>
              <Button
                label={t('common.retry')}
                onPress={() => void refresh()}
                loading={loading}
                disabled={loading}
                variant="ghost"
              />
            </View>
          )}
        </View>
      ) : (
        inquiries.map((item) => (
          <InquiryCard key={item.id} item={item} isNew={unreadAtEntry.has(item.id)} />
        ))
      )}
    </Screen>
  );
}

function InquiryCard({ item, isNew }: { item: MyInquiry; isNew: boolean }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);

  /*
   * ⚠ 상태와 답변을 **각각 독립적으로 그린다.** `resolved`인데 `reply`가 null인 조합이
   *   가능하다(운영자가 답변 없이 닫은 경우) — 상태에서 답변 유무를 추론하면 그 칸에서 깨진다.
   */
  const hasReply = item.reply !== null && item.reply.trim().length > 0;

  return (
    <Card>
      <View style={styles.cardTop}>
        <View style={styles.categoryChip}>
          {CATEGORY_ICONS[item.category](colors.accent)}
          <Text style={styles.categoryLabel}>{t(CATEGORY_KEYS[item.category])}</Text>
        </View>
        <View style={[styles.statusChip, hasReply && styles.statusChipDone]}>
          <Text style={[styles.statusLabel, hasReply && styles.statusLabelDone]}>
            {t(STATUS_KEYS[item.status])}
          </Text>
        </View>
        {/* 새 답변 표시. 'NEW' 글자를 쓰지 않는다 — 번역이 하나 늘고 언어마다 폭이 달라진다 */}
        {isNew && <View style={styles.newDot} />}
        <Text style={styles.date}>{formatListDate(item.createdAt.slice(0, 10))}</Text>
      </View>

      <Text style={styles.question}>{item.content}</Text>

      {hasReply ? (
        <View style={styles.reply}>
          <View style={styles.replyHead}>
            <CornerDownRight size={14} color={colors.accent} />
            <Text style={styles.replyLabel}>{t('inquiries.replyLabel')}</Text>
            {item.repliedAt !== null && (
              <Text style={styles.replyDate}>{formatListDate(item.repliedAt.slice(0, 10))}</Text>
            )}
          </View>
          <Text style={styles.replyBody}>{item.reply}</Text>
        </View>
      ) : (
        // 답변이 없는 동안 아무것도 없으면 "보내진 게 맞나" 싶어진다. 기다리는 중임을 밝힌다.
        <Text style={styles.awaiting}>{t('inquiries.awaitingReply')}</Text>
      )}
    </Card>
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
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingTop: spacing.xl,
    },
    emptyIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
      marginBottom: spacing.sm,
    },
    emptyTitle: {
      ...typography.subtitle,
      color: colors.text,
    },
    emptyBody: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
    },
    emptyAction: {
      marginTop: spacing.md,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
      backgroundColor: colors.accentSoft,
    },
    categoryLabel: {
      ...typography.caption,
      color: colors.accent,
    },
    statusChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceMuted,
    },
    statusChipDone: {
      // 배경만 바꾸는 스타일에도 radius를 다시 적는다(CLAUDE.md §10 — 안드로이드에서 사각형이 된다)
      borderRadius: radius.full,
      backgroundColor: colors.accent,
    },
    statusLabel: {
      ...typography.caption,
      color: colors.textMuted,
    },
    statusLabelDone: {
      color: colors.textOnAccent,
    },
    newDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.danger,
    },
    date: {
      ...typography.caption,
      color: colors.textMuted,
      marginLeft: 'auto',
    },
    question: {
      ...typography.body,
      color: colors.text,
      lineHeight: 22,
    },
    awaiting: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.sm,
    },
    reply: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      gap: spacing.xs,
    },
    replyHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    replyLabel: {
      ...typography.label,
      color: colors.accent,
    },
    replyDate: {
      ...typography.caption,
      color: colors.textMuted,
      marginLeft: 'auto',
    },
    replyBody: {
      ...typography.body,
      color: colors.text,
      lineHeight: 22,
    },
  });
