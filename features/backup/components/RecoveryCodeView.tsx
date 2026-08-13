import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import {
  GROUP_SIZE,
  decodeRecoveryCode,
  groupCount,
  matchesGroup,
} from '@/features/backup/recovery-code';
import type { Palette } from '@/theme/palettes';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useStyles } from '@/theme/use-styles';

/**
 * 복구 코드 발급 화면 — **보여주고, 적었는지 되받아 확인한다.**
 *
 * ⚠ 되받아 확인하는 것이 이 화면의 존재 이유다. 확인이 없으면 이런 사용자가 생긴다:
 *   백업 켬 → 코드 1회 표시 → "나중에" → **백업은 정상 동작하고 앱은 "안전합니다"를
 *   계속 표시** → 폰 분실 → 코드 없음 → 끝.
 *   앱은 그 사람이 위험하다는 걸 알 수 있는데, 확인을 안 받으면 알 방법이 없다.
 *   그리고 **코드를 가진 유일한 순간이 지금**이다 — 그 뒤로는 대조 게이트가 막는다.
 *
 * ⚠ 캡처를 막지 않는다. 막으면 저장을 아예 안 한다 — §7.1의 "잠그지 않은 사람의 캡처를
 *   막는 건 부당하다"와 같은 판단이다.
 */

interface Props {
  code: string;
  /** 되받아 확인이 끝났을 때 */
  onConfirmed: () => void;
  /** 나중에 하기 — 확인 없이 넘어간다. 설정에 배지가 남는다 */
  onSkip: () => void;
}

export function RecoveryCodeView({ code, onConfirmed, onSkip }: Props) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);

  /** 되물을 그룹. 매번 다른 자리를 물어야 화면을 보고 베끼는 걸 조금이라도 줄인다 */
  const [askIndex] = useState(() => Math.floor(Math.random() * groupCount()));
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  const [wrong, setWrong] = useState(false);

  const secret = decodeForCheck(code);

  const submit = () => {
    if (secret !== null && matchesGroup(answer, secret, askIndex)) {
      onConfirmed();
      return;
    }
    setWrong(true);
  };

  if (asking) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>{t('backup.confirmCodeTitle')}</Text>
        <Text style={styles.body}>{t('backup.confirmCodeBody', { index: askIndex + 1 })}</Text>

        <TextInput
          value={answer}
          onChangeText={(next) => {
            setWrong(false);
            setAnswer(next);
          }}
          autoCapitalize="characters"
          autoCorrect={false}
          spellCheck={false}
          maxLength={GROUP_SIZE + 2}
          accessibilityLabel={t('backup.confirmCodeBody', { index: askIndex + 1 })}
          style={[styles.answer, wrong && styles.answerWrong]}
        />
        {wrong && <Text style={styles.error}>{t('backup.confirmCodeWrong')}</Text>}

        <View style={styles.actions}>
          <Button label={t('backup.confirmCodeSubmit')} onPress={submit} fullWidth />
          <Pressable accessibilityRole="button" onPress={() => setAsking(false)} hitSlop={8}>
            <Text style={styles.subtle}>{t('backup.confirmCodeBack')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{t('backup.codeTitle')}</Text>
      <Text style={styles.body}>{t('backup.codeBody')}</Text>

      {/*
        ⚠ 선택 가능한 텍스트로 둔다. 길게 눌러 복사하는 것이 비밀번호 관리자에 넣는
          가장 짧은 길이고, 그게 우리가 1순위로 권하는 저장처다.
      */}
      <View style={styles.codeBox}>
        <Text selectable style={styles.code}>
          {code}
        </Text>
      </View>

      <View style={styles.warnBox}>
        <Text style={styles.warn}>{t('backup.codeWarnLost')}</Text>
        <Text style={styles.warn}>{t('backup.codeWarnShared')}</Text>
        <Text style={styles.warn}>{t('backup.codeWarnWhere')}</Text>
      </View>

      <View style={styles.actions}>
        <Button label={t('backup.codeSaved')} onPress={() => setAsking(true)} fullWidth />
        <Pressable accessibilityRole="button" onPress={onSkip} hitSlop={8}>
          <Text style={styles.subtle}>{t('backup.codeLater')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * 표시용 코드에서 비밀 바이트를 되얻는다.
 *
 * 이미 우리가 만든 코드라 실패할 이유가 없지만, 실패하면 대조를 통과시키지 않는다 —
 * 확인 없이 넘어가는 것보다 "다시 시도"가 낫다.
 */
function decodeForCheck(code: string): Uint8Array | null {
  try {
    return decodeRecoveryCode(code);
  } catch {
    return null;
  }
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    root: {
      gap: spacing.lg,
    },
    title: {
      ...typography.title,
      color: colors.text,
    },
    body: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 22,
    },
    codeBox: {
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.accentSoft,
    },
    code: {
      ...typography.body,
      // 코드는 글자 모양이 헷갈리면 안 된다 — 고정폭으로 세운다.
      fontFamily: undefined,
      fontVariant: ['tabular-nums'],
      letterSpacing: 1.5,
      textAlign: 'center',
      color: colors.accent,
      lineHeight: 26,
    },
    warnBox: {
      gap: spacing.sm,
    },
    warn: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 19,
    },
    answer: {
      ...typography.title,
      textAlign: 'center',
      letterSpacing: 4,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    answerWrong: {
      borderColor: colors.danger,
    },
    error: {
      ...typography.caption,
      color: colors.danger,
      textAlign: 'center',
    },
    actions: {
      gap: spacing.md,
      alignItems: 'center',
    },
    subtle: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });
