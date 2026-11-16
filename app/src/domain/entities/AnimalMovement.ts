import type { DateText } from '@/domain/entities/DateText';
import type { AnimalCategory } from '@/domain/enums/AnimalCategory';

export type AnimalMovement = {
  id: number;
  date: DateText;
  notedOn: DateText;
  quantity: number;
  category: AnimalCategory;
  fromLot: number;
  toLot: number;
};
