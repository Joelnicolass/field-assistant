import type { AnimalCategory } from '@/domain/enums/AnimalCategory';
import type { FarmErrorCode } from '@/domain/errors/FarmErrorCode';

export type Failure =
  | { code: FarmErrorCode.LotNotFound; lot: number }
  | { code: FarmErrorCode.SameLot; lot: number }
  | { code: FarmErrorCode.InvalidQuantity }
  | {
      code: FarmErrorCode.NotEnoughAnimals;
      lot: number;
      category: AnimalCategory;
      available: number;
      requested: number;
    }
  | { code: FarmErrorCode.InvalidMillimeters }
  | { code: FarmErrorCode.FutureDate }
  | { code: FarmErrorCode.NothingToCorrect };
