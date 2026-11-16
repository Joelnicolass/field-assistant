import { describe, expect, it } from '@jest/globals';

import { toDocument, toEntity } from '@/data/mappers/pendingAudioMapper';
import type { PendingAudio } from '@/domain/entities/PendingAudio';

const audios: PendingAudio[] = [
  { id: 1, uri: 'file:///audios/a.m4a', mimeType: 'audio/m4a', recordedOn: '2026-11-16' },
];

describe('pendingAudioMapper', () => {
  it('lee de vuelta un documento que armó toDocument', () => {
    expect(toEntity(JSON.parse(JSON.stringify(toDocument(audios))))).toEqual(audios);
  });

  it('rechaza un documento con un audio sin ruta', () => {
    expect(toEntity({ version: 1, audios: [{ id: 1, mimeType: 'audio/m4a' }] })).toBeNull();
  });
});
