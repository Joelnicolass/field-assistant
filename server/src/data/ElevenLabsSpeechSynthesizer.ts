import { ProviderError } from '../domain/ProviderError.ts';
import type { SpeechSynthesizer } from '../domain/SpeechSynthesizer.ts';
import { ELEVENLABS, PROVIDER_TIMEOUT_MS } from './providers.ts';

export class ElevenLabsSpeechSynthesizer implements SpeechSynthesizer {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesize(text: string): Promise<Buffer> {
    const url = `${ELEVENLABS.endpoint}/${ELEVENLABS.voiceId}?output_format=${ELEVENLABS.outputFormat}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      // Sin language_code, un texto como "18 mm" puede leerse en inglés.
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS.model,
        language_code: ELEVENLABS.language,
      }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    }).catch((error: unknown) => {
      throw new ProviderError(`ElevenLabs no respondió: ${String(error)}`);
    });
    if (!response.ok) {
      throw new ProviderError(`ElevenLabs contestó ${response.status}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }
}
