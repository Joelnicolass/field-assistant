import { settings } from '@/core/configs/settings';
import { useDependencies } from '@/di/useDependencies';
import type { InfoCardProps } from '@/shared/presentation/components/InfoCard';
import type { OrbState } from '@/shared/presentation/components/Orb';
import { VoicePhase } from '../states/VoicePhase';
import { handsFreeStatus, IDLE_SUBTITLE, ORB_STATE, STATUS_TEXT } from './constants';
import type { VoiceCard } from '../states/VoiceCard';
import { cardView, type CardContext } from './replies/cardView';
import type { SavedEntry } from './usePendingAudios';
import { useVoiceTurn, type VoiceTurnOptions } from './useVoiceTurn';

export type VoiceStageView = {
  orbState: OrbState;
  level: number;
  statusText: string;
  subtitle: string;
  cards: (InfoCardProps & { key: string })[];
  /** Audios guardados que esperan señal; con 0 no se muestra. */
  pendingCount: number;
  /** Se está reintentando la cola: la píldora dice "Enviando…". */
  sending: boolean;
  /** Al tocar la píldora: reintenta la cola en el momento. */
  onPendingPress: () => void;
  /** Si hay un turno en curso: el resumen se apaga mientras tanto. */
  busy: boolean;
  onOrbPress: () => void;
  /** El interruptor de manos libres: apagado al abrir la app. */
  handsFree: boolean;
  onHandsFreeChange: (value: boolean) => void;
};

/** Entrega lo que dibuja la zona de voz: el turno en curso, ya traducido a orbe, textos y tarjetas. */
export function useVoiceStage(options: VoiceTurnOptions): VoiceStageView {
  const { clock } = useDependencies();
  const { state, level, voiceStarted, actions, onOrbPress, pending, handsFree } =
    useVoiceTurn(options);
  const { card, turn, subtitle, paused } = state;
  // Hasta que la voz suena, se sigue viendo "Pensando…": el texto y la tarjeta llegan con la voz.
  const waitingVoice = state.phase === VoicePhase.Speaking && !voiceStarted;
  const phase = waitingVoice ? VoicePhase.Thinking : state.phase;
  const counting = phase === VoicePhase.Proposing;
  const context = {
    actions,
    today: clock.today(),
    countdown: counting ? { durationMs: settings.confirmMs, paused } : undefined,
  };

  return {
    orbState: ORB_STATE[phase],
    level,
    statusText: statusText(phase, handsFree.enabled),
    subtitle: waitingVoice ? '' : visibleSubtitle(phase, subtitle),
    cards: stageCards(waitingVoice ? null : card, turn, pending.saved, context),
    pendingCount: pending.pendingCount,
    sending: pending.sending,
    onPendingPress: pending.retryNow,
    busy: state.phase !== VoicePhase.Idle,
    onOrbPress,
    handsFree: handsFree.enabled,
    onHandsFreeChange: handsFree.onChange,
  };
}

// En reposo con manos libres, el orbe no cambia: el texto dice que la app espera la frase.
function statusText(phase: VoicePhase, handsFree: boolean): string {
  return phase === VoicePhase.Idle && handsFree
    ? handsFreeStatus(settings.wakePhrase)
    : STATUS_TEXT[phase];
}

function visibleSubtitle(phase: VoicePhase, subtitle: string): string {
  return phase === VoicePhase.Idle && subtitle === '' ? IDLE_SUBTITLE : subtitle;
}

// La más nueva va abajo, junto al orbe (V2): primero el audio guardado y al final la del turno.
function stageCards(
  card: VoiceCard | null,
  turn: number,
  saved: SavedEntry[],
  context: CardContext,
): VoiceStageView['cards'] {
  const current: SavedEntry[] =
    card === null ? [] : [{ key: `${card.kind}-${turn}`, card, labelSuffix: '' }];
  return [...saved, ...current].map(({ key, card: shown, labelSuffix }) => {
    const view = cardView(shown, context);
    return { ...view, label: view.label + labelSuffix, key };
  });
}
