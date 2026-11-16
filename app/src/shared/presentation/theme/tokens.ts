export const SPACING = {
  hair: 2,
  xs: 4,
  sm: 8,
  md: 10,
  base: 12,
  lg: 14,
  xl: 16,
  gutter: 18,
  xxl: 20,
  xxxl: 26,
} as const;

export const RADII = {
  bar: 4,
  lotBar: 6,
  example: 14,
  chip: 18,
  tile: 22,
  button: 28,
  cardInner: 28.5,
  card: 30,
  pill: 999,
} as const;

export const DURATIONS = {
  press: 120,
  text: 250,
  orbColor: 300,
  themeFade: 400,
  bars: 450,
} as const;

export const TOUCH = {
  minimum: 48,
  button: 56,
  primary: 168,
} as const;

/** Fuera del tema: el ícono del distintivo de la tarjeta y el dibujo del centro del orbe. */
export const GLYPH_COLOR = '#FFFFFF';

/** El volumen de la esfera del orbe, igual en los dos temas (VISUAL 5.1). */
export const ORB_SHADE = {
  center: '#00000026',
  edge: '#00000038',
  shine: '#FFFFFFB8',
  rim: '#FFFFFFE6',
} as const;

/** La entrada del logo (VISUAL 4.8): el blanco de sus caminos, las ondas y el fogonazo del golpe. */
export const LOGO_INTRO_COLORS = {
  roads: '#FFFFFF',
  wave: '#3CCC6C',
  /** El verde vivo con el que brillan las parcelas oscuras. */
  lightGreen: '#3CCC6C',
  flash:
    'radial-gradient(circle closest-side at 50% 50%, #F4FFF6F2 0%, #D2F9DCE0 42%, #86E8A570 60%, #3CCC6C26 80%, #3CCC6C00 100%)',
} as const;
