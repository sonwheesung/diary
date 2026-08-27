import { Image } from 'expo-image';
import Trash2 from 'lucide-react-native/icons/trash-2';
import X from 'lucide-react-native/icons/x';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TextInput } from 'react-native';

import { TextField } from '@/components/TextField';
import { resolveImageUri } from '@/features/diary/api/image-store';
import { readFormat, removeBlockAt } from '@/features/diary/format';
import { textStyleFor } from '@/features/diary/text-style';
import type { DiaryBlock, DiaryImage } from '@/features/diary/types';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
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
  /**
   * `reason`이 붙는 이유: **프로그램이 블록을 쪼개도 `selection`이 발화한다.**
   * 사진·목록을 끼우면 원래 입력창의 `value`가 짧아지고 RN이 선택 변화를 보고하는데,
   * 그건 사용자가 커서를 옮긴 것이 아니다. 바깥에서 둘을 구분해 걸러낸다.
   */
  onCaretChange?: (
    blockIndex: number,
    position: number,
    reason: 'focus' | 'selection' | 'program',
  ) => void;
  /** 첫 텍스트 블록에 바로 포커스를 준다(새 조각을 쓰러 들어온 경우) */
  autoFocus?: boolean;
  /**
   * 특정 블록으로 포커스를 옮겨 달라는 요청.
   *
   * 서식을 걸면 문단이 떨어져 나가 블록 인덱스가 밀리는데, **네이티브 포커스는 원래 입력창에
   * 남는다.** 그대로 두면 시트를 닫고 이어 쓸 때 글이 엉뚱한 문단에 들어간다.
   * `nonce`는 같은 블록으로 두 번 연달아 옮길 때도 효과가 다시 돌게 하는 값이다.
   */
  focusRequest?: { index: number; nonce: number } | null;
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
  focusRequest = null,
}: BlockEditorProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  // 남는 공간의 실제 높이. 레이아웃 전에는 0이라 첫 그림에만 대체값을 쓴다.
  const [areaHeight, setAreaHeight] = useState(0);
  const cap = areaHeight > 0 ? areaHeight : FALLBACK_HEIGHT;

  /** 블록 인덱스 → 그 입력창. 포커스를 옮기려면 네이티브 노드가 필요하다 */
  const inputs = useRef(new Map<number, TextInput>());

  useEffect(() => {
    if (focusRequest === null) {
      return;
    }
    inputs.current.get(focusRequest.index)?.focus();
  }, [focusRequest]);

  const firstTextIndex = blocks.findIndex((block) => block.type === 'text');

  const updateListItem = (blockIndex: number, itemIndex: number, value: string) => {
    const target = blocks[blockIndex];
    if (target === undefined || target.type !== 'list') {
      return;
    }
    const items = [...target.items];
    items[itemIndex] = value;
    const next = [...blocks];
    next[blockIndex] = { type: 'list', items };
    onChange(next);
  };

  /** 엔터: 항목 추가. 단 **빈 항목에서 누르면 목록을 끝낸다**(그 항목을 지우고 빠져나온다). */
  const submitListItem = (blockIndex: number, itemIndex: number) => {
    const target = blocks[blockIndex];
    if (target === undefined || target.type !== 'list') {
      return;
    }
    if ((target.items[itemIndex] ?? '').trim().length === 0) {
      removeListItem(blockIndex, itemIndex);
      return;
    }
    const items = [...target.items];
    items.splice(itemIndex + 1, 0, '');
    const next = [...blocks];
    next[blockIndex] = { type: 'list', items };
    onChange(next);
  };

  /** 항목 삭제. 마지막 하나를 지우면 **목록 블록 자체를 걷어낸다** — 빈 목록이 남으면 지저분하다. */
  const removeListItem = (blockIndex: number, itemIndex: number) => {
    const target = blocks[blockIndex];
    if (target === undefined || target.type !== 'list') {
      return;
    }
    const items = target.items.filter((_, i) => i !== itemIndex);
    if (items.length === 0) {
      /*
       * 🔴 목록만 빼고 끝내면 **앞뒤 텍스트 사이에 빈 문단이 남고, 지울 손동작이 없다.**
       *   빈 칸에서는 백스페이스를 눌러도 onChangeText 가 안 불리기 때문이다
       *   (DIARY_SYSTEM §1.1 — 실기기 신고, 2026-08-27). 걷어내는 쪽이 뒷정리를 한다.
       */
      const healed = removeBlockAt(blocks, blockIndex);
      onChange(healed.blocks);
      onCaretChange?.(healed.index, healed.caret, 'program');
      return;
    }
    const next = [...blocks];
    next[blockIndex] = { type: 'list', items };
    onChange(next);
  };
  const isSoleBlock = blocks.length === 1;

  const updateText = (index: number, value: string) => {
    const target = blocks[index];
    if (target === undefined || target.type !== 'text') {
      return;
    }
    const next = [...blocks];
    // ⚠ `{ type: 'text', value }`로 새로 만들면 **글자를 한 자 칠 때마다 서식이 지워진다.**
    next[index] = { ...target, value };
    onChange(next);
  };

  const removeBlock = (index: number) => {
    /*
     * 사진을 걷어내면 앞뒤 문단이 인접한 채 남는다 — 목록과 **같은 문제**이므로 같은 함수를 쓴다.
     * `removeBlockAt`이 붙일 수 있으면 붙이고, 서식이 달라 못 붙이면 앞 블록 끝에 커서를 둔다.
     * 'program' — 우리가 옮긴 것이니 믿되, 뒤따라올 selection 보고는 막아야 한다(§1.1 커서 잠금).
     */
    const healed = removeBlockAt(blocks, index);
    onChange(healed.blocks);
    onCaretChange?.(healed.index, healed.caret, 'program');
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
                ref={(node) => {
                  if (node === null) {
                    inputs.current.delete(index);
                  } else {
                    inputs.current.set(index, node);
                  }
                }}
                value={block.value}
                onChangeText={(value) => updateText(index, value)}
                placeholder={index === firstTextIndex ? t('write.bodyPlaceholder') : ''}
                multiline
                textAlignVertical="top"
                autoFocus={autoFocus && index === firstTextIndex}
                onFocus={() => onCaretChange?.(index, block.value.length, 'focus')}
                // 선택 영역이 곧 커서 위치다. 여기서 받아두지 않으면 사진이 항상 맨 끝에 붙는다.
                onSelectionChange={(event) =>
                  onCaretChange?.(index, event.nativeEvent.selection.start, 'selection')
                }
                style={[
                  // 글쓴이가 건 서식. 읽기 화면과 **같은 함수**를 써야 쓸 때와 읽을 때가 안 갈린다
                  textStyleFor(readFormat(block), colors),
                  // 본문 하나뿐이면 영역을 꽉 채운다 — 어디를 눌러도 글쓰기로 들어간다.
                  index === firstTextIndex && isSoleBlock
                    ? { height: cap }
                    : { minHeight: FOLLOWING_MIN_HEIGHT, maxHeight: cap },
                ]}
              />
            );
          }

          if (block.type === 'list') {
            return (
              <View key={`list-${index}`} style={styles.listBlock}>
                {block.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.listRow}>
                    <View style={styles.bullet} />
                    <TextField
                      value={item}
                      onChangeText={(value) => updateListItem(index, itemIndex, value)}
                      placeholder={t('write.listItemPlaceholder')}
                      autoFocus={item.length === 0 && itemIndex === block.items.length - 1}
                      /*
                       * 엔터로 다음 항목을 만든다. 목록은 연달아 쓰는 물건이라 매번 +를 누르게 하면
                       * 리듬이 끊긴다. 다만 **빈 항목에서 엔터를 치면 목록을 끝낸다** —
                       * 그게 목록을 빠져나오는 유일하게 자연스러운 손동작이다.
                       */
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => submitListItem(index, itemIndex)}
                      style={styles.listInput}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('write.removeListItem')}
                      onPress={() => removeListItem(index, itemIndex)}
                      hitSlop={8}
                    >
                      <X size={14} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            );
          }

          const image = images.get(block.imageId);
          return (
            <View key={`image-${block.imageId}`} style={styles.imageBlock}>
              {image === undefined || image.blobState === 'missing' ? (
                /*
                 * 이미지 메타를 못 찾거나(파일 유실·데이터 불일치) 복원이 파일을 못 받아온 경우
                 * 본문 전체를 죽이지 않는다. **둘의 문구는 다르다** — 하나는 일시적일 수 있고
                 * `'missing'`은 영구다.
                 */
                <View style={styles.imageMissing}>
                  <Text style={styles.imageMissingText}>
                    {image === undefined ? t('write.imageLoadFailed') : t('backup.photoMissing')}
                  </Text>
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
                accessibilityLabel={t('write.removeImage')}
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

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    area: {
      flex: 1,
    },
    flex: {
      flex: 1,
    },
    container: {
      gap: spacing.md,
    },
    listBlock: {
      gap: spacing.xs,
      paddingVertical: spacing.xs,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    bullet: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.textMuted,
    },
    listInput: {
      flex: 1,
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
