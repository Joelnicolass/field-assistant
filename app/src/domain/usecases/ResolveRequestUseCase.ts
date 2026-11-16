import type { DateText } from '@/domain/entities/DateText';
import type { Interpretation } from '@/domain/entities/Interpretation';
import type { LastRecord } from '@/domain/entities/LastRecord';
import type { Resolution } from '@/domain/entities/Resolution';

export type ResolveRequestUseCaseInput = {
  interpretation: Interpretation;
  referenceDay: DateText;
  today: DateText;
  lastRecord: LastRecord | null;
};

/** Decide qué hacer con lo entendido: proponer, contestar, preguntar un dato o rechazar. */
export interface ResolveRequestUseCase {
  execute(input: ResolveRequestUseCaseInput): Promise<Resolution>;
}
