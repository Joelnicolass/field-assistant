import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  type RecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';

import type { CheckView } from '../components/CheckCard';
import { METERING_INTERVAL_MS, RECORDING_OPTIONS, TEXT } from './constants';

const MILLISECONDS_PER_SECOND = 1000;

function formatLevel(level: number | undefined): string {
  return level === undefined ? TEXT.none : `${level.toFixed(1)} ${TEXT.decibels}`;
}

function readingsPerSecond(readings: number, durationMillis: number): string {
  return durationMillis === 0
    ? TEXT.none
    : (readings / (durationMillis / MILLISECONDS_PER_SECOND)).toFixed(1);
}

function appendIfChanged(levels: readonly number[], level: number | undefined): readonly number[] {
  return level === undefined || levels.at(-1) === level ? levels : [...levels, level];
}

export function useRecordingCheck(): CheckView {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<RecorderState | null>(null);
  const [permissionBefore, setPermissionBefore] = useState<string | null>(null);
  const [levels, setLevels] = useState<readonly number[]>([]);
  const [file, setFile] = useState<string | null>(null);
  const [elapsedMillis, setElapsedMillis] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  useEffect(() => {
    if (!recording) {
      return;
    }
    const timer = setInterval(() => {
      const current = recorder.getStatus();
      setStatus(current);
      setLevels((previous) => appendIfChanged(previous, current.metering));
    }, METERING_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [recording, recorder]);

  async function record() {
    const before = await getRecordingPermissionsAsync();
    setPermissionBefore(before.status);
    const granted = before.granted || (await requestRecordingPermissionsAsync()).granted;
    if (!granted) {
      return;
    }
    await setAudioModeAsync({ allowsRecording: true });
    setLevels([]);
    setFile(null);
    await recorder.prepareToRecordAsync();
    recorder.record();
    setStartedAt(Date.now());
    setElapsedMillis(0);
    setRecording(true);
  }

  async function stop() {
    await recorder.stop();
    setElapsedMillis(Date.now() - startedAt);
    setRecording(false);
    setFile(recorder.uri);
  }

  const lowest = levels.length === 0 ? undefined : Math.min(...levels);
  const highest = levels.length === 0 ? undefined : Math.max(...levels);

  return {
    actions: [
      recording
        ? { key: 'stop', label: TEXT.stop, onPress: stop }
        : { key: 'record', label: TEXT.record, onPress: record },
    ],
    lines: [
      `${TEXT.permissionBefore}: ${permissionBefore ?? TEXT.none}`,
      `${TEXT.recording}: ${recording ? TEXT.yes : TEXT.no}`,
      `${TEXT.level}: ${formatLevel(status?.metering)}`,
      `${TEXT.range}: ${formatLevel(lowest)} / ${formatLevel(highest)}`,
      `${TEXT.readingsPerSecond}: ${readingsPerSecond(levels.length, elapsedMillis)}`,
      `${TEXT.file}: ${file ?? TEXT.none}`,
    ],
  };
}
