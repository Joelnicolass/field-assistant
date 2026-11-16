import { useEffect, useEffectEvent } from 'react';

import { settings } from '@/core/configs/settings';
import { VoiceCardKind, type ProposalCard } from '../states/VoiceCard';
import { VoicePhase } from '../states/VoicePhase';
import type { VoiceState } from '../states/VoiceState';

/** La cuenta de la propuesta en pantalla: al terminar `confirmMs`, la anota sola; en pausa, espera un toque. */
export function useCountdown(
  { phase, turn, card, paused }: VoiceState,
  confirm: (card: ProposalCard) => void,
) {
  const confirmCounted = useEffectEvent(confirm);

  useEffect(() => {
    if (paused || phase !== VoicePhase.Proposing || card?.kind !== VoiceCardKind.Proposal) {
      return;
    }
    const timer = setTimeout(() => confirmCounted(card), settings.confirmMs);
    return () => clearTimeout(timer);
  }, [phase, turn, card, paused]);
}
