import type { UserSettings } from '@/domain/entities/UserSettings';

/** Los ajustes guardados; si no hay, los de fábrica. */
export interface GetUserSettingsUseCase {
  execute(): Promise<UserSettings>;
}
