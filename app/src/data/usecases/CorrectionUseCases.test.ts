import { describe, expect, it } from '@jest/globals';

import { ApplyCorrectionUseCaseImpl } from '@/data/usecases/ApplyCorrectionUseCaseImpl';
import { PreviewCorrectionUseCaseImpl } from '@/data/usecases/PreviewCorrectionUseCaseImpl';
import { RegisterMovementUseCaseImpl } from '@/data/usecases/RegisterMovementUseCaseImpl';
import { InMemoryFarmRepository } from '@/data/usecases/testing/InMemoryFarmRepository';
import { sampleFarm, TODAY } from '@/data/usecases/testing/sampleFarm';
import type { LastRecord } from '@/domain/entities/LastRecord';
import { AnimalCategory } from '@/domain/enums/AnimalCategory';
import { RecordKind } from '@/domain/enums/RecordKind';
import { FarmErrorCode } from '@/domain/errors/FarmErrorCode';

async function movedForty() {
  const repository = new InMemoryFarmRepository(sampleFarm());
  const result = await new RegisterMovementUseCaseImpl(repository).execute({
    proposal: { quantity: 40, category: AnimalCategory.Heifer, fromLot: 3, toLot: 5, date: TODAY },
    today: TODAY,
  });
  if (!result.ok) {
    throw new Error('el movimiento de prueba no se registró');
  }
  const target: LastRecord = { kind: RecordKind.Movement, movement: result.value.movement };
  return { repository, target };
}

describe('corrección', () => {
  it('corregir una lluvia cambia sus milímetros y el total del mes, sin agregar un registro', async () => {
    const repository = new InMemoryFarmRepository(sampleFarm());
    const target: LastRecord = { kind: RecordKind.Rain, record: sampleFarm().rains[2] };
    const result = await new ApplyCorrectionUseCaseImpl(repository).execute({
      proposal: { target, quantity: 25 },
      today: TODAY,
    });
    const rains = (await repository.load()).rains;
    expect(rains).toHaveLength(4);
    expect(rains[2]).toEqual({ ...target.record, millimeters: 25 });
    expect(result.ok && result.value.kind === RecordKind.Rain && result.value.monthTotal).toBe(40);
  });

  it('corregir un movimiento deja los lotes como si se hubiera movido la cantidad nueva', async () => {
    const { repository, target } = await movedForty();
    await new ApplyCorrectionUseCaseImpl(repository).execute({
      proposal: { target, quantity: 30 },
      today: TODAY,
    });
    const lots = (await repository.load()).lots;
    expect(lots[2].stock[AnimalCategory.Heifer]).toBe(15);
    expect(lots[4].stock[AnimalCategory.Heifer]).toBe(30);
  });

  it('corregir a una cantidad que el origen no tiene da NotEnoughAnimals y no cambia nada', async () => {
    const { repository, target } = await movedForty();
    const before = await repository.load();
    const result = await new PreviewCorrectionUseCaseImpl(repository).execute({
      target,
      quantity: 60,
    });
    expect(!result.ok && result.failure.code).toBe(FarmErrorCode.NotEnoughAnimals);
    expect(await repository.load()).toEqual(before);
  });

  it('sin registro para corregir da NothingToCorrect', async () => {
    const result = await new PreviewCorrectionUseCaseImpl(
      new InMemoryFarmRepository(sampleFarm()),
    ).execute({ target: null, quantity: 5 });
    expect(result).toEqual({ ok: false, failure: { code: FarmErrorCode.NothingToCorrect } });
  });
});
