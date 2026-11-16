import type { ConversationTurn } from '../domain/Interpretation.ts';

const MAX_TURNS = 4;
const MAX_TEXT = 300;

function isTurn(value: unknown): value is ConversationTurn {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { said, replied } = value as Partial<ConversationTurn>;
  return typeof said === 'string' && typeof replied === 'string';
}

/** Lee X-History: los últimos turnos, recortados. Si falta o está mal formado, sin historial. */
export function readHistory(header: string | undefined): ConversationTurn[] {
  if (header === undefined) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(header));
    if (!Array.isArray(parsed) || !parsed.every(isTurn)) {
      return [];
    }
    return parsed.slice(-MAX_TURNS).map((turn) => ({
      said: turn.said.slice(0, MAX_TEXT),
      replied: turn.replied.slice(0, MAX_TEXT),
    }));
  } catch {
    return [];
  }
}
