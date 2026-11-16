import type { DateText } from '@/domain/entities/DateText';
import type { AnimalCategory } from '@/domain/enums/AnimalCategory';

export type MovementProposal = {
  quantity: number;
  category: AnimalCategory;
  fromLot: number;
  toLot: number;
  date: DateText;
};
