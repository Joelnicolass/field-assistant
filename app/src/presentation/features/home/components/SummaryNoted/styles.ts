import { StyleSheet } from 'react-native';

import { alpha } from '@/shared/presentation/theme/alpha';
import type { Theme } from '@/shared/presentation/theme/Theme';
import { BACKGROUND_OPACITY, BORDER_OPACITY, DOT_SIZE } from './constants';

// Sin nada anotado es un aviso; con algo anotado, una confirmación en el color de la marca.
function toned(color: string) {
  return {
    backgroundColor: alpha(color, BACKGROUND_OPACITY),
    borderColor: alpha(color, BORDER_OPACITY),
  };
}

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      borderWidth: 1,
      borderRadius: theme.radii.tile,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
    },
    dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2 },
    text: { flex: 1 },
    pending: toned(theme.colors.warning),
    done: toned(theme.colors.brand),
    pendingDot: { backgroundColor: theme.colors.warning },
    doneDot: { backgroundColor: theme.colors.brand },
  });
}
