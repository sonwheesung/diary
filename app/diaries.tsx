import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { listRecentDiaries } from '@/features/diary/api/diary-repository';
import { getImagesForDiaries, resolveImageUri } from '@/features/diary/api/image-store';
import { emotionLabel } from '@/features/diary/emotions';
import type { Diary, DiaryImage } from '@/features/diary/types';
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
      {/* 좌우 균형을 맞추는 빈 자리 — 제목이 가운데 오게 한다 */}
      <View style={styles.headerSpacer} />
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

  if (diaries.length === 0) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} scroll={false} header={header}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>{t('diaries.empty')}</Text>
        </View>
      </Screen>
    );
  }

  let lastMonth = '';

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      {diaries.map((diary) => {
        // 목록이 길어지면 언제 적은 글인지 감이 사라진다 — 달이 바뀔 때마다 머리글을 끼운다.
        const month = formatMonthLabel(diary.entryDate);
        const showMonth = month !== lastMonth;
        lastMonth = month;

        return (
          <View key={diary.id} style={styles.item}>
            {showMonth && <Text style={styles.monthLabel}>{month}</Text>}
            <DiaryRow diary={diary} thumbnail={thumbnails.get(diary.id)} />
          </View>
        );
      })}

      {hasMore && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setPages((current) => current + 1)}
          style={styles.more}
        >
          <Text style={styles.moreLabel}>{t('common.loadMore')}</Text>
        </Pressable>
      )}
    </Screen>
  );
}

function DiaryRow({ diary, thumbnail }: { diary: Diary; thumbnail: DiaryImage | undefined }) {
  const styles = useStyles(createStyles);
  const emotion = diary.emotion === null ? undefined : emotionLabel(diary.emotion);

  return (
    <Card onPress={() => router.push(`/diary/${diary.id}`)} flush>
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
    },
    headerSpacer: {
      width: 26,
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
    item: {
      gap: spacing.sm,
    },
    monthLabel: {
      ...typography.label,
      color: colors.textMuted,
      marginTop: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    thumbnail: {
      width: 84,
      height: 84,
      backgroundColor: colors.surfaceMuted,
    },
    rowBody: {
      flex: 1,
      padding: spacing.md,
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
    },
    rowEmotion: {
      ...typography.caption,
      color: colors.accentMuted,
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
