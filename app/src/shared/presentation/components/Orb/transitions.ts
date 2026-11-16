import { ReduceMotion, withTiming } from 'react-native-reanimated';

import { EASING } from '@/shared/presentation/theme/motion';
import { DURATIONS } from '@/shared/presentation/theme/tokens';
import { GLYPH_ENTER_SCALE } from './constants';

const ALWAYS = ReduceMotion.Never;
const colorFade = { duration: DURATIONS.orbColor, easing: EASING.enter, reduceMotion: ALWAYS };
const glyphSwap = { duration: DURATIONS.text, easing: EASING.enter, reduceMotion: ALWAYS };

// Al cambiar de estado se monta la capa del estado nuevo y se desmonta la del anterior:
// solo hay dos copias durante el fundido, y ninguna oculta que se siga animando.
export function colorIn() {
  'worklet';
  return { initialValues: { opacity: 0 }, animations: { opacity: withTiming(1, colorFade) } };
}

export function colorOut() {
  'worklet';
  return { initialValues: { opacity: 1 }, animations: { opacity: withTiming(0, colorFade) } };
}

/** El dibujo que entra crece desde 0,82 mientras aparece. */
export function glyphIn() {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ scale: GLYPH_ENTER_SCALE }] },
    animations: {
      opacity: withTiming(1, glyphSwap),
      transform: [{ scale: withTiming(1, glyphSwap) }],
    },
  };
}

export function glyphOut() {
  'worklet';
  return { initialValues: { opacity: 1 }, animations: { opacity: withTiming(0, glyphSwap) } };
}
