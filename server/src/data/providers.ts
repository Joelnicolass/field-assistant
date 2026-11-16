// Los valores que anotó el research (I2 e I3). El modelo y la voz se pueden cambiar desde .env.
export const GEMINI = {
  model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
} as const;

export const ELEVENLABS = {
  model: 'eleven_flash_v2_5',
  voiceId: process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
  outputFormat: 'mp3_44100_128',
  language: 'es',
  endpoint: 'https://api.elevenlabs.io/v1/text-to-speech',
} as const;

/** La app espera 8 segundos: el server corta antes para poder contestar un 502. */
export const PROVIDER_TIMEOUT_MS = 7000;
