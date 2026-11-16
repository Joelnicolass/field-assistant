import * as Brightness from 'expo-brightness';
import { LightSensor } from 'expo-sensors';
import { useEffect, useState } from 'react';

import type { CheckView } from '../components/CheckCard';
import { BRIGHTNESS_LOW, BRIGHTNESS_MAX, LIGHT_INTERVAL_MS, TEXT } from './constants';

type BrightnessReading = { app: number; system: number };

function formatNumber(value: number | null): string {
  return value === null ? TEXT.none : value.toFixed(2);
}

export function useLightCheck(): CheckView {
  const [measuring, setMeasuring] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [lux, setLux] = useState<number | null>(null);
  const [brightness, setBrightness] = useState<BrightnessReading | null>(null);

  useEffect(() => {
    if (!measuring) {
      return;
    }
    LightSensor.setUpdateInterval(LIGHT_INTERVAL_MS);
    const subscription = LightSensor.addListener((measurement) => setLux(measurement.illuminance));
    return () => subscription.remove();
  }, [measuring]);

  async function toggleMeasuring() {
    setAvailable(await LightSensor.isAvailableAsync());
    setMeasuring((previous) => !previous);
  }

  async function setAppBrightness(value: number) {
    await Brightness.setBrightnessAsync(value);
    setBrightness({
      app: await Brightness.getBrightnessAsync(),
      system: await Brightness.getSystemBrightnessAsync(),
    });
  }

  return {
    actions: [
      {
        key: 'light',
        label: measuring ? TEXT.stopLight : TEXT.measureLight,
        onPress: toggleMeasuring,
      },
      { key: 'max', label: TEXT.brightnessMax, onPress: () => setAppBrightness(BRIGHTNESS_MAX) },
      { key: 'low', label: TEXT.brightnessLow, onPress: () => setAppBrightness(BRIGHTNESS_LOW) },
    ],
    lines: [
      `${TEXT.lightAvailable}: ${available === null ? TEXT.none : available ? TEXT.yes : TEXT.no}`,
      `${TEXT.lux}: ${formatNumber(lux)}`,
      `${TEXT.appBrightness}: ${formatNumber(brightness?.app ?? null)}`,
      `${TEXT.systemBrightness}: ${formatNumber(brightness?.system ?? null)}`,
    ],
  };
}
