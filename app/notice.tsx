import { router } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useNoticeStore } from '@/features/notice/store';
import type { AnnouncementItem } from '@/lib/common-server/types';
import { formatListDate } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** 서버가 주는 kind는 자유 문자열이다 — 아는 것만 번역하고 모르면 그대로 보여준다. */
const KIND_KEYS: Record<string, string> = {
  notice: 'notice.kindNotice',
  event: 'notice.kindEvent',
  update: 'notice.kindUpdate',
};

/**
 * 공지사항 (MVP §8).
 *
 * 목록은 앱 실행당 1회 받아둔 `bootstrap` 응답에서 꺼낸다 — 화면을 열 때마다 서버를 두드리지 않는다.
 * 들어온 시점에 전부 읽음으로 기록하되, **화면에 뜬 NEW 배지는 그대로 둔다**:
 * 들어오자마자 배지가 사라지면 무엇이 새 글이었는지 알 수 없다.
 */
export default function NoticeScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);

  const loaded = useNoticeStore((state) => state.loaded);
  const announcements = useNoticeStore((state) => state.announcements);
  const readIds = useNoticeStore((state) => state.readIds);
  const markAllRead = useNoticeStore((state) => state.markAllRead);

  /*
   * 입장 시점의 안읽음을 **스냅샷으로 뜬다.**
   * readIds를 그대로 구독하면 바로 아래 markAllRead가 반영되는 순간 표시가 눈앞에서 사라져,
   * 무엇이 새 글이었는지 알 수 없게 된다.
   */
  const [unreadAtEntry, setUnreadAtEntry] = useState<ReadonlySet<string>>(new Set());
  const snapshotTaken = useRef(false);

  useEffect(() => {
    if (!loaded || snapshotTaken.current) {
      return;
    }
    snapshotTaken.current = true;
    const read = new Set(readIds);
    setUnreadAtEntry(new Set(announcements.filter((item) => !read.has(item.id)).map((i) => i.id)));
    markAllRead();
  }, [loaded, readIds, announcements, markAllRead]);

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
      <Text style={styles.headerTitle}>{t('notice.title')}</Text>
    </View>
  );

  return (
    <Screen
      edges={['top', 'bottom', 'left', 'right']}
      header={header}
      // ScrollView 안에서는 자식의 flex:1이 늘어나지 않는다 — 컨테이너가 자라야 가운데가 된다
      contentStyle={styles.content}
    >
      {!loaded ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentMuted} />
        </View>
      ) : announcements.length === 0 ? (
        <View style={styles.center}>
          {/* 서버가 죽어도 빈 목록으로 보인다 — 굳이 에러라고 겁주지 않는다 */}
          <Text style={styles.emptyTitle}>{t('notice.empty')}</Text>
          <Text style={styles.emptyBody}>{t('notice.emptyBody')}</Text>
        </View>
      ) : (
        announcements.map((item) => (
          <NoticeCard key={item.id} item={item} isNew={unreadAtEntry.has(item.id)} />
        ))
      )}
    </Screen>
  );
}

function NoticeCard({ item, isNew }: { item: AnnouncementItem; isNew: boolean }) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);
  const kindKey = KIND_KEYS[item.kind];

  return (
    <Card>
      <View style={styles.cardTop}>
        <View style={styles.kindChip}>
          <Text style={styles.kindLabel}>{kindKey === undefined ? item.kind : t(kindKey)}</Text>
        </View>
        {item.pinned && (
          <View style={[styles.kindChip, styles.pinnedChip]}>
            <Text style={[styles.kindLabel, styles.pinnedLabel]}>{t('notice.pinned')}</Text>
          </View>
        )}
        {isNew && <View style={styles.newDot} />}
        <Text style={styles.date}>{formatListDate(item.startsAt.slice(0, 10))}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardBody}>{item.body}</Text>
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
    emptyTitle: {
      ...typography.subtitle,
      color: colors.text,
    },
    emptyBody: {
      ...typography.caption,
      color: colors.textMuted,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    kindChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
      backgroundColor: colors.accentSoft,
    },
    pinnedChip: {
      borderRadius: radius.full,
      backgroundColor: colors.surfaceMuted,
    },
    kindLabel: {
      ...typography.caption,
      color: colors.accent,
    },
    pinnedLabel: {
      color: colors.textMuted,
    },
    /* 새 공지 표시. 'NEW' 글자를 쓰지 않는다 — 번역 대상이 하나 늘고 언어마다 폭이 달라진다 */
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
    cardTitle: {
      ...typography.body,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    cardBody: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 20,
    },
  });
