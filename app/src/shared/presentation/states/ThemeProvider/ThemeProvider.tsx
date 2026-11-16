import type { ReactNode } from 'react';

import type { ThemeMode } from '@/shared/presentation/theme/ThemeMode';
import { THEMES } from '@/shared/presentation/theme/themes';
import { ThemeContext } from './ThemeContext';

type ThemeProviderProps = { mode: ThemeMode; children: ReactNode };

export function ThemeProvider({ mode, children }: ThemeProviderProps) {
  return <ThemeContext value={THEMES[mode]}>{children}</ThemeContext>;
}
