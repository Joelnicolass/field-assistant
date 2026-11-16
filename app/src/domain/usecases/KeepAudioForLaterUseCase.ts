import type { DateText } from '@/domain/entities/DateText';
import type { PendingAudio } from '@/domain/entities/PendingAudio';
import type { RecordedAudio } from '@/domain/entities/RecordedAudio';

export type KeepAudioForLaterUseCaseInput = { audio: RecordedAudio; recordedOn: DateText };

/** Guarda un audio que no se pudo entender en la cola, para reintentarlo después. */
export interface KeepAudioForLaterUseCase {
  execute(input: KeepAudioForLaterUseCaseInput): Promise<PendingAudio>;
}
