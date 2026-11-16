import type { PendingAudio } from '@/domain/entities/PendingAudio';
import type { Resolution } from '@/domain/entities/Resolution';

export type ResolvedAudio = { pending: PendingAudio; resolution: Resolution };
