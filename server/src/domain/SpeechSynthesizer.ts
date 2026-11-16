/**
 * Convierte un texto en audio mp3 y lo entrega a medida que el proveedor lo genera. Si el
 * proveedor falla antes de empezar, lanza ProviderError.
 */
export interface SpeechSynthesizer {
  synthesize(text: string): Promise<AsyncIterable<Uint8Array>>;
}
