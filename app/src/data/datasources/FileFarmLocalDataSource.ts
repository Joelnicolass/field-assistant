import { File, Paths } from 'expo-file-system';

import type { FarmLocalDataSource } from '@/domain/datasources/FarmLocalDataSource';

const FILE_NAME = 'farm.json';

export class FileFarmLocalDataSource implements FarmLocalDataSource {
  private readonly file = new File(Paths.document, FILE_NAME);

  async read(): Promise<unknown | null> {
    if (!this.file.exists) {
      return null;
    }
    try {
      return JSON.parse(await this.file.text());
    } catch {
      return null;
    }
  }

  async write(document: unknown): Promise<void> {
    await this.file.write(JSON.stringify(document));
  }
}
