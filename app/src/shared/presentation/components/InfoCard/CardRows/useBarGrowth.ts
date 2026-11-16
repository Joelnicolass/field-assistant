import { useEffect } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { EASING } from '@/shared/presentation/theme/motion';
import { BAR_DELAY_MS, BAR_STEP_MS } from './constants';

/** Hace crecer la barra de un renglón hasta `share`, un poco después que la del renglón anterior. */
export function useBarGrowth(share: number, index: number) {
  const { durations } = useTheme();
  const grown = useSharedValue(0);

  useEffect(() => {
    const delay = BAR_DELAY_MS + index * BAR_STEP_MS;
    grown.set(withDelay(delay, withTiming(share, { duration: durations.bars, easing: EASING.enter })));
  }, [share, index, durations.bars, grown]);

  return useAnimatedStyle(() => ({ transform: [{ scaleX: grown.get() }] }));
}
