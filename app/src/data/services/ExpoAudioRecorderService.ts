import {
  AudioModule,
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  type AudioRecorder,
  type PermissionResponse,
} from 'expo-audio';

import type { RecordedAudio } from '@/domain/entities/RecordedAudio';
import { MicrophonePermission } from '@/domain/enums/MicrophonePermission';
import type { AudioRecorderService } from '@/domain/services/AudioRecorderService';
import { levelFromDecibels } from './recordingLevel';

// Es voz: un canal y 16 kHz alcanzan, y el archivo sale de unos 4 KB por segundo, que importa
// para mandarlo con poca señal. prepareToRecordAsync aplana estas opciones para Android; el
// constructor no lo hace, por eso se las pasa a los dos.
const OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
  sampleRate: 16000,
  bitRate: 32000,
  isMeteringEnabled: true,
};
const LEVEL_EVERY_MS = 150;
const MIME_TYPE = 'audio/mp4';

function toPermission({ granted, status }: PermissionResponse): MicrophonePermission {
  if (granted) {
    return MicrophonePermission.Granted;
  }
  return status === 'undetermined' ? MicrophonePermission.NotAsked : MicrophonePermission.Denied;
}

// No se llama a setAudioModeAsync: en Android no usa allowsRecording y pisa el resto del modo de
// audio, lo que puede dejar sin sonido a la voz que viene después.
export class ExpoAudioRecorderService implements AudioRecorderService {
  private recorder: AudioRecorder | null = null;
  private starting: Promise<void> = Promise.resolve();
  private levelTimer: ReturnType<typeof setInterval> | undefined;
  private heardVoice = false;

  constructor(private readonly speechLevel: number) {}

  async permission(): Promise<MicrophonePermission> {
    return toPermission(await getRecordingPermissionsAsync());
  }

  async requestPermission(): Promise<MicrophonePermission> {
    return toPermission(await requestRecordingPermissionsAsync());
  }

  async start(onLevel: (level: number) => void): Promise<void> {
    const recorder = new AudioModule.AudioRecorder(OPTIONS);
    this.recorder = recorder;
    this.heardVoice = false;
    this.starting = this.record(recorder, onLevel);
    await this.starting;
  }

  async stop(): Promise<RecordedAudio> {
    const uri = await this.finish();
    return { uri, mimeType: MIME_TYPE, heardVoice: this.heardVoice };
  }

  async cancel(): Promise<void> {
    await this.finish();
  }

  private async record(recorder: AudioRecorder, onLevel: (level: number) => void) {
    await recorder.prepareToRecordAsync(OPTIONS);
    // Si lo cortaron mientras se preparaba, ya no es el actual: no se toca.
    if (this.recorder !== recorder) {
      return;
    }
    recorder.record();
    this.levelTimer = setInterval(() => {
      if (this.recorder !== recorder) {
        return;
      }
      const level = levelFromDecibels(recorder.getStatus().metering ?? -160);
      this.heardVoice ||= level >= this.speechLevel;
      onLevel(level);
    }, LEVEL_EVERY_MS);
  }

  /** Cierra el micrófono, libera el grabador una sola vez y devuelve la ruta del archivo. */
  private async finish(): Promise<string> {
    clearInterval(this.levelTimer);
    const recorder = this.recorder;
    this.recorder = null;
    if (recorder === null) {
      return '';
    }
    await this.starting.catch(() => undefined);
    try {
      await recorder.stop();
      // La ruta se lee antes de liberarlo: después, el grabador ya no se puede usar.
      return recorder.uri ?? '';
    } finally {
      recorder.release();
    }
  }
}
