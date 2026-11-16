import type { DateText } from '@/domain/entities/DateText';
import type { PendingAudio } from '@/domain/entities/PendingAudio';
import type { RecordedAudio } from '@/domain/entities/RecordedAudio';

export interface PendingAudioRepository {
  list(): Promise<PendingAudio[]>;
  add(audio: RecordedAudio, recordedOn: DateText): Promise<PendingAudio>;
  remove(id: number): Promise<void>;
}
