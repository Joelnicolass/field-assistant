import type { PendingAudio } from '@/domain/entities/PendingAudio';

export const PENDING_AUDIO_DOCUMENT_VERSION = 1;

export type PendingAudioDocument = {
  version: typeof PENDING_AUDIO_DOCUMENT_VERSION;
  audios: PendingAudio[];
};
