import { useEffect, useEffectEvent, useState } from 'react';

import { useDependencies } from '@/di/useDependencies';

/** Pasa cada lectura del sensor de luz a `onLux` y devuelve si el teléfono tiene sensor (null mientras no se sabe). */
export function useAmbientLux(onLux: (lux: number) => void): boolean | null {
  const { ambientLight } = useDependencies();
  const [available, setAvailable] = useState<boolean | null>(null);
  const handleLux = useEffectEvent(onLux);

  useEffect(() => {
    let active = true;
    let stopWatching = () => {};
    ambientLight.isAvailable().then((found) => {
      if (!active) {
        return;
      }
      setAvailable(found);
      if (found) {
        stopWatching = ambientLight.watch((lux) => handleLux(lux));
      }
    });
    return () => {
      active = false;
      stopWatching();
    };
  }, [ambientLight]);

  return available;
}
