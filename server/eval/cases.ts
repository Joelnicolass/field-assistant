import type { ConversationTurn, Interpretation } from '../src/domain/Interpretation.ts';

export type EvalCase = {
  /** El nombre del audio en eval/audios, sin la extensión. */
  audio: string;
  said: string;
  history: ConversationTurn[];
  /** Solo los campos que se comprueban. `question` dice si tiene que venir una pregunta. */
  expected: Partial<Omit<Interpretation, 'question' | 'transcript'>> & { question: boolean };
};

const turn = (said: string, replied: string): ConversationTurn[] => [{ said, replied }];

// Las frases de docs/BATERIA.md (la 18 repite la 3) y cinco de conversación.
export const CASES: EvalCase[] = [
  {
    audio: '01-lluvia-anoche',
    said: 'Llovieron 18 milímetros anoche',
    history: [],
    expected: { intent: 'register_rain', millimeters: 18, day: 'yesterday', question: false },
  },
  {
    audio: '02-mover-vaquillonas',
    said: 'Pasé 40 vaquillonas del lote 3 al 5',
    history: [],
    expected: {
      intent: 'move_animals',
      quantity: 40,
      category: 'heifer',
      fromLot: 3,
      toLot: 5,
      question: false,
    },
  },
  {
    audio: '03-lluvia-mes',
    said: '¿Cuánto llovió este mes?',
    history: [],
    expected: { intent: 'rain_query', range: 'month', question: false },
  },
  {
    audio: '04-lote-5',
    said: '¿Cuántos animales hay en el lote 5?',
    history: [],
    expected: { intent: 'lot_query', lot: 5, question: false },
  },
  {
    audio: '05a-mover-terneros',
    said: 'Mové quince terneros',
    history: [],
    expected: {
      intent: 'move_animals',
      quantity: 15,
      category: 'calf',
      fromLot: null,
      toLot: null,
      question: true,
    },
  },
  {
    audio: '05b-del-dos-al-siete',
    said: 'Del dos al siete',
    history: turn('Mové quince terneros', '¿De qué lote a qué lote?'),
    expected: {
      intent: 'move_animals',
      quantity: 15,
      category: 'calf',
      fromLot: 2,
      toLot: 7,
      question: false,
    },
  },
  {
    audio: '06a-llovio-hoy',
    said: 'Llovió hoy',
    history: [],
    expected: { intent: 'register_rain', millimeters: null, day: 'today', question: true },
  },
  {
    audio: '06b-siete',
    said: 'Siete',
    history: turn('Llovió hoy', '¿Cuántos milímetros?'),
    expected: { intent: 'register_rain', millimeters: 7, day: 'today', question: false },
  },
  {
    audio: '07a-cuantos-animales',
    said: '¿Cuántos animales hay?',
    history: [],
    expected: { intent: 'lot_query', lot: null, question: true },
  },
  {
    audio: '07b-en-el-cuatro',
    said: 'En el cuatro',
    history: turn('¿Cuántos animales hay?', '¿De qué lote?'),
    expected: { intent: 'lot_query', lot: 4, question: false },
  },
  {
    audio: '08-quinientos-novillos',
    said: 'Pasé quinientos novillos del tres al cinco',
    history: [],
    expected: {
      intent: 'move_animals',
      quantity: 500,
      category: 'steer',
      fromLot: 3,
      toLot: 5,
      question: false,
    },
  },
  {
    audio: '09-lote-doce',
    said: 'Pasé diez vacas del uno al doce',
    history: [],
    expected: {
      intent: 'move_animals',
      quantity: 10,
      category: 'cow',
      fromLot: 1,
      toLot: 12,
      question: false,
    },
  },
  {
    audio: '10-mismo-lote',
    said: 'Pasé veinte vacas del uno al uno',
    history: [],
    expected: {
      intent: 'move_animals',
      quantity: 20,
      category: 'cow',
      fromLot: 1,
      toLot: 1,
      question: false,
    },
  },
  {
    audio: '11-lluvia-semana',
    said: '¿Cuánto llovió esta semana?',
    history: [],
    expected: { intent: 'rain_query', range: 'week', question: false },
  },
  {
    audio: '12-lluvia-ayer',
    said: '¿Cuánto llovió ayer?',
    history: [],
    expected: { intent: 'rain_query', range: 'yesterday', question: false },
  },
  {
    audio: '13-lluvia-hoy',
    said: '¿Cuánto llovió hoy?',
    history: [],
    expected: { intent: 'rain_query', range: 'today', question: false },
  },
  {
    audio: '14-lote-dos',
    said: '¿Cuántos animales hay en el lote dos?',
    history: [],
    expected: { intent: 'lot_query', lot: 2, question: false },
  },
  {
    audio: '15-dos-toros',
    said: 'Pasá dos toros del cuatro al uno',
    history: [],
    expected: {
      intent: 'move_animals',
      quantity: 2,
      category: 'bull',
      fromLot: 4,
      toLot: 1,
      question: false,
    },
  },
  {
    audio: '16-cinco-hoy',
    said: 'Llovieron cinco milímetros hoy',
    history: [],
    expected: { intent: 'register_rain', millimeters: 5, day: 'today', question: false },
  },
  {
    audio: '17-diez-vacas',
    said: 'Pasé diez vacas del lote dos al seis',
    history: [],
    expected: {
      intent: 'move_animals',
      quantity: 10,
      category: 'cow',
      fromLot: 2,
      toLot: 6,
      question: false,
    },
  },
  {
    audio: '19-lote-siete',
    said: '¿Cuántos animales hay en el lote siete?',
    history: [],
    expected: { intent: 'lot_query', lot: 7, question: false },
  },
  {
    audio: '20-clima',
    said: '¿Qué onda el clima mañana?',
    history: [],
    expected: { intent: 'unknown', question: false },
  },
  {
    audio: 'c1-y-en-el-cuatro',
    said: '¿Y en el cuatro?',
    history: turn('¿Cuántos animales hay en el lote 5?', 'En el lote 5 hay 105 animales.'),
    expected: { intent: 'lot_query', lot: 4, question: false },
  },
  {
    audio: 'c2-eran-veinte',
    said: 'No, eran veinte',
    history: turn('Llovieron 18 milímetros anoche', 'Anotado. Van 56 milímetros en el mes.'),
    expected: { intent: 'correct', millimeters: 20, question: false },
  },
  {
    audio: 'c3-cambio-lluvia',
    said: '¿Cuánto llovió este mes?',
    history: turn('Mové quince terneros', '¿De qué lote a qué lote?'),
    expected: { intent: 'rain_query', range: 'month', question: false },
  },
  {
    audio: 'c4-cambio-toros',
    said: 'Pasá dos toros del cuatro al uno',
    history: turn('Llovió hoy', '¿Cuántos milímetros?'),
    expected: {
      intent: 'move_animals',
      quantity: 2,
      category: 'bull',
      fromLot: 4,
      toLot: 1,
      question: false,
    },
  },
];
