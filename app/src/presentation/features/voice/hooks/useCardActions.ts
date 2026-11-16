import type { Dispatch } from 'react';
import { Linking } from 'react-native';

import { useDependencies } from '@/di/useDependencies';
import { VoiceEvent } from '../states/VoiceEvent';
import type { VoiceAction } from '../states/voiceReducer';
import type { ProposalCard } from '../states/VoiceCard';
import type { CardActions } from './replies/cardView';

type CardActionsInput = {
  dispatch: Dispatch<VoiceAction>;
  confirm: (card: ProposalCard) => Promise<void>;
  cancel: () => void;
};

/** Qué hace cada botón de las tarjetas. */
export function useCardActions({ dispatch, confirm, cancel }: CardActionsInput): CardActions {
  const { discardPendingAudio } = useDependencies();
  const close = () => dispatch({ type: VoiceEvent.CardClosed });

  return {
    confirm: (card) => void confirm(card),
    cancel,
    close,
    discard: (id) => {
      void discardPendingAudio.execute({ id });
      close();
    },
    openSettings: () => void Linking.openSettings(),
  };
}
