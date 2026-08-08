import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ChevronDown, CircleAlert, ImagePlus, Smile, Tag, X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { DatePickerSheet } from '@/components/DatePickerSheet';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import {
  createDiary,
  getDiaryIdOnDate,
  getWrittenDates,
} from '@/features/diary/api/diary-repository';
import { discardDraftImages, saveImage } from '@/features/diary/api/image-store';
import { listTagsByUsage } from '@/features/diary/api/tag-repository';
import { hasContent } from '@/features/diary/blocks';
import { BlockEditor } from '@/features/diary/components/BlockEditor';
import { EmotionPicker } from '@/features/diary/components/EmotionPicker';
import { TagInput } from '@/features/diary/components/TagInput';
import { findEmotion } from '@/features/diary/emotions';
import type { EmotionCode } from '@/features/diary/emotions';
import type { DiaryBlock, DiaryImage } from '@/features/diary/types';
import { monthRange, today } from '@/lib/date';
import { formatDayNumber, formatMonthYearWeekday } from '@/lib/format';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 조각 작성.
 *
 * **페이지를 스크롤하지 않는다**(2026-08-08). 본문이 남는 공간을 전부 차지하고 그 안에서만
 * 스크롤한다. 감정·태그처럼 가끔 쓰는 선택은 본문 아래에 늘어놓지 않고 하단 툴바에서 시트로 연다 —
 * 글을 쓸 때마다 아래 요소가 밀리고, 뭔가 고르려면 스크롤부터 해야 하는 게 실제로 거슬렸다.
 */
