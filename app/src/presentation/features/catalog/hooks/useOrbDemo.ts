import { useState } from 'react';

import { OrbState } from '@/shared/presentation/components/Orb';

/** Guarda el estado del orbe y el nivel de voz que muestra el catálogo. */
export function useOrbDemo() {
  const [state, setState] = useState(OrbState.Idle);
  const [level, setLevel] = useState(0);
  return { state, level, setState, setLevel };
}
