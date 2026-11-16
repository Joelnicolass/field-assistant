import { useDependencies } from '@/di/useDependencies';
import { MicrophonePermission } from '@/domain/enums/MicrophonePermission';

/** Dice si se puede escuchar; si el permiso nunca se pidió, lo pide. */
export function useMicrophonePermission() {
  const { recorder } = useDependencies();

  return async function canListen(): Promise<boolean> {
    const permission = await recorder.permission();
    const granted =
      permission === MicrophonePermission.NotAsked
        ? await recorder.requestPermission()
        : permission;
    return granted === MicrophonePermission.Granted;
  };
}
