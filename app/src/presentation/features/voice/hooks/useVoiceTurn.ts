import { useReducer } from 'react';

import { VoiceEvent } from '../states/VoiceEvent';
import { INITIAL_VOICE_STATE, voiceReducer } from '../states/voiceReducer';
import { SPOKEN } from './constants';
import { useCardActions } from './useCardActions';
import { useListening } from './useListening';
import { useOrbPress } from './useOrbPress';
import { useProposal } from './useProposal';
import { useSpeech } from './useSpeech';
import { useUnderstanding } from './useUnderstanding';

export type VoiceTurnOptions = {
  /** Se llama después de anotar algo en el campo. */
  onRecorded: () => void;
};

/** Arma el turno de voz: el estado, el orbe, y qué hace cada botón de las tarjetas. */
export function useVoiceTurn({ onRecorded }: VoiceTurnOptions) {
  const [state, dispatch] = useReducer(voiceReducer, INITIAL_VOICE_STATE);
  const speech = useSpeech({ state, dispatch });

  // Un error que nadie esperaba: vuelve a reposo y lo dice.
  function fail() {
    speech.silence();
    dispatch({ type: VoiceEvent.Failed });
    void speech.say(SPOKEN.unexpected);
  }

  const listening = useListening({ state, dispatch, fail });
  useUnderstanding({ state, dispatch, fail, takeRecording: listening.takeRecording });
  const proposal = useProposal({ state, dispatch, fail, silence: speech.silence, onRecorded });
  const onOrbPress = useOrbPress({
    phase: state.phase,
    dispatch,
    silence: speech.silence,
    isWriting: proposal.isWriting,
    fail,
  });
  const actions = useCardActions({ dispatch, ...proposal });

  return { state, level: listening.level, actions, onOrbPress };
}
