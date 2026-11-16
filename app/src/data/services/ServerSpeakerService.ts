import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import type { SpeakerService } from '@/domain/services/SpeakerService';
import { appKeyHeader } from './appKeyHeader';

// Cuenta qué hizo el reproductor: empezó a sonar, terminó o falló.
function watch(
  player: AudioPlayer,
  onStart: (() => void) | undefined,
  end: (error?: Error) => void,
) {
  let started = false;
  let requested = false;
  return player.addListener('playbackStatusUpdate', (status) => {
    // Se reproduce recién cuando cargó: un play() antes de eso puede perderse.
    if (status.isLoaded && !requested) {
      requested = true;
      player.play();
    }
    if (typeof status.error === 'string' && status.error !== '') {
      end(new Error(status.error));
    } else if (status.didJustFinish) {
      end();
    } else if (status.playing && !started) {
      started = true;
      onStart?.();
    }
  });
}

// Reproduce hasta que termina o falla; `stop` lo corta y es seguro llamarlo de más.
function play(player: AudioPlayer, onStart?: () => void) {
  let end: (error?: Error) => void = () => {};
  const done = new Promise<void>((resolve, reject) => {
    let finished = false;
    const subscription = watch(player, onStart, (error) => end(error));
    end = (error) => {
      if (finished) {
        return;
      }
      finished = true;
      subscription.remove();
      player.remove();
      return error === undefined ? resolve() : reject(error);
    };
  });
  return { done, stop: () => end() };
}

/** La voz del server: el reproductor lee /speak directo y suena con el primer audio que llega. */
export class ServerSpeakerService implements SpeakerService {
  private stopCurrent: () => void = () => {};

  constructor(
    private readonly serverUrl: string,
    private readonly appKey: string,
  ) {}

  async speak(text: string, onStart?: () => void): Promise<void> {
    this.stopCurrent();
    const player = createAudioPlayer({
      uri: `${this.serverUrl}/speak?text=${encodeURIComponent(text)}`,
      headers: appKeyHeader(this.appKey),
    });
    const playing = play(player, onStart);
    this.stopCurrent = playing.stop;
    await playing.done;
  }

  stop(): void {
    this.stopCurrent();
  }

  reset(): void {}
}
