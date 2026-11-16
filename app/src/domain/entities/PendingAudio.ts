import type { DateText } from '@/domain/entities/DateText';

export type PendingAudio = { id: number; uri: string; mimeType: string; recordedOn: DateText };
