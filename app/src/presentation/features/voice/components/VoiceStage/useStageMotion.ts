import { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { STAGE } from './constants';
import { landing } from './landing';
import { useDockProgress } from './useDockProgress';
import { useIntroStage } from './useIntroStage';
import { useVoiceLift } from './useVoiceLift';

/**
 * Ubica el orbe: con la entrada, en el centro de la ventana; después, grande en el centro del
 * escenario sin tarjetas, y chico en su casillero con ellas. Todo con escala y traslación.
 */
export function useStageMotion(docked: boolean, bottomInset: number, withIntro: boolean) {
  const intro = useIntroStage(withIntro);
  // Si ya hay una tarjeta al abrir, el orbe espera a aterrizar para achicarse y bajar.
  const dock = useDockProgress(docked && intro.landed);
  const lift = useVoiceLift(bottomInset);
  const { liftNow, screenShift, shown } = lift;
  const { descent } = intro;

  const voiceStyle = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [
      {
        translateY:
          -(1 - dock.get()) * liftNow.get() - landing(descent.get()).where * screenShift.get(),
      },
    ],
  }));
  const orbStyle = useAnimatedStyle(() => {
    const scale = interpolate(dock.get(), [0, 1], [1, STAGE.dockScale]);
    const { stretch } = landing(descent.get());
    return {
      transform: [{ scaleX: scale * (1 - 0.6 * stretch) }, { scaleY: scale * (1 + stretch) }],
    };
  });
  const subtitleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -(1 - dock.get()) * STAGE.spread }],
  }));
  const statusStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - dock.get()) * STAGE.spread }],
  }));

  return {
    ...intro,
    onStageLayout: lift.onStageLayout,
    measured: lift.measured,
    stageTop: lift.stageTop,
    bottomGap: lift.bottomGap,
    subtitleRoom: lift.subtitleRoom,
    voiceStyle,
    orbStyle,
    subtitleStyle,
    statusStyle,
  };
}
