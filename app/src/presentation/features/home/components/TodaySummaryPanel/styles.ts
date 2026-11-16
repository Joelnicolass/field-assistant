import { StyleSheet } from 'react-native';
import type { CSSTransitionProperties } from 'react-native-reanimated';

import type { Theme } from '@/shared/presentation/theme/Theme';

export function createStyles(theme: Theme) {
  // Al apagarse o encenderse, la opacidad cambia con una transición y no de golpe.
  const fade: CSSTransitionProperties = {
    transitionProperty: 'opacity',
    transitionDuration: theme.durations.orbColor,
  };
  return {
    ...StyleSheet.create({
      panel: { paddingHorizontal: theme.spacing.gutter, gap: theme.spacing.base },
    }),
    fade,
  };
}
