import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { EASING, SPRINGS } from '@/shared/presentation/theme/motion';
import { DOCK_ANTICIPATION, SLIDE_MS, STAGE } from './constants';

/**
 * Ubica el orbe: grande en el centro del escenario sin tarjetas, y chico en su casillero con
 * ellas. El cambio es una escala y una traslación, sin recalcular la pantalla.
 */
export function useStageMotion(docked: boolean, bottomInset: number) {
  const { durations } = useTheme();
  const [height, setHeight] = useState(0);
  const onStageLayout = (event: LayoutChangeEvent) => setHeight(event.nativeEvent.layout.height);

  // 0: en el centro y grande; 1: abajo y chico.
  const dock = useSharedValue(docked ? 1 : 0);
  const wasDocked = useRef(docked);
  useEffect(() => {
    if (wasDocked.current === docked) {
      return;
    }
    wasDocked.current = docked;
    // Anticipación: antes de irse, un amague chico para el lado contrario.
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

  // Cuánto subir la zona de voz para que el orbe quede en el centro del escenario. Cuando el
  // escenario cambia de alto (el resumen esconde los lotes), el orbe se desliza.
  const bottomGap = bottomInset + STAGE.bottomMargin;
  const restingCenter = height - bottomGap - STAGE.statusHeight - STAGE.slotHeight / 2;
  const lift = height > 0 ? restingCenter - (height - bottomInset) / 2 : 0;
  const liftNow = useSharedValue(0);
  const shown = useSharedValue(0);
  const measured = useRef(false);
  useEffect(() => {
    if (height === 0) {
      return;
    }
    liftNow.set(
      measured.current ? withTiming(lift, { duration: SLIDE_MS, easing: EASING.move }) : lift,
    );
    shown.set(1);
    measured.current = true;
  }, [height, lift, liftNow, shown]);

  const voiceStyle = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [{ translateY: -(1 - dock.get()) * liftNow.get() }],
  }));
  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(dock.get(), [0, 1], [1, STAGE.dockScale]) }],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -(1 - dock.get()) * STAGE.spread }],
  }));
  const statusStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - dock.get()) * STAGE.spread }],
  }));

  return { onStageLayout, bottomGap, voiceStyle, orbStyle, subtitleStyle, statusStyle };
}
