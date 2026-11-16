import type { Farm } from '@/domain/entities/Farm';
import type { FarmRepository } from '@/domain/repositories/FarmRepository';

export class InMemoryFarmRepository implements FarmRepository {
  saves = 0;

  constructor(private farm: Farm) {}

  async load(): Promise<Farm> {
    return this.farm;
  }

  async save(farm: Farm): Promise<void> {
    this.farm = farm;
    this.saves += 1;
  }
}
