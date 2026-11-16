import type { ThemeMode } from '@/shared/presentation/theme/ThemeMode';
import type { Tone } from '@/shared/presentation/theme/Tone';
import type { TextVariant } from '@/shared/presentation/theme/TextVariant';
import type { DURATIONS, RADII, SPACING, TOUCH } from '@/shared/presentation/theme/tokens';
import type { TextVariantSpec } from '@/shared/presentation/theme/typography';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSoft: string;
  hairline: string;
  text: string;
  textMuted: string;
  brand: string;
  onBrand: string;
  warning: string;
  danger: string;
};

export type Theme = {
  mode: ThemeMode;
  colors: ThemeColors;
  typography: { family: string; variants: Record<TextVariant, TextVariantSpec> };
  spacing: typeof SPACING;
  radii: typeof RADII;
  shadows: { card: string };
  durations: typeof DURATIONS;
  touch: typeof TOUCH;
  tones: Record<Tone, readonly [string, string, string]>;
};
