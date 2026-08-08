import { Image } from 'expo-image';
import { router } from 'expo-router';
import { BookOpen, CalendarPlus, Flame, Pencil, Search } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { resolveImageUri } from '@/features/diary/api/image-store';
import { findEmotion } from '@/features/diary/emotions';
import { useHomeData } from '@/features/diary/hooks/use-home-data';
import type { Diary, DiaryImage } from '@/features/diary/types';
import { today } from '@/lib/date';
import { formatFullDate, formatListDate, previewText, relativeDayLabel } from '@/lib/format';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function HomeScreen() {
  const { recent, thumbnails, streak, todayDiaryId, loading, error } = useHomeData();
  const wroteToday = todayDiaryId !== null;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.date}>{formatFullDate(today())}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="검색"
          onPress={() => router.push('/search')}
          hitSlop={12}
        >
          <Search size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.greeting}>
        {wroteToday ? '오늘의 조각을\n남겼어요.' : '오늘,\n어떤 조각을\n모으고 싶나요?'}
      </Text>

      {streak > 0 && (
        <View style={styles.streak}>
          <Flame size={16} color={colors.accent} />
          <Text style={styles.streakText}>{streak}일 연속 기록 중</Text>
        </View>
      )}

      {/*
        하루에 조각은 하나다(DIARY_SYSTEM §2). 오늘 이미 썼는데 *쓰기*로 보내면
        저장할 수 없는 화면에 데려다 놓는 꼴이다 — 주 동선을 *보기*로 바꾼다.
      */}
      <Button
        label={wroteToday ? '오늘의 조각 보기' : '조각 쓰기'}
        fullWidth
        icon={
          wroteToday ? (
            <BookOpen size={18} color={colors.textOnAccent} />
          ) : (
            <Pencil size={18} color={colors.textOnAccent} />
          )
        }
        onPress={() => router.push(wroteToday ? `/diary/${todayDiaryId}` : '/write')}
      />

      {/* 오늘 걸 썼다고 지난 날짜를 못 쓰게 되면 안 된다 — 옆길을 항상 열어둔다 */}
      {wroteToday && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/write')}
          style={styles.secondaryAction}
          hitSlop={8}
        >
          <CalendarPlus size={16} color={colors.accent} />
          <Text style={styles.secondaryLabel}>지난 날의 조각 쓰기</Text>
        </Pressable>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>최근의 조각들</Text>
        {recent.length > 0 && (
          <Pressable accessibilityRole="button" onPress={() => router.push('/diaries')} hitSlop={8}>
            <Text style={styles.more}>더보기</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accentMuted} style={styles.loading} />
      ) : error !== null ? (
        <Card>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      ) : recent.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>아직 모은 조각이 없어요</Text>
          <Text style={styles.emptyBody}>오늘의 첫 조각을 남겨보세요.</Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {recent.map((diary) => (
            <DiaryRow key={diary.id} diary={diary} thumbnail={thumbnails.get(diary.id)} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function DiaryRow({ diary, thumbnail }: { diary: Diary; thumbnail: DiaryImage | undefined }) {
  const emotion = diary.emotion === null ? undefined : findEmotion(diary.emotion);
  const relative = relativeDayLabel(diary.entryDate);

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
            {/* 오늘·어제는 날짜 옆에 덧붙인다 — 이것만 보여주면 며칠에 쓴 글인지 알 수 없다 */}
            {relative !== null && <Text style={styles.rowRelative}>{relative}</Text>}
            {emotion !== undefined && <Text style={styles.rowEmotion}>{emotion.label}</Text>}
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  date: {
    ...typography.label,
    color: colors.textMuted,
  },
  greeting: {
    ...typography.display,
    color: colors.text,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginTop: -spacing.sm,
  },
  streakText: {
    ...typography.label,
    color: colors.accent,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    marginTop: -spacing.sm,
  },
  secondaryLabel: {
    ...typography.label,
    color: colors.accent,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
  },
  more: {
    ...typography.label,
    color: colors.textMuted,
  },
  loading: {
    marginTop: spacing.lg,
  },
  list: {
    gap: spacing.sm,
    marginTop: -spacing.sm,
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
  rowRelative: {
    ...typography.caption,
    color: colors.textMuted,
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
  emptyTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  emptyBody: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
});
