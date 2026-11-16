import type { DateText } from '@/domain/entities/DateText';
import { FarmErrorCode } from '@/domain/errors/FarmErrorCode';
import type { Failure } from '@/domain/errors/Failure';

type RainCheck = { millimeters: number; date: DateText; today: DateText };

export function rainFailure({ millimeters, date, today }: RainCheck): Failure | null {
  if (!Number.isFinite(millimeters) || millimeters <= 0) {
    return { code: FarmErrorCode.InvalidMillimeters };
  }
  if (date > today) {
    return { code: FarmErrorCode.FutureDate };
  }
  return null;
}
