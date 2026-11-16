import type { DateText } from '@/domain/entities/DateText';
import type { RainSummary } from '@/domain/entities/RainSummary';
import type { RainRange } from '@/domain/enums/RainRange';

export type GetRainSummaryUseCaseInput = { range: RainRange; today: DateText };

export interface GetRainSummaryUseCase {
  execute(input: GetRainSummaryUseCaseInput): Promise<RainSummary>;
}
