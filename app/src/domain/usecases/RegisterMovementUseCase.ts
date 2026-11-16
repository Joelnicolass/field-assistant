import type { DateText } from '@/domain/entities/DateText';
import type { MovementProposal } from '@/domain/entities/MovementProposal';
import type { MovementReceipt } from '@/domain/entities/MovementReceipt';
import type { Result } from '@/domain/errors/Result';

export type RegisterMovementUseCaseInput = { proposal: MovementProposal; today: DateText };

/** Vuelve a validar el movimiento con los datos de ahora, mueve los animales y lo guarda. */
export interface RegisterMovementUseCase {
  execute(input: RegisterMovementUseCaseInput): Promise<Result<MovementReceipt>>;
}
