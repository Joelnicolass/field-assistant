import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { EASING, SPRINGS } from '@/shared/presentation/theme/motion';
import { PRESSED_SCALE } from './constants';

/** Achica el botón mientras está bajo el dedo y lo devuelve con un resorte al soltarlo. */
export function usePressScale() {
  const { durations } = useTheme();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return {
    style,
    onPressIn: () =>
      scale.set(withTiming(PRESSED_SCALE, { duration: durations.press, easing: EASING.enter })),
    onPressOut: () => scale.set(withSpring(1, SPRINGS.soft)),
  };
}
