import { describe, expect, it } from '@jest/globals';

import type { Resolution } from '@/domain/entities/Resolution';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import { SPOKEN } from '../hooks/constants';
import { VoiceCardKind } from './VoiceCard';
import { VoiceEvent } from './VoiceEvent';
import { VoicePhase } from './VoicePhase';
import { INITIAL_VOICE_STATE, voiceReducer, type VoiceAction } from './voiceReducer';
import type { VoiceState } from './VoiceState';

const QUESTION: Resolution = { kind: ResolutionKind.Question, question: '¿A qué lote?' };
const NOT_UNDERSTOOD: Resolution = { kind: ResolutionKind.NotUnderstood };

const understood = (resolution: Resolution): VoiceAction => ({
  type: VoiceEvent.Understood,
  resolution,
  transcript: 'pasé vacas',
  spoken: 'una respuesta',
});

// Lleva el reducer por un turno hasta que la app entiende y se pone a hablar.
function thinkingTurn(state: VoiceState, resolution: Resolution): VoiceState {
  const listening = voiceReducer(state, { type: VoiceEvent.OrbPressed });
  const thinking = voiceReducer(listening, { type: VoiceEvent.ListeningFinished });
  return voiceReducer(thinking, understood(resolution));
}

// Termina de decir la pregunta y de escuchar otra vez, hasta quedar pensando.
function answerQuestion(state: VoiceState, resolution: Resolution): VoiceState {
  const listening = voiceReducer(state, { type: VoiceEvent.SpeechFinished });
  const thinking = voiceReducer(listening, { type: VoiceEvent.ListeningFinished });
  return voiceReducer(thinking, understood(resolution));
}

describe('voiceReducer', () => {
  it('questionsInARow sube con cada pregunta y la app vuelve a escuchar sola', () => {
    const first = thinkingTurn(INITIAL_VOICE_STATE, QUESTION);
    expect(first.questionsInARow).toBe(1);
    expect(first.afterSpeech).toBe(VoicePhase.Listening);

    const second = answerQuestion(first, QUESTION);
    expect(second.questionsInARow).toBe(2);
  });

  it('questionsInARow vuelve a 0 con cualquier otra respuesta', () => {
    const asked = thinkingTurn(INITIAL_VOICE_STATE, QUESTION);
    const answered = answerQuestion(asked, NOT_UNDERSTOOD);
    expect(answered.questionsInARow).toBe(0);
  });

  it('a la tercera pregunta seguida descarta el pedido y muestra la tarjeta de ejemplos', () => {
    const second = answerQuestion(thinkingTurn(INITIAL_VOICE_STATE, QUESTION), QUESTION);
    const third = answerQuestion(second, QUESTION);

    expect(third.card).toEqual({ kind: VoiceCardKind.NotUnderstood });
    expect(third.subtitle).toBe(SPOKEN.discarded);
    expect(third.afterSpeech).toBe(VoicePhase.Idle);
    expect(third.questionsInARow).toBe(0);
  });

  it('si nadie contesta una pregunta descarta el pedido y muestra la tarjeta de ejemplos', () => {
    const asked = thinkingTurn(INITIAL_VOICE_STATE, QUESTION);
    const listening = voiceReducer(asked, { type: VoiceEvent.SpeechFinished });
    const silent = voiceReducer(listening, { type: VoiceEvent.NothingHeard });

    expect(silent.card).toEqual({ kind: VoiceCardKind.NotUnderstood });
    expect(silent.subtitle).toBe(SPOKEN.discarded);
  });

  it('una respuesta que llega después de cancelar el turno se ignora', () => {
    const listening = voiceReducer(INITIAL_VOICE_STATE, { type: VoiceEvent.OrbPressed });
    const thinking = voiceReducer(listening, { type: VoiceEvent.ListeningFinished });
    const cancelled = voiceReducer(thinking, { type: VoiceEvent.OrbPressed });

    expect(cancelled.phase).toBe(VoicePhase.Idle);
    expect(voiceReducer(cancelled, understood(QUESTION))).toBe(cancelled);
  });
});
