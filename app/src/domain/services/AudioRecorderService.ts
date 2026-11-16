import type { RecordedAudio } from '@/domain/entities/RecordedAudio';
import type { MicrophonePermission } from '@/domain/enums/MicrophonePermission';

export interface AudioRecorderService {
  permission(): Promise<MicrophonePermission>;
  requestPermission(): Promise<MicrophonePermission>;
  /** `level` va de 0 a 1. */
  start(onLevel: (level: number) => void): Promise<void>;
  stop(): Promise<RecordedAudio>;
  cancel(): Promise<void>;
}
