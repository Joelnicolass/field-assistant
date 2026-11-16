import { describe, expect, it } from '@jest/globals';

import { ListeningVerdict, listeningVerdict } from './listeningVerdict';

const LIMITS = { silenceMs: 2500, noSpeechMs: 8000, maxRecordingMs: 20000 };

describe('listeningVerdict', () => {
  it('termina cuando pasan silenceMs de silencio después de haber oído voz', () => {
    const progress = { elapsedMs: 6000, msSinceVoice: 2500, heardVoice: true };
    expect(listeningVerdict(progress, LIMITS)).toBe(ListeningVerdict.Finish);
  });

  it('sigue mientras el silencio después de la voz no llegue a silenceMs', () => {
    const progress = { elapsedMs: 6000, msSinceVoice: 2000, heardVoice: true };
    expect(listeningVerdict(progress, LIMITS)).toBe(ListeningVerdict.Continue);
  });

  it('cancela cuando pasan noSpeechMs sin haber oído voz', () => {
    const progress = { elapsedMs: 8000, msSinceVoice: 8000, heardVoice: false };
    expect(listeningVerdict(progress, LIMITS)).toBe(ListeningVerdict.Cancel);
  });

  it('termina al llegar a maxRecordingMs aunque la voz no pare', () => {
    const progress = { elapsedMs: 20000, msSinceVoice: 0, heardVoice: true };
    expect(listeningVerdict(progress, LIMITS)).toBe(ListeningVerdict.Finish);
  });
});
