import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { BAR_HEIGHT } from './constants';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    rows: {
      borderTopWidth: StyleSheet.hairlineWidth * 2,
      borderTopColor: theme.colors.hairline,
      marginTop: theme.spacing.base,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    row: { gap: theme.spacing.xs },
    line: { flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.sm },
    label: { flex: 1 },
    bar: {
      height: BAR_HEIGHT,
      borderRadius: theme.radii.bar,
      backgroundColor: theme.colors.surfaceSoft,
      overflow: 'hidden',
    },
    fill: { height: BAR_HEIGHT, backgroundColor: theme.colors.brand, transformOrigin: 'left' },
  });
}
