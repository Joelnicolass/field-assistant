import type { UserSettings } from '@/domain/entities/UserSettings';

/** Guarda los ajustes: valen desde la próxima grabación. */
export interface SaveUserSettingsUseCase {
  execute(settings: UserSettings): Promise<void>;
}
