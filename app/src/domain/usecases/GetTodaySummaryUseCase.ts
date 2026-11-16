import type { DateText } from '@/domain/entities/DateText';
import type { TodaySummary } from '@/domain/entities/TodaySummary';

export type GetTodaySummaryUseCaseInput = { today: DateText };

export interface GetTodaySummaryUseCase {
  execute(input: GetTodaySummaryUseCaseInput): Promise<TodaySummary>;
}
