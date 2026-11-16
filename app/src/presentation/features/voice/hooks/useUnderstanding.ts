import { useEffect, useEffectEvent, type Dispatch } from 'react';

import { useDependencies } from '@/di/useDependencies';
import type { RecordedAudio } from '@/domain/entities/RecordedAudio';
import { VoicePhase } from '../states/VoicePhase';
import type { VoiceAction } from '../states/voiceReducer';
import type { VoiceState } from '../states/VoiceState';
import { understandAudio } from './understandAudio';

type UnderstandingInput = {
  state: VoiceState;
  dispatch: Dispatch<VoiceAction>;
  fail: () => void;
  takeRecording: () => Promise<RecordedAudio>;
};

/**
 * En la fase Pensando, entiende el audio grabado. Si el turno se cancela mientras tanto, la
 * respuesta que llegue tarde se ignora.
 */
export function useUnderstanding({ state, dispatch, fail, takeRecording }: UnderstandingInput) {
  const services = useDependencies();
  const reportFailure = useEffectEvent(fail);
  const understand = useEffectEvent(async (isCurrent: () => boolean) => {
    const { history, lastRecord } = state;
    return understandAudio(
      { audio: await takeRecording(), history, lastRecord, isCurrent },
      services,
    );
  });

  useEffect(() => {
    if (state.phase !== VoicePhase.Thinking) {
      return;
    }
    let current = true;
    understand(() => current).then(
      (action) => current && dispatch(action),
      () => current && reportFailure(),
    );
    return () => {
      current = false;
    };
  }, [state.phase, state.turn, dispatch]);
}
