// Los tiempos de VISUAL 4.6: una palabra cada 70 ms, y cada una tarda 620 ms en enfocarse.
export const STAGGER_MS = 70;
export const WORD_MS = 620;
/** Si el texto no entra en su alto, prueba estos tamaños, de mayor a menor; después corta con "…". */
export const FIT_SCALES = [1, 0.9, 0.8, 0.72] as const;
export const ELLIPSIS = '…';
