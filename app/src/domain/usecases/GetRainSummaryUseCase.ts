import type { DateText } from '@/domain/entities/DateText';
import type { RainSummary } from '@/domain/entities/RainSummary';
import type { RainRange } from '@/domain/enums/RainRange';

export type GetRainSummaryUseCaseInput = { range: RainRange; today: DateText };

/** Suma la lluvia de un período (hoy, ayer, la semana o el mes), con un renglón por día. */
export interface GetRainSummaryUseCase {
  execute(input: GetRainSummaryUseCaseInput): Promise<RainSummary>;
}
