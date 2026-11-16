import { useState } from 'react';

import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  [ThemeMode.Light]: ThemeMode.Dark,
  [ThemeMode.Dark]: ThemeMode.Light,
};

/** Guarda el tema que muestra el catálogo y lo alterna entre claro y oscuro. */
export function useCatalogTheme() {
  const [mode, setMode] = useState(ThemeMode.Light);
  return { mode, toggleMode: () => setMode((current) => NEXT_MODE[current]) };
}
