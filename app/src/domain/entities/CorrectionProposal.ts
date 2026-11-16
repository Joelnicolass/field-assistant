import type { LastRecord } from '@/domain/entities/LastRecord';

export type CorrectionProposal = { target: LastRecord; quantity: number };
