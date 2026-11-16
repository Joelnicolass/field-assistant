import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { Tone } from '@/shared/presentation/theme/Tone';
import { BAR, PANEL_PADDING } from './constants';

export function createStyles(theme: Theme) {
  const [top, bottom] = theme.tones[Tone.Brand];
  return StyleSheet.create({
    panel: {
      gap: theme.spacing.base,
      backgroundColor: theme.colors.surfaceSoft,
      borderRadius: theme.radii.tile,
      paddingVertical: PANEL_PADDING.vertical,
      paddingHorizontal: PANEL_PADDING.horizontal,
    },
    heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    chip: {
      borderRadius: theme.radii.pill,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    lots: { flexDirection: 'row', gap: theme.spacing.sm },
    lot: { flex: 1, alignItems: 'center', gap: theme.spacing.hair },
    track: {
      width: BAR.width,
      height: BAR.height,
      borderRadius: theme.radii.lotBar,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    fill: {
      height: '100%',
      transformOrigin: 'bottom',
      borderRadius: theme.radii.lotBar,
      backgroundImage: `linear-gradient(0deg, ${bottom} 0%, ${top} 100%)`,
    },
  });
}
