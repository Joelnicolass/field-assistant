import type { Interpretation } from '@/domain/entities/Interpretation';
import type { AnimalCategory } from '@/domain/enums/AnimalCategory';
import type { RainRange } from '@/domain/enums/RainRange';

/** Cada función devuelve los datos obligatorios de un pedido, o `null` si falta alguno. */
export function rainData({ millimeters }: Interpretation): { millimeters: number } | null {
  return millimeters === null ? null : { millimeters };
}

export function movementData({ quantity, category, fromLot, toLot }: Interpretation): {
  quantity: number;
  category: AnimalCategory;
  fromLot: number;
  toLot: number;
} | null {
  return quantity === null || category === null || fromLot === null || toLot === null
    ? null
    : { quantity, category, fromLot, toLot };
}

export function rainQueryData({ range }: Interpretation): { range: RainRange } | null {
  return range === null ? null : { range };
}

export function lotQueryData({ lot }: Interpretation): { lot: number } | null {
  return lot === null ? null : { lot };
}

export function correctionData({ quantity, millimeters }: Interpretation): {
  quantity: number;
} | null {
  const corrected = quantity ?? millimeters;
  return corrected === null ? null : { quantity: corrected };
}
