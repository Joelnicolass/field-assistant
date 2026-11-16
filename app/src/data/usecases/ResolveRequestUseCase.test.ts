import { describe, expect, it, jest } from '@jest/globals';

import { GetLotStockUseCaseImpl } from '@/data/usecases/GetLotStockUseCaseImpl';
import { GetRainSummaryUseCaseImpl } from '@/data/usecases/GetRainSummaryUseCaseImpl';
import { PreviewCorrectionUseCaseImpl } from '@/data/usecases/PreviewCorrectionUseCaseImpl';
import { PreviewMovementUseCaseImpl } from '@/data/usecases/PreviewMovementUseCaseImpl';
import { PreviewRainUseCaseImpl } from '@/data/usecases/PreviewRainUseCaseImpl';
import { ResolveRequestUseCaseImpl } from '@/data/usecases/ResolveRequestUseCaseImpl';
import { InMemoryFarmRepository } from '@/data/usecases/testing/InMemoryFarmRepository';
import { interpretationOf } from '@/data/usecases/testing/interpretationOf';
import { sampleFarm, TODAY } from '@/data/usecases/testing/sampleFarm';
import type { Interpretation } from '@/domain/entities/Interpretation';
import type { LastRecord } from '@/domain/entities/LastRecord';
import { AnimalCategory } from '@/domain/enums/AnimalCategory';
import { IntentKind } from '@/domain/enums/IntentKind';
import { RainRange } from '@/domain/enums/RainRange';
import { RecordKind } from '@/domain/enums/RecordKind';
import { RelativeDay } from '@/domain/enums/RelativeDay';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import { FarmErrorCode } from '@/domain/errors/FarmErrorCode';
import type { PreviewMovementUseCase } from '@/domain/usecases/PreviewMovementUseCase';

const YESTERDAY = '2026-11-15';

function resolve(
  interpretation: Interpretation,
  lastRecord: LastRecord | null = null,
  previewMovement?: PreviewMovementUseCase,
) {
  const farm = new InMemoryFarmRepository(sampleFarm());
  return new ResolveRequestUseCaseImpl(
    new PreviewRainUseCaseImpl(farm),
    previewMovement ?? new PreviewMovementUseCaseImpl(farm),
    new GetRainSummaryUseCaseImpl(farm),
    new GetLotStockUseCaseImpl(farm),
    new PreviewCorrectionUseCaseImpl(farm),
  ).execute({ interpretation, referenceDay: TODAY, today: TODAY, lastRecord });
}

const rain = { intent: IntentKind.RegisterRain, millimeters: 18 };
const movement = {
  intent: IntentKind.MoveAnimals,
  quantity: 40,
  category: AnimalCategory.Heifer,
  fromLot: 3,
  toLot: 5,
};

describe('ResolveRequestUseCase', () => {
  it('una lluvia de hoy propone anotarla con la fecha de hoy', async () => {
    const resolution = await resolve(interpretationOf({ ...rain, day: RelativeDay.Today }));
    expect(resolution).toEqual({
      kind: ResolutionKind.RainProposal,
      proposal: { millimeters: 18, date: TODAY },
    });
  });

  it('una lluvia de ayer propone anotarla con la fecha de ayer', async () => {
    const resolution = await resolve(interpretationOf({ ...rain, day: RelativeDay.Yesterday }));
    expect(resolution).toEqual({
      kind: ResolutionKind.RainProposal,
      proposal: { millimeters: 18, date: YESTERDAY },
    });
  });

  it('una lluvia con fecha usa esa fecha', async () => {
    const resolution = await resolve(interpretationOf({ ...rain, date: '2026-11-12' }));
    expect(resolution).toEqual({
      kind: ResolutionKind.RainProposal,
      proposal: { millimeters: 18, date: '2026-11-12' },
    });
  });

  it('un movimiento válido propone el movimiento con la fecha de referencia', async () => {
    const resolution = await resolve(interpretationOf(movement));
    expect(resolution).toEqual({
      kind: ResolutionKind.MovementProposal,
      proposal: {
        quantity: 40,
        category: AnimalCategory.Heifer,
        fromLot: 3,
        toLot: 5,
        date: TODAY,
      },
    });
  });

  it('un movimiento que el campo rechaza vuelve como rechazado con su falla', async () => {
    const resolution = await resolve(interpretationOf({ ...movement, quantity: 50 }));
    expect(resolution).toEqual({
      kind: ResolutionKind.Rejected,
      failure: {
        code: FarmErrorCode.NotEnoughAnimals,
        lot: 3,
        category: AnimalCategory.Heifer,
        available: 45,
        requested: 50,
      },
    });
  });

  it('una consulta de lluvia contesta con el resumen del período', async () => {
    const resolution = await resolve(
      interpretationOf({ intent: IntentKind.RainQuery, range: RainRange.Month }),
    );
    expect(resolution.kind).toBe(ResolutionKind.RainAnswer);
    expect(resolution.kind === ResolutionKind.RainAnswer && resolution.summary.total).toBe(35);
  });

  it('una consulta de un lote que no existe vuelve como rechazada', async () => {
    const resolution = await resolve(interpretationOf({ intent: IntentKind.LotQuery, lot: 9 }));
    expect(resolution).toEqual({
      kind: ResolutionKind.Rejected,
      failure: { code: FarmErrorCode.LotNotFound, lot: 9 },
    });
  });

  it('un dato que falta, con pregunta del modelo, devuelve esa pregunta', async () => {
    const resolution = await resolve(
      interpretationOf({ ...movement, toLot: null, question: '¿A qué lote?' }),
    );
    expect(resolution).toEqual({ kind: ResolutionKind.Question, question: '¿A qué lote?' });
  });

  it('un dato que falta, sin pregunta, devuelve una pregunta genérica', async () => {
    const resolution = await resolve(interpretationOf({ ...movement, toLot: null }));
    expect(resolution).toEqual({ kind: ResolutionKind.Question, question: null });
  });

  it('un dato que falta no llama a Preview', async () => {
    const previewMovement = { execute: jest.fn<PreviewMovementUseCase['execute']>() };
    await resolve(interpretationOf({ ...movement, toLot: null }), null, previewMovement);
    expect(previewMovement.execute).not.toHaveBeenCalled();
  });

  it('una corrección propone cambiar la cantidad del último registro', async () => {
    const target: LastRecord = { kind: RecordKind.Rain, record: sampleFarm().rains[0] };
    const resolution = await resolve(
      interpretationOf({ intent: IntentKind.Correct, quantity: 20 }),
      target,
    );
    expect(resolution).toEqual({
      kind: ResolutionKind.CorrectionProposal,
      proposal: { target, quantity: 20 },
    });
  });

  it('unknown devuelve no entendido', async () => {
    const resolution = await resolve(interpretationOf({ intent: IntentKind.Unknown }));
    expect(resolution).toEqual({ kind: ResolutionKind.NotUnderstood });
  });

  it('un campo que el pedido no usa se ignora', async () => {
    const resolution = await resolve(
      interpretationOf({ ...rain, day: RelativeDay.Today, lot: 7, toLot: 2 }),
    );
    expect(resolution).toEqual({
      kind: ResolutionKind.RainProposal,
      proposal: { millimeters: 18, date: TODAY },
    });
  });
});
