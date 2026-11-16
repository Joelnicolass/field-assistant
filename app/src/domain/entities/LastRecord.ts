import type { AnimalMovement } from '@/domain/entities/AnimalMovement';
import type { RainRecord } from '@/domain/entities/RainRecord';
import type { RecordKind } from '@/domain/enums/RecordKind';

export type LastRecord =
  | { kind: RecordKind.Rain; record: RainRecord }
  | { kind: RecordKind.Movement; movement: AnimalMovement };
