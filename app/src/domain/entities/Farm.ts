import type { AnimalMovement } from '@/domain/entities/AnimalMovement';
import type { Lot } from '@/domain/entities/Lot';
import type { RainRecord } from '@/domain/entities/RainRecord';

export type Farm = {
  name: string;
  activity: string;
  location: string;
  lots: Lot[];
  rains: RainRecord[];
  movements: AnimalMovement[];
};
