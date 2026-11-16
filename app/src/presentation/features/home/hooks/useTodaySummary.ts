import { useEffect, useState } from 'react';

import { useDependencies } from '@/di/useDependencies';
import { todaySummaryView, type TodaySummaryView } from './todaySummaryView';

/** Pide el resumen de hoy al montarse y cada vez que se llama a `refresh`; `summary` es null mientras carga. */
export function useTodaySummary(): { summary: TodaySummaryView | null; refresh: () => void } {
  const { clock, getTodaySummary } = useDependencies();
  const [view, setView] = useState<TodaySummaryView | null>(null);
  const [requests, setRequests] = useState(0);

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
  }, [clock, getTodaySummary, requests]);

  return { summary: view, refresh: () => setRequests((count) => count + 1) };
}
