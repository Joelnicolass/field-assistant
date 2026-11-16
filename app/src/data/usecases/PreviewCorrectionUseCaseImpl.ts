import { correct } from '@/data/usecases/rules/correctionRules';
import { fail, ok } from '@/data/usecases/rules/results';
import type { CorrectionProposal } from '@/domain/entities/CorrectionProposal';
import type { LastRecord } from '@/domain/entities/LastRecord';
import { FarmErrorCode } from '@/domain/errors/FarmErrorCode';
import { RecordKind } from '@/domain/enums/RecordKind';
import type { Result } from '@/domain/errors/Result';
import type { FarmRepository } from '@/domain/repositories/FarmRepository';
import type {
  PreviewCorrectionUseCase,
  PreviewCorrectionUseCaseInput,
} from '@/domain/usecases/PreviewCorrectionUseCase';

function dateOf(target: LastRecord): string {
  return target.kind === RecordKind.Rain ? target.record.date : target.movement.date;
}

export class PreviewCorrectionUseCaseImpl implements PreviewCorrectionUseCase {
  constructor(private readonly farm: FarmRepository) {}

  async execute({
    target,
    quantity,
  }: PreviewCorrectionUseCaseInput): Promise<Result<CorrectionProposal>> {
    if (target === null) {
      return fail({ code: FarmErrorCode.NothingToCorrect });
    }
    const result = correct(await this.farm.load(), target, quantity, dateOf(target));
    return result.ok ? ok({ target, quantity }) : fail(result.failure);
  }
}
