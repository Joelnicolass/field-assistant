import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { alpha } from '@/shared/presentation/theme/alpha';
import { LOGO_INTRO_COLORS } from '@/shared/presentation/theme/tokens';
import { locate } from '../locate';
import { LOGO_PIECES, type LogoPiece } from '../pieces';
import { bounce, elapsed, PIECE_MS, RELEASE_AT, smooth, STARTS, TURN } from '../timeline';
import type { IntroLayerProps } from '../types';

// Una luz oscura no es luz: las parcelas verde oscuro brillan con el verde vivo del logo.
function lightOf(color: string): string {
  const channels = [1, 3, 5].map((at) => parseInt(color.slice(at, at + 2), 16));
  return Math.max(...channels) < 130 ? LOGO_INTRO_COLORS.lightGreen : color;
}

function glowOf(color: string): string {
  const light = lightOf(color);
  const stops = [
    `${alpha(light, 0.9)} 0%`,
    `${alpha(light, 0.55)} 42%`,
    `${alpha(light, 0.18)} 72%`,
  ];
  return `radial-gradient(ellipse closest-side at 50% 50%, ${stops.join(', ')}, ${alpha(light, 0)} 100%)`;
}

type LobeProps = IntroLayerProps & { piece: LogoPiece; index: number };

/** El lóbulo de luz que suelta una parcela al caer: gira detrás del orbe y se apaga. */
function Lobe({ piece, index, size, clock }: LobeProps) {
  const { angle } = locate(piece, size);
  const weight = Math.min(1, (piece.width * piece.height) / 0.2); // parcela grande, luz grande y lenta
  const width = size * (1.05 + 0.45 * weight);
  const height = size * (0.8 + 0.3 * weight);
  const start = RELEASE_AT + (STARTS[index] ?? 0);
  const life = PIECE_MS * (1.7 + 0.5 * weight);

  const style = useAnimatedStyle(() => {
    const t = elapsed(clock.get(), start, life);
    const sweep = smooth(t, 0.04, 1);
    const around = angle + TURN * 2 * Math.PI * 1.2 * sweep;
    const distance = size * (0.4 + 0.22 * Math.sin(Math.PI * smooth(t, 0, 0.85)));
    const grow = 0.6 + 0.6 * bounce(elapsed(t, 0.02, 0.5)) - 0.45 * smooth(t, 0.55, 1);
    const speed = Math.sin(Math.PI * sweep);
    return {
      opacity: smooth(t, 0, 0.16) * (1 - smooth(t, 0.34, 1)) * 0.92,
      transform: [
        { translateX: Math.cos(around) * distance },
        { translateY: Math.sin(around) * distance },
        { rotate: `${around + Math.PI / 2}rad` },
        { scaleX: grow * (1 + 0.35 * speed) },
        { scaleY: grow * (1 - 0.12 * speed) },
      ],
    };
  });

  const box = {
    position: 'absolute',
    left: (size - width) / 2,
    top: (size - height) / 2,
    width,
    height,
  } as const;
  return (
    <Animated.View
      pointerEvents="none"
      style={[box, { backgroundImage: glowOf(piece.color) }, style]}
    />
  );
}

/** El resplandor de la entrada, detrás del orbe: una luz por parcela. */
export function LogoAura({ size, clock }: IntroLayerProps) {
  return LOGO_PIECES.map((piece, index) => (
    <Lobe key={piece.color + index} piece={piece} index={index} size={size} clock={clock} />
  ));
}
