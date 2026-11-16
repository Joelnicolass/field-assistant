import { createAudioPlayer } from 'expo-audio';

import type { SpeakerService } from '@/domain/services/SpeakerService';
import { appKeyHeader } from './appKeyHeader';
import { playToEnd } from './playToEnd';

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
    const playing = playToEnd(player, onStart);
    this.stopCurrent = playing.stop;
    await playing.done;
  }

  stop(): void {
    this.stopCurrent();
  }

  reset(): void {}
}
