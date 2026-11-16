import { describe, expect, it } from '@jest/globals';

import { RetryPendingAudiosUseCaseImpl } from '@/data/usecases/RetryPendingAudiosUseCaseImpl';
import { interpretationOf } from '@/data/usecases/testing/interpretationOf';
import { TODAY } from '@/data/usecases/testing/sampleFarm';
import type { Interpretation } from '@/domain/entities/Interpretation';
import type { InterpreterFailure } from '@/domain/entities/InterpreterFailure';
import type { PendingAudio } from '@/domain/entities/PendingAudio';
import { InterpreterErrorCode } from '@/domain/enums/InterpreterErrorCode';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import type { Result } from '@/domain/errors/Result';
import type { PendingAudioRepository } from '@/domain/repositories/PendingAudioRepository';
import type { InterpretInput, InterpreterService } from '@/domain/services/InterpreterService';
import type { ResolveRequestUseCase } from '@/domain/usecases/ResolveRequestUseCase';

type Outcome = Result<Interpretation, InterpreterFailure>;

const audios: PendingAudio[] = [
  { id: 1, uri: 'a', mimeType: 'audio/m4a', recordedOn: '2026-11-10' },
  { id: 2, uri: 'b', mimeType: 'audio/m4a', recordedOn: '2026-11-11' },
  { id: 3, uri: 'c', mimeType: 'audio/m4a', recordedOn: '2026-11-12' },
];

const repository: PendingAudioRepository = {
  list: async () => audios,
  add: async () => audios[0],
  remove: async () => undefined,
};

const resolveRequest: ResolveRequestUseCase = {
  execute: async ({ interpretation }) => ({
    kind: ResolutionKind.Question,
    question: interpretation.transcript,
  }),
};

function failing(code: InterpreterErrorCode): Outcome {
  return { ok: false, failure: { code } };
}

function retryWith(failures: Record<string, Outcome> = {}) {
  const sent: InterpretInput[] = [];
  const interpreter: InterpreterService = {
    wakeUp: () => undefined,
    interpret: async (input) => {
      sent.push(input);
      return (
        failures[input.audio.uri] ?? {
          ok: true,
          value: interpretationOf({ transcript: input.audio.uri }),
        }
      );
    },
  };
  const useCase = new RetryPendingAudiosUseCaseImpl(repository, interpreter, resolveRequest);
  return {
    sent,
    run: (alreadyResolved: number[] = []) =>
      useCase.execute({ today: TODAY, lastRecord: null, alreadyResolved }),
  };
}

describe('RetryPendingAudiosUseCase', () => {
  it('entiende los audios en el orden en que se grabaron', async () => {
    const retry = retryWith();
    const { waiting, resolved } = await retry.run();
    expect(retry.sent.map(({ audio }) => audio.uri)).toEqual(['a', 'b', 'c']);
    expect(resolved.map(({ pending }) => pending.id)).toEqual([1, 2, 3]);
    expect(waiting).toBe(0);
  });

  it('usa la fecha de grabación como día de referencia y no manda historial', async () => {
    const retry = retryWith();
    await retry.run();
    expect(retry.sent.map(({ referenceDay }) => referenceDay)).toEqual([
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
    ]);
    expect(retry.sent.every(({ history }) => history.length === 0)).toBe(true);
  });

  it('con una falla pasajera corta: ese audio y los siguientes quedan esperando', async () => {
    const retry = retryWith({ b: failing(InterpreterErrorCode.Offline) });
    const { waiting, resolved } = await retry.run();
    expect(retry.sent.map(({ audio }) => audio.uri)).toEqual(['a', 'b']);
    expect(resolved.map(({ pending }) => pending.id)).toEqual([1]);
    expect(waiting).toBe(2);
  });

  it('un audio con falla definitiva vuelve como no entendido y los demás siguen', async () => {
    const retry = retryWith({ b: failing(InterpreterErrorCode.Refused) });
    const { waiting, resolved } = await retry.run();
    expect(resolved.map(({ resolution }) => resolution.kind)).toEqual([
      ResolutionKind.Question,
      ResolutionKind.NotUnderstood,
      ResolutionKind.Question,
    ]);
    expect(waiting).toBe(0);
  });

  it('no vuelve a enviar los audios de alreadyResolved', async () => {
    const retry = retryWith();
    const { resolved } = await retry.run([1]);
    expect(retry.sent.map(({ audio }) => audio.uri)).toEqual(['b', 'c']);
    expect(resolved.map(({ pending }) => pending.id)).toEqual([2, 3]);
  });
});
