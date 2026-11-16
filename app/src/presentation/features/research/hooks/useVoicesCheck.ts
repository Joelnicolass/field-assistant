import * as Speech from 'expo-speech';
import { useState } from 'react';

import type { CheckView } from '../components/CheckCard';
import { SPANISH_PREFIX, SPOKEN_SAMPLE, SPOKEN_SAMPLE_LANGUAGE, TEXT } from './constants';

/** I4: lista las voces del teléfono y prueba hablar con una en español. */
export function useVoicesCheck(): CheckView {
  const [voices, setVoices] = useState<readonly Speech.Voice[]>([]);
  const spanish = voices.filter((voice) => voice.language.startsWith(SPANISH_PREFIX));
  const firstSpanish = spanish.at(0);

  async function listVoices() {
    setVoices(await Speech.getAvailableVoicesAsync());
  }

  function speakByIdentifier() {
    if (firstSpanish !== undefined) {
      Speech.speak(SPOKEN_SAMPLE, { voice: firstSpanish.identifier });
    }
  }

  function speakByLanguage() {
    Speech.speak(SPOKEN_SAMPLE, { language: SPOKEN_SAMPLE_LANGUAGE });
  }

  return {
    actions: [
      { key: 'list', label: TEXT.listVoices, onPress: listVoices },
      { key: 'identifier', label: TEXT.speakByIdentifier, onPress: speakByIdentifier },
      { key: 'language', label: TEXT.speakByLanguage, onPress: speakByLanguage },
    ],
    lines: [
      `${TEXT.voicesTotal}: ${voices.length}`,
      `${TEXT.voicesSpanish}: ${spanish.length}`,
      ...spanish.map((voice) => `${voice.identifier} · ${voice.language} · ${voice.quality}`),
    ],
  };
}
