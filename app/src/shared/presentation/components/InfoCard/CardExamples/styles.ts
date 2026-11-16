import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';

// Los 7 de alto del chip salen de VISUAL 6; no son un paso de la escala.
const CHIP_PADDING_VERTICAL = 7;

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    examples: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    chip: {
      alignSelf: 'flex-start',
      borderRadius: theme.radii.example,
      paddingVertical: CHIP_PADDING_VERTICAL,
      paddingHorizontal: theme.spacing.base,
      backgroundColor: theme.colors.surfaceSoft,
    },
  });
}
