import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { settings } from '@/core/configs/settings';
import { useDependencies } from '@/di/useDependencies';
import type { ConversationTurn } from '@/domain/entities/ConversationTurn';
import { VoicePhase } from '../states/VoicePhase';
import { trySend, type QueueSending, type QueueSnapshot } from './sendQueue';

type QueueRetryInput = QueueSnapshot & {
  history: ConversationTurn[];
  onFound: QueueSending['onFound'];
};

// Pide reintentar cada `retryQueueMs` y cada vez que la app vuelve a estar a la vista.
function retryWhenDue(retry: () => void): () => void {
  const timer = setInterval(retry, settings.retryQueueMs);
  const subscription = AppState.addEventListener('change', (status) => {
    if (status === 'active') {
      retry();
    }
  });
  return () => {
    clearInterval(timer);
    subscription.remove();
  };
}

/**
 * Cuándo reintentar la cola: al abrir, cada `retryQueueMs`, al volver a la app y cuando termina un
 * turno que salió bien (el server respondió, y eso suma un turno al historial). Los manda de a uno
 * y no molesta mientras hay un turno en curso. Devuelve si hay un envío en curso y cómo pedir un
 * reintento en el momento (al tocar la píldora).
 */
export function useQueueRetry({ history, onFound, ...snapshot }: QueueRetryInput) {
  const services = useDependencies();
  const [sending, setSending] = useState(false);
  // Cada toque de la píldora lo suma: el efecto de abajo reintenta al cambiar.
  const [asked, setAsked] = useState(0);
  const busy = useRef(false);
  const answeredHistory = useRef(history);
  const latest = useEffectEvent(() => snapshot);

  const retry = useEffectEvent(() =>
    trySend({ services, latest: () => latest(), onFound, busy, setSending }),
  );

  useEffect(() => retryWhenDue(() => void retry()), []);

  // Al abrir y cada vez que se pide en el momento.
  useEffect(() => {
    void retry();
  }, [asked]);

  useEffect(() => {
    if (snapshot.phase === VoicePhase.Idle && answeredHistory.current !== history) {
      answeredHistory.current = history;
      void retry();
    }
  }, [snapshot.phase, history]);

  return { sending, retryNow: () => setAsked((count) => count + 1) };
}
