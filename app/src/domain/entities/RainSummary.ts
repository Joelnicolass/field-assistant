import type { DateText } from '@/domain/entities/DateText';
import type { RainRange } from '@/domain/enums/RainRange';

export type RainSummary = {
  range: RainRange;
  total: number;
  days: { date: DateText; millimeters: number }[];
};
