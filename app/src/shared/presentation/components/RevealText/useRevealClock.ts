import { useEffect } from 'react';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';

/**
 * Un reloj en milisegundos del que cada palabra calcula su avance. Corre hasta `totalMs` para
 * mostrar el texto y vuelve a 0 para esconderlo: al revés, las palabras se desenfocan.
 */
export function useRevealClock(totalMs: number, hidden: boolean) {
  const clock = useSharedValue(0);
  useEffect(() => {
    const target = hidden ? 0 : totalMs;
    clock.set(
      withTiming(target, { duration: Math.abs(target - clock.get()), easing: Easing.linear }),
    );
  }, [clock, totalMs, hidden]);
  return clock;
}
