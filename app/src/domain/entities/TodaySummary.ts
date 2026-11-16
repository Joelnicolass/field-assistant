import type { DateText } from '@/domain/entities/DateText';

export type TodaySummary = {
  farmName: string;
  activity: string;
  location: string;
  totalHeads: number;
  monthRain: number;
  lastRain: { date: DateText; millimeters: number; daysAgo: number } | null;
  lots: { number: number; total: number }[];
  notedToday: { rainMillimeters: number; movedAnimals: number };
};
