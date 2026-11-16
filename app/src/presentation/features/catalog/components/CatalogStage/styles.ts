import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { STAGE_HEIGHT } from './constants';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    section: { gap: theme.spacing.base },
    // El resumen y el escenario traen su propio margen lateral: se compensa el del catálogo.
    bleed: { marginHorizontal: -theme.spacing.gutter },
    stage: {
      height: STAGE_HEIGHT,
      marginHorizontal: -theme.spacing.gutter,
      borderTopWidth: StyleSheet.hairlineWidth * 2,
      borderBottomWidth: StyleSheet.hairlineWidth * 2,
      borderColor: theme.colors.hairline,
    },
  });
}
