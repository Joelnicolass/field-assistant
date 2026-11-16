import { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { locate } from '../locate';
import type { LogoPiece } from '../pieces';
import { elapsed, PIECE_MS, RELEASE_AT, smooth, STARTS, TURN } from '../timeline';

type PieceInput = { piece: LogoPiece; index: number; size: number; clock: SharedValue<number> };

/** La caída de una parcela: va al centro en espiral, se alarga al acelerar y se achica. */
function usePieceOrbit({ piece, size, clock, start }: PieceInput & { start: number }) {
  const { dx, dy, radius, angle } = locate(piece, size);
  return useAnimatedStyle(() => {
    const t = elapsed(clock.get(), start, PIECE_MS);
    const stepBack = Math.sin(Math.min(1, t / 0.2) * Math.PI); // antes de caer se aleja apenas
    const fall = t * t * t; // arranca despacio y termina muy rápido, como en un remolino
    const distance = radius * (1 + 0.1 * stepBack) * (1 - fall);
    const around = angle - 0.12 * stepBack + TURN * 2 * Math.PI * fall;
    const speed = 3 * t * t * (1 - fall);
    const heading = around + Math.PI / 2;
    return {
      transform: [
        { translateX: Math.cos(around) * distance - dx },
        { translateY: Math.sin(around) * distance - dy },
        { rotate: `${heading}rad` },
        { scaleX: 1 + 0.45 * speed },
        { scaleY: 1 - 0.15 * speed },
        { rotate: `${-heading}rad` },
        { rotate: `${around - angle}rad` },
        { scale: 1 - 0.55 * fall },
      ],
    };
  });
}

/** Derretirse: la nítida le deja el lugar a la blanda, y esa a la muy blanda, que se disuelve. */
function useMelt(clock: SharedValue<number>, start: number) {
  const sharp = useAnimatedStyle(() => ({
    opacity: 1 - smooth(elapsed(clock.get(), start, PIECE_MS), 0.1, 0.45),
  }));
  const soft = useAnimatedStyle(() => {
    const t = elapsed(clock.get(), start, PIECE_MS);
    return { opacity: smooth(t, 0.1, 0.4) * (1 - smooth(t, 0.5, 0.78)) };
  });
  const melted = useAnimatedStyle(() => {
    const t = elapsed(clock.get(), start, PIECE_MS);
    return { opacity: smooth(t, 0.45, 0.75) * (1 - smooth(t, 0.86, 1)) };
  });
  return { sharp, soft, melted };
}

export function usePieceMotion(input: PieceInput) {
  const start = RELEASE_AT + (STARTS[input.index] ?? 0);
  return { orbit: usePieceOrbit({ ...input, start }), melt: useMelt(input.clock, start) };
}
