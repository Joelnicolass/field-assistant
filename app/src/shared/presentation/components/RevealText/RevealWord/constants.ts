// Las tres capas de una palabra: `blur` es el radio del desenfoque en tamaños de letra
// (0 es nítida); `appears` y `fades`, en qué tramo del avance de la palabra aparece y
// se apaga cada capa. Cada una entra mientras la anterior se va.
export const LAYERS = [
  { blur: 0, appears: [0.55, 1], fades: [2, 3] },
  { blur: 0.25, appears: [0.25, 0.55], fades: [0.6, 0.9] },
  { blur: 0.65, appears: [0, 0.25], fades: [0.3, 0.6] },
] as const;

// En tamaños de letra: el aire para que la sombra no se corte, el espacio entre
// palabras y cuánto sube cada palabra a su lugar.
export const ROOM = 0.7;
export const SPACE = 0.28;
export const RISE = 0.35;
/** Cada palabra llega un poco agrandada y se achica al quedar nítida. */
export const GROWN = 1.08;
/** La sombra no puede ser opaca: Android le aplicaría la transparencia de las letras. */
export const SHADOW_OPACITY = 0.98;
