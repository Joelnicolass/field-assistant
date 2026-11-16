import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { METER_HEIGHT } from './constants';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    section: { gap: theme.spacing.md },
    meter: {
      height: METER_HEIGHT,
      borderRadius: theme.radii.bar,
      backgroundColor: theme.colors.surfaceSoft,
      overflow: 'hidden',
    },
    fill: { height: METER_HEIGHT, backgroundColor: theme.colors.brand },
  });
}
