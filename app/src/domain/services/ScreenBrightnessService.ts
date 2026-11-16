export interface ScreenBrightnessService {
  /** Brillo al máximo, solo mientras la app está adelante. */
  boost(): Promise<void>;
  /** Vuelve al brillo del teléfono. */
  restore(): Promise<void>;
}
