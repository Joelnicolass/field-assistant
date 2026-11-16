import type { DateText } from '@/domain/entities/DateText';
import type { LastRecord } from '@/domain/entities/LastRecord';
import type { RainSummary } from '@/domain/entities/RainSummary';
import type { Receipt } from '@/domain/entities/Receipt';
import type { Resolution } from '@/domain/entities/Resolution';
import { RecordKind } from '@/domain/enums/RecordKind';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import type { Failure } from '@/domain/errors/Failure';
import { FarmErrorCode } from '@/domain/errors/FarmErrorCode';
import type { Result } from '@/domain/errors/Result';
import { RAIN_RANGE_WHEN, SPOKEN } from '../constants';
import { animalsText, headsText, millimetersText, rainDayPhrase } from './phrases';

// Cada tabla tiene un manejador por valor del enum, y cada uno recibe solo su variante de la unión
// (patrón de uniones correlacionadas de TypeScript, #47109): si falta un caso, no compila.
type FailureByCode = { [C in FarmErrorCode]: Extract<Failure, { code: C }> };
type FailureOf<C extends FarmErrorCode> = { [P in C]: FailureByCode[P] }[C];
type LastRecordByKind = { [K in RecordKind]: Extract<LastRecord, { kind: K }> };
type LastRecordOf<K extends RecordKind> = { [P in K]: LastRecordByKind[P] }[K];
type ReceiptByKind = { [K in RecordKind]: Extract<Receipt, { kind: K }> };
type ReceiptOf<K extends RecordKind> = { [P in K]: ReceiptByKind[P] }[K];
type ResolutionByKind = { [K in ResolutionKind]: Extract<Resolution, { kind: K }> };
type ResolutionOf<K extends ResolutionKind> = { [P in K]: ResolutionByKind[P] }[K];

const FAILURE_REPLY: { [C in FarmErrorCode]: (failure: FailureByCode[C]) => string } = {
  [FarmErrorCode.LotNotFound]: ({ lot }) => SPOKEN.failure.lotNotFound(lot),
  [FarmErrorCode.SameLot]: ({ lot }) => SPOKEN.failure.sameLot(lot),
  [FarmErrorCode.InvalidQuantity]: () => SPOKEN.failure.invalidQuantity,
  [FarmErrorCode.NotEnoughAnimals]: ({ lot, category, available, requested }) =>
    SPOKEN.failure.notEnoughAnimals(lot, animalsText(available, category), requested),
  [FarmErrorCode.InvalidMillimeters]: () => SPOKEN.failure.invalidMillimeters,
  [FarmErrorCode.FutureDate]: () => SPOKEN.failure.futureDate,
  [FarmErrorCode.NothingToCorrect]: () => SPOKEN.failure.nothingToCorrect,
};

const CORRECTION_REPLY: {
  [K in RecordKind]: (target: LastRecordByKind[K], quantity: number) => string;
} = {
  [RecordKind.Rain]: (_target, quantity) => SPOKEN.rainCorrection(millimetersText(quantity)),
  [RecordKind.Movement]: ({ movement }, quantity) =>
    SPOKEN.movementCorrection(animalsText(quantity, movement.category)),
};

const RECEIPT_REPLY: { [K in RecordKind]: (receipt: ReceiptByKind[K]) => string } = {
  [RecordKind.Rain]: ({ monthTotal }) => SPOKEN.rainNoted(millimetersText(monthTotal)),
  [RecordKind.Movement]: ({ movement, remainingInOrigin }) =>
    SPOKEN.movementNoted(animalsText(remainingInOrigin, movement.category), movement.fromLot),
};

function rainAnswerReply({ range, total }: RainSummary): string {
  const when = RAIN_RANGE_WHEN[range];
  if (total === 0) {
    return SPOKEN.rainDry(when);
  }
  return total === 1 ? SPOKEN.rainOne(when) : SPOKEN.rainMany(when, millimetersText(total));
}

const RESOLUTION_REPLY: {
  [K in ResolutionKind]: (resolution: ResolutionByKind[K], today: DateText) => string;
} = {
  [ResolutionKind.RainProposal]: ({ proposal }, today) =>
    SPOKEN.rainProposal(millimetersText(proposal.millimeters), rainDayPhrase(proposal.date, today)),
  [ResolutionKind.MovementProposal]: ({ proposal }) =>
    SPOKEN.movementProposal(
      animalsText(proposal.quantity, proposal.category),
      proposal.fromLot,
      proposal.toLot,
    ),
  [ResolutionKind.CorrectionProposal]: ({ proposal }) =>
    correctionReply(proposal.target, proposal.quantity),
  [ResolutionKind.RainAnswer]: ({ summary }) => rainAnswerReply(summary),
  [ResolutionKind.LotAnswer]: ({ stock }) => SPOKEN.lotStock(stock.lot, headsText(stock.total)),
  [ResolutionKind.Question]: ({ question }) => question ?? SPOKEN.askAgain,
  [ResolutionKind.Rejected]: ({ failure }) => failureReply(failure),
  [ResolutionKind.NotUnderstood]: () => SPOKEN.notUnderstood,
};

function correctionReply<K extends RecordKind>(target: LastRecordOf<K>, quantity: number): string {
  return CORRECTION_REPLY[target.kind](target, quantity);
}

/** Lo que la app dice por una falla de las reglas del campo. */
export function failureReply<C extends FarmErrorCode>(failure: FailureOf<C>): string {
  return FAILURE_REPLY[failure.code](failure);
}

/** Lo que la app dice al entender un pedido. */
export function spokenReply<K extends ResolutionKind>(
  resolution: ResolutionOf<K>,
  today: DateText,
): string {
  return RESOLUTION_REPLY[resolution.kind](resolution, today);
}

function receiptReply<K extends RecordKind>(receipt: ReceiptOf<K>): string {
  return RECEIPT_REPLY[receipt.kind](receipt);
}

/** Lo que la app dice después de intentar anotar: el comprobante o por qué no se pudo. */
export function confirmationReply(result: Result<Receipt>): string {
  return result.ok ? receiptReply(result.value) : failureReply(result.failure);
}
