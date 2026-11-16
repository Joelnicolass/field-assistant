import { describe, expect, it } from '@jest/globals';

import { GetLotStockUseCaseImpl } from '@/data/usecases/GetLotStockUseCaseImpl';
import { GetRainSummaryUseCaseImpl } from '@/data/usecases/GetRainSummaryUseCaseImpl';
import { GetTodaySummaryUseCaseImpl } from '@/data/usecases/GetTodaySummaryUseCaseImpl';
import { RegisterMovementUseCaseImpl } from '@/data/usecases/RegisterMovementUseCaseImpl';
import { RegisterRainUseCaseImpl } from '@/data/usecases/RegisterRainUseCaseImpl';
import { InMemoryFarmRepository } from '@/data/usecases/testing/InMemoryFarmRepository';
import { sampleFarm, TODAY } from '@/data/usecases/testing/sampleFarm';
import { AnimalCategory } from '@/domain/enums/AnimalCategory';
import { RainRange } from '@/domain/enums/RainRange';
import { FarmErrorCode } from '@/domain/errors/FarmErrorCode';

function rainSummary(range: RainRange, today = TODAY) {
  return new GetRainSummaryUseCaseImpl(new InMemoryFarmRepository(sampleFarm())).execute({
    range,
    today,
  });
}

describe('consultas', () => {
  it('la semana suma los últimos 7 días, y dos lluvias del mismo día dan un renglón', async () => {
    expect(await rainSummary(RainRange.Week)).toEqual({
      range: RainRange.Week,
      total: 15,
      days: [{ date: '2026-11-14', millimeters: 15 }],
    });
  });

  it('el mes va del día 1 a hoy, del más reciente al más viejo', async () => {
    const month = await rainSummary(RainRange.Month);
    expect(month.total).toBe(35);
    expect(month.days.map((day) => day.date)).toEqual(['2026-11-14', '2026-11-03']);
  });

  it('el primer día del mes, el mes cuenta solo ese día', async () => {
    expect((await rainSummary(RainRange.Month, '2026-11-01')).total).toBe(0);
  });

  it('un período sin lluvias da total 0 y ningún renglón', async () => {
    expect(await rainSummary(RainRange.Today)).toEqual({
      range: RainRange.Today,
      total: 0,
      days: [],
    });
    expect((await rainSummary(RainRange.Yesterday)).days).toEqual([]);
  });

  it('GetLotStock da el total y cada categoría; un lote que no existe da LotNotFound', async () => {
    const lotStock = new GetLotStockUseCaseImpl(new InMemoryFarmRepository(sampleFarm()));
    const lot3 = await lotStock.execute({ lot: 3 });
    expect(lot3.ok && lot3.value.total).toBe(45);
    expect(lot3.ok && lot3.value.byCategory[AnimalCategory.Heifer]).toBe(45);
    expect(await lotStock.execute({ lot: 9 })).toEqual({
      ok: false,
      failure: { code: FarmErrorCode.LotNotFound, lot: 9 },
    });
  });
});

describe('resumen de hoy', () => {
  it('trae el campo, las cabezas, la lluvia del mes, la última lluvia y cada lote', async () => {
    const summary = await new GetTodaySummaryUseCaseImpl(
      new InMemoryFarmRepository(sampleFarm()),
    ).execute({ today: TODAY });
    expect(summary.farmName).toBe('Campo de prueba');
    expect(summary.totalHeads).toBe(80);
    expect(summary.monthRain).toBe(35);
    expect(summary.lastRain).toEqual({ date: '2026-11-14', millimeters: 15, daysAgo: 2 });
    expect(summary.lots.map((lot) => lot.total)).toEqual([10, 0, 45, 5, 20]);
  });

  it('sin lluvias, la última lluvia es null', async () => {
    const summary = await new GetTodaySummaryUseCaseImpl(
      new InMemoryFarmRepository({ ...sampleFarm(), rains: [] }),
    ).execute({ today: TODAY });
    expect(summary.lastRain).toBeNull();
  });

  it('lo anotado hoy cuenta lo que se anotó hoy, también una lluvia de ayer', async () => {
    const repository = new InMemoryFarmRepository(sampleFarm());
    await new RegisterRainUseCaseImpl(repository).execute({
      proposal: { millimeters: 18, date: '2026-11-15' },
      today: TODAY,
    });
    await new RegisterMovementUseCaseImpl(repository).execute({
      proposal: { quantity: 4, category: AnimalCategory.Cow, fromLot: 1, toLot: 2, date: TODAY },
      today: TODAY,
    });
    const summary = await new GetTodaySummaryUseCaseImpl(repository).execute({ today: TODAY });
    expect(summary.notedToday).toEqual({ rainMillimeters: 18, movedAnimals: 4 });
  });
});
