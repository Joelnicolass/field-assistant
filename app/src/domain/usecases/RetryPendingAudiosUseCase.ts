import type { DateText } from '@/domain/entities/DateText';
import type { LastRecord } from '@/domain/entities/LastRecord';
import type { ResolvedAudio } from '@/domain/entities/ResolvedAudio';

export type RetryPendingAudiosUseCaseInput = {
  today: DateText;
  lastRecord: LastRecord | null;
  alreadyResolved: number[];
  /** Cuántos audios mandar como máximo en esta llamada; sin límite, todos. */
  limit?: number;
};

export type RetryPendingAudiosUseCaseOutput = { waiting: number; resolved: ResolvedAudio[] };

/** Reintenta, en orden, los audios guardados que todavía no se entendieron. */
export interface RetryPendingAudiosUseCase {
  execute(input: RetryPendingAudiosUseCaseInput): Promise<RetryPendingAudiosUseCaseOutput>;
}
