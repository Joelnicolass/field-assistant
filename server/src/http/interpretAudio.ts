import express, { Router } from 'express';

import type { AudioInterpreter } from '../domain/AudioInterpreter.ts';
import { ProviderError } from '../domain/ProviderError.ts';
import { readHistory } from './readHistory.ts';
import { readReferenceDay } from './readReferenceDay.ts';
import { logRequest, sendError } from './respond.ts';

const ROUTE = '/interpret-audio';
export const MAX_AUDIO = '2mb';

export function interpretAudioRouter(interpreter: AudioInterpreter): Router {
  const router = Router();

  router.post(
    ROUTE,
    express.raw({ type: 'audio/*', limit: MAX_AUDIO }),
    async (request, response) => {
      const startedAt = performance.now();
      const audio: unknown = request.body;
      // Con otro Content-Type, express.raw no lee el cuerpo y queda vacío.
      if (!Buffer.isBuffer(audio) || audio.length === 0) {
        sendError(response, 400, 'Hace falta un audio, con Content-Type audio/*');
        return;
      }
      const elapsed = () => Math.round(performance.now() - startedAt);
      try {
        const interpretation = await interpreter.interpret({
          audio,
          mimeType: request.get('content-type') ?? 'audio/mp4',
          history: readHistory(request.get('x-history')),
          referenceDay: readReferenceDay(request.get('x-reference-day')),
        });
        response.json(interpretation);
        logRequest({
          route: ROUTE,
          status: 200,
          bytes: audio.length,
          ms: elapsed(),
          intent: interpretation.intent,
        });
      } catch (error) {
        if (!(error instanceof ProviderError)) {
          throw error;
        }
        sendError(response, 502, 'El proveedor no pudo entender el audio');
        logRequest({
          route: ROUTE,
          status: 502,
          bytes: audio.length,
          ms: elapsed(),
          reason: error.message,
        });
      }
    },
  );

  return router;
}
