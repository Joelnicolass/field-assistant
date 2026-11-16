import { Router } from 'express';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { ProviderError } from '../domain/ProviderError.ts';
import type { SpeechSynthesizer } from '../domain/SpeechSynthesizer.ts';
import { logRequest, sendError } from './respond.ts';

const ROUTE = '/speak';
const MAX_TEXT = 300;

function readText(query: unknown): string | null {
  const { text } = (typeof query === 'object' && query !== null ? query : {}) as {
    text?: unknown;
  };
  return typeof text === 'string' && text.trim().length > 0 && text.length <= MAX_TEXT
    ? text
    : null;
}

export function speakRouter(synthesizer: SpeechSynthesizer): Router {
  const router = Router();

  // GET para que el reproductor de la app lea la URL directo y empiece a sonar con el primer byte.
  router.get(ROUTE, async (request, response) => {
    const startedAt = performance.now();
    const text = readText(request.query);
    if (text === null) {
      sendError(response, 400, `Hace falta un text de 1 a ${MAX_TEXT} caracteres`);
      return;
    }
    const elapsed = () => Math.round(performance.now() - startedAt);
    try {
      const audio = Readable.from(await synthesizer.synthesize(text));
      let bytes = 0;
      audio.on('data', (chunk: Buffer) => (bytes += chunk.length));
      response.type('audio/mpeg');
      await pipeline(audio, response);
      logRequest({ route: ROUTE, status: 200, bytes, ms: elapsed() });
    } catch (error) {
      if (!(error instanceof ProviderError)) {
        throw error;
      }
      sendError(response, 502, 'El proveedor no pudo generar la voz');
      logRequest({ route: ROUTE, status: 502, bytes: 0, ms: elapsed(), reason: error.message });
    }
  });

  return router;
}
