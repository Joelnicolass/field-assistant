export enum ListeningVerdict {
  Continue = 'continue',
  Finish = 'finish',
  Cancel = 'cancel',
}

export type ListeningProgress = {
  elapsedMs: number;
  msSinceVoice: number;
  heardVoice: boolean;
};

export type ListeningLimits = { silenceMs: number; noSpeechMs: number; maxRecordingMs: number };

/** Decide si la escucha sigue, termina (con voz) o se cancela (nadie habló). */
export function listeningVerdict(
  { elapsedMs, msSinceVoice, heardVoice }: ListeningProgress,
  { silenceMs, noSpeechMs, maxRecordingMs }: ListeningLimits,
): ListeningVerdict {
  if (elapsedMs >= maxRecordingMs) {
    return ListeningVerdict.Finish;
  }
  if (!heardVoice) {
    return elapsedMs >= noSpeechMs ? ListeningVerdict.Cancel : ListeningVerdict.Continue;
  }
  return msSinceVoice >= silenceMs ? ListeningVerdict.Finish : ListeningVerdict.Continue;
}
