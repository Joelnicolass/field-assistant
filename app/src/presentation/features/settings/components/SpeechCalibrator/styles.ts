import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { MARKER_WIDTH, METER_HEIGHT } from './constants';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    panel: {
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surfaceSoft,
      borderRadius: theme.radii.tile,
      padding: theme.spacing.gutter,
    },
    meter: {
      height: METER_HEIGHT,
      borderRadius: theme.radii.bar,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    fill: { height: METER_HEIGHT, backgroundColor: theme.colors.brand },
    // La marca del umbral sobre el medidor: lo que la pasa cuenta como voz.
    marker: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: MARKER_WIDTH,
      backgroundColor: theme.colors.warning,
    },
    buttons: { gap: theme.spacing.sm },
  });
}
