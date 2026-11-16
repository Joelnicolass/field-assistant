import {
  correctionData,
  lotQueryData,
  movementData,
  rainData,
  rainQueryData,
} from '@/data/usecases/rules/requiredData';
import { rainDate } from '@/data/usecases/rules/requestDates';
import type { Resolution } from '@/domain/entities/Resolution';
import { IntentKind } from '@/domain/enums/IntentKind';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import type { Result } from '@/domain/errors/Result';
import type { GetLotStockUseCase } from '@/domain/usecases/GetLotStockUseCase';
import type { GetRainSummaryUseCase } from '@/domain/usecases/GetRainSummaryUseCase';
import type { PreviewCorrectionUseCase } from '@/domain/usecases/PreviewCorrectionUseCase';
import type { PreviewMovementUseCase } from '@/domain/usecases/PreviewMovementUseCase';
import type { PreviewRainUseCase } from '@/domain/usecases/PreviewRainUseCase';
import type {
  ResolveRequestUseCase,
  ResolveRequestUseCaseInput,
} from '@/domain/usecases/ResolveRequestUseCase';

type Resolver = (input: ResolveRequestUseCaseInput) => Promise<Resolution>;

const NOT_UNDERSTOOD: Resolution = { kind: ResolutionKind.NotUnderstood };
const MISSING_DATA: Resolution = { kind: ResolutionKind.Question, question: null };

function fromResult<T>(result: Result<T>, accept: (value: T) => Resolution): Resolution {
  return result.ok
    ? accept(result.value)
    : { kind: ResolutionKind.Rejected, failure: result.failure };
}

export class ResolveRequestUseCaseImpl implements ResolveRequestUseCase {
  constructor(
    private readonly previewRain: PreviewRainUseCase,
    private readonly previewMovement: PreviewMovementUseCase,
    private readonly getRainSummary: GetRainSummaryUseCase,
    private readonly getLotStock: GetLotStockUseCase,
    private readonly previewCorrection: PreviewCorrectionUseCase,
  ) {}

  private readonly resolvers: Record<Exclude<IntentKind, IntentKind.Unknown>, Resolver> = {
    [IntentKind.RegisterRain]: (input) => this.resolveRain(input),
    [IntentKind.MoveAnimals]: (input) => this.resolveMovement(input),
    [IntentKind.RainQuery]: (input) => this.resolveRainQuery(input),
    [IntentKind.LotQuery]: (input) => this.resolveLotQuery(input),
    [IntentKind.Correct]: (input) => this.resolveCorrection(input),
  };

  async execute(input: ResolveRequestUseCaseInput): Promise<Resolution> {
    const { intent, question } = input.interpretation;
    if (intent === IntentKind.Unknown) {
      return NOT_UNDERSTOOD;
    }
    if (question !== null) {
      return { kind: ResolutionKind.Question, question };
    }
    return this.resolvers[intent](input);
  }

  private async resolveRain({
    interpretation,
    referenceDay,
    today,
  }: ResolveRequestUseCaseInput): Promise<Resolution> {
    const data = rainData(interpretation);
    if (data === null) {
      return MISSING_DATA;
    }
    const result = await this.previewRain.execute({
      ...data,
      date: rainDate(interpretation, referenceDay),
      today,
    });
    return fromResult(result, (proposal) => ({ kind: ResolutionKind.RainProposal, proposal }));
  }

  private async resolveMovement({
    interpretation,
    referenceDay,
    today,
  }: ResolveRequestUseCaseInput): Promise<Resolution> {
    const data = movementData(interpretation);
    if (data === null) {
      return MISSING_DATA;
    }
    const result = await this.previewMovement.execute({ ...data, date: referenceDay, today });
    return fromResult(result, (proposal) => ({ kind: ResolutionKind.MovementProposal, proposal }));
  }

  private async resolveRainQuery({
    interpretation,
    today,
  }: ResolveRequestUseCaseInput): Promise<Resolution> {
    const data = rainQueryData(interpretation);
    if (data === null) {
      return MISSING_DATA;
    }
    const summary = await this.getRainSummary.execute({ ...data, today });
    return { kind: ResolutionKind.RainAnswer, summary };
  }

  private async resolveLotQuery({
    interpretation,
  }: ResolveRequestUseCaseInput): Promise<Resolution> {
    const data = lotQueryData(interpretation);
    if (data === null) {
      return MISSING_DATA;
    }
    const result = await this.getLotStock.execute(data);
    return fromResult(result, (stock) => ({ kind: ResolutionKind.LotAnswer, stock }));
  }

  private async resolveCorrection({
    interpretation,
    lastRecord,
  }: ResolveRequestUseCaseInput): Promise<Resolution> {
    const data = correctionData(interpretation);
    if (data === null) {
      return MISSING_DATA;
    }
    const result = await this.previewCorrection.execute({ target: lastRecord, ...data });
    return fromResult(result, (proposal) => ({
      kind: ResolutionKind.CorrectionProposal,
      proposal,
    }));
  }
}
