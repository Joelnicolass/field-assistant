import type { DateText } from '@/domain/entities/DateText';
import type { ClockService } from '@/domain/services/ClockService';

function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

export class SystemClockService implements ClockService {
  today(): DateText {
    const now = new Date();
    return `${now.getFullYear()}-${twoDigits(now.getMonth() + 1)}-${twoDigits(now.getDate())}`;
  }
}
