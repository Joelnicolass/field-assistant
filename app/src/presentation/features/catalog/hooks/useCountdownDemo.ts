import { useState } from 'react';

/** Maneja la cuenta de muestra del catálogo: la frena, la sigue y la vuelve a empezar. */
export function useCountdownDemo() {
  const [paused, setPaused] = useState(false);
  const [run, setRun] = useState(0);
  return {
    paused,
    run,
    togglePaused: () => setPaused((current) => !current),
    restart: () => {
      setPaused(false);
      setRun((current) => current + 1);
    },
  };
}
