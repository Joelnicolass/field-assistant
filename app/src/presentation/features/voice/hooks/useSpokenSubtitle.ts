import { useEffect, useEffectEvent, type Dispatch } from 'react';

import { VoiceEvent } from '../states/VoiceEvent';
import { VoicePhase } from '../states/VoicePhase';
import type { VoiceAction } from '../states/voiceReducer';
import type { VoiceState } from '../states/VoiceState';

type SubtitleInput = {
  state: VoiceState;
  dispatch: Dispatch<VoiceAction>;
  say: (text: string) => Promise<void>;
};

/** En la fase Hablando dice el subtítulo y avisa cuando terminó. */
export function useSpokenSubtitle({ state, dispatch, say }: SubtitleInput) {
  const saySubtitle = useEffectEvent(() => say(state.subtitle));

  useEffect(() => {
    if (state.phase !== VoicePhase.Speaking) {
      return;
    }
    let current = true;
    void saySubtitle().then(() => {
      if (current) {
        dispatch({ type: VoiceEvent.SpeechFinished });
      }
    });
    return () => {
      current = false;
    };
  }, [state.phase, dispatch]);
}
