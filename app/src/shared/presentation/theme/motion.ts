import { Easing } from 'react-native-reanimated';

/** Las curvas de VISUAL 4.6: `enter` para lo que aparece y `move` para lo que va de un lugar a otro. */
export const EASING = {
  enter: Easing.bezier(0.23, 1, 0.32, 1),
  move: Easing.bezier(0.645, 0.045, 0.355, 1),
} as const;

export const SPRINGS = {
  soft: { duration: 280, dampingRatio: 0.9 },
  gentle: { duration: 380, dampingRatio: 0.96 },
  snappy: { duration: 170, dampingRatio: 0.92 },
  loose: { duration: 420, dampingRatio: 0.85 },
} as const;
