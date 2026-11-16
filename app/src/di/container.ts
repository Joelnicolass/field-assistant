import { settings } from '@/core/configs/settings';
import { FileFarmLocalDataSource } from '@/data/datasources/FileFarmLocalDataSource';
import { FilePendingAudioLocalDataSource } from '@/data/datasources/FilePendingAudioLocalDataSource';
import { FarmRepositoryImpl } from '@/data/repositories/FarmRepositoryImpl';
import { PendingAudioRepositoryImpl } from '@/data/repositories/PendingAudioRepositoryImpl';
import { ExpoAudioRecorderService } from '@/data/services/ExpoAudioRecorderService';
import { FallbackSpeakerService } from '@/data/services/FallbackSpeakerService';
import { PhoneSpeakerService } from '@/data/services/PhoneSpeakerService';
import { ScriptedAudioRecorderService } from '@/data/services/ScriptedAudioRecorderService';
import { ServerInterpreterService } from '@/data/services/ServerInterpreterService';
import { ServerSpeakerService } from '@/data/services/ServerSpeakerService';
import { SystemClockService } from '@/data/services/SystemClockService';
import { ApplyCorrectionUseCaseImpl } from '@/data/usecases/ApplyCorrectionUseCaseImpl';
import { DiscardPendingAudioUseCaseImpl } from '@/data/usecases/DiscardPendingAudioUseCaseImpl';
import { GetLotStockUseCaseImpl } from '@/data/usecases/GetLotStockUseCaseImpl';
import { GetRainSummaryUseCaseImpl } from '@/data/usecases/GetRainSummaryUseCaseImpl';
import { GetTodaySummaryUseCaseImpl } from '@/data/usecases/GetTodaySummaryUseCaseImpl';
import { KeepAudioForLaterUseCaseImpl } from '@/data/usecases/KeepAudioForLaterUseCaseImpl';
import { PreviewCorrectionUseCaseImpl } from '@/data/usecases/PreviewCorrectionUseCaseImpl';
import { PreviewMovementUseCaseImpl } from '@/data/usecases/PreviewMovementUseCaseImpl';
import { PreviewRainUseCaseImpl } from '@/data/usecases/PreviewRainUseCaseImpl';
import { RegisterMovementUseCaseImpl } from '@/data/usecases/RegisterMovementUseCaseImpl';
import { RegisterRainUseCaseImpl } from '@/data/usecases/RegisterRainUseCaseImpl';
import { ResolveRequestUseCaseImpl } from '@/data/usecases/ResolveRequestUseCaseImpl';
import { RetryPendingAudiosUseCaseImpl } from '@/data/usecases/RetryPendingAudiosUseCaseImpl';
import type { Dependencies } from '@/di/Dependencies';

const clock = new SystemClockService();
const farm = new FarmRepositoryImpl(new FileFarmLocalDataSource(), clock);
const pendingAudios = new PendingAudioRepositoryImpl(new FilePendingAudioLocalDataSource());
const interpreter = new ServerInterpreterService(settings.serverUrl, settings.interpretTimeoutMs);
// Con la dirección de prueba, se graba bajando un audio en lugar de abrir el micrófono.
const recorder =
  settings.scriptedAudioUrl === null
    ? new ExpoAudioRecorderService(settings.speechLevel)
    : new ScriptedAudioRecorderService(settings.scriptedAudioUrl);
const speaker = new FallbackSpeakerService(
  new ServerSpeakerService(settings.serverUrl),
  new PhoneSpeakerService(),
  settings.speakStartTimeoutMs,
);

const previewRain = new PreviewRainUseCaseImpl(farm);
const previewMovement = new PreviewMovementUseCaseImpl(farm);
const getRainSummary = new GetRainSummaryUseCaseImpl(farm);
const getLotStock = new GetLotStockUseCaseImpl(farm);
const previewCorrection = new PreviewCorrectionUseCaseImpl(farm);
const resolveRequest = new ResolveRequestUseCaseImpl(
  previewRain,
  previewMovement,
  getRainSummary,
  getLotStock,
  previewCorrection,
);

export const container: Dependencies = {
  clock,
  previewRain,
  registerRain: new RegisterRainUseCaseImpl(farm),
  previewMovement,
  registerMovement: new RegisterMovementUseCaseImpl(farm),
  getRainSummary,
  getLotStock,
  getTodaySummary: new GetTodaySummaryUseCaseImpl(farm),
  previewCorrection,
  applyCorrection: new ApplyCorrectionUseCaseImpl(farm),
  recorder,
  speaker,
  interpreter,
  resolveRequest,
  keepAudioForLater: new KeepAudioForLaterUseCaseImpl(pendingAudios),
  retryPendingAudios: new RetryPendingAudiosUseCaseImpl(pendingAudios, interpreter, resolveRequest),
  discardPendingAudio: new DiscardPendingAudioUseCaseImpl(pendingAudios),
};
