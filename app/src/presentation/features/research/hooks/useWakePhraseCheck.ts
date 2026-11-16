import { useEffect, useEffectEvent, useState } from 'react';
import { loadModel, onError, onResult, start, stop } from 'react-native-vosk';

import type { CheckView } from '../components/CheckCard';
import { COMMON_WORDS, TEXT, VOSK_MODEL, VOSK_UNKNOWN, WAKE_PHRASES } from './constants';

type Listening = { phrase: string; grammar: readonly string[]; label: string };

function listeningModes(): readonly Listening[] {
  return WAKE_PHRASES.flatMap((phrase) => [
    { phrase, grammar: [phrase], label: `${TEXT.onlyPhrase}: ${phrase}` },
    {
      phrase,
      grammar: [phrase, ...COMMON_WORDS, VOSK_UNKNOWN],
      label: `${TEXT.phraseAndWords}: ${phrase}`,
    },
  ]);
}

/** I5: carga Vosk y cuenta cuántas veces oye la frase de manos libres. */
export function useWakePhraseCheck(): CheckView {
  const [loadMs, setLoadMs] = useState<number | null>(null);
  const [listening, setListening] = useState<Listening | null>(null);
  const [hits, setHits] = useState(0);
  const [lastHeard, setLastHeard] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResult = useEffectEvent((text: string) => {
    setLastHeard(text);
    if (listening !== null && text.includes(listening.phrase)) {
      setHits((previous) => previous + 1);
    }
  });

  useEffect(() => {
    const subscriptions = [
      onResult(handleResult),
      onError((cause: unknown) => setError(String(cause))),
    ];
    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, []);

  async function load() {
    const startedAt = Date.now();
    await loadModel(VOSK_MODEL);
    setLoadMs(Date.now() - startedAt);
  }

  async function listen(mode: Listening) {
    stop();
    setHits(0);
    setLastHeard(null);
    setError(null);
    await start({ grammar: [...mode.grammar] });
    setListening(mode);
  }

  function stopListening() {
    stop();
    setListening(null);
  }

  return {
    actions: [
      { key: 'load', label: TEXT.loadModel, onPress: load },
      ...listeningModes().map((mode) => ({
        key: mode.label,
        label: mode.label,
        onPress: () => listen(mode),
      })),
      { key: 'stop', label: TEXT.stopListening, onPress: stopListening },
    ],
    lines: [
      `${TEXT.modelLoaded}: ${loadMs === null ? TEXT.none : `${loadMs} ${TEXT.milliseconds}`}`,
      `${TEXT.listeningTo}: ${listening?.label ?? TEXT.none}`,
      `${TEXT.hits}: ${hits}`,
      `${TEXT.lastHeard}: ${lastHeard ?? TEXT.none}`,
      `${TEXT.error}: ${error ?? TEXT.none}`,
    ],
  };
}
