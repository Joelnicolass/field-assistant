import { fail, ok } from '@/data/usecases/rules/results';
import { lotTotal } from '@/data/usecases/rules/stockChanges';
import type { LotStock } from '@/domain/entities/LotStock';
import { FarmErrorCode } from '@/domain/errors/FarmErrorCode';
import type { Result } from '@/domain/errors/Result';
import type { FarmRepository } from '@/domain/repositories/FarmRepository';
import type {
  GetLotStockUseCase,
  GetLotStockUseCaseInput,
} from '@/domain/usecases/GetLotStockUseCase';

export class GetLotStockUseCaseImpl implements GetLotStockUseCase {
  constructor(private readonly farm: FarmRepository) {}

  async execute({ lot }: GetLotStockUseCaseInput): Promise<Result<LotStock>> {
    const found = (await this.farm.load()).lots.find((item) => item.number === lot);
    if (found === undefined) {
      return fail({ code: FarmErrorCode.LotNotFound, lot });
    }
    return ok({ lot, total: lotTotal(found), byCategory: found.stock });
  }
}
