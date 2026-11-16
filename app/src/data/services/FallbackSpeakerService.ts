import type { SpeakerService } from '@/domain/services/SpeakerService';

/**
 * Habla con la primera voz y, si falla o no empieza a sonar en `startTimeoutMs`, la corta y dice
 * lo mismo con la segunda.
 */
export class FallbackSpeakerService implements SpeakerService {
  constructor(
    private readonly primary: SpeakerService,
    private readonly fallback: SpeakerService,
    private readonly startTimeoutMs: number,
  ) {}

  async speak(text: string, onStart?: () => void): Promise<void> {
    if (await this.primaryWorked(text, onStart)) {
      return;
    }
    await this.fallback.speak(text, onStart);
  }

  stop(): void {
    this.primary.stop();
    this.fallback.stop();
  }

  private async primaryWorked(text: string, onStart?: () => void): Promise<boolean> {
    let started = false;
    let late = false;
    const timer = setTimeout(() => {
      late = !started;
      if (late) {
        this.primary.stop();
      }
    }, this.startTimeoutMs);
    try {
      await this.primary.speak(text, () => {
        started = true;
        onStart?.();
      });
      return !late;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }
}
