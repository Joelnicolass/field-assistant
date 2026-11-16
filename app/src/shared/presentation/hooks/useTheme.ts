import { use } from 'react';

import { ThemeContext } from '@/shared/presentation/states/ThemeProvider/ThemeContext';
import type { Theme } from '@/shared/presentation/theme/Theme';

/** Entrega el tema activo, claro u oscuro, con todos sus valores. */
export function useTheme(): Theme {
  return use(ThemeContext);
}
