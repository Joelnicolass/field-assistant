import {
  USER_SETTINGS_DOCUMENT_VERSION,
  type UserSettingsDocument,
} from '@/data/models/UserSettingsDocument';
import type { UserSettings } from '@/domain/entities/UserSettings';

const isLevel = (value: unknown) => typeof value === 'number' && value > 0 && value < 1;

function settingsOf(value: unknown): Partial<UserSettings> {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  const { version, settings } = value as Partial<UserSettingsDocument>;
  return version === USER_SETTINGS_DOCUMENT_VERSION && settings !== undefined ? settings : {};
}

/**
 * Los ajustes del archivo, uno por uno: el que falta o no se entiende queda con el de fábrica.
 * Así un archivo de antes de que existiera un ajuste sigue sirviendo.
 */
export function toEntity(document: unknown, defaults: UserSettings): UserSettings {
  const { speechLevel, autoTheme } = settingsOf(document);
  return {
    speechLevel:
      isLevel(speechLevel) && speechLevel !== undefined ? speechLevel : defaults.speechLevel,
    autoTheme: typeof autoTheme === 'boolean' ? autoTheme : defaults.autoTheme,
  };
}

export function toDocument(settings: UserSettings): UserSettingsDocument {
  return { version: USER_SETTINGS_DOCUMENT_VERSION, settings };
}
