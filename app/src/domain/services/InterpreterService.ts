import type { ConversationTurn } from '@/domain/entities/ConversationTurn';
import type { DateText } from '@/domain/entities/DateText';
import type { Interpretation } from '@/domain/entities/Interpretation';
import type { InterpreterFailure } from '@/domain/entities/InterpreterFailure';
import type { Result } from '@/domain/errors/Result';

export type InterpretInput = {
  audio: { uri: string; mimeType: string };
  history: ConversationTurn[];
  referenceDay: DateText;
};

export interface InterpreterService {
  interpret(input: InterpretInput): Promise<Result<Interpretation, InterpreterFailure>>;
  /** Despierta al server, si estaba dormido, sin esperar la respuesta. */
  wakeUp(): void;
}
