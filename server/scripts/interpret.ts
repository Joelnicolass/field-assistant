import { readFile } from 'node:fs/promises';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const PRICE_PER_MILLION = { input: 0.3, output: 2.5 } as const;
const SAMPLES_DIR = new URL('./samples/', import.meta.url);

const INSTRUCTIONS = [
  'Sos el asistente de un productor ganadero argentino. Escuchá el audio y devolvé qué pidió.',
  'intent: register_rain (anotar lluvia), move_animals (mover animales entre lotes),',
  'query_rain, query_lot o unknown si no es un pedido válido.',
  'transcript: lo que dijo, tal cual. Los números, con cifras.',
  'Completá solo los datos que dijo. En missing, los datos que hacen falta y no dijo.',
  'Para register_rain hacen falta millimeters y day. Para move_animals, quantity, category,',
  'fromLot y toLot. day es today, yesterday o una fecha; "anoche" es yesterday.',
  'Si un dato no se dijo, va en null. No inventes datos.',
].join(' ');

const nullable = (type: string) => ({ type, nullable: true });

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    intent: {
      type: 'STRING',
      enum: ['register_rain', 'move_animals', 'query_rain', 'query_lot', 'unknown'],
    },
    transcript: { type: 'STRING' },
    millimeters: nullable('NUMBER'),
    day: nullable('STRING'),
    quantity: nullable('INTEGER'),
    category: nullable('STRING'),
    fromLot: nullable('INTEGER'),
    toLot: nullable('INTEGER'),
    missing: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: [
    'intent',
    'transcript',
    'millimeters',
    'day',
    'quantity',
    'category',
    'fromLot',
    'toLot',
    'missing',
  ],
};

const SAMPLES = [
  { file: 'rain.m4a', expected: 'register_rain, 18 mm, yesterday' },
  { file: 'move.m4a', expected: 'move_animals, 40 vaquillonas, lote 3 → 5' },
  { file: 'missing.m4a', expected: 'move_animals, 15 terneros, faltan los lotes' },
] as const;

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  error?: { status?: string; message?: string };
};

function costPerThousand(inputTokens: number, outputTokens: number): number {
  const perRequest =
    (inputTokens * PRICE_PER_MILLION.input + outputTokens * PRICE_PER_MILLION.output) / 1_000_000;
  return perRequest * 1000;
}

async function interpret(file: string): Promise<{ body: GeminiResponse; millis: number }> {
  const audio = await readFile(new URL(file, SAMPLES_DIR));
  const startedAt = performance.now();
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY ?? '',
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: INSTRUCTIONS }] },
      contents: [
        {
          role: 'user',
          parts: [{ inlineData: { mimeType: 'audio/mp4', data: audio.toString('base64') } }],
        },
      ],
      generationConfig: { responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA },
    }),
  });
  const body: GeminiResponse = await response.json();
  return { body, millis: Math.round(performance.now() - startedAt) };
}

console.log(`Modelo: ${MODEL}`);
for (const sample of SAMPLES) {
  const { body, millis } = await interpret(sample.file);
  const text = body.candidates?.[0]?.content?.parts?.[0]?.text ?? JSON.stringify(body.error);
  const inputTokens = body.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens = body.usageMetadata?.candidatesTokenCount ?? 0;
  console.log(`\n${sample.file} (se espera: ${sample.expected})`);
  console.log(`  ${millis} ms · ${inputTokens} tokens de entrada · ${outputTokens} de salida`);
  console.log(`  US$ ${costPerThousand(inputTokens, outputTokens).toFixed(2)} cada mil pedidos`);
  console.log(`  ${text}`);
}
