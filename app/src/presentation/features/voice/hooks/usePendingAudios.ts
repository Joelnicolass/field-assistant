import { useState } from 'react';

import { useDependencies } from '@/di/useDependencies';
import type { ResolvedAudio } from '@/domain/entities/ResolvedAudio';
import type { VoiceCard } from '../states/VoiceCard';
import type { VoiceState } from '../states/VoiceState';
import { CARD_TEXT } from './constants';
import { savedCard } from './replies/savedCard';
import { useQueueRetry } from './useQueueRetry';

type Queue = { waiting: number; resolved: ResolvedAudio[] };

/** La tarjeta del audio guardado que se muestra, y qué agregarle al título: su lugar en la cola. */
export type SavedEntry = { key: string; card: VoiceCard; labelSuffix: string };

// Siguen en el orden en que se grabaron: los ids suben con cada grabación.
function withFound(queue: Queue, found: Queue): Queue {
  const resolved = [...queue.resolved, ...found.resolved];
  return { waiting: found.waiting, resolved: resolved.sort((a, b) => a.pending.id - b.pending.id) };
}

function without(queue: Queue, id: number): Queue {
  return { ...queue, resolved: queue.resolved.filter(({ pending }) => pending.id !== id) };
}

// Una sola a la vez: la más vieja. Al anotarla o descartarla aparece la siguiente.
function oldestEntry(resolved: ResolvedAudio[]): SavedEntry[] {
  const [first] = resolved;
  if (first === undefined) {
    return [];
  }
  return [
    {
      key: `saved-${first.pending.id}`,
      card: savedCard(first.pending, first.resolution),
      labelSuffix: CARD_TEXT.savedPosition(resolved.length),
    },
  ];
}

/**
 * La cola de audios guardados sin señal. Los que se entienden quedan en memoria hasta que la
 * persona los anota o los descarta; nada se anota solo. `pendingCount` son los que esperan señal.
 */
export function usePendingAudios({ phase, lastRecord, history }: VoiceState) {
  const { discardPendingAudio } = useDependencies();
  const [queue, setQueue] = useState<Queue>({ waiting: 0, resolved: [] });

  const sending = useQueueRetry({
    phase,
    history,
    lastRecord,
    resolved: queue.resolved,
    onFound: (found) => setQueue((current) => withFound(current, found)),
  });

  async function discard(id: number) {
    await discardPendingAudio.execute({ id });
    setQueue((current) => without(current, id));
  }

  return {
    pendingCount: queue.waiting,
    sending,
    saved: oldestEntry(queue.resolved),
    discard,
  };
}
