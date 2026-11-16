import { settings } from '@/core/configs/settings';
import type { Receipt } from '@/domain/entities/Receipt';
import type { Resolution } from '@/domain/entities/Resolution';
import type { InterpreterErrorCode } from '@/domain/enums/InterpreterErrorCode';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import type { Result } from '@/domain/errors/Result';
import { SAVED_REPLY, SPOKEN } from '../hooks/constants';
import { VoiceCardKind, type VoiceCard } from './VoiceCard';
import { VoiceEvent } from './VoiceEvent';
import { VoicePhase } from './VoicePhase';
import type { VoiceState } from './VoiceState';
import { handlesEvent, nextPhase } from './voiceTransitions';

/** Lo que le llega al reducer: un evento y, si hace falta, lo que trae. */
export type VoiceAction =
  | { type: VoiceEvent.OrbPressed }
  | { type: VoiceEvent.PermissionDenied }
  | { type: VoiceEvent.ListeningFinished }
  | { type: VoiceEvent.NothingHeard }
  | { type: VoiceEvent.Understood; resolution: Resolution; transcript: string; spoken: string }
  | { type: VoiceEvent.UnderstandingFailed; code: InterpreterErrorCode }
  | { type: VoiceEvent.SpeechFinished }
  | { type: VoiceEvent.ProposalConfirmed; result: Result<Receipt>; spoken: string }
  | { type: VoiceEvent.ProposalCancelled }
  | { type: VoiceEvent.WentToBackground }
  | { type: VoiceEvent.Failed }
  | { type: VoiceEvent.CardClosed };

// Cada tabla tiene una función por valor del enum, y cada una recibe solo su variante de la unión
// (patrón de uniones correlacionadas de TypeScript, #47109): si falta un caso, no compila.
type ActionByEvent = { [E in VoiceEvent]: Extract<VoiceAction, { type: E }> };
type ActionOf<E extends VoiceEvent> = { [P in E]: ActionByEvent[P] }[E];
type ResolutionByKind = { [K in ResolutionKind]: Extract<Resolution, { kind: K }> };
type ResolutionOf<K extends ResolutionKind> = { [P in K]: ResolutionByKind[P] }[K];

export const INITIAL_VOICE_STATE: VoiceState = {
  phase: VoicePhase.Idle,
  afterSpeech: VoicePhase.Idle,
  turn: 0,
  card: null,
  subtitle: '',
  questionsInARow: 0,
  paused: false,
  lastRecord: null,
  history: [],
};

const NOT_UNDERSTOOD_CARD: VoiceCard = { kind: VoiceCardKind.NotUnderstood };

// Qué hace un toque al orbe: empezar un turno nuevo (o abandonar el que se estaba pensando) borra
// la tarjeta y las preguntas; terminar de escuchar o cortar la voz sigue con el mismo turno.
const PRESS_STARTS_OVER: Record<VoicePhase, boolean> = {
  [VoicePhase.Idle]: true,
  [VoicePhase.Listening]: false,
  [VoicePhase.Thinking]: true,
  [VoicePhase.Speaking]: false,
  [VoicePhase.Proposing]: true,
};

// A qué fase se va después de decir cada respuesta: una propuesta espera la cuenta y una pregunta
// espera la respuesta; lo demás vuelve a reposo.
const AFTER_SPEAKING: Record<ResolutionKind, VoicePhase> = {
  [ResolutionKind.RainProposal]: VoicePhase.Proposing,
  [ResolutionKind.MovementProposal]: VoicePhase.Proposing,
  [ResolutionKind.CorrectionProposal]: VoicePhase.Proposing,
  [ResolutionKind.RainAnswer]: VoicePhase.Idle,
  [ResolutionKind.LotAnswer]: VoicePhase.Idle,
  [ResolutionKind.Question]: VoicePhase.Listening,
  [ResolutionKind.Rejected]: VoicePhase.Idle,
  [ResolutionKind.NotUnderstood]: VoicePhase.Idle,
};

const CARD_OF: {
  [K in ResolutionKind]: (resolution: ResolutionByKind[K], heard: string) => VoiceCard;
} = {
  [ResolutionKind.RainProposal]: (resolution, heard) => ({
    kind: VoiceCardKind.Proposal,
    resolution,
    heard,
  }),
  [ResolutionKind.MovementProposal]: (resolution, heard) => ({
    kind: VoiceCardKind.Proposal,
    resolution,
    heard,
  }),
  [ResolutionKind.CorrectionProposal]: (resolution, heard) => ({
    kind: VoiceCardKind.Proposal,
    resolution,
    heard,
  }),
  [ResolutionKind.RainAnswer]: ({ summary }) => ({ kind: VoiceCardKind.RainAnswer, summary }),
  [ResolutionKind.LotAnswer]: ({ stock }) => ({ kind: VoiceCardKind.LotAnswer, stock }),
  [ResolutionKind.Question]: ({ question }) => ({ kind: VoiceCardKind.Question, question }),
  [ResolutionKind.Rejected]: ({ failure }) => ({ kind: VoiceCardKind.Rejected, failure }),
  [ResolutionKind.NotUnderstood]: () => NOT_UNDERSTOOD_CARD,
};

