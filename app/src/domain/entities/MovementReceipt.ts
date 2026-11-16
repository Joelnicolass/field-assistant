import type { AnimalMovement } from '@/domain/entities/AnimalMovement';
import type { RecordKind } from '@/domain/enums/RecordKind';

export type MovementReceipt = {
  kind: RecordKind.Movement;
  movement: AnimalMovement;
  remainingInOrigin: number;
};
