import { OrbState } from '@/shared/presentation/components/Orb';

export const STATE_LABEL: Record<OrbState, string> = {
  [OrbState.Idle]: 'Reposo',
  [OrbState.Listening]: 'Escuchando',
  [OrbState.Thinking]: 'Pensando',
  [OrbState.Speaking]: 'Hablando',
};

// Los textos de las capturas de VISUAL 5.3. El subtítulo de hablando ocupa tres renglones.
export const STATUS_TEXT: Record<OrbState, string> = {
  [OrbState.Idle]: 'Tocá para hablar',
  [OrbState.Listening]: 'Te escucho · tocá para terminar',
  [OrbState.Thinking]: 'Pensando…',
  [OrbState.Speaking]: 'Tocá para interrumpir',
};

export const SUBTITLE: Record<OrbState, string> = {
  [OrbState.Idle]: '¿Qué anotamos hoy?',
  [OrbState.Listening]: 'Te escucho',
  [OrbState.Thinking]: 'Dame un segundo',
  [OrbState.Speaking]:
    'Anoté 18 milímetros para anoche. En noviembre van 64 milímetros, contando las tres lluvias del mes.',
};

export const LEVELS = [
  { value: 0, label: 'Voz 0' },
  { value: 0.5, label: 'Voz 0,5' },
  { value: 1, label: 'Voz 1' },
];

export const ORB_LABEL = 'Orbe';
