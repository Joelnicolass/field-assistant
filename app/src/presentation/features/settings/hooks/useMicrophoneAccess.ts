import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { useDependencies } from '@/di/useDependencies';
import { MicrophonePermission } from '@/domain/enums/MicrophonePermission';
import { useAppVisible } from '@/presentation/features/voice/hooks/useAppVisible';

/**
 * El permiso del micrófono, que usan hablar y manos libres. Se vuelve a consultar al volver a la
 * app, por si la persona lo cambió en los ajustes del teléfono.
 */
export function useMicrophoneAccess() {
  const { recorder } = useDependencies();
  const visible = useAppVisible();
  const [permission, setPermission] = useState<MicrophonePermission | null>(null);

  useEffect(() => {
    if (visible) {
      void recorder.permission().then(setPermission);
    }
  }, [visible, recorder]);

  // Si nunca se pidió, lo pide; si se negó, Android solo deja cambiarlo en sus ajustes.
  const fix = async () =>
    permission === MicrophonePermission.NotAsked
      ? setPermission(await recorder.requestPermission())
      : Linking.openSettings();

  return { permission, fix: () => void fix() };
}
