import type { CorrectionProposal } from '@/domain/entities/CorrectionProposal';
import type { DateText } from '@/domain/entities/DateText';
import type { Receipt } from '@/domain/entities/Receipt';
import type { Result } from '@/domain/errors/Result';

export type ApplyCorrectionUseCaseInput = { proposal: CorrectionProposal; today: DateText };

/** Vuelve a validar la corrección, la guarda y devuelve el comprobante. */
export interface ApplyCorrectionUseCase {
  execute(input: ApplyCorrectionUseCaseInput): Promise<Result<Receipt>>;
}
