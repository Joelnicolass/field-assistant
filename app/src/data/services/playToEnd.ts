import type { AudioPlayer } from 'expo-audio';

// Cuenta qué hizo el reproductor: empezó a sonar, terminó o falló.
function watch(
  player: AudioPlayer,
  onStart: (() => void) | undefined,
  end: (error?: Error) => void,
) {
  let started = false;
  let requested = false;
  return player.addListener('playbackStatusUpdate', (status) => {
    // Se reproduce recién cuando cargó: un play() antes de eso puede perderse.
    if (status.isLoaded && !requested) {
      requested = true;
      player.play();
    }
    if (typeof status.error === 'string' && status.error !== '') {
      end(new Error(status.error));
    } else if (status.didJustFinish) {
      end();
    } else if (status.playing && !started) {
      started = true;
      onStart?.();
    }
  });
}

/**
 * Reproduce hasta que termina o falla, y después libera el reproductor. `stop` lo corta y es
 * seguro llamarlo de más. Lo usan la voz del server y las frases grabadas.
 */
export function playToEnd(player: AudioPlayer, onStart?: () => void) {
  let end: (error?: Error) => void = () => {};
  const done = new Promise<void>((resolve, reject) => {
    let finished = false;
    const subscription = watch(player, onStart, (error) => end(error));
    end = (error) => {
      if (finished) {
        return;
      }
      finished = true;
      subscription.remove();
      player.remove();
      return error === undefined ? resolve() : reject(error);
    };
  });
  return { done, stop: () => end() };
}
