import type { DateText } from '@/domain/entities/DateText';
import type { RainProposal } from '@/domain/entities/RainProposal';
import type { Result } from '@/domain/errors/Result';

export type PreviewRainUseCaseInput = { millimeters: number; date: DateText; today: DateText };

/** Valida una lluvia y devuelve la propuesta, sin guardar nada. */
export interface PreviewRainUseCase {
  execute(input: PreviewRainUseCaseInput): Promise<Result<RainProposal>>;
}
