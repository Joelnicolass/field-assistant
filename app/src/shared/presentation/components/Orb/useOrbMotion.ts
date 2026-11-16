import { useEffect } from 'react';
import {
  ReduceMotion,
  useFrameCallback,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type DerivedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { EASING, SPRINGS } from '@/shared/presentation/theme/motion';
import { GLIDE_MS, KICK_SIZE, RIPPLE_MS, WAVE_MS } from './constants';
import { ORB_STATES } from './orbStates';
import type { OrbState } from './OrbState';
import type { OrbIntro } from './types';

// El movimiento del orbe dice el estado de la app: ignora "reducir animaciones" (V3).
const ALWAYS = ReduceMotion.Never;
const GLIDE = { duration: GLIDE_MS, easing: EASING.move, reduceMotion: ALWAYS };
const spring = (config: { duration: number; dampingRatio: number }) => ({
  ...config,
  reduceMotion: ALWAYS,
});

/** Lleva cada número de la ficha del estado anterior al nuevo, y encoge apenas el orbe al cambiar. */
function usePose(state: OrbState) {
  const spec = ORB_STATES[state];
  // Velocidades (1 / duración) y no duraciones: así el giro acelera sin saltar.
  const swirlSpeed = useSharedValue(1 / spec.swirlMs);
  const breathSpeed = useSharedValue(1 / spec.breathMs);
  const breathSize = useSharedValue(spec.breathSize);
  const glow = useSharedValue(spec.glow);
  const ripples = useSharedValue(spec.ripples ? 1 : 0);
  const kick = useSharedValue(0);
  const { durations } = useTheme();

  useEffect(() => {
    const next = ORB_STATES[state];
    swirlSpeed.set(withTiming(1 / next.swirlMs, GLIDE));
    breathSpeed.set(withTiming(1 / next.breathMs, GLIDE));
    breathSize.set(withTiming(next.breathSize, GLIDE));
    glow.set(withTiming(next.glow, GLIDE));
    ripples.set(withTiming(next.ripples ? 1 : 0, GLIDE));
    kick.set(
      withSequence(
        withTiming(KICK_SIZE, {
          duration: durations.press,
          easing: EASING.enter,
          reduceMotion: ALWAYS,
        }),
        withSpring(0, spring(SPRINGS.soft)),
      ),
    );
  }, [state, durations.press, swirlSpeed, breathSpeed, breathSize, glow, ripples, kick]);

  return { swirlSpeed, breathSpeed, breathSize, glow, ripples, kick };
}

/** Relojes de 0 a 1 que avanzan en cada cuadro según la velocidad de la pose. */
function usePhases(
  swirlSpeed: SharedValue<number>,
  breathSpeed: SharedValue<number>,
  swirlBoost: DerivedValue<number>,
) {
  const swirl = useSharedValue(0);
  const breath = useSharedValue(0);
  const ripple = useSharedValue(0);
  const wave = useSharedValue(0);

  useFrameCallback((frame) => {
    const elapsed = frame.timeSincePreviousFrame ?? 0;
    swirl.set((swirl.get() + elapsed * swirlSpeed.get() * swirlBoost.get()) % 1);
    breath.set((breath.get() + elapsed * breathSpeed.get()) % 1);
    ripple.set((ripple.get() + elapsed / RIPPLE_MS) % 1);
    wave.set((wave.get() + elapsed / WAVE_MS) % 1);
  });

  return { swirl, breath, ripple, wave };
}

/** Suaviza el nivel de la voz con resortes; `voiceLag` llega más tarde, para lo que va detrás. */
function useVoice(state: OrbState, level: number) {
  const { followsVoice, barsLevel } = ORB_STATES[state];
  const voice = useSharedValue(0);
  const voiceLag = useSharedValue(0);
  const bars = useSharedValue(0);

  useEffect(() => {
    const heard = followsVoice ? level : 0;
    voice.set(withSpring(heard, spring(SPRINGS.snappy)));
    voiceLag.set(withSpring(heard, spring(SPRINGS.loose)));
    bars.set(withSpring(followsVoice ? level : barsLevel, spring(SPRINGS.snappy)));
  }, [level, followsVoice, barsLevel, voice, voiceLag, bars]);

  return { voice, voiceLag, bars };
}

/** Vale 1 mientras el dedo está apoyado, y vuelve a 0 con un resorte al soltar. */
function usePress() {
  const { durations } = useTheme();
  const pressed = useSharedValue(0);
  return {
    pressed,
    onPressIn: () =>
      pressed.set(
        withTiming(1, { duration: durations.press, easing: EASING.enter, reduceMotion: ALWAYS }),
      ),
    onPressOut: () => pressed.set(withSpring(0, spring(SPRINGS.soft))),
  };
}

/** Los valores de la entrada o, sin entrada, un 1 fijo: tamaño normal, dibujo a la vista y giro normal. */
function useEntrance(intro: OrbIntro | undefined) {
  const still: DerivedValue<number> = useSharedValue(1);
  return {
    sphereScale: intro?.sphereScale ?? still,
    ringScale: intro?.ringScale ?? still,
    haloScale: intro?.haloScale ?? still,
    glyphOpacity: intro?.glyphOpacity ?? still,
    glyphScale: intro?.glyphScale ?? still,
    swirlBoost: intro?.swirlBoost ?? still,
  };
}

/** Todos los valores animados del orbe, que leen sus capas. */
export function useOrbMotion(state: OrbState, level: number, intro?: OrbIntro) {
  const entrance = useEntrance(intro);
  const pose = usePose(state);
  const phases = usePhases(pose.swirlSpeed, pose.breathSpeed, entrance.swirlBoost);
  const voice = useVoice(state, level);
  const press = usePress();
  return { entrance, pose, phases, voice, press };
}

export type OrbMotion = ReturnType<typeof useOrbMotion>;
