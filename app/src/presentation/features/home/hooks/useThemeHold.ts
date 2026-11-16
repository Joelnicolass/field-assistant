import { useEffect, useState } from 'react';

/** Verdadero durante los primeros `holdMs` desde que se monta: el tiempo del splash y la entrada. */
export function useThemeHold(holdMs: number): boolean {
  const [held, setHeld] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setHeld(false), holdMs);
    return () => clearTimeout(timer);
  }, [holdMs]);

  return held;
}
