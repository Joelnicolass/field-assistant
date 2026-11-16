import { describe, expect, it } from '@jest/globals';

import type { Resolution } from '@/domain/entities/Resolution';
import { AnimalCategory } from '@/domain/enums/AnimalCategory';
import { RainRange } from '@/domain/enums/RainRange';
import { RecordKind } from '@/domain/enums/RecordKind';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import type { Failure } from '@/domain/errors/Failure';
import { FarmErrorCode } from '@/domain/errors/FarmErrorCode';
import { SPOKEN } from '../constants';
import { confirmationReply, failureReply, spokenReply } from './spokenReply';

const TODAY = '2026-11-16';
const YESTERDAY = '2026-11-15';

const MOVEMENT = {
  id: 7,
  date: TODAY,
  notedOn: TODAY,
  quantity: 40,
  category: AnimalCategory.Heifer,
  fromLot: 3,
  toLot: 5,
};

const reply = (resolution: Resolution) => spokenReply(resolution, TODAY);

describe('spokenReply por ResolutionKind', () => {
  it('propuesta de lluvia: dice los milímetros y el día', () => {
    const resolution = {
      kind: ResolutionKind.RainProposal,
      proposal: { millimeters: 18, date: YESTERDAY },
    } as const;
    expect(reply(resolution)).toBe('Voy a anotar 18 milímetros, lluvia de ayer.');
  });

  it('propuesta de movimiento: dice cuántos animales y de qué lote a cuál', () => {
    const resolution = {
      kind: ResolutionKind.MovementProposal,
      proposal: {
        quantity: 40,
        category: AnimalCategory.Heifer,
        fromLot: 3,
        toLot: 5,
        date: TODAY,
      },
    } as const;
    expect(reply(resolution)).toBe('Voy a pasar 40 vaquillonas del lote 3 al 5.');
  });

  it('propuesta de corrección: dice el valor nuevo del último registro', () => {
    const resolution = {
      kind: ResolutionKind.CorrectionProposal,
      proposal: {
        target: { kind: RecordKind.Movement, movement: MOVEMENT },
        quantity: 20,
      },
    } as const;
    expect(reply(resolution)).toBe('Voy a corregir el movimiento: 20 vaquillonas.');
  });

  it('respuesta de lluvia: dice el total, y "no llovió" si es cero', () => {
    const month: Resolution = {
      kind: ResolutionKind.RainAnswer,
      summary: { range: RainRange.Month, total: 56, days: [] },
    };
    const dry: Resolution = {
      kind: ResolutionKind.RainAnswer,
      summary: { range: RainRange.Month, total: 0, days: [] },
    };
    expect(reply(month)).toBe('Este mes llovieron 56 milímetros.');
    expect(reply(dry)).toBe('Este mes no llovió.');
  });

  it('respuesta de lote: dice cuántos animales hay', () => {
    const byCategory = {
      [AnimalCategory.Cow]: 80,
      [AnimalCategory.Heifer]: 25,
      [AnimalCategory.Calf]: 0,
      [AnimalCategory.Steer]: 0,
      [AnimalCategory.Bull]: 0,
    };
    const stock = { lot: 5, total: 105, byCategory };
    expect(reply({ kind: ResolutionKind.LotAnswer, stock })).toBe('En el lote 5 hay 105 animales.');
  });

  it('pregunta: dice la pregunta, o pide todo de nuevo si no trae texto', () => {
    expect(reply({ kind: ResolutionKind.Question, question: '¿A qué lote?' })).toBe('¿A qué lote?');
    expect(reply({ kind: ResolutionKind.Question, question: null })).toBe(
      '¿Me lo decís de nuevo, con todos los datos?',
    );
  });

  it('rechazo: dice por qué no se puede', () => {
    const failure = { code: FarmErrorCode.LotNotFound, lot: 12 } as const;
    expect(reply({ kind: ResolutionKind.Rejected, failure })).toBe('El lote 12 no existe.');
  });

  it('no entendió: dice que no lo sabe', () => {
    expect(reply({ kind: ResolutionKind.NotUnderstood })).toBe('Eso no lo sé.');
  });
});

describe('failureReply por FarmErrorCode', () => {
  const FAILURES: [Failure, string][] = [
    [{ code: FarmErrorCode.LotNotFound, lot: 12 }, 'El lote 12 no existe.'],
    [{ code: FarmErrorCode.SameLot, lot: 3 }, 'El lote 3 es el de origen y el de destino.'],
    [{ code: FarmErrorCode.InvalidQuantity }, 'La cantidad tiene que ser mayor que cero.'],
    [
      {
        code: FarmErrorCode.NotEnoughAnimals,
        lot: 3,
        category: AnimalCategory.Steer,
        available: 12,
        requested: 500,
      },
      'En el lote 3 hay 12 novillos, no 500.',
    ],
    [{ code: FarmErrorCode.InvalidMillimeters }, 'Los milímetros tienen que ser mayores que cero.'],
    [{ code: FarmErrorCode.FutureDate }, 'No puedo anotar una fecha que todavía no pasó.'],
    [{ code: FarmErrorCode.NothingToCorrect }, 'No hay nada para corregir.'],
  ];

  it.each(FAILURES)('%j se dice como "%s"', (failure, text) => {
    expect(failureReply(failure)).toBe(text);
  });
});

describe('confirmationReply', () => {
  it('lluvia anotada: dice el total del mes', () => {
    const record = { id: 1, date: YESTERDAY, notedOn: TODAY, millimeters: 18 };
    const result = { ok: true, value: { kind: RecordKind.Rain, record, monthTotal: 56 } } as const;
    expect(confirmationReply(result)).toBe('Anotado. Van 56 milímetros en el mes.');
  });

  it('movimiento anotado: dice cuántos quedan en el lote de origen', () => {
    const value = { kind: RecordKind.Movement, movement: MOVEMENT, remainingInOrigin: 5 } as const;
    expect(confirmationReply({ ok: true, value })).toBe(
      'Listo. Quedan 5 vaquillonas en el lote 3.',
    );
  });
});

describe('textos fijos de la app', () => {
  it('dice que no escuchó, que guardó el audio, que descartó el pedido y que algo salió mal', () => {
    expect(SPOKEN.nothingHeard).toBe('No te escuché.');
    expect(SPOKEN.audioSaved).toBe('Guardé tu audio. Lo anoto cuando vuelva la señal.');
    expect(SPOKEN.discarded).toBe('No llegué a entenderlo. Probá decirlo de una.');
    expect(SPOKEN.unexpected).toBe('Algo salió mal. Probá de nuevo.');
  });

  it('da tres frases de ejemplo', () => {
    expect(SPOKEN.examples).toEqual([
      'Llovieron 18 milímetros anoche',
      'Pasé 40 vaquillonas del lote 3 al 5',
      '¿Cuánto llovió este mes?',
    ]);
  });
});
