import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import CalendarDays from 'lucide-react-native/icons/calendar-days';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import Search from 'lucide-react-native/icons/search';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DateJumpSheet } from '@/components/DateJumpSheet';
import { Screen } from '@/components/Screen';
import {
  getDiaryIdOnDate,
  getWrittenDates,
  listRecentDiaries,
} from '@/features/diary/api/diary-repository';
import { getImagesForDiaries, resolveImageUri } from '@/features/diary/api/image-store';
import { emotionLabel } from '@/features/diary/emotions';
import type { Diary, DiaryImage } from '@/features/diary/types';
import { monthRange, today } from '@/lib/date';
import { formatListDate, formatMonthLabel, previewText } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const PAGE_SIZE = 20;

/**
 * 모든 조각 — 홈의 *더보기*가 오는 곳.
 *
 * 무한 스크롤 대신 **더 보기 버튼**을 쓴다. 스크롤 위치를 감시해 자동으로 불러오면
 * 끝에 도달했는지 알 수 없고, 목록 끝에 뭐가 있는지도 알 수 없다.
 */
export default function DiariesScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const [pages, setPages] = useState(1);
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [thumbnails, setThumbnails] = useState<Map<string, DiaryImage>>(new Map());
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpMonth, setJumpMonth] = useState(today);
  const [writtenDates, setWrittenDates] = useState<ReadonlySet<string>>(new Set());

  /*
   * 지금까지 펼친 만큼을 **한 번에 다시 읽는다**.
   * 수정·삭제하고 돌아왔을 때 첫 장만 새로 읽으면 아래쪽이 낡은 채로 남는다.
   */
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      const limit = PAGE_SIZE * pages;
      void (async () => {
        try {
          const rows = await listRecentDiaries(limit);
          const imageMap = await getImagesForDiaries(rows.map((diary) => diary.id));
          if (!alive) {
            return;
          }
          const firstImages = new Map<string, DiaryImage>();
          for (const [diaryId, images] of imageMap) {
            const first = images[0];
            if (first !== undefined) {
              firstImages.set(diaryId, first);
            }
          }
          setDiaries(rows);
          setThumbnails(firstImages);
          setHasMore(rows.length === limit);
        } finally {
          if (alive) {
            setLoading(false);
          }
        }
      })();
      return () => {
        alive = false;
      };
    }, [pages]),
  );

  /*
   * 그 달에 조각이 있는 날을 읽는다. 시트를 열 때와 달을 넘길 때마다 부른다 —
   * 닫아둔 사이에 지웠을 수 있어 열 때마다 다시 읽는 쪽이 맞다.
   *
   * ⚠ 실패하면 그 달이 **통째로 빈 달처럼** 보인다. 캘린더 탭도 같은 상태라
   *   여기서만 다르게 굴지 않는다 — 로컬 SQLite 읽기라 실패가 드물다는 판단이고,
   *   고친다면 두 화면을 같이 고친다.
   */
  const showMonth = useCallback((month: string) => {
    setJumpMonth(month);
    const { from, to } = monthRange(month);
    void getWrittenDates(from, to)
      .then((dates) => setWrittenDates(new Set(dates)))
      .catch(() => setWrittenDates(new Set()));
  }, []);

  /*
   * 고른 날의 조각으로 간다. 시트가 **쓴 날만** 눌리게 하므로 여기 오는 날짜에는
   * 반드시 조각이 있다 — `null` 은 그 사이에 지워진 경우뿐이고 그때는 조용히 닫는다.
   */
  const jumpTo = (entryDate: string) => {
    setJumpOpen(false);
    void getDiaryIdOnDate(entryDate).then((id) => {
      if (id !== null) {
        router.push(`/diary/${id}`);
      }
    });
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
      <Text style={styles.headerTitle}>{t('diaries.title')}</Text>
      {/*
        검색이 탭에서 빠졌으므로(2026-08-12) **조각이 모여 있는 자리마다 돋보기를 둔다.**
        홈에만 두면 목록을 훑다가 못 찾았을 때 돌아 나가야 한다 — 찾고 싶어지는 자리가 여기다.
      */}
      <View style={styles.headerActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.search')}
          onPress={() => router.push('/search')}
          hitSlop={12}
        >
          <Search size={22} color={colors.textMuted} />
        </Pressable>
        {/*
          날짜로 건너뛰기(2026-09-10 사용자 요청). 목록을 눌러 내려가는 것 말고
          **한 번에 그 날로 가는 길**이 여기 필요하다 — 돋보기가 '무엇을 썼나'라면
          이건 '언제 썼나'다. 캘린더 탭과 겹쳐 보이지만 그쪽은 훑는 화면이고
          여기는 목록에서 벗어나지 않은 채 건너뛴다(`DIARY_SYSTEM.md` §6.1).
        */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('diaries.byDate')}
          onPress={() => {
            showMonth(jumpMonth);
            setJumpOpen(true);
          }}
          hitSlop={12}
        >
          <CalendarDays size={22} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );

  const jumpSheet = (
    <DateJumpSheet
      visible={jumpOpen}
      month={jumpMonth}
      onMonthChange={showMonth}
      writtenDates={writtenDates}
      onSelect={jumpTo}
      onClose={() => setJumpOpen(false)}
    />
  );

  if (loading) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} scroll={false} header={header}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentMuted} />
        </View>
        {jumpSheet}
      </Screen>
    );
  }

  if (diaries.length === 0) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} scroll={false} header={header}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>{t('diaries.empty')}</Text>
        </View>
        {jumpSheet}
      </Screen>
    );
  }

  let lastMonth = '';

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      {/*
        🔴 **목록은 자기 간격을 갖는다.** `Screen` 은 서로 다른 덩어리 사이를 벌리려고
          `gap: lg`(24)를 주는데, 여기서는 그것이 **항목 사이**에 그대로 걸려 카드가
          하나씩 떨어져 보였다(2026-09-10 사용자 지적). 목록은 촘촘해야 목록으로 읽힌다 —
          한 겹 감싸서 안쪽만 `sm`(8)로 좁힌다. 달 머리글만 `md`(16)로 띄워 무리를 가른다.
      */}
      <View style={styles.list}>
        {diaries.map((diary) => {
          // 목록이 길어지면 언제 적은 글인지 감이 사라진다 — 달이 바뀔 때마다 머리글을 끼운다.
          const month = formatMonthLabel(diary.entryDate);
          const isNewMonth = month !== lastMonth;
          lastMonth = month;

          return (
            <View key={diary.id} style={styles.item}>
              {isNewMonth && <Text style={styles.monthLabel}>{month}</Text>}
              <DiaryRow diary={diary} thumbnail={thumbnails.get(diary.id)} />
            </View>
          );
        })}
      </View>

      {hasMore && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setPages((current) => current + 1)}
          style={styles.more}
        >
          <Text style={styles.moreLabel}>{t('common.loadMore')}</Text>
        </Pressable>
      )}

      {jumpSheet}
    </Screen>
  );
}

