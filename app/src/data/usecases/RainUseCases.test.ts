import { describe, expect, it } from '@jest/globals';

import { PreviewRainUseCaseImpl } from '@/data/usecases/PreviewRainUseCaseImpl';
import { RegisterRainUseCaseImpl } from '@/data/usecases/RegisterRainUseCaseImpl';
import { InMemoryFarmRepository } from '@/data/usecases/testing/InMemoryFarmRepository';
import { sampleFarm, TODAY } from '@/data/usecases/testing/sampleFarm';
import { FarmErrorCode } from '@/domain/errors/FarmErrorCode';

const YESTERDAY = '2026-11-15';
const TOMORROW = '2026-11-17';

describe('lluvia', () => {
  it('PreviewRain propone 18 mm de ayer y no guarda nada', async () => {
    const repository = new InMemoryFarmRepository(sampleFarm());
    const result = await new PreviewRainUseCaseImpl(repository).execute({
      millimeters: 18,
      date: YESTERDAY,
      today: TODAY,
    });
    expect(result).toEqual({ ok: true, value: { millimeters: 18, date: YESTERDAY } });
    expect(repository.saves).toBe(0);
  });

  it('RegisterRain guarda con el id siguiente y devuelve el total del mes', async () => {
    const repository = new InMemoryFarmRepository(sampleFarm());
    const result = await new RegisterRainUseCaseImpl(repository).execute({
      proposal: { millimeters: 18, date: YESTERDAY },
      today: TODAY,
    });
    expect(result.ok && result.value.record).toEqual({
      id: 5,
      date: YESTERDAY,
      notedOn: TODAY,
      millimeters: 18,
    });
    expect(result.ok && result.value.monthTotal).toBe(53);
    expect((await repository.load()).rains).toHaveLength(5);
  });

  it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY])(
    'milímetros inválidos (%p) dan InvalidMillimeters',
    async (millimeters) => {
      const result = await new PreviewRainUseCaseImpl(
        new InMemoryFarmRepository(sampleFarm()),
      ).execute({ millimeters, date: TODAY, today: TODAY });
      expect(result).toEqual({ ok: false, failure: { code: FarmErrorCode.InvalidMillimeters } });
    },
  );

  it('una fecha futura da FutureDate al proponer y al registrar', async () => {
    const repository = new InMemoryFarmRepository(sampleFarm());
    const futureDate = { ok: false, failure: { code: FarmErrorCode.FutureDate } };
    expect(
      await new PreviewRainUseCaseImpl(repository).execute({
        millimeters: 5,
        date: TOMORROW,
        today: TODAY,
      }),
    ).toEqual(futureDate);
    expect(
      await new RegisterRainUseCaseImpl(repository).execute({
        proposal: { millimeters: 5, date: TOMORROW },
        today: TODAY,
      }),
    ).toEqual(futureDate);
  });
});
