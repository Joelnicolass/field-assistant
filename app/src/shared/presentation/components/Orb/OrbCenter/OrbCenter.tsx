import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { ORB_STATES } from '../orbStates';
import type { OrbLayerProps } from '../layerProps';
import { glyphIn, glyphOut } from '../transitions';
import { ORB_GLYPHS } from './glyphs';

/** El dibujo blanco del centro, el que dice la ficha del estado. */
export function OrbCenter({ state, size, motion }: OrbLayerProps) {
  const glyph = ORB_STATES[state].glyph;
  const Drawing = ORB_GLYPHS[glyph];
  return (
    <Animated.View
      key={glyph}
      entering={glyphIn}
      exiting={glyphOut}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.center]}
    >
      <Drawing size={size} motion={motion} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
