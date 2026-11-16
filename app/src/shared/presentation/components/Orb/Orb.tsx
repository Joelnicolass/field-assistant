import { Pressable } from 'react-native';

import { HIT_SLOP } from './constants';
import { OrbCenter } from './OrbCenter';
import { OrbHalo } from './OrbHalo';
import { OrbRing } from './OrbRing';
import { OrbRipples } from './OrbRipples';
import { OrbSphere } from './OrbSphere';
import type { OrbState } from './OrbState';
import type { OrbIntro } from './types';
import { useOrbMotion } from './useOrbMotion';

type OrbProps = {
  state: OrbState;
  /** Nivel de la voz, de 0 a 1. Solo lo usan los estados con `followsVoice`. */
  level: number;
  /** Diámetro de la esfera: el aro y el resplandor la rodean por fuera. */
  size: number;
  onPress: () => void;
  accessibilityLabel: string;
  /** Una entrada que corre al abrir; sin ella, el orbe aparece ya armado. */
  intro?: OrbIntro;
};

export function Orb(props: OrbProps) {
  const { state, level, size, onPress, accessibilityLabel, intro } = props;
  const motion = useOrbMotion(state, level, intro);
  const layer = { state, size, motion };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={motion.press.onPressIn}
      onPressOut={motion.press.onPressOut}
      hitSlop={HIT_SLOP}
      style={{ width: size, height: size }}
    >
      <OrbHalo {...layer} />
      <OrbRipples {...layer} />
      {intro?.behind}
      <OrbRing {...layer} />
      <OrbSphere {...layer} inside={intro?.inside}>
        <OrbCenter {...layer} />
      </OrbSphere>
    </Pressable>
  );
}
