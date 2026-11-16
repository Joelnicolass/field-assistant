import { useEffect, useState } from 'react';

import { useDependencies } from '@/di/useDependencies';
import { todaySummaryView, type TodaySummaryView } from './todaySummaryView';

/** Pide el resumen de hoy al montarse y lo entrega listo para dibujar; null mientras carga. */
export function useTodaySummary(): TodaySummaryView | null {
  const { clock, getTodaySummary } = useDependencies();
  const [view, setView] = useState<TodaySummaryView | null>(null);

  useEffect(() => {
    let active = true;
    getTodaySummary.execute({ today: clock.today() }).then((summary) => {
      if (active) {
        setView(todaySummaryView(summary));
      }
    });
    return () => {
      active = false;
    };
  }, [clock, getTodaySummary]);

  return view;
}
