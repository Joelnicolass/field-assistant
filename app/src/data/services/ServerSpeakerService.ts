import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

import type { SpeakerService } from '@/domain/services/SpeakerService';

/** La voz del server: pide el mp3 a /speak, lo guarda en la caché y lo reproduce. */
export class ServerSpeakerService implements SpeakerService {
  private stopCurrent: () => void = () => {};

  constructor(private readonly serverUrl: string) {}

  async speak(text: string, onStart?: () => void): Promise<void> {
    this.stopCurrent();
    const request = new AbortController();
    this.stopCurrent = () => request.abort();
    const response = await fetch(`${this.serverUrl}/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: request.signal,
    });
    if (!response.ok) {
      throw new Error(`El server contestó ${response.status}`);
    }
    // El reproductor no puede hacer un POST: el audio se guarda en un archivo y se reproduce de ahí.
    const file = new File(Paths.cache, `speech-${Date.now()}.mp3`);
    await file.write(await response.arrayBuffer());
    if (request.signal.aborted) {
      file.delete();
      return;
    }
    return this.play(file, onStart);
  }

  stop(): void {
    this.stopCurrent();
  }

  private play(file: File, onStart?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const player: AudioPlayer = createAudioPlayer({ uri: file.uri });
      let started = false;
      const finish = (error?: Error) => {
        subscription.remove();
        player.remove();
        file.delete();
        this.stopCurrent = () => {};
        return error === undefined ? resolve() : reject(error);
      };
      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          finish();
        } else if (status.playing && !started) {
          started = true;
          onStart?.();
        }
      });
      this.stopCurrent = () => finish();
      player.play();
    });
  }
}
