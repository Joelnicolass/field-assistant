import express from 'express';
import { healthRouter } from './healthRouter.ts';

export function createApp(): express.Express {
  const app = express();
  app.use(healthRouter);
  app.use((_request, response) => {
    response.status(404).json({ error: 'Ruta no encontrada' });
  });
  return app;
}
