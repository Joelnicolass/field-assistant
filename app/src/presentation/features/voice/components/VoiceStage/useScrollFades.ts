import {
  interpolate,
  useAnimatedScrollHandler,
  useSharedValue,
  useDerivedValue,
  Extrapolation,
} from 'react-native-reanimated';

import { FADE_HEIGHT } from './constants';

/**
 * Cuánto mostrar los degradés de arriba y de abajo de la lista: aparecen a medida que queda
 * contenido por recorrer de ese lado, y no se ven si todo entra.
 */
export function useScrollFades() {
  const above = useSharedValue(0);
  const below = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler(({ contentOffset, contentSize, layoutMeasurement }) => {
    above.set(contentOffset.y);
    below.set(contentSize.height - layoutMeasurement.height - contentOffset.y);
  });

  const toOpacity = (distance: number) => {
    'worklet';
    return interpolate(distance, [0, FADE_HEIGHT], [0, 1], Extrapolation.CLAMP);
  };
  const top = useDerivedValue(() => toOpacity(above.get()));
  const bottom = useDerivedValue(() => toOpacity(below.get()));

  return { onScroll, top, bottom };
}
