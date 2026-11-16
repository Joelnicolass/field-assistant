import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    section: { gap: theme.spacing.base },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
    // El resplandor mide el doble que la esfera: el escenario le deja ese lugar.
    stage: {
      alignItems: 'center',
      justifyContent: 'center',
      height: theme.touch.primary * 2,
      gap: theme.spacing.xl,
    },
    status: { alignItems: 'center' },
  });
}
