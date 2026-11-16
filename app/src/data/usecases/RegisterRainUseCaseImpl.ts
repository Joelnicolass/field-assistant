import { nextId } from '@/data/usecases/rules/nextId';
import { monthTotal } from '@/data/usecases/rules/rainTotals';
import { rainFailure } from '@/data/usecases/rules/rainRules';
import { fail, ok } from '@/data/usecases/rules/results';
import type { RainReceipt } from '@/domain/entities/RainReceipt';
import { RecordKind } from '@/domain/enums/RecordKind';
import type { Result } from '@/domain/errors/Result';
import type { FarmRepository } from '@/domain/repositories/FarmRepository';
import type {
  RegisterRainUseCase,
  RegisterRainUseCaseInput,
} from '@/domain/usecases/RegisterRainUseCase';

export class RegisterRainUseCaseImpl implements RegisterRainUseCase {
  constructor(private readonly farm: FarmRepository) {}

  async execute({ proposal, today }: RegisterRainUseCaseInput): Promise<Result<RainReceipt>> {
    const failure = rainFailure({ ...proposal, today });
    if (failure !== null) {
      return fail(failure);
    }
    const farm = await this.farm.load();
    const record = { id: nextId(farm.rains), ...proposal, notedOn: today };
    const rains = [...farm.rains, record];
    await this.farm.save({ ...farm, rains });
    return ok({ kind: RecordKind.Rain, record, monthTotal: monthTotal(rains, today) });
  }
}
