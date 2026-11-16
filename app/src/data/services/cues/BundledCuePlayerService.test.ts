import { describe, expect, it } from '@jest/globals';

import { CueKind } from '@/domain/enums/CueKind';
import { BundledCuePlayerService, type PlayAudio } from './BundledCuePlayerService';

const CUES = {
  [CueKind.Thinking]: [
    { text: 'A ver.', source: 1 },
    { text: 'Un momento.', source: 2 },
  ],
  [CueKind.Offline]: [{ text: 'Sin señal.', source: 3 }],
};

// Un reproductor de mentira: anota qué sonó y termina en el acto.
function fakeAudio() {
  const played: unknown[] = [];
  const playAudio: PlayAudio = (source, onStart) => {
    played.push(source);
    onStart();
    return { done: Promise.resolve(), stop: () => undefined };
  };
  return { played, playAudio };
}

describe('BundledCuePlayerService', () => {
  it('turna las muletillas en orden y vuelve a empezar', async () => {
    const audio = fakeAudio();
    const cues = new BundledCuePlayerService(CUES, audio.playAudio);
    const texts = [
      await cues.play(CueKind.Thinking),
      await cues.play(CueKind.Thinking),
      await cues.play(CueKind.Thinking),
    ];
    expect(texts).toEqual(['A ver.', 'Un momento.', 'A ver.']);
    expect(audio.played).toEqual([1, 2, 1]);
  });

  it('lleva la cuenta de cada tipo por separado y avisa el texto al empezar', async () => {
    const audio = fakeAudio();
    const cues = new BundledCuePlayerService(CUES, audio.playAudio);
    const started: string[] = [];
    await cues.play(CueKind.Thinking);
    await cues.play(CueKind.Offline, (text) => started.push(text));
    await cues.play(CueKind.Thinking);
    expect(started).toEqual(['Sin señal.']);
    expect(audio.played).toEqual([1, 3, 2]);
  });

  it('falla si el audio no se puede reproducir', async () => {
    const playAudio: PlayAudio = () => ({
      done: Promise.reject(new Error('roto')),
      stop: () => undefined,
    });
    const cues = new BundledCuePlayerService(CUES, playAudio);
    await expect(cues.play(CueKind.Offline)).rejects.toThrow('roto');
  });
});
