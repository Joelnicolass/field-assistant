// Las medidas de la zona de voz (VISUAL 7): el subtítulo, el casillero del orbe y el estado.
export const STAGE = {
  dockScale: 0.56,
  subtitleHeight: 84,
  slotHeight: 136,
  statusHeight: 26,
  voiceHeight: 84 + 136 + 26,
  /** En el centro el orbe es más grande que su casillero: el subtítulo y el estado se corren. */
  spread: 52,
  bottomMargin: 12,
  /** El aire mínimo entre el resumen y el subtítulo, con el orbe en el centro. */
  topMargin: 8,
} as const;

export const DOCK_ANTICIPATION = 0.025;
export const SLIDE_MS = 300;
export const STATUS_RISE = 5;
/** El alto del degradé sobre el borde de la lista de tarjetas. */
export const FADE_HEIGHT = 40;
