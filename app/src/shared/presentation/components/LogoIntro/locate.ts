import type { LogoPiece } from './pieces';

/** Dónde está una parcela respecto del centro del orbe: en x e y, y como distancia y ángulo. */
export function locate(piece: LogoPiece, size: number) {
  const dx = (piece.x + piece.width / 2 - 0.5) * size;
  const dy = (piece.y + piece.height / 2 - 0.5) * size;
  return { dx, dy, radius: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) };
}
