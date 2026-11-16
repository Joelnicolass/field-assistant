import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { PANEL_PADDING } from './constants';

export function createStyles(theme: Theme) {
  const box = {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.tile,
    paddingVertical: PANEL_PADDING.vertical,
    paddingHorizontal: PANEL_PADDING.horizontal,
  };
  return StyleSheet.create({
    panel: { ...box, flexDirection: 'row' },
    column: { flex: 1, justifyContent: 'space-between', gap: theme.spacing.hair },
    divider: {
      width: StyleSheet.hairlineWidth * 2,
      backgroundColor: theme.colors.hairline,
      marginHorizontal: theme.spacing.md,
    },
    value: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      columnGap: theme.spacing.xs,
    },
    tiles: { flexDirection: 'row', gap: theme.spacing.md },
    tile: { ...box, flex: 1, justifyContent: 'space-between', gap: theme.spacing.hair },
  });
}
