import { StyleSheet } from 'react-native';

import { ButtonVariant } from '@/shared/presentation/components/AppButton';
import type { Theme } from '@/shared/presentation/theme/Theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    buttons: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.xl },
    // Cada botón mide lo que su texto y se reparten lo que sobra, 1,5 partes contra 1. Con
    // el ancho entero repartido así, "Descartar" no entra en un teléfono de 360 de ancho.
    [ButtonVariant.Primary]: { flexGrow: 1.5, flexShrink: 0 },
    [ButtonVariant.Secondary]: { flexGrow: 1, flexShrink: 0 },
  });
}
