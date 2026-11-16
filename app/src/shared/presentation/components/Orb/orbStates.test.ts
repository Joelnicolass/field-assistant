import { describe, expect, it } from '@jest/globals';

import { THEMES } from '@/shared/presentation/theme/themes';
import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';
import { OrbGlyph } from './OrbGlyph';
import { ORB_STATES } from './orbStates';
import { OrbState } from './OrbState';

describe('ORB_STATES', () => {
  it('tiene una ficha y colores en los dos temas para cada estado', () => {
    for (const state of Object.values(OrbState)) {
      expect(ORB_STATES[state]).toBeDefined();
      expect(THEMES[ThemeMode.Light].orb[state]).toBeDefined();
      expect(THEMES[ThemeMode.Dark].orb[state]).toBeDefined();
    }
  });

  it('escuchando y hablando comparten las barras y se distinguen por el color y la voz', () => {
    const listening = ORB_STATES[OrbState.Listening];
    const speaking = ORB_STATES[OrbState.Speaking];
    expect(listening.glyph).toBe(OrbGlyph.Bars);
    expect(speaking.glyph).toBe(OrbGlyph.Bars);
    expect(listening.followsVoice).not.toBe(speaking.followsVoice);
    expect(THEMES[ThemeMode.Light].orb[OrbState.Listening].glow).not.toBe(
      THEMES[ThemeMode.Light].orb[OrbState.Speaking].glow,
    );
  });
});
