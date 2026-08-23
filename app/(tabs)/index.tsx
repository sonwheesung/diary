import { Image } from 'expo-image';
import { router } from 'expo-router';
import Feather from 'lucide-react-native/icons/feather';
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

      {/*
        🔴 **조각이 없으면 제목을 세우지 않는다.** 빈 목록 위의 "최근의 조각들"은
          첫 사용자에게 *"여기 뭔가 있어야 하는데 없다"* 로 읽힌다 — 없는 것의 이름을
          부르는 셈이다. 하나라도 있으면 그때 목록이 되고 제목이 필요해진다.
      */}
      {recent.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.recent')}</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/diaries')} hitSlop={8}>
            <Text style={styles.more}>{t('common.more')}</Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={colors.accentMuted} style={styles.loading} />
      ) : error !== null ? (
        <Card>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      ) : recent.length === 0 ? (
        /*
         * 🔴 **카드를 벗겼다.** 테두리 안에 두 줄만 있으면 "비어 있는 상자"가 되어
         *   고장 난 것처럼 보인다. 첫 화면에서 유일하게 남는 인상이라 조용한 여백이 낫다.
         * ⚠ **버튼을 넣지 않는다.** 위에 이미 `조각 쓰기`가 있고, 레퍼런스가 공통으로
         *   말하는 것이 *"하나의 CTA"* 다 — 같은 화면에 두 개를 두면 둘 다 약해진다.
         */
        <View style={styles.empty}>
          <Feather size={28} color={colors.accentMuted} />
          <Text style={styles.emptyTitle}>{t('home.emptyTitle')}</Text>
          <Text style={styles.emptyBody}>{t('home.emptyBody')}</Text>
        </View>
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
      // 돋보기와 나란한 행이라 같은 문제를 겪는다 — `Sun, August 23,`에서 연도가 사라졌다
      flexShrink: 1,
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
      flexShrink: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      ...typography.title,
      color: colors.text,
      flexShrink: 1,
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
    rowRelative: {
      ...typography.caption,
      color: colors.textMuted,
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
    /* 모바일 빈 상태는 가운데로 모은다 — 레퍼런스가 공통으로 말하는 한 가지다 */
    empty: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.lg,
    },
    emptyTitle: {
      ...typography.subtitle,
      color: colors.text,
      textAlign: 'center',
    },
    emptyBody: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    errorText: {
      ...typography.caption,
      color: colors.danger,
    },
  });
