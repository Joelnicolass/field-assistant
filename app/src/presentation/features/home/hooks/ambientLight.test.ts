import { describe, expect, it } from '@jest/globals';

import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';
import { nextBrightness, nextThemeMode } from './ambientLight';

describe('nextThemeMode', () => {
  it('pasa a claro arriba de 600 lux', () => {
    expect(nextThemeMode(601, ThemeMode.Dark)).toBe(ThemeMode.Light);
  });

  it('pasa a oscuro abajo de 150 lux', () => {
    expect(nextThemeMode(149, ThemeMode.Light)).toBe(ThemeMode.Dark);
  });

  it('entre 150 y 600 lux deja el tema que estaba', () => {
    expect(nextThemeMode(300, ThemeMode.Light)).toBe(ThemeMode.Light);
    expect(nextThemeMode(300, ThemeMode.Dark)).toBe(ThemeMode.Dark);
  });

  it('en 600 y en 150 lux justos deja el tema que estaba', () => {
    expect(nextThemeMode(600, ThemeMode.Dark)).toBe(ThemeMode.Dark);
    expect(nextThemeMode(150, ThemeMode.Light)).toBe(ThemeMode.Light);
  });
});

describe('nextBrightness', () => {
  it('sube el brillo arriba de 10.000 lux', () => {
    expect(nextBrightness(10001, false)).toBe(true);
  });

  it('baja el brillo abajo de 3.000 lux', () => {
    expect(nextBrightness(2999, true)).toBe(false);
  });

  it('entre 3.000 y 10.000 lux deja el brillo como estaba', () => {
    expect(nextBrightness(5000, true)).toBe(true);
    expect(nextBrightness(5000, false)).toBe(false);
  });

  it('en 10.000 y en 3.000 lux justos deja el brillo como estaba', () => {
    expect(nextBrightness(10000, false)).toBe(false);
    expect(nextBrightness(3000, true)).toBe(true);
  });
});
