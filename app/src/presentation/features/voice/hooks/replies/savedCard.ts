import type { PendingAudio } from '@/domain/entities/PendingAudio';
import type { Resolution } from '@/domain/entities/Resolution';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import { VoiceCardKind, type VoiceCard } from '../../states/VoiceCard';

// Una función por tipo de resolución, cada una con su variante (uniones correlacionadas, #47109).
type ResolutionByKind = { [K in ResolutionKind]: Extract<Resolution, { kind: K }> };
type ResolutionOf<K extends ResolutionKind> = { [P in K]: ResolutionByKind[P] }[K];

const notUnderstood = ({ id }: PendingAudio): VoiceCard => ({
  kind: VoiceCardKind.SavedNotUnderstood,
  id,
});

// Qué muestra un audio guardado que se entendió: una propuesta espera "Anotar" o "Descartar", una
// consulta muestra su respuesta, un rechazo su explicación, y lo demás no se entendió.
const SAVED_CARD: {
  [K in ResolutionKind]: (pending: PendingAudio, resolution: ResolutionByKind[K]) => VoiceCard;
} = {
  [ResolutionKind.RainProposal]: ({ id, recordedOn }, resolution) => ({
    kind: VoiceCardKind.SavedProposal,
    id,
    resolution,
    recordedOn,
  }),
  [ResolutionKind.MovementProposal]: ({ id, recordedOn }, resolution) => ({
    kind: VoiceCardKind.SavedProposal,
    id,
    resolution,
    recordedOn,
  }),
  [ResolutionKind.CorrectionProposal]: notUnderstood,
  [ResolutionKind.RainAnswer]: ({ id }, { summary }) => ({
    kind: VoiceCardKind.SavedAnswer,
    id,
    answer: { kind: VoiceCardKind.RainAnswer, summary },
  }),
  [ResolutionKind.LotAnswer]: ({ id }, { stock }) => ({
    kind: VoiceCardKind.SavedAnswer,
    id,
    answer: { kind: VoiceCardKind.LotAnswer, stock },
  }),
  [ResolutionKind.Question]: notUnderstood,
  [ResolutionKind.Rejected]: ({ id }, { failure }) => ({
    kind: VoiceCardKind.SavedRejected,
    id,
    failure,
  }),
  [ResolutionKind.NotUnderstood]: notUnderstood,
};

/** La tarjeta de un audio guardado que ya se entendió. */
export function savedCard<K extends ResolutionKind>(
  pending: PendingAudio,
  resolution: ResolutionOf<K>,
): VoiceCard {
  return SAVED_CARD[resolution.kind](pending, resolution);
}
