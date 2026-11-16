import { useEffect, useRef } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { EASING } from '@/shared/presentation/theme/motion';

/** Un estilo que apaga y vuelve a encender la opacidad cada vez que `value` cambia; no se mueve al montarse. */
export function useFadeOnChange(value: string) {
  const { durations } = useTheme();
  const opacity = useSharedValue(1);
  const previous = useRef(value);

  useEffect(() => {
    if (previous.current === value) {
      return;
    }
    previous.current = value;
    opacity.set(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: durations.text, easing: EASING.enter }),
      ),
    );
  }, [value, durations.text, opacity]);

  return useAnimatedStyle(() => ({ opacity: opacity.get() }));
}
