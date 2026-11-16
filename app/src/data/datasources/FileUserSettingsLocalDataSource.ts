import { File, Paths } from 'expo-file-system';

import type { UserSettingsLocalDataSource } from '@/domain/datasources/UserSettingsLocalDataSource';

const FILE_NAME = 'settings.json';

export class FileUserSettingsLocalDataSource implements UserSettingsLocalDataSource {
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
