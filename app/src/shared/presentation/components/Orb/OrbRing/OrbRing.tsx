import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { RING_LAYER_SCALE, RING_RADIUS, RING_STROKE } from '../constants';
import { centered, squash } from '../helpers';
import type { OrbLayerProps } from '../layerProps';
import { OrbPerState } from '../OrbPerState';
import type { OrbPalette } from '../types';

const GRADIENT_ID = 'ring';

function RingDrawing({ palette, size }: { palette: OrbPalette; size: number }) {
  const diameter = size * RING_LAYER_SCALE;
  const center = diameter / 2;
  const radius = size * RING_RADIUS;
  const width = size * RING_STROKE;
  const last = palette.ring.length - 1;
  return (
    <Svg width={diameter} height={diameter}>
      <Defs>
        <LinearGradient id={GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
          {palette.ring.map((color, index) => (
            <Stop key={color} offset={index / last} stopColor={color} />
          ))}
        </LinearGradient>
      </Defs>
      <Circle cx={center} cy={center} r={radius} stroke={`url(#${GRADIENT_ID})`} strokeWidth={width} fill="none" />
    </Svg>
  );
}

/** El aro: gira al doble que los colores, se aplasta con la esfera y sigue a la voz con retraso. */
export function OrbRing({ state, size, motion }: OrbLayerProps) {
  const { swirl } = motion.phases;
  const { voice, voiceLag } = motion.voice;
  const { pressed } = motion.press;

  // La escala va antes que el giro para que el aro se aplaste en el mismo eje que la esfera.
  const style = useAnimatedStyle(() => {
    const scale = 1 + voiceLag.get() * 0.14;
    const shape = squash(voice.get(), voiceLag.get(), pressed.get());
    return {
      transform: [
        { scaleX: scale * shape.x },
        { scaleY: scale * shape.y },
        { rotate: `${swirl.get() * 720}deg` },
      ],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[centered(size, size * RING_LAYER_SCALE), style]}>
      <OrbPerState state={state}>{(palette) => <RingDrawing palette={palette} size={size} />}</OrbPerState>
    </Animated.View>
  );
}
