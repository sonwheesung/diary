import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ImagePlus from 'lucide-react-native/icons/image-plus';
import List from 'lucide-react-native/icons/list';
import Smile from 'lucide-react-native/icons/face-slightly-smiling';
import Tag from 'lucide-react-native/icons/tag';
import Type from 'lucide-react-native/icons/type';
import X from 'lucide-react-native/icons/x';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { DatePickerSheet } from '@/components/DatePickerSheet';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import {
  createDiary,
  getDiaryById,
  getDiaryIdOnDate,
  getWrittenDates,
  updateDiary,
} from '@/features/diary/api/diary-repository';
import {
  discardDraftImages,
  discardImages,
  getImagesForDiary,
  saveImage,
  softDeleteImages,
} from '@/features/diary/api/image-store';
import { prepareInterstitial, showInterstitialIfReady } from '@/features/ads/api/interstitial';
import { listTagsByUsage } from '@/features/diary/api/tag-repository';
import { hasContent, usedImageIds } from '@/features/diary/blocks';
import { cleanFormat, readFormat, splitParagraph, withFormat } from '@/features/diary/format';
import { BlockEditor } from '@/features/diary/components/BlockEditor';
import { EmotionPicker } from '@/features/diary/components/EmotionPicker';
import { TagInput } from '@/features/diary/components/TagInput';
import { TextFormatSheet } from '@/features/diary/components/TextFormatSheet';
import { withExcursion } from '@/features/lock/excursion';
import { syncReminders } from '@/features/notification/api/reminder';
import { emotionLabel } from '@/features/diary/emotions';
import type { EmotionCode } from '@/features/diary/emotions';
import type { DiaryBlock, DiaryImage, TextFormat } from '@/features/diary/types';
import { monthRange, today } from '@/lib/date';
import { formatDayNumber, formatMonthYearWeekday } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface DiaryEditorProps {
  /** 수정할 조각 id. `null`이면 새로 쓴다 */
  diaryId: string | null;
  /** 새 조각의 기본 날짜. 캘린더에서 특정 날을 눌러 들어올 때 쓴다. 없으면 오늘 */
  initialDate?: string;
  /** 저장이 끝났을 때 */
  onSaved: () => void;
  /** 저장하지 않고 나갈 때 */
  onCancel: () => void;
}

/**
 * 조각 편집기 — 작성과 수정을 겸한다.
 *
 * **화면이 아니라 컴포넌트**다. 새 조각은 `app/write`가 모달로 띄우고, 기존 조각은
 * 상세 화면이 **같은 자리에서 모드만 바꿔** 끼운다 — 읽던 글을 고치는데 화면이 아래에서
 * 덮고 올라오면 다른 데로 이동한 것처럼 느껴진다(2026-08-08).
 *
 * 편집기를 두 벌 만들지 않는다 — 작성과 수정은 저장 방식만 다르고 화면은 같다.
 * 두 벌로 나누면 블록 편집·이미지 삽입·태그 로직이 그대로 복제되고, 한쪽만 고치는 사고가 난다.
 *
 * **페이지를 스크롤하지 않는다**(2026-08-08). 본문이 남는 공간을 전부 차지하고 그 안에서만
 * 스크롤한다. 감정·태그처럼 가끔 쓰는 선택은 본문 아래에 늘어놓지 않고 하단 툴바에서 시트로 연다 —
 * 글을 쓸 때마다 아래 요소가 밀리고, 뭔가 고르려면 스크롤부터 해야 하는 게 실제로 거슬렸다.
 */
