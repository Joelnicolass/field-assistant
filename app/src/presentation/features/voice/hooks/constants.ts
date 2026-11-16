import { InterpreterErrorCode } from '@/domain/enums/InterpreterErrorCode';
import { AnimalCategory } from '@/domain/enums/AnimalCategory';
import { RainRange } from '@/domain/enums/RainRange';
import { OrbState } from '@/shared/presentation/components/Orb/OrbState';
import { VoicePhase } from '../states/VoicePhase';

export const IDLE_SUBTITLE = 'Contame qué pasó hoy en el campo';

/** El texto de estado, debajo del orbe, en cada fase. Proponiendo se ve como reposo. */
export const STATUS_TEXT: Record<VoicePhase, string> = {
  [VoicePhase.Idle]: 'Tocá para hablar',
  [VoicePhase.Listening]: 'Te escucho · tocá para terminar',
  [VoicePhase.Thinking]: 'Pensando…',
  [VoicePhase.Speaking]: 'Tocá para interrumpir',
  [VoicePhase.Proposing]: 'Tocá para decir otra cosa',
};

export const ORB_STATE: Record<VoicePhase, OrbState> = {
  [VoicePhase.Idle]: OrbState.Idle,
  [VoicePhase.Listening]: OrbState.Listening,
  [VoicePhase.Thinking]: OrbState.Thinking,
  [VoicePhase.Speaking]: OrbState.Speaking,
  [VoicePhase.Proposing]: OrbState.Idle,
};

export type Unit = { one: string; other: string };

export const UNITS = {
  millimeter: { one: 'milímetro', other: 'milímetros' },
  animal: { one: 'animal', other: 'animales' },
} satisfies Record<string, Unit>;

export const CATEGORY_NAMES: Record<AnimalCategory, Unit> = {
  [AnimalCategory.Cow]: { one: 'vaca', other: 'vacas' },
  [AnimalCategory.Heifer]: { one: 'vaquillona', other: 'vaquillonas' },
  [AnimalCategory.Calf]: { one: 'ternero', other: 'terneros' },
  [AnimalCategory.Steer]: { one: 'novillo', other: 'novillos' },
  [AnimalCategory.Bull]: { one: 'toro', other: 'toros' },
};

export const WEEKDAYS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;

export const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

/** Lo que la app dice en voz alta; el mismo texto va en el subtítulo. */
export const SPOKEN = {
  nothingHeard: 'No te escuché.',
  audioSaved: 'Guardé tu audio. Lo anoto cuando vuelva la señal.',
  serviceBusy: 'Enviaré tu audio enseguida, el servicio está saturado en este momento.',
  discarded: 'No llegué a entenderlo. Probá decirlo de una.',
  unexpected: 'Algo salió mal. Probá de nuevo.',
  notUnderstood: 'Eso no lo sé.',
  askAgain: '¿Me lo decís de nuevo, con todos los datos?',
  examples: [
    'Llovieron 18 milímetros anoche',
    'Pasé 40 vaquillonas del lote 3 al 5',
    '¿Cuánto llovió este mes?',
  ],
  rainProposal: (millimeters: string, day: string) => `Voy a anotar ${millimeters}, lluvia ${day}.`,
  movementProposal: (animals: string, from: number, to: number) =>
    `Voy a pasar ${animals} del lote ${from} al ${to}.`,
  rainCorrection: (millimeters: string) => `Voy a corregir la lluvia: ${millimeters}.`,
  movementCorrection: (animals: string) => `Voy a corregir el movimiento: ${animals}.`,
  rainNoted: (monthTotal: string) => `Anotado. Van ${monthTotal} en el mes.`,
  movementNoted: (remaining: string, lot: number) =>
    `Listo. Quedan ${remaining} en el lote ${lot}.`,
  rainDry: (when: string) => `${when} no llovió.`,
  rainOne: (when: string) => `${when} llovió 1 milímetro.`,
  rainMany: (when: string, millimeters: string) => `${when} llovieron ${millimeters}.`,
  lotStock: (lot: number, animals: string) => `En el lote ${lot} hay ${animals}.`,
  failure: {
    lotNotFound: (lot: number) => `El lote ${lot} no existe.`,
    sameLot: (lot: number) => `El lote ${lot} es el de origen y el de destino.`,
    invalidQuantity: 'La cantidad tiene que ser mayor que cero.',
    notEnoughAnimals: (lot: number, available: string, requested: number) =>
      `En el lote ${lot} hay ${available}, no ${requested}.`,
    invalidMillimeters: 'Los milímetros tienen que ser mayores que cero.',
    futureDate: 'No puedo anotar una fecha que todavía no pasó.',
    nothingToCorrect: 'No hay nada para corregir.',
  },
};

