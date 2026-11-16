export interface SpeakerService {
  /** Termina cuando deja de sonar. */
  speak(text: string, onStart?: () => void): Promise<void>;
  stop(): void;
  /** Empieza un turno nuevo: vuelve a la voz principal, si había pasado a la de respaldo. */
  reset(): void;
}
