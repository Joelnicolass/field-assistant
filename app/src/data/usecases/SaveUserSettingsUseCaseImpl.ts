import type { UserSettings } from '@/domain/entities/UserSettings';
import type { UserSettingsRepository } from '@/domain/repositories/UserSettingsRepository';
import type { SaveUserSettingsUseCase } from '@/domain/usecases/SaveUserSettingsUseCase';

export class SaveUserSettingsUseCaseImpl implements SaveUserSettingsUseCase {
  constructor(private readonly userSettings: UserSettingsRepository) {}

  execute(settings: UserSettings): Promise<void> {
    return this.userSettings.save(settings);
  }
}
