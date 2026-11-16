import type { DateText } from '@/domain/entities/DateText';
import type { LotStock } from '@/domain/entities/LotStock';
import type { RainSummary } from '@/domain/entities/RainSummary';
import type { Receipt } from '@/domain/entities/Receipt';
import type { Resolution } from '@/domain/entities/Resolution';
import type { InterpreterErrorCode } from '@/domain/enums/InterpreterErrorCode';
import type { ResolutionKind } from '@/domain/enums/ResolutionKind';
import type { Failure } from '@/domain/errors/Failure';

export enum VoiceCardKind {
  Proposal = 'proposal',
  Receipt = 'receipt',
  RainAnswer = 'rain_answer',
  LotAnswer = 'lot_answer',
  Question = 'question',
  Rejected = 'rejected',
  NotUnderstood = 'not_understood',
  MicrophoneDenied = 'microphone_denied',
  AudioSaved = 'audio_saved',
  SavedProposal = 'saved_proposal',
  SavedAnswer = 'saved_answer',
  SavedRejected = 'saved_rejected',
  SavedNotUnderstood = 'saved_not_understood',
}

/** Lo que la app propone anotar: una lluvia, un movimiento o la corrección del último registro. */
export type ProposalResolution = Extract<
  Resolution,
  {
    kind:
      | ResolutionKind.RainProposal
      | ResolutionKind.MovementProposal
      | ResolutionKind.CorrectionProposal;
  }
>;

export type AnswerCard =
  | { kind: VoiceCardKind.RainAnswer; summary: RainSummary }
  | { kind: VoiceCardKind.LotAnswer; stock: LotStock };

/** Las tarjetas del turno, con los datos que cada una necesita para dibujarse. */
export type VoiceCard =
  | { kind: VoiceCardKind.Proposal; resolution: ProposalResolution; heard: string }
  | { kind: VoiceCardKind.Receipt; receipt: Receipt }
  | AnswerCard
  // question null: pregunta genérica
  | { kind: VoiceCardKind.Question; question: string | null }
  | { kind: VoiceCardKind.Rejected; failure: Failure }
  | { kind: VoiceCardKind.NotUnderstood }
  | { kind: VoiceCardKind.MicrophoneDenied }
  | { kind: VoiceCardKind.AudioSaved; code: InterpreterErrorCode }
  | {
      kind: VoiceCardKind.SavedProposal;
      id: number;
      resolution: ProposalResolution;
      recordedOn: DateText;
    }
  | { kind: VoiceCardKind.SavedAnswer; id: number; answer: AnswerCard }
  | { kind: VoiceCardKind.SavedRejected; id: number; failure: Failure }
  | { kind: VoiceCardKind.SavedNotUnderstood; id: number };

/** Las tarjetas con "Anotar": la del turno y la de un audio guardado. */
export type ProposalCard = Extract<
  VoiceCard,
  { kind: VoiceCardKind.Proposal | VoiceCardKind.SavedProposal }
>;
