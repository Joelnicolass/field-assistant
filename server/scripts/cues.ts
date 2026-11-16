// Graba las frases cortas que la app tiene adentro (RFC-005, F27), con la misma voz que el server.
// Se corre una sola vez: `npm run cues`. Los .mp3 se versionan en app/assets/cues/.
// Gasta crédito de la voz: unos 140 caracteres en total.
import { mkdir, writeFile } from 'node:fs/promises';

import { ElevenLabsSpeechSynthesizer } from '../src/data/ElevenLabsSpeechSynthesizer.ts';

// Los mismos textos y nombres que app/src/data/services/cues/constants.ts.
const CUES = [
  { file: 'thinking-1.mp3', text: 'Dame un segundo.' },
  { file: 'thinking-2.mp3', text: 'A ver.' },
  { file: 'thinking-3.mp3', text: 'Ya te digo.' },
  { file: 'thinking-4.mp3', text: 'Dejame ver.' },
  { file: 'thinking-5.mp3', text: 'Un momento.' },
  { file: 'offline-1.mp3', text: 'No tengo señal. Lo guardé y lo anoto cuando vuelva.' },
  { file: 'offline-2.mp3', text: 'Sin señal por ahora. Te lo guardo.' },
];
const OUTPUT = new URL('../../app/assets/cues/', import.meta.url);
// Entre pedido y pedido, para no chocar con el límite del proveedor.
const GAP_MS = 5000;

const synthesizer = new ElevenLabsSpeechSynthesizer(process.env.ELEVENLABS_API_KEY ?? '');
await mkdir(OUTPUT, { recursive: true });

for (const [index, { file, text }] of CUES.entries()) {
  if (index > 0) {
    await new Promise((resolve) => setTimeout(resolve, GAP_MS));
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of await synthesizer.synthesize(text)) {
    chunks.push(chunk);
  }
  const audio = Buffer.concat(chunks);
  await writeFile(new URL(file, OUTPUT), audio);
  console.log(`${file} · "${text}" · ${audio.length} bytes`);
}
