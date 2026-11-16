export interface WakePhraseService {
  /** Escucha hasta oír la frase de manos libres; avisa una sola vez. */
  start(onDetected: () => void): Promise<void>;
  /** Termina cuando el micrófono quedó libre. */
  stop(): Promise<void>;
}
