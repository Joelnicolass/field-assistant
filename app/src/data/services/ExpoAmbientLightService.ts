import { LightSensor } from 'expo-sensors';

import type { AmbientLightService } from '@/domain/services/AmbientLightService';

export class ExpoAmbientLightService implements AmbientLightService {
  isAvailable(): Promise<boolean> {
    return LightSensor.isAvailableAsync();
  }

  watch(onLux: (lux: number) => void): () => void {
    const subscription = LightSensor.addListener(({ illuminance }) => onLux(illuminance));
    return () => subscription.remove();
  }
}
