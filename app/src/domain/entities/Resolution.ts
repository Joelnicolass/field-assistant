import type { CorrectionProposal } from '@/domain/entities/CorrectionProposal';
import type { LotStock } from '@/domain/entities/LotStock';
import type { MovementProposal } from '@/domain/entities/MovementProposal';
import type { RainProposal } from '@/domain/entities/RainProposal';
import type { RainSummary } from '@/domain/entities/RainSummary';
import type { ResolutionKind } from '@/domain/enums/ResolutionKind';
import type { Failure } from '@/domain/errors/Failure';

export type Resolution =
  | { kind: ResolutionKind.RainProposal; proposal: RainProposal }
  | { kind: ResolutionKind.MovementProposal; proposal: MovementProposal }
  | { kind: ResolutionKind.CorrectionProposal; proposal: CorrectionProposal }
  | { kind: ResolutionKind.RainAnswer; summary: RainSummary }
  | { kind: ResolutionKind.LotAnswer; stock: LotStock }
  // question null: pregunta genérica
  | { kind: ResolutionKind.Question; question: string | null }
  | { kind: ResolutionKind.Rejected; failure: Failure }
  | { kind: ResolutionKind.NotUnderstood };
