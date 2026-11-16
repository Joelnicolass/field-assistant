import type { EventSubscription } from 'react-native';
import {
  loadModel,
  onFinalResult,
  onPartialResult,
  onResult,
  start,
  stop,
} from 'react-native-vosk';

import type { WakePhraseService } from '@/domain/services/WakePhraseService';
import { COMMON_WORDS, MICROPHONE_RELEASE_MS, VOSK_MODEL, VOSK_UNKNOWN } from './constants';

// La frase, sus palabras sueltas, las palabras comunes y "desconocido", sin repetir.
function grammarFor(phrase: string): string[] {
  return [...new Set([phrase, ...phrase.split(' '), ...COMMON_WORDS, VOSK_UNKNOWN])];
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Espera la frase con Vosk, dentro del teléfono: no graba archivos ni usa la red. */
export class VoskWakePhraseService implements WakePhraseService {
  private model: Promise<void> | null = null;
  private subscriptions: EventSubscription[] = [];

  constructor(private readonly phrase: string) {}

  async start(onDetected: () => void): Promise<void> {
    // El modelo se carga la primera vez y queda cargado.
    this.model ??= loadModel(VOSK_MODEL);
    await this.model;
    await start({ grammar: grammarFor(this.phrase) });
    let detected = false;
    const hear = (text: string) => {
      if (!detected && text.includes(this.phrase)) {
        detected = true;
        onDetected();
      }
    };
    this.subscriptions = [onPartialResult(hear), onResult(hear), onFinalResult(hear)];
  }

  async stop(): Promise<void> {
    this.subscriptions.forEach((subscription) => subscription.remove());
    this.subscriptions = [];
    stop();
    await wait(MICROPHONE_RELEASE_MS);
  }
}
