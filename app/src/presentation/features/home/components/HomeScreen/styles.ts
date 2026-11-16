import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    // Sin fondo propio: lo dibuja AmbientShell, que lo funde al cambiar de tema.
    screen: { flex: 1, paddingTop: theme.spacing.base },
  });
}
