import type { WakePhraseService } from '@/domain/services/WakePhraseService';

const CHECK_EVERY_MS = 1000;

/**
 * "Oye" la frase cuando aparece un audio en la dirección de prueba: sirve para probar manos libres
 * sin que nadie hable. Si el audio ya estaba al empezar, espera a que lo saquen y lo vuelvan a poner.
 */
export class ScriptedWakePhraseService implements WakePhraseService {
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(private readonly url: string) {}

  async start(onDetected: () => void): Promise<void> {
    let wasThere = await this.audioIsThere();
    this.timer = setInterval(() => {
      void this.audioIsThere().then((isThere) => {
        if (isThere && !wasThere) {
          clearInterval(this.timer);
          onDetected();
        }
        wasThere = isThere;
      });
    }, CHECK_EVERY_MS);
  }

  async stop(): Promise<void> {
    clearInterval(this.timer);
  }

  private audioIsThere(): Promise<boolean> {
    return fetch(this.url, { method: 'HEAD' }).then(
      (response) => response.ok,
      () => false,
    );
  }
}
