import { useState, type Dispatch } from 'react';
import { Vibration } from 'react-native';

import { VoiceEvent } from '../states/VoiceEvent';
import { VoicePhase } from '../states/VoicePhase';
import type { VoiceAction } from '../states/voiceReducer';
import { HANDS_FREE_VIBRATION_MS } from './constants';
import { useAppVisible } from './useAppVisible';
import { useMicrophonePermission } from './useMicrophonePermission';
import { useWakePhrase } from './useWakePhrase';

type HandsFreeInput = {
  phase: VoicePhase;
  dispatch: Dispatch<VoiceAction>;
  fail: (error?: unknown) => void;
  covered: boolean;
};

// Encenderlo pide el micrófono: sin permiso queda apagado y aparece la tarjeta "Sin micrófono".
async function allowedToTurnOn(
  canListen: () => Promise<boolean>,
  dispatch: Dispatch<VoiceAction>,
): Promise<boolean> {
  const allowed = await canListen();
  if (!allowed) {
    dispatch({ type: VoiceEvent.PermissionDenied });
  }
  return allowed;
}

/** Manos libres: con el interruptor encendido, la app a la vista y en reposo, espera la frase y empieza a escuchar. */
export function useHandsFree({ phase, dispatch, fail, covered }: HandsFreeInput) {
  const canListen = useMicrophonePermission();
  const visible = useAppVisible();
  const [enabled, setEnabled] = useState(false);
  const release = useWakePhrase({
    active: enabled && visible && !covered && phase === VoicePhase.Idle,
    // Vibra enseguida; empieza a escuchar cuando el detector soltó el micrófono.
    onDetected: () => {
      Vibration.vibrate(HANDS_FREE_VIBRATION_MS);
      void release().then(() => dispatch({ type: VoiceEvent.PhraseDetected }));
    },
    onFailure: (error) => {
      setEnabled(false);
      fail(error);
    },
  });

  const change = async (value: boolean) =>
    setEnabled(value && (await allowedToTurnOn(canListen, dispatch)));

  return { enabled, onChange: (value: boolean) => void change(value).catch(fail), release };
}
