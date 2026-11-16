import { describe, expect, it } from '@jest/globals';

import type { UserSettingsLocalDataSource } from '@/domain/datasources/UserSettingsLocalDataSource';
import { UserSettingsRepositoryImpl } from './UserSettingsRepositoryImpl';

const DEFAULTS = { speechLevel: 0.65, autoTheme: true };

function memoryDataSource(
  initial: unknown = null,
): UserSettingsLocalDataSource & { saved: unknown } {
  const source = {
    saved: initial,
    read: async () => source.saved,
    write: async (document: unknown) => {
      source.saved = document;
    },
  };
  return source;
}

describe('UserSettingsRepositoryImpl', () => {
  it('sin archivo, da los de fábrica', async () => {
    const repository = new UserSettingsRepositoryImpl(memoryDataSource(), DEFAULTS);
    expect(await repository.load()).toEqual(DEFAULTS);
  });

  it('un ajuste que no se entiende queda con el de fábrica', async () => {
    const broken = { version: 1, settings: { speechLevel: 3, autoTheme: false } };
    const repository = new UserSettingsRepositoryImpl(memoryDataSource(broken), DEFAULTS);
    expect(await repository.load()).toEqual({ speechLevel: 0.65, autoTheme: false });
  });

  it('un archivo sin un ajuste nuevo conserva los demás', async () => {
    const older = { version: 1, settings: { speechLevel: 0.4 } };
    const repository = new UserSettingsRepositoryImpl(memoryDataSource(older), DEFAULTS);
    expect(await repository.load()).toEqual({ speechLevel: 0.4, autoTheme: true });
  });

  it('lo que se guarda se vuelve a leer, también desde otro repositorio', async () => {
    const source = memoryDataSource();
    const saved = { speechLevel: 0.4, autoTheme: false };
    await new UserSettingsRepositoryImpl(source, DEFAULTS).save(saved);
    expect(await new UserSettingsRepositoryImpl(source, DEFAULTS).load()).toEqual(saved);
  });
});
