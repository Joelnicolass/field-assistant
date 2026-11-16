import type { ClockService } from '@/domain/services/ClockService';

export type Dependencies = {
  clock: ClockService;
};
