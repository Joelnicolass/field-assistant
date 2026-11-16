import type { Dispatch } from 'react';

import { VoiceEvent } from '../states/VoiceEvent';
import type { VoiceAction } from '../states/voiceReducer';
import { SPOKEN } from './constants';

/** Un error que nadie esperaba: vuelve a reposo y lo dice. */
export function useFailure(
  dispatch: Dispatch<VoiceAction>,
  speech: { silence: () => void; say: (text: string) => Promise<void> },
) {
  return function fail(error?: unknown) {
    // La causa queda en el registro: "Algo salió mal" sola no alcanza para arreglarlo.
    console.warn(`[falla] ${String(error)}`);
    speech.silence();
    dispatch({ type: VoiceEvent.Failed });
    void speech.say(SPOKEN.unexpected);
  };
}
