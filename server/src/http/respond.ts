import type { Response } from 'express';

export function sendError(response: Response, status: number, message: string): void {
  response.status(status).json({ error: message });
}

type RequestLog = {
  route: string;
  status: number;
  bytes: number;
  ms: number;
  intent?: string;
  /** Por qué falló el proveedor: su código, sin el audio ni el texto. */
  reason?: string;
};

/** Una línea por pedido: el tamaño, la demora y el pedido entendido. Nunca el audio ni el texto. */
export function logRequest(entry: RequestLog): void {
  console.log(JSON.stringify(entry));
}
