import type { DateText } from '@/domain/entities/DateText';
import type { RainProposal } from '@/domain/entities/RainProposal';
import type { RainReceipt } from '@/domain/entities/RainReceipt';
import type { Result } from '@/domain/errors/Result';

export type RegisterRainUseCaseInput = { proposal: RainProposal; today: DateText };

/** Vuelve a validar la lluvia, la guarda y devuelve el comprobante con el total del mes. */
export interface RegisterRainUseCase {
  execute(input: RegisterRainUseCaseInput): Promise<Result<RainReceipt>>;
}
