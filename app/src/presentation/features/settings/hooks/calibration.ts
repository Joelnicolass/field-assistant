// El umbral queda entre el ruido más alto del ambiente y la voz típica, más cerca del ruido: así
// una voz baja igual cuenta, y el ruido de fondo no.
const TOWARD_VOICE = 0.4;
/** Si la voz no supera al ambiente por esto, no se pueden separar. */
const MIN_GAP = 0.08;
const LIMITS = { min: 0.05, max: 0.95 } as const;

/** El valor de la lista en esa posición, de 0 a 1 (0,5 es la mediana). */
function percentile(values: number[], position: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(position * sorted.length));
  return sorted[index] ?? 0;
}

/**
 * Propone el umbral de voz a partir de lo que midió el micrófono en silencio (`ambient`) y
 * hablando (`voice`). Devuelve null si no hay mediciones o si la voz no se distingue del ambiente.
 */
export function proposeSpeechLevel(ambient: number[], voice: number[]): number | null {
  if (ambient.length === 0 || voice.length === 0) {
    return null;
  }
  const noise = percentile(ambient, 0.9);
  const speech = percentile(voice, 0.5);
  if (speech - noise < MIN_GAP) {
    return null;
  }
  const level = noise + (speech - noise) * TOWARD_VOICE;
  return Math.round(Math.min(LIMITS.max, Math.max(LIMITS.min, level)) * 100) / 100;
}
