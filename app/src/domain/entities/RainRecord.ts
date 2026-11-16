import type { DateText } from '@/domain/entities/DateText';

export type RainRecord = { id: number; date: DateText; notedOn: DateText; millimeters: number };
