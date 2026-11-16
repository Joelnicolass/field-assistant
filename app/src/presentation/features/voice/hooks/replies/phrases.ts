import type { DateText } from '@/domain/entities/DateText';
import type { AnimalCategory } from '@/domain/enums/AnimalCategory';
import { withThousands } from '@/shared/presentation/format/withThousands';
import {
  CATEGORY_NAMES,
  DAY_HINT_PREFIX,
  MONTHS,
  RAIN_DAY_PHRASE,
  UNITS,
  WEEKDAYS,
  type Unit,
} from '../constants';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function utcOf(date: DateText): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function counted(count: number, unit: Unit): string {
  return `${withThousands(count)} ${count === 1 ? unit.one : unit.other}`;
}

function capitalized(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "vaquillonas", "vaquillona" (para un solo animal). */
export function categoryName(quantity: number, category: AnimalCategory): string {
  const name = CATEGORY_NAMES[category];
  return quantity === 1 ? name.one : name.other;
}

/** "Vaquillonas": el nombre de una categoría para una lista. */
export function categoryLabel(category: AnimalCategory): string {
  return capitalized(CATEGORY_NAMES[category].other);
}

/** "40 vaquillonas", "1 vaquillona". */
export function animalsText(quantity: number, category: AnimalCategory): string {
  return counted(quantity, CATEGORY_NAMES[category]);
}

/** "18 milímetros", "1 milímetro". */
export function millimetersText(value: number): string {
  return counted(value, UNITS.millimeter);
}

/** "105 animales", "1 animal". */
export function headsText(value: number): string {
  return counted(value, UNITS.animal);
}

export function monthName(date: DateText): string {
  return MONTHS[utcOf(date).getUTCMonth()];
}

/** "domingo 15". */
export function weekdayAndDay(date: DateText): string {
  const day = utcOf(date);
  return `${WEEKDAYS[day.getUTCDay()]} ${day.getUTCDate()}`;
}

function daysAgo(date: DateText, today: DateText): number {
  return Math.round((utcOf(today).getTime() - utcOf(date).getTime()) / MILLISECONDS_PER_DAY);
}

/** El día de una lluvia, para decirlo: "de hoy", "de ayer" o "del domingo 8". */
export function rainDayPhrase(date: DateText, today: DateText): string {
  return RAIN_DAY_PHRASE[daysAgo(date, today)] ?? `del ${weekdayAndDay(date)}`;
}

/** El día de una lluvia, para mostrarlo: "Anoche, domingo 15" o "Domingo 8". */
export function dayHint(date: DateText, today: DateText): string {
  const prefix = DAY_HINT_PREFIX[daysAgo(date, today)];
  return prefix === undefined
    ? capitalized(weekdayAndDay(date))
    : `${prefix}${weekdayAndDay(date)}`;
}

/** Un día con su fecha, para los renglones de una lista: "Domingo 15". */
export function dayLabel(date: DateText): string {
  return capitalized(weekdayAndDay(date));
}
