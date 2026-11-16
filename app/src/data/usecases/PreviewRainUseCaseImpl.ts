import { fail, ok } from '@/data/usecases/rules/results';
import { rainFailure } from '@/data/usecases/rules/rainRules';
import type { RainProposal } from '@/domain/entities/RainProposal';
import type { Result } from '@/domain/errors/Result';
import type { FarmRepository } from '@/domain/repositories/FarmRepository';
import type {
  PreviewRainUseCase,
  PreviewRainUseCaseInput,
} from '@/domain/usecases/PreviewRainUseCase';

export class PreviewRainUseCaseImpl implements PreviewRainUseCase {
  constructor(private readonly farm: FarmRepository) {}

  async execute({
    millimeters,
    date,
    today,
  }: PreviewRainUseCaseInput): Promise<Result<RainProposal>> {
    const failure = rainFailure({ millimeters, date, today });
    return failure === null ? ok({ millimeters, date }) : fail(failure);
  }
}
