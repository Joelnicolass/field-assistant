import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    heard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth * 2,
      borderTopColor: theme.colors.hairline,
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.base,
    },
    text: { flex: 1 },
  });
}
