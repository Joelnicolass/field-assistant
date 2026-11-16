import { settings } from '@/core/configs/settings';

import type { CheckView } from '../components/CheckCard';
import { TEXT } from './constants';
import { useLightCheck } from './useLightCheck';
import { useRecordingCheck } from './useRecordingCheck';
import { useVoicesCheck } from './useVoicesCheck';
import { useWakePhraseCheck } from './useWakePhraseCheck';

type ResearchCheck = { key: string; title: string; view: CheckView };

type ResearchChecks = {
  checks: readonly ResearchCheck[];
  serverUrl: string;
};

export function useResearchChecks(): ResearchChecks {
  const recording = useRecordingCheck();
  const voices = useVoicesCheck();
  const wakePhrase = useWakePhraseCheck();
  const light = useLightCheck();

  return {
    checks: [
      { key: 'recording', title: TEXT.recordingTitle, view: recording },
      { key: 'voices', title: TEXT.voicesTitle, view: voices },
      { key: 'wake', title: TEXT.wakeTitle, view: wakePhrase },
      { key: 'light', title: TEXT.lightTitle, view: light },
    ],
    serverUrl: settings.serverUrl,
  };
}
