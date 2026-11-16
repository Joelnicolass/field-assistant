import { useEffect, useEffectEvent } from 'react';

import { settings } from '@/core/configs/settings';
import { VoiceCardKind, type ProposalCard } from '../states/VoiceCard';
import { VoicePhase } from '../states/VoicePhase';
import type { VoiceState } from '../states/VoiceState';

/** La cuenta de la propuesta en pantalla: al terminar `confirmMs`, la anota sola. */
export function useCountdown(
  { phase, turn, card }: VoiceState,
  confirm: (card: ProposalCard) => void,
) {
  const confirmCounted = useEffectEvent(confirm);

  useEffect(() => {
    if (phase !== VoicePhase.Proposing || card?.kind !== VoiceCardKind.Proposal) {
      return;
    }
    const timer = setTimeout(() => confirmCounted(card), settings.confirmMs);
    return () => clearTimeout(timer);
  }, [phase, turn, card]);
}
