import { useEffect } from 'react';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';

/** Un reloj en milisegundos que corre de 0 a `totalMs` una vez; cada palabra calcula de ahí su avance. */
export function useRevealClock(totalMs: number) {
  const clock = useSharedValue(0);
  useEffect(() => {
    clock.set(withTiming(totalMs, { duration: totalMs, easing: Easing.linear }));
  }, [clock, totalMs]);
  return clock;
}
