import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Pencil from 'lucide-react-native/icons/pencil';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { MonthGrid } from '@/components/MonthGrid';
import { Screen } from '@/components/Screen';
import { AdBanner } from '@/features/ads/components/AdBanner';
import { getWrittenDates, listDiariesByDate } from '@/features/diary/api/diary-repository';
import { getImagesForDiaries, resolveImageUri } from '@/features/diary/api/image-store';
import { emotionLabel } from '@/features/diary/emotions';
import type { Diary, DiaryImage } from '@/features/diary/types';
import { addMonths, isAfterToday, monthRange, today } from '@/lib/date';
import { formatListDate, formatMonthLabel, previewText } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 캘린더 — 어느 날에 조각을 남겼는지 한눈에 보고, 그날의 조각으로 들어간다.
 *
 * 달력에서는 **미래 날짜도 누를 수 있다**. 작성 화면과 달리 여기서 날짜를 누르는 건
 * '쓰겠다'가 아니라 '보겠다'이고, 못 누르게 하면 다음 달을 넘겨볼 수도 없다.
 */
export default function CalendarScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const [month, setMonth] = useState(today);
  const [selected, setSelected] = useState(today);
  const [writtenDates, setWrittenDates] = useState<ReadonlySet<string>>(new Set());
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [thumbnails, setThumbnails] = useState<Map<string, DiaryImage>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { from, to } = monthRange(month);
    const [dates, dayDiaries] = await Promise.all([
      getWrittenDates(from, to),
      listDiariesByDate(selected),
    ]);
    const imageMap = await getImagesForDiaries(dayDiaries.map((diary) => diary.id));

    const firstImages = new Map<string, DiaryImage>();
    for (const [diaryId, images] of imageMap) {
      const first = images[0];
      if (first !== undefined) {
        firstImages.set(diaryId, first);
      }
    }

    setWrittenDates(new Set(dates));
    setDiaries(dayDiaries);
    setThumbnails(firstImages);
    setLoading(false);
  }, [month, selected]);

  // 쓰거나 지우고 돌아왔을 때 점과 목록이 낡아 있으면 안 된다.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const goMonth = (delta: number) => {
    const next = addMonths(month, delta);
    setMonth(next);
    // 달을 넘기면 그 달 1일을 고른 상태로 둔다 — 지난달 날짜가 선택된 채로 남으면 헷갈린다.
    setSelected(`${next.slice(0, 8)}01`);
  };

  return (
    <Screen footer={<AdBanner />}>
      <View style={styles.monthRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.prevMonth')}
          onPress={() => goMonth(-1)}
          hitSlop={12}
        >
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.monthLabel}>{formatMonthLabel(month)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.nextMonth')}
          onPress={() => goMonth(1)}
          hitSlop={12}
        >
          <ChevronRight size={24} color={colors.text} />
        </Pressable>
      </View>

      <MonthGrid
        month={month}
        selected={selected}
        onSelect={setSelected}
        markedDates={writtenDates}
      />

      <View style={styles.dayHeader}>
        <Text style={styles.dayLabel}>{formatListDate(selected)}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accentMuted} />
      ) : diaries.length > 0 ? (
        diaries.map((diary) => (
          <DayCard key={diary.id} diary={diary} thumbnail={thumbnails.get(diary.id)} />
        ))
      ) : (
        <Card>
          <Text style={styles.emptyTitle}>{t('calendar.emptyDay')}</Text>
          {/* 아직 오지 않은 날은 쓸 수 없다(DIARY_SYSTEM §3) — 권하지도 않는다 */}
          {!isAfterToday(selected) && (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/write?date=${selected}`)}
              style={styles.emptyAction}
            >
              <Pencil size={15} color={colors.accent} />
              <Text style={styles.emptyActionLabel}>{t('calendar.writeThisDay')}</Text>
            </Pressable>
          )}
        </Card>
      )}
    </Screen>
  );
}

function DayCard({ diary, thumbnail }: { diary: Diary; thumbnail: DiaryImage | undefined }) {
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
          {emotion !== undefined && <Text style={styles.rowEmotion}>{emotion}</Text>}
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
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.md,
    },
    monthLabel: {
      ...typography.title,
      color: colors.text,
      flexShrink: 1,
    },
    dayHeader: {
      marginTop: -spacing.sm,
    },
    dayLabel: {
      ...typography.subtitle,
      color: colors.text,
    },
    emptyTitle: {
      ...typography.body,
      color: colors.textMuted,
    },
    emptyAction: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      marginTop: spacing.md,
    },
    emptyActionLabel: {
      ...typography.label,
      color: colors.accent,
      flexShrink: 1,
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
  });
