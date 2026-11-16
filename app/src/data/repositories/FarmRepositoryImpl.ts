import { farmSeed } from '@/data/datasources/farmSeed';
import { toDocument, toEntity } from '@/data/mappers/farmMapper';
import type { FarmLocalDataSource } from '@/domain/datasources/FarmLocalDataSource';
import type { Farm } from '@/domain/entities/Farm';
import type { FarmRepository } from '@/domain/repositories/FarmRepository';
import type { ClockService } from '@/domain/services/ClockService';

export class FarmRepositoryImpl implements FarmRepository {
  constructor(
    private readonly dataSource: FarmLocalDataSource,
    private readonly clock: ClockService,
  ) {}

  async load(): Promise<Farm> {
    const saved = toEntity(await this.dataSource.read());
    if (saved !== null) {
      return saved;
    }
    const seed = farmSeed(this.clock.today());
    await this.save(seed);
    return seed;
  }

  async save(farm: Farm): Promise<void> {
    await this.dataSource.write(toDocument(farm));
  }
}
