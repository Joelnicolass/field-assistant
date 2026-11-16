export interface FarmLocalDataSource {
  read(): Promise<unknown | null>;
  write(document: unknown): Promise<void>;
}
