import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { LOGO_PIECES } from '../pieces';
import { elapsed, IMPACT_AT, pace, smooth, SPLASH_MS } from '../timeline';
import type { IntroLayerProps } from '../types';
import { DROPS } from './constants';

/** Un número entre 0 y 1 que parece al azar pero es siempre el mismo para cada gota. */
function vary(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

/** Cómo sale una gota: hacia dónde, cuánto llega, cuándo y de qué color. */
function dropPlan(index: number, size: number) {
  const angle = ((index + (vary(index, 1) - 0.5) * 0.7) / DROPS) * 2 * Math.PI;
  const reach = size * (0.42 + 0.5 * vary(index, 3));
  return {
    side: size * (0.06 + 0.07 * vary(index, 2)),
    delay: pace(90) * vary(index, 4),
    length: SPLASH_MS * (0.65 + 0.35 * vary(index, 5)),
    color: LOGO_PIECES[index % LOGO_PIECES.length]?.color,
    from: { x: Math.cos(angle) * size * 0.46, y: Math.sin(angle) * size * 0.46 },
    push: { x: Math.cos(angle) * reach, y: Math.sin(angle) * reach },
    weight: size * 0.16, // cuánto la tira para abajo su peso
  };
}

/** Una gota: una lágrima que sale despedida hacia afuera, con la cola hacia el orbe. */
export function Drop({ index, size, clock }: IntroLayerProps & { index: number }) {
  const { side, delay, length, color, from, push, weight } = dropPlan(index, size);

  const style = useAnimatedStyle(() => {
    const t = elapsed(clock.get(), IMPACT_AT + delay, length);
    const flight = 1 - (1 - t) * (1 - t) * (1 - t);
    const heading = Math.atan2(push.y + 2 * weight * flight, push.x);
    const stretch = 1 - flight;
    const grown = smooth(t, 0, 0.12) * (1 - 0.5 * smooth(t, 0.5, 1));
    return {
      opacity: smooth(t, 0, 0.06) * (1 - smooth(t, 0.55, 1)),
      transform: [
        { translateX: from.x + push.x * flight },
        { translateY: from.y + push.y * flight + weight * flight * flight },
        { rotate: `${heading}rad` },
        { scaleX: grown * (1 + 0.7 * stretch) },
        { scaleY: grown * (1 - 0.22 * stretch) },
      ],
    };
  });

  const box = {
    position: 'absolute',
    left: (size - side) / 2,
    top: (size - side) / 2,
    width: side,
    height: side,
  } as const;
  // La lágrima: un cuadrado con tres esquinas redondas y una en punta, girado 45 grados.
  const tear = {
    width: side,
    height: side,
    borderTopLeftRadius: side / 2,
    borderTopRightRadius: side / 2,
    borderBottomRightRadius: side / 2,
    transform: [{ rotate: '45deg' }],
    backgroundColor: color,
  };
  return (
    <Animated.View pointerEvents="none" style={[box, style]}>
      <Animated.View style={tear} />
    </Animated.View>
  );
}
