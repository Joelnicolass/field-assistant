import { useEffect, useEffectEvent, useRef } from 'react';

import { useDependencies } from '@/di/useDependencies';
import type { WakePhraseService } from '@/domain/services/WakePhraseService';

type WakePhraseInput = {
  /** Mientras es verdadero, el detector espera la frase. */
  active: boolean;
  onDetected: () => void;
  onFailure: (error: unknown) => void;
};

// Arranca el detector y devuelve cómo frenarlo: espera a que haya terminado de arrancar, por si se
// frena antes, y frenarlo dos veces espera lo mismo.
function startDetector(wakePhrase: WakePhraseService, handlers: Omit<WakePhraseInput, 'active'>) {
  let current = true;
  const started = wakePhrase.start(() => (current ? handlers.onDetected() : undefined));
  started.catch((error: unknown) => (current ? handlers.onFailure(error) : undefined));
  let stopped: Promise<void> | null = null;
  return () => {
    current = false;
    stopped ??= started.then(
      () => wakePhrase.stop(),
      () => undefined,
    );
    return stopped;
  };
}

/**
 * Espera la frase de manos libres mientras `active` es verdadero. Devuelve cómo frenar el detector:
 * termina cuando soltó el micrófono, y si no está andando, enseguida.
 */
export function useWakePhrase({ active, onDetected, onFailure }: WakePhraseInput) {
  const { wakePhrase } = useDependencies();
  const release = useRef<() => Promise<void>>(() => Promise.resolve());
  const detected = useEffectEvent(onDetected);
  const failed = useEffectEvent(onFailure);

  useEffect(() => {
    if (!active) {
      return;
    }
    const stop = startDetector(wakePhrase, { onDetected: detected, onFailure: failed });
    release.current = stop;
    return () => void stop();
  }, [active, wakePhrase]);

  return () => release.current();
}
