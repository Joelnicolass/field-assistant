import { useEffect, useState, type ReactNode } from 'react';

import { useDependencies } from '@/di/useDependencies';
import type { UserSettings } from '@/domain/entities/UserSettings';
import { UserSettingsContext } from './UserSettingsContext';

/**
 * Los ajustes guardados, a mano de toda la app: lo que se cambia en la pantalla de Ajustes se ve
 * enseguida, por ejemplo el tema.
 */
export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const { getUserSettings, saveUserSettings } = useDependencies();
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    void getUserSettings.execute().then(setSettings);
  }, [getUserSettings]);

  async function update(changes: Partial<UserSettings>) {
    const next = { ...(settings ?? (await getUserSettings.execute())), ...changes };
    await saveUserSettings.execute(next);
    setSettings(next);
  }

  return <UserSettingsContext value={{ settings, update }}>{children}</UserSettingsContext>;
}
