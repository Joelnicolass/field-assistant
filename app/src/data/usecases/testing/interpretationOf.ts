import type { Interpretation } from '@/domain/entities/Interpretation';
import { IntentKind } from '@/domain/enums/IntentKind';

export function interpretationOf(fields: Partial<Interpretation>): Interpretation {
  return {
    intent: IntentKind.Unknown,
    transcript: '',
    millimeters: null,
    day: null,
    date: null,
    quantity: null,
    category: null,
    fromLot: null,
    toLot: null,
    lot: null,
    range: null,
    question: null,
    ...fields,
  };
}
