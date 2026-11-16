import type { Farm } from '@/domain/entities/Farm';

export interface FarmRepository {
  load(): Promise<Farm>;
  save(farm: Farm): Promise<void>;
}
