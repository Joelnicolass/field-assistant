import { StyleSheet } from 'react-native';

import { alpha } from '@/shared/presentation/theme/alpha';
import type { Theme } from '@/shared/presentation/theme/Theme';
import {
  LOGO_RADIUS,
  LOGO_SIZE,
  PENDING_BACKGROUND_OPACITY,
  PILL_PADDING,
  ROUND_PADDING,
} from './constants';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    // El logo a la izquierda; al lado, el título con el campo debajo, alineado con la F.
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md },
    names: { flex: 1, gap: theme.spacing.hair },
    // Centrado con el bloque del título y el campo.
    logo: { width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: LOGO_RADIUS, alignSelf: 'center' },
    pills: { alignItems: 'flex-end', gap: theme.spacing.xs },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderRadius: theme.radii.pill,
      paddingVertical: PILL_PADDING.vertical,
      paddingHorizontal: PILL_PADDING.horizontal,
      backgroundColor: theme.colors.surfaceSoft,
    },
    round: { paddingVertical: ROUND_PADDING, paddingHorizontal: ROUND_PADDING },
    // Las dos de solo ícono, una al lado de la otra.
    icons: { flexDirection: 'row', gap: theme.spacing.xs },
    pending: { backgroundColor: alpha(theme.colors.warning, PENDING_BACKGROUND_OPACITY) },
  });
}
