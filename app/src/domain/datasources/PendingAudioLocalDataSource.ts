export interface PendingAudioLocalDataSource {
  read(): Promise<unknown | null>;
  write(document: unknown): Promise<void>;
  /** Copia el audio a la carpeta de la app y devuelve la ruta nueva. */
  keep(uri: string): Promise<string>;
  discard(uri: string): Promise<void>;
}
