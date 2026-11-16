import type { UserSettings } from '@/domain/entities/UserSettings';

export const USER_SETTINGS_DOCUMENT_VERSION = 1;

export type UserSettingsDocument = {
  version: typeof USER_SETTINGS_DOCUMENT_VERSION;
  settings: UserSettings;
};
