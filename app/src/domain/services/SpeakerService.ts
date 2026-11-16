export interface SpeakerService {
  /** Termina cuando deja de sonar. */
  speak(text: string, onStart?: () => void): Promise<void>;
  stop(): void;
}
