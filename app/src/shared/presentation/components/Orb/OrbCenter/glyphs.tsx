import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Icon, IconName } from '@/shared/presentation/components/Icon';
import { GLYPH_COLOR } from '@/shared/presentation/theme/tokens';
import {
  BAR_GAP,
  BAR_HEIGHT,
  BAR_SHAPE,
  BAR_WIDTH,
  DOT_GAP,
  DOT_SIZE,
  MICROPHONE_SIZE,
  TURN,
} from '../constants';
import { OrbGlyph } from '../OrbGlyph';
import type { OrbMotion } from '../useOrbMotion';

export type OrbGlyphProps = { size: number; motion: OrbMotion };

function Microphone({ size }: OrbGlyphProps) {
  return <Icon name={IconName.Microphone} size={size * MICROPHONE_SIZE} color={GLYPH_COLOR} />;
}

function Bar({ index, shape, size, motion }: OrbGlyphProps & { index: number; shape: number }) {
  const { bars } = motion.voice;
  const { wave } = motion.phases;
  const width = size * BAR_WIDTH;
  const style = useAnimatedStyle(() => {
    // Cada barra va un poco atrasada respecto de la anterior: el conjunto ondula.
    const sway = 0.6 + 0.4 * Math.sin((wave.get() - index * 0.18) * TURN);
    return { transform: [{ scaleY: 0.16 + Math.min(1, bars.get() * 1.3) * 0.84 * shape * sway }] };
  });
  return (
    <Animated.View
      style={[
        { width, height: size * BAR_HEIGHT, borderRadius: width / 2, backgroundColor: GLYPH_COLOR },
        style,
      ]}
    />
  );
}

function Bars({ size, motion }: OrbGlyphProps) {
  return (
    <View style={[styles.row, { gap: size * BAR_GAP }]}>
      {BAR_SHAPE.map((shape, index) => (
        <Bar key={index} index={index} shape={shape} size={size} motion={motion} />
      ))}
    </View>
  );
}

function Dot({ index, size, motion }: OrbGlyphProps & { index: number }) {
  const { wave } = motion.phases;
  const diameter = size * DOT_SIZE;
  const style = useAnimatedStyle(() => {
    // Solo la mitad de arriba de la onda: el punto salta y espera su turno.
    const hop = Math.max(0, Math.sin((wave.get() - index * 0.16) * TURN));
    return { transform: [{ translateY: -hop * diameter * 1.2 }] };
  });
  return (
    <Animated.View
      style={[
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: GLYPH_COLOR,
        },
        style,
      ]}
    />
  );
}

function Dots({ size, motion }: OrbGlyphProps) {
  return (
    <View style={[styles.row, { gap: size * DOT_GAP }]}>
      {[0, 1, 2].map((index) => (
        <Dot key={index} index={index} size={size} motion={motion} />
      ))}
    </View>
  );
}

export const ORB_GLYPHS: Record<OrbGlyph, ComponentType<OrbGlyphProps>> = {
  [OrbGlyph.Microphone]: Microphone,
  [OrbGlyph.Bars]: Bars,
  [OrbGlyph.Dots]: Dots,
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
