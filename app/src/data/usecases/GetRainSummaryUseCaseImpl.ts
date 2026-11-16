import { periodOf, rainDays, totalOf } from '@/data/usecases/rules/rainTotals';
import type { RainSummary } from '@/domain/entities/RainSummary';
import type { FarmRepository } from '@/domain/repositories/FarmRepository';
import type {
  GetRainSummaryUseCase,
  GetRainSummaryUseCaseInput,
} from '@/domain/usecases/GetRainSummaryUseCase';

export class GetRainSummaryUseCaseImpl implements GetRainSummaryUseCase {
  constructor(private readonly farm: FarmRepository) {}

  async execute({ range, today }: GetRainSummaryUseCaseInput): Promise<RainSummary> {
    const { rains } = await this.farm.load();
    const days = rainDays(rains, periodOf(range, today));
    return { range, total: totalOf(days), days };
  }
}
