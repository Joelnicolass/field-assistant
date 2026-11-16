import { createContext } from 'react';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';
import { THEMES } from '@/shared/presentation/theme/themes';

export const ThemeContext = createContext<Theme>(THEMES[ThemeMode.Light]);
