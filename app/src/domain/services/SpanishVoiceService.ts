/** La voz en español del teléfono, la de respaldo cuando no hay red. */
export interface SpanishVoiceService {
  isInstalled(): Promise<boolean>;
  /** Abre la pantalla del teléfono donde se instalan voces. */
  openInstaller(): Promise<void>;
}
