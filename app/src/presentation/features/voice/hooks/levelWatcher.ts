import type { Dispatch } from 'react';

import { settings } from '@/core/configs/settings';
import { ListeningVerdict, listeningVerdict } from '../states/listeningVerdict';
import { VoiceEvent } from '../states/VoiceEvent';
import type { VoiceAction } from '../states/voiceReducer';

const VERDICT_ACTION: Partial<Record<ListeningVerdict, VoiceAction>> = {
  [ListeningVerdict.Finish]: { type: VoiceEvent.ListeningFinished },
  [ListeningVerdict.Cancel]: { type: VoiceEvent.NothingHeard },
};

/** Lleva la cuenta de la escucha: con cada volumen que llega, decide una sola vez cómo termina. */
export function levelWatcher(dispatch: Dispatch<VoiceAction>, speechLevel: number) {
  const startedAt = Date.now();
  let lastVoiceAt = startedAt;
  let heardVoice = false;
  let decided = false;
  return (level: number) => {
    const now = Date.now();
    if (level >= speechLevel) {
      heardVoice = true;
      lastVoiceAt = now;
    }
    const progress = { elapsedMs: now - startedAt, msSinceVoice: now - lastVoiceAt, heardVoice };
    const action = VERDICT_ACTION[listeningVerdict(progress, settings)];
    if (action !== undefined && !decided) {
      decided = true;
      dispatch(action);
    }
  };
}
