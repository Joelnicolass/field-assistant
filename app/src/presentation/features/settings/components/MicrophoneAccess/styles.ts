import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    panel: {
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surfaceSoft,
      borderRadius: theme.radii.tile,
      padding: theme.spacing.gutter,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  });
}
