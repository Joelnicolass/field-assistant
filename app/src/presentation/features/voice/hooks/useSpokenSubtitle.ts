import { useEffect, useEffectEvent, useState, type Dispatch } from 'react';

import { CueKind } from '@/domain/enums/CueKind';
import { InterpreterErrorCode } from '@/domain/enums/InterpreterErrorCode';
import { VoiceCardKind } from '../states/VoiceCard';

import { VoiceEvent } from '../states/VoiceEvent';
import { VoicePhase } from '../states/VoicePhase';
import type { VoiceAction } from '../states/voiceReducer';
import type { VoiceState } from '../states/VoiceState';

type SubtitleInput = {
  state: VoiceState;
  dispatch: Dispatch<VoiceAction>;
  say: (text: string, onStart?: () => void) => Promise<void>;
  sayCue: (kind: CueKind, onStart?: (text: string) => void) => Promise<void>;
};

// Sin señal, el aviso de que el audio quedó guardado es una frase grabada: suena sin red.
const savedOffline = ({ card }: VoiceState) =>
  card?.kind === VoiceCardKind.AudioSaved && card.code === InterpreterErrorCode.Offline;

/**
 * En la fase Hablando dice el subtítulo y avisa cuando terminó. `voiceStarted` dice si la voz ya
 * empezó a sonar: hasta entonces la pantalla sigue pensando, así el texto aparece con la voz.
 */
export function useSpokenSubtitle({ state, dispatch, say, sayCue }: SubtitleInput) {
  const [startedFor, setStartedFor] = useState<string | null>(null);
  const [cue, setCue] = useState<{ key: string; text: string } | null>(null);
  const speechKey = `${state.turn}:${state.subtitle}`;

  // La frase grabada muestra su propio texto; si no se puede reproducir, lo dice la voz.
  const sayOffline = (text: string, onStart?: () => void) =>
    sayCue(CueKind.Offline, (cueText) => {
      setCue({ key: speechKey, text: cueText });
      onStart?.();
    }).catch(() => say(text, onStart));
  const saySubtitle = useEffectEvent(() =>
    sayAndMark(savedOffline(state) ? sayOffline : say, state.subtitle, () =>
      setStartedFor(speechKey),
    ),
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

  return {
    voiceStarted: startedFor === speechKey,
    /** El texto de la frase grabada que sonó en lugar del subtítulo, si sonó una. */
    cueText: cue?.key === speechKey ? cue.text : null,
  };
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
