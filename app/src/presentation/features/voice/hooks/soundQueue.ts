export type Sound = { play: () => Promise<void>; stop: () => void };

/**
 * Hace sonar de a un sonido: uno pedido mientras otro suena espera a que termine. `silence` corta
 * el que suena y descarta los que esperaban. Un sonido que no avisa que terminó en `stuckMs` se
 * corta, para no trabar a los siguientes.
 */
export function createSoundQueue(stuckMs: number) {
  let chain: Promise<void> = Promise.resolve();
  let round = 0;
  let stopCurrent: () => void = () => {};

  async function playOne(sound: Sound) {
    stopCurrent = sound.stop;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stuck = new Promise<void>((resolve) => {
      timer = setTimeout(() => {
        sound.stop();
        resolve();
      }, stuckMs);
    });
    try {
      await Promise.race([sound.play(), stuck]);
    } finally {
      clearTimeout(timer);
      stopCurrent = () => {};
    }
  }

  return {
    /** Pone un sonido en la cola; termina cuando sonó o cuando se descartó. */
    enqueue(sound: Sound): Promise<void> {
      const myRound = round;
      const next = chain.then(() => (myRound === round ? playOne(sound) : undefined));
      chain = next.catch(() => undefined);
      return next;
    },
    silence(): void {
      round += 1;
      stopCurrent();
    },
  };
}
