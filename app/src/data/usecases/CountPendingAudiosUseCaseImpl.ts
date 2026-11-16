import type { PendingAudioRepository } from '@/domain/repositories/PendingAudioRepository';
import type {
  CountPendingAudiosUseCase,
  CountPendingAudiosUseCaseInput,
} from '@/domain/usecases/CountPendingAudiosUseCase';

export class CountPendingAudiosUseCaseImpl implements CountPendingAudiosUseCase {
  constructor(private readonly pendingAudios: PendingAudioRepository) {}

  async execute({ alreadyResolved }: CountPendingAudiosUseCaseInput): Promise<number> {
    const queue = await this.pendingAudios.list();
    return queue.filter(({ id }) => !alreadyResolved.includes(id)).length;
  }
}
