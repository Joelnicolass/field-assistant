import { daysBetween } from '@/data/usecases/rules/dates';
import { monthTotal, rainDays } from '@/data/usecases/rules/rainTotals';
import { lotTotal } from '@/data/usecases/rules/stockChanges';
import type { TodaySummary } from '@/domain/entities/TodaySummary';
import type { FarmRepository } from '@/domain/repositories/FarmRepository';
import type {
  GetTodaySummaryUseCase,
  GetTodaySummaryUseCaseInput,
} from '@/domain/usecases/GetTodaySummaryUseCase';

const ALL_TIME = { from: '0000-01-01' };

export class GetTodaySummaryUseCaseImpl implements GetTodaySummaryUseCase {
  constructor(private readonly farm: FarmRepository) {}

  async execute({ today }: GetTodaySummaryUseCaseInput): Promise<TodaySummary> {
    const farm = await this.farm.load();
    const lots = farm.lots.map((lot) => ({ number: lot.number, total: lotTotal(lot) }));
    const lastDay = rainDays(farm.rains, { ...ALL_TIME, to: today }).at(0);
    const notedToday = {
      rainMillimeters: farm.rains
        .filter((rain) => rain.notedOn === today)
        .reduce((sum, rain) => sum + rain.millimeters, 0),
      movedAnimals: farm.movements
        .filter((movement) => movement.notedOn === today)
        .reduce((sum, movement) => sum + movement.quantity, 0),
    };
    return {
      farmName: farm.name,
      activity: farm.activity,
      location: farm.location,
      totalHeads: lots.reduce((sum, lot) => sum + lot.total, 0),
      monthRain: monthTotal(farm.rains, today),
      lastRain:
        lastDay === undefined ? null : { ...lastDay, daysAgo: daysBetween(lastDay.date, today) },
      lots,
      notedToday,
    };
  }
}
