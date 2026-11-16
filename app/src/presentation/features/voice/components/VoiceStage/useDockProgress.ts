import { useEffect, useRef } from 'react';
import { useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { EASING, SPRINGS } from '@/shared/presentation/theme/motion';
import { DOCK_ANTICIPATION } from './constants';

/**
 * Cuánto está acoplado el orbe: 0, en el centro y grande; 1, abajo y chico. Al cambiar, antes de
 * irse hace un amague chico para el lado contrario (anticipación).
 */
export function useDockProgress(docked: boolean) {
  const { durations } = useTheme();
  const dock = useSharedValue(docked ? 1 : 0);
  const wasDocked = useRef(docked);

  useEffect(() => {
    if (wasDocked.current === docked) {
      return;
    }
    wasDocked.current = docked;
    dock.set(
      withSequence(
        withTiming(docked ? -DOCK_ANTICIPATION : 1 + DOCK_ANTICIPATION, {
          duration: durations.press,
          easing: EASING.enter,
        }),
        withSpring(docked ? 1 : 0, SPRINGS.gentle),
      ),
    );
  }, [docked, dock, durations.press]);

  return dock;
}
