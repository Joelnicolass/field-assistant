import { ElevenLabsSpeechSynthesizer } from './data/ElevenLabsSpeechSynthesizer.ts';
import { GeminiAudioInterpreter } from './data/GeminiAudioInterpreter.ts';
import { createApp } from './http/createApp.ts';

const DEFAULT_PORT = 8787;
const port = Number(process.env.PORT) || DEFAULT_PORT;

const app = createApp({
  interpreter: new GeminiAudioInterpreter(process.env.GEMINI_API_KEY ?? ''),
  synthesizer: new ElevenLabsSpeechSynthesizer(process.env.ELEVENLABS_API_KEY ?? ''),
});

app.listen(port, () => {
  console.log(`Server escuchando en el puerto ${port}`);
});