// Los días que se nombran con una palabra, según cuántos días atrás fueron; los demás, por su fecha.
export const RAIN_DAY_PHRASE: Partial<Record<number, string>> = { 0: 'de hoy', 1: 'de ayer' };
export const DAY_HINT_PREFIX: Partial<Record<number, string>> = { 0: 'Hoy, ', 1: 'Anoche, ' };

/** De qué período es la lluvia de una consulta, para el título: "Lluvia de noviembre". */
export const RAIN_PERIOD: Record<RainRange, (month: string) => string> = {
  [RainRange.Today]: () => 'hoy',
  [RainRange.Yesterday]: () => 'ayer',
  [RainRange.Week]: () => 'la semana',
  [RainRange.Month]: (month) => month,
};

export const RAIN_RANGE_WHEN: Record<RainRange, string> = {
  [RainRange.Today]: 'Hoy',
  [RainRange.Yesterday]: 'Ayer',
  [RainRange.Week]: 'Esta semana',
  [RainRange.Month]: 'Este mes',
};

/** Lo que las tarjetas muestran. */
export const CARD_TEXT = {
  rainProposal: 'Anotar lluvia',
  movementProposal: 'Anotar movimiento',
  rainCorrection: 'Corregir lluvia',
  movementCorrection: 'Corregir movimiento',
  receipt: 'Anotado',
  question: 'Me falta un dato',
  rejected: 'No se puede',
  notUnderstood: 'No entendí',
  notUnderstoodMessage: 'No te entendí bien. Probá con una de estas:',
  microphoneDenied: 'Sin micrófono',
  microphoneDeniedMessage: 'Necesito permiso para usar el micrófono',
  microphoneDeniedHint: 'Se activa en los ajustes del teléfono',
  audioSaved: 'Sin señal',
  audioSavedMessage: 'Guardé tu audio',
  audioSavedHint: 'Lo anoto cuando vuelva la señal',
  serviceBusy: 'Servicio saturado',
  serviceBusyHint: 'Lo envío enseguida',
  saved: 'Grabado sin señal',
  savedNotUnderstood: 'No se entendió lo que grabaste',
  millimetersUnit: 'mm',
  heads: 'cabezas',
  note: 'Anotar',
  cancel: 'Cancelar',
  discard: 'Descartar',
  openSettings: 'Abrir ajustes',
  lot: (lot: number) => `Lote ${lot}`,
  previously: (value: string) => `Antes decía ${value}`,
  remainingInOrigin: (lot: number) => `Quedan en el lote ${lot}`,
  savedOn: (day: string) => `Grabado el ${day}`,
  // Una sola tarjeta de audio guardado a la vez: la más vieja, con su lugar en la cola.
  savedPosition: (total: number) => (total === 1 ? '' : ` · 1 de ${total}`),
  rainTitle: (period: string) => `Lluvia de ${period}`,
} as const;

// Sin red, el audio espera la señal. Si el server falla o tarda, hay señal pero el servicio está
// saturado: el audio se manda en el próximo reintento.
export const SAVED_REPLY: Record<InterpreterErrorCode, string> = {
  [InterpreterErrorCode.Offline]: SPOKEN.audioSaved,
  [InterpreterErrorCode.Timeout]: SPOKEN.serviceBusy,
  [InterpreterErrorCode.Server]: SPOKEN.serviceBusy,
  [InterpreterErrorCode.Refused]: SPOKEN.audioSaved,
  [InterpreterErrorCode.Unreadable]: SPOKEN.audioSaved,
};

const NO_SIGNAL = { label: CARD_TEXT.audioSaved, hint: CARD_TEXT.audioSavedHint };
const BUSY = { label: CARD_TEXT.serviceBusy, hint: CARD_TEXT.serviceBusyHint };

export const SAVED_CARD: Record<InterpreterErrorCode, { label: string; hint: string }> = {
  [InterpreterErrorCode.Offline]: NO_SIGNAL,
  [InterpreterErrorCode.Timeout]: BUSY,
  [InterpreterErrorCode.Server]: BUSY,
  [InterpreterErrorCode.Refused]: NO_SIGNAL,
  [InterpreterErrorCode.Unreadable]: NO_SIGNAL,
};
