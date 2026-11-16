import type { DateText } from '@/domain/entities/DateText';
import type { RainProposal } from '@/domain/entities/RainProposal';
import type { RainReceipt } from '@/domain/entities/RainReceipt';
import type { Result } from '@/domain/errors/Result';

export type RegisterRainUseCaseInput = { proposal: RainProposal; today: DateText };

export interface RegisterRainUseCase {
  execute(input: RegisterRainUseCaseInput): Promise<Result<RainReceipt>>;
}
