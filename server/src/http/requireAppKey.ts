import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

import { sendError } from './respond.ts';

function sameKey(received: string, expected: string): boolean {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  // Comparar en tiempo constante evita adivinar la clave midiendo cuánto tarda la respuesta.
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Deja pasar solo los pedidos que traen X-App-Key igual a la clave de la app. Sin clave
 * configurada (en la máquina de desarrollo) no se exige.
 */
export function requireAppKey(appKey: string) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (appKey === '' || sameKey(request.get('x-app-key') ?? '', appKey)) {
      next();
      return;
    }
    sendError(response, 401, 'Falta la clave de la app o no es válida');
  };
}
