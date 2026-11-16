import { describe, expect, it } from '@jest/globals';

import { farmSeed } from '@/data/datasources/farmSeed';
import { FarmRepositoryImpl } from '@/data/repositories/FarmRepositoryImpl';
import type { FarmLocalDataSource } from '@/domain/datasources/FarmLocalDataSource';
import type { ClockService } from '@/domain/services/ClockService';

const TODAY = '2026-11-16';
const clock: ClockService = { today: () => TODAY };

function memoryDataSource(initial: unknown | null = null): FarmLocalDataSource & {
  stored: () => unknown | null;
} {
  let document = initial;
  return {
    read: async () => document,
    write: async (next) => {
      document = JSON.parse(JSON.stringify(next));
    },
    stored: () => document,
  };
}

describe('FarmRepositoryImpl', () => {
  it('sin documento guardado devuelve los datos iniciales y los deja guardados', async () => {
    const dataSource = memoryDataSource();
    const farm = await new FarmRepositoryImpl(dataSource, clock).load();
    expect(farm).toEqual(farmSeed(TODAY));
    expect(dataSource.stored()).not.toBeNull();
  });

  it('otro repositorio sobre el mismo datasource lee lo que se guardó', async () => {
    const dataSource = memoryDataSource();
    const changed = { ...farmSeed(TODAY), name: 'Otro campo' };
    await new FarmRepositoryImpl(dataSource, clock).save(changed);
    expect(await new FarmRepositoryImpl(dataSource, clock).load()).toEqual(changed);
  });

  it('un documento inválido vuelve a los datos iniciales', async () => {
    const dataSource = memoryDataSource({ version: 2, farm: farmSeed(TODAY) });
    expect(await new FarmRepositoryImpl(dataSource, clock).load()).toEqual(farmSeed(TODAY));
  });
});
