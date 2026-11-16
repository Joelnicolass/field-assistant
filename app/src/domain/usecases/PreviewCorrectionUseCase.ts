import type { CorrectionProposal } from '@/domain/entities/CorrectionProposal';
import type { LastRecord } from '@/domain/entities/LastRecord';
import type { Result } from '@/domain/errors/Result';

export type PreviewCorrectionUseCaseInput = { target: LastRecord | null; quantity: number };

/** Valida la corrección de la cantidad del último registro, sin guardar nada. */
export interface PreviewCorrectionUseCase {
  execute(input: PreviewCorrectionUseCaseInput): Promise<Result<CorrectionProposal>>;
}
