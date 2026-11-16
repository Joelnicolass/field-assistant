import { useState } from 'react';
import { useColorScheme, type ColorSchemeName } from 'react-native';

import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';
import { nextThemeMode } from './ambientLight';
import { useAmbientLux } from './useAmbientLux';

const SYSTEM_MODE: Record<ColorSchemeName, ThemeMode> = {
  light: ThemeMode.Light,
  dark: ThemeMode.Dark,
};

/** El tema según la luz ambiente; sin sensor, el del sistema. Mientras `held` es verdadero, claro. */
export function useAmbientTheme(held: boolean): ThemeMode {
  const systemScheme = useColorScheme();
  const [sensorMode, setSensorMode] = useState(ThemeMode.Light);
  const hasSensor = useAmbientLux((lux) => setSensorMode((current) => nextThemeMode(lux, current)));

  if (held) {
    return ThemeMode.Light;
  }
  if (hasSensor === false) {
    return SYSTEM_MODE[systemScheme ?? 'light'];
  }
  return sensorMode;
}
