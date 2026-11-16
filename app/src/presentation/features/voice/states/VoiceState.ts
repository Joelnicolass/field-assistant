import type { ConversationTurn } from '@/domain/entities/ConversationTurn';
import type { LastRecord } from '@/domain/entities/LastRecord';
import type { VoiceCard } from './VoiceCard';
import type { VoicePhase } from './VoicePhase';

export type VoiceState = {
  phase: VoicePhase;
  /** A qué fase se va cuando la app termina de hablar. */
  afterSpeech: VoicePhase;
  /** Sube con cada turno: las respuestas de un turno viejo no valen para el nuevo. */
  turn: number;
  /** La tarjeta del turno en curso. */
  card: VoiceCard | null;
  /** Lo que la app dice: se muestra mientras lo dice y queda después. */
  subtitle: string;
  questionsInARow: number;
  /** La cuenta de la propuesta se frenó (la app fue a segundo plano): espera un toque. */
  paused: boolean;
  lastRecord: LastRecord | null;
  history: ConversationTurn[];
};
