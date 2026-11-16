import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { createSoundQueue, type Sound } from './soundQueue';

const STUCK_MS = 20000;

// Un sonido de prueba que termina cuando se lo pide `finish` o cuando se lo corta.
function fakeSound(name: string, played: string[]) {
  let finish = () => {};
  const sound: Sound = {
    play: () =>
      new Promise<void>((resolve) => {
        played.push(name);
        finish = resolve;
      }),
    stop: jest.fn(() => finish()),
  };
  return { sound, finish: () => finish() };
}

describe('soundQueue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('dos sonidos pedidos seguidos suenan uno después del otro', async () => {
    const played: string[] = [];
    const queue = createSoundQueue(STUCK_MS);
    const first = fakeSound('primero', played);
    const second = fakeSound('segundo', played);

    queue.enqueue(first.sound);
    const secondDone = queue.enqueue(second.sound);
    await Promise.resolve();
    expect(played).toEqual(['primero']);

    first.finish();
    await jest.advanceTimersByTimeAsync(0);
    expect(played).toEqual(['primero', 'segundo']);
    second.finish();
    await secondDone;
  });

  it('silence corta el que suena y descarta el que esperaba', async () => {
    const played: string[] = [];
    const queue = createSoundQueue(STUCK_MS);
    const first = fakeSound('primero', played);
    const second = fakeSound('segundo', played);

    queue.enqueue(first.sound);
    const secondDone = queue.enqueue(second.sound);
    await Promise.resolve();
    queue.silence();
    await secondDone;

    expect(first.sound.stop).toHaveBeenCalled();
    expect(played).toEqual(['primero']);
  });

  it('un sonido que nunca termina no traba al siguiente', async () => {
    const played: string[] = [];
    const queue = createSoundQueue(STUCK_MS);
    const stuck: Sound = {
      play: () => new Promise<void>(() => played.push('trabado')),
      stop: jest.fn(),
    };
    const next = fakeSound('siguiente', played);

    queue.enqueue(stuck);
    queue.enqueue(next.sound);
    await jest.advanceTimersByTimeAsync(STUCK_MS);

    expect(stuck.stop).toHaveBeenCalled();
    expect(played).toEqual(['trabado', 'siguiente']);
  });
});
