export type VoiceOption = { identifier: string; language: string };

// De más a menos parecida a como se habla en Argentina. El teléfono del research solo trae es-US
// y es-ES (I4).
const REGIONS = ['es-ar', 'es-us', 'es-mx', 'es-419', 'es-es'];
const NETWORK_SUFFIX = '-network';

function rank({ identifier, language }: VoiceOption): number {
  const region = REGIONS.indexOf(language.toLowerCase());
  const byRegion = region === -1 ? REGIONS.length : region;
  // A igual región, antes la instalada en el teléfono que la que pide red.
  return byRegion * 2 + (identifier.endsWith(NETWORK_SUFFIX) ? 1 : 0);
}

/** Elige una voz en español de la lista; null si no hay ninguna. */
export function spanishVoice(voices: VoiceOption[]): string | null {
  const spanish = voices.filter((voice) => voice.language.toLowerCase().startsWith('es'));
  const [best] = spanish.sort((first, second) => rank(first) - rank(second));
  return best?.identifier ?? null;
}
