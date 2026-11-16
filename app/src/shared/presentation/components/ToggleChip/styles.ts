import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { PADDING, ROUND_PADDING } from './constants';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderRadius: theme.radii.pill,
      paddingVertical: PADDING.vertical,
      paddingHorizontal: PADDING.horizontal,
    },
    round: { paddingVertical: ROUND_PADDING, paddingHorizontal: ROUND_PADDING },
    off: { backgroundColor: theme.colors.surfaceSoft },
    on: { backgroundColor: theme.colors.brand },
  });
}