export default function WriteScreen() {
  // 이미지는 조각이 저장되기 전에 삽입되므로, 붙일 diary_id가 먼저 있어야 한다.
  const draftIdRef = useRef(Crypto.randomUUID());
  const savedRef = useRef(false);
  // 커서가 어디 있었는지. 사진을 고르는 동안 입력창은 포커스를 잃으므로 마지막 위치를 들고 있어야 한다.
  const caretRef = useRef({ index: 0, position: 0 });

  const [blocks, setBlocks] = useState<DiaryBlock[]>([{ type: 'text', value: '' }]);
  const [images, setImages] = useState<Map<string, DiaryImage>>(new Map());
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [emotion, setEmotion] = useState<EmotionCode | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [entryDate, setEntryDate] = useState(today);
  const [openSheet, setOpenSheet] = useState<'date' | 'emotion' | 'tag' | null>(null);
  const [takenDates, setTakenDates] = useState<ReadonlySet<string>>(new Set());
  const [dateTaken, setDateTaken] = useState(false);
  const [saving, setSaving] = useState(false);

  /*
   * 고른 날짜에 이미 조각이 있는지 **미리** 본다.
   *
   * 저장할 때 막으면 다 쓰고 나서 못 쓴다는 말을 듣게 된다 — 그건 화가 나는 일이다.
   * 들어온 순간 알려주고, 저장 버튼을 처음부터 죽여둔다.
   */
  useEffect(() => {
    let alive = true;
    void getDiaryIdOnDate(entryDate)
      .then((id) => {
        if (alive) {
          setDateTaken(id !== null);
        }
      })
      // 확인에 실패하면 막지 않는다. 저장 시점에 저장소가 한 번 더 본다.
      .catch(() => {
        if (alive) {
          setDateTaken(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [entryDate]);

  // 오늘 이미 썼다면 글을 쓰기 전에 날짜부터 고르게 한다.
  useEffect(() => {
    if (dateTaken) {
      setOpenSheet((current) => (current === null ? 'date' : current));
    }
  }, [dateTaken]);

  // 하루에 조각은 하나다(DIARY_SYSTEM §2). 이미 쓴 날은 날짜 시트에서 고를 수 없어야 한다.
  const loadTakenDates = useCallback((month: string) => {
    const { from, to } = monthRange(month);
    void getWrittenDates(from, to)
      .then((dates) => setTakenDates(new Set(dates)))
      // 못 불러와도 달력은 열려야 한다. 저장 시점에 저장소가 한 번 더 막아준다.
      .catch(() => setTakenDates(new Set()));
  }, []);

  useEffect(() => {
    void listTagsByUsage(8)
      .then((rows) => setSuggestions(rows.map((row) => row.name)))
      // 자동완성은 있으면 좋은 것이지 없으면 못 쓰는 게 아니다. 실패해도 조용히 넘어간다.
      .catch(() => setSuggestions([]));
  }, []);

  // 저장하지 않고 화면이 사라지면 그동안 복사해 둔 사진을 정리한다.
  // 안 지우면 작성을 취소할 때마다 기기에 사진이 영구히 쌓인다.
  useEffect(() => {
    const draftId = draftIdRef.current;
    return () => {
      if (!savedRef.current) {
        void discardDraftImages(draftId);
      }
    };
  }, []);

  /**
   * 커서가 있던 자리에 사진을 끼운다(DIARY_SYSTEM §1.2).
   * 그 자리에서 텍스트 블록을 앞뒤로 쪼개고 사이에 이미지 블록을 넣는다 —
   * 항상 맨 끝에 붙이면 "원하는 위치에 사진" 이라는 요구가 성립하지 않는다.
   */
  const insertImageAtCaret = (imageId: string) => {
    const { index, position } = caretRef.current;
    const target = blocks[index];

    if (target === undefined || target.type !== 'text') {
      // 커서를 한 번도 두지 않았거나 그 블록이 사라진 경우엔 맨 끝에 붙인다.
      // 사진 뒤에 빈 텍스트 블록을 둔다 — 이어 쓸 자리가 없으면 글이 사진에서 끊긴다.
      setBlocks([...blocks, { type: 'image', imageId }, { type: 'text', value: '' }]);
      caretRef.current = { index: blocks.length + 1, position: 0 };
      return;
    }

    const next = [...blocks];
    next.splice(
      index,
      1,
      { type: 'text', value: target.value.slice(0, position) },
      { type: 'image', imageId },
      { type: 'text', value: target.value.slice(position) },
    );
    setBlocks(next);

    // 다음 사진은 방금 넣은 사진 아래로 들어가야 자연스럽다.
    caretRef.current = { index: index + 2, position: 0 };
  };

  const addImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('사진 접근 권한이 필요해요', '설정에서 사진 접근을 허용해 주세요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (asset === undefined) {
      return;
    }

    try {
      const image = await saveImage({
        diaryId: draftIdRef.current,
        sourceUri: asset.uri,
        width: asset.width,
        height: asset.height,
      });
      setImages((prev) => new Map(prev).set(image.id, image));
      insertImageAtCaret(image.id);
    } catch {
      Alert.alert('사진을 넣지 못했어요', '다시 시도해 주세요.');
    }
  };

  const save = async () => {
    if (!hasContent(blocks) || saving) {
      return;
    }
    setSaving(true);
    try {
      await createDiary({
        id: draftIdRef.current,
        blocks,
        title,
        emotion,
        tags,
        entryDate,
      });
      savedRef.current = true;
      router.back();
    } catch (error) {
      setSaving(false);
      Alert.alert(
        '저장하지 못했어요',
        error instanceof Error ? error.message : '다시 시도해 주세요.',
      );
    }
  };

  const close = () => {
    // 쓰다 만 글을 말없이 버리지 않는다.
    if (hasContent(blocks) || title.trim().length > 0) {
      Alert.alert('작성을 그만둘까요?', '지금까지 쓴 내용은 저장되지 않아요.', [
        { text: '계속 쓰기', style: 'cancel' },
        { text: '그만두기', style: 'destructive', onPress: () => router.back() },
      ]);
      return;
    }
    router.back();
  };

  const canSave = hasContent(blocks) && !saving && !dateTaken;
  const selectedEmotion = emotion === null ? undefined : findEmotion(emotion);

  const header = (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={close} hitSlop={12}>
        <X size={24} color={colors.text} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
        onPress={() => void save()}
        disabled={!canSave}
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.textOnAccent} />
        ) : (
          <Text style={[styles.saveLabel, !canSave && styles.saveLabelDisabled]}>저장</Text>
        )}
      </Pressable>
    </View>
  );

  return (
    // 탭이 없는 모달이라 아래 인셋도 직접 챙긴다. 페이지 스크롤은 쓰지 않는다.
    <Screen
      edges={['top', 'bottom', 'left', 'right']}
      scroll={false}
      header={header}
      contentStyle={styles.content}
    >
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="날짜 바꾸기"
          onPress={() => setOpenSheet('date')}
          style={styles.dateButton}
          hitSlop={8}
        >
          <Text style={styles.dateDay}>{formatDayNumber(entryDate)}</Text>
          {/*
            아이콘에는 베이스라인이 없다. 큰 숫자와 같은 줄에 그냥 두면 혼자 아래로 떨어지고,
            바깥에서 가운데 정렬하면 이번엔 큰 숫자를 기준으로 가운데라 작은 글씨와 어긋난다.
            **작은 글씨와 한 덩어리로 묶어** 그 안에서 가운데 정렬해야 높이가 맞는다.
          */}
          <View style={styles.dateRestGroup}>
            <Text style={styles.dateRest}>{formatMonthYearWeekday(entryDate)}</Text>
            <ChevronDown size={14} color={colors.textMuted} />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            selectedEmotion === undefined ? '기분 고르기' : `기분 ${selectedEmotion.label}`
          }
          onPress={() => setOpenSheet('emotion')}
          style={[styles.emotionButton, selectedEmotion !== undefined && styles.emotionButtonSet]}
        >
          {selectedEmotion === undefined ? (
            <Smile size={18} color={colors.textMuted} />
          ) : (
            <Text style={styles.emotionLabel}>{selectedEmotion.label}</Text>
          )}
        </Pressable>
      </View>

      {dateTaken && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다른 날짜 고르기"
          onPress={() => setOpenSheet('date')}
          style={styles.notice}
        >
          <CircleAlert size={16} color={colors.danger} />
          <Text style={styles.noticeText}>
            이 날에는 이미 조각이 있어요. 눌러서 다른 날짜를 골라주세요.
          </Text>
        </Pressable>
      )}

      <TextField value={title} onChangeText={setTitle} placeholder="제목 (선택)" tone="title" />

      <BlockEditor
        blocks={blocks}
        images={images}
        onChange={setBlocks}
        onCaretChange={(index, position) => {
          caretRef.current = { index, position };
        }}
        autoFocus
      />

      {/* 시트를 열지 않아도 뭘 골랐는지는 보여야 한다 */}
      {tags.length > 0 && (
        <View style={styles.tagRow}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagChipLabel}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.toolbar}>
        <ToolbarButton label="사진" onPress={() => void addImage()}>
          <ImagePlus size={22} color={colors.text} />
        </ToolbarButton>
        <ToolbarButton label="태그" onPress={() => setOpenSheet('tag')} badge={tags.length}>
          <Tag size={22} color={colors.text} />
        </ToolbarButton>
        <ToolbarButton label="기분" onPress={() => setOpenSheet('emotion')}>
          <Smile size={22} color={colors.text} />
        </ToolbarButton>
      </View>

      <DatePickerSheet
        visible={openSheet === 'date'}
        value={entryDate}
        // 아직 오지 않은 하루는 기록할 수 없다(DIARY_SYSTEM §3).
        maxDate={today()}
        takenDates={takenDates}
        onMonthChange={loadTakenDates}
        onSelect={(date) => {
          setEntryDate(date);
          setOpenSheet(null);
        }}
        onClose={() => setOpenSheet(null)}
      />

      <BottomSheet
        visible={openSheet === 'emotion'}
        onClose={() => setOpenSheet(null)}
        title="오늘의 기분"
      >
        <EmotionPicker
          value={emotion}
          onChange={(next) => {
            setEmotion(next);
            // 고르면 닫는다. 해제한 경우는 열어둔다 — 다시 고르려는 참일 가능성이 높다.
            if (next !== null) {
              setOpenSheet(null);
            }
          }}
        />
      </BottomSheet>

      <BottomSheet visible={openSheet === 'tag'} onClose={() => setOpenSheet(null)} title="태그">
        <TagInput tags={tags} onChange={setTags} suggestions={suggestions} />
      </BottomSheet>
    </Screen>
  );
}

