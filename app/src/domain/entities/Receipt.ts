import type { MovementReceipt } from '@/domain/entities/MovementReceipt';
import type { RainReceipt } from '@/domain/entities/RainReceipt';

export type Receipt = RainReceipt | MovementReceipt;
