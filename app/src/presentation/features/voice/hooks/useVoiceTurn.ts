import { useReducer } from 'react';

import { INITIAL_VOICE_STATE, voiceReducer } from '../states/voiceReducer';
import { useBackgroundSignal } from './useBackgroundSignal';
import { useCardActions } from './useCardActions';
import { useFailure } from './useFailure';
import { useHandsFree } from './useHandsFree';
import { useListening } from './useListening';
import { useOrbPress } from './useOrbPress';
import { usePendingAudios } from './usePendingAudios';
import { useProposal } from './useProposal';
import { useSpeech } from './useSpeech';
import { useUnderstanding } from './useUnderstanding';

export type VoiceTurnOptions = {
  /** Se llama después de anotar algo en el campo. */
  onRecorded: () => void;
};

/** Arma el turno de voz: el estado, el orbe, manos libres y qué hace cada botón de las tarjetas. */
export function useVoiceTurn({ onRecorded }: VoiceTurnOptions) {
  const [state, dispatch] = useReducer(voiceReducer, INITIAL_VOICE_STATE);
  const speech = useSpeech({ state, dispatch });
  const fail = useFailure(dispatch, speech);
  const listening = useListening({ state, dispatch, fail });
  useUnderstanding({ state, dispatch, fail, takeRecording: listening.takeRecording });
  const pending = usePendingAudios(state);
  const proposal = useProposal({ state, dispatch, fail, onRecorded, ...speech, ...pending });
  useBackgroundSignal(dispatch);
  const handsFree = useHandsFree({ phase: state.phase, dispatch, fail });
  const onOrbPress = useOrbPress({
    phase: state.phase,
    dispatch,
    silence: speech.silence,
    isWriting: proposal.isWriting,
    releaseMicrophone: handsFree.release,
    fail,
  });
  const actions = useCardActions({ dispatch, discard: pending.discard, ...proposal });
  return {
    state,
    level: listening.level,
    voiceStarted: speech.voiceStarted,
    actions,
    onOrbPress,
    pending,
    handsFree,
  };
}
