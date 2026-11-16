import { useRef, type Dispatch } from 'react';

import { useDependencies } from '@/di/useDependencies';
import type { ProposalCard } from '../states/VoiceCard';
import type { VoiceAction } from '../states/voiceReducer';
import type { VoiceState } from '../states/VoiceState';
import { cancelProposal, confirmProposal } from './proposalActions';
import { useCountdown } from './useCountdown';

type ProposalInput = {
  state: VoiceState;
  dispatch: Dispatch<VoiceAction>;
  fail: (error?: unknown) => void;
  silence: () => void;
  /** Se llama después de anotar algo en el campo. */
  onRecorded: () => void;
  discard: (id: number) => Promise<void>;
};

/** La propuesta en pantalla: anotarla, cancelarla y su cuenta. `confirm` es lo único que escribe. */
export function useProposal(input: ProposalInput) {
  const services = useDependencies();
  const writing = useRef(false);
  const context = { ...input, services, writing };

  const confirm = (card: ProposalCard) => confirmProposal(card, context);
  useCountdown(input.state, confirm);

  return {
    confirm,
    cancel: () => cancelProposal(context),
    isWriting: () => writing.current,
  };
}
