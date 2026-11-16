import { toDocument, toEntity } from '@/data/mappers/userSettingsMapper';
import type { UserSettingsLocalDataSource } from '@/domain/datasources/UserSettingsLocalDataSource';
import type { UserSettings } from '@/domain/entities/UserSettings';
import type { UserSettingsRepository } from '@/domain/repositories/UserSettingsRepository';

/** Los ajustes del archivo, con los de fábrica si no hay. Los guarda también en memoria. */
export class UserSettingsRepositoryImpl implements UserSettingsRepository {
  private current: UserSettings | null = null;

  constructor(
    private readonly dataSource: UserSettingsLocalDataSource,
    private readonly defaults: UserSettings,
  ) {}

  async load(): Promise<UserSettings> {
    this.current ??= toEntity(await this.dataSource.read(), this.defaults);
    return this.current;
  }

  async save(settings: UserSettings): Promise<void> {
    await this.dataSource.write(toDocument(settings));
    this.current = settings;
  }
}
