// expo-audio entrega el volumen en decibeles, de -160 (el piso del medidor) a 0. Por debajo de
// -60 se toma como silencio.
const SILENCE_DB = -60;

/** El volumen de 0 a 1 a partir de los decibeles: (decibeles + 60) / 60, acotado. */
export function levelFromDecibels(decibels: number): number {
  return Math.max(0, Math.min(1, (decibels - SILENCE_DB) / -SILENCE_DB));
}
