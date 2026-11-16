import type { RefObject } from 'react';

import type { useDependencies } from '@/di/useDependencies';
import type { LastRecord } from '@/domain/entities/LastRecord';
import type { ResolvedAudio } from '@/domain/entities/ResolvedAudio';
import { VoicePhase } from '../states/VoicePhase';

const SEND_GAP_MS = 3000;

/** Lo que cambia mientras se envía: se vuelve a leer antes de cada audio. */
export type QueueSnapshot = {
  phase: VoicePhase;
  lastRecord: LastRecord | null;
  /** Los audios que ya se entendieron: no se vuelven a enviar. */
  resolved: ResolvedAudio[];
};

export type QueueSending = {
  services: Pick<ReturnType<typeof useDependencies>, 'clock' | 'retryPendingAudios'>;
  latest: () => QueueSnapshot;
  onFound: (found: { waiting: number; resolved: ResolvedAudio[] }) => void;
  /** Verdadero mientras hay un envío en curso: no se empieza otro. */
  busy: RefObject<boolean>;
  setSending: (sending: boolean) => void;
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Sin un turno en curso: en reposo, o con una propuesta esperando. */
export const isQuiet = (phase: VoicePhase) =>
  phase === VoicePhase.Idle || phase === VoicePhase.Proposing;

/**
 * Manda los audios guardados de a uno, con una pausa entre uno y otro. Se detiene cuando no hay
 * más, cuando uno sigue sin poder enviarse o cuando empieza un turno.
 */
async function sendQueue({ services, latest, onFound }: QueueSending) {
  let known = latest().resolved.map(({ pending }) => pending.id);
  for (;;) {
    const found = await services.retryPendingAudios.execute({
      today: services.clock.today(),
      lastRecord: latest().lastRecord,
      alreadyResolved: known,
      limit: 1,
    });
    onFound(found);
    known = [...known, ...found.resolved.map(({ pending }) => pending.id)];
    if (found.resolved.length === 0 || found.waiting === 0 || !isQuiet(latest().phase)) {
      return;
    }
    await wait(SEND_GAP_MS);
  }
}

/** Empieza a enviar la cola, si no hay otro envío en curso ni un turno que atender. */
export async function trySend(sending: QueueSending) {
  const { busy, setSending, latest } = sending;
  if (busy.current || !isQuiet(latest().phase)) {
    return;
  }
  busy.current = true;
  setSending(true);
  await sendQueue(sending).finally(() => {
    busy.current = false;
    setSending(false);
  });
}
