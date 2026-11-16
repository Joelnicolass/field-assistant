import type { ConversationTurn, Interpretation } from './Interpretation.ts';

export type AudioToInterpret = {
  audio: Buffer;
  mimeType: string;
  history: ConversationTurn[];
  /** El día en que se grabó el audio, AAAA-MM-DD: para el modelo es "hoy". */
  referenceDay: string;
};

/** Entiende un audio. Si el proveedor falla, lanza ProviderError. */
export interface AudioInterpreter {
  interpret(input: AudioToInterpret): Promise<Interpretation>;
}
