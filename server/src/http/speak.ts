import express, { Router } from 'express';

import { ProviderError } from '../domain/ProviderError.ts';
import type { SpeechSynthesizer } from '../domain/SpeechSynthesizer.ts';
import { logRequest, sendError } from './respond.ts';

const ROUTE = '/speak';
const MAX_TEXT = 300;

function readText(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const { text } = body as { text?: unknown };
  return typeof text === 'string' && text.trim().length > 0 && text.length <= MAX_TEXT
    ? text
    : null;
}

export function speakRouter(synthesizer: SpeechSynthesizer): Router {
  const router = Router();

  router.post(ROUTE, express.json(), async (request, response) => {
    const startedAt = performance.now();
    const text = readText(request.body);
    if (text === null) {
      sendError(response, 400, `Hace falta un text de 1 a ${MAX_TEXT} caracteres`);
      return;
    }
    const elapsed = () => Math.round(performance.now() - startedAt);
    try {
      const audio = await synthesizer.synthesize(text);
      response.type('audio/mpeg').send(audio);
      logRequest({
        route: ROUTE,
        status: 200,
        bytes: audio.length,
        ms: elapsed(),
      });
    } catch (error) {
      if (!(error instanceof ProviderError)) {
        throw error;
      }
      sendError(response, 502, 'El proveedor no pudo generar la voz');
      logRequest({
        route: ROUTE,
        status: 502,
        bytes: 0,
        ms: elapsed(),
        reason: error.message,
      });
    }
  });

  return router;
}
