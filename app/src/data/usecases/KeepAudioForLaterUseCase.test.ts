import { describe, expect, it } from '@jest/globals';

import { KeepAudioForLaterUseCaseImpl } from '@/data/usecases/KeepAudioForLaterUseCaseImpl';
import type { PendingAudio } from '@/domain/entities/PendingAudio';
import type { PendingAudioRepository } from '@/domain/repositories/PendingAudioRepository';

describe('KeepAudioForLaterUseCase', () => {
  it('guarda el audio en la cola con su fecha de grabación', async () => {
    const saved: PendingAudio = {
      id: 1,
      uri: 'kept/a',
      mimeType: 'audio/m4a',
      recordedOn: '2026-11-16',
    };
    const added: unknown[] = [];
    const repository: PendingAudioRepository = {
      list: async () => [],
      add: async (audio, recordedOn) => {
        added.push([audio, recordedOn]);
        return saved;
      },
      remove: async () => undefined,
    };
    const audio = { uri: 'a', mimeType: 'audio/m4a', heardVoice: true };

    const result = await new KeepAudioForLaterUseCaseImpl(repository).execute({
      audio,
      recordedOn: '2026-11-16',
    });

    expect(result).toBe(saved);
    expect(added).toEqual([[audio, '2026-11-16']]);
  });
});
