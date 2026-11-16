import { writeFile } from 'node:fs/promises';

const MODEL = 'eleven_flash_v2_5';
const OUTPUT_FORMAT = 'mp3_44100_128';
const PRICE_PER_THOUSAND_CHARACTERS = 0.05;
const PHRASE = process.argv[2] || 'Anotado. Van dieciocho milímetros.';
const OUTPUT = new URL('./samples/speak.mp3', import.meta.url);

const voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

const startedAt = performance.now();
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${OUTPUT_FORMAT}`,
  {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
    },
    body: JSON.stringify({ text: PHRASE, model_id: MODEL, language_code: 'es' }),
  },
);
const millis = Math.round(performance.now() - startedAt);

if (!response.ok) {
  console.log(`Error ${response.status}: ${await response.text()}`);
  process.exit(1);
}

const audio = Buffer.from(await response.arrayBuffer());
await writeFile(OUTPUT, audio);
const cost = (PHRASE.length / 1000) * PRICE_PER_THOUSAND_CHARACTERS;
console.log(`Modelo: ${MODEL} · voz: ${voiceId}`);
console.log(`"${PHRASE}" · ${PHRASE.length} caracteres · ${millis} ms · ${audio.length} bytes`);
console.log(`US$ ${(cost * 1000).toFixed(2)} cada mil respuestas como esta`);
