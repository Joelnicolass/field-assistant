// La bajada del orbe después de la entrada: del centro de la pantalla a su lugar. Primero toma
// impulso, después cae y rebota. Sale de un reloj en milisegundos, como la entrada.
export const RISE_MS = 240; // anticipación: sube un poco y se achata antes de bajar
const FALL_MS = 1000; // la caída, con sus rebotes hasta quedar quieto
export const DESCENT_MS = RISE_MS + FALL_MS;
/** Cuándo, dentro de la bajada, el orbe ya aterrizó: ahí aparecen el texto y el estado. */
export const LANDED_MS = RISE_MS + 420;

function smooth(value: number, from: number, to: number): number {
  'worklet';
  const t = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

/**
 * Dónde está el orbe y cuánto se deforma en cada momento de la bajada. `where` es 1 en el
 * centro de la pantalla y 0 en su lugar; `stretch`, cuánto se estira a lo alto (o se achata).
 */
export function landing(ms: number): { where: number; stretch: number } {
  'worklet';
  if (ms < 0) {
    return { where: 1, stretch: 0 };
  }
  const lift = smooth(ms, 0, RISE_MS);
  const crouch = lift * (1 - smooth(ms, RISE_MS, RISE_MS + 140));
  // La caída es un resorte: baja, se pasa, vuelve, se pasa menos y se aquieta.
  const fall = Math.max(0, (ms - RISE_MS) / FALL_MS);
  const swing = Math.exp(-6 * fall) * Math.cos(10 * fall);
  const speed = Math.exp(-6 * fall) * Math.sin(10 * fall);
  const where = (1 + 0.1 * lift) * swing;
  const stretch = 0.15 * speed - 0.07 * crouch - 0.5 * Math.max(0, -where);
  return { where, stretch };
}
