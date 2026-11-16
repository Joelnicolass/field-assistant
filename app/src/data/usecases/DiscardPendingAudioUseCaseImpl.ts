import type { PendingAudioRepository } from '@/domain/repositories/PendingAudioRepository';
import type {
  DiscardPendingAudioUseCase,
  DiscardPendingAudioUseCaseInput,
} from '@/domain/usecases/DiscardPendingAudioUseCase';

export class DiscardPendingAudioUseCaseImpl implements DiscardPendingAudioUseCase {
  constructor(private readonly pendingAudios: PendingAudioRepository) {}

  execute({ id }: DiscardPendingAudioUseCaseInput): Promise<void> {
    return this.pendingAudios.remove(id);
  }
}
