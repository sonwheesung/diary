import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ImageViewer } from '@/components/ImageViewer';
import { Screen } from '@/components/Screen';
import { deleteDiary, getDiaryById } from '@/features/diary/api/diary-repository';
import { getImagesForDiary, resolveImageUri } from '@/features/diary/api/image-store';
import { findEmotion } from '@/features/diary/emotions';
import type { Diary, DiaryImage } from '@/features/diary/types';
import { formatDayNumber, formatMonthYearWeekday } from '@/lib/format';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 조각 상세 — 조회·수정·삭제 (MVP §4).
 *
 * 수정은 별도 화면을 만들지 않고 작성 화면을 `?id=`로 다시 쓴다. 편집기를 두 벌 두면
 * 블록·이미지·태그 로직이 복제되고 한쪽만 고치는 사고가 난다.
 */
export default function DiaryDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';

  const [diary, setDiary] = useState<Diary | null>(null);
  const [images, setImages] = useState<Map<string, DiaryImage>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** 전체 보기로 열린 사진의 위치. 닫혀 있으면 null */
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // 수정하고 돌아왔을 때 낡은 내용이 보이면 안 된다 — 돌아올 때마다 다시 읽는다.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        try {
          const [found, imageList] = await Promise.all([getDiaryById(id), getImagesForDiary(id)]);
          if (!alive) {
            return;
          }
          setDiary(found);
          setImages(new Map(imageList.map((image) => [image.id, image])));
          setError(found === null ? '조각을 찾지 못했어요.' : null);
        } catch (caught) {
          if (alive) {
            setError(caught instanceof Error ? caught.message : '조각을 불러오지 못했어요.');
          }
        } finally {
          if (alive) {
            setLoading(false);
          }
        }
      })();
      return () => {
        alive = false;
      };
    }, [id]),
  );

  const confirmDelete = () => {
    Alert.alert('이 조각을 지울까요?', '지운 조각은 목록과 검색에서 사라져요.', [
      { text: '그대로 두기', style: 'cancel' },
      {
        text: '지우기',
        style: 'destructive',
        onPress: () => {
          void deleteDiary(id)
            .then(() => router.back())
            .catch((caught: unknown) =>
              Alert.alert(
                '지우지 못했어요',
                caught instanceof Error ? caught.message : '다시 시도해 주세요.',
              ),
            );
        },
      },
    ]);
  };

  const header = (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로"
        onPress={() => router.back()}
        hitSlop={12}
      >
        <ChevronLeft size={26} color={colors.text} />
      </Pressable>
      {diary !== null && (
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="삭제"
            onPress={confirmDelete}
            hitSlop={12}
            style={styles.headerButton}
          >
            <Trash2 size={20} color={colors.danger} />
          </Pressable>
          {/*
            아이콘만 두면 '누르면 뭐가 되는지'가 안 읽힌다. 상세는 읽기 전용이고
            여기가 유일한 편집 입구라, 작성 화면의 저장 버튼과 같은 모양으로 글자를 붙였다.
          */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="수정"
            onPress={() => router.push(`/write?id=${id}`)}
            style={styles.editButton}
          >
            <Pencil size={15} color={colors.textOnAccent} />
            <Text style={styles.editLabel}>수정</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  if (loading || diary === null) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} scroll={false} header={header}>
        <View style={styles.center}>
          {error === null ? (
            <ActivityIndicator color={colors.accentMuted} />
          ) : (
            <Text style={styles.error}>{error}</Text>
          )}
        </View>
      </Screen>
    );
  }

  const emotion = diary.emotion === null ? undefined : findEmotion(diary.emotion);

  // 전체 보기에서 넘겨볼 수 있게, 본문에 실제로 실린 사진만 순서대로 모은다.
  const viewableUris = diary.blocks
    .filter((block): block is Extract<typeof block, { type: 'image' }> => block.type === 'image')
    .map((block) => images.get(block.imageId))
    .filter((image): image is DiaryImage => image !== undefined)
    .map((image) => resolveImageUri(image.fileName));

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      <View style={styles.topRow}>
        <View style={styles.dateGroup}>
          <Text style={styles.dateDay}>{formatDayNumber(diary.entryDate)}</Text>
          <Text style={styles.dateRest}>{formatMonthYearWeekday(diary.entryDate)}</Text>
        </View>
        {emotion !== undefined && (
          <View style={styles.emotionChip}>
            <Text style={styles.emotionLabel}>{emotion.label}</Text>
          </View>
        )}
      </View>

      {diary.title !== null && <Text style={styles.title}>{diary.title}</Text>}

      {diary.blocks.map((block, index) => {
        if (block.type === 'text') {
          // 정규화를 거쳐 저장되므로 빈 텍스트 블록은 없어야 하지만, 옛 데이터를 믿지 않는다.
          if (block.value.trim().length === 0) {
            return null;
          }
          return (
            <Text key={`text-${index}`} style={styles.body}>
              {block.value}
            </Text>
          );
        }

        const image = images.get(block.imageId);
        if (image === undefined) {
          return (
            <View key={`image-${block.imageId}`} style={styles.imageMissing}>
              <Text style={styles.imageMissingText}>이미지를 불러오지 못했어요</Text>
            </View>
          );
        }
        // 본문에서는 4:3으로 잘라 보여준다 — 누르면 자르지 않은 전체를 본다.
        const uri = resolveImageUri(image.fileName);
        return (
          <Pressable
            key={`image-${block.imageId}`}
            accessibilityRole="imagebutton"
            accessibilityLabel="사진 전체 보기"
            onPress={() => setViewerIndex(viewableUris.indexOf(uri))}
          >
            <Image source={{ uri }} style={styles.image} contentFit="cover" transition={150} />
          </Pressable>
        );
      })}

      {diary.tags.length > 0 && (
        <View style={styles.tagRow}>
          {diary.tags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagLabel}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <ImageViewer
        visible={viewerIndex !== null}
        uris={viewableUris}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  editLabel: {
    ...typography.label,
    color: colors.textOnAccent,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    ...typography.body,
    color: colors.danger,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  dateDay: {
    ...typography.display,
    color: colors.text,
  },
  dateRest: {
    ...typography.label,
    color: colors.textMuted,
  },
  emotionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  emotionLabel: {
    ...typography.label,
    color: colors.accent,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  body: {
    ...typography.body,
    color: colors.text,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  imageMissing: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageMissingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
  },
  tagLabel: {
    ...typography.caption,
    color: colors.accent,
  },
});
