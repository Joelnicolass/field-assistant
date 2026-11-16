// Las manchas de VISUAL 5.1: posición desde el centro y radio, como fracciones del
// diámetro, y opacidad. `color` es el índice en `blobs`; null es la mancha blanca.
export const BLOB_GROUPS = {
  a: {
    turns: 1,
    pulse: 0,
    blobs: [
      { x: 0.15, y: -0.12, radius: 0.3, color: 0, opacity: 0.45 },
      { x: -0.16, y: 0.13, radius: 0.29, color: 1, opacity: 0.4 },
    ],
  },
  b: {
    turns: -1,
    pulse: 0.06,
    blobs: [
      { x: -0.13, y: -0.15, radius: 0.3, color: 2, opacity: 0.4 },
      { x: 0.16, y: 0.15, radius: 0.26, color: null, opacity: 0.3 },
    ],
  },
} as const;

export const SHINE = { left: 0.13, top: 0.07, width: 0.46, height: 0.27, angle: '-28deg' } as const;
export const RIM_WIDTH = 2.5;
