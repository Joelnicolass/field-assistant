export interface UserSettingsLocalDataSource {
  read(): Promise<unknown | null>;
  write(document: unknown): Promise<void>;
}
