import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useStyles } from '@/shared/presentation/hooks/useStyles';
import type { Tone } from '@/shared/presentation/theme/Tone';
import { createStyles } from './styles';

type SurfaceProps = { tone: Tone; children: ReactNode };

export function Surface({ tone, children }: SurfaceProps) {
  const styles = useStyles(createStyles);
  return (
    <View style={[styles.border, styles[tone]]}>
      <View style={styles.face}>{children}</View>
    </View>
  );
}
