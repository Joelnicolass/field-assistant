import { addDays } from '@/data/usecases/rules/dates';
import type { DateText } from '@/domain/entities/DateText';
import type { Interpretation } from '@/domain/entities/Interpretation';
import { RelativeDay } from '@/domain/enums/RelativeDay';

const DAY_OFFSET: Record<RelativeDay, number> = {
  [RelativeDay.Today]: 0,
  [RelativeDay.Yesterday]: -1,
};

/** La fecha dicha; si no hubo, el día de referencia, o el anterior si se dijo "ayer". */
export function rainDate({ date, day }: Interpretation, referenceDay: DateText): DateText {
  return date ?? addDays(referenceDay, DAY_OFFSET[day ?? RelativeDay.Today]);
}
