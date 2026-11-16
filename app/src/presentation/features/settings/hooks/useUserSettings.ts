import { use } from 'react';

import {
  UserSettingsContext,
  type UserSettingsValue,
} from '../states/UserSettingsProvider/UserSettingsContext';

/** Los ajustes guardados y cómo cambiarlos. */
export function useUserSettings(): UserSettingsValue {
  return use(UserSettingsContext);
}
