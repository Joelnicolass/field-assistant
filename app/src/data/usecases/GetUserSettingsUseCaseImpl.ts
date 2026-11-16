import type { UserSettings } from '@/domain/entities/UserSettings';
import type { UserSettingsRepository } from '@/domain/repositories/UserSettingsRepository';
import type { GetUserSettingsUseCase } from '@/domain/usecases/GetUserSettingsUseCase';

export class GetUserSettingsUseCaseImpl implements GetUserSettingsUseCase {
  constructor(private readonly userSettings: UserSettingsRepository) {}

  execute(): Promise<UserSettings> {
    return this.userSettings.load();
  }
}
