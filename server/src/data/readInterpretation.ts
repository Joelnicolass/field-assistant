import {
  CATEGORIES,
  DAYS,
  INTENTS,
  RANGES,
  type Interpretation,
} from '../domain/Interpretation.ts';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function oneOf<T extends string>(values: readonly T[], value: unknown): value is T {
  return values.some((each) => each === value);
}

const isNumberOrNull = (value: unknown) => value === null || typeof value === 'number';
const isTextOrNull = (value: unknown) => value === null || typeof value === 'string';

/** Comprueba la respuesta del modelo: si algo no cumple la forma, devuelve null. */
export function readInterpretation(value: unknown): Interpretation | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const candidate = value as Record<keyof Interpretation, unknown>;
  const valid =
    oneOf(INTENTS, candidate.intent) &&
    typeof candidate.transcript === 'string' &&
    [
      candidate.millimeters,
      candidate.quantity,
      candidate.fromLot,
      candidate.toLot,
      candidate.lot,
    ].every(isNumberOrNull) &&
    (candidate.day === null || oneOf(DAYS, candidate.day)) &&
    (candidate.category === null || oneOf(CATEGORIES, candidate.category)) &&
    (candidate.range === null || oneOf(RANGES, candidate.range)) &&
    (candidate.date === null ||
      (typeof candidate.date === 'string' && DATE.test(candidate.date))) &&
    isTextOrNull(candidate.question);
  return valid ? (candidate as Interpretation) : null;
}
