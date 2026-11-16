import { describe, expect, it } from '@jest/globals';

import { PreviewMovementUseCaseImpl } from '@/data/usecases/PreviewMovementUseCaseImpl';
import { RegisterMovementUseCaseImpl } from '@/data/usecases/RegisterMovementUseCaseImpl';
import { lotTotal } from '@/data/usecases/rules/stockChanges';
import { InMemoryFarmRepository } from '@/data/usecases/testing/InMemoryFarmRepository';
import { sampleFarm, TODAY } from '@/data/usecases/testing/sampleFarm';
import type { Farm } from '@/domain/entities/Farm';
import type { MovementProposal } from '@/domain/entities/MovementProposal';
import { AnimalCategory } from '@/domain/enums/AnimalCategory';
import { FarmErrorCode } from '@/domain/errors/FarmErrorCode';

const forty: MovementProposal = {
  quantity: 40,
  category: AnimalCategory.Heifer,
  fromLot: 3,
  toLot: 5,
  date: TODAY,
};

function preview(changes: Partial<MovementProposal>) {
  return new PreviewMovementUseCaseImpl(new InMemoryFarmRepository(sampleFarm())).execute({
    ...forty,
    ...changes,
    today: TODAY,
  });
}

function heads(farm: Farm): number {
  return farm.lots.reduce((sum, lot) => sum + lotTotal(lot), 0);
}

describe('movimiento', () => {
  it('mueve 40 vaquillonas del 3 al 5: quedan 5 en el origen y el total no cambia', async () => {
    const repository = new InMemoryFarmRepository(sampleFarm());
    expect(await preview({})).toEqual({ ok: true, value: forty });
    const result = await new RegisterMovementUseCaseImpl(repository).execute({
      proposal: forty,
      today: TODAY,
    });
    const farm = await repository.load();
    expect(farm.lots[2].stock[AnimalCategory.Heifer]).toBe(5);
    expect(farm.lots[4].stock[AnimalCategory.Heifer]).toBe(40);
    expect(heads(farm)).toBe(heads(sampleFarm()));
    expect(result.ok && result.value.remainingInOrigin).toBe(5);
  });

  it('un lote que no existe da LotNotFound con ese lote', async () => {
    expect(await preview({ toLot: 9 })).toEqual({
      ok: false,
      failure: { code: FarmErrorCode.LotNotFound, lot: 9 },
    });
  });

  it('origen y destino iguales dan SameLot', async () => {
    expect(await preview({ toLot: 3 })).toEqual({
      ok: false,
      failure: { code: FarmErrorCode.SameLot, lot: 3 },
    });
  });

  it.each([0, -2, 1.5])('una cantidad inválida (%p) da InvalidQuantity', async (quantity) => {
    expect(await preview({ quantity })).toEqual({
      ok: false,
      failure: { code: FarmErrorCode.InvalidQuantity },
    });
  });

  it('pedir más de los que hay da NotEnoughAnimals con lo disponible y lo pedido', async () => {
    expect(await preview({ quantity: 50 })).toEqual({
      ok: false,
      failure: {
        code: FarmErrorCode.NotEnoughAnimals,
        lot: 3,
        category: AnimalCategory.Heifer,
        available: 45,
        requested: 50,
      },
    });
  });

  it('las reglas van en orden: cantidad inválida antes que lote inexistente', async () => {
    expect(await preview({ quantity: 0, fromLot: 9 })).toEqual({
      ok: false,
      failure: { code: FarmErrorCode.InvalidQuantity },
    });
  });

  it('si los datos cambiaron y ya no alcanzan, RegisterMovement no guarda nada', async () => {
    const repository = new InMemoryFarmRepository(sampleFarm());
    const register = new RegisterMovementUseCaseImpl(repository);
    await register.execute({ proposal: forty, today: TODAY });
    const late = await register.execute({ proposal: forty, today: TODAY });
    expect(late.ok).toBe(false);
    expect(!late.ok && late.failure.code).toBe(FarmErrorCode.NotEnoughAnimals);
    expect(repository.saves).toBe(1);
  });
});
