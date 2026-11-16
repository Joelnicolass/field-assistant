import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import Animated from 'react-native-reanimated';

import { settings } from '@/core/configs/settings';
import { useUserSettings } from '@/presentation/features/settings/hooks/useUserSettings';
import { ThemeProvider } from '@/shared/presentation/states/ThemeProvider';
import { useAmbientTheme } from '../../hooks/useAmbientTheme';
import { useSunBrightness } from '../../hooks/useSunBrightness';
import { useThemeHold } from '../../hooks/useThemeHold';
import { STATUS_BAR_STYLE } from './constants';
import { styles } from './styles';
import { useBackgroundFade } from './useBackgroundFade';

type AmbientShellProps = { children: ReactNode };

/** Elige el tema y el brillo según la luz ambiente y dibuja el fondo de la app, que se funde al cambiar. */
export function AmbientShell({ children }: AmbientShellProps) {
  // El splash es blanco y la entrada del logo corre en claro: el tema del sensor espera a que terminen.
  const held = useThemeHold(settings.themeHoldMs);
  // Con el cambio automático apagado en Ajustes, queda el claro, igual que mientras espera.
  const automatic = useUserSettings().settings?.autoTheme ?? true;
  const mode = useAmbientTheme(held || !automatic);
  const background = useBackgroundFade(mode);
  useSunBrightness();

  return (
    <ThemeProvider mode={mode}>
      <StatusBar style={STATUS_BAR_STYLE[mode]} />
      <Animated.View style={[styles.shell, background]}>{children}</Animated.View>
    </ThemeProvider>
  );
}
