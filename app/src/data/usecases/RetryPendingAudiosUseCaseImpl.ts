import type { DateText } from '@/domain/entities/DateText';
import type { LastRecord } from '@/domain/entities/LastRecord';
import type { PendingAudio } from '@/domain/entities/PendingAudio';
import type { Resolution } from '@/domain/entities/Resolution';
import type { ResolvedAudio } from '@/domain/entities/ResolvedAudio';
import { InterpreterErrorCode } from '@/domain/enums/InterpreterErrorCode';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import type { PendingAudioRepository } from '@/domain/repositories/PendingAudioRepository';
import type { InterpreterService } from '@/domain/services/InterpreterService';
import type { ResolveRequestUseCase } from '@/domain/usecases/ResolveRequestUseCase';
import type {
  RetryPendingAudiosUseCase,
  RetryPendingAudiosUseCaseInput,
  RetryPendingAudiosUseCaseOutput,
} from '@/domain/usecases/RetryPendingAudiosUseCase';

const IS_TEMPORARY: Record<InterpreterErrorCode, boolean> = {
  [InterpreterErrorCode.Offline]: true,
  [InterpreterErrorCode.Timeout]: true,
  [InterpreterErrorCode.Server]: true,
  [InterpreterErrorCode.Refused]: false,
  [InterpreterErrorCode.Unreadable]: false,
};

export class RetryPendingAudiosUseCaseImpl implements RetryPendingAudiosUseCase {
  constructor(
    private readonly pendingAudios: PendingAudioRepository,
    private readonly interpreter: InterpreterService,
    private readonly resolveRequest: ResolveRequestUseCase,
  ) {}

  async execute({
    today,
    lastRecord,
    alreadyResolved,
    limit,
  }: RetryPendingAudiosUseCaseInput): Promise<RetryPendingAudiosUseCaseOutput> {
    const queue = (await this.pendingAudios.list()).filter(
      ({ id }) => !alreadyResolved.includes(id),
    );
    const resolved: ResolvedAudio[] = [];
    for (const pending of queue.slice(0, limit)) {
      const resolution = await this.interpretOne(pending, today, lastRecord);
      if (resolution === null) {
        break;
      }
      resolved.push({ pending, resolution });
    }
    return { waiting: queue.length - resolved.length, resolved };
  }

  /** Devuelve `null` si la falla es pasajera: el audio sigue esperando. */
  private async interpretOne(
    pending: PendingAudio,
    today: DateText,
    lastRecord: LastRecord | null,
  ): Promise<Resolution | null> {
    const result = await this.interpreter.interpret({
      audio: pending,
      history: [],
      referenceDay: pending.recordedOn,
    });
    if (!result.ok) {
      return IS_TEMPORARY[result.failure.code] ? null : { kind: ResolutionKind.NotUnderstood };
    }
    return this.resolveRequest.execute({
      interpretation: result.value,
      referenceDay: pending.recordedOn,
      today,
      lastRecord,
    });
  }
}
