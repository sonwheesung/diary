import { router } from 'expo-router';
import Check from 'lucide-react-native/icons/check';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { readConsent, saveConsent } from '@/features/ai/consent';
import { AI_VENDOR } from '@/features/ai/vendor';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * AI 리포트 동의 — **체크박스 2개. 하나로 묶지 않는다.**
 *
 * 🔴 근거 법조문이 다르다: 민감정보 §23 / 국외이전 §28-8. 묶어서 받으면 둘 다 무효가
 *   될 수 있다(`features/ai/consent.ts`).
 *
 * 🔴 **"모두 동의" 버튼을 두지 않는다.** 한 번에 켜는 편의를 주는 순간 별도 동의가
 *   형식만 남는다 — 그게 이 화면이 존재하는 이유를 없앤다.
 *
 * ⚠ 여기 적는 문장은 `features/legal/legal-text.ts`의 AI 예고 나·다목과 **같은 내용**이어야
 *   한다. 다르면 어느 쪽이 고지인지 알 수 없어진다.
 */
export default function AiConsentScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const [sensitive, setSensitive] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [saving, setSaving] = useState(false);

  // 이미 하나만 동의한 상태로 돌아올 수 있다 — 그대로 보여준다
  useEffect(() => {
    let alive = true;
    void readConsent().then((c) => {
      if (!alive) return;
      setSensitive(c.sensitiveAt !== null);
      setTransfer(c.transferAt !== null);
    });
    return () => {
      alive = false;
    };
  }, []);

  const onAgree = async () => {
    setSaving(true);
    try {
      // 각각 저장한다. 화면에서 하나만 켠 채 나가도 그 상태가 남는다
      await saveConsent('sensitive', sensitive);
      await saveConsent('transfer', transfer);
      router.back();
    } finally {
      setSaving(false);
    }
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
      <Text style={styles.headerTitle}>{t('aiConsent.title')}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      <Text style={styles.lead}>{t('aiConsent.lead')}</Text>

      {/*
        ⚠ **무엇이 나가는지 그 자리에서 밝힌다**(CLAUDE.md §5.1). 처리방침에만 적고
          화면에서 흐리면, 나중에 알게 된 사용자가 가장 크게 배신감을 느낀다.
      */}
      <View style={styles.notice}>
        <Text style={styles.noticeLine}>{t('aiConsent.whatSent')}</Text>
        <Text style={styles.noticeLine}>{t('aiConsent.whenSent')}</Text>
        {/*
          🔴 정확한 표현: **"저장하지 않습니다"(O) / "볼 수 없습니다"(X)**.
             백업과 정반대다 — 리포트를 만드는 순간 본문이 우리 서버를 지나간다.
        */}
        <Text style={styles.noticeLine}>{t('aiConsent.notStored')}</Text>
        <Text style={styles.noticeLine}>{t('aiConsent.vendorRetention')}</Text>
      </View>

      <ConsentRow
        checked={sensitive}
        onToggle={() => setSensitive((v) => !v)}
        title={t('aiConsent.sensitiveTitle')}
        body={t('aiConsent.sensitiveBody')}
      />

      <ConsentRow
        checked={transfer}
        onToggle={() => setTransfer((v) => !v)}
        title={t('aiConsent.transferTitle')}
        /*
         * ⚠ 국가는 **번역된 문구**를 넣는다. 상수에 `'미국'`을 넣었더니 영어 화면에
         *   한글이 그대로 떴다 — 상수는 코드(`US`)만 갖고 표기는 로케일이 갖는다.
         */
        body={t('aiConsent.transferBody', {
          vendor: AI_VENDOR.name,
          country: t('aiConsent.vendorCountry'),
        })}
        // ⚠ 연락처는 채워졌을 때만 그린다. 빈 문자열을 그리면 "연락처: " 만 남는다
        extra={
          AI_VENDOR.contact.length > 0
            ? t('aiConsent.vendorContact', { contact: AI_VENDOR.contact })
            : null
        }
      />

      {/* 거부해도 나머지 기능은 그대로다 — 그게 성립해야 동의가 자유로운 것이 된다 */}
      <Text style={styles.optional}>{t('aiConsent.optional')}</Text>

      <Button
        label={t('aiConsent.agree')}
        fullWidth
        disabled={saving || !sensitive || !transfer}
        onPress={() => void onAgree()}
      />

      <Pressable accessibilityRole="button" onPress={() => router.push('/privacy')}>
        <Text style={styles.link}>{t('aiConsent.readPolicy')}</Text>
      </Pressable>
    </Screen>
  );
}

function ConsentRow({
  checked,
  onToggle,
  title,
  body,
  extra,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  body: string;
  extra?: string | null;
}) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={styles.row}
    >
      <View style={[styles.box, checked && styles.boxOn]}>
        {checked && <Check size={16} color={colors.textOnAccent} strokeWidth={3} />}
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowText}>{body}</Text>
        {extra !== null && extra !== undefined && <Text style={styles.rowText}>{extra}</Text>}
      </View>
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
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    headerTitle: {
      ...typography.subtitle,
      color: colors.text,
      flexShrink: 1,
    },
    headerSpacer: {
      width: 26,
    },
    lead: {
      ...typography.body,
      color: colors.text,
    },
    notice: {
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    noticeLine: {
      ...typography.caption,
      color: colors.text,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    box: {
      width: 24,
      height: 24,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    boxOn: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      // 안드로이드에서 앞 스타일의 반지름이 안 먹는 경우가 있어 다시 적는다
      borderRadius: radius.sm,
    },
    rowBody: {
      flex: 1,
      gap: spacing.xs,
    },
    rowTitle: {
      ...typography.label,
      color: colors.text,
    },
    rowText: {
      ...typography.caption,
      color: colors.textMuted,
    },
    optional: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
    },
    link: {
      ...typography.caption,
      color: colors.accent,
      textAlign: 'center',
      paddingVertical: spacing.sm,
    },
  });
