import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { GLYPH_COLOR, ORB_SHADE } from '@/shared/presentation/theme/tokens';
import { TURN } from '../constants';
import { softSpot, squash } from '../helpers';
import type { OrbLayerProps } from '../layerProps';
import { OrbPerState } from '../OrbPerState';
import type { OrbPalette } from '../types';
import { BLOB_GROUPS, RIM_WIDTH, SHINE } from './constants';

type BlobGroup = keyof typeof BLOB_GROUPS;

function Base({ palette, size }: { palette: OrbPalette; size: number }) {
  const [lit, main, shade] = palette.core;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundImage: `radial-gradient(circle farthest-corner at 34% 28%, ${lit} 0%, ${main} 46%, ${shade} 100%)`,
      }}
    />
  );
}

function BlobDrawing({
  palette,
  size,
  group,
}: {
  palette: OrbPalette;
  size: number;
  group: BlobGroup;
}) {
  return BLOB_GROUPS[group].blobs.map((blob) => {
    const radius = blob.radius * size;
    const color = blob.color === null ? GLYPH_COLOR : palette.blobs[blob.color];
    return (
      <View
        key={`${blob.x}:${blob.y}`}
        style={{
          position: 'absolute',
          left: size / 2 + blob.x * size - radius,
          top: size / 2 + blob.y * size - radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          backgroundImage: softSpot(color, blob.opacity),
        }}
      />
    );
  });
}

// Los dos grupos de manchas giran en sentidos opuestos; el segundo late con la respiración.
function Blobs({ state, size, motion, group }: OrbLayerProps & { group: BlobGroup }) {
  const { swirl, breath } = motion.phases;
  const { turns, pulse } = BLOB_GROUPS[group];
  const style = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${swirl.get() * turns * 360}deg` },
      { scale: 1 + pulse * Math.sin(breath.get() * TURN) },
    ],
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <OrbPerState state={state}>
        {(palette) => <BlobDrawing palette={palette} size={size} group={group} />}
      </OrbPerState>
    </Animated.View>
  );
}

function Shade({ size }: { size: number }) {
  const round = { borderRadius: size / 2 };
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          StyleSheet.absoluteFill,
          round,
          {
            backgroundImage: `radial-gradient(circle closest-side at 50% 50%, ${ORB_SHADE.center} 0%, transparent 46%, transparent 66%, ${ORB_SHADE.edge} 100%)`,
          },
        ]}
      />
      <View
        style={{
          position: 'absolute',
          left: size * SHINE.left,
          top: size * SHINE.top,
          width: size * SHINE.width,
          height: size * SHINE.height,
          borderRadius: (size * SHINE.height) / 2,
          transform: [{ rotate: SHINE.angle }],
          backgroundImage: `radial-gradient(ellipse closest-side at 50% 50%, ${ORB_SHADE.shine} 0%, transparent 100%)`,
        }}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          round,
          { borderWidth: RIM_WIDTH, borderColor: ORB_SHADE.rim },
        ]}
      />
    </View>
  );
}

/** La esfera con sus manchas: respira, crece con la voz y se aplasta bajo el dedo. */
export function OrbSphere({
  state,
  size,
  motion,
  inside,
  children,
}: OrbLayerProps & { inside: ReactNode; children: ReactNode }) {
  const { breathSize, kick } = motion.pose;
  const { breath } = motion.phases;
  const { voice, voiceLag } = motion.voice;
  const { pressed } = motion.press;
  const { sphereScale } = motion.entrance;

  const style = useAnimatedStyle(() => {
    const breathing = Math.sin(breath.get() * TURN) * breathSize.get();
    const scale = sphereScale.get() * (1 + breathing + voice.get() * 0.2 + kick.get());
    const shape = squash(voice.get(), voiceLag.get(), pressed.get());
    return { transform: [{ scaleX: scale * shape.x }, { scaleY: scale * shape.y }] };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <OrbPerState state={state}>{(palette) => <Base palette={palette} size={size} />}</OrbPerState>
      <Blobs group="a" state={state} size={size} motion={motion} />
      <Blobs group="b" state={state} size={size} motion={motion} />
      <Shade size={size} />
      {inside}
      {children}
    </Animated.View>
  );
}
