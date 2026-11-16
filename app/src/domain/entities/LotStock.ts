import type { AnimalCategory } from '@/domain/enums/AnimalCategory';

export type LotStock = { lot: number; total: number; byCategory: Record<AnimalCategory, number> };
