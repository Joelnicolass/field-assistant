import { useEffect, useEffectEvent, useState, type Dispatch } from 'react';

import { settings } from '@/core/configs/settings';
import { useDependencies } from '@/di/useDependencies';
import { CueKind } from '@/domain/enums/CueKind';
import { VoicePhase } from '../states/VoicePhase';
import type { VoiceAction } from '../states/voiceReducer';
import type { VoiceState } from '../states/VoiceState';
import { createSoundQueue } from './soundQueue';
import { useSpokenSubtitle } from './useSpokenSubtitle';

type SpeechInput = { state: VoiceState; dispatch: Dispatch<VoiceAction> };

/**
 * Dice los textos y las frases grabadas de a uno, con tope de `maxSpeakingMs`, y los corta cuando
 * se pide. Al empezar a pensar suena una muletilla: lo que se diga después espera a que termine.
 */
export function useSpeech({ state, dispatch }: SpeechInput) {
  const { speaker, cues } = useDependencies();
  const [queue] = useState(() => createSoundQueue(settings.maxSpeakingMs));

  // Si la voz falla, el turno sigue igual: la persona lo lee en el subtítulo.
  const say = (text: string, onStart?: () => void) =>
    queue.enqueue({
      play: () => speaker.speak(text, onStart).catch(() => undefined),
      stop: () => speaker.stop(),
    });
  // Una frase grabada falla si no se puede reproducir: quien la pide decide qué hacer.
  const sayCue = (kind: CueKind, onStart?: (text: string) => void) =>
    queue.enqueue({
      play: () => cues.play(kind, onStart).then(() => undefined),
      stop: () => cues.stop(),
    });

  // Una muletilla por turno, cuando empieza a pensar. Si no se puede reproducir, no hay muletilla.
  const thinkingCue = useEffectEvent(() => sayCue(CueKind.Thinking).catch(() => undefined));
  useEffect(() => {
    if (state.phase === VoicePhase.Thinking) {
      void thinkingCue();
    }
  }, [state.phase, state.turn]);

  const spoken = useSpokenSubtitle({ state, dispatch, say, sayCue });
  return { say, silence: queue.silence, ...spoken };
}
