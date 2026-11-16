import { describe, expect, it } from '@jest/globals';

import { PendingAudioRepositoryImpl } from '@/data/repositories/PendingAudioRepositoryImpl';
import type { PendingAudioLocalDataSource } from '@/domain/datasources/PendingAudioLocalDataSource';

function memoryDataSource(): PendingAudioLocalDataSource & { discarded: string[] } {
  let document: unknown | null = null;
  const discarded: string[] = [];
  return {
    discarded,
    read: async () => document,
    write: async (next) => {
      document = JSON.parse(JSON.stringify(next));
    },
    keep: async (uri) => `kept/${uri}`,
    discard: async (uri) => {
      discarded.push(uri);
    },
  };
}

const audio = (uri: string) => ({ uri, mimeType: 'audio/m4a', heardVoice: true });

describe('PendingAudioRepositoryImpl', () => {
  it('guarda cada audio copiado y con el id siguiente', async () => {
    const repository = new PendingAudioRepositoryImpl(memoryDataSource());
    await repository.add(audio('a'), '2026-11-16');
    await repository.add(audio('b'), '2026-11-16');
    expect((await repository.list()).map(({ id, uri }) => ({ id, uri }))).toEqual([
      { id: 1, uri: 'kept/a' },
      { id: 2, uri: 'kept/b' },
    ]);
  });

  it('al sacar un audio, lo quita de la lista y borra su archivo', async () => {
    const dataSource = memoryDataSource();
    const repository = new PendingAudioRepositoryImpl(dataSource);
    await repository.add(audio('a'), '2026-11-16');
    await repository.add(audio('b'), '2026-11-16');
    await repository.remove(1);
    expect((await repository.list()).map(({ id }) => id)).toEqual([2]);
    expect(dataSource.discarded).toEqual(['kept/a']);
  });
});
