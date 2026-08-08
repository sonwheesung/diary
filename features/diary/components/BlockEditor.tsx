import { Image } from 'expo-image';
import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components/TextField';
import { resolveImageUri } from '@/features/diary/api/image-store';
import type { DiaryBlock, DiaryImage } from '@/features/diary/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface BlockEditorProps {
  blocks: DiaryBlock[];
  /** imageId → 이미지 메타. 화면에 그리려면 파일명이 필요하다 */
  images: Map<string, DiaryImage>;
  onChange: (blocks: DiaryBlock[]) => void;
  /**
   * 커서가 놓인 텍스트 블록과 그 안의 위치.
   * 사진을 **커서 자리에** 끼워 넣으려면 편집기 밖에서 이 값을 알아야 한다.
   */
  onCaretChange?: (blockIndex: number, position: number) => void;
  /** 첫 텍스트 블록에 바로 포커스를 준다(새 조각을 쓰러 들어온 경우) */
  autoFocus?: boolean;
}

/*
 * 본문은 **남는 공간을 전부 차지하고 그 안에서 스크롤**한다(2026-08-08).
 *
 * 페이지 전체가 스크롤되면 글을 쓸 때마다 아래 요소들이 밀리고, 감정·태그를 고르러 매번
 * 스크롤해야 한다. 그래서 작성 화면은 페이지 스크롤을 없애고 이 영역만 스크롤한다.
 *
 * 각 텍스트 칸은 영역 높이를 넘지 못한다(`maxHeight`). 그 지점부터는 **입력창이 자기 안에서**
 * 스크롤하므로 네이티브가 커서를 따라간다 — 바깥 스크롤뷰는 타이핑 중 커서를 따라오지 못한다.
 */
const FALLBACK_HEIGHT = 240;
/** 사진 뒤에 이어 쓰는 칸의 최소 높이. 여기까지 크게 잡으면 사진 한 장에 빈 화면이 한 장 생긴다 */
const FOLLOWING_MIN_HEIGHT = 44;

/**
 * 본문 편집기 (DIARY_SYSTEM §1.1).
 *
 * 텍스트 문단마다 TextInput을 두고 그 사이에 이미지 블록을 끼우는 구조다.
 * 한 입력창 안에 이미지를 인라인으로 넣는 방식은 RN에서 네이티브 제약이 크고,
 * WebView 에디터는 오프라인·잠금 중심 앱에 과한 무게와 보안 표면을 만든다.
 *
 * 이미지를 지우면 **앞뒤 텍스트 블록을 합치지 않는다** — 저장 시 normalizeBlocks가
 * 정리하므로 편집 중에 커서가 튀는 것보다 그대로 두는 편이 낫다.
 */
export function BlockEditor({
  blocks,
  images,
  onChange,
  onCaretChange,
  autoFocus = false,
}: BlockEditorProps) {
  // 남는 공간의 실제 높이. 레이아웃 전에는 0이라 첫 그림에만 대체값을 쓴다.
  const [areaHeight, setAreaHeight] = useState(0);
  const cap = areaHeight > 0 ? areaHeight : FALLBACK_HEIGHT;

  const firstTextIndex = blocks.findIndex((block) => block.type === 'text');
  const isSoleBlock = blocks.length === 1;

  const updateText = (index: number, value: string) => {
    const next = [...blocks];
    next[index] = { type: 'text', value };
    onChange(next);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
    // 블록이 빠지면 뒤 인덱스가 한 칸씩 당겨진다. 기억해 둔 커서를 그대로 두면
    // 다음 사진이 엉뚱한 문단에 들어간다 — 바로 앞 문단 끝으로 옮겨둔다.
    // Infinity는 slice가 '끝까지'로 받아준다.
    onCaretChange?.(Math.max(0, index - 1), Number.POSITIVE_INFINITY);
  };

  return (
    <View
      style={styles.area}
      onLayout={(event) => setAreaHeight(Math.round(event.nativeEvent.layout.height))}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {blocks.map((block, index) => {
          if (block.type === 'text') {
            return (
              <TextField
                key={`text-${index}`}
                value={block.value}
                onChangeText={(value) => updateText(index, value)}
                placeholder={index === firstTextIndex ? '오늘 하루는 어땠나요?' : ''}
                multiline
                textAlignVertical="top"
                autoFocus={autoFocus && index === firstTextIndex}
                onFocus={() => onCaretChange?.(index, block.value.length)}
                // 선택 영역이 곧 커서 위치다. 여기서 받아두지 않으면 사진이 항상 맨 끝에 붙는다.
                onSelectionChange={(event) =>
                  onCaretChange?.(index, event.nativeEvent.selection.start)
                }
                style={
                  // 본문 하나뿐이면 영역을 꽉 채운다 — 어디를 눌러도 글쓰기로 들어간다.
                  index === firstTextIndex && isSoleBlock
                    ? { height: cap }
                    : { minHeight: FOLLOWING_MIN_HEIGHT, maxHeight: cap }
                }
              />
            );
          }

          const image = images.get(block.imageId);
          return (
            <View key={`image-${block.imageId}`} style={styles.imageBlock}>
              {image === undefined ? (
                // 이미지 메타를 못 찾는 경우(파일 유실·데이터 불일치)에도 본문 전체를 죽이지 않는다.
                <View style={styles.imageMissing}>
                  <Text style={styles.imageMissingText}>이미지를 불러오지 못했어요</Text>
                </View>
              ) : (
                <Image
                  source={{ uri: resolveImageUri(image.fileName) }}
                  style={styles.image}
                  contentFit="cover"
                  transition={150}
                />
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="이미지 삭제"
                onPress={() => removeBlock(index)}
                hitSlop={8}
                style={styles.imageRemove}
              >
                <Trash2 size={16} color={colors.textOnAccent} />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    gap: spacing.md,
  },
  imageBlock: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  imageMissing: {
    width: '100%',
    aspectRatio: 4 / 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageMissingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  imageRemove: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    // 사진 위라 배경이 예측 불가 — 반투명 검정으로 대비를 보장한다.
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
