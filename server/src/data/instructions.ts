import {
  CATEGORIES,
  DAYS,
  INTENTS,
  RANGES,
  type ConversationTurn,
} from '../domain/Interpretation.ts';

const RULES = `Sos el asistente por voz de un productor ganadero argentino. La persona habla en español rioplatense, en el campo, con ruido y con pausas. Escuchá el audio y devolvé qué pidió, con la forma fija de la respuesta.
- transcript: lo que dijo, tal cual, sin corregir ni completar.
- intent: qué pidió.
  - register_rain: avisa que llovió, aunque no diga cuánto. Ejemplos: "Llovieron 18 milímetros anoche", "Llovió hoy".
  - move_animals: avisa que pasó animales de un lote a otro. Ejemplo: "Pasé 40 vaquillonas del lote 3 al 5".
  - rain_query: pregunta cuánto llovió. Ejemplo: "¿Cuánto llovió este mes?". Si afirma que llovió, sin preguntar, es register_rain.
  - lot_query: pregunta por los animales de un lote. Ejemplo: "¿Cuántos animales hay en el lote 5?".
  - correct: corrige lo último que se anotó. Ejemplo: "No, eran 20 milímetros".
  - unknown: pide otra cosa, no hay voz o no se entiende. Ante la duda, usá esta.
Datos obligatorios de cada pedido:
- register_rain: millimeters.
- move_animals: quantity, category, fromLot y toLot.
- rain_query: range.
- lot_query: lot.
- correct: el número nuevo, en millimeters si corrige una lluvia o en quantity si corrige animales.
Si falta alguno, dejalo en null y pedilo en question: una sola pregunta corta, de menos de diez palabras, de vos y en español rioplatense, que pida todo lo que falta. Ejemplos: "¿De qué lote a qué lote?", "¿Cuántos milímetros?". Si no falta nada, o si el intent es unknown, question es null.
Reglas:
- Categorías: cow (vacas), heifer (vaquillonas), calf (terneros), steer (novillos), bull (toros).
- day: today si dijo "hoy"; yesterday si dijo "ayer" o "anoche". date: si dijo una fecha, en AAAA-MM-DD, resuelta contra el día de referencia. Si no dijo el día, los dos van en null.
- range: today, yesterday (también "anoche"), week (los últimos días, la semana) o month (este mes).
- Los números dichos con palabras se devuelven como números. Prestá atención a los que suenan parecido: "quinientos" es 500 y "cincuenta" es 50; "doce" es 12 y "dos" es 2. Entendé el voseo ("mové", "pasá").
- Si un dato no se dijo, va en null. No inventes datos ni completes lo que falta. Cada pedido usa solo sus datos.`;

const HISTORY_RULES = `Usá la conversación para entender el audio de ahora:
- Si lo último que hizo la app fue una pregunta, lo más probable es que el audio la conteste. Devolvé el pedido completo: el mismo intent, con los datos que ya se habían dicho más los de ahora. Un número suelto es el dato que se preguntó.
- Si el audio se apoya en lo anterior ("¿y en el cuatro?", "¿y ayer?"), es el mismo pedido que el turno anterior con ese dato cambiado.
- "No, eran veinte" corrige lo último que la app anotó: intent correct.
- Si habla de otra cosa, es un pedido nuevo: no arrastres datos de antes.
- En transcript va solo lo que dijo en este audio.`;

/** Las instrucciones para el modelo, con el día de referencia y los últimos turnos. */
export function instructionsFor(referenceDay: string, history: ConversationTurn[]): string {
  if (history.length === 0) {
    return `${RULES}\n\nDía de referencia (hoy): ${referenceDay}.`;
  }
  const turns = history
    .map((turn) => `- La persona dijo: "${turn.said}". La app contestó: "${turn.replied}".`)
    .join('\n');
  return `${RULES}\n\nDía de referencia (hoy): ${referenceDay}.\n\nLa conversación hasta ahora, del turno más viejo al más nuevo:\n${turns}\n${HISTORY_RULES}`;
}

const nullable = (type: string, values?: readonly string[]) => ({
  type,
  nullable: true,
  ...(values === undefined ? {} : { enum: [...values] }),
});

// Todos los campos obligatorios y con null permitido: con campos opcionales el modelo inventaba
// datos (research, I2).
export const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    intent: { type: 'STRING', enum: [...INTENTS] },
    transcript: { type: 'STRING' },
    millimeters: nullable('NUMBER'),
    day: nullable('STRING', DAYS),
    date: nullable('STRING'),
    quantity: nullable('INTEGER'),
    category: nullable('STRING', CATEGORIES),
    fromLot: nullable('INTEGER'),
    toLot: nullable('INTEGER'),
    lot: nullable('INTEGER'),
    range: nullable('STRING', RANGES),
    question: nullable('STRING'),
  },
  required: [
    'intent',
    'transcript',
    'millimeters',
    'day',
    'date',
    'quantity',
    'category',
    'fromLot',
    'toLot',
    'lot',
    'range',
    'question',
  ],
} as const;
