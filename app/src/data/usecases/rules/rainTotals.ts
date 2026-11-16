import { addDays, firstDayOfMonth } from '@/data/usecases/rules/dates';
import type { DateText } from '@/domain/entities/DateText';
import type { RainRecord } from '@/domain/entities/RainRecord';
import { RainRange } from '@/domain/enums/RainRange';

type RainDay = { date: DateText; millimeters: number };
type Period = { from: DateText; to: DateText };

const PERIODS: Record<RainRange, (today: DateText) => Period> = {
  [RainRange.Today]: (today) => ({ from: today, to: today }),
  [RainRange.Yesterday]: (today) => ({ from: addDays(today, -1), to: addDays(today, -1) }),
  [RainRange.Week]: (today) => ({ from: addDays(today, -6), to: today }),
  [RainRange.Month]: (today) => ({ from: firstDayOfMonth(today), to: today }),
};

export function periodOf(range: RainRange, today: DateText): Period {
  return PERIODS[range](today);
}

export function rainDays(rains: readonly RainRecord[], { from, to }: Period): RainDay[] {
  const byDay = rains
    .filter((rain) => rain.date >= from && rain.date <= to)
    .reduce<Record<DateText, number>>(
      (days, rain) => ({ ...days, [rain.date]: (days[rain.date] ?? 0) + rain.millimeters }),
      {},
    );
  return Object.entries(byDay)
    .map(([date, millimeters]) => ({ date, millimeters }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function totalOf(days: readonly RainDay[]): number {
  return days.reduce((sum, day) => sum + day.millimeters, 0);
}

export function monthTotal(rains: readonly RainRecord[], today: DateText): number {
  return totalOf(rainDays(rains, periodOf(RainRange.Month, today)));
}