function cardOf<K extends ResolutionKind>(resolution: ResolutionOf<K>, heard: string) {
  return CARD_OF[resolution.kind](resolution, heard);
}

// Pasa a hablar: lo que se dice es el subtítulo y `afterSpeech` es a dónde se va después.
function speaking(state: VoiceState, said: Partial<VoiceState>): VoiceState {
  return { ...state, afterSpeech: VoicePhase.Idle, questionsInARow: 0, paused: false, ...said };
}

function pressOrb(state: VoiceState): VoiceState {
  return PRESS_STARTS_OVER[state.phase]
    ? {
        ...state,
        turn: state.turn + 1,
        card: null,
        subtitle: '',
        questionsInARow: 0,
        paused: false,
      }
    : state;
}

// Nadie contestó. Si había una pregunta en el aire, se descarta el pedido.
function nothingHeard(state: VoiceState): VoiceState {
  return state.questionsInARow > 0
    ? speaking(state, { card: NOT_UNDERSTOOD_CARD, subtitle: SPOKEN.discarded })
    : speaking(state, { card: null, subtitle: SPOKEN.nothingHeard });
}

function remembered(state: VoiceState, said: string, replied: string) {
  return said === ''
    ? state.history
    : [...state.history, { said, replied }].slice(-settings.historyTurns);
}

function understood(
  { resolution, transcript, spoken }: ActionByEvent[VoiceEvent.Understood],
  state: VoiceState,
): VoiceState {
  const asking = resolution.kind === ResolutionKind.Question;
  const tooManyQuestions = asking && state.questionsInARow >= settings.maxQuestionsInARow;
  const subtitle = tooManyQuestions ? SPOKEN.discarded : spoken;
  return speaking(state, {
    card: tooManyQuestions ? NOT_UNDERSTOOD_CARD : cardOf(resolution, transcript),
    subtitle,
    afterSpeech: tooManyQuestions ? VoicePhase.Idle : AFTER_SPEAKING[resolution.kind],
    questionsInARow: asking && !tooManyQuestions ? state.questionsInARow + 1 : 0,
    history: remembered(state, transcript, subtitle),
  });
}

function confirmed(
  { result, spoken }: ActionByEvent[VoiceEvent.ProposalConfirmed],
  state: VoiceState,
): VoiceState {
  if (!result.ok) {
    return speaking(state, {
      card: { kind: VoiceCardKind.Rejected, failure: result.failure },
      subtitle: spoken,
    });
  }
  return speaking(state, {
    card: { kind: VoiceCardKind.Receipt, receipt: result.value },
    subtitle: spoken,
    lastRecord: result.value,
  });
}

const HANDLERS: {
  [E in VoiceEvent]: (action: ActionByEvent[E], state: VoiceState) => VoiceState;
} = {
  [VoiceEvent.OrbPressed]: (_action, state) => pressOrb(state),
  [VoiceEvent.PermissionDenied]: (_action, state) => ({
    ...state,
    card: { kind: VoiceCardKind.MicrophoneDenied },
    subtitle: '',
  }),
  [VoiceEvent.ListeningFinished]: (_action, state) => state,
  [VoiceEvent.NothingHeard]: (_action, state) => nothingHeard(state),
  [VoiceEvent.Understood]: understood,
  [VoiceEvent.UnderstandingFailed]: ({ code }, state) =>
    speaking(state, {
      card: { kind: VoiceCardKind.AudioSaved, code },
      subtitle: SAVED_REPLY[code],
    }),
  [VoiceEvent.SpeechFinished]: (_action, state) => state,
  [VoiceEvent.ProposalConfirmed]: confirmed,
  [VoiceEvent.ProposalCancelled]: (_action, state) => ({ ...state, card: null, subtitle: '' }),
  // En segundo plano la cuenta se frena y la propuesta queda esperando un toque.
  [VoiceEvent.WentToBackground]: (_action, state) => ({
    ...state,
    paused: state.phase === VoicePhase.Proposing,
  }),
  [VoiceEvent.Failed]: (_action, state) => ({
    ...state,
    card: null,
    subtitle: SPOKEN.unexpected,
    questionsInARow: 0,
  }),
  [VoiceEvent.CardClosed]: (_action, state) => ({ ...state, card: null }),
};

function applyHandler<E extends VoiceEvent>(action: ActionOf<E>, state: VoiceState): VoiceState {
  return HANDLERS[action.type](action, state);
}

/** El turno de voz: cada evento cambia la fase según `voiceTransitions` y lo que trae. */
export function voiceReducer(state: VoiceState, action: VoiceAction): VoiceState {
  if (!handlesEvent(state.phase, action.type)) {
    return state;
  }
  const next = applyHandler(action, state);
  return { ...next, phase: nextPhase(state.phase, action.type, state.afterSpeech) };
}
