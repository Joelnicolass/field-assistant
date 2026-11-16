import type { LotStock } from '@/domain/entities/LotStock';
import type { Result } from '@/domain/errors/Result';

export type GetLotStockUseCaseInput = { lot: number };

/** Devuelve los animales de un lote: el total y cada categoría. */
export interface GetLotStockUseCase {
  execute(input: GetLotStockUseCaseInput): Promise<Result<LotStock>>;
}
