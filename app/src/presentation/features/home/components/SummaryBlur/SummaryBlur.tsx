import { BlurTargetView, BlurView } from 'expo-blur';
import { useRef, type ComponentRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { BLUR_INTENSITY, BLUR_IN_MS, BLUR_OUT_MS, BLUR_TINT } from './constants';
import { styles } from './styles';
import { useWindowBackground } from './useWindowBackground';

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
  const theme = useTheme();
  const painted = useWindowBackground();

  return (
    <>
      {/* Desenfocado, con el fondo del tema para que no quede sobre transparente. Sin desenfoque, sin
          fondo propio: el de la app se funde al cambiar de tema y este cambiaría de golpe. */}
      <BlurTargetView
        ref={target}
        style={blurred ? { backgroundColor: theme.colors.background } : undefined}
      >
        {children}
      </BlurTargetView>
      {blurred ? (
        <Animated.View
          pointerEvents="none"
          entering={FadeIn.duration(BLUR_IN_MS)}
          exiting={FadeOut.duration(BLUR_OUT_MS)}
          style={styles.cover}
        >
          {/* Se rearma cuando el fondo de la ventana ya tiene el color del tema nuevo. */}
          <BlurView
            key={painted ?? 'sin-pintar'}
            blurTarget={target}
            blurMethod="dimezisBlurView"
            intensity={BLUR_INTENSITY}
            tint={BLUR_TINT[theme.mode]}
            style={styles.cover}
          />
        </Animated.View>
      ) : null}
    </>
  );
}
