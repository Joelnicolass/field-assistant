import { createContext } from 'react';

import type { UserSettings } from '@/domain/entities/UserSettings';

export type UserSettingsValue = {
  /** null mientras se leen del archivo. */
  settings: UserSettings | null;
  /** Cambia algunos ajustes, los guarda y los avisa a toda la app. */
  update: (changes: Partial<UserSettings>) => Promise<void>;
};

export const UserSettingsContext = createContext<UserSettingsValue>({
  settings: null,
  update: async () => undefined,
});
