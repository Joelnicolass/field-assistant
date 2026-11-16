import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { ARC_BASE, DOT_SIZE, PATH_HEIGHT } from './constants';

// Los 7 de alto del chip salen de VISUAL 6; no son un paso de la escala.
const CHIP_PADDING_VERTICAL = 7;

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    route: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    chip: {
      alignItems: 'center',
      borderRadius: theme.radii.chip,
      paddingVertical: CHIP_PADDING_VERTICAL,
      paddingHorizontal: theme.spacing.gutter,
      backgroundColor: theme.colors.surfaceSoft,
    },
    path: { flex: 1, height: PATH_HEIGHT },
    dot: {
      position: 'absolute',
      left: -DOT_SIZE / 2,
      top: ARC_BASE - DOT_SIZE / 2,
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: theme.colors.brand,
    },
  });
}
