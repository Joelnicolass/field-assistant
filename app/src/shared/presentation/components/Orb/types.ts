import type { ReactNode } from 'react';
import type { DerivedValue } from 'react-native-reanimated';

import type { OrbGlyph } from './OrbGlyph';

export type OrbStateSpec = {
  glyph: OrbGlyph;
  /** Cuánto tardan los colores en dar una vuelta. */
  swirlMs: number;
  /** Cuánto dura una respiración. */
  breathMs: number;
  /** Cuánto crece al respirar, como fracción del tamaño: 0,03 es un 3 %. */
  breathSize: number;
  /** Fuerza del resplandor, de 0 a 1. */
  glow: number;
  ripples: boolean;
  /** Si la esfera y las barras siguen a `level`. */
  followsVoice: boolean;
  /** Cuánto se mueven las barras cuando no siguen a la voz, de 0 a 1. */
  barsLevel: number;
};

export type OrbPalette = {
  core: readonly [string, string, string];
  blobs: readonly [string, string, string];
  ring: readonly [string, string, string, string];
  glow: string;
};

/**
 * Lo que una entrada le hace al orbe mientras corre. El orbe no sabe cuál es: solo obedece estos
 * valores. Sin entrada, aparece ya armado.
 */
export type OrbIntro = {
  /** Por cuánto se multiplica el tamaño de cada capa: 1 es su tamaño normal. */
  sphereScale: DerivedValue<number>;
  ringScale: DerivedValue<number>;
  haloScale: DerivedValue<number>;
  /** El dibujo del centro: cuánto se ve, de 0 a 1, y de qué tamaño. */
  glyphOpacity: DerivedValue<number>;
  glyphScale: DerivedValue<number>;
  /** Por cuánto se multiplica el giro de los colores. */
  swirlBoost: DerivedValue<number>;
  /** Lo que la entrada dibuja detrás de la esfera y adentro de ella. */
  behind: ReactNode;
  inside: ReactNode;
};
