import * as Speech from 'expo-speech';

import type { SpeakerService } from '@/domain/services/SpeakerService';
import { spanishVoice } from './spanishVoice';

/** La voz del teléfono: anda sin red, por eso es la de respaldo. */
export class PhoneSpeakerService implements SpeakerService {
  private voice: Promise<string | null> | null = null;

  async speak(text: string, onStart?: () => void): Promise<void> {
    // En Android se pide la voz por su identificador: con "es-US" como idioma, expo-speech no la
    // reconoce y usa la del sistema.
    const voice = await this.chooseVoice();
    return new Promise((resolve, reject) => {
      Speech.speak(text, {
        language: 'es',
        voice: voice ?? undefined,
        onStart,
        onDone: () => resolve(),
        onStopped: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  }

  stop(): void {
    void Speech.stop();
  }

  reset(): void {}

  private chooseVoice(): Promise<string | null> {
    this.voice ??= Speech.getAvailableVoicesAsync()
      .then(spanishVoice)
      .catch(() => null);
    return this.voice;
  }
}
