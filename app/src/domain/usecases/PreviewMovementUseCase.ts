import type { DateText } from '@/domain/entities/DateText';
import type { MovementProposal } from '@/domain/entities/MovementProposal';
import type { AnimalCategory } from '@/domain/enums/AnimalCategory';
import type { Result } from '@/domain/errors/Result';

export type PreviewMovementUseCaseInput = {
  quantity: number;
  category: AnimalCategory;
  fromLot: number;
  toLot: number;
  date: DateText;
  today: DateText;
};

export interface PreviewMovementUseCase {
  execute(input: PreviewMovementUseCaseInput): Promise<Result<MovementProposal>>;
}
