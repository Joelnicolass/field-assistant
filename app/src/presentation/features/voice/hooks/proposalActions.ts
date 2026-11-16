import type { Dispatch, RefObject } from 'react';

import type { useDependencies } from '@/di/useDependencies';
import type { DateText } from '@/domain/entities/DateText';
import type { Receipt } from '@/domain/entities/Receipt';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import type { Result } from '@/domain/errors/Result';
import { VoiceCardKind, type ProposalCard, type ProposalResolution } from '../states/VoiceCard';
import { VoiceEvent } from '../states/VoiceEvent';
import { VoicePhase } from '../states/VoicePhase';
import type { VoiceAction } from '../states/voiceReducer';
import type { VoiceState } from '../states/VoiceState';
import { confirmationReply } from './replies/spokenReply';

type Services = Pick<
  ReturnType<typeof useDependencies>,
  'clock' | 'registerRain' | 'registerMovement' | 'applyCorrection'
>;

export type ProposalContext = {
  state: VoiceState;
  dispatch: Dispatch<VoiceAction>;
  fail: (error?: unknown) => void;
  silence: () => void;
  onRecorded: () => void;
  /** Saca de la cola un audio guardado que se acaba de anotar. */
  discard: (id: number) => Promise<void>;
  services: Services;
  /** Verdadero desde que empieza a escribir hasta que termina: ahí ya no se puede cancelar. */
  writing: RefObject<boolean>;
};

// Cada tipo de propuesta usa su caso de uso; las dos uniones se leen por su `kind` (#47109).
type ProposalKind = ProposalResolution['kind'];
type ProposalByKind = { [K in ProposalKind]: Extract<ProposalResolution, { kind: K }> };
type ProposalOf<K extends ProposalKind> = { [P in K]: ProposalByKind[P] }[K];

function register<K extends ProposalKind>(
  resolution: ProposalOf<K>,
  today: DateText,
  services: Services,
): Promise<Result<Receipt>> {
  const writers: {
    [P in ProposalKind]: (resolution: ProposalByKind[P]) => Promise<Result<Receipt>>;
  } = {
    [ResolutionKind.RainProposal]: ({ proposal }) =>
      services.registerRain.execute({ proposal, today }),
    [ResolutionKind.MovementProposal]: ({ proposal }) =>
      services.registerMovement.execute({ proposal, today }),
    [ResolutionKind.CorrectionProposal]: ({ proposal }) =>
      services.applyCorrection.execute({ proposal, today }),
  };
  return writers[resolution.kind](resolution);
}

// Un toque a "Anotar" o "Cancelar" mientras la app todavía dice la propuesta la corta.
function skipSpeech({ state, silence, dispatch }: ProposalContext) {
  if (state.phase === VoicePhase.Speaking) {
    silence();
    dispatch({ type: VoiceEvent.SpeechFinished });
  }
}

/**
 * Anota la propuesta: el único lugar de la presentación que escribe en el campo. Lo anotado
 * siempre termina en su comprobante, aunque en el medio se toque "Cancelar".
 */
export function confirmProposal(card: ProposalCard, context: ProposalContext): Promise<void> {
  const { writing, services, dispatch, onRecorded, discard, fail } = context;
  if (writing.current) {
    return Promise.resolve();
  }
  writing.current = true;
  skipSpeech(context);
  return register(card.resolution, services.clock.today(), services)
    .then((result) => {
      if (result.ok) {
        onRecorded();
        if (card.kind === VoiceCardKind.SavedProposal) {
          void discard(card.id);
        }
      }
      dispatch({ type: VoiceEvent.ProposalConfirmed, result, spoken: confirmationReply(result) });
    })
    .catch(fail)
    .finally(() => {
      writing.current = false;
    });
}

/** Descarta la propuesta, salvo que ya se haya empezado a anotar. */
export function cancelProposal(context: ProposalContext) {
  if (context.writing.current) {
    return;
  }
  skipSpeech(context);
  context.dispatch({ type: VoiceEvent.ProposalCancelled });
}
