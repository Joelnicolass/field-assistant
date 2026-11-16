import { settings } from '@/core/configs/settings';
import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';

/** El tema para esta luz: claro con mucha, oscuro con poca y, entre los dos umbrales, el que estaba. */
export function nextThemeMode(lux: number, current: ThemeMode): ThemeMode {
  if (lux > settings.lightAboveLux) {
    return ThemeMode.Light;
  }
  if (lux < settings.darkBelowLux) {
    return ThemeMode.Dark;
  }
  return current;
}

/** Si el brillo va al máximo: sí al sol, no a la sombra y, entre los dos umbrales, lo que estaba. */
export function nextBrightness(lux: number, boosted: boolean): boolean {
  if (lux > settings.sunAboveLux) {
    return true;
  }
  if (lux < settings.sunBelowLux) {
    return false;
  }
  return boosted;
}
