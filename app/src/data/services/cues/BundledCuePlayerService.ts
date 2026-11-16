import type { AudioSource } from 'expo-audio';

import { CueKind } from '@/domain/enums/CueKind';
import type { CuePlayerService } from '@/domain/services/CuePlayerService';
import type { Cue } from './constants';

/** Reproduce un audio hasta el final; `stop` lo corta. */
export type PlayAudio = (
  source: AudioSource,
  onStart: () => void,
) => { done: Promise<void>; stop: () => void };

/** Las frases grabadas dentro de la app. De cada tipo las va turnando en orden, sin azar. */
export class BundledCuePlayerService implements CuePlayerService {
  private readonly next: Record<CueKind, number> = { [CueKind.Thinking]: 0, [CueKind.Offline]: 0 };
  private stopCurrent: () => void = () => {};

  constructor(
    private readonly cues: Record<CueKind, Cue[]>,
    private readonly playAudio: PlayAudio,
  ) {}

  async play(kind: CueKind, onStart?: (text: string) => void): Promise<string> {
    const cue = this.take(kind);
    const playing = this.playAudio(cue.source, () => onStart?.(cue.text));
    this.stopCurrent = playing.stop;
    await playing.done;
    return cue.text;
  }

  stop(): void {
    this.stopCurrent();
  }

  private take(kind: CueKind): Cue {
    const list = this.cues[kind];
    const index = this.next[kind] % list.length;
    this.next[kind] = index + 1;
    const cue = list[index];
    if (cue === undefined) {
      throw new Error(`No hay frases grabadas de tipo ${kind}`);
    }
    return cue;
  }
}
