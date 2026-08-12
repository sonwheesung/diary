import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import Search from 'lucide-react-native/icons/search';
import X from 'lucide-react-native/icons/x';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { searchDiaries } from '@/features/diary/api/diary-repository';
import { getImagesForDiaries, resolveImageUri } from '@/features/diary/api/image-store';
import { listTagsByUsage } from '@/features/diary/api/tag-repository';
import { emotionLabel } from '@/features/diary/emotions';
import type { Diary, DiaryImage } from '@/features/diary/types';
import { formatListDate, previewText } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** 한 글자 칠 때마다 조회하면 손이 빠른 사람에게 낭비다. 멈춘 뒤에 찾는다 */
const DEBOUNCE_MS = 250;

/**
 * 검색 — 제목·본문·태그를 부분 문자열로 찾는다(DIARY_SYSTEM §6).
 *
 * 검색어를 지우면 결과 대신 **자주 쓴 태그**를 보여준다. 빈 화면을 두느니
 * 눌러서 바로 찾을 수 있는 단서를 주는 편이 낫다.
 *
 * ⚠ **탭이 아니다**(2026-08-12 결정). 다섯 칸 중 하나를 AI 리포트에 내주고
 *   검색은 조각을 찾으러 갈 때만 열리는 화면이 됐다 — 홈·모든 조각의 돋보기가 입구다.
 *   그래서 배너를 두지 않는다(§7 "탭 화면만")고, `edges`에 아래를 넣는다(탭바가 없다).
 */
export default function SearchScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Diary[]>([]);
  const [thumbnails, setThumbnails] = useState<Map<string, DiaryImage>>(new Map());
  const [tags, setTags] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  const trimmed = keyword.trim();

  // 태그 후보는 화면에 올 때마다 새로 읽는다 — 방금 쓴 조각의 태그가 빠져 있으면 안 된다.
  useFocusEffect(
    useCallback(() => {
      void listTagsByUsage(12)
        .then((rows) => setTags(rows.map((row) => row.name)))
        .catch(() => setTags([]));
    }, []),
  );

  useEffect(() => {
    if (trimmed.length === 0) {
      setResults([]);
      setSearching(false);
      return;
    }

    let alive = true;
    setSearching(true);
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const found = await searchDiaries(trimmed);
          const imageMap = await getImagesForDiaries(found.map((diary) => diary.id));
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
          setResults(found);
          setThumbnails(firstImages);
        } catch {
          if (alive) {
            setResults([]);
          }
        } finally {
          if (alive) {
            setSearching(false);
          }
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [trimmed]);

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
      <View style={styles.field}>
        <Search size={18} color={colors.textMuted} />
        <TextField
          value={keyword}
          onChangeText={setKeyword}
          placeholder={t('search.placeholder')}
          returnKeyType="search"
          autoCorrect={false}
          style={styles.input}
        />
        {keyword.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('search.clear')}
            onPress={() => setKeyword('')}
            hitSlop={10}
          >
            <X size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      {trimmed.length === 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t('search.frequentTags')}</Text>
          {tags.length === 0 ? (
            <Text style={styles.hint}>{t('search.noTags')}</Text>
          ) : (
            <View style={styles.tagRow}>
              {tags.map((tag) => (
                <Pressable
                  key={tag}
                  accessibilityRole="button"
                  onPress={() => setKeyword(tag)}
                  style={styles.tagChip}
                >
                  <Text style={styles.tagLabel}>#{tag}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      ) : searching ? (
        <ActivityIndicator color={colors.accentMuted} style={styles.loading} />
      ) : results.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>{t('search.emptyTitle')}</Text>
          <Text style={styles.emptyBody}>{t('search.emptyBody')}</Text>
        </Card>
      ) : (
        <>
          <Text style={styles.sectionTitle}>{t('search.resultCount', { total: results.length })}</Text>
          {results.map((diary) => (
            <ResultRow key={diary.id} diary={diary} thumbnail={thumbnails.get(diary.id)} />
          ))}
        </>
      )}
    </Screen>
  );
}

function ResultRow({ diary, thumbnail }: { diary: Diary; thumbnail: DiaryImage | undefined }) {
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
          {diary.tags.length > 0 && (
            <Text style={styles.rowTags} numberOfLines={1}>
              {diary.tags.map((tag) => `#${tag}`).join(' ')}
            </Text>
          )}
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
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    field: {
      // 뒤로가기 옆에서 남는 폭을 전부 먹는다 — 고정 폭이면 언어마다 어긋난다
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      height: 46,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    input: {
      flex: 1,
    },
    sectionTitle: {
      ...typography.label,
      color: colors.textMuted,
    },
    hint: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: -spacing.sm,
    },
    loading: {
      marginTop: spacing.lg,
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: -spacing.sm,
    },
    tagChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.accentSoft,
    },
    tagLabel: {
      ...typography.label,
      color: colors.accent,
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
    rowTags: {
      ...typography.caption,
      color: colors.accentMuted,
      marginTop: spacing.xs,
    },
  });
