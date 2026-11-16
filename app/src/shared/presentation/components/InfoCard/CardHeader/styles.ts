import { StyleSheet } from 'react-native';

import { diagonal } from '@/shared/presentation/theme/gradients';
import type { Theme } from '@/shared/presentation/theme/Theme';
import { Tone } from '@/shared/presentation/theme/Tone';
import { BADGE_SIZE, CLOSE_SIZE } from './constants';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    badge: {
      width: BADGE_SIZE,
      height: BADGE_SIZE,
      borderRadius: BADGE_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: { flex: 1 },
    close: {
      width: CLOSE_SIZE,
      height: CLOSE_SIZE,
      borderRadius: CLOSE_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceSoft,
    },
    [Tone.Brand]: { backgroundImage: diagonal(theme.tones[Tone.Brand]) },
    [Tone.Warning]: { backgroundImage: diagonal(theme.tones[Tone.Warning]) },
    [Tone.Danger]: { backgroundImage: diagonal(theme.tones[Tone.Danger]) },
  });
}
