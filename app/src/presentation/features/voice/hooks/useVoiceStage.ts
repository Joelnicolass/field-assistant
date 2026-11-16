import { settings } from '@/core/configs/settings';
import { useDependencies } from '@/di/useDependencies';
import type { InfoCardProps } from '@/shared/presentation/components/InfoCard';
import type { OrbState } from '@/shared/presentation/components/Orb';
import { VoicePhase } from '../states/VoicePhase';
import { IDLE_SUBTITLE, ORB_STATE, STATUS_TEXT } from './constants';
import { cardView } from './replies/cardView';
import { useVoiceTurn, type VoiceTurnOptions } from './useVoiceTurn';

export type VoiceStageView = {
  orbState: OrbState;
  level: number;
  statusText: string;
  subtitle: string;
  cards: (InfoCardProps & { key: string })[];
  /** Audios guardados sin señal; con 0 no se muestra. */
  pendingCount: number;
  /** Si hay un turno en curso: el resumen se apaga mientras tanto. */
  busy: boolean;
  onOrbPress: () => void;
};

/** Entrega lo que dibuja la zona de voz: el turno en curso, ya traducido a orbe, textos y tarjetas. */
export function useVoiceStage(options: VoiceTurnOptions): VoiceStageView {
  const { clock } = useDependencies();
  const { state, level, actions, onOrbPress } = useVoiceTurn(options);
  const { phase, card, turn, subtitle } = state;
  const counting = phase === VoicePhase.Proposing;
  const context = {
    actions,
    today: clock.today(),
    countdown: counting ? { durationMs: settings.confirmMs, paused: false } : undefined,
  };

  return {
    orbState: ORB_STATE[phase],
    level,
    statusText: STATUS_TEXT[phase],
    subtitle: phase === VoicePhase.Idle && subtitle === '' ? IDLE_SUBTITLE : subtitle,
    cards: card === null ? [] : [{ ...cardView(card, context), key: `${card.kind}-${turn}` }],
    pendingCount: 0,
    busy: phase !== VoicePhase.Idle,
    onOrbPress,
  };
}
