/** Lo que la persona ajusta en la pantalla de Ajustes y queda guardado en el teléfono. */
export type UserSettings = {
  /** Desde qué volumen, de 0 a 1, se toma como voz lo que entra por el micrófono. */
  speechLevel: number;
  /** El tema cambia solo según la luz del lugar; apagado, queda el claro. */
  autoTheme: boolean;
};
