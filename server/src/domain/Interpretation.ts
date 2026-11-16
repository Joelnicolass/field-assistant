export const INTENTS = [
  'register_rain',
  'move_animals',
  'rain_query',
  'lot_query',
  'correct',
  'unknown',
] as const;
export type Intent = (typeof INTENTS)[number];

export const DAYS = ['today', 'yesterday'] as const;
export type Day = (typeof DAYS)[number];

export const CATEGORIES = ['cow', 'heifer', 'calf', 'steer', 'bull'] as const;
export type Category = (typeof CATEGORIES)[number];

export const RANGES = ['today', 'yesterday', 'week', 'month'] as const;
export type Range = (typeof RANGES)[number];

/** Lo que se entendió de un audio. Todo lo que no se dijo va en null. */
export type Interpretation = {
  intent: Intent;
  transcript: string;
  millimeters: number | null;
  day: Day | null;
  date: string | null;
  quantity: number | null;
  category: Category | null;
  fromLot: number | null;
  toLot: number | null;
  lot: number | null;
  range: Range | null;
  question: string | null;
};

export type ConversationTurn = { said: string; replied: string };
