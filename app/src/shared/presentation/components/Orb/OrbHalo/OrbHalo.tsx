import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { HALO_SCALE, TURN } from '../constants';
import { centered, softSpot } from '../helpers';
import type { OrbLayerProps } from '../layerProps';
import { OrbPerState } from '../OrbPerState';

const HALO_OPACITY = 0.85;

/** El resplandor de atrás: late con la respiración y sigue a la voz con retraso. */
export function OrbHalo({ state, size, motion }: OrbLayerProps) {
  const { glow, kick } = motion.pose;
  const { breath } = motion.phases;
  const { voiceLag } = motion.voice;
  const { haloScale } = motion.entrance;
  const diameter = size * HALO_SCALE;

  const style = useAnimatedStyle(() => ({
    opacity: glow.get() * (0.8 + 0.2 * Math.sin(breath.get() * TURN)),
    transform: [{ scale: haloScale.get() * (1 + voiceLag.get() * 0.3 + kick.get() * 0.6) }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[centered(size, diameter), style]}>
      <OrbPerState state={state}>
        {(palette) => (
          <View
            style={{
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              backgroundImage: softSpot(palette.glow, HALO_OPACITY),
            }}
          />
        )}
      </OrbPerState>
    </Animated.View>
  );
}
