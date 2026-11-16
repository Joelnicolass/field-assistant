import type { AnimalCategory } from '@/domain/enums/AnimalCategory';

export type Lot = { number: number; stock: Record<AnimalCategory, number> };
