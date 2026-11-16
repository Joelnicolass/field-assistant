export enum TitlePhase {
  Data = 'data',
  DataLeaving = 'data_leaving',
  Assistant = 'assistant',
  AssistantLeaving = 'assistant_leaving',
}

export const TITLE_FIRST_WORD = 'Field';

// Cada palabra queda a la vista 10 segundos; se desenfoca en lo que tarda en enfocarse y entra
// la otra. Da la vuelta para siempre.
const SHOWN_MS = 10000;
/** Más rápido que el subtítulo: es una sola palabra y no se lee, se reconoce. */
export const TITLE_WORD_MS = 300;
const LEAVING_MS = TITLE_WORD_MS + 80;

export const TITLE_PHASES: Record<
  TitlePhase,
  { word: string; leaving: boolean; next: TitlePhase; afterMs: number }
> = {
  [TitlePhase.Data]: {
    word: 'Data',
    leaving: false,
    next: TitlePhase.DataLeaving,
    afterMs: SHOWN_MS,
  },
  [TitlePhase.DataLeaving]: {
    word: 'Data',
    leaving: true,
    next: TitlePhase.Assistant,
    afterMs: LEAVING_MS,
  },
  [TitlePhase.Assistant]: {
    word: 'Assistant',
    leaving: false,
    next: TitlePhase.AssistantLeaving,
    afterMs: SHOWN_MS,
  },
  [TitlePhase.AssistantLeaving]: {
    word: 'Assistant',
    leaving: true,
    next: TitlePhase.Data,
    afterMs: LEAVING_MS,
  },
};
