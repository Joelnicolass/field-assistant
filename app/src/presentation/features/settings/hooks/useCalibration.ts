import { useState } from 'react';

import { useDependencies } from '@/di/useDependencies';
import { useMicrophonePermission } from '@/presentation/features/voice/hooks/useMicrophonePermission';
import { proposeSpeechLevel } from './calibration';
import { useUserSettings } from './useUserSettings';
import { CalibrationStep } from './CalibrationStep';
import { MEASURE_MS } from './constants';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Calibra el umbral de voz: mide el ambiente en silencio, después la voz, y propone un umbral entre
 * los dos. Al guardarlo, vale desde la próxima grabación.
 */
export function useCalibration() {
  const { recorder } = useDependencies();
  const { settings, update } = useUserSettings();
  const canListen = useMicrophonePermission();
  const [step, setStep] = useState(CalibrationStep.Idle);
  const [level, setLevel] = useState(0);
  const [proposal, setProposal] = useState<number | null>(null);

  // Graba un rato sin guardar nada: solo junta los volúmenes.
  async function measure(): Promise<number[]> {
    const levels: number[] = [];
    await recorder.start((value) => {
      levels.push(value);
      setLevel(value);
    }, 1);
    await wait(MEASURE_MS);
    await recorder.cancel();
    setLevel(0);
    return levels;
  }

  async function calibrate() {
    if (!(await canListen())) {
      return;
    }
    setStep(CalibrationStep.Ambient);
    const ambient = await measure();
    setStep(CalibrationStep.Voice);
    const proposed = proposeSpeechLevel(ambient, await measure());
    setProposal(proposed);
    setStep(proposed === null ? CalibrationStep.Failed : CalibrationStep.Ready);
  }

  async function save() {
    if (proposal === null) {
      return;
    }
    await update({ speechLevel: proposal });
    setStep(CalibrationStep.Idle);
  }

  return { step, level, current: settings?.speechLevel ?? null, proposal, calibrate, save };
}
