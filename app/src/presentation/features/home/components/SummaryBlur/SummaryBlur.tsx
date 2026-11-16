import { BlurTargetView, BlurView } from 'expo-blur';
import { useRef, type ComponentRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { BLUR_INTENSITY, BLUR_IN_MS, BLUR_OUT_MS } from './constants';
import { styles } from './styles';

type SummaryBlurProps = {
  /** Con tarjetas en pantalla, el resumen queda de fondo, desenfocado. */
  blurred: boolean;
  children: ReactNode;
};

/**
 * Desenfoca lo que envuelve. En Android, el desenfoque lee lo que dibuja el `BlurTargetView`, así
 * que la vista borrosa va al lado, encima, y no adentro. Cubre toda la pantalla que lo contiene
 * (no solo el resumen), así no queda una franja blanca entre el resumen y las tarjetas.
 */
export function SummaryBlur({ blurred, children }: SummaryBlurProps) {
  const target = useRef<ComponentRef<typeof View>>(null);

  return (
    <>
      <BlurTargetView ref={target}>{children}</BlurTargetView>
      {blurred ? (
        <Animated.View
          pointerEvents="none"
          entering={FadeIn.duration(BLUR_IN_MS)}
          exiting={FadeOut.duration(BLUR_OUT_MS)}
          style={styles.cover}
        >
          <BlurView
            blurTarget={target}
            blurMethod="dimezisBlurView"
            intensity={BLUR_INTENSITY}
            style={styles.cover}
          />
        </Animated.View>
      ) : null}
    </>
  );
}
