import type { DateText } from '@/domain/entities/DateText';
import type { TodaySummary } from '@/domain/entities/TodaySummary';

export type GetTodaySummaryUseCaseInput = { today: DateText };

/** Arma el resumen de la pantalla de inicio: cabezas, lluvia del mes, última lluvia, lotes y lo anotado hoy. */
export interface GetTodaySummaryUseCase {
  execute(input: GetTodaySummaryUseCaseInput): Promise<TodaySummary>;
}
