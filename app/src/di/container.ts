import { SystemClockService } from '@/data/services/SystemClockService';
import type { Dependencies } from '@/di/Dependencies';

export const container: Dependencies = {
  clock: new SystemClockService(),
};
