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
  fail: (error?: unknown) => void;
  takeRecording: () => Promise<RecordedAudio>;
};

/**
 * En la fase Pensando, entiende el audio grabado. Si el turno se cancela mientras tanto, la
 * respuesta que llegue tarde se ignora. Deja en el registro lo que tarda el turno, del fin de la
 * escucha a la tarjeta: se filtra por "[latencia]".
 */
export function useUnderstanding({ state, dispatch, fail, takeRecording }: UnderstandingInput) {
  const services = useDependencies();
  const reportFailure = useEffectEvent(fail);
  const understand = useEffectEvent(async (isCurrent: () => boolean) => {
    const startedAt = Date.now();
    const turn = { audio: await takeRecording(), context: state, isCurrent };
    const action = await understandAudio(turn, services);
    console.log(`[latencia] ${Date.now() - startedAt} ms`);
    return action;
  });

  useEffect(() => {
    if (state.phase !== VoicePhase.Thinking) {
      return;
    }
    let current = true;
    understand(() => current).then(
      (action) => current && dispatch(action),
      (error: unknown) => current && reportFailure(error),
    );
    return () => {
      current = false;
    };
  }, [state.phase, state.turn, dispatch]);
}
