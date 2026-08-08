import { Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components/TextField';
import { normalizeTagName } from '@/features/diary/api/tag-repository';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  /** 많이 쓴 태그 — 눌러서 바로 추가 */
  suggestions?: string[];
}

const MAX_TAGS = 10;

export function TagInput({ tags, onChange, suggestions = [] }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const name = normalizeTagName(raw);
    if (name === null) {
      setDraft('');
      return;
    }
    // 대소문자를 무시하고 중복을 막는다 — DB 유일 인덱스와 같은 기준(DIARY_SYSTEM §1.3).
    const exists = tags.some((tag) => tag.toLowerCase() === name.toLowerCase());
    if (!exists && tags.length < MAX_TAGS) {
      onChange([...tags, name]);
    }
    setDraft('');
  };

  const remove = (name: string) => {
    onChange(tags.filter((tag) => tag !== name));
  };

  const canAdd = normalizeTagName(draft) !== null && tags.length < MAX_TAGS;

  const unusedSuggestions = suggestions.filter(
    (suggestion) => !tags.some((tag) => tag.toLowerCase() === suggestion.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      {tags.length > 0 && (
        <View style={styles.chips}>
          {tags.map((tag) => (
            <Pressable
              key={tag}
              accessibilityRole="button"
              accessibilityLabel={`태그 ${tag} 삭제`}
              onPress={() => remove(tag)}
              style={styles.chip}
            >
              <Text style={styles.chipLabel}>#{tag}</Text>
              <X size={13} color={colors.accent} />
            </Pressable>
          ))}
        </View>
      )}

      {/*
        모바일에서 키보드 엔터에만 의존하면 추가 방법이 보이지 않는다.
        눈에 보이는 '추가' 버튼을 기본 경로로 두고, 엔터는 보조로 함께 받는다.
      */}
      <View style={styles.inputRow}>
        <TextField
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => add(draft)}
          // 스페이스로 확정하면 '제주 여행'처럼 띄어쓴 태그를 못 만든다 — 엔터만 받는다.
          blurOnSubmit={false}
          returnKeyType="done"
          placeholder={tags.length >= MAX_TAGS ? `태그는 ${MAX_TAGS}개까지예요` : '태그 추가'}
          editable={tags.length < MAX_TAGS}
          variant="boxed"
          tone="label"
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="태그 추가"
          onPress={() => add(draft)}
          disabled={canAdd === false}
          style={[styles.addButton, canAdd === false && styles.addButtonDisabled]}
        >
          <Plus size={18} color={canAdd ? colors.textOnAccent : colors.textMuted} />
        </Pressable>
      </View>

      {/*
        추천 태그는 '이미 붙은 태그'와 생김새가 비슷하면 지난 조각의 태그가 남아 있는 것처럼 보인다.
        실제로 그렇게 읽힌 적이 있어서(2026-08-08) 제목을 달고 + 기호를 붙여 눌러서 넣는 것임을 드러낸다.
      */}
      {unusedSuggestions.length > 0 && (
        <View style={styles.suggestionBlock}>
          <Text style={styles.suggestionTitle}>자주 쓴 태그 — 눌러서 추가</Text>
          <View style={styles.chips}>
            {unusedSuggestions.slice(0, 8).map((suggestion) => (
              <Pressable
                key={suggestion}
                accessibilityRole="button"
                accessibilityLabel={`태그 ${suggestion} 추가`}
                onPress={() => add(suggestion)}
                style={styles.suggestion}
              >
                <Plus size={12} color={colors.textMuted} />
                <Text style={styles.suggestionLabel}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
  },
  addButton: {
    width: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
  },
  chipLabel: {
    ...typography.label,
    color: colors.accent,
  },
  suggestionBlock: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  suggestionTitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
