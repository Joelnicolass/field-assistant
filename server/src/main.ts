import { ElevenLabsSpeechSynthesizer } from './data/ElevenLabsSpeechSynthesizer.ts';
import { GeminiAudioInterpreter } from './data/GeminiAudioInterpreter.ts';
import { createApp } from './http/createApp.ts';

const DEFAULT_PORT = 8787;
const port = Number(process.env.PORT) || DEFAULT_PORT;

const appKey = process.env.APP_KEY ?? '';
// Publicado, el server no arranca sin la clave: quedaría abierto y gastaría las cuotas de los
// proveedores. En la máquina de desarrollo se puede correr sin ella.
if (appKey === '' && process.env.NODE_ENV === 'production') {
  console.error('Falta APP_KEY: el server publicado no arranca sin la clave de la app.');
  process.exit(1);
}

const app = createApp({
  appKey,
  interpreter: new GeminiAudioInterpreter(process.env.GEMINI_API_KEY ?? ''),
  synthesizer: new ElevenLabsSpeechSynthesizer(process.env.ELEVENLABS_API_KEY ?? ''),
});

app.listen(port, () => {
  console.log(`Server escuchando en el puerto ${port}`);
});
