import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { Countdown } from './types';

/** Llena la barra de la cuenta de izquierda a derecha en `durationMs` y la frena con `paused`. */
export function useCountdownFill(countdown: Countdown | undefined) {
  const progress = useSharedValue(0);
  const durationMs = countdown?.durationMs;
  const running = countdown !== undefined && !countdown.paused;

  useEffect(() => {
    if (durationMs === undefined || !running) {
      cancelAnimation(progress);
      return;
    }
    // Lineal porque mide tiempo, y sin "reducir animaciones": la barra dice cuánto falta.
    const remainingMs = durationMs * (1 - progress.get());
    progress.set(
      withTiming(1, { duration: remainingMs, easing: Easing.linear, reduceMotion: ReduceMotion.Never }),
    );
  }, [durationMs, running, progress]);

  return useAnimatedStyle(() => ({ transform: [{ scaleX: progress.get() }] }));
}
