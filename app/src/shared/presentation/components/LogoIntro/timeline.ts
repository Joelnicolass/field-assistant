// El ritmo de la entrada del logo, en milisegundos, y las curvas que la dibujan. Todo sale de un
// solo reloj: cada parte lee el reloj y calcula dónde está.

// La velocidad de toda la entrada: con 1 dura unos 4,4 s; con 0,75, unos 3,3. Es el único número
// que hay que tocar: todos los tiempos se multiplican por él.
const PACE = 0.75;
export const pace = (ms: number) => Math.round(ms * PACE);

export const POP_MS = pace(600); // 1. entra, con su rebote
export const BREATH_FROM = pace(680); // 2. se infla...
export const BREATH_TO = pace(1250); //    ...y sostiene
export const WIND_AT = pace(1400); // 3. toma carrera
/** 4. Suelta: las parcelas empiezan a caer al centro. */
export const RELEASE_AT = pace(1650);
/** Cuánto después de soltar sale cada parcela: los intervalos se acortan, termina en catarata. */
export const STARTS = [0, 150, 280, 390, 480, 555, 615, 665].map(pace);
export const PIECE_MS = pace(780); // lo que tarda una parcela en caer y fundirse
/** 5. El golpe: cuando la última parcela llega al centro. */
// La última parcela sale a los 665 (el último de STARTS).
export const IMPACT_AT = RELEASE_AT + pace(665) + PIECE_MS - pace(60);
export const SPLASH_MS = pace(950);
/** Desde acá puede aparecer el resto de la pantalla. */
export const REVEAL_AT = IMPACT_AT + pace(820);
/** Hasta que se apaga el último resplandor. */
export const INTRO_TOTAL_MS = IMPACT_AT + pace(1400);

const RELEASE_BOUNCE_MS = pace(520);
export const TWIST_BACK_MS = pace(260);
const HIT_MS = pace(600);
export const HIT_LEAD_MS = pace(70); // se aplasta justo antes del golpe
const GLYPH_AT = IMPACT_AT + pace(80);
const GLYPH_MS = pace(560);
export const FLASH_MS = pace(1200);
/** La parte de una vuelta que da cada parcela alrededor del centro al caer. */
export const TURN = 0.75;

/** Lleva `value` del tramo [from, to] al [0, 1], con arranque y frenada suaves. */
export function smooth(value: number, from: number, to: number): number {
  'worklet';
  const t = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

/** Cuánto avanzó algo que empieza en `start` y dura `length`, de 0 a 1, parejo. */
export function elapsed(clock: number, start: number, length: number): number {
  'worklet';
  return Math.max(0, Math.min(1, (clock - start) / length));
}

/** Un rebote: de 0 a 1, se pasa (1,13), vuelve, se pasa menos y se queda en 1. */
export function bounce(t: number): number {
  'worklet';
  return 1 - Math.exp(-6.5 * t) * Math.cos(11 * t);
}

/** El tamaño del orbe durante la entrada, como factor: 1 es su tamaño normal. */
export function introScale(clock: number): number {
  'worklet';
  const pop = 0.45 * (bounce(elapsed(clock, 0, POP_MS)) - 1);
  const breath = 0.06 * smooth(clock, BREATH_FROM, BREATH_TO);
  const wind = -0.16 * smooth(clock, WIND_AT, RELEASE_AT);
  // Lo que infló y lo que encogió suman -0,10: al soltar lo recupera con rebote.
  const release = 0.1 * bounce(elapsed(clock, RELEASE_AT, RELEASE_BOUNCE_MS));
  const since = Math.max(0, (clock - IMPACT_AT) / HIT_MS);
  const squash = smooth(clock, IMPACT_AT - HIT_LEAD_MS, IMPACT_AT);
  const hit = -0.14 * squash * Math.exp(-4.5 * since) * Math.cos(9.5 * since);
  return 1 + pop + breath + wind + release + hit;
}

/** El dibujo del centro aparece después del golpe, creciendo con rebote. */
export function glyphOpacity(clock: number): number {
  'worklet';
  return smooth(clock, GLYPH_AT, GLYPH_AT + GLYPH_MS / 3);
}

export function glyphScale(clock: number): number {
  'worklet';
  return bounce(elapsed(clock, GLYPH_AT, GLYPH_MS));
}
