import { Image } from 'expo-image';
import X from 'lucide-react-native/icons/x';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ImageViewerProps {
  visible: boolean;
  /** 볼 이미지들의 절대 URI. 본문에 나온 순서 그대로 넘긴다 */
  uris: string[];
  /** 처음 보여줄 장의 위치 */
  initialIndex: number;
  onClose: () => void;
}

/**
 * 사진 전체 보기.
 *
 * 본문 안에서는 4:3으로 잘려 보이므로(`contentFit: cover`) 사진 전체를 확인할 길이 필요하다.
 * 여기서는 **자르지 않고**(`contain`) 화면에 맞춘다.
 *
 * 배경은 검정으로 고정한다 — 사진 색이 무엇일지 알 수 없어서, 앱 배경색 위에 올리면
 * 밝은 사진의 경계가 사라진다. 여기만 테마를 따르지 않는 이유다.
 */
export function ImageViewer({ visible, uris, initialIndex, onClose }: ImageViewerProps) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(initialIndex);

  // 열 때마다 누른 사진에서 시작한다. 지난번에 보던 장이 남아 있으면 엉뚱한 사진이 뜬다.
  useEffect(() => {
    if (visible) {
      setIndex(initialIndex);
      scrollRef.current?.scrollTo({ x: initialIndex * width, animated: false });
    }
  }, [visible, initialIndex, width]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) =>
            setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
          }
          // 첫 레이아웃이 끝난 뒤에야 목표 위치를 알 수 있다.
          onContentSizeChange={() =>
            scrollRef.current?.scrollTo({ x: index * width, animated: false })
          }
        >
          {uris.map((uri, position) => (
            <Pressable
              key={`${uri}-${position}`}
              // 사진을 눌러도 닫힌다 — 전체 보기에서 나가는 길이 X 하나뿐이면 답답하다.
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              style={{ width, height }}
            >
              <Image source={{ uri }} style={styles.image} contentFit="contain" transition={120} />
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
          hitSlop={12}
          style={[styles.close, { top: insets.top + spacing.md }]}
        >
          <X size={24} color="#FFFFFF" />
        </Pressable>

        {uris.length > 1 && (
          <View style={[styles.counter, { bottom: insets.bottom + spacing.xl }]}>
            <Text style={styles.counterLabel}>
              {index + 1} / {uris.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  close: {
    position: 'absolute',
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  counter: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  counterLabel: {
    ...typography.caption,
    color: '#FFFFFF',
  },
});
