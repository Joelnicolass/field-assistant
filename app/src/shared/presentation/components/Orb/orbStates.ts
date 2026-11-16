import { OrbGlyph } from './OrbGlyph';
import { OrbState } from './OrbState';
import type { OrbStateSpec } from './types';

// La ficha de cada estado (VISUAL 5.3). Ningún componente pregunta por un estado: leen esto.
export const ORB_STATES: Record<OrbState, OrbStateSpec> = {
  [OrbState.Idle]: {
    glyph: OrbGlyph.Microphone,
    swirlMs: 16000,
    breathMs: 4200,
    breathSize: 0.025,
    glow: 0.6,
    ripples: false,
    followsVoice: false,
    barsLevel: 0,
  },
  [OrbState.Listening]: {
    glyph: OrbGlyph.Bars,
    swirlMs: 5000,
    breathMs: 1400,
    breathSize: 0.012,
    glow: 0.85,
    ripples: true,
    followsVoice: true,
    barsLevel: 0,
  },
  [OrbState.Thinking]: {
    glyph: OrbGlyph.Dots,
    swirlMs: 1800,
    breathMs: 1400,
    breathSize: 0.008,
    glow: 0.7,
    ripples: false,
    followsVoice: false,
    barsLevel: 0,
  },
  [OrbState.Speaking]: {
    glyph: OrbGlyph.Bars,
    swirlMs: 4500,
    breathMs: 1100,
    breathSize: 0.03,
    glow: 0.9,
    ripples: true,
    followsVoice: false,
    barsLevel: 0.6,
  },
};
