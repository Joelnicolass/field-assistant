import { useEffect, useEffectEvent, useState, type Dispatch } from 'react';

import { VoiceEvent } from '../states/VoiceEvent';
import { VoicePhase } from '../states/VoicePhase';
import type { VoiceAction } from '../states/voiceReducer';
import type { VoiceState } from '../states/VoiceState';

type SubtitleInput = {
  state: VoiceState;
  dispatch: Dispatch<VoiceAction>;
  say: (text: string, onStart?: () => void) => Promise<void>;
};

/**
 * En la fase Hablando dice el subtítulo y avisa cuando terminó. `voiceStarted` dice si la voz ya
 * empezó a sonar: hasta entonces la pantalla sigue pensando, así el texto aparece con la voz.
 */
export function useSpokenSubtitle({ state, dispatch, say }: SubtitleInput) {
  const [startedFor, setStartedFor] = useState<string | null>(null);
  const speechKey = `${state.turn}:${state.subtitle}`;

  const saySubtitle = useEffectEvent(() =>
    sayAndMark(say, state.subtitle, () => setStartedFor(speechKey)),
  );

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

  return { voiceStarted: startedFor === speechKey };
}

// Dice el texto y avisa cuando la voz empieza a sonar. Si ninguna voz llega a sonar, avisa igual al
// terminar, así el texto se muestra. Deja en el registro cuánto tardó en empezar.
function sayAndMark(say: SubtitleInput['say'], text: string, markStarted: () => void) {
  const startedAt = Date.now();
  const started = () => {
    console.log(`[voz] empezó en ${Date.now() - startedAt} ms`);
    markStarted();
  };
  return say(text, started).finally(markStarted);
}
