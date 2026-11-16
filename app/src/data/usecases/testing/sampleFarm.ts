import type { Farm } from '@/domain/entities/Farm';
import type { Lot } from '@/domain/entities/Lot';
import { AnimalCategory } from '@/domain/enums/AnimalCategory';

export const TODAY = '2026-11-16';

function lot(number: number, cows: number, heifers: number): Lot {
  return {
    number,
    stock: {
      [AnimalCategory.Cow]: cows,
      [AnimalCategory.Heifer]: heifers,
      [AnimalCategory.Calf]: 0,
      [AnimalCategory.Steer]: 0,
      [AnimalCategory.Bull]: 0,
    },
  };
}

export function sampleFarm(): Farm {
  return {
    name: 'Campo de prueba',
    activity: 'Cría',
    location: 'Castelli',
    lots: [lot(1, 10, 0), lot(2, 0, 0), lot(3, 0, 45), lot(4, 5, 0), lot(5, 20, 0)],
    rains: [
      { id: 1, date: '2026-11-14', notedOn: '2026-11-14', millimeters: 10 },
      { id: 2, date: '2026-11-14', notedOn: '2026-11-14', millimeters: 5 },
      { id: 3, date: '2026-11-03', notedOn: '2026-11-03', millimeters: 20 },
      { id: 4, date: '2026-10-28', notedOn: '2026-10-28', millimeters: 8 },
    ],
    movements: [],
  };
}
