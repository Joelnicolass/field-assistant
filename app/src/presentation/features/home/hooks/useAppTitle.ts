import { useEffect, useState } from 'react';

import { TitlePhase, TITLE_PHASES } from '../states/titlePhases';

/** Alterna la segunda palabra del título entre "Data" y "Assistant", desenfocándola al cambiar. */
export function useAppTitle() {
  const [phase, setPhase] = useState(TitlePhase.Data);
  const { word, leaving, next, afterMs } = TITLE_PHASES[phase];

  useEffect(() => {
    const timer = setTimeout(() => setPhase(next), afterMs);
    return () => clearTimeout(timer);
  }, [next, afterMs]);

  return { word, leaving };
}
