import { useEffect, type Dispatch } from 'react';
import { AppState } from 'react-native';

import { VoiceEvent } from '../states/VoiceEvent';
import type { VoiceAction } from '../states/voiceReducer';

/** Avisa al turno cuando la app pasa a segundo plano. */
export function useBackgroundSignal(dispatch: Dispatch<VoiceAction>) {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'background') {
        dispatch({ type: VoiceEvent.WentToBackground });
      }
    });
    return () => subscription.remove();
  }, [dispatch]);
}
