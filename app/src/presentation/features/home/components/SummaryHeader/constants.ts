export const PILL_ICON_SIZE = 15;
export const PILL_PADDING = { vertical: 7, horizontal: 12 } as const;
/** Las píldoras de solo ícono: redondas, con el toque ampliado hasta el mínimo de 48. */
export const ROUND_PADDING = 9;
export const ROUND_HIT_SLOP = 8;
export const PENDING_BACKGROUND_OPACITY = 0.14;
export const PENDING_IN_MS = 220;
export const PENDING_OUT_MS = 160;
export const SETTINGS_LABEL = 'Ajustes';
export const HANDS_FREE_LABEL = 'Manos libres';
export const LOGO_SIZE = 40;
export const LOGO_RADIUS = 12;

export function pendingLabel(count: number): string {
  return `${count} esperando señal`;
}

export const SENDING_LABEL = 'Enviando…';
export const SEND_NOW_HINT = 'Tocá para enviarlos ahora';
