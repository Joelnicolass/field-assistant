import { CalibrationStep } from '../../hooks/CalibrationStep';

export const METER_HEIGHT = 10;
export const MARKER_WIDTH = 3;

export const CALIBRATOR_TEXT = {
  title: 'Umbral de voz',
  explain:
    'Desde qué volumen la app toma lo que oye como voz. Si corta antes de que termines o no se da cuenta de que terminaste, calibralo en el lugar donde la usás.',
  current: (level: number) => `Ahora: ${Math.round(level * 100)} de 100`,
  proposal: (level: number) => `Propuesto: ${Math.round(level * 100)} de 100`,
  start: 'Calibrar',
  again: 'Volver a calibrar',
  save: 'Guardar',
} as const;

/** Qué dice la tarjeta en cada paso. */
export const STEP_TEXT: Record<CalibrationStep, string> = {
  [CalibrationStep.Idle]: 'Primero mido el lugar en silencio, después tu voz. Son 6 segundos.',
  [CalibrationStep.Ambient]: 'Silencio, por favor: estoy midiendo el lugar…',
  [CalibrationStep.Voice]: 'Ahora hablá como siempre, por ejemplo "llovieron 20 milímetros"…',
  [CalibrationStep.Ready]: 'Listo. Si te parece bien, guardalo.',
  [CalibrationStep.Failed]:
    'Tu voz no se distinguió del ruido. Probá hablar más cerca o en otro lugar.',
};
