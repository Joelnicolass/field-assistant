import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { ORB_STATES } from '../orbStates';
import type { OrbLayerProps } from '../layerProps';
import { glyphIn, glyphOut } from '../transitions';
import { ORB_GLYPHS } from './glyphs';

/** El dibujo blanco del centro, el que dice la ficha del estado. */
export function OrbCenter({ state, size, motion }: OrbLayerProps) {
  const glyph = ORB_STATES[state].glyph;
  const Drawing = ORB_GLYPHS[glyph];
  const { glyphOpacity, glyphScale } = motion.entrance;
  // La entrada lo esconde y lo hace crecer; sin entrada vale 1 y no cambia nada.
  const entrance = useAnimatedStyle(() => ({
    opacity: glyphOpacity.get(),
    transform: [{ scale: glyphScale.get() }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, entrance]}>
      <Animated.View
        key={glyph}
        entering={glyphIn}
        exiting={glyphOut}
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.center]}
      >
        <Drawing size={size} motion={motion} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
