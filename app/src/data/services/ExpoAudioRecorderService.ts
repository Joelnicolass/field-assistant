import {
  AudioModule,
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type AudioRecorder,
  type PermissionResponse,
} from 'expo-audio';

import type { RecordedAudio } from '@/domain/entities/RecordedAudio';
import { MicrophonePermission } from '@/domain/enums/MicrophonePermission';
import type { AudioRecorderService } from '@/domain/services/AudioRecorderService';
import { levelFromDecibels } from './recordingLevel';

// Es voz: un canal y 16 kHz alcanzan, y el archivo sale de unos 4 KB por segundo, que importa
// para mandarlo con poca señal.
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

export class ExpoAudioRecorderService implements AudioRecorderService {
  private recorder: AudioRecorder | null = null;
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
    await setAudioModeAsync({ allowsRecording: true });
    const recorder = new AudioModule.AudioRecorder(OPTIONS);
    this.recorder = recorder;
    this.heardVoice = false;
    await recorder.prepareToRecordAsync();
    recorder.record();
    this.levelTimer = setInterval(() => {
      const level = levelFromDecibels(recorder.getStatus().metering ?? -160);
      this.heardVoice ||= level >= this.speechLevel;
      onLevel(level);
    }, LEVEL_EVERY_MS);
  }

  async stop(): Promise<RecordedAudio> {
    const recorder = await this.finish();
    return { uri: recorder?.uri ?? '', mimeType: MIME_TYPE, heardVoice: this.heardVoice };
  }

  async cancel(): Promise<void> {
    await this.finish();
  }

  private async finish(): Promise<AudioRecorder | null> {
    clearInterval(this.levelTimer);
    const recorder = this.recorder;
    this.recorder = null;
    if (recorder === null) {
      return null;
    }
    await recorder.stop();
    // Para que la voz de la app vuelva a sonar por el parlante y no por el auricular.
    await setAudioModeAsync({ allowsRecording: false });
    // Un grabador creado a mano no se libera solo.
    recorder.release();
    return recorder;
  }
}
