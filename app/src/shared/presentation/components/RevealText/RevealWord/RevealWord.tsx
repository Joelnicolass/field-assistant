import { StyleSheet, type TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { alpha } from '@/shared/presentation/theme/alpha';
import { GROWN, LAYERS, RISE, ROOM, SHADOW_OPACITY, SPACE } from './constants';
import { progress, smooth } from './helpers';

type Layer = (typeof LAYERS)[number];

type RevealWordProps = {
  word: string;
  startsAt: number;
  wordMs: number;
  /** Sin movimiento: la palabra solo se enfoca, sin subir ni achicarse. */
  still: boolean;
  clock: SharedValue<number>;
  letter: TextStyle;
  color: string;
};

// Android 11 no desenfoca una vista, pero sí la sombra de un texto: una capa borrosa es la
// palabra con las letras transparentes y solo su sombra a la vista.
function WordLayer({
  layer,
  over,
  word,
  startsAt,
  wordMs,
  clock,
  letter,
  color,
}: RevealWordProps & { layer: Layer; over: boolean }) {
  const size = letter.fontSize ?? 0;
  const [appearsFrom, appearsTo] = layer.appears;
  const [fadesFrom, fadesTo] = layer.fades;
  const visible = useAnimatedStyle(() => {
    const t = progress(clock.get(), startsAt, wordMs);
    return { opacity: smooth(t, appearsFrom, appearsTo) * (1 - smooth(t, fadesFrom, fadesTo)) };
  });
  const ink: TextStyle =
    layer.blur === 0
      ? { color }
      : {
          color: 'transparent',
          textShadowColor: alpha(color, SHADOW_OPACITY),
          textShadowRadius: size * layer.blur,
          textShadowOffset: { width: 0, height: 0 },
        };

  return (
    <Animated.Text style={[letter, { padding: size * ROOM }, over && styles.over, ink, visible]}>
      {word}
    </Animated.Text>
  );
}

/** Una palabra que sube a su lugar y se enfoca, de borrosa a nítida. */
export function RevealWord(props: RevealWordProps) {
  const { startsAt, wordMs, still, clock, letter } = props;
  const size = letter.fontSize ?? 0;
  const room = size * ROOM;
  const rise = still ? 0 : size * RISE;
  const grown = still ? 1 : GROWN;
  const settle = useAnimatedStyle(() => {
    const arrived = smooth(progress(clock.get(), startsAt, wordMs), 0, 1);
    return {
      transform: [{ translateY: rise * (1 - arrived) }, { scale: grown - (grown - 1) * arrived }],
    };
  });

  return (
    // El margen negativo compensa el aire de cada capa: la palabra no ocupa más lugar.
    <Animated.View style={[{ margin: -room, marginRight: -room + size * SPACE }, settle]}>
      {LAYERS.map((layer, index) => (
        <WordLayer key={layer.blur} layer={layer} over={index > 0} {...props} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  over: { position: 'absolute', left: 0, top: 0 },
});
