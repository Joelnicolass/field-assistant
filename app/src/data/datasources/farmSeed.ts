import { addDays } from '@/data/usecases/rules/dates';
import type { Farm } from '@/domain/entities/Farm';
import type { Lot } from '@/domain/entities/Lot';
import type { DateText } from '@/domain/entities/DateText';
import { AnimalCategory } from '@/domain/enums/AnimalCategory';

type StockRow = [cows: number, heifers: number, calves: number, steers: number, bulls: number];

const LOT_STOCK: readonly StockRow[] = [
  [40, 0, 22, 0, 4],
  [50, 0, 45, 0, 0],
  [0, 45, 0, 12, 0],
  [70, 0, 0, 0, 4],
  [40, 0, 25, 0, 0],
  [0, 0, 0, 43, 0],
  [30, 18, 0, 0, 2],
  [0, 0, 0, 0, 0],
];

const RAINS: readonly { daysAgo: number; millimeters: number }[] = [
  { daysAgo: 3, millimeters: 12 },
  { daysAgo: 9, millimeters: 6 },
  { daysAgo: 14, millimeters: 20 },
  { daysAgo: 21, millimeters: 8 },
  { daysAgo: 27, millimeters: 15 },
  { daysAgo: 33, millimeters: 4 },
  { daysAgo: 38, millimeters: 22 },
  { daysAgo: 44, millimeters: 10 },
  { daysAgo: 51, millimeters: 7 },
  { daysAgo: 58, millimeters: 18 },
];

function toLot([cows, heifers, calves, steers, bulls]: StockRow, index: number): Lot {
  return {
    number: index + 1,
    stock: {
      [AnimalCategory.Cow]: cows,
      [AnimalCategory.Heifer]: heifers,
      [AnimalCategory.Calf]: calves,
      [AnimalCategory.Steer]: steers,
      [AnimalCategory.Bull]: bulls,
    },
  };
}

export function farmSeed(today: DateText): Farm {
  return {
    name: 'La Tranquera',
    activity: 'Cría',
    location: 'Castelli, Buenos Aires',
    lots: LOT_STOCK.map(toLot),
    rains: RAINS.map((rain, index) => {
      const date = addDays(today, -rain.daysAgo);
      return { id: index + 1, date, notedOn: date, millimeters: rain.millimeters };
    }),
    movements: [],
  };
}
