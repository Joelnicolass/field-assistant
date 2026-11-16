import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { EASING } from '@/shared/presentation/theme/motion';
import { SLIDE_MS, STAGE } from './constants';

/**
 * Mide el escenario y calcula cuánto subir la zona de voz para que el orbe quede en el centro.
 * Cuando el escenario cambia de alto (el resumen esconde los lotes), el orbe se desliza.
 * `screenShift` es lo que falta, además, para llevarlo al centro de la ventana, donde lo dibuja
 * el splash: ahí hace la entrada.
 */
export function useVoiceLift(bottomInset: number) {
  const [stage, setStage] = useState({ height: 0, top: 0 });
  const onStageLayout = (event: LayoutChangeEvent) => {
    const { height, y } = event.nativeEvent.layout;
    setStage({ height, top: y });
  };
  const window = useWindowDimensions();

  const bottomGap = bottomInset + STAGE.bottomMargin;
  const restingCenter = stage.height - bottomGap - STAGE.statusHeight - STAGE.slotHeight / 2;
  const middle = (stage.height - bottomInset) / 2;
  const lift = stage.height > 0 ? restingCenter - middle : 0;
  const liftNow = useSharedValue(0);
  const screenShift = useSharedValue(0);
  // La zona de voz no se ve hasta conocer las medidas: pasa a verse en el mismo cuadro en que se
  // la ubica, así el orbe no aparece un instante en otro lado.
  const shown = useSharedValue(0);
  const measured = useRef(false);

  useEffect(() => {
    if (stage.height === 0) {
      return;
    }
    liftNow.set(
      measured.current ? withTiming(lift, { duration: SLIDE_MS, easing: EASING.move }) : lift,
    );
    screenShift.set(stage.top + middle - window.height / 2);
    shown.set(1);
    measured.current = true;
  }, [stage, lift, middle, window.height, liftNow, screenShift, shown]);

  return {
    onStageLayout,
    measured: stage.height > 0,
    /** Dónde empieza el escenario, desde el borde de arriba de la pantalla. */
    stageTop: stage.top,
    bottomGap,
    liftNow,
    screenShift,
    shown,
  };
}
