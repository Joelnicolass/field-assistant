import type { BlurTint } from 'expo-blur';

import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';

/** El velo del desenfoque sigue al tema: claro en el claro y oscuro en el oscuro. */
export const BLUR_TINT: Record<ThemeMode, BlurTint> = {
  [ThemeMode.Light]: 'light',
  [ThemeMode.Dark]: 'dark',
};

/** Cuánto se desenfoca el resumen, de 1 a 100. */
export const BLUR_INTENSITY = 24;
export const BLUR_IN_MS = 220;
export const BLUR_OUT_MS = 160;
