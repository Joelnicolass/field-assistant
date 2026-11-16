import { Directory, File, Paths } from 'expo-file-system';

import type { PendingAudioLocalDataSource } from '@/domain/datasources/PendingAudioLocalDataSource';

const LIST_FILE_NAME = 'pending.json';
const AUDIOS_DIRECTORY_NAME = 'pending-audios';

export class FilePendingAudioLocalDataSource implements PendingAudioLocalDataSource {
  private readonly list = new File(Paths.document, LIST_FILE_NAME);
  private readonly audios = new Directory(Paths.document, AUDIOS_DIRECTORY_NAME);

  async read(): Promise<unknown | null> {
    if (!this.list.exists) {
      return null;
    }
    try {
      return JSON.parse(await this.list.text());
    } catch {
      return null;
    }
  }

  async write(document: unknown): Promise<void> {
    await this.list.write(JSON.stringify(document));
  }

  async keep(uri: string): Promise<string> {
    this.audios.create({ idempotent: true });
    const source = new File(uri);
    const kept = new File(this.audios, source.name);
    await source.copy(kept);
    return kept.uri;
  }

  async discard(uri: string): Promise<void> {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  }
}
