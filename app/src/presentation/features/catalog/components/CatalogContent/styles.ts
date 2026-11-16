import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.gutter, gap: theme.spacing.base },
    toggle: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.surfaceSoft,
      borderRadius: theme.radii.pill,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
    },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.base },
  });
}
