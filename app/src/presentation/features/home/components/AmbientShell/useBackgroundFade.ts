import { useEffect } from 'react';
import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { EASING } from '@/shared/presentation/theme/motion';
import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';
import { THEMES } from '@/shared/presentation/theme/themes';
import { DURATIONS } from '@/shared/presentation/theme/tokens';
import { FADE_POSITION } from './constants';

const BACKGROUNDS = [
  THEMES[ThemeMode.Light].colors.background,
  THEMES[ThemeMode.Dark].colors.background,
];

/** El color de fondo, que se funde de un tema al otro en `themeFade` (la excepción de R46, VISUAL 4.1). */
export function useBackgroundFade(mode: ThemeMode) {
  const position = useSharedValue(FADE_POSITION[mode]);

  useEffect(() => {
    position.set(
      withTiming(FADE_POSITION[mode], { duration: DURATIONS.themeFade, easing: EASING.move }),
    );
  }, [mode, position]);

  return useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(position.get(), [0, 1], BACKGROUNDS),
  }));
}
