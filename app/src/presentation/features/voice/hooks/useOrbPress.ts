import { useRef, type Dispatch } from 'react';

import { useDependencies } from '@/di/useDependencies';
import type { SpeakerService } from '@/domain/services/SpeakerService';
import { VoiceEvent } from '../states/VoiceEvent';
import { VoicePhase } from '../states/VoicePhase';
import type { VoiceAction } from '../states/voiceReducer';
import { useMicrophonePermission } from './useMicrophonePermission';

type OrbPressInput = {
  phase: VoicePhase;
  dispatch: Dispatch<VoiceAction>;
  silence: () => void;
  /** Mientras se está anotando, el orbe no cambia el turno: lo anotado tiene que llegar a su comprobante. */
  isWriting: () => boolean;
  fail: (error?: unknown) => void;
};

// Con el permiso por pedir, la fase no cambia hasta saber si se puede escuchar.
async function pressOrb(
  { phase, dispatch, silence, isWriting }: OrbPressInput,
  speaker: SpeakerService,
  canListen: () => Promise<boolean>,
) {
  if (isWriting()) {
    return;
  }
  silence();
  speaker.reset();
  const allowed = phase !== VoicePhase.Idle || (await canListen());
  dispatch({ type: allowed ? VoiceEvent.OrbPressed : VoiceEvent.PermissionDenied });
}

/** Lo que hace un toque al orbe: corta la voz y empieza, termina o cancela según la fase. */
export function useOrbPress(input: OrbPressInput) {
  const { speaker } = useDependencies();
  const canListen = useMicrophonePermission();
  const pressing = useRef(false);

  return function onOrbPress() {
    if (pressing.current) {
      return;
    }
    pressing.current = true;
    pressOrb(input, speaker, canListen)
      .catch(input.fail)
      .finally(() => {
        pressing.current = false;
      });
  };
}
