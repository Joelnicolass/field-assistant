import { restoreSystemBrightnessAsync, setBrightnessAsync } from 'expo-brightness';

import type { ScreenBrightnessService } from '@/domain/services/ScreenBrightnessService';

const FULL_BRIGHTNESS = 1;

// En Android el brillo que pide la app vale solo para su pantalla: no hace falta permiso y,
// al salir de la app, el teléfono vuelve a su brillo.
export class ExpoScreenBrightnessService implements ScreenBrightnessService {
  boost(): Promise<void> {
    return setBrightnessAsync(FULL_BRIGHTNESS);
  }

  restore(): Promise<void> {
    return restoreSystemBrightnessAsync();
  }
}
