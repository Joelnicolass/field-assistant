import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { LOGO_INTRO_COLORS } from '@/shared/presentation/theme/tokens';
import { elapsed, FLASH_MS, HIT_LEAD_MS, IMPACT_AT, pace, smooth, SPLASH_MS } from '../timeline';
import type { IntroLayerProps } from '../types';
import { DROPS, WAVES } from './constants';
import { Drop } from './Drop';

type WaveProps = IntroLayerProps & { delay: number; reach: number; thickness: number };

/** Una onda: un aro que nace en el borde del orbe, se abre rápido, frena y se apaga. */
function Wave({ size, clock, delay, reach, thickness }: WaveProps) {
  const start = IMPACT_AT + pace(delay);
  const style = useAnimatedStyle(() => {
    const t = elapsed(clock.get(), start, SPLASH_MS);
    const open = 1 - (1 - t) * (1 - t) * (1 - t);
    return {
      opacity: smooth(t, 0, 0.06) * (1 - smooth(t, 0.25, 1)) * 0.8,
      transform: [{ scale: 1 + reach * open }],
    };
  });
  const ring = {
    borderRadius: size / 2,
    borderWidth: thickness,
    borderColor: LOGO_INTRO_COLORS.wave,
  };
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, ring, style]} />;
}

function Flash({ size, clock }: IntroLayerProps) {
  const style = useAnimatedStyle(() => {
    const t = elapsed(clock.get(), IMPACT_AT - HIT_LEAD_MS / 2, FLASH_MS);
    return {
      opacity: smooth(t, 0, 0.12) * (1 - smooth(t, 0.16, 1)) * 0.95,
      transform: [{ scale: 0.7 + 0.75 * (1 - (1 - t) * (1 - t) * (1 - t)) }],
    };
  });
  const side = size * 2.4;
  const box = {
    position: 'absolute',
    left: (size - side) / 2,
    top: (size - side) / 2,
    width: side,
    height: side,
    borderRadius: side / 2,
  } as const;
  return (
    <Animated.View
      pointerEvents="none"
      style={[box, { backgroundImage: LOGO_INTRO_COLORS.flash }, style]}
    />
  );
}

/** 5. Cuando el orbe termina de tragarse el logo: un fogonazo, dos ondas y un anillo de gotas. */
export function LogoSplash({ size, clock }: IntroLayerProps) {
  return (
    <>
      <Flash size={size} clock={clock} />
      {WAVES.map(({ key, ...wave }) => (
        <Wave key={key} size={size} clock={clock} {...wave} />
      ))}
      {Array.from({ length: DROPS }, (_, index) => (
        <Drop key={index} index={index} size={size} clock={clock} />
      ))}
    </>
  );
}
