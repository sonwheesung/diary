import { Image } from 'expo-image';
import { router } from 'expo-router';
import Flame from 'lucide-react-native/icons/flame';
import Pencil from 'lucide-react-native/icons/pencil';
import Search from 'lucide-react-native/icons/search';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AdBanner } from '@/features/ads/components/AdBanner';
import { ReportReadyCard } from '@/features/ai/components/ReportReadyCard';
import { GraceBanner } from '@/features/backup/components/GraceBanner';
import { resolveImageUri } from '@/features/diary/api/image-store';
import { emotionLabel } from '@/features/diary/emotions';
import { useHomeData } from '@/features/diary/hooks/use-home-data';
import type { Diary, DiaryImage } from '@/features/diary/types';
import { today } from '@/lib/date';
import { formatFullDate, formatListDate, previewText, relativeDayLabel } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function HomeScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const { recent, thumbnails, streak, todayDiaryId, loading, error } = useHomeData();
  const wroteToday = todayDiaryId !== null;

  return (
    <Screen footer={<AdBanner />}>
      {/*
        ⚠ 백업이 지워지기까지의 카운트다운. **홈에 세우는 이유**는 백업 화면에 들어가는
          사람은 이미 아는 사람이기 때문이다 — 우리에겐 푸시가 없어서 앱을 여는 이 순간이
          유일한 통지 기회다(`docs/BACKUP_SYSTEM.md` §5). 유예가 아니면 아무것도 안 그린다.
      */}
      <GraceBanner />

      <View style={styles.header}>
        <Text style={styles.date}>{formatFullDate(today())}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.search')}
          onPress={() => router.push('/search')}
          hitSlop={12}
        >
          <Search size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.greeting}>
        {wroteToday ? t('home.greetingWritten') : t('home.greetingEmpty')}
      </Text>

      {/*
        조각 쓰기 **위**가 아니라 아래에 둔다. 홈의 첫 동선은 언제나 쓰러 가는 길이고(기둥 1),
        리포트는 지난주를 돌아보는 일이라 급하지 않다. 대신 최근 목록보다는 위에 둔다 —
        스크롤해야 보이면 알린 것이 아니다.
      */}
      {streak > 0 && (
        <View style={styles.streak}>
          <Flame size={16} color={colors.accent} />
          <Text style={styles.streakText}>{t('home.streak', { days: streak })}</Text>
        </View>
      )}

      {/*
        버튼은 언제나 '조각 쓰기' 하나다. 오늘 썼는지에 따라 목적지를 바꾸면
        지난 날짜로 쓰러 들어갈 문이 사라진다 — 날짜는 작성 화면이 정한다(DIARY_SYSTEM §2).
      */}
      <Button
        label={t('tabs.write')}
        fullWidth
        icon={<Pencil size={18} color={colors.textOnAccent} />}
        onPress={() => router.push('/write')}
      />

      <ReportReadyCard />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.recent')}</Text>
        {recent.length > 0 && (
          <Pressable accessibilityRole="button" onPress={() => router.push('/diaries')} hitSlop={8}>
            <Text style={styles.more}>{t('common.more')}</Text>
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
          <Text style={styles.emptyTitle}>{t('home.emptyTitle')}</Text>
          <Text style={styles.emptyBody}>{t('home.emptyBody')}</Text>
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
  const styles = useStyles(createStyles);
  const emotion = diary.emotion === null ? undefined : emotionLabel(diary.emotion);
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
