import type { Lot } from '@/domain/entities/Lot';
import type { MovementProposal } from '@/domain/entities/MovementProposal';

export function moveAnimals(lots: readonly Lot[], movement: MovementProposal): Lot[] {
  const { quantity, category, fromLot, toLot } = movement;
  const change = (lot: Lot): number =>
    lot.number === fromLot ? -quantity : lot.number === toLot ? quantity : 0;
  return lots.map((lot) => ({
    ...lot,
    stock: { ...lot.stock, [category]: lot.stock[category] + change(lot) },
  }));
}

export function lotTotal(lot: Lot): number {
  return Object.values(lot.stock).reduce((sum, quantity) => sum + quantity, 0);
}
