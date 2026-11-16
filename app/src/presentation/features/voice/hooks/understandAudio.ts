import type { useDependencies } from '@/di/useDependencies';
import type { ConversationTurn } from '@/domain/entities/ConversationTurn';
import type { LastRecord } from '@/domain/entities/LastRecord';
import type { RecordedAudio } from '@/domain/entities/RecordedAudio';
import { VoiceEvent } from '../states/VoiceEvent';
import type { VoiceAction } from '../states/voiceReducer';
import { spokenReply } from './replies/spokenReply';

type Services = Pick<
  ReturnType<typeof useDependencies>,
  'clock' | 'interpreter' | 'resolveRequest' | 'keepAudioForLater'
>;

type HeardTurn = {
  audio: RecordedAudio;
  history: ConversationTurn[];
  lastRecord: LastRecord | null;
  /** Falso si la persona canceló el turno mientras se esperaba al server. */
  isCurrent: () => boolean;
};

/** Sube el audio con el historial y resuelve lo que se entendió; devuelve el evento del turno. */
export async function understandAudio(turn: HeardTurn, services: Services): Promise<VoiceAction> {
  const { audio, history, lastRecord, isCurrent } = turn;
  if (!audio.heardVoice) {
    return { type: VoiceEvent.NothingHeard };
  }
  const today = services.clock.today();
  const heard = await services.interpreter.interpret({ audio, history, referenceDay: today });
  if (!heard.ok) {
    if (isCurrent()) {
      await services.keepAudioForLater.execute({ audio, recordedOn: today });
    }
    return { type: VoiceEvent.UnderstandingFailed };
  }
  const interpretation = heard.value;
  const request = { interpretation, referenceDay: today, today, lastRecord };
  const resolution = await services.resolveRequest.execute(request);
  const spoken = spokenReply(resolution, today);
  return { type: VoiceEvent.Understood, resolution, transcript: interpretation.transcript, spoken };
}
