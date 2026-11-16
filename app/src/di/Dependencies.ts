import type { ClockService } from '@/domain/services/ClockService';
import type { ApplyCorrectionUseCase } from '@/domain/usecases/ApplyCorrectionUseCase';
import type { GetLotStockUseCase } from '@/domain/usecases/GetLotStockUseCase';
import type { GetRainSummaryUseCase } from '@/domain/usecases/GetRainSummaryUseCase';
import type { GetTodaySummaryUseCase } from '@/domain/usecases/GetTodaySummaryUseCase';
import type { PreviewCorrectionUseCase } from '@/domain/usecases/PreviewCorrectionUseCase';
import type { PreviewMovementUseCase } from '@/domain/usecases/PreviewMovementUseCase';
import type { PreviewRainUseCase } from '@/domain/usecases/PreviewRainUseCase';
import type { RegisterMovementUseCase } from '@/domain/usecases/RegisterMovementUseCase';
import type { RegisterRainUseCase } from '@/domain/usecases/RegisterRainUseCase';

export type Dependencies = {
  clock: ClockService;
  previewRain: PreviewRainUseCase;
  registerRain: RegisterRainUseCase;
  previewMovement: PreviewMovementUseCase;
  registerMovement: RegisterMovementUseCase;
  getRainSummary: GetRainSummaryUseCase;
  getLotStock: GetLotStockUseCase;
  getTodaySummary: GetTodaySummaryUseCase;
  previewCorrection: PreviewCorrectionUseCase;
  applyCorrection: ApplyCorrectionUseCase;
};
