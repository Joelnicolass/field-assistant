import { movementFailure } from '@/data/usecases/rules/movementRules';
import { fail, ok } from '@/data/usecases/rules/results';
import type { MovementProposal } from '@/domain/entities/MovementProposal';
import type { Result } from '@/domain/errors/Result';
import type { FarmRepository } from '@/domain/repositories/FarmRepository';
import type {
  PreviewMovementUseCase,
  PreviewMovementUseCaseInput,
} from '@/domain/usecases/PreviewMovementUseCase';

export class PreviewMovementUseCaseImpl implements PreviewMovementUseCase {
  constructor(private readonly farm: FarmRepository) {}

  async execute({
    today,
    ...proposal
  }: PreviewMovementUseCaseInput): Promise<Result<MovementProposal>> {
    const failure = movementFailure(await this.farm.load(), proposal, today);
    return failure === null ? ok(proposal) : fail(failure);
  }
}
