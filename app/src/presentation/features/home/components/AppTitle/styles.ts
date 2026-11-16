import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    title: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  });
}
