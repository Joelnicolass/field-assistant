import { useEffect, useState } from 'react';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';

import { DESCENT_MS, LANDED_MS } from './landing';

/**
 * Los tres momentos del escenario con la entrada del logo: el orbe solo en el centro; cuando
 * termina la entrada (`onIntroEnd`), baja a su lugar y aparece el resumen (`revealed`); cuando
 * aterrizó, el texto y las tarjetas (`landed`). Sin entrada, todo está a la vista desde el inicio.
 */
export function useIntroStage(withIntro: boolean) {
  const [revealed, setRevealed] = useState(!withIntro);
  const [landed, setLanded] = useState(!withIntro);
  // El reloj de la bajada: -1 hasta que empieza.
  const descent = useSharedValue(withIntro ? -1 : DESCENT_MS);

  useEffect(() => {
    if (!revealed || landed) {
      return;
    }
    descent.set(0);
    descent.set(withTiming(DESCENT_MS, { duration: DESCENT_MS, easing: Easing.linear }));
    const timer = setTimeout(() => setLanded(true), LANDED_MS);
    return () => clearTimeout(timer);
  }, [revealed, landed, descent]);

  return { revealed, landed, descent, onIntroEnd: () => setRevealed(true) };
}
