import type { UserSettings } from '@/domain/entities/UserSettings';

export interface UserSettingsRepository {
  load(): Promise<UserSettings>;
  save(settings: UserSettings): Promise<void>;
}
