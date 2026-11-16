import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { EASING } from '@/shared/presentation/theme/motion';
import { SLIDE_MS, STAGE } from './constants';

/**
 * Mide el escenario y calcula cuánto subir la zona de voz para que el orbe quede en el centro.
 * Cuando el escenario cambia de alto (el resumen esconde los lotes), el orbe se desliza.
 */
export function useVoiceLift(bottomInset: number) {
  const [height, setHeight] = useState(0);
  const onStageLayout = (event: LayoutChangeEvent) => setHeight(event.nativeEvent.layout.height);

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

  return { onStageLayout, bottomGap, liftNow, shown };
}
