import type { DateText } from '@/domain/entities/DateText';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtc(date: DateText): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function fromUtc(milliseconds: number): DateText {
  return new Date(milliseconds).toISOString().slice(0, 10);
}

export function addDays(date: DateText, days: number): DateText {
  return fromUtc(toUtc(date) + days * MILLISECONDS_PER_DAY);
}

export function daysBetween(from: DateText, to: DateText): number {
  return Math.round((toUtc(to) - toUtc(from)) / MILLISECONDS_PER_DAY);
}

export function firstDayOfMonth(date: DateText): DateText {
  return `${date.slice(0, 7)}-01`;
}
