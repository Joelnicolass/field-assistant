import { describe, expect, it } from '@jest/globals';

import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { THEMES } from '@/shared/presentation/theme/themes';

function luminance(hex: string): number {
  const channel = (start: number) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

describe.each(Object.values(THEMES))('tema $mode', (theme) => {
  it('el texto se lee a 4,5 a 1 o más sobre el fondo y la superficie', () => {
    const { text, textMuted, textSubtle, background, surface } = theme.colors;
    [text, textMuted, textSubtle].forEach((foreground) =>
      [background, surface].forEach((back) =>
        expect(contrast(foreground, back)).toBeGreaterThanOrEqual(4.5),
      ),
    );
  });

  it('el subtítulo, los botones y los números de tarjeta miden 20 o más', () => {
    const big = [
      TextVariant.Subtitle,
      TextVariant.Button,
      TextVariant.Display,
      TextVariant.RowValue,
      TextVariant.LotNumber,
    ];
    big.forEach((variant) =>
      expect(theme.typography.variants[variant].size).toBeGreaterThanOrEqual(20),
    );
  });

  it('el botón principal mide 64 o más', () => {
    expect(theme.touch.primary).toBeGreaterThanOrEqual(64);
  });
});