function DiaryRow({ diary, thumbnail }: { diary: Diary; thumbnail: DiaryImage | undefined }) {
  const styles = useStyles(createStyles);
  const emotion = diary.emotion === null ? undefined : emotionLabel(diary.emotion);

  return (
    <Card onPress={() => router.push(`/diary/${diary.id}`)}>
      <View style={styles.row}>
        {thumbnail !== undefined && (
          <Image
            source={{ uri: resolveImageUri(thumbnail.fileName) }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={150}
          />
        )}
        <View style={styles.rowBody}>
          <View style={styles.rowMeta}>
            <Text style={styles.rowDate}>{formatListDate(diary.entryDate)}</Text>
            {emotion !== undefined && <Text style={styles.rowEmotion}>{emotion}</Text>}
          </View>
          {diary.title !== null && (
            <Text style={styles.rowTitle} numberOfLines={1}>
              {diary.title}
            </Text>
          )}
          <Text style={styles.rowPreview} numberOfLines={2}>
            {previewText(diary.plainText)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
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
    emptyTitle: {
      ...typography.body,
      color: colors.textMuted,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    list: {
      gap: spacing.sm,
    },
    item: {
      gap: spacing.xs,
    },
    monthLabel: {
      ...typography.label,
      color: colors.textMuted,
      marginTop: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    // 카드 끝까지 채우지 않는다 — 모서리를 깎고 여백 안에 넣어야 사진이 딱딱하지 않다.
    thumbnail: {
      width: 84,
      height: 84,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    rowBody: {
      flex: 1,
      gap: 2,
    },
    rowMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    rowDate: {
      ...typography.caption,
      color: colors.text,
      flexShrink: 1,
    },
    rowEmotion: {
      ...typography.caption,
      color: colors.accentMuted,
      flexShrink: 1,
    },
    rowTitle: {
      ...typography.subtitle,
      color: colors.text,
    },
    rowPreview: {
      ...typography.caption,
      color: colors.textMuted,
    },
    more: {
      alignSelf: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceMuted,
    },
    moreLabel: {
      ...typography.label,
      color: colors.accent,
    },
  });
