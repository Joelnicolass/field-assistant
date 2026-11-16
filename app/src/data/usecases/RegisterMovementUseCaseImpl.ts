import { movementFailure } from '@/data/usecases/rules/movementRules';
import { nextId } from '@/data/usecases/rules/nextId';
import { fail, ok } from '@/data/usecases/rules/results';
import { moveAnimals } from '@/data/usecases/rules/stockChanges';
import type { MovementReceipt } from '@/domain/entities/MovementReceipt';
import { RecordKind } from '@/domain/enums/RecordKind';
import type { Result } from '@/domain/errors/Result';
import type { FarmRepository } from '@/domain/repositories/FarmRepository';
import type {
  RegisterMovementUseCase,
  RegisterMovementUseCaseInput,
} from '@/domain/usecases/RegisterMovementUseCase';

export class RegisterMovementUseCaseImpl implements RegisterMovementUseCase {
  constructor(private readonly farm: FarmRepository) {}

  async execute({
    proposal,
    today,
  }: RegisterMovementUseCaseInput): Promise<Result<MovementReceipt>> {
    const farm = await this.farm.load();
    const failure = movementFailure(farm, proposal, today);
    if (failure !== null) {
      return fail(failure);
    }
    const movement = { id: nextId(farm.movements), ...proposal, notedOn: today };
    const lots = moveAnimals(farm.lots, proposal);
    await this.farm.save({ ...farm, lots, movements: [...farm.movements, movement] });
    const origin = lots.find((lot) => lot.number === proposal.fromLot);
    return ok({
      kind: RecordKind.Movement,
      movement,
      remainingInOrigin: origin?.stock[proposal.category] ?? 0,
    });
  }
}
