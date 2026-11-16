import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { STAGE } from './constants';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    stage: { flex: 1 },
    cards: { position: 'absolute', top: 0, left: 0, right: 0 },
    // El margen de abajo y de los costados le deja lugar a la sombra de la tarjeta.
    // Pocas tarjetas quedan abajo, junto al orbe; arriba se ve el resumen desenfocado.
    cardsContent: {
      flexGrow: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: theme.spacing.gutter,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xxxl,
      gap: theme.spacing.lg,
    },
    voice: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: STAGE.voiceHeight,
      alignItems: 'center',
    },
    subtitle: {
      alignSelf: 'stretch',
      height: STAGE.subtitleHeight,
      justifyContent: 'flex-end',
      paddingHorizontal: theme.spacing.xxl,
    },
    slot: { height: STAGE.slotHeight, alignItems: 'center', justifyContent: 'center' },
    status: { height: STAGE.statusHeight, justifyContent: 'center' },
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  });
}
