/** Por dónde va la calibración del umbral de voz. */
export enum CalibrationStep {
  Idle = 'idle',
  /** Mide el ruido del lugar, en silencio. */
  Ambient = 'ambient',
  /** Mide la voz, mientras la persona habla. */
  Voice = 'voice',
  /** Hay un umbral propuesto para guardar. */
  Ready = 'ready',
  /** La voz no se distinguió del ambiente. */
  Failed = 'failed',
}
