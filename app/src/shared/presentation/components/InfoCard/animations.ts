import { withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { EASING, SPRINGS } from '@/shared/presentation/theme/motion';

// Los tiempos de VISUAL 4.6 para la tarjeta.
const CARD_DELAY_MS = 80;
const CARD_RISE = 18;
const CARD_SCALE = 0.98;
const CARD_FADE_MS = 250;
const CARD_EXIT_MS = 180;
const PART_DELAY_MS = 110;
const PART_STEP_MS = 40;
const PART_RISE = 8;
const PART_MS = 300;
const POP_DELAY_MS = 150;
const POP_SCALE = 0.92;

export function cardIn() {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: CARD_RISE }, { scale: CARD_SCALE }] },
    animations: {
      opacity: withDelay(
        CARD_DELAY_MS,
        withTiming(1, { duration: CARD_FADE_MS, easing: EASING.enter }),
      ),
      transform: [
        { translateY: withDelay(CARD_DELAY_MS, withSpring(0, SPRINGS.soft)) },
        { scale: withDelay(CARD_DELAY_MS, withSpring(1, SPRINGS.soft)) },
      ],
    },
  };
}

export function cardOut() {
  'worklet';
  return {
    initialValues: { opacity: 1, transform: [{ scale: 1 }] },
    animations: {
      opacity: withTiming(0, { duration: CARD_EXIT_MS, easing: EASING.enter }),
      transform: [
        { scale: withTiming(CARD_SCALE, { duration: CARD_EXIT_MS, easing: EASING.enter }) },
      ],
    },
  };
}

function partIn(order: number) {
  const delay = PART_DELAY_MS + order * PART_STEP_MS;
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateY: PART_RISE }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, { duration: PART_MS, easing: EASING.enter })),
        transform: [
          {
            translateY: withDelay(
              delay,
              withTiming(0, { duration: PART_MS, easing: EASING.enter }),
            ),
          },
        ],
      },
    };
  };
}

export function popIn() {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ scale: POP_SCALE }] },
    animations: {
      opacity: withDelay(
        POP_DELAY_MS,
        withTiming(1, { duration: CARD_FADE_MS, easing: EASING.enter }),
      ),
      transform: [{ scale: withDelay(POP_DELAY_MS, withSpring(1, SPRINGS.soft)) }],
    },
  };
}

/** La entrada de cada parte de la tarjeta, de arriba hacia abajo: el índice es su orden. */
export const PART_IN = [0, 1, 2, 3, 4, 5].map(partIn);
