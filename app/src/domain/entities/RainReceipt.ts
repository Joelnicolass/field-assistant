import type { RainRecord } from '@/domain/entities/RainRecord';
import type { RecordKind } from '@/domain/enums/RecordKind';

export type RainReceipt = { kind: RecordKind.Rain; record: RainRecord; monthTotal: number };
