import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { EASING } from '@/shared/presentation/theme/motion';
import { ARC_HEIGHT, TRAVEL_MS } from './constants';

/** Mueve el punto de un lote al otro por el arco, una y otra vez. */
export function useTravelingDot(width: number) {
  const travel = useSharedValue(0);

  useEffect(() => {
    travel.set(withRepeat(withTiming(1, { duration: TRAVEL_MS, easing: EASING.move }), -1));
  }, [travel]);

  // El arco es una curva con un punto de control en el medio: en altura, una parábola
  // que sube ARC_HEIGHT.
  return useAnimatedStyle(() => {
    const progress = travel.get();
    return {
      opacity: Math.sin(progress * Math.PI),
      transform: [
        { translateX: progress * width },
        { translateY: -4 * ARC_HEIGHT * progress * (1 - progress) },
      ],
    };
  });
}
