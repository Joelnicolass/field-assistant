import { File, Paths } from 'expo-file-system';

import type { RecordedAudio } from '@/domain/entities/RecordedAudio';
import { MicrophonePermission } from '@/domain/enums/MicrophonePermission';
import type { AudioRecorderService } from '@/domain/services/AudioRecorderService';

const LEVEL_EVERY_MS = 150;
const VOICE_MS = 2000;
const VOICE_LEVEL = 0.9;
const MIME_TYPE = 'audio/mp4';

/**
 * Graba sin micrófono: baja el audio que haya en la dirección de prueba y simula dos segundos
 * de voz. Si no hay audio, informa silencio. Sirve para probar un turno sin que nadie hable.
 */
export class ScriptedAudioRecorderService implements AudioRecorderService {
  private levelTimer: ReturnType<typeof setInterval> | undefined;
  private recorded: File | null = null;

  constructor(private readonly url: string) {}

  async permission(): Promise<MicrophonePermission> {
    return MicrophonePermission.Granted;
  }

  async requestPermission(): Promise<MicrophonePermission> {
    return MicrophonePermission.Granted;
  }

  async start(onLevel: (level: number) => void): Promise<void> {
    this.recorded = await this.download();
    const startedAt = Date.now();
    const hasVoice = this.recorded !== null;
    this.levelTimer = setInterval(() => {
      onLevel(hasVoice && Date.now() - startedAt < VOICE_MS ? VOICE_LEVEL : 0);
    }, LEVEL_EVERY_MS);
  }

  async stop(): Promise<RecordedAudio> {
    clearInterval(this.levelTimer);
    const file = this.recorded;
    return { uri: file?.uri ?? '', mimeType: MIME_TYPE, heardVoice: file !== null };
  }

  async cancel(): Promise<void> {
    clearInterval(this.levelTimer);
  }

  private async download(): Promise<File | null> {
    const destination = new File(Paths.cache, `scripted-${Date.now()}.m4a`);
    return File.downloadFileAsync(this.url, destination).catch(() => null);
  }
}
