import { VoiceEvent } from './VoiceEvent';
import { VoicePhase } from './VoicePhase';

/** En lugar de una fase: la que quedó anotada como siguiente al terminar de hablar. */
export const AFTER_SPEECH = 'after_speech';

type Transition = VoicePhase | typeof AFTER_SPEECH;

// Estas dos valen en cualquier fase: un error lleva a reposo y cerrar la tarjeta no cambia la fase.
function inAnyPhase(phase: VoicePhase): Partial<Record<VoiceEvent, Transition>> {
  return { [VoiceEvent.Failed]: VoicePhase.Idle, [VoiceEvent.CardClosed]: phase };
}

/** De cada fase, a qué fase lleva cada evento. Un evento que no figura no cambia nada. */
export const voiceTransitions: Record<VoicePhase, Partial<Record<VoiceEvent, Transition>>> = {
  [VoicePhase.Idle]: {
    ...inAnyPhase(VoicePhase.Idle),
    [VoiceEvent.OrbPressed]: VoicePhase.Listening,
    [VoiceEvent.PermissionDenied]: VoicePhase.Idle,
  },
  [VoicePhase.Listening]: {
    ...inAnyPhase(VoicePhase.Listening),
    [VoiceEvent.OrbPressed]: VoicePhase.Thinking,
    [VoiceEvent.ListeningFinished]: VoicePhase.Thinking,
    [VoiceEvent.NothingHeard]: VoicePhase.Speaking,
    [VoiceEvent.WentToBackground]: VoicePhase.Idle,
  },
  [VoicePhase.Thinking]: {
    ...inAnyPhase(VoicePhase.Thinking),
    [VoiceEvent.Understood]: VoicePhase.Speaking,
    [VoiceEvent.UnderstandingFailed]: VoicePhase.Speaking,
    // Un toque para terminar sin haber hablado: no hay nada que subir.
    [VoiceEvent.NothingHeard]: VoicePhase.Speaking,
    [VoiceEvent.OrbPressed]: VoicePhase.Idle,
  },
  [VoicePhase.Speaking]: {
    ...inAnyPhase(VoicePhase.Speaking),
    [VoiceEvent.SpeechFinished]: AFTER_SPEECH,
    [VoiceEvent.OrbPressed]: AFTER_SPEECH,
  },
  [VoicePhase.Proposing]: {
    ...inAnyPhase(VoicePhase.Proposing),
    [VoiceEvent.ProposalConfirmed]: VoicePhase.Speaking,
    [VoiceEvent.ProposalCancelled]: VoicePhase.Idle,
    [VoiceEvent.OrbPressed]: VoicePhase.Listening,
    [VoiceEvent.WentToBackground]: VoicePhase.Proposing,
  },
};

/** Si la fase atiende ese evento. */
export function handlesEvent(phase: VoicePhase, event: VoiceEvent): boolean {
  return event in voiceTransitions[phase];
}

/** La fase a la que lleva el evento; si no figura, la misma. `afterSpeech` es la que sigue a hablar. */
export function nextPhase(
  phase: VoicePhase,
  event: VoiceEvent,
  afterSpeech: VoicePhase,
): VoicePhase {
  const transition = voiceTransitions[phase][event];
  if (transition === undefined) {
    return phase;
  }
  return transition === AFTER_SPEECH ? afterSpeech : transition;
}
