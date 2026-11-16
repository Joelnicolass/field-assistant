import type { PendingAudio } from '@/domain/entities/PendingAudio';
import type { PendingAudioRepository } from '@/domain/repositories/PendingAudioRepository';
import type {
  KeepAudioForLaterUseCase,
  KeepAudioForLaterUseCaseInput,
} from '@/domain/usecases/KeepAudioForLaterUseCase';

export class KeepAudioForLaterUseCaseImpl implements KeepAudioForLaterUseCase {
  constructor(private readonly pendingAudios: PendingAudioRepository) {}

  execute({ audio, recordedOn }: KeepAudioForLaterUseCaseInput): Promise<PendingAudio> {
    return this.pendingAudios.add(audio, recordedOn);
  }
}
