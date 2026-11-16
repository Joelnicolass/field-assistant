import { useState, type Dispatch } from 'react';

import { settings } from '@/core/configs/settings';
import { useDependencies } from '@/di/useDependencies';
import type { VoiceAction } from '../states/voiceReducer';
import type { VoiceState } from '../states/VoiceState';
import { createSoundQueue } from './soundQueue';
import { useSpokenSubtitle } from './useSpokenSubtitle';

type SpeechInput = { state: VoiceState; dispatch: Dispatch<VoiceAction> };

/** Dice los textos de a uno, con tope de `maxSpeakingMs`, y los corta cuando se pide. */
export function useSpeech({ state, dispatch }: SpeechInput) {
  const { speaker } = useDependencies();
  const [queue] = useState(() => createSoundQueue(settings.maxSpeakingMs));

  // Si la voz falla, el turno sigue igual: la persona lo lee en el subtítulo.
  const say = (text: string, onStart?: () => void) =>
    queue.enqueue({
      play: () => speaker.speak(text, onStart).catch(() => undefined),
      stop: () => speaker.stop(),
    });

  const { voiceStarted } = useSpokenSubtitle({ state, dispatch, say });
  return { say, silence: queue.silence, voiceStarted };
}
