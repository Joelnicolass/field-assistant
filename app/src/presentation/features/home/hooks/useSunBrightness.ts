import { useEffect, useState } from 'react';

import { useDependencies } from '@/di/useDependencies';
import { nextBrightness } from './ambientLight';
import { useAmbientLux } from './useAmbientLux';

/** Sube el brillo al máximo al sol y lo devuelve al del teléfono a la sombra o al cerrarse. */
export function useSunBrightness(): void {
  const { screenBrightness } = useDependencies();
  const [boosted, setBoosted] = useState(false);
  useAmbientLux((lux) => setBoosted((current) => nextBrightness(lux, current)));

  useEffect(() => {
    if (!boosted) {
      return;
    }
    screenBrightness.boost();
    return () => {
      screenBrightness.restore();
    };
  }, [boosted, screenBrightness]);
}
