export interface AmbientLightService {
  isAvailable(): Promise<boolean>;
  /** Avisa cada lectura del sensor, en lux. Devuelve cómo dejar de escuchar. */
  watch(onLux: (lux: number) => void): () => void;
}
