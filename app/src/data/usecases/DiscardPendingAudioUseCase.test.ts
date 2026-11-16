import { describe, expect, it } from '@jest/globals';

import { DiscardPendingAudioUseCaseImpl } from '@/data/usecases/DiscardPendingAudioUseCaseImpl';
import type { PendingAudioRepository } from '@/domain/repositories/PendingAudioRepository';

describe('DiscardPendingAudioUseCase', () => {
  it('saca el audio de la cola', async () => {
    const removed: number[] = [];
    const repository: PendingAudioRepository = {
      list: async () => [],
      add: async () => {
        throw new Error('no se usa');
      },
      remove: async (id) => {
        removed.push(id);
      },
    };

    await new DiscardPendingAudioUseCaseImpl(repository).execute({ id: 2 });

    expect(removed).toEqual([2]);
  });
});
