/** Convierte un texto en audio mp3. Si el proveedor falla, lanza ProviderError. */
export interface SpeechSynthesizer {
  synthesize(text: string): Promise<Buffer>;
}
