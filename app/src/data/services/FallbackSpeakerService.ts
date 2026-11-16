import type { SpeakerService } from '@/domain/services/SpeakerService';

/**
 * Habla con la primera voz y, si falla o no empieza a sonar en `startTimeoutMs`, la corta y dice
 * lo mismo con la segunda. Una vez que pasó a la segunda, sigue con ella hasta `reset`, para no
 * mezclar dos voces en un mismo turno.
 */
export class FallbackSpeakerService implements SpeakerService {
  private onFallback = false;

  constructor(
    private readonly primary: SpeakerService,
    private readonly fallback: SpeakerService,
    private readonly startTimeoutMs: number,
  ) {}

  async speak(text: string, onStart?: () => void): Promise<void> {
    if (!this.onFallback && (await this.primaryWorked(text, onStart))) {
      return;
    }
    this.onFallback = true;
    await this.fallback.speak(text, onStart);
  }

  reset(): void {
    this.onFallback = false;
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
        console.log('[voz] la del server no empezó a tiempo: pasa a la del teléfono');
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
