import express, { type NextFunction, type Request, type Response } from 'express';

import type { AudioInterpreter } from '../domain/AudioInterpreter.ts';
import type { SpeechSynthesizer } from '../domain/SpeechSynthesizer.ts';
import { healthRouter } from './health.ts';
import { interpretAudioRouter } from './interpretAudio.ts';
import { sendError } from './respond.ts';
import { speakRouter } from './speak.ts';

type Providers = {
  interpreter: AudioInterpreter;
  synthesizer: SpeechSynthesizer;
};

// Los errores de Express (un cuerpo de más o un JSON roto) traen su código en `status`.
function readStatus(error: unknown): number {
  const { status } = (typeof error === 'object' && error !== null ? error : {}) as {
    status?: unknown;
  };
  return typeof status === 'number' ? status : 500;
}

const MESSAGE_BY_STATUS: Record<number, string> = {
  400: 'El cuerpo del pedido no se puede leer',
  413: 'El audio pasa de 2 MB',
};

export function createApp({ interpreter, synthesizer }: Providers): express.Express {
  const app = express();
  app.use(healthRouter);
  app.use(interpretAudioRouter(interpreter));
  app.use(speakRouter(synthesizer));
  app.use((_request, response) => {
    sendError(response, 404, 'Ruta no encontrada');
  });
  // Express reconoce el manejador de errores por sus cuatro parámetros.
  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    const status = readStatus(error);
    sendError(response, status, MESSAGE_BY_STATUS[status] ?? 'Algo salió mal en el server');
  });
  return app;
}
