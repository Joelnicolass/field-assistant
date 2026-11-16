import {
  PENDING_AUDIO_DOCUMENT_VERSION,
  type PendingAudioDocument,
} from '@/data/models/PendingAudioDocument';
import type { PendingAudio } from '@/domain/entities/PendingAudio';

function isPendingAudio(value: unknown): value is PendingAudio {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { id, uri, mimeType, recordedOn } = value as Partial<PendingAudio>;
  return (
    typeof id === 'number' &&
    typeof uri === 'string' &&
    typeof mimeType === 'string' &&
    typeof recordedOn === 'string'
  );
}

function isPendingAudioDocument(value: unknown): value is PendingAudioDocument {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { version, audios } = value as Partial<PendingAudioDocument>;
  return (
    version === PENDING_AUDIO_DOCUMENT_VERSION &&
    Array.isArray(audios) &&
    audios.every(isPendingAudio)
  );
}

export function toEntity(document: unknown): PendingAudio[] | null {
  return isPendingAudioDocument(document) ? document.audios : null;
}

export function toDocument(audios: PendingAudio[]): PendingAudioDocument {
  return { version: PENDING_AUDIO_DOCUMENT_VERSION, audios };
}