export function DiaryEditor({ diaryId, initialDate, onSaved, onCancel }: DiaryEditorProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const editingId = diaryId;

  // 이미지는 조각이 저장되기 전에 삽입되므로, 붙일 diary_id가 먼저 있어야 한다.
  const draftIdRef = useRef(editingId ?? Crypto.randomUUID());
  const savedRef = useRef(false);
  // 커서가 어디 있었는지. 사진을 고르는 동안 입력창은 포커스를 잃으므로 마지막 위치를 들고 있어야 한다.
  const caretRef = useRef({ index: 0, position: 0 });
  /** 이번 편집에서 새로 넣은 이미지. 저장 없이 나가면 이것만 지운다(기존 사진은 건드리지 않는다) */
  const addedImageIdsRef = useRef<string[]>([]);
  /** 수정 전 상태. 바뀐 게 없으면 나갈 때 묻지 않는다 */
  const baselineRef = useRef<string | null>(null);
  /** 수정 모드에서 원래 날짜. 이 날짜는 '이미 쓴 날'로 막으면 안 된다(자기 자리다) */
  const originalDateRef = useRef<string | null>(null);

  const [blocks, setBlocks] = useState<DiaryBlock[]>([{ type: 'text', value: '' }]);
  const [images, setImages] = useState<Map<string, DiaryImage>>(new Map());
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [emotion, setEmotion] = useState<EmotionCode | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  /**
   * 조각의 날짜. **아직 못 정한 상태(`null`)가 있다** —
   * 오늘 조각이 이미 있으면 오늘로 시작할 수 없으므로 비워두고 고르게 한다(DIARY_SYSTEM §2).
   */
  const [entryDate, setEntryDate] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<TextFormat>({});
  const [openSheet, setOpenSheet] = useState<'date' | 'emotion' | 'tag' | 'format' | null>(
    null,
  );
  const [takenDates, setTakenDates] = useState<ReadonlySet<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const snapshot = JSON.stringify({ blocks, title, emotion, tags, entryDate });

  // 수정 모드: 기존 조각을 읽어 채운다.
  useEffect(() => {
    if (editingId === null) {
      return;
    }
    let alive = true;
    void (async () => {
      try {
        const [diary, existing] = await Promise.all([
          getDiaryById(editingId),
          getImagesForDiary(editingId),
        ]);
        if (!alive) {
          return;
        }
        if (diary === null) {
          setLoadError(t('write.notFound'));
          setLoading(false);
          return;
        }
        const loaded: DiaryBlock[] =
          diary.blocks.length > 0 ? diary.blocks : [{ type: 'text', value: '' }];
        setBlocks(loaded);
        /*
         * 커서 기본 위치를 **마지막 문단 끝**으로 둔다.
         * 수정 모드는 자동 포커스가 없어서, 글을 건드리지 않고 사진부터 넣으면 커서가
         * (0, 0)에 남아 사진이 글 맨 앞에 끼어든다.
         */
        const lastTextIndex = loaded.reduce(
          (found, block, index) => (block.type === 'text' ? index : found),
          -1,
        );
        const lastText = loaded[lastTextIndex];
        if (lastText !== undefined && lastText.type === 'text') {
          caretRef.current = { index: lastTextIndex, position: lastText.value.length };
        }
        setImages(new Map(existing.map((image) => [image.id, image])));
        setTitle(diary.title ?? '');
        setTags(diary.tags);
        setEmotion(diary.emotion);
        setEntryDate(diary.entryDate);
        originalDateRef.current = diary.entryDate;
        setLoading(false);
      } catch (error) {
        if (alive) {
          setLoadError(error instanceof Error ? error.message : t('write.loadFailed'));
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [editingId, t]);

  // 불러오기가 끝난 시점(작성 모드는 첫 렌더)을 '바뀐 것 없음'의 기준으로 삼는다.
  useEffect(() => {
    if (!loading && baselineRef.current === null) {
      baselineRef.current = snapshot;
    }
  }, [loading, snapshot]);

  /*
   * 새 조각의 날짜를 정한다.
   *
   * 오늘이 비어 있으면 **오늘**로 시작한다 — 대부분은 오늘 걸 쓰러 들어오므로 날짜를 묻지 않는다.
   * 오늘이 이미 차 있으면 **비워둔 채 날짜 시트를 먼저 연다**. 다 쓰고 나서 "저장할 수 없다"는
   * 말을 듣는 것보다, 처음에 날짜부터 고르는 편이 낫다.
   */
  useEffect(() => {
    if (editingId !== null) {
      return;
    }
    let alive = true;
    const desired = initialDate ?? today();
    void getDiaryIdOnDate(desired)
      .then((id) => {
        if (!alive) {
          return;
        }
        if (id === null) {
          setEntryDate(desired);
        } else {
          setOpenSheet('date');
        }
        setLoading(false);
      })
      // 확인에 실패하면 그대로 둔다. 저장 시점에 저장소가 한 번 더 막아준다.
      .catch(() => {
        if (alive) {
          setEntryDate(desired);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [editingId, initialDate]);

  // 하루에 조각은 하나다(DIARY_SYSTEM §2). 이미 쓴 날은 날짜 시트에서 고를 수 없어야 한다.
  const loadTakenDates = useCallback((month: string) => {
    const { from, to } = monthRange(month);
    void getWrittenDates(from, to)
      .then((dates) => setTakenDates(new Set(dates)))
      // 못 불러와도 달력은 열려야 한다. 저장 시점에 저장소가 한 번 더 막아준다.
      .catch(() => setTakenDates(new Set()));
  }, []);

  // 저장 직후에 로드를 시작하면 몇 초 뒤에 뜬다 — 늦게 뜨는 전면광고가 가장 짜증난다.
  useEffect(() => {
    if (editingId === null) {
      void prepareInterstitial();
    }
  }, [editingId]);

  useEffect(() => {
    void listTagsByUsage(8)
      .then((rows) => setSuggestions(rows.map((row) => row.name)))
      // 자동완성은 있으면 좋은 것이지 없으면 못 쓰는 게 아니다. 실패해도 조용히 넘어간다.
      .catch(() => setSuggestions([]));
  }, []);

  /*
   * 저장하지 않고 화면이 사라지면 그동안 복사해 둔 사진을 정리한다.
   * 안 지우면 작성을 취소할 때마다 기기에 사진이 영구히 쌓인다.
   *
   * 수정 모드에서는 **이번에 새로 넣은 것만** 지운다 — 조각 전체를 정리하면 취소 한 번에
   * 원래 있던 사진까지 사라진다.
   */
  useEffect(() => {
    const draftId = draftIdRef.current;
    const isEditing = editingId !== null;
    return () => {
      if (savedRef.current) {
        return;
      }
      if (isEditing) {
        // 정리 시점의 최신 목록이 필요하다 — 마운트 때 복사해두면 그 뒤에 넣은 사진이 남는다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        void discardImages(addedImageIdsRef.current);
      } else {
        void discardDraftImages(draftId);
      }
    };
  }, [editingId]);

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

    // 쪼갠 앞뒤 조각은 **원래 문단의 서식을 그대로 물려받는다.** 안 넘기면 사진을 끼우는 순간
    // 그 문단의 서식이 사라진다(`insertList`도 같다).
    const format = cleanFormat(readFormat(target));
    const next = [...blocks];
    next.splice(
      index,
      1,
      { type: 'text', value: target.value.slice(0, position), ...format },
      { type: 'image', imageId },
      { type: 'text', value: target.value.slice(position), ...format },
    );
    setBlocks(next);

    // 다음 사진은 방금 넣은 사진 아래로 들어가야 자연스럽다.
    caretRef.current = { index: index + 2, position: 0 };
  };

  /**
   * 커서가 있던 자리에 빈 목록을 끼운다 — 사진과 같은 규칙이다(DIARY_SYSTEM §1.2).
   * 항목 하나로 시작하고 그 칸에 포커스가 간다. 빈 목록만 덩그러니 두면 뭘 하라는지 모른다.
   */
  const insertList = () => {
    const { index, position } = caretRef.current;
    const target = blocks[index];

    if (target === undefined || target.type !== 'text') {
      setBlocks([...blocks, { type: 'list', items: [''] }, { type: 'text', value: '' }]);
      caretRef.current = { index: blocks.length + 1, position: 0 };
      return;
    }

    const format = cleanFormat(readFormat(target));
    const next = [...blocks];
    next.splice(
      index,
      1,
      { type: 'text', value: target.value.slice(0, position), ...format },
      { type: 'list', items: [''] },
      { type: 'text', value: target.value.slice(position), ...format },
    );
    setBlocks(next);
    caretRef.current = { index: index + 2, position: 0 };
  };

  /**
   * 커서가 놓인 **문단**에 서식을 건다 (DIARY_SYSTEM §1.1 텍스트 서식).
   *
   * 🔴 먼저 `splitParagraph`로 그 문단을 자기 블록으로 떼어낸다. RN `TextInput`은 한 입력창
   *   안에서 문단마다 다른 크기를 못 그리므로, 떼어내지 않으면 **고른 서식이 문단 하나가
   *   아니라 그 덩어리 전체에** 걸린다.
   *
   * 서식을 기본값으로 되돌리면 저장 시 `normalizeBlocks`가 이웃과 다시 합친다 —
   * 여기서 되돌릴 필요가 없다.
   */
  const applyFormat = (patch: TextFormat) => {
    const { index, position } = caretRef.current;
    const split = splitParagraph(blocks, index, position);
    const target = split.blocks[split.index];
    if (target === undefined || target.type !== 'text') {
      return;
    }

    const next = [...split.blocks];
    const merged = { ...readFormat(target), ...patch };
    next[split.index] = withFormat(target, merged);
    setBlocks(next);
    caretRef.current = { index: split.index, position: split.caret };
    setActiveFormat(cleanFormat(merged));
  };

  /** 시트를 열 때 커서가 놓인 문단의 현재 서식을 읽어둔다 — 뭘 고른 상태인지 보여야 한다 */
  const openFormatSheet = () => {
    const target = blocks[caretRef.current.index];
    setActiveFormat(target === undefined ? {} : cleanFormat(readFormat(target)));
    setOpenSheet('format');
  };

  const addImage = async () => {
    /*
     * 권한 다이얼로그와 선택기는 앱을 백그라운드로 보낸다. 잠금은 나가면 즉시 걸리므로
     * 감싸지 않으면 **사진을 넣을 때마다 잠금 화면을 만난다** — 사용자는 앱을 떠난 적이 없다(§7.1).
     */
    const result = await withExcursion(async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return null;
      }
      return ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        /*
         * 여기서 압축하지 않는다(1 = 재인코딩 없음). 축소·압축은 `saveImage`가 한 번만 한다 —
         * 여기서 0.8로 굽고 저장할 때 또 0.8로 구우면 화질만 두 번 깎이고 용량은 그만큼 안 준다.
         */
        quality: 1,
      });
    });

    if (result === null) {
      Alert.alert(t('write.photoPermissionTitle'), t('write.photoPermissionBody'));
      return;
    }
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
      addedImageIdsRef.current.push(image.id);
      insertImageAtCaret(image.id);
    } catch {
      Alert.alert(t('write.photoFailedTitle'), t('common.retry'));
    }
  };

  /** 본문에서 빠진 사진 정리. 이번에 넣었던 것은 되살릴 게 없으니 지우고, 원래 있던 것은 묻어둔다. */
  const reconcileImages = async () => {
    const used = new Set(usedImageIds(blocks));
    const dropped = [...images.keys()].filter((imageId) => !used.has(imageId));
    if (dropped.length === 0) {
      return;
    }
    const added = new Set(addedImageIdsRef.current);
    await discardImages(dropped.filter((imageId) => added.has(imageId)));
    await softDeleteImages(dropped.filter((imageId) => !added.has(imageId)));
  };

  const save = async () => {
    // entryDate는 canSave에도 들어 있지만, 여기서 좁혀야 타입이 통과한다.
    if (!canSave || entryDate === null) {
      return;
    }
    setSaving(true);
    try {
      if (editingId === null) {
        await createDiary({ id: draftIdRef.current, blocks, title, emotion, tags, entryDate });
      } else {
        await updateDiary(editingId, { blocks, title, emotion, tags, entryDate });
      }
      // 저장이 성공한 뒤에 정리한다 — 먼저 지우면 저장이 실패했을 때 사진만 사라진다.
      await reconcileImages();
      savedRef.current = true;
      onSaved();

      /*
       * 리마인더 재예약. **오늘 쓴 사람에게 "오늘 조각을 남겨보세요"가 가면 안 된다**
       * (`docs/NOTIFICATION_SYSTEM.md` §1). 로컬 알림은 발송 시점에 조건을 볼 수 없어서,
       * 조건이 확정되는 이 자리에서 예약을 다시 맞춘다.
       *
       * ⚠ `await`하지 않는다 — 저장은 이미 끝났고, 알림 때문에 화면 전환이 늦어지면 안 된다.
       *   실패해도 `syncReminders()`가 안에서 삼킨다.
       */
      void syncReminders();

      /*
       * 광고는 **저장과 화면 전환이 끝난 뒤**에 띄운다(CLAUDE.md §7).
       * 저장 앞에 두면 광고 실패가 저장을 막고, 전환 앞에 두면 "저장됐나?" 싶은 채로
       * 광고를 보게 된다. 수정에는 띄우지 않는다 — 등록(저장)된 순간만이다.
       */
      if (editingId === null) {
        void showInterstitialIfReady();
      }
    } catch (error) {
      setSaving(false);
      Alert.alert(
        t('write.saveFailedTitle'),
        error instanceof Error ? error.message : t('common.retry'),
      );
    }
  };

  /*
   * 저장 전 확인 (DIARY_SYSTEM §8.1, 2026-08-10 사용자 결정).
   *
   * 기둥 1(쓰기 마찰 최소화)과 맞바꾼 탭 하나다. 수정 저장이 옛 내용을 **되돌릴 수 없게**
   * 덮어쓰기 때문이고, 새 조각도 같은 흐름으로 둬야 "어떤 저장은 묻고 어떤 저장은 안 묻는"
   * 예측 불가가 안 생긴다.
   *
   * 취소해도 편집 상태는 그대로 남는다 — 돌아와 이어 쓸 수 있어야 한다.
   */
  const confirmSave = () => {
    if (!canSave) {
      return;
    }
    const isNew = editingId === null;
    Alert.alert(
      isNew ? t('write.confirmSaveTitle') : t('write.confirmUpdateTitle'),
      isNew ? t('write.confirmSaveBody') : t('write.confirmUpdateBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.save'), onPress: () => void save() },
      ],
    );
  };

  /*
   * 나갈 때 물어볼 만큼 잃을 게 있는가.
   * 새 조각에서 날짜만 골라둔 상태는 잃을 게 없다 — 여기서 붙잡으면 성가시기만 하다.
   */
  const changed = baselineRef.current !== null && baselineRef.current !== snapshot;
  const worthKeeping =
    editingId !== null ||
    hasContent(blocks) ||
    title.trim().length > 0 ||
    tags.length > 0 ||
    emotion !== null;
  const dirty = changed && worthKeeping;

  const close = () => {
    // 쓰다 만 글을 말없이 버리지 않는다. 손댄 게 없으면 묻지 않는다.
    if (dirty) {
      Alert.alert(
        editingId === null ? t('write.discardWriteTitle') : t('write.discardEditTitle'),
        t('write.discardBody'),
        [
          { text: t('write.discardContinue'), style: 'cancel' },
          { text: t('write.discardLeave'), style: 'destructive', onPress: onCancel },
        ],
      );
      return;
    }
    onCancel();
  };

  /*
   * 제목은 **선택**이다(DIARY_SYSTEM §1, 2026-08-19 사용자 결정 — 2026-08-08 필수화를 되돌렸다).
   * 저장 조건은 본문뿐이다. 빈 제목은 `normalizeTitle`이 `null`로 바꾸고,
   * 목록·검색·상세는 이미 `title !== null`로 가려 그린다.
   */
  const canSave = hasContent(blocks) && !saving && !loading && entryDate !== null;
  const selectedEmotion = emotion === null ? undefined : emotionLabel(emotion);

  /*
   * 수정 중인 조각이 차지한 날짜는 '이미 쓴 날'이 아니다.
   * 원래 날짜를 빼두지 않으면, 날짜를 옮겼다가 되돌리려 할 때 자기 자리를 못 고른다.
   */
  const selectableTakenDates = useMemo(() => {
    const original = originalDateRef.current;
    if (original === null) {
      return takenDates;
    }
    const next = new Set(takenDates);
    next.delete(original);
    return next;
  }, [takenDates]);

  const header = (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={close}
        hitSlop={12}
      >
        <X size={24} color={colors.text} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
        onPress={confirmSave}
        disabled={!canSave}
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.textOnAccent} />
        ) : (
          <Text style={[styles.saveLabel, !canSave && styles.saveLabelDisabled]}>
            {t('common.save')}
          </Text>
        )}
      </Pressable>
    </View>
  );

  if (loading || loadError !== null) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} scroll={false} header={header}>
        <View style={styles.center}>
          {loadError === null ? (
            <ActivityIndicator color={colors.accentMuted} />
          ) : (
            <Text style={styles.loadError}>{loadError}</Text>
          )}
        </View>
      </Screen>
    );
  }

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
          accessibilityLabel={t('write.changeDate')}
          onPress={() => setOpenSheet('date')}
          style={styles.dateButton}
          hitSlop={8}
        >
          {entryDate === null ? (
            // 날짜를 못 정한 상태. 눌러야 할 곳이라는 게 보여야 하므로 강조색을 쓴다.
            <View style={styles.dateRestGroup}>
              <Text style={styles.datePlaceholder}>{t('write.pickDate')}</Text>
              <ChevronDown size={16} color={colors.accent} />
            </View>
          ) : (
            <>
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
            </>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            selectedEmotion === undefined
              ? t('write.pickMood')
              : t('write.moodOf', { label: selectedEmotion })
          }
          onPress={() => setOpenSheet('emotion')}
          style={[styles.emotionButton, selectedEmotion !== undefined && styles.emotionButtonSet]}
        >
          {selectedEmotion === undefined ? (
            <Smile size={18} color={colors.textMuted} />
          ) : (
            <Text style={styles.emotionLabel}>{selectedEmotion}</Text>
          )}
        </Pressable>
      </View>

      <TextField
        value={title}
        onChangeText={setTitle}
        placeholder={t('write.titlePlaceholder')}
        tone="title"
      />

      {/*
        제목이 비어 저장을 못 하는 상태를 말없이 두지 않는다. 다만 빈 화면에서부터 잔소리하지 않도록
        **뭔가 쓰기 시작한 뒤에만** 띄운다.
      */}

      <BlockEditor
        blocks={blocks}
        images={images}
        onChange={setBlocks}
        onCaretChange={(index, position) => {
          caretRef.current = { index, position };
        }}
        // 새로 쓸 때만 커서를 넣는다. 읽으러 들어온 글을 수정할 땐 키보드가 먼저 뜨면 방해된다.
        autoFocus={editingId === null}
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
        <ToolbarButton label={t('write.photo')} onPress={() => void addImage()}>
          <ImagePlus size={22} color={colors.text} />
        </ToolbarButton>
        <ToolbarButton label={t('write.list')} onPress={insertList}>
          <List size={22} color={colors.text} />
        </ToolbarButton>
        <ToolbarButton label={t('write.format')} onPress={openFormatSheet}>
          <Type size={22} color={colors.text} />
        </ToolbarButton>
        <ToolbarButton
          label={t('write.tag')}
          onPress={() => setOpenSheet('tag')}
          badge={tags.length}
        >
          <Tag size={22} color={colors.text} />
        </ToolbarButton>
        <ToolbarButton label={t('write.mood')} onPress={() => setOpenSheet('emotion')}>
          <Smile size={22} color={colors.text} />
        </ToolbarButton>
      </View>

      <DatePickerSheet
        visible={openSheet === 'date'}
        value={entryDate}
        // 아직 오지 않은 하루는 기록할 수 없다(DIARY_SYSTEM §3).
        maxDate={today()}
        takenDates={selectableTakenDates}
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
        title={t('write.moodSheet')}
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

      <BottomSheet
        visible={openSheet === 'format'}
        onClose={() => setOpenSheet(null)}
        title={t('write.formatSheet')}
      >
        <TextFormatSheet value={activeFormat} onChange={applyFormat} />
      </BottomSheet>

      <BottomSheet
        visible={openSheet === 'tag'}
        onClose={() => setOpenSheet(null)}
        title={t('write.tagSheet')}
      >
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
  const styles = useStyles(createStyles);
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

const createStyles = (colors: Palette) =>
  StyleSheet.create({
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
      flexShrink: 1,
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
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadError: {
      ...typography.body,
      color: colors.danger,
    },
    datePlaceholder: {
      ...typography.subtitle,
      color: colors.accent,
      flexShrink: 1,
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
