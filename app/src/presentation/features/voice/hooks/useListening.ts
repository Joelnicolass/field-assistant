import { useEffect, useEffectEvent, useRef, useState, type Dispatch } from 'react';

import { useDependencies } from '@/di/useDependencies';
import type { RecordedAudio } from '@/domain/entities/RecordedAudio';
import type { AudioRecorderService } from '@/domain/services/AudioRecorderService';
import { VoicePhase } from '../states/VoicePhase';
import type { VoiceAction } from '../states/voiceReducer';
import type { VoiceState } from '../states/VoiceState';
import { levelWatcher } from './levelWatcher';

type ListeningInput = {
  state: VoiceState;
  dispatch: Dispatch<VoiceAction>;
  fail: () => void;
};

const NO_AUDIO: RecordedAudio = { uri: '', mimeType: '', heardVoice: false };

type RecordingHandlers = {
  dispatch: Dispatch<VoiceAction>;
  onLevel: (level: number) => void;
  onFailure: () => void;
};

// Abre el micrófono y lleva la cuenta de la escucha. Devuelve cómo cerrarlo: espera a que haya
// terminado de abrir, por si se sale antes.
function startRecording(recorder: AudioRecorderService, handlers: RecordingHandlers) {
  let current = true;
  const watch = levelWatcher(handlers.dispatch);
  const started = recorder.start((level) => {
    if (current) {
      handlers.onLevel(level);
      watch(level);
    }
  });
  started.catch(() => (current ? handlers.onFailure() : undefined));
  return () => {
    current = false;
    return started.then(
      () => recorder.stop(),
      () => NO_AUDIO,
    );
  };
}

/** Abre el micrófono en la fase Escuchando y lo cierra al salir de ella. Entrega el volumen y el audio. */
export function useListening({ state, dispatch, fail }: ListeningInput) {
  const { recorder } = useDependencies();
  const [level, setLevel] = useState(0);
  const recording = useRef<Promise<RecordedAudio>>(Promise.resolve(NO_AUDIO));
  const reportFailure = useEffectEvent(fail);

  useEffect(() => {
    if (state.phase !== VoicePhase.Listening) {
      return;
    }
    const stop = startRecording(recorder, {
      dispatch,
      onLevel: setLevel,
      onFailure: reportFailure,
    });
    return () => {
      setLevel(0);
      recording.current = stop();
    };
  }, [state.phase, recorder, dispatch]);

  return { level, takeRecording: () => recording.current };
}
