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
