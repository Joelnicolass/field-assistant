import { FileFarmLocalDataSource } from '@/data/datasources/FileFarmLocalDataSource';
import { FarmRepositoryImpl } from '@/data/repositories/FarmRepositoryImpl';
import { SystemClockService } from '@/data/services/SystemClockService';
import { ApplyCorrectionUseCaseImpl } from '@/data/usecases/ApplyCorrectionUseCaseImpl';
import { GetLotStockUseCaseImpl } from '@/data/usecases/GetLotStockUseCaseImpl';
import { GetRainSummaryUseCaseImpl } from '@/data/usecases/GetRainSummaryUseCaseImpl';
import { GetTodaySummaryUseCaseImpl } from '@/data/usecases/GetTodaySummaryUseCaseImpl';
import { PreviewCorrectionUseCaseImpl } from '@/data/usecases/PreviewCorrectionUseCaseImpl';
import { PreviewMovementUseCaseImpl } from '@/data/usecases/PreviewMovementUseCaseImpl';
import { PreviewRainUseCaseImpl } from '@/data/usecases/PreviewRainUseCaseImpl';
import { RegisterMovementUseCaseImpl } from '@/data/usecases/RegisterMovementUseCaseImpl';
import { RegisterRainUseCaseImpl } from '@/data/usecases/RegisterRainUseCaseImpl';
import type { Dependencies } from '@/di/Dependencies';

const clock = new SystemClockService();
const farm = new FarmRepositoryImpl(new FileFarmLocalDataSource(), clock);

export const container: Dependencies = {
  clock,
  previewRain: new PreviewRainUseCaseImpl(farm),
  registerRain: new RegisterRainUseCaseImpl(farm),
  previewMovement: new PreviewMovementUseCaseImpl(farm),
  registerMovement: new RegisterMovementUseCaseImpl(farm),
  getRainSummary: new GetRainSummaryUseCaseImpl(farm),
  getLotStock: new GetLotStockUseCaseImpl(farm),
  getTodaySummary: new GetTodaySummaryUseCaseImpl(farm),
  previewCorrection: new PreviewCorrectionUseCaseImpl(farm),
  applyCorrection: new ApplyCorrectionUseCaseImpl(farm),
};
