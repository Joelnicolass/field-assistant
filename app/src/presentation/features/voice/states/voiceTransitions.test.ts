import { describe, expect, it } from '@jest/globals';

import { VoiceEvent } from './VoiceEvent';
import { VoicePhase } from './VoicePhase';
import { nextPhase, voiceTransitions } from './voiceTransitions';

const PHASES = Object.values(VoicePhase);

describe('voiceTransitions', () => {
  it('de toda fase se puede volver a reposo', () => {
    PHASES.forEach((phase) => {
      const reachesIdle = Object.values(VoiceEvent).some(
        (event) => nextPhase(phase, event, VoicePhase.Idle) === VoicePhase.Idle,
      );
      expect(reachesIdle).toBe(true);
    });
  });

  it('Failed lleva a reposo desde cualquier fase', () => {
    PHASES.forEach((phase) => {
      expect(nextPhase(phase, VoiceEvent.Failed, VoicePhase.Proposing)).toBe(VoicePhase.Idle);
    });
  });

  it('un evento que no figura no cambia la fase', () => {
    expect(VoiceEvent.Understood in voiceTransitions[VoicePhase.Idle]).toBe(false);
    expect(nextPhase(VoicePhase.Idle, VoiceEvent.Understood, VoicePhase.Idle)).toBe(
      VoicePhase.Idle,
    );
    expect(nextPhase(VoicePhase.Listening, VoiceEvent.SpeechFinished, VoicePhase.Idle)).toBe(
      VoicePhase.Listening,
    );
  });
});
