import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';

import { useKeyboard } from '@/hooks/use-keyboard';
import type { Palette } from '@/theme/palettes';
import { useStyles } from '@/theme/use-styles';
import { spacing } from '@/theme/spacing';

interface ScreenProps {
  children: ReactNode;
  /**
   * 세이프에어리어를 적용할 변. 기본은 위·좌·우.
   * **탭 화면은 아래를 넣지 않는다** — 하단 탭바가 이미 아래 인셋을 먹고 있어서 두 번 들어간다.
   * 탭이 없는 화면(작성·상세 등)은 `['top', 'bottom', 'left', 'right']`로 쓴다.
   */
  edges?: readonly Edge[];
  /** 스크롤 없이 꽉 채우는 화면(빈 상태·잠금 등)이면 false */
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** 화면 상단 고정 영역(헤더). 스크롤에 딸려 올라가지 않는다 */
  header?: ReactNode;
}

/** 포커스된 입력창과 키보드 사이에 남길 여유 */
const FOCUS_MARGIN = spacing.md;

/**
 * 모든 화면의 바깥 틀. **화면에서 SafeAreaView·ScrollView를 직접 쓰지 않는다.**
 *
 * 여기 한 곳에서 세이프에어리어와 키보드 가림을 처리하므로, 화면마다 제각각 처리하다
 * 빠뜨리는 일이 없어진다(2026-08-07: 탭바가 시스템 내비 아래 깔리고 입력창이 키보드에
 * 가리는 문제를 겪고 도입).
 */
export function Screen({
  children,
  edges = ['top', 'left', 'right'],
  scroll = true,
  contentStyle,
  header,
}: ScreenProps) {
  const styles = useStyles(createStyles);
  const keyboard = useKeyboard();
  const rootRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const [overlap, setOverlap] = useState(0);

  /*
   * 키보드에 가려지는 높이만큼 스크롤 영역을 **줄인다**(아래 여백을 더하는 게 아니다).
   *
   * 여백만 더하면 손으로 스크롤해야 닿는다. 영역 자체가 짧아지면 안드로이드 ScrollView가
   * 크기 변화에 맞춰 포커스된 입력창을 보이는 데까지 스스로 스크롤해 준다.
   *
   * 창이 이미 줄어드는 기기(adjustResize가 먹는 경우)에서는 겹침이 0으로 계산되어 아무 일도
   * 하지 않는다 — 두 경우를 코드로 나누지 않고 실제로 재서 판단한다.
   */
  useEffect(() => {
    if (keyboard.height === 0) {
      setOverlap(0);
      return;
    }
    const measure = () => {
      rootRef.current?.measureInWindow((_x, y, _width, height) => {
        setOverlap(Math.max(0, y + height - keyboard.screenY));
      });
    };
    // 두 번 잰다. 창이 줄어드는 기기는 레이아웃이 끝난 뒤라야 값이 맞고,
    // 키보드가 뜬 뒤 제안 줄·툴바가 붙어 높이가 한 번 더 커지는 경우가 있다(Gboard).
    const early = setTimeout(measure, 60);
    const late = setTimeout(measure, 350);
    return () => {
      clearTimeout(early);
      clearTimeout(late);
    };
  }, [keyboard.height, keyboard.screenY]);

  /*
   * 스크롤 화면의 iOS는 automaticallyAdjustKeyboardInsets가 같은 일을 하므로 여기서 또 줄이면
   * 두 번 밀린다. 스크롤 없는 화면은 그 옵션이 없으니 iOS에서도 줄여야 한다.
   */
  const scrollOverlap = Platform.OS === 'android' ? overlap : 0;

  // 영역을 줄여도 안 올라오는 경우를 대비한 보완책. 이미 올라왔으면 겹침이 없어 그냥 지나간다.
  useEffect(() => {
    if (scrollOverlap === 0 || !scroll) {
      return;
    }
    const timer = setTimeout(() => {
      const focused = TextInput.State.currentlyFocusedInput();
      if (focused === null) {
        return;
      }
      focused.measureInWindow((_x, y, _width, height) => {
        const hidden = y + height + FOCUS_MARGIN - keyboard.screenY;
        if (hidden > 0) {
          scrollRef.current?.scrollTo({ y: scrollOffsetRef.current + hidden, animated: true });
        }
      });
    }, 180);
    return () => clearTimeout(timer);
  }, [scrollOverlap, keyboard.screenY, scroll]);

  return (
    <SafeAreaView ref={rootRef} style={styles.safe} edges={edges}>
      {header}
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          style={[styles.flex, { marginBottom: scrollOverlap }]}
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          // iOS는 이 옵션만으로 포커스된 입력창을 키보드 위로 밀어준다.
          automaticallyAdjustKeyboardInsets
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content, contentStyle, { marginBottom: overlap }]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
      gap: spacing.lg,
    },
  });
