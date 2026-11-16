import type { Farm } from '@/domain/entities/Farm';
import type { MovementProposal } from '@/domain/entities/MovementProposal';
import type { DateText } from '@/domain/entities/DateText';
import { FarmErrorCode } from '@/domain/errors/FarmErrorCode';
import type { Failure } from '@/domain/errors/Failure';

export function movementFailure(
  farm: Farm,
  movement: MovementProposal,
  today: DateText,
): Failure | null {
  const { quantity, category, fromLot, toLot, date } = movement;
  const origin = farm.lots.find((lot) => lot.number === fromLot);
  const destination = farm.lots.find((lot) => lot.number === toLot);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { code: FarmErrorCode.InvalidQuantity };
  }
  if (origin === undefined) {
    return { code: FarmErrorCode.LotNotFound, lot: fromLot };
  }
  if (destination === undefined) {
    return { code: FarmErrorCode.LotNotFound, lot: toLot };
  }
  if (fromLot === toLot) {
    return { code: FarmErrorCode.SameLot, lot: fromLot };
  }
  if (date > today) {
    return { code: FarmErrorCode.FutureDate };
  }
  const available = origin.stock[category];
  if (available < quantity) {
    return {
      code: FarmErrorCode.NotEnoughAnimals,
      lot: fromLot,
      category,
      available,
      requested: quantity,
    };
  }
  return null;
}
