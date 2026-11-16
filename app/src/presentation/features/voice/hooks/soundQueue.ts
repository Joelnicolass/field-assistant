export type Sound = { play: () => Promise<void>; stop: () => void };

// Espera a que el sonido termine; si no avisa en `limitMs`, lo corta para no trabar a los siguientes.
async function playWithin(sound: Sound, limitMs: number): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stuck = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      sound.stop();
      resolve();
    }, limitMs);
  });
  try {
    await Promise.race([sound.play(), stuck]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Hace sonar de a un sonido: uno pedido mientras otro suena espera a que termine. `silence` corta
 * el que suena y descarta los que esperaban. Un sonido que no avisa que terminó en `stuckMs` se
 * corta, para no trabar a los siguientes.
 */
export function createSoundQueue(stuckMs: number) {
  let chain: Promise<void> = Promise.resolve();
  let round = 0;
  let playing: Sound | null = null;

  async function playOne(sound: Sound) {
    playing = sound;
    await playWithin(sound, stuckMs).finally(() => {
      playing = null;
    });
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
      playing?.stop();
    },
  };
}
