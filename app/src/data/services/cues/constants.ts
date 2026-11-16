import type { AudioSource } from 'expo-audio';

import { CueKind } from '@/domain/enums/CueKind';

export type Cue = { text: string; source: AudioSource };

// Las grabó `npm run cues` en server/ con la voz de la app; los textos son los mismos que ahí.
export const CUES: Record<CueKind, Cue[]> = {
  [CueKind.Thinking]: [
    { text: 'Dame un segundo.', source: require('../../../../assets/cues/thinking-1.mp3') },
    { text: 'A ver.', source: require('../../../../assets/cues/thinking-2.mp3') },
    { text: 'Ya te digo.', source: require('../../../../assets/cues/thinking-3.mp3') },
    { text: 'Dejame ver.', source: require('../../../../assets/cues/thinking-4.mp3') },
    { text: 'Un momento.', source: require('../../../../assets/cues/thinking-5.mp3') },
  ],
  [CueKind.Offline]: [
    {
      text: 'No tengo señal. Lo guardé y lo anoto cuando vuelva.',
      source: require('../../../../assets/cues/offline-1.mp3'),
    },
    {
      text: 'Sin señal por ahora. Te lo guardo.',
      source: require('../../../../assets/cues/offline-2.mp3'),
    },
  ],
};
