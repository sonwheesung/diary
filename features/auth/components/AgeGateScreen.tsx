import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { OPERATOR } from '@/features/legal/legal-text';
import type { Palette } from '@/theme/palettes';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { birthYearRange, passes } from '../age-gate';
import { saveAgeBlock, saveAgePass } from '../api/age-store';
import { markAgeBlocked, settleAgeGate, useAgeGate } from '../gate-store';

/**
 * 연령 게이트 화면 (docs/AUTH_SYSTEM.md §1.6)
 *
 * 🔴 **중립적으로 묻는다.** `만 N세 이상입니다 ☑`는 무엇을 눌러야 통과하는지 즉시 보여서
 *   FTC가 요구하는 *neutral age screen*이 아니다 — 물어서 리스크는 지고 방패는 못 받는
 *   최악의 형태가 된다. 출생 **연도**를 고르게 한다.
 *
 * 🔴 **생년은 화면 밖으로 나가지 않는다.** 여기서 판정하고 버린다. 저장되는 것은
 *   `{ passedAt, threshold, version }` 뿐이다.
 */
export function AgeGateScreen() {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { visible, threshold, blocked } = useAgeGate();
  const [busy, setBusy] = useState(false);

  const thisYear = new Date().getFullYear();
  const { min, max } = birthYearRange(thisYear);
  // 최근 해가 위로 오게 — 아래로 121칸을 스크롤해 자기 해를 찾게 두지 않는다.
  const years: number[] = [];
  for (let y = max; y >= min; y--) years.push(y);

  const choose = async (year: number) => {
    if (busy) return;
    setBusy(true);
    try {
      if (!passes(year, thisYear, threshold)) {
        /*
         * 🔴 **출생연도는 저장하지 않는다.** 판정 결과만 남긴다(§1.4 · 공용 §3.3).
         *
         * 게이트가 부팅으로 올라가면서(2026-09-01) 판정 **결과**는 저장하게 됐다 —
         * 안 남기면 미달자가 앱을 켤 때마다 나이를 묻힌다. 유예는 365일이고,
         * 그 기간이 지나면 다시 묻는다(나이를 먹은 사람을 영영 막지 않는다).
         */
        await saveAgeBlock(threshold);
        markAgeBlocked();
        return;
      }
      await saveAgePass(threshold);
      settleAgeGate(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      // 안드로이드 뒤로가기 = 닫기. 게이트는 통과 못 해도 앱을 못 쓰게 만드는 문이 아니다.
      onRequestClose={() => settleAgeGate(false)}
    >
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        {blocked ? (
          <View style={styles.blocked}>
            <Text style={styles.title}>{t('ageGate.blockedTitle')}</Text>
            <Text style={styles.body}>{t('ageGate.blockedBody', { min: threshold })}</Text>
            {/*
              ⚠ 조각에서 가장 중요한 한 줄이다 — 막히는 것은 **로그인이 필요한 기능**뿐이고
                일기는 그대로 쓴다. 이 말이 없으면 미달자는 앱을 못 쓰는 줄 알고 지운다.
            */}
            <Text style={styles.reassure}>{t('ageGate.blockedKeepWriting')}</Text>

            {/*
              출구 둘(공용 GLOBAL_DATA_COMPLIANCE §3.5).
              🔴 §3.5는 "문의 경로"를 요구하지만 **조각의 문의는 로그인 필수**라 미달자가 쓸 수 없다.
                 그래서 연락처를 화면에 직접 적는다 — 못 쓰는 버튼을 두는 것보다 정직하다.
            */}
            <Text style={styles.contact}>{t('ageGate.contact', { email: OPERATOR.contactEmail })}</Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => {
                settleAgeGate(false);
                router.push('/privacy');
              }}
            >
              <Text style={styles.link}>{t('ageGate.privacyLink')}</Text>
            </Pressable>

            <Button label={t('ageGate.backToDiary')} onPress={() => settleAgeGate(false)} fullWidth />
          </View>
        ) : (
          <>
            <View style={styles.head}>
              <Text style={styles.title}>{t('ageGate.title')}</Text>
              {/* 왜 묻는지 그 자리에 적는다. 이유 없이 나이를 묻는 화면이 가장 불쾌하다 */}
              <Text style={styles.body}>{t('ageGate.why')}</Text>
              <Text style={styles.fine}>{t('ageGate.notStored')}</Text>
            </View>

            <ScrollView
              style={styles.list}
              contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
            >
              {years.map((y) => (
                <Pressable
                  key={y}
                  accessibilityRole="button"
                  style={styles.year}
                  onPress={() => void choose(y)}
                  disabled={busy}
                >
                  <Text style={styles.yearText}>{t('ageGate.year', { year: y })}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={[styles.foot, { paddingBottom: insets.bottom + spacing.md }]}>
              <Button
                label={t('common.cancel')}
                variant="ghost"
                onPress={() => settleAgeGate(false)}
                fullWidth
              />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    head: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.lg },
    title: { ...typography.title, color: colors.text, flexShrink: 1 },
    body: { ...typography.body, color: colors.textMuted, flexShrink: 1 },
    fine: { ...typography.caption, color: colors.textMuted, flexShrink: 1 },
    list: { flex: 1, paddingHorizontal: spacing.lg },
    year: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      marginBottom: spacing.xs,
    },
    yearText: { ...typography.body, color: colors.text, flexShrink: 1 },
    foot: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
    blocked: { flex: 1, paddingHorizontal: spacing.lg, gap: spacing.md, justifyContent: 'center' },
    reassure: { ...typography.body, color: colors.text, flexShrink: 1 },
    contact: { ...typography.caption, color: colors.textMuted, flexShrink: 1 },
    link: { ...typography.label, color: colors.accent, flexShrink: 1 },
  });
