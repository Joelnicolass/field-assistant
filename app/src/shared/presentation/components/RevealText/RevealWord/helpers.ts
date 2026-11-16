/** Lleva `value` del tramo [from, to] al tramo [0, 1], con arranque y frenada suaves. */
export function smooth(value: number, from: number, to: number): number {
  'worklet';
  const t = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

/** Cuánto avanzó, de 0 a 1, algo que empieza en `start` y dura `length`. */
export function progress(clock: number, start: number, length: number): number {
  'worklet';
  return Math.max(0, Math.min(1, (clock - start) / length));
}
