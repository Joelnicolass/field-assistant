import type { InterpretationResponse } from '@/data/models/InterpretationResponse';
import type { Interpretation } from '@/domain/entities/Interpretation';
import { AnimalCategory } from '@/domain/enums/AnimalCategory';
import { IntentKind } from '@/domain/enums/IntentKind';
import { RainRange } from '@/domain/enums/RainRange';
import { RelativeDay } from '@/domain/enums/RelativeDay';

function isNumberOrNull(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isOneOf<T extends string>(options: Record<string, T>, value: unknown): value is T {
  return Object.values(options).includes(value as T);
}

function isOneOfOrNull<T extends string>(
  options: Record<string, T>,
  value: unknown,
): value is T | null {
  return value === null || isOneOf(options, value);
}

function isInterpretation(fields: Partial<InterpretationResponse>): fields is Interpretation {
  return (
    isOneOf(IntentKind, fields.intent) &&
    typeof fields.transcript === 'string' &&
    isNumberOrNull(fields.millimeters) &&
    isOneOfOrNull(RelativeDay, fields.day) &&
    isStringOrNull(fields.date) &&
    isNumberOrNull(fields.quantity) &&
    isOneOfOrNull(AnimalCategory, fields.category) &&
    isNumberOrNull(fields.fromLot) &&
    isNumberOrNull(fields.toLot) &&
    isNumberOrNull(fields.lot) &&
    isOneOfOrNull(RainRange, fields.range) &&
    isStringOrNull(fields.question)
  );
}

export function toEntity(response: unknown): Interpretation | null {
  if (typeof response !== 'object' || response === null) {
    return null;
  }
  const fields = response as Partial<InterpretationResponse>;
  return isInterpretation(fields) ? fields : null;
}
