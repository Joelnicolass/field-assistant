import { correct } from '@/data/usecases/rules/correctionRules';
import { fail, ok } from '@/data/usecases/rules/results';
import type { Receipt } from '@/domain/entities/Receipt';
import type { Result } from '@/domain/errors/Result';
import type { FarmRepository } from '@/domain/repositories/FarmRepository';
import type {
  ApplyCorrectionUseCase,
  ApplyCorrectionUseCaseInput,
} from '@/domain/usecases/ApplyCorrectionUseCase';

export class ApplyCorrectionUseCaseImpl implements ApplyCorrectionUseCase {
  constructor(private readonly farm: FarmRepository) {}

  async execute({ proposal, today }: ApplyCorrectionUseCaseInput): Promise<Result<Receipt>> {
    const result = correct(await this.farm.load(), proposal.target, proposal.quantity, today);
    if (!result.ok) {
      return fail(result.failure);
    }
    await this.farm.save(result.value.farm);
    return ok(result.value.receipt);
  }
}
