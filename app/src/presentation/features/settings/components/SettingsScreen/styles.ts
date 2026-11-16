import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    // Sin fondo propio: lo dibuja AmbientShell, que lo funde al cambiar de tema.
    screen: { flex: 1 },
    content: { padding: theme.spacing.gutter, gap: theme.spacing.base },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    back: {
      backgroundColor: theme.colors.surfaceSoft,
      borderRadius: theme.radii.pill,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
    },
  });
}
