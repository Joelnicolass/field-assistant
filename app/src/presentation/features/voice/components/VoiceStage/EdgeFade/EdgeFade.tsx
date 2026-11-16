import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { styles } from './styles';

type EdgeFadeProps = {
  /** Arriba se funde hacia arriba; abajo, hacia abajo. */
  edge: 'top' | 'bottom';
  /** De 0 a 1: cuánto se ve, según lo que queda por recorrer de ese lado. */
  visible: SharedValue<number>;
};

/** Un degradé al color del fondo sobre el borde de la lista: avisa que hay más para recorrer. */
export function EdgeFade({ edge, visible }: EdgeFadeProps) {
  const theme = useTheme();
  const style = useAnimatedStyle(() => ({ opacity: visible.get() }));
  const gradientId = `edge-fade-${edge}`;
  const [from, to] = edge === 'top' ? [1, 0] : [0, 1];

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.fade, edge === 'top' ? styles.top : styles.bottom, style]}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset={0} stopColor={theme.colors.background} stopOpacity={from} />
            <Stop offset={1} stopColor={theme.colors.background} stopOpacity={to} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </Animated.View>
  );
}