function ToolbarButton({
  label,
  onPress,
  badge = 0,
  children,
}: {
  label: string;
  onPress: () => void;
  badge?: number;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.toolButton}
    >
      {children}
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{badge}</Text>
        </View>
      )}
    </Pressable>
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
  saveButton: {
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  saveButtonDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  saveLabel: {
    ...typography.label,
    color: colors.textOnAccent,
  },
  saveLabelDisabled: {
    color: colors.textMuted,
  },
  content: {
    gap: spacing.md,
    // 툴바가 바닥에 붙으므로 아래 여백을 두지 않는다.
    paddingBottom: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateRestGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateDay: {
    ...typography.display,
    color: colors.text,
  },
  dateRest: {
    ...typography.label,
    color: colors.textMuted,
  },
  emotionButton: {
    minWidth: 38,
    height: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  emotionButtonSet: {
    backgroundColor: colors.accentSoft,
  },
  emotionLabel: {
    ...typography.label,
    color: colors.accent,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  noticeText: {
    ...typography.caption,
    color: colors.danger,
    flex: 1,
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
  tagChipLabel: {
    ...typography.caption,
    color: colors.accent,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    // 화면 양옆 여백을 뚫고 바닥에 붙는 띠로 보이게 한다.
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  toolButton: {
    width: 48,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    ...typography.caption,
    fontSize: 10,
    lineHeight: 16,
    color: colors.textOnAccent,
  },
});
