import { toDocument, toEntity } from '@/data/mappers/pendingAudioMapper';
import { nextId } from '@/data/usecases/rules/nextId';
import type { PendingAudioLocalDataSource } from '@/domain/datasources/PendingAudioLocalDataSource';
import type { DateText } from '@/domain/entities/DateText';
import type { PendingAudio } from '@/domain/entities/PendingAudio';
import type { RecordedAudio } from '@/domain/entities/RecordedAudio';
import type { PendingAudioRepository } from '@/domain/repositories/PendingAudioRepository';

export class PendingAudioRepositoryImpl implements PendingAudioRepository {
  constructor(private readonly dataSource: PendingAudioLocalDataSource) {}

  async list(): Promise<PendingAudio[]> {
    return toEntity(await this.dataSource.read()) ?? [];
  }

  async add(audio: RecordedAudio, recordedOn: DateText): Promise<PendingAudio> {
    const audios = await this.list();
    const pending: PendingAudio = {
      id: nextId(audios),
      uri: await this.dataSource.keep(audio.uri),
      mimeType: audio.mimeType,
      recordedOn,
    };
    await this.dataSource.write(toDocument([...audios, pending]));
    return pending;
  }

  async remove(id: number): Promise<void> {
    const audios = await this.list();
    const removed = audios.find((audio) => audio.id === id);
    if (removed === undefined) {
      return;
    }
    await this.dataSource.write(toDocument(audios.filter((audio) => audio.id !== id)));
    await this.dataSource.discard(removed.uri);
  }
}
