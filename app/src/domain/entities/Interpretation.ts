import type { DateText } from '@/domain/entities/DateText';
import type { AnimalCategory } from '@/domain/enums/AnimalCategory';
import type { IntentKind } from '@/domain/enums/IntentKind';
import type { RainRange } from '@/domain/enums/RainRange';
import type { RelativeDay } from '@/domain/enums/RelativeDay';

export type Interpretation = {
  intent: IntentKind;
  transcript: string;
  millimeters: number | null;
  day: RelativeDay | null;
  date: DateText | null;
  quantity: number | null;
  category: AnimalCategory | null;
  fromLot: number | null;
  toLot: number | null;
  lot: number | null;
  range: RainRange | null;
  question: string | null;
};
