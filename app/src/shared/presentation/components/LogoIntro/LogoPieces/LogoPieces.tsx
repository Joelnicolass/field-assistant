import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { LOGO_INTRO_COLORS } from '@/shared/presentation/theme/tokens';
import { LOGO_PIECES, type LogoPiece } from '../pieces';
import { RELEASE_AT, smooth, TWIST_BACK_MS, BREATH_FROM, BREATH_TO, WIND_AT } from '../timeline';
import type { IntroLayerProps } from '../types';
import { usePieceMotion } from './usePieceMotion';

// Las versiones desenfocadas son más grandes que la parcela: sobresalen ese margen de cada lado.
// El ancho y el alto van explícitos: sin ellos, la imagen toma el tamaño de su archivo.
function outset(piece: LogoPiece, margin: number, size: number) {
  const edge = margin * size;
  return {
    position: 'absolute',
    left: -edge,
    top: -edge,
    width: piece.width * size + 2 * edge,
    height: piece.height * size + 2 * edge,
  } as const;
}

function Piece({
  piece,
  index,
  size,
  clock,
}: IntroLayerProps & { piece: LogoPiece; index: number }) {
  const { orbit, melt } = usePieceMotion({ piece, index, size, clock });
  const box = {
    position: 'absolute',
    left: piece.x * size,
    top: piece.y * size,
    width: piece.width * size,
    height: piece.height * size,
  } as const;
  return (
    <Animated.View style={[box, orbit]}>
      <Animated.Image
        source={piece.melted}
        resizeMode="stretch"
        style={[outset(piece, piece.meltedMargin, size), melt.melted]}
      />
      <Animated.Image
        source={piece.soft}
        resizeMode="stretch"
        style={[outset(piece, piece.softMargin, size), melt.soft]}
      />
      <Animated.Image
        source={piece.sharp}
        resizeMode="stretch"
        style={[outset(piece, 0, size), melt.sharp]}
      />
    </Animated.View>
  );
}

/** El logo adentro de la esfera: sus caminos blancos se apagan y las parcelas caen al centro. */
export function LogoPieces({ size, clock }: IntroLayerProps) {
  // Al tomar carrera, todo el logo gira un poco para atrás; al soltar, vuelve.
  const twist = useAnimatedStyle(() => {
    const back = smooth(clock.get(), WIND_AT, RELEASE_AT);
    const undo = smooth(clock.get(), RELEASE_AT, RELEASE_AT + TWIST_BACK_MS);
    return { transform: [{ rotate: `${-0.2 * back * (1 - undo)}rad` }] };
  });
  const roads = useAnimatedStyle(() => ({
    opacity: 1 - smooth(clock.get(), BREATH_FROM, BREATH_TO),
  }));
  const disc = { borderRadius: size / 2, backgroundColor: LOGO_INTRO_COLORS.roads };

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, twist]}>
      <Animated.View style={[StyleSheet.absoluteFill, disc, roads]} />
      {LOGO_PIECES.map((piece, index) => (
        <Piece key={piece.color + index} piece={piece} index={index} size={size} clock={clock} />
      ))}
    </Animated.View>
  );
}
