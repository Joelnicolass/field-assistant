import { useEffect, useEffectEvent, useState } from 'react';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import type { OrbIntro } from '@/shared/presentation/components/Orb';
import { LogoAura } from './LogoAura';
import { LogoPieces } from './LogoPieces';
import { LogoSplash } from './LogoSplash';
import {
  glyphOpacity,
  glyphScale,
  IMPACT_AT,
  INTRO_TOTAL_MS,
  introScale,
  RELEASE_AT,
  REVEAL_AT,
} from './timeline';

const BLENDER_BOOST = 12; // hasta cuántas veces más rápido giran los colores al caer las parcelas
const SPIN_UP_MS = (IMPACT_AT - RELEASE_AT) * 0.55;
const SPIN_DOWN_MS = 1300;
// El aro y el resplandor hacen cada gesto un momento después que la esfera.
const RING_LAG_MS = 70;
const HALO_LAG_MS = 150;
const CLEANUP_MS = 200;

type LogoIntroOptions = {
  /** Diámetro del orbe. */
  size: number;
  /** false: no hay entrada y el orbe aparece ya armado. */
  enabled: boolean;
  /** true cuando el orbe ya está a la vista: hasta entonces, queda quieto en el primer cuadro. */
  ready: boolean;
  /** Se llama una vez, cuando ya puede aparecer el resto de la pantalla. */
  onEnd: () => void;
};

/** Arranca el reloj de la entrada y la aceleración del giro; avisa al revelar y al terminar. */
function useIntroClock({ enabled, ready, onEnd }: Omit<LogoIntroOptions, 'size'>) {
  const clock = useSharedValue(0);
  const swirlBoost = useSharedValue(1);
  const [playing, setPlaying] = useState(enabled);
  const reveal = useEffectEvent(onEnd);

  useEffect(() => {
    if (!enabled || !ready) {
      return;
    }
    clock.set(withTiming(INTRO_TOTAL_MS, { duration: INTRO_TOTAL_MS, easing: Easing.linear }));
    const spinUp = withTiming(BLENDER_BOOST, {
      duration: SPIN_UP_MS,
      easing: Easing.in(Easing.quad),
    });
    const spinDown = withTiming(1, { duration: SPIN_DOWN_MS, easing: Easing.out(Easing.cubic) });
    swirlBoost.set(
      withSequence(
        withDelay(RELEASE_AT, spinUp),
        withDelay(IMPACT_AT - RELEASE_AT - SPIN_UP_MS, spinDown),
      ),
    );
    const revealTimer = setTimeout(reveal, REVEAL_AT);
    const finishTimer = setTimeout(() => setPlaying(false), INTRO_TOTAL_MS + CLEANUP_MS);
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(finishTimer);
    };
  }, [enabled, ready, clock, swirlBoost]);

  return { clock, swirlBoost, playing };
}

function useEntranceValues(clock: SharedValue<number>) {
  return {
    sphereScale: useDerivedValue(() => introScale(clock.get())),
    ringScale: useDerivedValue(() => introScale(clock.get() - RING_LAG_MS)),
    haloScale: useDerivedValue(() => introScale(clock.get() - HALO_LAG_MS)),
    glyphOpacity: useDerivedValue(() => glyphOpacity(clock.get())),
    glyphScale: useDerivedValue(() => glyphScale(clock.get())),
  };
}

/**
 * La entrada del logo (VISUAL 4.8): el logo aparece en el orbe, toma carrera, sus parcelas caen
 * al centro en espiral y, con el golpe, aparece el micrófono. Devuelve lo que el orbe obedece.
 */
export function useLogoIntro({ size, ...options }: LogoIntroOptions): OrbIntro | undefined {
  const { clock, swirlBoost, playing } = useIntroClock(options);
  const values = useEntranceValues(clock);
  if (!options.enabled) {
    return undefined;
  }
  return {
    ...values,
    swirlBoost,
    behind: playing ? (
      <>
        <LogoAura size={size} clock={clock} />
        <LogoSplash size={size} clock={clock} />
      </>
    ) : null,
    inside: playing ? <LogoPieces size={size} clock={clock} /> : null,
  };
}
