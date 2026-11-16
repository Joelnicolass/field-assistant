import type { DateText } from '@/domain/entities/DateText';

export interface ClockService {
  today(): DateText;
}
