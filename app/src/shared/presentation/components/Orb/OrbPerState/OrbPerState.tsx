import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import type { OrbState } from '../OrbState';
import { colorIn, colorOut } from '../transitions';
import type { OrbPalette } from '../types';

type OrbPerStateProps = { state: OrbState; children: (palette: OrbPalette) => ReactNode };

/** Dibuja la capa con los colores del estado; al cambiar, el color nuevo se funde sobre el anterior. */
export function OrbPerState({ state, children }: OrbPerStateProps) {
  const theme = useTheme();
  return (
    <Animated.View
      key={state}
      entering={colorIn}
      exiting={colorOut}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      {children(theme.orb[state])}
    </Animated.View>
  );
}
