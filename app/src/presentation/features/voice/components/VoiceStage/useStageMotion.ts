import { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { STAGE } from './constants';
import { useDockProgress } from './useDockProgress';
import { useVoiceLift } from './useVoiceLift';

/**
 * Ubica el orbe: grande en el centro del escenario sin tarjetas, y chico en su casillero con
 * ellas. El cambio es una escala y una traslación, sin recalcular la pantalla.
 */
export function useStageMotion(docked: boolean, bottomInset: number) {
  const dock = useDockProgress(docked);
  const { onStageLayout, bottomGap, liftNow, shown } = useVoiceLift(bottomInset);

  const voiceStyle = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [{ translateY: -(1 - dock.get()) * liftNow.get() }],
  }));
  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(dock.get(), [0, 1], [1, STAGE.dockScale]) }],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -(1 - dock.get()) * STAGE.spread }],
  }));
  const statusStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - dock.get()) * STAGE.spread }],
  }));

  return { onStageLayout, bottomGap, voiceStyle, orbStyle, subtitleStyle, statusStyle };
}
