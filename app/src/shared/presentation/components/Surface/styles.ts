import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { Tone } from '@/shared/presentation/theme/Tone';

const BORDER_WIDTH = 1.5;

function diagonal([start, middle, end]: readonly [string, string, string]): string {
  return `linear-gradient(135deg, ${start} 0%, ${middle} 50%, ${end} 100%)`;
}

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    border: {
      borderRadius: theme.radii.card,
      padding: BORDER_WIDTH,
      boxShadow: theme.shadows.card,
    },
    face: {
      borderRadius: theme.radii.cardInner,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.xxl,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.gutter,
      gap: theme.spacing.xs,
    },
    [Tone.Brand]: { backgroundImage: diagonal(theme.tones[Tone.Brand]) },
    [Tone.Warning]: { backgroundImage: diagonal(theme.tones[Tone.Warning]) },
    [Tone.Danger]: { backgroundImage: diagonal(theme.tones[Tone.Danger]) },
  });
}
