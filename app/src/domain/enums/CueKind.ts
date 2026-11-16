/** Las frases cortas grabadas dentro de la app: suenan al instante y sin red. */
export enum CueKind {
  /** Una muletilla mientras se entiende el audio. */
  Thinking = 'thinking',
  /** El aviso de que el audio quedó guardado porque no hay señal. */
  Offline = 'offline',
}
