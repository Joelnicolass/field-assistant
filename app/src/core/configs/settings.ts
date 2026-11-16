import { RootScreen } from '@/core/configs/RootScreen';

/** Un número de una variable de entorno; si falta, está vacía o no es un número, `fallback`. */
export function readNumber(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export const settings = {
  // El server publicado del challenge. Para desarrollar contra la Mac:
  // EXPO_PUBLIC_SERVER_URL=http://localhost:8787 y `adb reverse tcp:8787 tcp:8787`.
  serverUrl:
    process.env.EXPO_PUBLIC_SERVER_URL || 'https://server-production-b97a938f.up.railway.app',
  /** La clave que el server publicado pide en X-App-Key; en desarrollo puede faltar. */
  appKey: process.env.EXPO_PUBLIC_APP_KEY ?? '',
  rootScreen: process.env.EXPO_PUBLIC_SHOW_CATALOG === '1' ? RootScreen.Catalog : RootScreen.Home,
  speechLevel: readNumber(process.env.EXPO_PUBLIC_SPEECH_LEVEL, 0.65),
  silenceMs: readNumber(process.env.EXPO_PUBLIC_SILENCE_MS, 2500),
  noSpeechMs: readNumber(process.env.EXPO_PUBLIC_NO_SPEECH_MS, 8000),
  maxRecordingMs: readNumber(process.env.EXPO_PUBLIC_MAX_RECORDING_MS, 20000),
  interpretTimeoutMs: readNumber(process.env.EXPO_PUBLIC_INTERPRET_TIMEOUT_MS, 8000),
  speakStartTimeoutMs: readNumber(process.env.EXPO_PUBLIC_SPEAK_START_TIMEOUT_MS, 4000),
  maxSpeakingMs: readNumber(process.env.EXPO_PUBLIC_MAX_SPEAKING_MS, 15000),
  confirmMs: readNumber(process.env.EXPO_PUBLIC_CONFIRM_MS, 4000),
  historyTurns: readNumber(process.env.EXPO_PUBLIC_HISTORY_TURNS, 4),
  retryQueueMs: readNumber(process.env.EXPO_PUBLIC_RETRY_QUEUE_MS, 20000),
  maxQuestionsInARow: readNumber(process.env.EXPO_PUBLIC_MAX_QUESTIONS_IN_A_ROW, 2),
  /** Con valor, la app graba bajando el audio de esta dirección en lugar de abrir el micrófono. */
  scriptedAudioUrl: process.env.EXPO_PUBLIC_SCRIPTED_AUDIO_URL || null,
};
