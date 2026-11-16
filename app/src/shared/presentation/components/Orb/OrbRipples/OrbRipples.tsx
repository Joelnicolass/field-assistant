import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { RIPPLE_BORDER } from '../constants';
import type { OrbLayerProps } from '../layerProps';
import type { OrbMotion } from '../useOrbMotion';

type RippleProps = { startsAt: number; color: string; size: number; motion: OrbMotion };

function Ripple({ startsAt, color, size, motion }: RippleProps) {
  const { ripple } = motion.phases;
  const { ripples } = motion.pose;
  const { voiceLag } = motion.voice;

  const style = useAnimatedStyle(() => {
    const progress = (ripple.get() + startsAt) % 1;
    const eased = 1 - (1 - progress) * (1 - progress);
    return {
      opacity: ripples.get() * (1 - progress) * 0.55,
      transform: [{ scale: 1 + eased * 0.62 + voiceLag.get() * 0.25 }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: size / 2, borderWidth: RIPPLE_BORDER, borderColor: color },
        style,
      ]}
    />
  );
}

/** Dos ondas que salen hacia afuera, una a mitad de camino de la otra. */
export function OrbRipples({ state, size, motion }: OrbLayerProps) {
  const [, inner, outer] = useTheme().orb[state].ring;
  return (
    <>
      <Ripple startsAt={0} color={inner} size={size} motion={motion} />
      <Ripple startsAt={0.5} color={outer} size={size} motion={motion} />
    </>
  );
}
