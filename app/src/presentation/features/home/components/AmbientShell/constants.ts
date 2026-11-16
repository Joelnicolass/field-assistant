import type { StatusBarStyle } from 'expo-status-bar';

import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';

/** Íconos de la barra de estado oscuros sobre el fondo claro y claros sobre el oscuro. */
export const STATUS_BAR_STYLE: Record<ThemeMode, StatusBarStyle> = {
  [ThemeMode.Light]: 'dark',
  [ThemeMode.Dark]: 'light',
};

/** Dónde está el fundido del fondo en cada tema: 0 es el fondo claro y 1 el oscuro. */
export const FADE_POSITION: Record<ThemeMode, number> = {
  [ThemeMode.Light]: 0,
  [ThemeMode.Dark]: 1,
};
