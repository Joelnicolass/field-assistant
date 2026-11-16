import type { AudioInterpreter, AudioToInterpret } from '../domain/AudioInterpreter.ts';
import type { Interpretation } from '../domain/Interpretation.ts';
import { ProviderError } from '../domain/ProviderError.ts';
import { instructionsFor, RESPONSE_SCHEMA } from './instructions.ts';
import { GEMINI, PROVIDER_TIMEOUT_MS } from './providers.ts';
import { readInterpretation } from './readInterpretation.ts';

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

// Gemini reconoce el AAC de Android como audio/mp4; "audio/m4a" no lo acepta.
const GEMINI_MIME_TYPE: Record<string, string> = {
  'audio/m4a': 'audio/mp4',
  'audio/x-m4a': 'audio/mp4',
};

export class GeminiAudioInterpreter implements AudioInterpreter {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async interpret({
    audio,
    mimeType,
    history,
    referenceDay,
  }: AudioToInterpret): Promise<Interpretation> {
    const response = await fetch(`${GEMINI.endpoint}/${GEMINI.model}:generateContent`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: instructionsFor(referenceDay, history) }],
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: GEMINI_MIME_TYPE[mimeType] ?? mimeType,
                  data: audio.toString('base64'),
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    }).catch((error: unknown) => {
      throw new ProviderError(`Gemini no respondió: ${String(error)}`);
    });
    if (!response.ok) {
      throw new ProviderError(`Gemini contestó ${response.status}`);
    }
    const body = (await response.json()) as GeminiResponse;
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const interpretation = readInterpretation(parseJson(text));
    if (interpretation === null) {
      throw new ProviderError('Gemini devolvió algo que no cumple la forma');
    }
    return interpretation;
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
