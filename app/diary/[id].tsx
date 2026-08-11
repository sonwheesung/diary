import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import Pencil from 'lucide-react-native/icons/pencil';
import Trash2 from 'lucide-react-native/icons/trash-2';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ImageViewer } from '@/components/ImageViewer';
import { Screen } from '@/components/Screen';
import { deleteDiary, getDiaryById } from '@/features/diary/api/diary-repository';
import { getImagesForDiary, resolveImageUri } from '@/features/diary/api/image-store';
import { DiaryEditor } from '@/features/diary/components/DiaryEditor';
import { emotionLabel } from '@/features/diary/emotions';
import type { Diary, DiaryImage } from '@/features/diary/types';
import { formatDayNumber, formatMonthYearWeekday } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 조각 상세 — 조회·수정·삭제 (MVP §4).
 *
 * 수정은 별도 화면을 만들지 않고 작성 화면을 `?id=`로 다시 쓴다. 편집기를 두 벌 두면
 * 블록·이미지·태그 로직이 복제되고 한쪽만 고치는 사고가 난다.
 */
export default function DiaryDetailScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';

  const [diary, setDiary] = useState<Diary | null>(null);
  const [images, setImages] = useState<Map<string, DiaryImage>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** 전체 보기로 열린 사진의 위치. 닫혀 있으면 null */
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  /** 같은 화면에서 읽기 ↔ 수정을 오간다. 화면을 새로 띄우지 않는다 */
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [found, imageList] = await Promise.all([getDiaryById(id), getImagesForDiary(id)]);
      setDiary(found);
      setImages(new Map(imageList.map((image) => [image.id, image])));
      setError(found === null ? t('detail.notFound') : null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('detail.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  // 다른 화면에 다녀와도 낡은 내용이 보이면 안 된다.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  // 수정 중에 안드로이드 뒤로가기는 화면을 닫는 게 아니라 **수정을 취소**해야 한다.
  useEffect(() => {
    if (!editing) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setEditing(false);
      return true;
    });
    return () => subscription.remove();
  }, [editing]);

  const confirmDelete = () => {
    Alert.alert(t('detail.deleteTitle'), t('detail.deleteBody'), [
      { text: t('common.keep'), style: 'cancel' },
      {
        text: t('detail.deleteConfirm'),
        style: 'destructive',
        onPress: () => {
          void deleteDiary(id)
            .then(() => router.back())
            .catch((caught: unknown) =>
              Alert.alert(
                t('detail.deleteFailed'),
                caught instanceof Error ? caught.message : t('common.retry'),
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
        accessibilityLabel={t('common.back')}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <ChevronLeft size={26} color={colors.text} />
      </Pressable>
      {/*
        아이콘 둘만 나란히 둔다(2026-08-10 사용자 결정, DIARY_SYSTEM §8.1).
        ⚠ 삭제가 오른쪽 끝 — 엄지가 가장 쉽게 닿는 자리다. 되돌릴 수 없는 동작이라
          `confirmDelete`의 확인창이 형식이 아니라 실질적인 안전장치다. 걷어내지 않는다.
        글자가 없어진 만큼 `accessibilityLabel`이 유일한 설명이 된다 — 반드시 남긴다.
      */}
      {diary !== null && (
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.edit')}
            onPress={() => setEditing(true)}
            hitSlop={12}
            style={styles.headerButton}
          >
            <Pencil size={20} color={colors.accent} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.delete')}
            onPress={confirmDelete}
            hitSlop={12}
            style={styles.headerButton}
          >
            <Trash2 size={20} color={colors.danger} />
          </Pressable>
        </View>
      )}
    </View>
  );

  if (editing) {
    return (
      <DiaryEditor
        diaryId={id}
        onSaved={() => {
          setEditing(false);
          void load();
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

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

  const emotion = diary.emotion === null ? undefined : emotionLabel(diary.emotion);

  // 전체 보기에서 넘겨볼 수 있게, 본문에 실제로 실린 사진만 순서대로 모은다.
  const viewableUris = diary.blocks
    .filter((block): block is Extract<typeof block, { type: 'image' }> => block.type === 'image')
    .map((block) => images.get(block.imageId))
    .filter((image): image is DiaryImage => image !== undefined)
    // 없는 사진은 넘겨보기에서도 뺀다 — 넘기다 빈 화면이 나오면 뷰어가 고장 난 것처럼 보인다.
    .filter((image) => image.blobState !== 'missing')
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
            <Text style={styles.emotionLabel}>{emotion}</Text>
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

        if (block.type === 'list') {
          return (
            <View key={`list-${index}`} style={styles.listBlock}>
              {block.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.listRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.listItem}>{item}</Text>
                </View>
              ))}
            </View>
          );
        }

        const image = images.get(block.imageId);
        if (image === undefined) {
          return (
            <View key={`image-${block.imageId}`} style={styles.imageMissing}>
              <Text style={styles.imageMissingText}>{t('detail.imageLoadFailed')}</Text>
            </View>
          );
        }
        /*
         * ⚠ **'없다'와 '못 읽었다'를 구분해서 말한다.** 복원은 행을 되살리지만 파일은
         *   따로 받아오므로, 못 받은 사진은 여기서 영구히 빈 자리다. 같은 문구를 쓰면
         *   사용자는 기다리면 나올 줄 알고 영영 기다린다.
         */
        if (image.blobState === 'missing') {
          return (
            <View key={`image-${block.imageId}`} style={styles.imageMissing}>
              <Text style={styles.imageMissingText}>{t('backup.photoMissing')}</Text>
              <Text style={styles.imageMissingHint}>{t('backup.photoMissingHint')}</Text>
            </View>
          );
        }
        // 본문에서는 4:3으로 잘라 보여준다 — 누르면 자르지 않은 전체를 본다.
        const uri = resolveImageUri(image.fileName);
        return (
          <Pressable
            key={`image-${block.imageId}`}
            accessibilityRole="imagebutton"
            accessibilityLabel={t('detail.viewImage')}
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

const createStyles = (colors: Palette) =>
  StyleSheet.create({
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
    listBlock: {
      gap: spacing.xs,
    },
    listRow: {
      flexDirection: 'row',
      // 항목이 두 줄이 되면 불릿은 첫 줄에 붙어야 한다 — 가운데 정렬하면 가운데로 내려간다.
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    bullet: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      marginTop: 9,
      backgroundColor: colors.textMuted,
    },
    listItem: {
      ...typography.body,
      flex: 1,
      color: colors.text,
      lineHeight: 24,
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
      textAlign: 'center',
    },
    imageMissingHint: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.xs,
      // 독일어는 두 배까지 길어진다 — 자르지 않고 줄바꿈으로 받는다(§9.1).
      paddingHorizontal: spacing.md,
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
