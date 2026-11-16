import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import type { ThemeMode } from '@/shared/presentation/theme/ThemeMode';

/**
 * Pinta el fondo de la ventana nativa con el del tema. En Android el desenfoque dibuja ese fondo
 * detrás de lo que desenfoca, y no cambia una vez armado: devuelve el tema con el que quedó
 * pintado, para usarlo de `key` y rearmar el desenfoque recién cuando el fondo ya cambió.
 */
export function useWindowBackground(): ThemeMode | null {
  const theme = useTheme();
  const [painted, setPainted] = useState<ThemeMode | null>(null);

  useEffect(() => {
    let current = true;
    void SystemUI.setBackgroundColorAsync(theme.colors.background).then(() => {
      if (current) {
        setPainted(theme.mode);
      }
    });
    return () => {
      current = false;
    };
  }, [theme.colors.background, theme.mode]);

  return painted;
}
