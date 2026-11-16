import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { ButtonVariant } from './ButtonVariant';
import { COUNTDOWN_OPACITY } from './constants';

export function createStyles(theme: Theme) {
  return {
    ...StyleSheet.create({
      button: {
        minHeight: theme.touch.button,
        borderRadius: theme.radii.button,
        paddingHorizontal: theme.spacing.gutter,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      },
      fill: {
        ...StyleSheet.absoluteFill,
        backgroundColor: theme.colors.onBrand,
        opacity: COUNTDOWN_OPACITY,
        transformOrigin: 'left',
      },
      [ButtonVariant.Primary]: { backgroundColor: theme.colors.brand },
      [ButtonVariant.Secondary]: { backgroundColor: theme.colors.surfaceSoft },
    }),
    labelColor: {
      [ButtonVariant.Primary]: theme.colors.onBrand,
      [ButtonVariant.Secondary]: theme.colors.text,
    } satisfies Record<ButtonVariant, string>,
  };
}
