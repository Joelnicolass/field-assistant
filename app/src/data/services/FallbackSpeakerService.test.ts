import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { SpeakerService } from '@/domain/services/SpeakerService';
import { FallbackSpeakerService } from './FallbackSpeakerService';

const START_TIMEOUT_MS = 1500;

function phoneVoice() {
  const speak = jest.fn<SpeakerService['speak']>(async (_text, onStart) => onStart?.());
  return { speak, stop: jest.fn() };
}

describe('FallbackSpeakerService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('usa la segunda voz si la primera falla', async () => {
    const server: SpeakerService = {
      speak: jest.fn(async () => Promise.reject(new Error('sin red'))),
      stop: jest.fn(),
    };
    const phone = phoneVoice();

    await new FallbackSpeakerService(server, phone, START_TIMEOUT_MS).speak('Anotado.');

    expect(phone.speak).toHaveBeenCalledWith('Anotado.', undefined);
  });

  it('usa la segunda voz si la primera no empezó a sonar a tiempo', async () => {
    let finishServer = () => {};
    const server: SpeakerService = {
      speak: jest.fn(() => new Promise<void>((resolve) => (finishServer = resolve))),
      stop: jest.fn(() => finishServer()),
    };
    const phone = phoneVoice();

    const speaking = new FallbackSpeakerService(server, phone, START_TIMEOUT_MS).speak('Anotado.');
    jest.advanceTimersByTime(START_TIMEOUT_MS);
    await speaking;

    expect(server.stop).toHaveBeenCalled();
    expect(phone.speak).toHaveBeenCalledWith('Anotado.', undefined);
  });
});
